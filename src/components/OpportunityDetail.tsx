"use client";

import { useEffect } from "react";
import type { Opportunity } from "@/data/opportunities";
import { OpportunityDetailContent } from "@/components/OpportunityDetailContent";
import { CloseIcon } from "@/components/OpportunityIcons";

// Shared with the homepage; keep the archive's existing panel and behavior.
export function OpportunityDetail({ opportunity, onClose }: { opportunity: Opportunity; onClose: () => void }) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-x-0 bottom-0 top-[65px] z-[70]" role="dialog" aria-modal="true">
      <button type="button" aria-label="Close opportunity" onClick={onClose} className="absolute inset-0 bg-black/25" />
      <aside className="absolute inset-x-0 top-0 max-h-[92vh] w-full overflow-y-auto bg-[var(--background)] shadow-[0_16px_35px_rgba(0,0,0,0.15)] md:inset-y-0 md:right-0 md:left-auto md:top-0 md:max-h-none md:w-[72vw] md:shadow-[-12px_0_35px_rgba(0,0,0,0.12)] lg:w-[62vw] lg:max-w-[1050px]">
        <OpportunityDetailContent
          opportunity={opportunity}
          closeButton={
            <button type="button" onClick={onClose} aria-label="Close opportunity" className="flex h-10 w-10 shrink-0 items-center justify-center font-light leading-none transition-opacity hover:opacity-50"><CloseIcon className="h-5 w-5" /></button>
          }
        />
      </aside>
    </div>
  );
}
