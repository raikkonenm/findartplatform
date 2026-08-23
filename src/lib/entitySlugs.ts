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

// Courtesy / copyright statements identify the source of an image, not a
// photographer entity. They remain visible in exhibition metadata but must
// never create low-quality /photographers/* taxonomy pages.
export function isIndexableEntityValue(kind: EntityKind, value: string): boolean {
  if (kind !== "photographer") return true;
  return !/^(?:all images copyright and courtesy|courtesy of the artist\b)/i.test(value.trim());
}

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
//
// Route segment per entity kind. Plural everywhere (REST-ish), and
// "gallery" maps to "venues" because FindArt lists museums, festivals,
// institutions and independent spaces alongside galleries — VENUE is
// the universal umbrella term.
export const ENTITY_ROUTE_SEGMENT: Record<EntityKind, string> = {
  gallery: "venues",
  artist: "artists",
  curator: "curators",
  photographer: "photographers",
  tag: "topics",
};

export function entityHref(kind: EntityKind, name: string): string {
  const slug = slugifyEntity(name);
  return `/${ENTITY_ROUTE_SEGMENT[kind]}/${slug}`;
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

// Aliases → single canonical name per facet. Prevents authority-splitting
// duplicates (`/cities/seoul` vs `/cities/jung-gu-seoul`, `Ciudad de México`
// vs `Mexico City`, etc.). The exhibition data can keep its more specific
// display value; taxonomy always sees the canonical.
const FACET_CANONICAL_VALUES: Record<ExhibitionFacet, Record<string, string>> = {
  city: {
    "Jung-gu, Seoul": "Seoul",
    "Ciudad de México": "Mexico City",
    "Lisboa": "Lisbon",
    "Berlin-Schöneberg": "Berlin",
    "New York City": "New York",
    "Vilnius District Municipality": "Vilnius",
    "Klaus in Vorarlberg": "Vorarlberg",
    "Cergy / Paris": "Paris",
    "Nurnberg": "Nuremberg",
    "Wroclaw": "Wrocław",
  },
  country: {
    "USA": "United States",
    "US": "United States",
    "U.S.": "United States",
    "U.S.A.": "United States",
    "UK": "United Kingdom",
    "U.K.": "United Kingdom",
    "Great Britain": "United Kingdom",
    "Czechia": "Czech Republic",
    "The Netherlands": "Netherlands",
    "Republic of Korea": "South Korea",
    "Korea": "South Korea",
  },
  year: {},
};

export function canonicalFacetValue(facet: ExhibitionFacet, value: string): string {
  return FACET_CANONICAL_VALUES[facet][value.trim()] ?? value.trim();
}

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
    const rawSource = facetRaw(facet, exhibition)?.trim();
    if (!rawSource) continue;
    const raw = canonicalFacetValue(facet, rawSource);
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

// Facet URL path segments — plural, per the taxonomy standardization.
export const EXHIBITION_FACET_SEGMENT: Record<ExhibitionFacet, string> = {
  city: "cities",
  country: "countries",
  year: "years",
};

export function exhibitionFacetHref(facet: ExhibitionFacet, name: string): string {
  return `/exhibitions/${EXHIBITION_FACET_SEGMENT[facet]}/${slugifyEntity(canonicalFacetValue(facet, name))}`;
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

export function monthSegment(monthIndex: number): string {
  return MONTH_NAMES[monthIndex].toLowerCase();
}

export function monthDisplayName(monthIndex: number, year: number): string {
  return `${MONTH_NAMES[monthIndex]} ${year}`;
}

// Parse the ({year}, {month}) pair from the nested URL segments.
export function parseMonthSegments(year: string, month: string):
  | { monthIndex: number; year: number }
  | undefined {
  const monthIndex = MONTH_NAMES.findIndex((n) => n.toLowerCase() === month.toLowerCase());
  if (monthIndex === -1) return undefined;
  const yearNumber = Number.parseInt(year, 10);
  if (!Number.isFinite(yearNumber)) return undefined;
  return { monthIndex, year: yearNumber };
}

// Legacy flat month slug e.g. "april-2026" — used only by the redirect
// path in /exhibitions/[slug]. New URLs are nested.
export function parseFlatMonthSlug(slug: string):
  | { monthIndex: number; year: number }
  | undefined {
  const match = slug.match(/^([a-z]+)-(\d{4})$/);
  if (!match) return undefined;
  return parseMonthSegments(match[2], match[1]);
}

// Key: `${year}/${monthName-lower}` — matches the nested URL structure
// under /exhibitions/years/[year]/[month]. Only months with ≥ 1
// exhibition on view are emitted; empty months are never pre-generated.
export function collectExhibitionMonthBuckets(): Map<
  string,
  { name: string; exhibitions: Exhibition[]; year: number; monthIndex: number }
> {
  const map = new Map<
    string,
    { name: string; exhibitions: Exhibition[]; year: number; monthIndex: number }
  >();
  for (const exhibition of exhibitions) {
    for (const { year, month } of monthBucketsFor(exhibition)) {
      const key = `${year}/${monthSegment(month)}`;
      const bucket = map.get(key);
      if (bucket) {
        if (!bucket.exhibitions.some((e) => e.slug === exhibition.slug)) {
          bucket.exhibitions.push(exhibition);
        }
      } else {
        map.set(key, {
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

export function getExhibitionMonth(year: number, monthIndex: number) {
  return collectExhibitionMonthBuckets().get(`${year}/${monthSegment(monthIndex)}`);
}

export function exhibitionMonthHref(monthIndex: number, year: number): string {
  return `/exhibitions/years/${year}/${monthSegment(monthIndex)}`;
}
