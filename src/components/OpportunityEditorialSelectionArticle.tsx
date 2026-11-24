import Link from "next/link";
import type { OpportunityEditorialSelection } from "@/data/editorialSelections";
import { OPPORTUNITIES } from "@/data/opportunities";
import { EditorialOpportunityCards } from "./EditorialOpportunityCards";
import { EditorialRelatedContent } from "./EditorialRelatedContent";

export function OpportunityEditorialSelectionArticle({ selection }: { selection: OpportunityEditorialSelection }) {
  const opportunities = selection.opportunitySlugs.map(slug => OPPORTUNITIES.find(opportunity => opportunity.slug === slug)!);
  return (
    <article className="bg-white px-5 pb-16 pt-14 text-neutral-900 md:px-8 md:pt-20 lg:px-12">
      <div className="mx-auto max-w-[960px]">
        <header className="max-w-[800px]">
          <p className="text-[12px] uppercase tracking-[0.24em] text-neutral-500">Editorial · Opportunities</p>
          <h1 className="editorial-serif mt-4 break-words text-[clamp(1.8rem,4vw,2.8rem)] leading-[1.08] tracking-[-0.02em]">{selection.title}</h1>
        </header>
        <div className="mt-6 max-w-[760px] space-y-3 text-[16px] leading-[1.65] text-neutral-800">
          {selection.intro.split(/\n\s*\n/).map(paragraph => <p key={paragraph}>{paragraph}</p>)}
        </div>
        <div className="mt-8"><EditorialOpportunityCards opportunities={opportunities} /></div>
        <EditorialRelatedContent selectionSlug={selection.slug} />
        <footer className="mt-8 border-t border-neutral-200 pt-5 text-[13px] text-neutral-600">
          <Link href="/editorial" className="underline decoration-neutral-300 underline-offset-4 hover:opacity-60">Back to Editorial</Link>
        </footer>
      </div>
    </article>
  );
}
