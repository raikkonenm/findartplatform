"use client";

import { Suspense, useCallback, useState, useMemo, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { exhibitions, semanticTags, type SemanticTag } from "@/data/exhibitions";
import { ExhibitionCard } from "@/components/ExhibitionCard";
import { HeartIcon, useSavedExhibitions } from "@/components/SavedExhibitions";

const YEARS = ["All", "2026", "2025", "2024", "2023"];
const PRIMARY_TAGS: Array<"ALL" | SemanticTag> = [
  "ALL",
  "INSTALLATION",
  "POSTHUMAN",
  "ECOLOGY",
  "RITUAL",
  "IDENTITY",
  "DIGITAL MYTH",
  "DECAY",
  "SOUND",
  "GROUP SHOW",
];
const MORE_TAGS: SemanticTag[] = [
  "LIMINALITY",
  "SPECULATIVE FICTION",
  "HYBRID BODIES",
  "SURVEILLANCE",
  "MATERIALITY",
  "TRANSFORMATION",
  "MYTH",
  "DREAM LOGIC",
  "ORGANIC SYSTEMS",
  "NON-HUMAN",
  "SIMULATION",
  "MUTATION",
];
type SelectedTag = "ALL" | SemanticTag;
const FEATURED_SLUG = "lullaby-blossoms";

function tagFromQueryParam(value: string | null): SelectedTag {
  if (value && (semanticTags as readonly string[]).includes(value)) {
    return value as SemanticTag;
  }

  return "ALL";
}

function TagQuerySync({ onChange }: { onChange: (tag: SelectedTag) => void }) {
  const searchParams = useSearchParams();
  const queryTag = searchParams.get("tag");

  useEffect(() => {
    onChange(tagFromQueryParam(queryTag));
  }, [onChange, queryTag]);

  return null;
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 border px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] transition-colors ${
        active
          ? "border-neutral-900 text-neutral-900"
          : "border-neutral-200 text-neutral-400 hover:border-neutral-400 hover:text-neutral-600"
      }`}
    >
      {label}
    </button>
  );
}

function CityDropdown({
  value,
  options,
  onChange,
}: {
  value: string;
  options: string[];
  onChange: (city: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onMouseDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const label = value === "All" ? "All cities" : value;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className="flex shrink-0 items-center gap-2 whitespace-nowrap border border-neutral-200 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-neutral-700 transition-colors hover:border-neutral-400"
      >
        <span>{label}</span>
        <svg
          className={`h-2 w-2.5 transition-transform ${open ? "rotate-180" : ""}`}
          viewBox="0 0 10 6"
          fill="none"
          aria-hidden="true"
        >
          <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      </button>
      {open && (
        <ul
          role="listbox"
          className="absolute left-0 top-full z-30 mt-1 max-h-72 w-48 overflow-y-auto border border-neutral-200 bg-white"
        >
          {options.map((c) => {
            const active = c === value;
            return (
              <li key={c} role="option" aria-selected={active}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(c);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between px-3 py-2 text-left text-[10px] uppercase tracking-[0.18em] transition-colors hover:bg-neutral-50 ${
                    active ? "text-neutral-900" : "text-neutral-500"
                  }`}
                >
                  <span>{c === "All" ? "All cities" : c}</span>
                  {active && (
                    <svg
                      className="h-2.5 w-3 shrink-0"
                      viewBox="0 0 12 12"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M2 6l3 3 5-6"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function MoreTagsDropdown({
  value,
  onChange,
}: {
  value: SelectedTag;
  onChange: (tag: SemanticTag) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const hasSelectedMoreTag = value !== "ALL" && MORE_TAGS.includes(value);

  useEffect(() => {
    if (!open) return;

    function onMouseDown(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((isOpen) => !isOpen)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className={`shrink-0 border px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] transition-colors ${
          hasSelectedMoreTag
            ? "border-neutral-900 text-neutral-900"
            : "border-neutral-200 text-neutral-400 hover:border-neutral-400 hover:text-neutral-600"
        }`}
      >
        + More &#9662;
      </button>
      {open && (
        <div
          role="listbox"
          aria-label="More tags"
          className="absolute right-0 top-full z-30 mt-2 w-[min(34rem,calc(100vw-2.5rem))] border border-neutral-200 bg-white p-3 shadow-[0_4px_14px_rgba(0,0,0,0.05)] md:left-0 md:right-auto md:p-4"
        >
          <div className="flex flex-wrap gap-2">
            {MORE_TAGS.map((tag) => (
              <FilterChip
                key={tag}
                label={tag}
                active={value === tag}
                onClick={() => {
                  onChange(tag);
                  setOpen(false);
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();
  const { savedSlugs } = useSavedExhibitions();
  const [city, setCity] = useState("All");
  const [year, setYear] = useState("All");
  const [tag, setTag] = useState<SelectedTag>("ALL");
  const [savedOnly, setSavedOnly] = useState(false);
  const [search, setSearch] = useState("");
  const featuredExhibition = exhibitions.find((exhibition) => exhibition.slug === FEATURED_SLUG);

  const selectTag = useCallback(
    (nextTag: SelectedTag) => {
      setTag(nextTag);
      const params = new URLSearchParams(window.location.search);

      if (nextTag === "ALL") {
        params.delete("tag");
      } else {
        params.set("tag", nextTag);
      }

      const query = params.toString();
      router.replace(query ? `/?${query}` : "/", { scroll: false });
    },
    [router],
  );

  const cityOptions = useMemo(() => {
    const unique = Array.from(
      new Set(exhibitions.map((e) => e.city).filter((c): c is string => Boolean(c))),
    );
    unique.sort((a, b) => a.localeCompare(b));
    return ["All", ...unique];
  }, []);

  const filtered = useMemo(
    () =>
      exhibitions.filter((ex) => {
        const matchCity = city === "All" || ex.city === city;
        const matchYear = year === "All" || ex.year === year;
        const matchTag = tag === "ALL" || ex.tags.includes(tag);
        const matchSaved = !savedOnly || savedSlugs.has(ex.slug);
        const q = search.toLowerCase();
        const matchSearch =
          !q ||
          [
            ex.title,
            ex.city,
            ex.venue,
            ex.gallery,
            ex.description,
            ex.summary,
            ...(ex.artists ?? []),
          ].some((f) => f?.toLowerCase().includes(q));
        return matchCity && matchYear && matchTag && matchSaved && matchSearch;
      }),
    [city, year, tag, savedOnly, savedSlugs, search],
  );

  return (
    <main className="min-h-screen bg-white">
      <Suspense fallback={null}>
        <TagQuerySync onChange={setTag} />
      </Suspense>
      {/* Header — sticky + high z-index so it remains visible above the
          slide-over panel when an exhibition detail is open. */}
      <header className="sticky top-0 z-50 h-[65px] border-b border-neutral-200 bg-white px-4 md:px-8 lg:px-12">
        <nav
          className="relative flex h-full items-center justify-between md:grid md:grid-cols-[1fr_auto_1fr]"
          aria-label="Primary navigation"
        >
          <div className="flex max-w-[5.3rem] flex-col items-start gap-1 text-[8px] uppercase leading-[1.35] tracking-[0.14em] text-neutral-900 md:max-w-none md:flex-row md:items-center md:gap-7 md:text-[11px] md:tracking-[0.28em]">
            <a href="https://www.artcnomad.com/">By ArtNomad Curators &#8599;</a>
            <a href="https://www.artcnomad.com/practice">Practice &#8599;</a>
          </div>
          <Link
            href="/"
            className="absolute left-1/2 flex -translate-x-1/2 flex-col items-center whitespace-nowrap text-center text-[13px] font-medium leading-none tracking-tight text-neutral-900 transition-opacity hover:opacity-55 md:static md:translate-x-0 md:justify-self-center md:text-2xl"
            aria-label="FindArt Platform home"
          >
            <span>FindArt Platform</span>
            <span className="pointer-events-none mt-[6px] hidden whitespace-nowrap text-[10px] font-normal leading-none tracking-[0.12em] text-black/40 md:block">
              Contemporary Art Exhibitions Worldwide
            </span>
          </Link>
          <div className="flex items-center gap-3 justify-self-end md:gap-5">
            <Link
              href="/submit"
              className="text-[9px] uppercase tracking-[0.16em] text-neutral-900 transition-opacity hover:opacity-55 md:text-[11px] md:tracking-[0.28em]"
            >
              Submit
            </Link>
            <button
              type="button"
              aria-label={savedOnly ? "Show all exhibitions" : "Show saved exhibitions only"}
              aria-pressed={savedOnly}
              onClick={() => setSavedOnly((active) => !active)}
              className="text-neutral-900 transition-opacity hover:opacity-55 focus-visible:outline-none"
            >
              <HeartIcon filled={savedOnly} className="h-4 w-4" />
            </button>
          </div>
        </nav>
      </header>

      {featuredExhibition && (
        <section className="bg-white px-5 pb-6 pt-4 md:px-8 md:pb-8 md:pt-6 lg:px-12">
          <div className="flex flex-col overflow-hidden md:relative md:block md:h-[340px] md:max-h-[360px] lg:h-[360px]">
            <div className="order-2 grid h-[58vw] min-h-[178px] max-h-[250px] grid-cols-3 md:absolute md:inset-0 md:h-auto md:max-h-none">
              {featuredExhibition.images.slice(0, 3).map((image, index) => (
                <div key={image.src} className="relative h-full bg-neutral-100">
                  <Image
                    src={image.src}
                    alt={`${featuredExhibition.title} exhibition view ${index + 1}`}
                    fill
                    className={`object-cover ${index === 2 ? "object-[45%_center]" : "object-center"}`}
                    sizes="(min-width: 768px) 33vw, 34vw"
                  />
                </div>
              ))}
            </div>

            <div className="absolute inset-y-0 left-0 hidden w-[48%] bg-[linear-gradient(90deg,rgba(255,255,255,0.92)_0%,rgba(255,255,255,0.82)_45%,rgba(255,255,255,0)_100%)] md:block lg:w-[40%]" />

            <div className="order-1 flex flex-col bg-white pb-7 pt-3 md:absolute md:inset-y-0 md:left-0 md:max-w-lg md:-translate-y-2 md:justify-center md:bg-transparent md:px-10 md:py-8 lg:px-[60px]">
              <p className="text-[10px] uppercase tracking-[0.28em] text-neutral-600">
                Exhibition of the Week
              </p>
              <h2 className="mt-4 break-words text-[clamp(2rem,10vw,3.5rem)] font-medium leading-none tracking-[-0.045em] text-neutral-900 md:text-[clamp(2.25rem,4vw,3.5rem)]">
                {featuredExhibition.title}
              </h2>
              <p className="mt-4 text-[11px] uppercase tracking-[0.22em] text-neutral-700">
                {featuredExhibition.gallery ?? featuredExhibition.venue}
              </p>
              <p className="mt-2 text-[11px] uppercase tracking-[0.22em] text-neutral-600">
                {[featuredExhibition.city, featuredExhibition.country].filter(Boolean).join(", ")}
              </p>
              <p className="mt-2 text-[11px] uppercase tracking-[0.22em] text-neutral-600">
                {featuredExhibition.dates}
              </p>
              <Link
                href={`/exhibitions/${featuredExhibition.slug}`}
                className="mt-6 inline-flex min-h-11 w-full items-center justify-center border border-neutral-900 bg-white/70 px-5 py-3 text-[10px] uppercase tracking-[0.24em] text-neutral-900 transition-opacity hover:opacity-55 md:w-fit"
              >
                View Exhibition
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Filter bar */}
      <div className="border-b border-neutral-200 bg-white px-5 py-4 md:px-8 md:py-3 lg:px-12">
        <div className="space-y-4 md:space-y-3">
          <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center md:gap-x-8 md:gap-y-2">
            {/* City filter */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-[0.25em] text-neutral-400">City:</span>
              <CityDropdown value={city} options={cityOptions} onChange={setCity} />
            </div>

            {/* Year filter */}
            <div className="scrollbar-none flex min-w-0 items-center gap-2 overflow-x-auto pb-1 md:flex-wrap md:overflow-visible md:pb-0">
              <span className="text-[10px] uppercase tracking-[0.25em] text-neutral-400">Year:</span>
              {YEARS.map((y) => (
                <FilterChip key={y} label={y} active={year === y} onClick={() => setYear(y)} />
              ))}
            </div>

            {/* Search */}
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search exhibitions..."
              className="w-full border-0 border-b border-neutral-300 bg-transparent pb-2 text-[12px] text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none md:ml-auto md:w-56 md:pb-1"
            />
          </div>

          <div className="flex min-w-0 items-start gap-2">
            <span className="shrink-0 pt-1.5 text-[10px] uppercase tracking-[0.25em] text-neutral-400">
              Tags:
            </span>
            <div className="scrollbar-none flex min-w-0 flex-1 gap-2 overflow-x-auto pb-1 md:flex-wrap md:overflow-visible md:pb-0">
              {PRIMARY_TAGS.map((filterTag) => (
                <FilterChip
                  key={filterTag}
                  label={filterTag}
                  active={tag === filterTag}
                  onClick={() => selectTag(filterTag)}
                />
              ))}
            </div>
            <MoreTagsDropdown value={tag} onChange={selectTag} />
          </div>
        </div>
      </div>

      {/* Exhibition feed — CSS columns provides masonry without JS. Cards have
          their own `mb-[72px]` for row rhythm and `break-inside-avoid` to stay
          intact across column boundaries. */}
      <section className="bg-white px-5 py-10 md:px-8 md:py-16 lg:px-12 lg:py-20">
        {filtered.length === 0 ? (
          savedOnly && savedSlugs.size === 0 ? (
            <p className="py-16 text-center text-[11px] uppercase tracking-[0.25em] text-neutral-400">
              No saved exhibitions yet
            </p>
          ) : (
            <p className="text-[11px] uppercase tracking-[0.25em] text-neutral-400">
              No exhibitions match your filters.
            </p>
          )
        ) : (
          <div className="masonry">
            {filtered.map((exhibition, index) => (
              <ExhibitionCard
                key={exhibition.slug}
                exhibition={exhibition}
                eager={index < 3}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
