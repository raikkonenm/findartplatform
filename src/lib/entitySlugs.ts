import { exhibitions, type Exhibition } from "@/data/exhibitions";
import {
  editorialArtists,
  getEditorialArtistMeta,
  type EditorialArtist,
} from "@/data/editorial";

// Slugify a name/title into a URL-safe segment. Handles diacritics,
// non-ASCII letters and punctuation. Deterministic — two calls with the
// same input always produce the same slug, so URLs stay stable when the
// exhibitions dataset changes.
export function slugifyEntity(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export type EntityKind = "gallery" | "artist" | "curator" | "photographer" | "tag";

// Split a curator string ("A, B and C" / "A, B, C") into individual names.
export function splitCuratorString(value: string): string[] {
  return value
    .split(/,| and |&/i)
    .map((part) => part.trim())
    .filter(Boolean);
}

function collectRaw(kind: EntityKind, exhibition: Exhibition): string[] {
  switch (kind) {
    case "gallery":
      return [exhibition.gallery ?? exhibition.venue ?? ""].filter(Boolean);
    case "artist":
      return exhibition.artists ?? [];
    case "curator":
      return exhibition.curator ? splitCuratorString(exhibition.curator) : [];
    case "photographer":
      return exhibition.photographer ? splitCuratorString(exhibition.photographer) : [];
    case "tag":
      return exhibition.tags ?? [];
  }
}

// Build the full slug → { name, exhibitions } map for one entity kind.
// Called at build time by generateStaticParams and at request time by the
// page component. Everything runs on the pre-loaded exhibitions array so
// there's no network cost.
export function collectEntitySlugs(kind: EntityKind): Map<
  string,
  { name: string; exhibitions: Exhibition[] }
> {
  const map = new Map<string, { name: string; exhibitions: Exhibition[] }>();
  for (const exhibition of exhibitions) {
    for (const raw of collectRaw(kind, exhibition)) {
      const slug = slugifyEntity(raw);
      if (!slug) continue;
      const bucket = map.get(slug);
      if (bucket) {
        // Prefer the longest / most descriptive display form when a slug
        // collides — collisions come from formatting variations of the
        // same underlying name.
        if (raw.length > bucket.name.length) bucket.name = raw;
        if (!bucket.exhibitions.some((e) => e.slug === exhibition.slug)) {
          bucket.exhibitions.push(exhibition);
        }
      } else {
        map.set(slug, { name: raw, exhibitions: [exhibition] });
      }
    }
  }
  return map;
}

export function getEntity(kind: EntityKind, slug: string) {
  return collectEntitySlugs(kind).get(slug);
}

// For "artist" and "tag" pages we also cross-reference editorial content.
// Kept in one place so the routes and the entity component stay in sync.

// Editorial artists whose artistName slugifies to `slug`.
export function editorialArtistsForArtistSlug(slug: string): EditorialArtist[] {
  return editorialArtists.filter((artist) => slugifyEntity(artist.artistName) === slug);
}

// Editorial artists tagged with a semantic tag whose slug matches `slug`.
export function editorialArtistsForTagSlug(slug: string): EditorialArtist[] {
  return editorialArtists.filter((artist) => {
    const meta = getEditorialArtistMeta(artist.slug);
    return meta.tags.some((tag) => slugifyEntity(tag) === slug);
  });
}

// The full slug list for /tag/[slug] merges every exhibition tag AND every
// editorial-artist tag, so tag URLs that only feature editorial content
// still get pre-generated.
export function collectTagSlugs(): Map<
  string,
  { name: string; exhibitions: Exhibition[]; editorialArtists: EditorialArtist[] }
> {
  const base = collectEntitySlugs("tag");
  const merged = new Map<
    string,
    { name: string; exhibitions: Exhibition[]; editorialArtists: EditorialArtist[] }
  >();
  for (const [slug, entry] of base.entries()) {
    merged.set(slug, {
      name: entry.name,
      exhibitions: entry.exhibitions,
      editorialArtists: editorialArtistsForTagSlug(slug),
    });
  }
  // Add tag slugs that only exist in editorial artist metadata.
  for (const artist of editorialArtists) {
    const meta = getEditorialArtistMeta(artist.slug);
    for (const rawTag of meta.tags) {
      const slug = slugifyEntity(rawTag);
      if (!slug) continue;
      if (!merged.has(slug)) {
        merged.set(slug, {
          name: rawTag,
          exhibitions: [],
          editorialArtists: editorialArtistsForTagSlug(slug),
        });
      }
    }
  }
  return merged;
}

// URL builders — kept in one place so the ExhibitionDetail renderer and
// the routes agree on the URL shape.
export function entityHref(kind: EntityKind, name: string): string {
  const slug = slugifyEntity(name);
  return `/${kind}/${slug}`;
}

// --- Exhibition-text author (Exhibition Text field on the detail card) ---

export function collectAuthorSlugs(): Map<
  string,
  { name: string; exhibitions: Exhibition[] }
> {
  const map = new Map<string, { name: string; exhibitions: Exhibition[] }>();
  for (const exhibition of exhibitions) {
    const raw = exhibition.exhibitionText?.trim();
    if (!raw) continue;
    const slug = slugifyEntity(raw);
    if (!slug) continue;
    const bucket = map.get(slug);
    if (bucket) {
      if (raw.length > bucket.name.length) bucket.name = raw;
      if (!bucket.exhibitions.some((e) => e.slug === exhibition.slug)) {
        bucket.exhibitions.push(exhibition);
      }
    } else {
      map.set(slug, { name: raw, exhibitions: [exhibition] });
    }
  }
  return map;
}

export function getAuthorEntry(slug: string) {
  return collectAuthorSlugs().get(slug);
}

export function authorHref(name: string): string {
  return `/author/${slugifyEntity(name)}`;
}

// --- Exhibitions by city / country / year ---

export type ExhibitionFacet = "city" | "country" | "year";

function facetRaw(facet: ExhibitionFacet, exhibition: Exhibition): string | undefined {
  switch (facet) {
    case "city":
      return exhibition.city;
    case "country":
      return exhibition.country;
    case "year":
      return exhibition.year;
  }
}

export function collectExhibitionFacetSlugs(
  facet: ExhibitionFacet,
): Map<string, { name: string; exhibitions: Exhibition[] }> {
  const map = new Map<string, { name: string; exhibitions: Exhibition[] }>();
  for (const exhibition of exhibitions) {
    const raw = facetRaw(facet, exhibition)?.trim();
    if (!raw) continue;
    const slug = slugifyEntity(raw);
    if (!slug) continue;
    const bucket = map.get(slug);
    if (bucket) {
      if (raw.length > bucket.name.length) bucket.name = raw;
      if (!bucket.exhibitions.some((e) => e.slug === exhibition.slug)) {
        bucket.exhibitions.push(exhibition);
      }
    } else {
      map.set(slug, { name: raw, exhibitions: [exhibition] });
    }
  }
  return map;
}

export function getExhibitionFacet(facet: ExhibitionFacet, slug: string) {
  return collectExhibitionFacetSlugs(facet).get(slug);
}

export function exhibitionFacetHref(facet: ExhibitionFacet, name: string): string {
  return `/exhibitions/${facet}/${slugifyEntity(name)}`;
}

// --- Exhibitions by month (year-month bucket) -------------------------
//
// A month page lives at `/exhibitions/<month>-<year>` (e.g. april-2026).
// Slug format is intentionally distinct from any real exhibition slug
// so it can coexist inside the same `/exhibitions/[slug]` route without
// collisions.

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
] as const;

