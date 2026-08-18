"use client";

import { useMemo, useState } from "react";
import { Header } from "./Header";
import { IndexImageCarousel } from "./IndexImageCarousel";

type ViewMode = "grid" | "list";

type IndexEntry = {
  name: string;
  href: string;
  subtitle: string;
  kind: "video" | "carousel";
  media: string | string[];
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
    media: [
      "/directory/ivana.webp",
      "/directory/ivana1.webp",
      "/directory/ivana2.webp",
      "/directory/ivana3.webp",
      "/directory/ivana4.webp",
    ],
  },
];

export function DirectoryArchiveView() {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ENTRIES;
    return ENTRIES.filter((entry) =>
      entry.name.toLowerCase().includes(q) || entry.subtitle.toLowerCase().includes(q)
    );
  }, [query]);

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

        <div className="flex flex-wrap items-center gap-3 border-t border-[var(--border)] pt-4 md:justify-between">
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search index"
            aria-label="Search index"
            className="w-full max-w-[320px] border border-[var(--border)] bg-transparent px-3 py-2 text-[11px] uppercase tracking-[0.18em] text-neutral-800 placeholder:text-neutral-400 focus:border-neutral-800 focus:outline-none md:order-2"
          />
          <div className="inline-flex items-center border border-[var(--border)] text-[10px] uppercase tracking-[0.18em] md:order-1">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              aria-pressed={viewMode === "grid"}
              className={`px-3 py-2 transition-colors ${viewMode === "grid" ? "bg-neutral-900 text-white" : "text-neutral-500 hover:text-neutral-900"}`}
            >
              Grid
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              aria-pressed={viewMode === "list"}
              className={`border-l border-[var(--border)] px-3 py-2 transition-colors ${viewMode === "list" ? "bg-neutral-900 text-white" : "text-neutral-500 hover:text-neutral-900"}`}
            >
              List
            </button>
          </div>
        </div>

        {visible.length === 0 ? (
          <p className="py-24 text-center text-[11px] uppercase tracking-[0.2em] text-neutral-500">
            Nothing matches this search
          </p>
        ) : viewMode === "grid" ? (
          <div className="mt-10 grid grid-cols-1 gap-x-8 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
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
          <IndexImageCarousel images={entry.media as string[]} alt={entry.name} />
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
