import { OPPORTUNITIES, type Opportunity } from "@/data/opportunities";
import { slugifyEntity } from "@/lib/entitySlugs";

export const OPPORTUNITY_SITE_URL = "https://www.findartplatform.com";
export const OPPORTUNITY_TOPIC_INDEX_MINIMUM = 2;

export type OpportunityTaxonomyKind =
  | "types"
  | "topics"
  | "regions"
  | "countries"
  | "cities"
  | "for";

export type OpportunityTaxonomyEntry = {
  kind: OpportunityTaxonomyKind | "free";
  slug: string;
  name: string;
  eyebrow: string;
  heading: string;
  seoTitle: string;
  description: string;
  path: string;
  opportunities: Opportunity[];
};

type TypeDefinition = {
  slug: string;
  values: string[];
  label: string;
  heading: string;
  seoTitle: string;
  description: string;
};

const TYPE_DEFINITIONS: TypeDefinition[] = [
  {
    slug: "open-call",
    values: ["Open Calls", "Calls for Curators"],
    label: "Open Call",
    heading: "Open Calls for Artists",
    seoTitle: "Art Open Calls | FindArt Platform",
    description:
      "Explore current art open calls and submission opportunities for artists, curators and creative practitioners.",
  },
  {
    slug: "residency",
    values: ["Residencies"],
    label: "Residency",
    heading: "Artist Residencies",
    seoTitle: "Artist Residencies & Opportunities | FindArt Platform",
    description:
      "Explore artist residencies and international residency opportunities on FindArt Platform.",
  },
  {
    slug: "grant",
    values: ["Grants & Stipends"],
    label: "Grant",
    heading: "Art Grants & Funding Opportunities",
    seoTitle: "Art Grants & Funding Opportunities | FindArt Platform",
    description:
      "Explore current art grants, stipends and funding opportunities for artists and creative practitioners.",
  },
  {
    slug: "prize",
    values: ["Awards & Prizes"],
    label: "Award",
    heading: "Art Prizes & Awards",
    seoTitle: "Art Prizes & Awards | FindArt Platform",
    description:
      "Explore current art prizes, awards and competitions for artists and creative practitioners.",
  },
  {
    slug: "commission",
    values: ["Commissions"],
    label: "Commission",
    heading: "Art Commissions",
    seoTitle: "Art Commissions & Opportunities | FindArt Platform",
    description:
      "Explore current art commissions and funded opportunities for artists and creative practitioners.",
  },
  {
    slug: "education",
    values: ["Education"],
    label: "Education",
    heading: "Art Education Opportunities",
    seoTitle: "Art Education Opportunities | FindArt Platform",
    description:
      "Explore current art education, training and professional development opportunities.",
  },
  {
    slug: "job",
    values: ["Jobs"],
    label: "Job",
    heading: "Art Jobs & Opportunities",
    seoTitle: "Art Jobs & Opportunities | FindArt Platform",
    description:
      "Explore current jobs and professional opportunities in contemporary art.",
  },
  {
    slug: "collaboration",
    values: ["Collaborations"],
    label: "Collaboration",
    heading: "Art Collaborations & Opportunities",
    seoTitle: "Art Collaborations & Opportunities | FindArt Platform",
    description:
      "Explore collaborations and participatory opportunities for artists and creative practitioners.",
  },
];

const TYPE_BY_VALUE = new Map(
  TYPE_DEFINITIONS.flatMap((definition) =>
    definition.values.map((value) => [value.toLowerCase(), definition] as const),
  ),
);

const TYPE_TAG_TO_SLUG: Record<string, string> = {
  "OPEN CALL": "open-call",
  RESIDENCY: "residency",
  GRANT: "grant",
  AWARD: "prize",
  PRIZE: "prize",
  COMMISSION: "commission",
  EDUCATION: "education",
};

const REGION_TAG_NAMES = new Map([
  ["ASIA", "Asia"],
  ["EUROPE", "Europe"],
  ["LATIN AMERICA", "Latin America"],
  ["MIDDLE EAST", "Middle East"],
  ["NORTH AMERICA", "North America"],
  ["AFRICA", "Africa"],
  ["OCEANIA", "Oceania"],
]);

