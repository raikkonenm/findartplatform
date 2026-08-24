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
//   - Tags default to empty. Deterministic tag inference is unreliable
//     for FindArt's editorial vocabulary, so we don't guess. The
//     operator can add tags manually before publish, or re-ingest in
//     claude mode later.
//   - Description falls back to a plain factual template built from
//     what we did extract — never copies whole paragraphs from source.

import { normalizeCity, normalizeCountry, slugifyEntity } from "./taxonomy";
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
  };

  const warnings: string[] = [];
  const missingFields: string[] = [];

  const ldEvent = findEventEntity(hints.jsonLd);
  const ldLocation = ldEvent ? readEventLocation(ldEvent) : {};

  const title = firstString(
    ldEvent?.name,
    hints.og?.title,
    hints.twitter?.title,
    scrape.title,
  );
  if (!title) throw new Error("Deterministic ingest: no title on the page.");

  const slug = slugifyEntity(title);
  if (!slug) throw new Error("Deterministic ingest: could not derive a slug from the title.");

  const artists = coerceStringArray(
    ldEvent?.performer ?? ldEvent?.performers ?? ldEvent?.artist,
  );
  const curator = firstString(ldEvent?.organizer && (ldEvent.organizer as LdEntity).name);

  const startIso = firstString(ldEvent?.startDate);
  const endIso = firstString(ldEvent?.endDate);
  const startDate = isoToDisplay(startIso);
  const endDate = isoToDisplay(endIso);
  const year = yearFromIso(startIso) ?? yearFromIso(endIso);
  const dates = startDate && endDate ? `${startDate} — ${endDate}` : undefined;

  const venue = firstString(ldLocation.venue);
  const city = normalizeCity(firstString(ldLocation.city));
  const country = normalizeCountry(firstString(ldLocation.country));

  // Deterministic tag inference is intentionally minimal — start empty
  // so we never publish a wrong / hallucinated tag. Operator can add
  // tags before publish, or re-run with mode=claude.
  const tags: NormalizedExhibition["tags"] = [];

  if (artists.length === 0) missingFields.push("artists");
  if (!venue) missingFields.push("venue");
  if (!city) missingFields.push("city");
  if (!country) missingFields.push("country");
  if (!year) missingFields.push("year");

  // Description strategy — no LLM, no verbatim copy:
  //   1. og:description if it exists and is short enough
  //   2. otherwise a factual template built from what we extracted
  const ogDesc = firstString(hints.og?.description, hints.twitter?.description);
  const description = ogDesc && ogDesc.length <= 320
    ? ogDesc
    : buildTemplateDescription({ title, artists, venue, city, country, dates, year });

  if (tags.length === 0) {
    warnings.push("Deterministic mode: tags left empty — add manually or re-ingest with claude mode.");
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
    description,
    tags,
    source: scrape.source,
    sourceUrl: scrape.sourceUrl,
  };

  return { normalized, warnings, missingFields };
}
