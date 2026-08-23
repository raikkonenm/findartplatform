import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { MasonryGrid } from "@/components/MasonryGrid";
import { editorialArtists, type EditorialArtist } from "@/data/editorial";
import type { Exhibition } from "@/data/exhibitions";
import {
  collectEntitySlugs,
  collectTagSlugs,
  editorialArtistsForArtistSlug,
  slugifyEntity,
  type EntityKind,
} from "@/lib/entitySlugs";

const EYEBROW: Record<EntityKind, string> = {
  gallery: "Gallery / Venue",
  artist: "Artist",
  curator: "Curator",
  photographer: "Photographer",
  tag: "Tag",
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
            {totalCount}{" "}
            {totalCount === 1 ? "entry" : "entries"}
          </p>

          <div className="mt-12 md:mt-16">
            <MasonryGrid
              exhibitions={entry.exhibitions}
              eagerCount={1}
              initialIsMobile={false}
              interleavedArtists={entry.editorialArtists.length > 0 ? entry.editorialArtists : undefined}
            />
          </div>
        </div>
      </section>
    </main>
  );
}

// Generic "list of exhibitions under a facet slug" page — reused for
// exhibitionText author, city, country and year slugs. Same visual shape
// as renderEntityPage so users get a consistent detail page.
export function renderExhibitionListPage({
  eyebrow,
  name,
  exhibitions,
}: {
  eyebrow: string;
  name: string;
  exhibitions: Exhibition[];
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
            {exhibitions.length === 1 ? "entry" : "entries"}
          </p>

          <div className="mt-12 md:mt-16">
            <MasonryGrid
              exhibitions={exhibitions}
              eagerCount={1}
              initialIsMobile={false}
            />
          </div>
        </div>
      </section>
    </main>
  );
}

export function entityStaticParams(kind: EntityKind) {
  return collectSlugList(kind).map((slug) => ({ slug }));
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
  const kindLabel =
    kind === "gallery"
      ? "Gallery / venue"
      : kind === "artist"
        ? "Artist"
        : kind === "curator"
          ? "Curator"
          : kind === "photographer"
            ? "Photographer"
            : "Tag";
  const total = entry.exhibitions.length + entry.editorialArtists.length;
  const title = `${entry.name} — ${kindLabel} on FindArt`;
  const description = `${total} ${total === 1 ? "entry" : "entries"} on FindArt Platform associated with ${entry.name}.`;
  const canonical = `https://www.findartplatform.com/${kind}/${slug}`;
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
