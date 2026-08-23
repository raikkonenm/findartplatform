import { exhibitions, type Exhibition } from "@/data/exhibitions";

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

export type EntityKind = "gallery" | "artist" | "curator";

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

// URL builders — kept in one place so the ExhibitionDetail renderer and
// the routes agree on the URL shape.
export function entityHref(kind: EntityKind, name: string): string {
  const slug = slugifyEntity(name);
  return `/${kind}/${slug}`;
}
