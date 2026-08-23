import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { renderExhibitionListPage } from "@/components/EntityPage";
import {
  collectExhibitionMonthBuckets,
  getExhibitionMonth,
  parseMonthSegments,
} from "@/lib/entitySlugs";

export function generateStaticParams() {
  return Array.from(collectExhibitionMonthBuckets().keys()).map((key) => {
    const [year, month] = key.split("/");
    return { year, month };
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ year: string; month: string }>;
}): Promise<Metadata> {
  const { year, month } = await params;
  const parsed = parseMonthSegments(year, month);
  if (!parsed) return { title: "Not found" };
  const entry = getExhibitionMonth(parsed.year, parsed.monthIndex);
  if (!entry) return { title: "Not found" };
  const title = `Contemporary Art Exhibitions — ${entry.name} | FindArt Platform`;
  const description = `Explore contemporary art exhibitions on view in ${entry.name} on FindArt Platform.`;
  const canonical = `https://www.findartplatform.com/exhibitions/years/${year}/${month}`;
  return {
    title: { absolute: title },
    description,
    alternates: { canonical },
    openGraph: { type: "website", url: canonical, title, description },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function ExhibitionsMonthPage({
  params,
}: {
  params: Promise<{ year: string; month: string }>;
}) {
  const { year, month } = await params;
  const parsed = parseMonthSegments(year, month);
  if (!parsed) return notFound();
  const entry = getExhibitionMonth(parsed.year, parsed.monthIndex);
  if (!entry) return notFound();
  return renderExhibitionListPage({
    eyebrow: "Month",
    name: `Contemporary Art Exhibitions in ${entry.name}`,
    exhibitions: entry.exhibitions,
  });
}
