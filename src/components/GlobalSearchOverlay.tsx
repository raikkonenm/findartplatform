"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { exhibitions } from "@/data/exhibitions";
import { editorialArtists } from "@/data/editorial";
import { OPPORTUNITIES } from "./OpportunitiesArchiveView";
import { useSearchPanel } from "./SearchPanelContext";

type SearchCategory = "Exhibition" | "Feature" | "Opportunity" | "Index" | "Collect";

type SearchItem = {
  id: string;
  title: string;
  subtitle: string;
  category: SearchCategory;
  href: string;
  external?: boolean;
  /** Additional free-text pool searched alongside title / subtitle. */
  haystack?: string;
};


const DIRECTORY_INDEX: SearchItem[] = [
  { id: "dir-ruby", category: "Index", title: "Ruby Chen", subtitle: "rubyljchen.com", href: "https://www.rubyljchen.com/", external: true },
  { id: "dir-ivana", category: "Index", title: "Ivana Basic", subtitle: "ivanabasic.com", href: "https://www.ivanabasic.com/", external: true },
  { id: "dir-julia", category: "Index", title: "Julia Belova", subtitle: "juliabelova.com", href: "https://www.juliabelova.com/", external: true },
  { id: "dir-andrea", category: "Index", title: "Andrea Ferrero", subtitle: "andrea-ferrero.com", href: "https://www.andrea-ferrero.com/", external: true },
  { id: "dir-angelika", category: "Index", title: "Angelika Puff", subtitle: "angelikapuff.com", href: "https://angelikapuff.com/", external: true },
  { id: "dir-taewon", category: "Index", title: "Taewon Ahn", subtitle: "irupp.kr", href: "https://irupp.kr/", external: true },
  { id: "dir-agnes", category: "Index", title: "Agnes Questionmark", subtitle: "agnesquestionmark.com", href: "https://www.agnesquestionmark.com/", external: true },
];

const RECENT_STORAGE_KEY = "findart:recent-search";
const RECENT_LIMIT = 6;

function loadRecent(): SearchItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RECENT_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.slice(0, RECENT_LIMIT);
  } catch {
    return [];
  }
}

function pushRecent(item: SearchItem) {
  try {
    const current = loadRecent().filter((entry) => entry.id !== item.id);
    const next = [item, ...current].slice(0, RECENT_LIMIT);
    window.localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(next));
  } catch {}
}

function SearchIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} fill="none" aria-hidden="true">
      <circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="1.35" />
      <path d="m12.5 12.5 4 4" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" />
    </svg>
  );
}

function ResultRow({ item, onNavigate }: { item: SearchItem; onNavigate: () => void }) {
  const inner = (
    <>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] leading-snug text-neutral-900">
          {item.title}
        </p>
        <p className="truncate text-[12px] leading-snug text-neutral-500">
          {item.subtitle}
        </p>
      </div>
      <span className="shrink-0 text-[9px] uppercase tracking-[0.24em] text-neutral-400">
        {item.category}
      </span>
    </>
  );
  const commonClasses =
    "flex items-center gap-4 border-b border-neutral-100 px-1 py-3 transition-colors hover:bg-neutral-50";
  return item.external ? (
    <a
      href={item.href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onNavigate}
      className={commonClasses}
    >
      {inner}
    </a>
  ) : (
    <Link href={item.href} onClick={onNavigate} className={commonClasses}>
      {inner}
    </Link>
  );
}

