import { notFound, permanentRedirect } from "next/navigation";
import {
  collectOpportunityLocationSlugs,
  getOpportunityLocation,
} from "@/lib/opportunityLocations";

export function generateStaticParams() {
  return Array.from(collectOpportunityLocationSlugs().keys()).map((slug) => ({ slug }));
}

export default async function OpportunitiesLocationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = getOpportunityLocation(slug);
  if (!entry) return notFound();
  permanentRedirect(entry.canonicalPath);
}
