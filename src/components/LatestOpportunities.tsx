"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { OPPORTUNITIES, type Opportunity } from "@/data/opportunities";
import { getLatestOpportunities, opportunityToday } from "@/lib/latestOpportunities";
import {
  opportunityDeadlineLabel,
  opportunityDisplayTitle,
  opportunityPrimaryTypeLabel,
  opportunityUrl,
} from "@/lib/opportunityTaxonomy";
import { OpportunityDetail } from "./OpportunityDetail";

export function LatestOpportunities({ initialToday, mobilePreview = false }: { initialToday: string; mobilePreview?: boolean }) {
  const [today, setToday] = useState(initialToday);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedSlug = searchParams.get("opp");
  const selectedOpportunity = OPPORTUNITIES.find((opportunity) => opportunity.slug === selectedSlug);
  const opportunities = useMemo(() => getLatestOpportunities(today).slice(0, mobilePreview ? 3 : 4), [today, mobilePreview]);

  useEffect(() => {
    const refresh = () => setToday(opportunityToday());
    refresh();
    const interval = window.setInterval(refresh, 60_000);
    window.addEventListener("focus", refresh);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", refresh);
    };
  }, []);

  // Use the archive's shareable ?opp=slug convention on the current feed.
  const openOpportunity = useCallback((opportunity: Opportunity | null) => {
    const params = new URLSearchParams(window.location.search);
    if (opportunity) params.set("opp", opportunity.slug);
    else params.delete("opp");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [pathname, router]);
  const closeOpportunity = useCallback(() => openOpportunity(null), [openOpportunity]);

  if (opportunities.length === 0) return null;

  return (
    <>
      <section aria-labelledby="latest-opportunities-heading" className="min-w-0 text-[var(--foreground)]">
        <div className="flex items-baseline justify-between gap-2">
          <h2 id="latest-opportunities-heading" className="editorial-serif min-w-0 break-words text-[20px] leading-[1.1] tracking-[-0.035em]">Latest opportunities</h2>
          {!mobilePreview ? <Link href="/opportunities" className="ml-auto shrink-0 text-[11px] transition-opacity hover:opacity-55"><span className="text-neutral-500">See all <span aria-hidden="true">→</span></span></Link> : null}
        </div>
        <ul className="mt-1 divide-y divide-[var(--rule)]/60">
          {opportunities.map((opportunity) => (
            <li key={opportunity.slug}>
              <Link
                href={opportunityUrl(opportunity)}
                onClick={(event) => {
                  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
                  event.preventDefault();
                  openOpportunity(opportunity);
                }}
                className={`block ${mobilePreview ? "py-4" : "py-5"} transition-opacity hover:opacity-60 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2`}
              >
                <h3 className="editorial-serif break-words text-[16px] leading-[1.2] tracking-[-0.035em]">{opportunityDisplayTitle(opportunity.title)}</h3>
                {mobilePreview ? (
                  <div className="mt-2 flex flex-wrap items-baseline justify-between gap-x-2 gap-y-1 text-neutral-500">
                    <p className="text-[10px] uppercase leading-[1.4] tracking-[0.16em]">{opportunityPrimaryTypeLabel(opportunity)}</p>
                    <time dateTime={opportunity.deadlineDate} aria-label={`Deadline: ${opportunity.deadline}`} className="ml-auto text-[11px] uppercase leading-[1.4]">
                      {opportunityDeadlineLabel(opportunity.deadlineDate).split(" ").slice(0, 2).join(" ").toUpperCase()}
                    </time>
                  </div>
                ) : (
                  <>
                    <p className="mt-1 text-[9px] uppercase leading-[1.4] tracking-[0.18em] text-neutral-500">{opportunityPrimaryTypeLabel(opportunity)}</p>
                    <div className="mt-1.5 flex flex-wrap justify-between gap-x-3 gap-y-1 text-[11px] leading-[1.4] text-neutral-500">
                      <span className="min-w-0 break-words">{opportunity.location}</span>
                      <time dateTime={opportunity.deadlineDate} className="ml-auto shrink-0">{opportunityDeadlineLabel(opportunity.deadlineDate)}</time>
                    </div>
                  </>
                )}
              </Link>
            </li>
          ))}
        </ul>
        {mobilePreview ? <Link href="/opportunities" className="mt-1 inline-block py-1 text-[11px] transition-opacity hover:opacity-55"><span className="text-neutral-500">See all <span aria-hidden="true">→</span></span></Link> : null}
      </section>
      {selectedOpportunity ? <OpportunityDetail opportunity={selectedOpportunity} onClose={closeOpportunity} /> : null}
    </>
  );
}