export function GlobalSearchOverlay() {
  const { open, setOpen } = useSearchPanel();
  const [query, setQuery] = useState("");
  const [recent, setRecent] = useState<SearchItem[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setRecent(loadRecent());
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const timer = window.setTimeout(() => inputRef.current?.focus(), 30);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      window.clearTimeout(timer);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, setOpen]);

  // Build a unified index at first open. Rebuilt when this component
  // remounts, which is rare.
  const fullIndex = useMemo<SearchItem[]>(() => {
    const exhibitionItems: SearchItem[] = exhibitions.map((exhibition) => ({
      id: `exh-${exhibition.slug}`,
      category: "Exhibition",
      title: exhibition.title,
      subtitle: [
        exhibition.gallery ?? exhibition.venue,
        [exhibition.city, exhibition.country].filter(Boolean).join(", "),
        exhibition.year,
      ]
        .filter(Boolean)
        .join(" · "),
      href: `/exhibitions/${exhibition.slug}`,
      haystack: [
        exhibition.subtitle,
        exhibition.gallery,
        exhibition.venue,
        exhibition.city,
        exhibition.country,
        exhibition.year,
        exhibition.dates,
        exhibition.curator,
        exhibition.photographer,
        exhibition.description,
        (exhibition.artists ?? []).join(" "),
      ]
        .filter(Boolean)
        .join(" "),
    }));

    const editorialItems: SearchItem[] = editorialArtists.map((artist) => ({
      id: `edi-${artist.slug}`,
      category: "Feature",
      title: artist.artistName,
      subtitle: artist.instagramHandle,
      href: `/features/${artist.slug}`,
      haystack: [artist.excerpt, artist.body, artist.instagramHandle].filter(Boolean).join(" "),
    }));

    return [
      ...exhibitionItems,
      ...editorialItems,
      ...OPPORTUNITIES.map((opp) => ({
        id: `opp-${opp.slug}`,
        category: "Opportunity" as const,
        title: opp.title,
        subtitle: [opp.organizer, opp.location, opp.deadline].filter(Boolean).join(" · "),
        href: `/opportunities?opp=${opp.slug}`,
        haystack: [
          opp.audience,
          (opp.tags ?? []).join(" "),
          (opp.type ?? []).join(" "),
          (opp.fields ?? []).join(" "),
          (opp.rewards ?? []).join(" "),
          opp.rewardSummary,
          opp.applicationFee,
          ...(opp.intro ?? []),
          ...((opp.sections ?? []).flatMap((s) => [s.title, ...s.items])),
        ]
          .filter(Boolean)
          .join(" "),
      })),
      ...DIRECTORY_INDEX,
    ];
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    const matches = fullIndex.filter((item) => {
      const pool = `${item.title} ${item.subtitle} ${item.haystack ?? ""}`.toLowerCase();
      return pool.includes(q);
    });
    return matches.slice(0, 60);
  }, [query, fullIndex]);

  const onNavigate = (item: SearchItem) => {
    pushRecent(item);
    setOpen(false);
    setQuery("");
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[85] flex items-start justify-center bg-black/40 px-4 pt-16 md:pt-24"
      role="dialog"
      aria-modal="true"
      aria-label="Search"
      onClick={(event) => {
        if (event.target === event.currentTarget) setOpen(false);
      }}
    >
      <div className="flex max-h-[80vh] w-full max-w-[640px] flex-col bg-white shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
        <div className="flex items-center gap-3 border-b border-neutral-200 px-5 py-4">
          <SearchIcon className="h-4 w-4 text-neutral-400" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search"
            aria-label="Search"
            className="flex-1 bg-transparent text-[15px] text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              setQuery("");
            }}
            aria-label="Close search"
            className="flex h-8 w-8 items-center justify-center text-neutral-500 transition-colors hover:text-neutral-900"
          >
            <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" aria-hidden="true">
              <path d="M4 4l12 12M16 4L4 16" stroke="currentColor" strokeWidth="1.35" />
            </svg>
          </button>
        </div>

        <div className="scrollbar-none flex-1 overflow-y-auto px-5 pb-6 pt-2">
          {results === null ? (
            <>
              {recent.length > 0 && (
                <section className="mt-4">
                  <p className="mb-2 text-[10px] uppercase tracking-[0.24em] text-neutral-500">
                    Recent
                  </p>
                  <div>
                    {recent.map((item) => (
                      <ResultRow key={item.id} item={item} onNavigate={() => onNavigate(item)} />
                    ))}
                  </div>
                </section>
              )}
              {recent.length === 0 && (
                <p className="mt-10 text-center text-[12px] text-neutral-400">
                  Start typing to search exhibitions, features, opportunities and the index.
                </p>
              )}
            </>
          ) : results.length === 0 ? (
            <p className="mt-10 text-center text-[12px] text-neutral-400">
              Nothing matches “{query}”.
            </p>
          ) : (
            <div className="mt-2">
              {results.map((item) => (
                <ResultRow key={item.id} item={item} onNavigate={() => onNavigate(item)} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
