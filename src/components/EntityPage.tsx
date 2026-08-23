import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { MasonryGrid } from "@/components/MasonryGrid";
import {
  collectEntitySlugs,
  type EntityKind,
} from "@/lib/entitySlugs";

const EYEBROW: Record<EntityKind, string> = {
  gallery: "Gallery / Venue",
  artist: "Artist",
  curator: "Curator",
  photographer: "Photographer",
};

export function renderEntityPage({
  kind,
  slug,
}: {
  kind: EntityKind;
  slug: string;
}) {
  const entry = collectEntitySlugs(kind).get(slug);
  if (!entry) return notFound();

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
            {entry.exhibitions.length}{" "}
            {entry.exhibitions.length === 1 ? "exhibition" : "exhibitions"}
          </p>

          <div className="mt-12 md:mt-16">
            <MasonryGrid
              exhibitions={entry.exhibitions}
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
  return Array.from(collectEntitySlugs(kind).keys()).map((slug) => ({ slug }));
}

export function entityMetadata({
  kind,
  slug,
}: {
  kind: EntityKind;
  slug: string;
}) {
  const entry = collectEntitySlugs(kind).get(slug);
  if (!entry) return { title: "Not found" };
  const kindLabel =
    kind === "gallery"
      ? "Gallery / venue"
      : kind === "artist"
        ? "Artist"
        : kind === "curator"
          ? "Curator"
          : "Photographer";
  const count = entry.exhibitions.length;
  const title = `${entry.name} — ${kindLabel} on FindArt`;
  const description = `${count} exhibition${count === 1 ? "" : "s"} on FindArt Platform associated with ${entry.name}.`;
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
