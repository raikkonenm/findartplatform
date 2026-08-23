import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { MasonryGrid } from "@/components/MasonryGrid";
import { editorialArtists, type EditorialArtist } from "@/data/editorial";
import type { Exhibition } from "@/data/exhibitions";
import {
  ENTITY_ROUTE_SEGMENT,
  canonicalFacetValue,
  collectEntitySlugs,
  collectTagSlugs,
  editorialArtistsForArtistSlug,
  entityHref,
  exhibitionFacetHref,
  isIndexableEntityValue,
  slugifyEntity,
  type EntityKind,
} from "@/lib/entitySlugs";

const SITE_URL = "https://www.findartplatform.com";

function FacetLinkIndex(props: {
  facet: { kind: "city" | "country"; displayName: string };
  exhibitions: Exhibition[];
}) {
  void props;
  return null;
}

// Small ALL-CAPS label above the H1. Universal — venues covers galleries
// and any other kind of exhibition space.
const EYEBROW: Record<EntityKind, string> = {
  gallery: "Venue",
  artist: "Artist",
  curator: "Curator",
  photographer: "Photographer",
  tag: "Topic",
};

function resolveEntry(kind: EntityKind, slug: string):
  | { name: string; exhibitions: Exhibition[]; editorialArtists: EditorialArtist[] }
  | undefined {
  if (kind === "tag") {
    return collectTagSlugs().get(slug);
  }
  const base = collectEntitySlugs(kind).get(slug);
  if (!base) {
    // For "artist" the slug may only exist in editorial (no matching
    // exhibition). Fall through and construct a synthetic entry.
    if (kind === "artist") {
      const eds = editorialArtistsForArtistSlug(slug);
      if (eds.length > 0) {
        return { name: eds[0].artistName, exhibitions: [], editorialArtists: eds };
      }
    }
    return undefined;
  }
  // tag is handled by the early return above; here kind ∈ artist/gallery/curator/photographer.
  const eds = kind === "artist" ? editorialArtistsForArtistSlug(slug) : [];
  return { ...base, editorialArtists: eds };
}

function collectSlugList(kind: EntityKind): string[] {
  if (kind === "tag") return Array.from(collectTagSlugs().keys());
  const slugs = new Set(collectEntitySlugs(kind).keys());
  if (kind === "artist") {
    // Include editorial artists whose name has no matching exhibition —
    // they still deserve a page.
    for (const a of editorialArtists) {
      const s = slugifyEntity(a.artistName);
      if (s) slugs.add(s);
    }
  }
  return Array.from(slugs);
}

export function renderEntityPage({
  kind,
  slug,
}: {
  kind: EntityKind;
  slug: string;
}) {
  const entry = resolveEntry(kind, slug);
  if (!entry) return notFound();

  const totalCount = entry.exhibitions.length + entry.editorialArtists.length;
  // Human-friendly "1 exhibition" / "2 exhibitions" label — same
  // wording across every entity kind, per the taxonomy standardization.
  const countLabel = `${totalCount} ${totalCount === 1 ? "exhibition" : "exhibitions"}`;

  return (
    <main className="min-h-screen bg-white pt-[65px] text-neutral-900">
      <Header />
      <section className="px-5 pb-24 pt-14 md:px-8 md:pb-32 md:pt-20 lg:px-12">
        <div className="mx-auto max-w-[1400px]">
          <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-500">
            {EYEBROW[kind]}
          </p>
          <h1 className="editorial-serif mt-3 break-words text-[clamp(1.3rem,3vw,2rem)] uppercase leading-[1.05] tracking-[-0.02em]">
            {entry.name}
          </h1>
          <p className="mt-4 text-[13px] uppercase tracking-[0.24em] text-neutral-500">
            {countLabel}
          </p>

          <div className="mt-12 md:mt-16">
            <MasonryGrid
              exhibitions={entry.exhibitions}
              eagerCount={1}
              initialIsMobile={false}
              interleavedArtists={entry.editorialArtists.length > 0 ? entry.editorialArtists : undefined}
            />
          </div>

          {kind === "tag" && <TopicHubLinks exhibitions={entry.exhibitions} currentSlug={slug} />}
          {(kind === "gallery" || kind === "artist" || kind === "curator" || kind === "photographer") && (
            <VenueHubLinks exhibitions={entry.exhibitions} />
          )}
        </div>
      </section>
    </main>
  );
}

