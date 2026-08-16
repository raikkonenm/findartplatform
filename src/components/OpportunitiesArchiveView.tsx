"use client";

import { useEffect, useRef, useState } from "react";
import { Header } from "./Header";

const FILTERS = {
  type: [
    "All types",
    "Residencies",
    "Awards & Prizes",
    "Calls for Curators",
    "Collaborations",
    "Commissions",
    "Education",
    "Grants & Stipends",
    "Jobs",
    "Open Calls",
  ],
  field: [
    "All fields",
    "Applied Arts",
    "Architecture",
    "Curating",
    "Dance",
    "Design",
    "Digital",
    "Drawing",
    "Education",
    "Fashion",
    "Film",
    "Installation",
    "Interdisciplinary",
    "Painting",
    "Performance",
    "Photography",
    "Printmaking",
    "Public Art",
    "Research",
    "Sculpture",
    "Social Practice",
    "Sound Art",
    "Textiles",
    "Video",
    "Visual Arts",
    "Writing",
  ],
  reward: [
    "All rewards",
    "Accommodation",
    "Cash Prize",
    "Exhibition",
    "Funding",
    "Production",
    "Publication",
    "Travel",
    "Studio Space",
    "Equipment",
    "Meals",
    "Education",
    "Other",
  ],
} as const;

type FilterMode = keyof typeof FILTERS;

const FILTER_LABELS: Record<FilterMode, string> = {
  type: "Type",
  field: "Artistic field",
  reward: "Reward",
};

function FilterRail({ mode }: { mode: FilterMode }) {
  const railRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState(FILTERS[mode][0] as string);

  useEffect(() => {
    if (mode !== "type") return;
    const rail = railRef.current;
    if (!rail) return;

    const interval = window.setInterval(() => {
      const maxScroll = rail.scrollWidth - rail.clientWidth;
      rail.scrollLeft = rail.scrollLeft >= maxScroll - 2 ? 0 : rail.scrollLeft + 1;
    }, 34);

    return () => window.clearInterval(interval);
  }, [mode]);

  return (
    <div
      ref={railRef}
      className="scrollbar-none overflow-x-auto scroll-smooth py-5"
      aria-label={`${FILTER_LABELS[mode]} options`}
    >
      <div className="flex min-w-max items-center gap-8 pr-12">
        {FILTERS[mode].map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setSelected(option)}
            className={`shrink-0 text-[11px] uppercase tracking-[0.2em] transition-opacity hover:opacity-55 ${
              selected === option ? "font-semibold text-[var(--foreground)]" : "text-neutral-500"
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

export function OpportunitiesArchiveView() {
  const [mode, setMode] = useState<FilterMode>("type");

  return (
    <main className="min-h-screen overflow-x-hidden bg-white pt-[65px]">
      <Header />
      <section className="px-5 pb-24 pt-8 md:px-8 md:pt-12 lg:px-12">
        <h1 className="editorial-serif mb-10 text-[clamp(2rem,5vw,4.5rem)] uppercase leading-[0.95] tracking-[-0.04em] md:mb-14">
          No Fees Opportunities
        </h1>
        <div className="flex flex-wrap items-center gap-3">
          {(Object.keys(FILTER_LABELS) as FilterMode[]).map((filterMode) => (
            <button
              key={filterMode}
              type="button"
              onClick={() => setMode(filterMode)}
              onMouseEnter={() => setMode(filterMode)}
              className={`border px-3 py-2 text-[10px] uppercase tracking-[0.18em] transition-colors duration-200 ${
                mode === filterMode
                  ? "border-[var(--foreground)] text-[var(--foreground)]"
                  : "border-neutral-300 text-neutral-500 hover:border-neutral-500"
              }`}
            >
              {FILTER_LABELS[filterMode]}
            </button>
          ))}
        </div>

        <FilterRail key={mode} mode={mode} />
      </section>
    </main>
  );
}
