import { OPPORTUNITIES, type Opportunity } from "@/data/opportunities";
import { slugifyEntity } from "./entitySlugs";

// Split an opportunity's `location` string ("City, Country" or "Worldwide"
// / "Online" etc.) into individual location parts. Multi-country lists
// separated by "/" are also handled.
export function splitLocationString(location: string): string[] {
  return location
    .split(/[/,]/)
    .map((part) => part.trim())
    .filter(Boolean);
}

// Collect all unique location slugs across the opportunities archive.
// Each part of "Tokyo, Japan" contributes its own slug — the same
// opportunity appears on both /opportunities/location/tokyo and
// /opportunities/location/japan.
export function collectOpportunityLocationSlugs(): Map<
  string,
  { name: string; opportunities: Opportunity[] }
> {
  const map = new Map<string, { name: string; opportunities: Opportunity[] }>();
  for (const opportunity of OPPORTUNITIES) {
    for (const raw of splitLocationString(opportunity.location)) {
      const slug = slugifyEntity(raw);
      if (!slug) continue;
      const bucket = map.get(slug);
      if (bucket) {
        if (raw.length > bucket.name.length) bucket.name = raw;
        if (!bucket.opportunities.some((o) => o.slug === opportunity.slug)) {
          bucket.opportunities.push(opportunity);
        }
      } else {
        map.set(slug, { name: raw, opportunities: [opportunity] });
      }
    }
  }
  return map;
}

export function getOpportunityLocation(slug: string) {
  return collectOpportunityLocationSlugs().get(slug);
}

export function opportunityLocationHref(name: string): string {
  return `/opportunities/location/${slugifyEntity(name)}`;
}