// Below-the-fold text index shown on topic pages: related topics + top
// venues, artists and cities where this topic is being shown. All links
// point at existing canonical taxonomy pages — no new data, just cross-
// references that turn a tag page into a real knowledge hub. Empty
// sections are dropped.
function TopicHubLinks({
  exhibitions,
  currentSlug,
}: {
  exhibitions: Exhibition[];
  currentSlug: string;
}) {
  if (exhibitions.length === 0) return null;

  const relatedTopics = countTop(
    exhibitions.flatMap((ex) => ex.tags ?? []),
    12,
  ).filter(([tag]) => slugifyEntity(tag) !== currentSlug).slice(0, 8);

  const venues = countTop(
    exhibitions
      .map((ex) => ex.gallery ?? ex.venue ?? "")
      .filter((v) => v && isIndexableEntityValue("gallery", v)),
    8,
  );

  const artists = countTop(
    exhibitions.flatMap((ex) => ex.artists ?? []).filter((a) => isIndexableEntityValue("artist", a)),
    10,
  );

  const cities = countTop(
    exhibitions
      .map((ex) => ex.city)
      .filter((c): c is string => Boolean(c))
      .map((c) => canonicalFacetValue("city", c)),
    10,
  );

  return (
    <HubBlock
      groups={[
        relatedTopics.length > 0 && {
          label: "Related topics",
          items: relatedTopics.map(([tag]) => (
            <Link key={tag} href={entityHref("tag", tag)} className={HUB_LINK_CLASS}>
              {tag}
            </Link>
          )),
        },
        artists.length > 0 && {
          label: "Artists working with this topic",
          items: artists.map(([name]) => (
            <Link key={name} href={entityHref("artist", name)} className={HUB_LINK_CLASS}>
              {name}
            </Link>
          )),
        },
        cities.length > 0 && {
          label: "Cities",
          items: cities.map(([city]) => (
            <Link key={city} href={exhibitionFacetHref("city", city)} className={HUB_LINK_CLASS}>
              {city}
            </Link>
          )),
        },
        venues.length > 0 && {
          label: "Venues",
          items: venues.map(([venue]) => (
            <Link key={venue} href={entityHref("gallery", venue)} className={HUB_LINK_CLASS}>
              {venue}
            </Link>
          )),
        },
      ]}
    />
  );
}

// On artist / venue / curator / photographer pages, surface the related
// topics and geographies drawn from that entity's exhibitions.
function VenueHubLinks({ exhibitions }: { exhibitions: Exhibition[] }) {
  if (exhibitions.length === 0) return null;

  const topics = countTop(exhibitions.flatMap((ex) => ex.tags ?? []), 10);
  const cities = countTop(
    exhibitions
      .map((ex) => ex.city)
      .filter((c): c is string => Boolean(c))
      .map((c) => canonicalFacetValue("city", c)),
    8,
  );
  const countries = countTop(
    exhibitions
      .map((ex) => ex.country)
      .filter((c): c is string => Boolean(c))
      .map((c) => canonicalFacetValue("country", c)),
    6,
  );

  return (
    <HubBlock
      groups={[
        topics.length > 0 && {
          label: "Topics",
          items: topics.map(([tag]) => (
            <Link key={tag} href={entityHref("tag", tag)} className={HUB_LINK_CLASS}>
              {tag}
            </Link>
          )),
        },
        cities.length > 0 && {
          label: "Cities",
          items: cities.map(([city]) => (
            <Link key={city} href={exhibitionFacetHref("city", city)} className={HUB_LINK_CLASS}>
              {city}
            </Link>
          )),
        },
        countries.length > 0 && {
          label: "Countries",
          items: countries.map(([c]) => (
            <Link key={c} href={exhibitionFacetHref("country", c)} className={HUB_LINK_CLASS}>
              {c}
            </Link>
          )),
        },
      ]}
    />
  );
}

const HUB_LINK_CLASS =
  "underline decoration-neutral-300 decoration-1 underline-offset-[3px] transition-opacity hover:opacity-60";

