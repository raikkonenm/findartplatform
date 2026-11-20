import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { renderExhibitionListPage } from "@/components/EntityPage";
import { collectAuthorSlugs, getAuthorEntry } from "@/lib/entitySlugs";
import { editorialSelectionsForContributor } from "@/lib/editorialRelations";

export function generateStaticParams() {
  return Array.from(collectAuthorSlugs().keys()).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const entry = getAuthorEntry(slug);
  if (!entry) return { title: "Not found" };
  const count = entry.exhibitions.length;
  const selections = editorialSelectionsForContributor("author", slug);
  const title = selections.length ? `${entry.name} — Writing & Editorial | FindArt Platform` : `${entry.name} — Exhibition Text on FindArt`;
  const description = selections.length ? `Read Editorial articles and exhibition texts by ${entry.name} on FindArt Platform.` : `${count} ${count === 1 ? "exhibition" : "exhibitions"} on FindArt Platform with exhibition text by ${entry.name}.`;
  const canonical = `https://www.findartplatform.com/author/${slug}`;
  return {
    title: { absolute: title },
    description,
    alternates: { canonical },
    openGraph: { type: "website", url: canonical, title, description },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function AuthorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = getAuthorEntry(slug);
  if (!entry) return notFound();
  const selections = editorialSelectionsForContributor("author", slug);
  return renderExhibitionListPage({
    eyebrow: selections.length ? "Author" : "Exhibition Text",
    name: entry.name,
    exhibitions: entry.exhibitions,
    editorialSelections: selections,
  });
}
