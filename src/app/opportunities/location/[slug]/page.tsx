import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import {
  collectOpportunityLocationSlugs,
  getOpportunityLocation,
} from "@/lib/opportunityLocations";

export function generateStaticParams() {
  return Array.from(collectOpportunityLocationSlugs().keys()).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const entry = getOpportunityLocation(slug);
  if (!entry) return { title: "Not found" };
  const count = entry.opportunities.length;
  const title = `${entry.name} — Opportunities on FindArt`;
  const description = `${count} open ${count === 1 ? "opportunity" : "opportunities"} in ${entry.name} on FindArt Platform.`;
  const canonical = `https://www.findartplatform.com/opportunities/location/${slug}`;
  return {
    title: { absolute: title },
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      url: canonical,
      title,
      description,
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function OpportunitiesLocationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = getOpportunityLocation(slug);
  if (!entry) return notFound();

  const rows = entry.opportunities;

  return (
    <main className="min-h-screen bg-white pt-[65px] text-neutral-900">
      <Header />
      <section className="px-5 pb-24 pt-14 md:px-8 md:pb-32 md:pt-20 lg:px-12">
        <div className="mx-auto max-w-[1400px]">
          <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-500">
            Opportunities · Location
          </p>
          <h1 className="editorial-serif mt-3 break-words text-[clamp(1.3rem,3vw,2rem)] uppercase leading-[1.05] tracking-[-0.02em]">
            {entry.name}
          </h1>
          <p className="mt-4 text-[13px] uppercase tracking-[0.24em] text-neutral-500">
            {rows.length} {rows.length === 1 ? "opportunity" : "opportunities"}
          </p>

          <div className="mt-10">
            {rows.map((opportunity) => (
              <Link
                key={opportunity.slug}
                href={`/opportunities?opp=${opportunity.slug}`}
                className="grid grid-cols-[1fr_auto] items-start gap-x-5 gap-y-2 border-b border-neutral-200 px-2 py-6 transition-colors duration-200 hover:bg-neutral-50 md:grid-cols-[minmax(0,2.4fr)_110px_110px_minmax(0,1.1fr)_minmax(0,1.3fr)_120px] md:items-center md:gap-x-6 md:px-4"
              >
                <span className="col-span-2 text-[10px] uppercase tracking-[0.22em] text-neutral-500 md:hidden">
                  {opportunity.type[0] ?? ""}
                </span>
                <div className="col-span-2 md:col-span-1">
                  <h3 className="editorial-serif break-words text-[clamp(1.05rem,4vw,1.4rem)] leading-[1.08] tracking-[-0.035em] text-neutral-900 md:text-[clamp(1.15rem,1.9vw,1.75rem)] md:leading-[1.02]">
                    {opportunity.title}
                  </h3>
                  <p className="mt-1 hidden text-[10px] uppercase tracking-[0.16em] text-neutral-500 md:block">
                    {opportunity.organizer}
                  </p>
                </div>
                <span className="hidden text-[13px] text-neutral-700 md:block">{opportunity.type[0] ?? ""}</span>
                <div className="justify-self-end text-right text-[13px] md:justify-self-start md:text-left">
                  {opportunity.deadline}
                </div>
                <span className="hidden text-[13px] leading-snug text-neutral-700 md:block">{opportunity.location}</span>
                <span className="hidden text-[13px] leading-snug text-neutral-500 md:block">{opportunity.audience}</span>
                <span className="hidden text-[11px] uppercase tracking-[0.18em] text-neutral-700 md:block">
                  {opportunity.applicationFee}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
