import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { renderExhibitionListPage } from "@/components/EntityPage";
import {
  collectExhibitionFacetSlugs,
  getExhibitionFacet,
} from "@/lib/entitySlugs";

export function generateStaticParams() {
  return Array.from(collectExhibitionFacetSlugs("country").keys()).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const entry = getExhibitionFacet("country", slug);
  if (!entry) return { title: "Not found" };
  const count = entry.exhibitions.length;
  const title = `Exhibitions in ${entry.name} — FindArt`;
  const description = `${count} ${count === 1 ? "exhibition" : "exhibitions"} in ${entry.name} on FindArt Platform.`;
  const canonical = `https://www.findartplatform.com/exhibitions/country/${slug}`;
  return {
    title: { absolute: title },
    description,
    alternates: { canonical },
    openGraph: { type: "website", url: canonical, title, description },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function ExhibitionsCountryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = getExhibitionFacet("country", slug);
  if (!entry) return notFound();
  return renderExhibitionListPage({
    eyebrow: "Country",
    name: entry.name,
    exhibitions: entry.exhibitions,
  });
}