const COUNTRY_REGIONS: Record<string, string> = {
  Australia: "Oceania",
  Austria: "Europe",
  Canada: "North America",
  China: "Asia",
  "Czech Republic": "Europe",
  Finland: "Europe",
  France: "Europe",
  Germany: "Europe",
  India: "Asia",
  Italy: "Europe",
  Japan: "Asia",
  Latvia: "Europe",
  Netherlands: "Europe",
  "South Korea": "Asia",
  Spain: "Europe",
  Switzerland: "Europe",
  "United Kingdom": "Europe",
  "United States": "North America",
};

const NON_GEOGRAPHIC_LOCATIONS = new Set([
  "global",
  "international",
  "online",
  "remote",
  "worldwide",
]);

const NON_TOPIC_TAGS = new Set([
  "australia",
  "emerging",
  "funded",
  "hesse",
  "international",
  "london",
  "paris",
  "sicily",
  "uk",
]);

const AUDIENCE_SLUG_OVERRIDES: Record<string, string> = {
  "Individual artists": "artists",
  "Collectives / groups": "collectives",
  Curators: "curators",
  "Organizations & non-profits": "organizations",
  "Emerging / young artists": "emerging-artists",
  "Sound artists": "sound-artists",
  Photographers: "photographers",
  "Performing artists": "performing-artists",
  "Food practitioners": "food-practitioners",
  "Interdisciplinary practitioners": "interdisciplinary-practitioners",
};

const AUDIENCE_DISPLAY_NAMES: Record<string, string> = {
  "Individual artists": "Artists",
  "Collectives / groups": "Artist Collectives",
  Curators: "Curators",
  "Organizations & non-profits": "Arts Organizations",
  "Emerging / young artists": "Emerging Artists",
  "Sound artists": "Sound Artists",
  Photographers: "Photographers",
  "Performing artists": "Performing Artists",
  "Food practitioners": "Food Practitioners",
  "Interdisciplinary practitioners": "Interdisciplinary Practitioners",
};

const TOPIC_HEADING_OVERRIDES: Record<string, string> = {
  performance: "Performance Art Opportunities",
  mentorship: "Mentorship Opportunities for Artists",
  digital: "Digital Art Opportunities",
  climate: "Climate Art Opportunities",
  "community-engaged": "Community-Engaged Art Opportunities",
  photography: "Photography Opportunities",
  "sound-art": "Sound Art Opportunities",
};

const TOPIC_DESCRIPTION_OVERRIDES: Record<string, string> = {
  performance:
    "Explore open calls, residencies and other opportunities related to performance art.",
  mentorship:
    "Explore mentorships, awards and professional development opportunities for artists.",
  digital:
    "Explore open calls, residencies and other opportunities related to digital art and technology.",
  climate:
    "Explore art opportunities engaging with climate, ecology and environmental research.",
  "community-engaged":
    "Explore opportunities for community-engaged art, public programs and social practice.",
};

const TITLE_SMALL_WORDS = new Set([
  "a",
  "an",
  "and",
  "as",
  "at",
  "by",
  "for",
  "in",
  "of",
  "on",
  "or",
  "the",
  "to",
]);

