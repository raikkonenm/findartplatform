"use client";

import { useState } from "react";
import { ExhibitionGrid } from "./ExhibitionGrid";
import { Header } from "./Header";
import { useSavedExhibitions } from "./SavedExhibitions";
import type { Exhibition } from "@/data/exhibitions";

export function ExhibitionsArchiveView({ exhibitions }: { exhibitions: Exhibition[] }) {
  const { savedSlugs } = useSavedExhibitions();
  const [savedOnly, setSavedOnly] = useState(false);
  const displayedExhibitions = savedOnly
    ? exhibitions.filter((exhibition) => savedSlugs.has(exhibition.slug))
    : exhibitions;

  return (
    <main className="relative min-h-screen bg-white pt-24 sm:pt-28">
      <Header savedOnly={savedOnly} onToggleSavedOnly={() => setSavedOnly((active) => !active)} />
      <div className="px-5 pt-12 sm:px-8 lg:px-12">
        <p className="text-[11px] uppercase tracking-[0.32em] text-neutral-500">
          Archive / 2024-2026
        </p>
        <h1 className="editorial-serif mt-6 max-w-4xl text-[clamp(3.5rem,8vw,7rem)] leading-[0.92] tracking-[-0.055em]">
          Exhibitions
        </h1>
      </div>
      {savedOnly && savedSlugs.size === 0 ? (
        <p className="px-5 py-20 text-center text-[11px] uppercase tracking-[0.25em] text-neutral-400 sm:px-8 lg:px-12">
          No saved exhibitions yet
        </p>
      ) : (
        <ExhibitionGrid exhibitions={displayedExhibitions} heading="All Exhibitions" />
      )}
    </main>
  );
}
