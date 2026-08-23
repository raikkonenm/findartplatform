import type { Opportunity } from "@/data/opportunities";
import {
  collectOpportunityCities,
  collectOpportunityCountries,
} from "@/lib/opportunityTaxonomy";

// Compatibility map for previously published /opportunities/location/[slug]
// URLs. New links use the unambiguous /cities/ and /countries/ routes;
// the legacy route permanently redirects to the canonical entry.
export function collectOpportunityLocationSlugs(): Map<
  string,
  {
    name: string;
    opportunities: Opportunity[];
    canonicalPath: string;
  }
> {
  const entries = new Map<
    string,
    { name: string; opportunities: Opportunity[]; canonicalPath: string }
  >();

  for (const [slug, entry] of collectOpportunityCountries()) {
    entries.set(slug, {
      name: entry.name,
      opportunities: entry.opportunities,
      canonicalPath: entry.path,
    });
  }
  for (const [slug, entry] of collectOpportunityCities()) {
    entries.set(slug, {
      name: entry.name,
      opportunities: entry.opportunities,
      canonicalPath: entry.path,
    });
  }

  return entries;
}

export function getOpportunityLocation(slug: string) {
  return collectOpportunityLocationSlugs().get(slug);
}
