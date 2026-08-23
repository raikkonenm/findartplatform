import { collectOpportunityLocationSlugs } from "../src/lib/opportunityLocations";
const map = collectOpportunityLocationSlugs();
console.log(`opportunity location pages: ${map.size}`);
for (const [slug, entry] of map) {
  console.log(`  /${slug}  (${entry.name})  ${entry.opportunities.length}`);
}
