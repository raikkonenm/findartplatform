import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { OpportunityDetailContent } from "@/components/OpportunityDetailContent";
import { OpportunityTaxonomyPage } from "@/components/OpportunityTaxonomyPage";
import { OPPORTUNITIES } from "@/data/opportunities";
import {
  OPPORTUNITY_SITE_URL,
  allOpportunityTaxonomyEntries,
  getFreeOpportunityEntry,
  getOpportunityTaxonomyEntry,
  opportunityUrl,
  type OpportunityTaxonomyEntry,
  type OpportunityTaxonomyKind,
} from "@/lib/opportunityTaxonomy";

const TAXONOMY_KINDS = new Set<OpportunityTaxonomyKind>([
  "types",
  "topics",
  "regions",
  "countries",
  "cities",
  "for",
]);

type ResolvedRoute =
  | { type: "opportunity"; opportunity: (typeof OPPORTUNITIES)[number] }
  | { type: "taxonomy"; entry: OpportunityTaxonomyEntry };

function resolveRoute(segments: string[]): ResolvedRoute | undefined {
  if (segments.length === 1) {
    if (segments[0] === "free") {
      const entry = getFreeOpportunityEntry();
      return entry ? { type: "taxonomy", entry } : undefined;
    }
    const opportunity = OPPORTUNITIES.find((candidate) => candidate.slug === segments[0]);
    return opportunity ? { type: "opportunity", opportunity } : undefined;
  }

  if (segments.length === 2 && TAXONOMY_KINDS.has(segments[0] as OpportunityTaxonomyKind)) {
    const entry = getOpportunityTaxonomyEntry(
      segments[0] as OpportunityTaxonomyKind,
      segments[1],
    );
    return entry ? { type: "taxonomy", entry } : undefined;
  }

  return undefined;
}

export function generateStaticParams() {
  return [
    ...OPPORTUNITIES.map((opportunity) => ({ segments: [opportunity.slug] })),
    ...allOpportunityTaxonomyEntries().map((entry) => ({
      segments: entry.kind === "free" ? ["free"] : [entry.kind, entry.slug],
    })),
  ];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ segments: string[] }>;
}): Promise<Metadata> {
  const { segments } = await params;
  const resolved = resolveRoute(segments);
  if (!resolved) return { title: "Not found" };

  if (resolved.type === "taxonomy") {
    const canonical = `${OPPORTUNITY_SITE_URL}${resolved.entry.path}`;
    return {
      title: { absolute: resolved.entry.seoTitle },
      description: resolved.entry.description,
      alternates: { canonical },
      openGraph: {
        type: "website",
        url: canonical,
        title: resolved.entry.seoTitle,
        description: resolved.entry.description,
      },
      twitter: {
        card: "summary_large_image",
        title: resolved.entry.seoTitle,
        description: resolved.entry.description,
      },
    };
  }

  const canonical = `${OPPORTUNITY_SITE_URL}${opportunityUrl(resolved.opportunity)}`;
  const title = `${resolved.opportunity.title} | FindArt Platform`;
  const description = resolved.opportunity.intro[0] ?? resolved.opportunity.title;
  return {
    title: { absolute: title },
    description,
    alternates: { canonical },
    openGraph: { type: "article", url: canonical, title, description },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function OpportunityRoutePage({
  params,
}: {
  params: Promise<{ segments: string[] }>;
}) {
  const { segments } = await params;
  const resolved = resolveRoute(segments);
  if (!resolved) return notFound();

  if (resolved.type === "taxonomy") {
    return <OpportunityTaxonomyPage entry={resolved.entry} />;
  }

  return (
    <main className="min-h-screen bg-[var(--background)] pt-[65px] text-[var(--foreground)]">
      <Header />
      <article className="mx-auto max-w-[1120px]">
        <OpportunityDetailContent opportunity={resolved.opportunity} headingLevel="h1" />
      </article>
    </main>
  );
}
