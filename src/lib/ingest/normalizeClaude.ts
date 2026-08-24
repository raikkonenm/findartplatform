// Anthropic-powered normalizer. Runs only when
// INGEST_NORMALIZATION_MODE=claude — deterministic mode never touches
// this module, so ANTHROPIC_API_KEY is not required for a plain deploy.
//
// Contract: same as normalizeDeterministic — takes a ScrapeResult,
// returns a NormalizationResult with a validated NormalizedExhibition,
// warnings, and a missingFields report.

import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { anthropicApiKey } from "./env";
import { semanticTags } from "@/data/exhibitions";
import {
  coerceTag,
  exhibitionSlug,
  normalizeCity,
  normalizeCountry,
} from "./taxonomy";
import type { NormalizedExhibition, ScrapeResult } from "./types";
import type { NormalizationResult } from "./normalizeResult";

const RawExhibitionSchema = z.object({
  title: z.string().min(1).optional(),
  subtitle: z.string().optional(),
  venue: z.string().optional(),
  gallery: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  year: z.string().optional(),
  dates: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  artists: z.array(z.string()).optional(),
  curator: z.string().optional(),
  photographer: z.string().optional(),
  exhibitionText: z.string().optional(),
  description: z.string().min(1).optional(),
  summary: z.string().optional(),
  tags: z.array(z.string()).default([]),
  confidence: z.number().min(0).max(1).optional(),
});

const SYSTEM_PROMPT = `You are an editorial assistant for FindArt Platform, a contemporary art archive.
You will be given the raw scraped content of an exhibition page (title, body text, structured hints, image list).
Your job is to return a single JSON object matching the target schema exactly.

Hard rules:
- NEVER invent facts. If a field is not clearly stated on the page, leave it undefined / omit it.
- The "description" field MUST be an ORIGINAL, concise editorial summary — no more than ~90 words. Do NOT copy the source description verbatim; paraphrase in FindArt's editorial voice: factual, restrained, no marketing.
- Choose tags ONLY from the provided allowed list. Never invent new tags.
- Preserve accented / non-Latin characters in names and titles exactly as written.
- Do not include credits inside "description". Credits go into their own fields (artists, curator, photographer, venue, sourceUrl).
- Return raw JSON only — no prose, no markdown fences.

Fields:
title (string, omit if the raw source does not clearly identify it)
subtitle (short, optional — e.g. artist name or "Group show")
venue, gallery (both should hold the same clean venue/institution name; leave empty if unclear)
city, country (single names — no combined "City, Country")
year (four-digit or "YYYY-YYYY" if it straddles years)
dates (human display string as it appears on the page)
startDate, endDate (human-readable date strings, e.g. "24 April 2026")
artists (array of clean personal names — no @handles, expand ALL-CAPS)
curator, photographer (comma-separated clean names when multiple)
exhibitionText (name of the person who wrote the exhibition text, if credited)
description (ORIGINAL 60–90 word paragraph in FindArt voice; omit if there is not enough source material)
summary (one sentence, ≤ 25 words)
tags (subset of allowed list)
confidence (0..1 self-report — how sure you are about the required fields)
`;

function buildUserPrompt(scrape: ScrapeResult): string {
  return [
    `Source URL: ${scrape.sourceUrl}`,
    `Source host: ${scrape.source}`,
    `Extractor: ${scrape.extractor}`,
    "",
    `Allowed tags (choose only from this list, case-sensitive):`,
    (semanticTags as readonly string[]).join(", "),
    "",
    scrape.title ? `Page title (raw): ${scrape.title}` : "",
    "",
    "Structured hints (JSON):",
    JSON.stringify(scrape.structuredHints, null, 2).slice(0, 6000),
    "",
    "Body text (may be truncated):",
    scrape.rawText.slice(0, 10_000),
  ]
    .filter(Boolean)
    .join("\n");
}

export async function normalizeWithClaude(scrape: ScrapeResult): Promise<NormalizationResult> {
  const client = new Anthropic({ apiKey: anthropicApiKey() });

  // Haiku is the cost-appropriate default for structured JSON extraction.
  // Override via INGEST_CLAUDE_MODEL if a future experiment needs Sonnet.
  const model = process.env.INGEST_CLAUDE_MODEL?.trim() || "claude-haiku-4-5-20251001";

  const response = await client.messages.create({
    model,
    max_tokens: 1500,
    temperature: 0.2,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: buildUserPrompt(scrape) }],
  });

  const text = response.content
    .map((block) => (block.type === "text" ? block.text : ""))
    .join("")
    .trim();

  const jsonText = text.replace(/^```(?:json)?\n?/i, "").replace(/```$/i, "").trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText);
  } catch (error) {
    throw new Error(`Claude did not return valid JSON: ${(error as Error).message}`);
  }

  const raw = RawExhibitionSchema.parse(parsed);

  const warnings: string[] = [];
  const missingFields: string[] = [];

  const cleanedTags = (raw.tags ?? [])
    .map((tag) => coerceTag(tag))
    .filter((tag): tag is (typeof semanticTags)[number] => Boolean(tag));
  const droppedTagCount = (raw.tags ?? []).length - cleanedTags.length;
  if (droppedTagCount > 0) {
    warnings.push(`${droppedTagCount} tag(s) dropped — not in the allowed vocabulary.`);
  }

  const title = raw.title?.trim();
  const city = normalizeCity(raw.city);
  const country = normalizeCountry(raw.country);

  const venue = raw.venue?.trim() || raw.gallery?.trim() || undefined;
  const gallery = venue;

  const fallbackSlug = exhibitionSlug(new URL(scrape.sourceUrl).pathname, "source");
  const slug = exhibitionSlug(title, `draft-${fallbackSlug}`);

  const artists = (raw.artists ?? [])
    .map((a) => a.trim())
    .filter((a) => a.length > 0);
  if (!title) {
    missingFields.push("title");
    warnings.push("Claude could not confirm a title — manual review required before publishing.");
  }
  if (artists.length === 0) missingFields.push("artists");
  if (!venue) missingFields.push("venue");
  if (!city) missingFields.push("city");
  if (!country) missingFields.push("country");
  if (!raw.year) missingFields.push("year");

  const description = raw.description?.trim() || "No verified description was extracted. Manual review required before publication.";
  if (!raw.description?.trim()) {
    missingFields.push("description");
    warnings.push("Claude could not confirm a description — manual review required before publishing.");
  }
  if (description.length < 40) {
    warnings.push("Description looks unusually short — verify before publish.");
  }
  if (
    description.length > 120 &&
    scrape.rawText.includes(description.slice(0, 120))
  ) {
    warnings.push("Description overlaps with source text — verify before publish.");
  }

  const normalized: NormalizedExhibition = {
    slug,
    title: title || "Untitled draft",
    subtitle: raw.subtitle?.trim() || undefined,
    venue,
    gallery,
    city,
    country,
    year: raw.year?.trim() || undefined,
    dates: raw.dates?.trim() || undefined,
    startDate: raw.startDate?.trim() || undefined,
    endDate: raw.endDate?.trim() || undefined,
    artists: artists.length > 0 ? artists : undefined,
    curator: raw.curator?.trim() || undefined,
    photographer: raw.photographer?.trim() || undefined,
    exhibitionText: raw.exhibitionText?.trim() || undefined,
    description,
    summary: raw.summary?.trim() || undefined,
    tags: cleanedTags,
    source: scrape.source,
    sourceUrl: scrape.sourceUrl,
  };

  return {
    normalized,
    confidence: raw.confidence,
    warnings,
    missingFields,
  };
}
