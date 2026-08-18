"use client";

import { useMemo, useState } from "react";
import { Header } from "./Header";
import { IndexImageCarousel } from "./IndexImageCarousel";
import { LayoutGlyphs, LayoutSection, MobileFilterSheet } from "./MobileFilterSheet";
import { SearchBar } from "./SearchBar";

type ViewMode = "grid" | "list";
type Density = "normal" | "dense";

type IndexEntry = {
  name: string;
  href: string;
  subtitle: string;
  kind: "video" | "carousel";
  media: string | string[];
  fit?: "cover" | "contain";
};

const ENTRIES: IndexEntry[] = [
  {
    name: "RUBY CHEN",
    href: "https://www.rubyljchen.com/",
    subtitle: "rubyljchen.com",
    kind: "video",
    media: "/directory/rubychen.web.mp4",
  },
  {
    name: "IVANA BASIC",
    href: "https://www.ivanabasic.com/",
    subtitle: "ivanabasic.com",
    kind: "carousel",
    fit: "contain",
    media: [
      "/directory/ivana.webp",
      "/directory/ivana1.webp",
      "/directory/ivana2.webp",
      "/directory/ivana3.webp",
      "/directory/ivana4.webp",
    ],
  },
  {
    name: "JULIA BELOVA",
    href: "https://www.juliabelova.com/",
    subtitle: "juliabelova.com",
    kind: "video",
    media: "/directory/juliabelova.web.mp4",
  },
  {
    name: "ANDREA FERRERO",
    href: "https://www.andrea-ferrero.com/",
    subtitle: "andrea-ferrero.com",
    kind: "video",
    media: "/directory/andrea-ferrero.web.mp4",
  },
  {
    name: "ANGELIKA PUFF",
    href: "https://angelikapuff.com/",
    subtitle: "angelikapuff.com",
    kind: "video",
    media: "/directory/angelikapuff.web.mp4",
  },
  {
    name: "TAEWON AHN",
    href: "https://irupp.kr/",
    subtitle: "irupp.kr",
    kind: "video",
    media: "/directory/taewon.web.mp4",
  },
  {
    name: "AGNES QUESTIONMARK",
    href: "https://www.agnesquestionmark.com/",
    subtitle: "agnesquestionmark.com",
    kind: "video",
    media: "/directory/agnesquestionmark.web.mp4",
  },
];

