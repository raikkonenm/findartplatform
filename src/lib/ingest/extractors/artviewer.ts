// ArtViewer has a stable pattern: single-post pages that expose the
// exhibition title, artist, venue, city, and dates in the first few
// paragraphs; installation images sit in a WordPress-style figure
// gallery. Grabbing the structured hints directly makes the Claude
// step trivial and cheap.

import type { CheerioAPI } from "cheerio";
import { absoluteUrl, filterImageCandidates } from "../fetchPage";
import type { ScrapeResult, ScrapedImage } from "../types";

export function extractArtViewer({
  url,
  $,
}: {
  url: string;
  html: string;
  $: CheerioAPI;
}): ScrapeResult {
  // Title — WordPress "the_title" is the H1 inside the article.
  const title =
    $("article h1").first().text().trim() ||
    $("h1").first().text().trim() ||
    $('meta[property="og:title"]').attr("content") ||
    undefined;

  const article = $("article").first().length ? $("article").first() : $("main");
  article.find("script, style, noscript").remove();

  // Body text.
  const rawText = article.text().replace(/\s+/g, " ").trim().slice(0, 15_000);

  // Structured hints — we include the first paragraphs verbatim, they
  // usually carry "Artist at Venue, City · Dates" or a similar header.
  const paragraphs: string[] = [];
  article.find("p").each((_, el) => {
    const text = $(el).text().replace(/\s+/g, " ").trim();
    if (text) paragraphs.push(text);
  });

  const structuredHints: Record<string, unknown> = {
    firstParagraphs: paragraphs.slice(0, 8),
    source: "artviewer.org",
  };

  // OG for completeness — sometimes richer than the article H1.
  const og: Record<string, string> = {};
  $('meta[property^="og:"]').each((_, el) => {
    const key = $(el).attr("property");
    const value = $(el).attr("content");
    if (key && value) og[key.slice(3)] = value;
  });
  structuredHints.og = og;

  // Image candidates: the gallery lives inside .entry-content or the
  // article body. Prefer the linked (full-size) href over the shrunken
  // <img>. Preserve DOM order — it maps to the exhibition sequence.
  const candidates: ScrapedImage[] = [];
  const seen = new Set<string>();
  const scope = $(".entry-content").length ? $(".entry-content") : article;
  scope.find("a > img, img").each((_, el) => {
    const parent = $(el).parent();
    const href = parent.is("a") ? parent.attr("href") : undefined;
    const src =
      $(el).attr("data-lazy-src") ||
      $(el).attr("data-src") ||
      $(el).attr("srcset")?.split(",").pop()?.trim().split(" ")[0] ||
      $(el).attr("src");
    const raw = href && /\.(jpe?g|png|webp)(\?.*)?$/i.test(href) ? href : src;
    const abs = absoluteUrl(url, raw);
    if (!abs || seen.has(abs)) return;
    seen.add(abs);
    const width = Number.parseInt($(el).attr("width") ?? "", 10) || undefined;
    const height = Number.parseInt($(el).attr("height") ?? "", 10) || undefined;
    candidates.push({
      url: abs,
      width,
      height,
      alt: $(el).attr("alt") ?? undefined,
      reason: "artviewer-gallery",
    });
  });

  return {
    sourceUrl: url,
    source: "artviewer.org",
    extractor: "artviewer",
    title,
    rawText,
    structuredHints,
    imageCandidates: filterImageCandidates(candidates),
  };
}