function HubBlock({
  groups,
}: {
  groups: Array<false | { label: string; items: React.ReactNode[] }>;
}) {
  const active = groups.filter(
    (g): g is { label: string; items: React.ReactNode[] } => Boolean(g),
  );
  if (active.length === 0) return null;
  return (
    <section className="mt-16 border-t border-neutral-200 pt-10 md:mt-24 md:pt-12">
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        {active.map((group) => (
          <div key={group.label}>
            <p className="text-[10px] uppercase tracking-[0.24em] text-neutral-500">
              {group.label}
            </p>
            <ul className="mt-3 space-y-2 text-[13px] leading-6 text-neutral-800">
              {group.items.map((node, i) => (
                <li key={i}>{node}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

// Count occurrences and return the top-N (name, count) pairs sorted by
// count desc, name asc.
function countTop(values: string[], limit: number): Array<[string, number]> {
  const map = new Map<string, number>();
  for (const value of values) {
    const key = value.trim();
    if (!key) continue;
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return Array.from(map.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit);
}

// Generic "list of exhibitions under a facet slug" page — reused for
// exhibitionText author, city, country, year and month slugs. Same
// visual shape as renderEntityPage so users get a consistent detail
// page. `facet` optionally hooks a small text index of related venues,
// artists and opportunities beneath the grid — used on the city and
// country landing pages where those cross-links are load-bearing SEO.
export function renderExhibitionListPage({
  eyebrow,
  name,
  exhibitions,
  facet,
}: {
  eyebrow: string;
  name: string;
  exhibitions: Exhibition[];
  facet?: { kind: "city" | "country"; displayName: string };
}) {
  return (
    <main className="min-h-screen bg-white pt-[65px] text-neutral-900">
      <Header />
      <section className="px-5 pb-24 pt-14 md:px-8 md:pb-32 md:pt-20 lg:px-12">
        <div className="mx-auto max-w-[1400px]">
          <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-500">
            {eyebrow}
          </p>
          <h1 className="editorial-serif mt-3 break-words text-[clamp(1.3rem,3vw,2rem)] uppercase leading-[1.05] tracking-[-0.02em]">
            {name}
          </h1>
          <p className="mt-4 text-[13px] uppercase tracking-[0.24em] text-neutral-500">
            {exhibitions.length}{" "}
            {exhibitions.length === 1 ? "exhibition" : "exhibitions"}
          </p>

          <div className="mt-12 md:mt-16">
            <MasonryGrid
              exhibitions={exhibitions}
              eagerCount={1}
              initialIsMobile={false}
            />
          </div>

          {facet && (
            <FacetLinkIndex facet={facet} exhibitions={exhibitions} />
          )}
        </div>
      </section>
    </main>
  );
}

export function entityStaticParams(kind: EntityKind) {
  return collectSlugList(kind).map((slug) => ({ slug }));
}

// Role-specific SEO metadata. Titles and descriptions differ per kind
// so search engines don't see near-duplicate pages for people who
// appear in multiple roles (e.g. artist + photographer with the same
// name). Canonical URLs always use the new plural routes.
function metadataForKind(
  kind: EntityKind,
  name: string,
): { title: string; description: string } {
  switch (kind) {
    case "artist":
      return {
        title: `${name} — Exhibitions | FindArt Platform`,
        description: `Explore exhibitions featuring ${name} on FindArt Platform.`,
      };
    case "curator":
      return {
        title: `${name} — Curated Exhibitions | FindArt Platform`,
        description: `Explore exhibitions curated by ${name} on FindArt Platform.`,
      };
    case "photographer":
      return {
        title: `${name} — Exhibition Photography | FindArt Platform`,
        description: `Explore exhibitions photographed by ${name} on FindArt Platform.`,
      };
    case "gallery":
      return {
        title: `${name} — Exhibitions | FindArt Platform`,
        description: `Explore exhibitions at ${name} on FindArt Platform.`,
      };
    case "tag":
      return {
        title: `${name} — Contemporary Art Exhibitions | FindArt Platform`,
        description: `Explore contemporary art exhibitions related to ${name} on FindArt Platform.`,
      };
  }
}

export function entityMetadata({
  kind,
  slug,
}: {
  kind: EntityKind;
  slug: string;
}) {
  const entry = resolveEntry(kind, slug);
  if (!entry) return { title: "Not found" };
  const { title, description } = metadataForKind(kind, entry.name);
  const canonical = `${SITE_URL}/${ENTITY_ROUTE_SEGMENT[kind]}/${slug}`;
  return {
    title: { absolute: title },
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      url: canonical,
      title,
      description,
    },
    twitter: { card: "summary_large_image", title, description },
  };
}