function titleCase(value: string): string {
  const words = value.trim().split(/\s+/);
  return words
    .map((word, index) => {
      const upper = word.toUpperCase();
      const lower = word.toLowerCase();
      if (word !== upper && word !== lower) return word;
      if (
        index > 0 &&
        index < words.length - 1 &&
        TITLE_SMALL_WORDS.has(lower)
      ) {
        return lower;
      }
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(" ");
}

export function opportunityDisplayTitle(title: string): string {
  return titleCase(title.replace(/^open call:\s*/i, ""));
}

const DEADLINE_MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function opportunityDeadlineLabel(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  return `${day} ${DEADLINE_MONTHS[month - 1]} ${year}`;
}

function uniqueOpportunities(opportunities: Opportunity[]): Opportunity[] {
  return opportunities.filter(
    (opportunity, index) =>
      opportunities.findIndex((candidate) => candidate.slug === opportunity.slug) === index,
  );
}

export function opportunityUrl(opportunityOrSlug: Opportunity | string): string {
  const slug =
    typeof opportunityOrSlug === "string" ? opportunityOrSlug : opportunityOrSlug.slug;
  return `/opportunities/${slug}`;
}

export function opportunityTypeUrl(valueOrSlug: string): string {
  const definition = TYPE_BY_VALUE.get(valueOrSlug.toLowerCase());
  return `/opportunities/types/${definition?.slug ?? slugifyEntity(valueOrSlug)}`;
}

export function opportunityTopicUrl(valueOrSlug: string): string {
  return `/opportunities/topics/${slugifyEntity(valueOrSlug)}`;
}

export function opportunityRegionUrl(valueOrSlug: string): string {
  return `/opportunities/regions/${slugifyEntity(valueOrSlug)}`;
}

export function opportunityRegionNameBySlug(slug: string): string | undefined {
  return Array.from(new Set(REGION_TAG_NAMES.values())).find(
    (region) => slugifyEntity(region) === slug,
  );
}

export function opportunityCountryUrl(valueOrSlug: string): string {
  return `/opportunities/countries/${slugifyEntity(valueOrSlug)}`;
}

export function opportunityCityUrl(valueOrSlug: string): string {
  return `/opportunities/cities/${slugifyEntity(valueOrSlug)}`;
}

export function opportunityAudienceUrl(valueOrSlug: string): string {
  const slug = AUDIENCE_SLUG_OVERRIDES[valueOrSlug] ?? slugifyEntity(valueOrSlug);
  return `/opportunities/for/${slug}`;
}

export function opportunityFreeUrl(): string {
  return "/opportunities/free";
}

export function opportunityTypeDefinition(value: string): TypeDefinition | undefined {
  return TYPE_BY_VALUE.get(value.toLowerCase()) ??
    TYPE_DEFINITIONS.find((definition) => definition.slug === value);
}

export function opportunityPrimaryType(opportunity: Opportunity): TypeDefinition | undefined {
  return opportunity.type.map(opportunityTypeDefinition).find(Boolean);
}

export function opportunityPrimaryTypeLabel(opportunity: Opportunity): string {
  return opportunityPrimaryType(opportunity)?.label ?? opportunity.type[0] ?? "";
}

export function parseOpportunityLocation(location: string): {
  city?: string;
  country?: string;
  region?: string;
} {
  const normalized = location.trim();
  if (!normalized) return {};

  const parts = normalized
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  const region = parts
    .map((part) => REGION_TAG_NAMES.get(part.toUpperCase()))
    .find(Boolean);
  if (region) return { region };

  const geographicParts = parts.filter(
    (part) => !NON_GEOGRAPHIC_LOCATIONS.has(part.toLowerCase()),
  );
  if (geographicParts.length === 0) return {};
  if (geographicParts.length === 1) return { country: geographicParts[0] };

  const country = geographicParts[geographicParts.length - 1];
  const city = geographicParts.slice(0, -1).join(", ");
  return { city: city || undefined, country };
}

export function opportunityLocationParts(opportunity: Opportunity): Array<{
  kind: "city" | "country" | "region";
  name: string;
  href: string;
}> {
  const { city, country, region } = parseOpportunityLocation(opportunity.location);
  return [
    ...(city ? [{ kind: "city" as const, name: city, href: opportunityCityUrl(city) }] : []),
    ...(country
      ? [{ kind: "country" as const, name: country, href: opportunityCountryUrl(country) }]
      : []),
    ...(region
      ? [{ kind: "region" as const, name: region, href: opportunityRegionUrl(region) }]
      : []),
  ];
}

export function opportunityRegionNames(opportunity: Opportunity): string[] {
  const names = new Set<string>();
  const { country, region } = parseOpportunityLocation(opportunity.location);
  if (region) names.add(region);
  if (country && COUNTRY_REGIONS[country]) names.add(COUNTRY_REGIONS[country]);
  for (const tag of opportunity.tags) {
    const region = REGION_TAG_NAMES.get(tag.toUpperCase());
    if (region) names.add(region);
  }
  return Array.from(names);
}

function opportunityTopicNames(opportunity: Opportunity): string[] {
  const geography = parseOpportunityLocation(opportunity.location);
  const geographySlugs = new Set(
    [geography.city, geography.country, geography.region]
      .filter(Boolean)
      .map((value) => slugifyEntity(value!)),
  );
  return opportunity.tags.filter((tag) => {
    const upper = tag.toUpperCase();
    const slug = slugifyEntity(tag);
    if (TYPE_TAG_TO_SLUG[upper]) return false;
    if (REGION_TAG_NAMES.has(upper)) return false;
    if (NON_TOPIC_TAGS.has(slug) || geographySlugs.has(slug)) return false;
    return true;
  });
}

function buildEntries(
  valuesForOpportunity: (opportunity: Opportunity) => string[],
): Map<string, { name: string; opportunities: Opportunity[] }> {
  const entries = new Map<string, { name: string; opportunities: Opportunity[] }>();
  for (const opportunity of OPPORTUNITIES) {
    for (const name of valuesForOpportunity(opportunity)) {
      const slug = slugifyEntity(name);
      if (!slug) continue;
      const current = entries.get(slug);
      if (current) {
        current.opportunities = uniqueOpportunities([...current.opportunities, opportunity]);
      } else {
        entries.set(slug, { name, opportunities: [opportunity] });
      }
    }
  }
  return entries;
}

export function collectOpportunityTypes(): Map<string, OpportunityTaxonomyEntry> {
  const entries = new Map<string, OpportunityTaxonomyEntry>();
  for (const definition of TYPE_DEFINITIONS) {
    const opportunities = OPPORTUNITIES.filter((opportunity) =>
      opportunity.type.some(
        (value) => opportunityTypeDefinition(value)?.slug === definition.slug,
      ),
    );
    if (opportunities.length === 0) continue;
    const path = opportunityTypeUrl(definition.slug);
    entries.set(definition.slug, {
      kind: "types",
      slug: definition.slug,
      name: definition.label,
      eyebrow: "Opportunities · Type",
      heading: definition.heading,
      seoTitle: definition.seoTitle,
      description: definition.description,
      path,
      opportunities,
    });
  }
  return entries;
}

export function collectOpportunityTopics(): Map<string, OpportunityTaxonomyEntry> {
  const rawEntries = buildEntries(opportunityTopicNames);
  const entries = new Map<string, OpportunityTaxonomyEntry>();
  for (const [slug, raw] of rawEntries) {
    if (raw.opportunities.length < OPPORTUNITY_TOPIC_INDEX_MINIMUM) continue;
    const readableName = titleCase(raw.name);
    const heading = TOPIC_HEADING_OVERRIDES[slug] ?? `${readableName} Opportunities`;
    const description =
      TOPIC_DESCRIPTION_OVERRIDES[slug] ??
      `Explore open calls, residencies and other art opportunities related to ${readableName.toLowerCase()}.`;
    entries.set(slug, {
      kind: "topics",
      slug,
      name: readableName,
      eyebrow: "Opportunities · Topic",
      heading,
      seoTitle: `${heading} & Open Calls | FindArt Platform`,
      description,
      path: opportunityTopicUrl(slug),
      opportunities: raw.opportunities,
    });
  }
  return entries;
}

export function collectOpportunityRegions(): Map<string, OpportunityTaxonomyEntry> {
  const rawEntries = buildEntries(opportunityRegionNames);
  const entries = new Map<string, OpportunityTaxonomyEntry>();
  for (const [slug, raw] of rawEntries) {
    entries.set(slug, {
      kind: "regions",
      slug,
      name: raw.name,
      eyebrow: "Opportunities · Region",
      heading: `Art Opportunities in ${raw.name}`,
      seoTitle: `Artist Opportunities in ${raw.name} | FindArt Platform`,
      description: `Explore open calls, residencies and other art opportunities in ${raw.name}.`,
      path: opportunityRegionUrl(slug),
      opportunities: raw.opportunities,
    });
  }
  return entries;
}

export function collectOpportunityCountries(): Map<string, OpportunityTaxonomyEntry> {
  const rawEntries = buildEntries((opportunity) => {
    const { country } = parseOpportunityLocation(opportunity.location);
    return country ? [country] : [];
  });
  const entries = new Map<string, OpportunityTaxonomyEntry>();
  for (const [slug, raw] of rawEntries) {
    entries.set(slug, {
      kind: "countries",
      slug,
      name: raw.name,
      eyebrow: "Opportunities · Country",
      heading: `Art Opportunities in ${raw.name}`,
      seoTitle: `Artist Opportunities in ${raw.name} | FindArt Platform`,
      description: `Explore open calls, residencies and other art opportunities in ${raw.name}.`,
      path: opportunityCountryUrl(slug),
      opportunities: raw.opportunities,
    });
  }
  return entries;
}

export function collectOpportunityCities(): Map<string, OpportunityTaxonomyEntry> {
  const rawEntries = buildEntries((opportunity) => {
    const { city } = parseOpportunityLocation(opportunity.location);
    return city ? [city] : [];
  });
  const entries = new Map<string, OpportunityTaxonomyEntry>();
  for (const [slug, raw] of rawEntries) {
    entries.set(slug, {
      kind: "cities",
      slug,
      name: raw.name,
      eyebrow: "Opportunities · City",
      heading: `Art Opportunities in ${raw.name}`,
      seoTitle: `Artist Opportunities in ${raw.name} | FindArt Platform`,
      description: `Explore open calls, residencies and other art opportunities in ${raw.name}.`,
      path: opportunityCityUrl(slug),
      opportunities: raw.opportunities,
    });
  }
  return entries;
}

export function collectOpportunityAudiences(): Map<string, OpportunityTaxonomyEntry> {
  const entries = new Map<string, OpportunityTaxonomyEntry>();
  for (const opportunity of OPPORTUNITIES) {
    for (const name of opportunity.audiences) {
      const slug = AUDIENCE_SLUG_OVERRIDES[name] ?? slugifyEntity(name);
      const current = entries.get(slug);
      if (current) {
        current.opportunities = uniqueOpportunities([...current.opportunities, opportunity]);
      } else {
        const readableName = AUDIENCE_DISPLAY_NAMES[name] ?? name;
        entries.set(slug, {
          kind: "for",
          slug,
          name: readableName,
          eyebrow: "Opportunities · For",
          heading: `Art Opportunities for ${readableName}`,
          seoTitle: `Art Opportunities for ${readableName} | FindArt Platform`,
          description: `Explore open calls, residencies and other art opportunities for ${readableName.toLowerCase()}.`,
          path: opportunityAudienceUrl(name),
          opportunities: [opportunity],
        });
      }
    }
  }
  return entries;
}

export function getFreeOpportunityEntry(): OpportunityTaxonomyEntry | undefined {
  const opportunities = OPPORTUNITIES.filter(
    (opportunity) => opportunity.applicationFee.trim().toUpperCase() === "FREE",
  );
  if (opportunities.length === 0) return undefined;
  return {
    kind: "free",
    slug: "free",
    name: "Free",
    eyebrow: "Opportunities · Application Fee",
    heading: "Free Art Opportunities & Open Calls",
    seoTitle: "Free Art Opportunities & Open Calls | FindArt Platform",
    description:
      "Explore free-to-apply art opportunities, open calls and artist residencies on FindArt Platform.",
    path: opportunityFreeUrl(),
    opportunities,
  };
}

export function collectOpportunityTaxonomy(
  kind: OpportunityTaxonomyKind,
): Map<string, OpportunityTaxonomyEntry> {
  switch (kind) {
    case "types":
      return collectOpportunityTypes();
    case "topics":
      return collectOpportunityTopics();
    case "regions":
      return collectOpportunityRegions();
    case "countries":
      return collectOpportunityCountries();
    case "cities":
      return collectOpportunityCities();
    case "for":
      return collectOpportunityAudiences();
  }
}

export function getOpportunityTaxonomyEntry(
  kind: OpportunityTaxonomyKind,
  slug: string,
): OpportunityTaxonomyEntry | undefined {
  return collectOpportunityTaxonomy(kind).get(slug);
}

export function opportunityTagUrl(
  opportunity: Opportunity,
  tag: string,
): string | undefined {
  const upper = tag.toUpperCase();
  const typeSlug = TYPE_TAG_TO_SLUG[upper];
  if (
    typeSlug &&
    opportunity.type.some((value) => opportunityTypeDefinition(value)?.slug === typeSlug)
  ) {
    return opportunityTypeUrl(typeSlug);
  }

  const regionName = REGION_TAG_NAMES.get(upper);
  if (regionName) return opportunityRegionUrl(regionName);

  const { city, country } = parseOpportunityLocation(opportunity.location);
  if (city && slugifyEntity(city) === slugifyEntity(tag)) return opportunityCityUrl(city);
  if (country && slugifyEntity(country) === slugifyEntity(tag)) {
    return opportunityCountryUrl(country);
  }
  if (upper === "UK") return opportunityCountryUrl("United Kingdom");
  if (upper === "AUSTRALIA") return opportunityCountryUrl("Australia");

  const topicSlug = slugifyEntity(tag);
  return collectOpportunityTopics().has(topicSlug)
    ? opportunityTopicUrl(topicSlug)
    : undefined;
}

export function allOpportunityTaxonomyEntries(): OpportunityTaxonomyEntry[] {
  const freeEntry = getFreeOpportunityEntry();
  return [
    ...collectOpportunityTypes().values(),
    ...collectOpportunityTopics().values(),
    ...collectOpportunityRegions().values(),
    ...collectOpportunityCountries().values(),
    ...collectOpportunityCities().values(),
    ...collectOpportunityAudiences().values(),
    ...(freeEntry ? [freeEntry] : []),
  ];
}