function DensityToggle({ density, onCycle }: { density: Density; onCycle: () => void }) {
  const isActive = density === "dense";
  return (
    <button
      type="button"
      onClick={onCycle}
      aria-label={`Feed density: ${density}. Tap to cycle.`}
      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border transition duration-200 ease-out ${
        isActive
          ? "border-neutral-900 text-neutral-900"
          : "border-neutral-200 text-neutral-500 hover:border-neutral-400 hover:text-neutral-700"
      }`}
    >
      <svg
        width={16}
        height={16}
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="square"
        aria-hidden="true"
        className={`transition-transform duration-300 ease-out ${density === "dense" ? "rotate-90" : "rotate-0"}`}
      >
        <line x1="3" y1="3" x2="3" y2="13" />
        <line x1="8" y1="3" x2="8" y2="13" />
        <line x1="13" y1="3" x2="13" y2="13" />
      </svg>
    </button>
  );
}

export function DirectoryArchiveView() {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [density, setDensity] = useState<Density>("normal");
  const [query, setQuery] = useState("");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ENTRIES;
    return ENTRIES.filter((entry) =>
      entry.name.toLowerCase().includes(q) || entry.subtitle.toLowerCase().includes(q)
    );
  }, [query]);

  const gridColsClass =
    density === "dense"
      ? "grid-cols-2 md:grid-cols-4 lg:grid-cols-5"
      : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";

  return (
    <main className="min-h-screen overflow-x-hidden bg-white pt-[65px]">
      <Header />
      <section className="px-5 pb-24 pt-8 md:px-8 md:pt-12 lg:px-12">
        <p className="mb-3 text-[10px] uppercase tracking-[0.28em] text-neutral-500">
          Index
        </p>
        <h1 className="editorial-serif mb-12 max-w-3xl break-words text-[clamp(1.4rem,4.5vw,2.5rem)] leading-[1.15] tracking-[-0.02em] text-neutral-800">
          Discover how artists, galleries and institutions present their work online.
        </h1>

        <div className="flex flex-col gap-3 border-t border-[var(--border)] pt-4 md:flex-row md:items-center md:justify-end md:gap-4 md:border-t-0 md:pt-0">
          {/* Mobile: SearchBar + filter drawer trigger. Desktop uses the global
              header search; page-level search is hidden. */}
          <div className="md:hidden">
            <SearchBar
              value={query}
              onChange={setQuery}
              placeholder="Search websites"
              onFilterClick={() => setMobileFiltersOpen(true)}
            />
          </div>
          {/* Desktop-only Grid/List + density toggle. Mobile uses the drawer. */}
          <div className="hidden md:flex md:items-center md:gap-3">
            <div className="inline-flex items-center rounded-lg border border-neutral-200 text-[10px] uppercase tracking-[0.18em]">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                aria-pressed={viewMode === "grid"}
                className={`h-11 px-4 transition-colors ${viewMode === "grid" ? "bg-neutral-900 text-white" : "text-neutral-500 hover:text-neutral-900"} rounded-l-lg`}
              >
                Grid
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                aria-pressed={viewMode === "list"}
                className={`h-11 border-l border-neutral-200 px-4 transition-colors ${viewMode === "list" ? "bg-neutral-900 text-white" : "text-neutral-500 hover:text-neutral-900"} rounded-r-lg`}
              >
                List
              </button>
            </div>
            {viewMode === "grid" && (
              <DensityToggle density={density} onCycle={() => setDensity((current) => (current === "normal" ? "dense" : "normal"))} />
            )}
          </div>
        </div>

        {visible.length === 0 ? (
          <p className="py-24 text-center text-[11px] uppercase tracking-[0.2em] text-neutral-500">
            Nothing matches this search
          </p>
        ) : viewMode === "grid" ? (
          <div className={`mt-10 grid gap-x-8 gap-y-14 ${gridColsClass}`}>
            {visible.map((entry) => (
              <DirectoryCard key={entry.name} entry={entry} />
            ))}
          </div>
        ) : (
          <div className="mt-8 border-t border-[var(--border)]">
            {visible.map((entry) => (
              <DirectoryRow key={entry.name} entry={entry} />
            ))}
          </div>
        )}
      </section>
      <MobileFilterSheet
        open={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
        searchValue={query}
        onSearchChange={setQuery}
        searchPlaceholder="Search websites"
        onClearAll={() => {
          setQuery("");
          setDensity("normal");
          setViewMode("grid");
        }}
        resultCount={visible.length}
      >
        <LayoutSection<Density>
          value={density}
          onChange={setDensity}
          options={[
            { id: "normal", label: "Comfortable grid", glyph: LayoutGlyphs.gridNormal },
            { id: "dense", label: "Dense grid", glyph: LayoutGlyphs.gridDense },
          ]}
        />
      </MobileFilterSheet>
    </main>
  );
}

function DirectoryCard({ entry }: { entry: IndexEntry }) {
  return (
    <a
      href={entry.href}
      target="_blank"
      rel="noopener noreferrer"
      className="group block min-w-0"
    >
      <div className="relative aspect-[2/1] overflow-hidden bg-neutral-100">
        {entry.kind === "video" ? (
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out md:group-hover:scale-[1.025]"
          >
            <source src={entry.media as string} type="video/mp4" />
          </video>
        ) : (
          <IndexImageCarousel
            images={entry.media as string[]}
            alt={entry.name}
            fit={entry.fit ?? "cover"}
          />
        )}
      </div>
      <div className="archive-card-copy pt-5">
        <h2 className="editorial-serif break-words text-[clamp(0.9rem,4vw,1.3rem)] leading-[1.08] tracking-[-0.035em] md:text-[clamp(1rem,1.7vw,1.65rem)] md:leading-[1.02]">
          {entry.name}
          <span className="ml-2 inline-block align-[0.15em] text-[0.6em]">&#8599;</span>
        </h2>
        <p className="mt-2 text-[0.85em] uppercase tracking-[0.2em] text-[#888] md:text-[11px] md:tracking-[0.18em] md:text-neutral-500">
          {entry.subtitle}
        </p>
      </div>
    </a>
  );
}

function DirectoryRow({ entry }: { entry: IndexEntry }) {
  return (
    <a
      href={entry.href}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-baseline justify-between gap-6 border-b border-[var(--border)] px-2 py-6 transition-colors duration-200 hover:bg-neutral-50 md:px-3"
    >
      <h3 className="editorial-serif break-words text-[clamp(1rem,2.4vw,1.5rem)] leading-[1.05] tracking-[-0.02em] transition-opacity group-hover:opacity-70">
        {entry.name}
        <span className="ml-2 inline-block align-[0.15em] text-[0.55em] text-neutral-500">&#8599;</span>
      </h3>
      <span className="shrink-0 text-[11px] uppercase tracking-[0.18em] text-neutral-500">
        {entry.subtitle}
      </span>
    </a>
  );
}
