import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { renderExhibitionListPage } from "@/components/EntityPage";
import {
  collectExhibitionFacetSlugs,
  getExhibitionFacet,
} from "@/lib/entitySlugs";

export function generateStaticParams() {
  return Array.from(collectExhibitionFacetSlugs("year").keys()).map((year) => ({ year }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ year: string }>;
}): Promise<Metadata> {
  const { year } = await params;
  const entry = getExhibitionFacet("year", year);
  if (!entry) return { title: "Not found" };
  const title = `Contemporary Art Exhibitions ${entry.name} | FindArt Platform`;
  const description = `Explore contemporary art exhibitions from ${entry.name} on FindArt Platform.`;
  const canonical = `https://www.findartplatform.com/exhibitions/years/${year}`;
  return {
    title: { absolute: title },
    description,
    alternates: { canonical },
    openGraph: { type: "website", url: canonical, title, description },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function ExhibitionsYearPage({
  params,
}: {
  params: Promise<{ year: string }>;
}) {
  const { year } = await params;
  const entry = getExhibitionFacet("year", year);
  if (!entry) return notFound();
  return renderExhibitionListPage({
    eyebrow: "Year",
    name: `Contemporary Art Exhibitions in ${entry.name}`,
    exhibitions: entry.exhibitions,
  });
}
