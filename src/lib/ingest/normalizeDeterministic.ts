// Deterministic normalizer — no LLM. Pulls facts strictly from
// signals the scraper already collected:
//
//   1. JSON-LD (schema.org ExhibitionEvent / Event / VisualArtwork)
//   2. Open Graph / Twitter meta tags
//   3. Scraped title as a fallback
//   4. The extractor's own structured hints (artviewer firstParagraphs)
//
// Rules:
//   - NEVER invent a value. Missing fields stay missing and land in
//     the missingFields report.
//   - Tags are inferred only when an approved term appears verbatim in the
//     source. Anything uncertain stays empty for manual review.
//   - The original source copy is preserved as the description whenever it
//     is available. This makes text-first Telegram drafts reviewable without
//     requiring an AI rewrite.

import { exhibitionSlug, normalizeCity, normalizeCountry } from "./taxonomy";
import { semanticTags } from "@/data/exhibitions";
import type { NormalizedExhibition, ScrapeResult } from "./types";
import type { NormalizationResult } from "./normalizeResult";

// ---------- helpers ----------

function firstString(...values: Array<unknown>): string | undefined {
  for (const value of values) {
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (trimmed) return trimmed;
    }
  }
  return undefined;
}

function coerceStringArray(value: unknown): string[] {
  if (!value) return [];
  if (typeof value === "string") return [value.trim()].filter(Boolean);
  if (Array.isArray(value)) {
    return value
      .map((item) =>
        typeof item === "string"
          ? item.trim()
          : typeof (item as { name?: unknown }).name === "string"
            ? String((item as { name: string }).name).trim()
            : "",
      )
      .filter((s) => s.length > 0);
  }
  if (typeof value === "object" && value !== null) {
    const asRecord = value as { name?: unknown };
    if (typeof asRecord.name === "string") return [asRecord.name.trim()].filter(Boolean);
  }
  return [];
}

type LdEntity = Record<string, unknown>;

// Walk every @graph entry / bare object and return the first that
// looks like an ExhibitionEvent or Event.
function findEventEntity(jsonLd: unknown): LdEntity | undefined {
  const queue: unknown[] = [];
  if (Array.isArray(jsonLd)) queue.push(...jsonLd);
  else if (jsonLd) queue.push(jsonLd);
  while (queue.length) {
    const item = queue.shift();
    if (!item || typeof item !== "object") continue;
    const entity = item as LdEntity;
    if (Array.isArray(entity["@graph"])) queue.push(...(entity["@graph"] as unknown[]));
    const type = entity["@type"];
    const types = Array.isArray(type) ? type.map(String) : [String(type ?? "")];
    if (types.some((t) => /Event|Exhibition/i.test(t))) return entity;
  }
  return undefined;
}

// Pull venue + location from a JSON-LD Event entity.
function readEventLocation(event: LdEntity): { venue?: string; city?: string; country?: string } {
  const location = event.location;
  if (!location) return {};
  const loc = Array.isArray(location) ? (location[0] as LdEntity) : (location as LdEntity);
  if (!loc || typeof loc !== "object") return {};
  const venue = firstString(loc.name);
  const address = loc.address as LdEntity | string | undefined;
  if (typeof address === "string") {
    // Best-effort split of "City, Country".
    const parts = address.split(",").map((p) => p.trim()).filter(Boolean);
    return {
      venue,
      city: parts[0],
      country: parts[parts.length - 1] !== parts[0] ? parts[parts.length - 1] : undefined,
    };
  }
  if (address && typeof address === "object") {
    return {
      venue,
      city: firstString(address.addressLocality),
      country: firstString(address.addressCountry),
    };
  }
  return { venue };
}

// Extract "24 April" / "24 April 2026" from an ISO-8601 like 2026-04-24T…
function isoToDisplay(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return value;
  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const y = match[1];
  const m = months[Number(match[2]) - 1];
  const d = Number(match[3]);
  return `${d} ${m} ${y}`;
}

function yearFromIso(value: string | undefined): string | undefined {
  const match = value?.match(/^(\d{4})/);
  return match?.[1];
}

type LabeledFields = Record<string, string | undefined>;

const LABEL_ALIASES: Record<string, string> = {
  title: "title",
  "exhibition title": "title",
  artist: "artists",
  artists: "artists",
  "artist(s)": "artists",
  venue: "venue",
  gallery: "venue",
  city: "city",
  country: "country",
  location: "location",
  date: "dates",
  dates: "dates",
  "opening date": "startDate",
  "closing date": "endDate",
  curator: "curator",
  curators: "curator",
  photo: "photographer",
  photographer: "photographer",
  "photo credit": "photographer",
  tags: "tags",
  description: "description",
  "exhibition text": "description",
  "press release": "description",
};

