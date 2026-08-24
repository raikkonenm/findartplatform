// Saliva exposes complete exhibition records through its public JSON API.
// Keep this extractor factual: it only maps the API payload to ScrapeResult;
// Claude remains responsible for editorial normalization.

import { filterImageCandidates } from "../fetchPage";
import type { ScrapeResult, ScrapedImage } from "../types";

type SalivaPerson = { name?: unknown; instagram?: unknown };
type SalivaPhoto = { url?: unknown; caption?: unknown };
type SalivaTextBlock = { data?: { text?: unknown } };
type SalivaData = {
  title?: unknown;
  artists?: unknown;
  authors?: unknown;
  curators?: unknown;
  photographers?: unknown;
  photos?: unknown;
  dates?: { start?: unknown; end?: unknown };
  summary?: unknown;
  keywords?: unknown;
  text?: { blocks?: unknown };
  venue?: {
    name?: unknown;
    city?: unknown;
    country?: unknown;
    location?: { city?: unknown; country?: unknown };
  };
};

function cleanString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function personNames(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((person) => cleanString((person as SalivaPerson)?.name))
    .filter((name): name is string => Boolean(name));
}

function editorText(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((block) => cleanString((block as SalivaTextBlock)?.data?.text))
    .filter((text): text is string => Boolean(text));
}

export function extractSaliva({ url, data }: { url: string; data: SalivaData }): ScrapeResult {
  const photos = Array.isArray(data.photos) ? data.photos : [];
  const imageCandidates: ScrapedImage[] = [];
  for (const photo of photos) {
    const entry = photo as SalivaPhoto;
    const imageUrl = cleanString(entry.url);
    if (!imageUrl) continue;
    imageCandidates.push({
      url: imageUrl,
      alt: cleanString(entry.caption),
      reason: "Saliva exhibition photo",
    });
  }

  const blocks = editorText(data.text?.blocks);
  const summary = cleanString(data.summary);
  const rawText = [summary, ...blocks].filter(Boolean).join("\n\n");
  const venue = data.venue ?? {};
  const location = venue.location ?? {};
  const city = cleanString(location.city) ?? cleanString(venue.city);
  const country = cleanString(location.country) ?? cleanString(venue.country);

  return {
    sourceUrl: url,
    source: "saliva.live",
    extractor: "saliva",
    title: cleanString(data.title),
    rawText,
    structuredHints: {
      saliva: {
        title: cleanString(data.title),
        dates: data.dates,
        artists: personNames(data.artists),
        authors: personNames(data.authors),
        curators: personNames(data.curators),
        photographers: personNames(data.photographers),
        venue: cleanString(venue.name),
        city,
        country,
        summary,
        keywords: Array.isArray(data.keywords)
          ? data.keywords.map(cleanString).filter((keyword): keyword is string => Boolean(keyword))
          : [],
      },
    },
    imageCandidates: filterImageCandidates(imageCandidates),
  };
}
