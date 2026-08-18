"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

type SearchItem = {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  external?: boolean;
  thumb: string;
  thumbFit?: "cover" | "contain";
  section: "collect" | "opportunities" | "index" | "recent";
};

const COLLECT_LATEST: SearchItem[] = [
  { id: "collect-1", section: "collect", title: "Artwork", subtitle: "Collect", href: "/collect", thumb: "/example/1.jpg" },
  { id: "collect-2", section: "collect", title: "Artwork", subtitle: "Collect", href: "/collect", thumb: "/example/2.jpg" },
  { id: "collect-3", section: "collect", title: "Artwork", subtitle: "Collect", href: "/collect", thumb: "/example/3.jpg" },
  { id: "collect-4", section: "collect", title: "Artwork", subtitle: "Collect", href: "/collect", thumb: "/example/4.jpg" },
  { id: "collect-5", section: "collect", title: "Artwork", subtitle: "Collect", href: "/collect", thumb: "/example/5.jpg" },
];

const OPPORTUNITIES_LATEST: SearchItem[] = [
  { id: "opp-industra", section: "opportunities", title: "Industra Art Open Call 2027", subtitle: "31 AUG · Brno", href: "/opportunities", thumb: "/banner/blue.webp" },
  { id: "opp-minsk", section: "opportunities", title: "Culinary Residency", subtitle: "05 SEP · Potsdam", href: "/opportunities", thumb: "/banner/banner1.webp" },
  { id: "opp-ctm", section: "opportunities", title: "In Listening 2027", subtitle: "06 SEP · Berlin", href: "/opportunities", thumb: "/banner/banner3.png" },
];

const INDEX_LATEST: SearchItem[] = [
  { id: "index-ruby", section: "index", title: "Ruby Chen", subtitle: "rubyljchen.com", href: "https://www.rubyljchen.com/", external: true, thumb: "/directory/ivana.webp" },
  { id: "index-ivana", section: "index", title: "Ivana Basic", subtitle: "ivanabasic.com", href: "https://www.ivanabasic.com/", external: true, thumb: "/directory/ivana.webp", thumbFit: "contain" },
];

const RECENT_STORAGE_KEY = "findart:recent-search";
const RECENT_LIMIT = 3;

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

function saveRecent(next: SearchItem[]) {
  try {
    window.localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(next.slice(0, RECENT_LIMIT)));
  } catch {}
}

function pushRecent(item: SearchItem) {
  const withoutDup = loadRecent().filter((entry) => entry.id !== item.id);
  const next = [{ ...item, section: "recent" as const }, ...withoutDup].slice(0, RECENT_LIMIT);
  saveRecent(next);
}

function SearchIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} fill="none" aria-hidden="true">
      <circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="1.35" />
      <path d="m12.5 12.5 4 4" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" />
    </svg>
  );
}

function ListRow({ item, onNavigate }: { item: SearchItem; onNavigate: () => void }) {
  const media = (
    <>
      <div className="relative h-12 w-12 shrink-0 overflow-hidden bg-neutral-100">
        <Image
          src={item.thumb}
          alt=""
          fill
          sizes="48px"
          className={item.thumbFit === "contain" ? "object-contain" : "object-cover"}
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] leading-tight text-neutral-900">
          {item.title}
        </p>
        <p className="truncate text-[12px] leading-tight text-neutral-400">
          {item.subtitle}
        </p>
      </div>
    </>
  );

  const commonClasses = "flex items-center gap-3 py-2.5";

  return item.external ? (
    <a
      href={item.href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onNavigate}
      className={commonClasses}
    >
      {media}
    </a>
  ) : (
    <Link href={item.href} onClick={onNavigate} className={commonClasses}>
      {media}
    </Link>
  );
}

function SectionRow({
  label,
  items,
  onNavigate,
}: {
  label: string;
  items: SearchItem[];
  onNavigate: (item: SearchItem) => void;
}) {
  if (items.length === 0) return null;
  return (
    <section className="mt-5">
      <p className="mb-2 text-[10px] uppercase tracking-[0.24em] text-neutral-500">
        {label}
      </p>
      <div>
        {items.map((item) => (
          <ListRow key={`${label}-${item.id}`} item={item} onNavigate={() => onNavigate(item)} />
        ))}
      </div>
    </section>
  );
}

export function MobileGlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [recent, setRecent] = useState<SearchItem[]>([]);
  const overlayInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setRecent(loadRecent());
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const timer = window.setTimeout(() => overlayInputRef.current?.focus(), 30);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      window.clearTimeout(timer);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filterList = (items: SearchItem[]) =>
      !q
        ? items
        : items.filter(
            (item) =>
              item.title.toLowerCase().includes(q) ||
              item.subtitle.toLowerCase().includes(q)
          );
    return {
      collect: filterList(COLLECT_LATEST),
      opportunities: filterList(OPPORTUNITIES_LATEST),
      index: filterList(INDEX_LATEST),
    };
  }, [query]);

  const onNavigate = (item: SearchItem) => {
    pushRecent(item);
    setOpen(false);
    setQuery("");
  };

  return (
    <>
      {/* Compact trigger field pinned above the mobile hero carousel. */}
      <div className="px-4 pt-3 md:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open search"
          className="flex h-10 w-full items-center gap-2.5 border border-neutral-300 bg-transparent px-3 text-left text-neutral-500 transition-colors hover:border-neutral-900"
        >
          <SearchIcon className="h-[14px] w-[14px] text-neutral-500" />
          <span className="text-[13px] text-neutral-500">Search</span>
        </button>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-[75] flex flex-col bg-white md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Search"
        >
          <div className="flex items-center gap-3 border-b border-neutral-200 px-4 py-3">
            <div className="flex flex-1 items-center gap-3 border border-neutral-900 px-4 py-3">
              <SearchIcon className="h-4 w-4 text-neutral-500" />
              <input
                ref={overlayInputRef}
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search"
                aria-label="Search"
                className="editorial-serif flex-1 bg-transparent text-[13px] uppercase tracking-[0.22em] text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setQuery("");
              }}
              aria-label="Close search"
              className="flex h-11 w-11 shrink-0 items-center justify-center border border-neutral-300 text-neutral-900 transition-colors hover:border-neutral-900"
            >
              <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" aria-hidden="true">
                <path d="M4 4l12 12M16 4L4 16" stroke="currentColor" strokeWidth="1.35" />
              </svg>
            </button>
          </div>

          <div className="scrollbar-none flex-1 overflow-y-auto px-4 pb-10 pt-2">
            <SectionRow label="Recent" items={recent} onNavigate={onNavigate} />
            <SectionRow label="Collect" items={filtered.collect} onNavigate={onNavigate} />
            <SectionRow label="Opportunities" items={filtered.opportunities} onNavigate={onNavigate} />
            <SectionRow label="Index" items={filtered.index} onNavigate={onNavigate} />
            {query.trim().length > 0 &&
              filtered.collect.length === 0 &&
              filtered.opportunities.length === 0 &&
              filtered.index.length === 0 && (
                <p className="mt-10 text-center text-[11px] uppercase tracking-[0.22em] text-neutral-500">
                  Nothing matches this search
                </p>
              )}
          </div>
        </div>
      )}
    </>
  );
}
