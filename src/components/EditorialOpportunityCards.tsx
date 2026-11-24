"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { Opportunity } from "@/data/opportunities";
import { OpportunityDetailContent } from "./OpportunityDetailContent";
import { opportunityDisplayTitle } from "@/lib/opportunityTaxonomy";

export function EditorialOpportunityCards({ opportunities }: { opportunities: Opportunity[] }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [selected, setSelected] = useState<Opportunity | null>(null);

  useEffect(() => {
    if (!selected || !dialog.current) return;
    const element = dialog.current;
    const trigger = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    // An Editorial slide-over already owns the scroll lock when present.
    const ownsScrollLock = previousOverflow !== "hidden";
    if (ownsScrollLock) document.body.style.overflow = "hidden";
    element.showModal();
    return () => {
      element.close();
      if (ownsScrollLock) document.body.style.overflow = previousOverflow;
      if (trigger instanceof HTMLElement && trigger.isConnected) trigger.focus({ preventScroll: true });
    };
  }, [selected]);

  return (
    <section aria-labelledby={titleId} className="min-w-0">
      <h2 id={titleId} className="text-[14px] uppercase tracking-[0.2em]">Explore the 8 programmes</h2>
      <ol className="mt-5 space-y-4">
        {opportunities.map(opportunity => (
          <li key={opportunity.slug} className="min-w-0">
            <a href={`/opportunities/${opportunity.slug}`} data-opportunity={opportunity.slug} onClick={event => {
              if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
              event.preventDefault();
              setSelected(opportunity);
            }} className="group block border border-neutral-300 p-5 transition-colors hover:border-neutral-900 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-neutral-900 md:p-7">
              <p className="text-[12px] uppercase tracking-[0.14em] text-neutral-500">{opportunity.location}</p>
              <h3 className="editorial-serif mt-3 break-words text-[clamp(1.25rem,2.5vw,1.5rem)] leading-[1.15] tracking-[-0.02em]">{opportunity.title}</h3>
              <p className="mt-2 text-[13px] leading-5 text-neutral-600">{opportunity.organizer}</p>
              <p className="mt-4 line-clamp-2 text-[15px] leading-6">{opportunity.rewardSummary}</p>
              <dl className="mt-5 grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-x-5 gap-y-4 text-[13px] leading-6">
                <div className="col-span-2"><dt className="mb-1 text-neutral-500">For</dt><dd className="max-w-[760px]">{opportunity.audience}</dd></div>
                <div><dt className="mb-1 text-neutral-500">Deadline</dt><dd>{opportunity.deadline}</dd></div>
                <div><dt className="mb-1 text-neutral-500">Application fee</dt><dd>{opportunity.applicationFee}</dd></div>
              </dl>
              <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px]">
                {opportunity.availability === "closed" && <p className="font-medium">Applications closed</p>}
                <span className="underline decoration-neutral-400 underline-offset-4 group-hover:decoration-neutral-900">View full details</span>
              </div>
            </a>
          </li>
        ))}
      </ol>
      <dialog ref={dialog} aria-label={selected ? opportunityDisplayTitle(selected.title) : "Opportunity details"} onCancel={event => { event.preventDefault(); setSelected(null); }} onKeyDownCapture={event => {
        if (event.key === "Escape") {
          event.preventDefault();
          event.stopPropagation();
          setSelected(null);
        }
      }} onClick={event => { if (event.target === event.currentTarget) setSelected(null); }} className="fixed inset-0 m-0 h-[100dvh] max-h-none w-screen max-w-none bg-transparent p-0 text-[var(--foreground)] backdrop:bg-black/25">
        {selected && <aside className="ml-auto h-full w-full overflow-y-auto overscroll-contain bg-[var(--background)] text-[var(--foreground)] shadow-[-12px_0_35px_rgba(0,0,0,0.12)] md:w-[72vw] lg:w-[62vw] lg:max-w-[1050px]">
          {selected.availability === "closed" && <p role="status" className="border-b border-neutral-200 px-5 py-4 text-[14px] md:px-10 lg:px-14">Applications closed. Deadline: {selected.deadline}.</p>}
          <OpportunityDetailContent opportunity={selected} closeButton={<button type="button" aria-label="Close opportunity" onClick={() => setSelected(null)} className="flex h-11 w-11 shrink-0 items-center justify-center text-[28px] leading-none hover:opacity-60">×</button>} />
        </aside>}
      </dialog>
    </section>
  );
}