// Parse a human date string. `fallbackYear` fills in the year when the
// string omits one — the dataset sometimes stores start/end as "17 April"
// and "17 May 2026" (year only on the second half), and Date.parse of
// "17 April" without a year defaults to 2001, which would produce
// hundreds of bogus month buckets.
function parseHumanDate(value: string | undefined, fallbackYear?: number): Date | undefined {
  if (!value) return undefined;
  const hasYear = /\b\d{4}\b/.test(value);
  const stamped = hasYear
    ? value
    : fallbackYear !== undefined
      ? `${value} ${fallbackYear}`
      : undefined;
  if (!stamped) return undefined;
  const timestamp = Date.parse(`${stamped} 12:00:00 UTC`);
  return Number.isNaN(timestamp) ? undefined : new Date(timestamp);
}

// The set of {year, monthIndex} buckets an exhibition falls into.
// - startDate + endDate: every month in the inclusive range.
// - startDate only: the start month.
// - neither: nothing (skipped from month index).
function monthBucketsFor(exhibition: Exhibition): Array<{ year: number; month: number }> {
  // Parse endDate first — usually the one with the year in the dataset.
  const end = parseHumanDate(exhibition.endDate);
  const start = parseHumanDate(exhibition.startDate, end?.getUTCFullYear())
    ?? end;
  const finalEnd = end ?? start;
  if (!start || !finalEnd) return [];
  const buckets: Array<{ year: number; month: number }> = [];
  const cursor = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), 1));
  const stop = new Date(Date.UTC(finalEnd.getUTCFullYear(), finalEnd.getUTCMonth(), 1));
  // Safety cap — a well-formed exhibition should never span > 36 months.
  // If parsing produced a runaway range, bail rather than emit hundreds
  // of stale month pages.
  let guard = 48;
  while (cursor.getTime() <= stop.getTime() && guard-- > 0) {
    buckets.push({ year: cursor.getUTCFullYear(), month: cursor.getUTCMonth() });
    cursor.setUTCMonth(cursor.getUTCMonth() + 1);
  }
  return buckets;
}

