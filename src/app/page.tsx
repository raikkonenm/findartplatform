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
      className={`border px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] transition-colors ${
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
        className="flex items-center gap-2 border border-neutral-200 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-neutral-700 transition-colors hover:border-neutral-400"
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
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((isOpen) => !isOpen)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className={`border px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] transition-colors ${
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
          className="absolute left-0 top-full z-30 mt-2 w-[min(34rem,calc(100vw-2.5rem))] border border-neutral-200 bg-white p-3 shadow-[0_4px_14px_rgba(0,0,0,0.05)] sm:p-4"
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
      <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white px-5 py-3 sm:px-8 lg:px-12">
        <nav
          className="grid grid-cols-[1fr_auto_1fr] items-center"
          aria-label="Primary navigation"
        >
          <div className="flex items-center gap-7 justify-self-start text-[11px] uppercase tracking-[0.28em] text-neutral-900">
            <span>By ArtNomad Curators &#8599;</span>
            <span>Practice &#8599;</span>
          </div>
          <Link
            href="/"
            className="flex flex-col items-center justify-self-center text-center text-2xl font-medium leading-none tracking-tight text-neutral-900 transition-opacity hover:opacity-55"
            aria-label="FindArt Platform home"
          >
            <span>FindArt Platform</span>
            <span className="pointer-events-none mt-[6px] hidden whitespace-nowrap text-[10px] font-normal leading-none tracking-[0.12em] text-black/40 sm:block">
              Contemporary Art Exhibitions Worldwide
            </span>
          </Link>
          <div className="flex items-center gap-5 justify-self-end">
            <Link
              href="/submit"
              className="text-[11px] uppercase tracking-[0.28em] text-neutral-900 transition-opacity hover:opacity-55"
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
        <section className="bg-white px-5 pb-8 pt-5 sm:px-8 sm:pt-6 lg:px-12">
          <div className="relative h-[320px] max-h-[360px] overflow-hidden sm:h-[340px] lg:h-[360px]">
            <div className="absolute inset-0 grid grid-cols-3">
              {featuredExhibition.images.slice(0, 3).map((image, index) => (
                <div key={image.src} className="relative h-full bg-neutral-100">
                  <Image
                    src={image.src}
                    alt={`${featuredExhibition.title} exhibition view ${index + 1}`}
                    fill
                    className={`object-cover ${index === 2 ? "object-[45%_center]" : "object-center"}`}
                    sizes="33vw"
                  />
                </div>
              ))}
            </div>

            <div className="absolute inset-y-0 left-0 w-[58%] bg-[linear-gradient(90deg,rgba(255,255,255,0.92)_0%,rgba(255,255,255,0.82)_45%,rgba(255,255,255,0)_100%)] sm:w-[48%] lg:w-[40%]" />

            <div className="absolute inset-y-0 left-0 flex max-w-lg -translate-y-2 flex-col justify-center px-7 py-8 sm:px-10 lg:px-[60px]">
              <p className="text-[10px] uppercase tracking-[0.28em] text-neutral-600">
                Exhibition of the Week
              </p>
              <h2 className="mt-4 text-[clamp(2.25rem,4vw,3.5rem)] font-medium leading-none tracking-[-0.045em] text-neutral-900">
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
                className="mt-6 inline-flex w-fit border border-neutral-900 bg-white/70 px-5 py-3 text-[10px] uppercase tracking-[0.24em] text-neutral-900 transition-opacity hover:opacity-55"
              >
                View Exhibition
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Filter bar */}
      <div className="border-b border-neutral-200 bg-white px-5 py-3 sm:px-8 lg:px-12">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
            {/* City filter */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-[0.25em] text-neutral-400">City:</span>
              <CityDropdown value={city} options={cityOptions} onChange={setCity} />
            </div>

            {/* Year filter */}
            <div className="flex flex-wrap items-center gap-2">
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
              className="ml-auto border-0 border-b border-neutral-300 bg-transparent pb-1 text-[12px] text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none sm:w-56"
            />
          </div>

          <div className="flex flex-wrap items-start gap-2">
            <span className="pt-1.5 text-[10px] uppercase tracking-[0.25em] text-neutral-400">
              Tags:
            </span>
            {PRIMARY_TAGS.map((filterTag) => (
              <FilterChip
                key={filterTag}
                label={filterTag}
                active={tag === filterTag}
                onClick={() => selectTag(filterTag)}
              />
            ))}
            <MoreTagsDropdown value={tag} onChange={selectTag} />
          </div>
        </div>
      </div>

      {/* Exhibition feed — CSS columns provides masonry without JS. Cards have
          their own `mb-[72px]` for row rhythm and `break-inside-avoid` to stay
          intact across column boundaries. */}
      <section className="bg-white px-5 py-12 sm:px-8 sm:py-16 lg:px-12 lg:py-20">
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
