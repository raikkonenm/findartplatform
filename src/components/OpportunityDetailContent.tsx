import Link from "next/link";
import type { ReactNode } from "react";
import type { Opportunity } from "@/data/opportunities";
import { ArrowRightIcon, ExternalArrowIcon } from "@/components/OpportunityIcons";
import {
  opportunityDisplayTitle,
  opportunityFreeUrl,
  opportunityLocationParts,
  opportunityTagUrl,
} from "@/lib/opportunityTaxonomy";

type OpportunityDetailContentProps = {
  opportunity: Opportunity;
  closeButton?: ReactNode;
  headingLevel?: "h1" | "h2";
};

export function OpportunityDetailContent({
  opportunity,
  closeButton,
  headingLevel = "h2",
}: OpportunityDetailContentProps) {
  const Heading = headingLevel;
  const locationParts = opportunityLocationParts(opportunity);
  const isFree = opportunity.applicationFee.trim().toUpperCase() === "FREE";

  return (
    <div className="mx-auto max-w-[880px] px-5 pb-20 pt-6 md:px-10 md:pt-10 lg:px-14">
      <div className="mb-6 flex items-start justify-between gap-6">
        <p className="pt-2 text-[10px] uppercase tracking-[0.2em] text-neutral-500">
          {opportunity.organizer}
        </p>
        {closeButton}
      </div>
      <Heading className="editorial-serif max-w-[760px] break-words text-[clamp(1.6rem,5vw,2.2rem)] leading-[1.02] tracking-[-0.035em] md:text-[clamp(2rem,3vw,3rem)] md:leading-[1.02]">
        {opportunityDisplayTitle(opportunity.title)}
      </Heading>
      <dl className="my-10 grid gap-5 border-y border-[var(--border)] py-6 text-[13px] md:grid-cols-4">
        <div>
          <dt className="mb-2 text-[9px] uppercase tracking-[0.2em] text-neutral-500">
            Deadline
          </dt>
          <dd>{opportunity.deadline}</dd>
        </div>
        <div>
          <dt className="mb-2 text-[9px] uppercase tracking-[0.2em] text-neutral-500">
            Location
          </dt>
          <dd>
            {locationParts.length > 0
              ? locationParts.map((part, index) => (
                  <span key={`${part.kind}-${part.name}`}>
                    {index > 0 ? ", " : null}
                    {part.href ? (
                      <Link
                        href={part.href}
                        className="underline decoration-neutral-300 decoration-1 underline-offset-[3px] transition-opacity hover:opacity-55"
                      >
                        {part.name}
                      </Link>
                    ) : (
                      part.name
                    )}
                  </span>
                ))
              : opportunity.location}
          </dd>
        </div>
        <div>
          <dt className="mb-2 text-[9px] uppercase tracking-[0.2em] text-neutral-500">
            Application fee
          </dt>
          <dd>
            {isFree ? (
              <Link
                href={opportunityFreeUrl()}
                className="transition-opacity hover:opacity-55"
              >
                {opportunity.applicationFee}
              </Link>
            ) : (
              opportunity.applicationFee
            )}
          </dd>
        </div>
        <div>
          <dt className="mb-2 text-[9px] uppercase tracking-[0.2em] text-neutral-500">
            For
          </dt>
          <dd>{opportunity.audience}</dd>
        </div>
      </dl>
      <div className="max-w-[720px] space-y-5 text-[15px] leading-[1.7]">
        {opportunity.intro.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
      <div className="mt-12 grid gap-x-10 gap-y-10 md:grid-cols-2">
        {opportunity.sections.map((section) => (
          <section key={section.title} className="border-t border-[var(--border)] pt-5">
            <h3 className="mb-5 text-[10px] font-semibold uppercase tracking-[0.2em]">
              {section.title}
            </h3>
            <ul className="space-y-3 text-[13px] leading-[1.55]">
              {section.items.map((item) => (
                <li key={item} className="flex gap-3">
                  <ArrowRightIcon />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      <div className="mt-14 flex flex-wrap items-center justify-between gap-5 border-t border-[var(--border)] pt-7">
        <div className="flex flex-wrap gap-2">
          {opportunity.tags.map((tag) => {
            const href = opportunityTagUrl(opportunity, tag);
            const className =
              "border border-[var(--border)] px-2.5 py-1.5 text-[8px] uppercase tracking-[0.18em]";
            return href ? (
              <Link key={tag} href={href} className={className}>
                {tag}
              </Link>
            ) : (
              <span key={tag} className={className}>
                {tag}
              </span>
            );
          })}
        </div>
        <a
          href={opportunity.applyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="border border-[var(--foreground)] bg-transparent px-8 py-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--foreground)] transition-opacity hover:opacity-55"
        >
          Apply <ExternalArrowIcon />
        </a>
      </div>
    </div>
  );
}