export function monthSlug(monthIndex: number, year: number): string {
  return `${MONTH_NAMES[monthIndex].toLowerCase()}-${year}`;
}

export function monthDisplayName(monthIndex: number, year: number): string {
  return `${MONTH_NAMES[monthIndex]} ${year}`;
}

// Returns { monthIndex, year } if the slug is a well-formed month slug,
// otherwise undefined. Called by the shared /exhibitions/[slug] route
// to decide whether to render a month page or fall through to the
// exhibition detail page.
export function parseMonthSlug(slug: string): { monthIndex: number; year: number } | undefined {
  const match = slug.match(/^([a-z]+)-(\d{4})$/);
  if (!match) return undefined;
  const monthIndex = MONTH_NAMES.findIndex((n) => n.toLowerCase() === match[1]);
  if (monthIndex === -1) return undefined;
  const year = Number.parseInt(match[2], 10);
  if (!Number.isFinite(year)) return undefined;
  return { monthIndex, year };
}

export function collectExhibitionMonthSlugs(): Map<
  string,
  { name: string; exhibitions: Exhibition[]; year: number; monthIndex: number }
> {
  const map = new Map<
    string,
    { name: string; exhibitions: Exhibition[]; year: number; monthIndex: number }
  >();
  for (const exhibition of exhibitions) {
    for (const { year, month } of monthBucketsFor(exhibition)) {
      const slug = monthSlug(month, year);
      const bucket = map.get(slug);
      if (bucket) {
        if (!bucket.exhibitions.some((e) => e.slug === exhibition.slug)) {
          bucket.exhibitions.push(exhibition);
        }
      } else {
        map.set(slug, {
          name: monthDisplayName(month, year),
          exhibitions: [exhibition],
          year,
          monthIndex: month,
        });
      }
    }
  }
  return map;
}

export function getExhibitionMonth(slug: string) {
  return collectExhibitionMonthSlugs().get(slug);
}

export function exhibitionMonthHref(monthIndex: number, year: number): string {
  return `/exhibitions/${monthSlug(monthIndex, year)}`;
}