function readLabeledFields(rawText: string): LabeledFields {
  const fields: LabeledFields = {};
  const lines = rawText.split(/\r?\n/);
  for (let index = 0; index < lines.length; index += 1) {
    const match = lines[index].match(/^\s*([^:]{2,40}):\s*(.*?)\s*$/);
    if (!match) continue;
    const key = LABEL_ALIASES[match[1].trim().toLowerCase()];
    if (!key || fields[key]) continue;

    if (match[2]) {
      fields[key] = match[2].trim();
      continue;
    }

    const following: string[] = [];
    for (let next = index + 1; next < lines.length; next += 1) {
      const possibleLabel = lines[next].match(/^\s*([^:]{2,40}):\s*/)?.[1]?.trim().toLowerCase();
      if (possibleLabel && LABEL_ALIASES[possibleLabel]) break;
      if (lines[next].trim()) following.push(lines[next].trim());
    }
    if (following.length === 0) continue;
    fields[key] = key === "description"
      ? following.join("\n\n")
      : key === "artists"
        ? following.join(", ")
        : following[0];
  }
  return fields;
}

function splitNames(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(/\s*(?:\n|\/|;|,|\band\b)\s*/i)
    .map((item) => item.trim())
    .filter(Boolean);
}

function firstHeading(rawText: string): string | undefined {
  for (const line of rawText.split(/\r?\n/)) {
    const candidate = line.trim();
    if (!candidate || candidate.includes(":") || candidate.length > 110) continue;
    if (/^[A-Z0-9À-ÖØ-Ý][A-Z0-9À-ÖØ-Ý\s'’!?.,()\-–—]+$/u.test(candidate)) {
      return candidate;
    }
  }
  return undefined;
}

function readLocation(value: string | undefined): { city?: string; country?: string } {
  if (!value) return {};
  const parts = value.split(",").map((part) => part.trim()).filter(Boolean);
  if (parts.length < 2) return { city: parts[0] };
  return { city: parts[0], country: parts[parts.length - 1] };
}

function dateSignals(rawText: string): {
  dates?: string;
  startDate?: string;
  endDate?: string;
  year?: string;
} {
  const normalized = rawText.replace(/\s+/g, " ");
  const month = "(?:January|February|March|April|May|June|July|August|September|October|November|December)";
  const date = `(?:\\d{1,2}\\s+${month}|${month}\\s+\\d{1,2})(?:,?\\s+\\d{4})?`;
  const range = normalized.match(
    new RegExp(`${date}\\s*(?:—|–|-|to|until)\\s*${date}`, "i"),
  );
  const dates = range?.[0]?.trim();
  const tokens = (dates ?? normalized).match(new RegExp(date, "gi")) ?? [];
  const fallbackDate = tokens[0];
  const year = dates?.match(/\b(20\d{2})\b/)?.[1] ?? normalized.match(/\b(20\d{2})\b/)?.[1];
  return {
    dates: dates ?? fallbackDate,
    startDate: tokens[0],
    endDate: dates ? tokens[1] : undefined,
    year,
  };
}

function stripFieldLines(rawText: string): string {
  return rawText
    .split(/\r?\n/)
    .filter((line) => {
      const key = line.match(/^\s*([^:]{2,40}):/)?.[1]?.trim().toLowerCase();
      return !key || !LABEL_ALIASES[key];
    })
    .join("\n")
    .trim();
}

function inferTags(rawText: string, explicitTags?: string): NormalizedExhibition["tags"] {
  const source = `${explicitTags ?? ""}\n${rawText}`;
  const tags: NormalizedExhibition["tags"] = [];
  for (const tag of semanticTags) {
    const pattern = new RegExp(`(^|[^A-Z])${tag.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/ /g, "\\s+")}($|[^A-Z])`, "i");
    if (pattern.test(source)) tags.push(tag);
    if (tags.length === 5) break;
  }
  return tags;
}

// Build a factual, template-style description from whatever we have.
// This is intentionally plain — the goal in deterministic mode is to
// ship SOMETHING valid, not to produce editorial copy.
function buildTemplateDescription(fields: {
  title: string;
  artists?: string[];
  venue?: string;
  city?: string;
  country?: string;
  dates?: string;
  year?: string;
}): string {
  const parts: string[] = [];
  const artistList = fields.artists && fields.artists.length > 0
    ? fields.artists.length > 3
      ? `${fields.artists.slice(0, 3).join(", ")} and others`
      : fields.artists.join(", ")
    : undefined;

  if (artistList && fields.venue) {
    parts.push(`${fields.title} presents work by ${artistList} at ${fields.venue}.`);
  } else if (fields.venue) {
    parts.push(`${fields.title} at ${fields.venue}.`);
  } else if (artistList) {
    parts.push(`${fields.title} presents work by ${artistList}.`);
  } else {
    parts.push(`${fields.title}.`);
  }

  const location = [fields.city, fields.country].filter(Boolean).join(", ");
  if (location && fields.dates) {
    parts.push(`On view ${fields.dates} in ${location}.`);
  } else if (location && fields.year) {
    parts.push(`Presented in ${location} in ${fields.year}.`);
  } else if (fields.dates) {
    parts.push(`On view ${fields.dates}.`);
  } else if (fields.year) {
    parts.push(`Presented in ${fields.year}.`);
  } else if (location) {
    parts.push(`Presented in ${location}.`);
  }

  return parts.join(" ").trim();
}

// ---------- entry point ----------

export function normalizeDeterministically(scrape: ScrapeResult): NormalizationResult {
  const hints = scrape.structuredHints as {
    og?: Record<string, string>;
    twitter?: Record<string, string>;
    jsonLd?: unknown[];
    firstParagraphs?: string[];
    saliva?: {
      title?: string;
      dates?: { start?: unknown; end?: unknown };
      artists?: string[];
      curators?: string[];
      photographers?: string[];
      venue?: string;
      city?: string;
      country?: string;
      keywords?: string[];
    };
  };

  const warnings: string[] = [];
  const missingFields: string[] = [];

  const ldEvent = findEventEntity(hints.jsonLd);
  const ldLocation = ldEvent ? readEventLocation(ldEvent) : {};
  const fields = readLabeledFields(scrape.rawText);
  const rawLocation = readLocation(fields.location);
  const rawDates = dateSignals(fields.dates ?? scrape.rawText);

  const extractedTitle = firstString(
    fields.title,
    hints.saliva?.title,
    ldEvent?.name,
    hints.og?.title,
    hints.twitter?.title,
    scrape.title,
    firstHeading(scrape.rawText),
  );
  const title = extractedTitle ?? "Untitled draft";
  const fallbackSlug = exhibitionSlug(new URL(scrape.sourceUrl).pathname, "source");
  const slug = exhibitionSlug(extractedTitle, `draft-${fallbackSlug}`);

  const artists = [
    ...splitNames(fields.artists),
    ...coerceStringArray(hints.saliva?.artists),
    ...coerceStringArray(ldEvent?.performer ?? ldEvent?.performers ?? ldEvent?.artist),
  ].filter((artist, index, all) => artist && all.indexOf(artist) === index);
  const curator = firstString(
    fields.curator,
    hints.saliva?.curators?.join(", "),
    ldEvent?.organizer && (ldEvent.organizer as LdEntity).name,
  );
  const photographer = firstString(fields.photographer, hints.saliva?.photographers?.join(", "));

  const startIso = firstString(hints.saliva?.dates?.start, ldEvent?.startDate);
  const endIso = firstString(hints.saliva?.dates?.end, ldEvent?.endDate);
  const startDate = firstString(fields.startDate, isoToDisplay(startIso), rawDates.startDate);
  const endDate = firstString(fields.endDate, isoToDisplay(endIso), rawDates.endDate);
  const year = yearFromIso(startIso) ?? yearFromIso(endIso) ?? rawDates.year;
  const dates = firstString(
    fields.dates,
    startDate && endDate ? `${startDate} — ${endDate}` : undefined,
    rawDates.dates,
  );

  const venue = firstString(fields.venue, hints.saliva?.venue, ldLocation.venue);
  const city = normalizeCity(firstString(fields.city, hints.saliva?.city, ldLocation.city, rawLocation.city));
  const country = normalizeCountry(firstString(fields.country, hints.saliva?.country, ldLocation.country, rawLocation.country));

  const tags = inferTags(scrape.rawText, fields.tags ?? hints.saliva?.keywords?.join(" "));

  if (!extractedTitle) {
    missingFields.push("title");
    warnings.push("Deterministic mode: no title found — manual review required before publishing.");
  }
  if (artists.length === 0) missingFields.push("artists");
  if (!venue) missingFields.push("venue");
  if (!city) missingFields.push("city");
  if (!country) missingFields.push("country");
  if (!year) missingFields.push("year");

  // Preserve source copy for a text-first review draft. A compact metadata
  // description or factual template is only used when there is no usable body.
  const ogDesc = firstString(hints.og?.description, hints.twitter?.description);
  const preservedDescription = firstString(fields.description, stripFieldLines(scrape.rawText));
  const description = preservedDescription && preservedDescription.length >= 40
    ? preservedDescription
    : ogDesc ?? buildTemplateDescription({ title, artists, venue, city, country, dates, year });

  if (tags.length === 0) {
    warnings.push("No approved tags were found verbatim — add tags during manual review if needed.");
  }
  if (missingFields.length > 0) {
    warnings.push(`Deterministic mode: ${missingFields.length} field(s) missing (${missingFields.join(", ")}).`);
  }

  const normalized: NormalizedExhibition = {
    slug,
    title,
    subtitle: artists.length === 1 ? artists[0] : undefined,
    venue,
    gallery: venue,
    city,
    country,
    year,
    dates,
    startDate,
    endDate,
    artists: artists.length > 0 ? artists : undefined,
    curator,
    photographer,
    description,
    tags,
    source: scrape.source,
    sourceUrl: scrape.sourceUrl,
  };

  return { normalized, warnings, missingFields };
}
