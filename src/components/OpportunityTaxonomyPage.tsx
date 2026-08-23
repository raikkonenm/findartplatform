import Link from "next/link";
import { Header } from "@/components/Header";
import type { OpportunityTaxonomyEntry } from "@/lib/opportunityTaxonomy";
import {
  opportunityDeadlineLabel,
  opportunityDisplayTitle,
  opportunityLocationParts,
  opportunityPrimaryType,
  opportunityTypeUrl,
  opportunityUrl,
} from "@/lib/opportunityTaxonomy";

const LIST_ROW_COLS =
  "md:grid-cols-[minmax(0,2.4fr)_110px_110px_minmax(0,1.1fr)_minmax(0,1.3fr)_120px]";

export function OpportunityTaxonomyPage({ entry }: { entry: OpportunityTaxonomyEntry }) {
  return (
    <main className="min-h-screen bg-[var(--background)] pt-[65px] text-[var(--foreground)]">
      <Header />
      <section className="px-5 pb-24 pt-14 md:px-8 md:pb-32 md:pt-20 lg:px-12">
        <div className="mx-auto max-w-[1400px]">
          <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-500">
            {entry.eyebrow}
          </p>
          <h1 className="editorial-serif mt-3 max-w-[920px] break-words text-[clamp(1.3rem,3vw,2rem)] uppercase leading-[1.05] tracking-[-0.02em]">
            {entry.heading}
          </h1>
          <p className="mt-4 text-[13px] uppercase tracking-[0.24em] text-neutral-500">
            {entry.opportunities.length}{" "}
            {entry.opportunities.length === 1 ? "OPPORTUNITY" : "OPPORTUNITIES"}
          </p>

          <div className="mt-10">
            <div
              className={`hidden border-y border-neutral-200 bg-neutral-100 px-4 py-3.5 text-[10px] uppercase tracking-[0.18em] text-neutral-500 md:grid ${LIST_ROW_COLS} md:items-center md:gap-x-6`}
            >
              <span>Opportunity</span>
              <span>Type</span>
              <span>Deadline</span>
              <span>Location</span>
              <span>For</span>
              <span>Application Fee</span>
            </div>
            {entry.opportunities.map((opportunity) => {
              const primaryType = opportunityPrimaryType(opportunity);
              const locationParts = opportunityLocationParts(opportunity);
              return (
                <article
                  key={opportunity.slug}
                  className={`group grid grid-cols-[1fr_auto] items-start gap-x-5 gap-y-2 border-b border-neutral-200 px-2 py-6 transition-colors duration-200 hover:bg-neutral-50 ${LIST_ROW_COLS} md:items-center md:gap-x-6 md:px-4`}
                >
                  {primaryType ? (
                    <Link
                      href={opportunityTypeUrl(primaryType.slug)}
                      className="col-span-2 text-[10px] uppercase tracking-[0.22em] text-neutral-500 md:hidden"
                    >
                      {primaryType.label}
                    </Link>
                  ) : (
                    <span className="col-span-2 text-[10px] uppercase tracking-[0.22em] text-neutral-500 md:hidden">
                      {opportunity.type[0] ?? ""}
                    </span>
                  )}
                  <div className="col-span-2 md:col-span-1">
                    <Link href={opportunityUrl(opportunity)}>
                      <h2 className="editorial-serif break-words text-[clamp(1.05rem,4vw,1.4rem)] leading-[1.08] tracking-[-0.035em] text-neutral-900 transition-opacity group-hover:opacity-70 md:text-[clamp(1.15rem,1.9vw,1.75rem)] md:leading-[1.02]">
                        {opportunityDisplayTitle(opportunity.title)}
                      </h2>
                    </Link>
                    <p className="mt-1 hidden text-[10px] uppercase tracking-[0.16em] text-neutral-500 md:block">
                      {opportunity.organizer}
                    </p>
                  </div>
                  {primaryType ? (
                    <Link
                      href={opportunityTypeUrl(primaryType.slug)}
                      className="hidden text-[13px] text-neutral-700 transition-opacity hover:opacity-55 md:block"
                    >
                      {primaryType.label}
                    </Link>
                  ) : (
                    <span className="hidden text-[13px] text-neutral-700 md:block">
                      {opportunity.type[0] ?? ""}
                    </span>
                  )}
                  <div className="justify-self-end text-right text-[13px] md:justify-self-start md:text-left">
                    {opportunityDeadlineLabel(opportunity.deadlineDate)}
                  </div>
                  <span className="hidden text-[13px] leading-snug text-neutral-700 md:block">
                    {locationParts.length > 0
                      ? locationParts.map((part, index) => (
                          <span key={`${part.kind}-${part.name}`}>
                            {index > 0 ? ", " : null}
                            {part.href ? (
                              <Link href={part.href} className="transition-opacity hover:opacity-55">
                                {part.name}
                              </Link>
                            ) : (
                              part.name
                            )}
                          </span>
                        ))
                      : opportunity.location}
                  </span>
                  <span className="hidden text-[13px] leading-snug text-neutral-500 md:block">
                    {opportunity.audience}
                  </span>
                  <span className="hidden text-[11px] uppercase tracking-[0.18em] text-neutral-700 md:block">
                    {opportunity.applicationFee}
                  </span>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
