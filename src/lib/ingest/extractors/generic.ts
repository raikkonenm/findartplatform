// Generic HTML extractor. Pulls whatever structured signal is
// available — Open Graph, JSON-LD, article/main text — and lets Claude
// resolve it into a normalized exhibition. We do NOT try to guess the
// title heuristically here; the model does that step with more
// context than a hand-written parser could.

import type { CheerioAPI } from "cheerio";
import { absoluteUrl, filterImageCandidates } from "../fetchPage";
import type { ScrapeResult, ScrapedImage } from "../types";

export function extractGeneric({
  url,
  $,
}: {
  url: string;
  html: string;
  $: CheerioAPI;
}): ScrapeResult {
  const structuredHints: Record<string, unknown> = {};
  const source = new URL(url).hostname.replace(/^www\./, "");

  // --- Open Graph ---
  const og: Record<string, string> = {};
  $('meta[property^="og:"]').each((_, el) => {
    const key = $(el).attr("property");
    const value = $(el).attr("content");
    if (key && value) og[key.slice(3)] = value;
  });
  if (Object.keys(og).length) structuredHints.og = og;

  // --- Twitter card ---
  const twitter: Record<string, string> = {};
  $('meta[name^="twitter:"]').each((_, el) => {
    const key = $(el).attr("name");
    const value = $(el).attr("content");
    if (key && value) twitter[key.slice(8)] = value;
  });
  if (Object.keys(twitter).length) structuredHints.twitter = twitter;

  // --- JSON-LD ---
  const jsonLd: unknown[] = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    const raw = $(el).contents().text();
    if (!raw) return;
    try {
      jsonLd.push(JSON.parse(raw));
    } catch {
      // Non-fatal; some sites serve invalid JSON-LD.
    }
  });
  if (jsonLd.length) structuredHints.jsonLd = jsonLd;

  // --- __NEXT_DATA__ (SPA sites that ship page data in a script tag) ---
  const nextData = $('script#__NEXT_DATA__').text();
  if (nextData) {
    try {
      structuredHints.nextData = JSON.parse(nextData);
    } catch {
      // Ignore.
    }
  }

  // --- Body text — clipped to what a language model can chew. ---
  // Prefer <article> / <main>; fall back to the full body text stripped.
  const container = $("article").first().length
    ? $("article").first()
    : $("main").first().length
      ? $("main").first()
      : $("body");
  container.find("script, style, noscript, svg").remove();
  const rawText = container.text().replace(/\s+/g, " ").trim().slice(0, 15_000);

  // --- Image candidates ---
  const candidates: ScrapedImage[] = [];
  const seenSrcs = new Set<string>();

  // The source's Open Graph image is usually the editorially selected
  // representation of the exhibition. Put it first so the downstream media
  // pipeline can make it the default cover when it passes validation.
  if (og.image) {
    const abs = absoluteUrl(url, og.image);
    if (abs) {
      seenSrcs.add(abs);
      candidates.push({ url: abs, reason: "og:image" });
    }
  }

  container.find("img").each((_, el) => {
    const src =
      $(el).attr("data-lazy-src") ||
      $(el).attr("data-src") ||
      $(el).attr("srcset")?.split(",").pop()?.trim().split(" ")[0] ||
      $(el).attr("src");
    const abs = absoluteUrl(url, src);
    if (!abs || seenSrcs.has(abs)) return;
    seenSrcs.add(abs);
    const width = Number.parseInt($(el).attr("width") ?? "", 10) || undefined;
    const height = Number.parseInt($(el).attr("height") ?? "", 10) || undefined;
    candidates.push({ url: abs, width, height, alt: $(el).attr("alt") ?? undefined });
  });

  return {
    sourceUrl: url,
    source,
    extractor: "generic",
    title: og.title || $("title").first().text().trim() || undefined,
    rawText,
    structuredHints,
    imageCandidates: filterImageCandidates(candidates),
  };
}
