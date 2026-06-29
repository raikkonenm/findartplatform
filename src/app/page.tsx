"use client";

import { Suspense, useCallback, useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { exhibitions, semanticTags, type SemanticTag } from "@/data/exhibitions";
import { ExhibitionCard } from "@/components/ExhibitionCard";
import { HeartIcon, useSavedExhibitions } from "@/components/SavedExhibitions";
import { MobileNavigationMenu } from "@/components/MobileNavigationMenu";
import { displayExhibitionTitle } from "@/lib/displayExhibitionTitle";
import { SHOW_PRACTICE_NAV } from "@/lib/navFlags";

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
];
const MORE_TAGS: SemanticTag[] = [
  "GROUP SHOW",
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
  "BODY",
  "MACHINE",
  "TEXTILE",
  "RUINS",
  "ARCHIVE",
  "FRAGMENT",
  "MEMORY",
  "POST-INDUSTRIAL",
  "OBJECTHOOD",
  "SPIRITUALITY",
  "FEMININITY",
  "LABOR",
  "TECHNOLOGY",
  "SPECULATIVE BODY",
  "ARCHAEOLOGY",
  "ABSENCE",
  "MATERIAL MEMORY",
  "DOMESTICITY",
  "ANIMALITY",
  "EROSION",
  "PHOTOGRAPHY",
  "DISPLACEMENT",
];
type SelectedTag = "ALL" | SemanticTag;

// Hierarchical location filter: "all" / by country / by specific city
// inside a country.
type LocationValue =
  | { kind: "all" }
  | { kind: "country"; country: string }
  | { kind: "city"; country: string; city: string };

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

// LOCATION dropdown — countries listed first, with a plus-icon expander on
// each country revealing its cities inline. Clicking the country header
// filters to that country; clicking a city filters to that city only.
function LocationDropdown({
  value,
  tree,
  onChange,
}: {
  value: LocationValue;
  tree: Array<{ country: string; cities: string[] }>;
  onChange: (next: LocationValue) => void;
}) {
  const [open, setOpen] = useState(false);
  const [expandedCountries, setExpandedCountries] = useState<Set<string>>(() => {
    // Auto-expand the currently selected country so the active city is visible.
    if (value.kind === "city" || value.kind === "country") {
      return new Set([value.country]);
    }
    return new Set();
  });
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

  const label = (() => {
    if (value.kind === "all") return "All locations";
    if (value.kind === "country") return value.country;
    return `${value.city}, ${value.country}`;
  })();

  const toggleCountryExpand = (country: string) => {
    setExpandedCountries((prev) => {
      const next = new Set(prev);
      if (next.has(country)) next.delete(country);
      else next.add(country);
      return next;
    });
  };

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
        <div
          role="listbox"
          aria-label="Locations"
          className="absolute left-0 top-full z-30 mt-1 max-h-[28rem] w-60 overflow-y-auto border border-neutral-200 bg-white"
        >
          <button
            type="button"
            onClick={() => {
              onChange({ kind: "all" });
              setOpen(false);
            }}
            className={`flex w-full items-center justify-between border-b border-neutral-100 px-3 py-2 text-left text-[10px] uppercase tracking-[0.18em] transition-colors hover:bg-neutral-50 ${
              value.kind === "all" ? "text-neutral-900" : "text-neutral-500"
            }`}
          >
            <span>All locations</span>
            {value.kind === "all" && (
              <svg className="h-2.5 w-3 shrink-0" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M2 6l3 3 5-6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
          <ul role="group">
            {tree.map(({ country, cities }) => {
              const expanded = expandedCountries.has(country);
              const countryActive = value.kind === "country" && value.country === country;
              return (
                <li key={country} className="border-b border-neutral-100 last:border-0">
                  <div className="flex items-stretch">
                    <button
                      type="button"
                      onClick={() => {
                        onChange({ kind: "country", country });
                        // Keep country expanded so the user can drill into a
                        // city without re-clicking the +
                        setExpandedCountries((prev) => {
                          const next = new Set(prev);
                          next.add(country);
                          return next;
                        });
                      }}
                      className={`flex flex-1 items-center justify-between px-3 py-2 text-left text-[10px] uppercase tracking-[0.18em] transition-colors hover:bg-neutral-50 ${
                        countryActive ? "text-neutral-900" : "text-neutral-600"
                      }`}
                    >
                      <span>{country}</span>
                      {countryActive && (
                        <svg className="h-2.5 w-3 shrink-0" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                          <path d="M2 6l3 3 5-6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </button>
                    {cities.length > 0 && (
                      <button
                        type="button"
                        onClick={() => toggleCountryExpand(country)}
                        aria-label={expanded ? `Collapse ${country}` : `Expand ${country}`}
                        aria-expanded={expanded}
                        className="flex shrink-0 items-center justify-center px-3 text-neutral-500 transition-colors hover:bg-neutral-50 hover:text-neutral-900"
                      >
                        <span aria-hidden="true" className="text-[14px] leading-none">
                          {expanded ? "−" : "+"}
                        </span>
                      </button>
                    )}
                  </div>
                  {expanded && cities.length > 0 && (
                    <ul role="group" aria-label={`${country} cities`}>
                      {cities.map((city) => {
                        const cityActive =
                          value.kind === "city" &&
                          value.country === country &&
                          value.city === city;
                        return (
                          <li key={`${country}/${city}`}>
                            <button
                              type="button"
                              onClick={() => {
                                onChange({ kind: "city", country, city });
                                setOpen(false);
                              }}
                              className={`flex w-full items-center justify-between py-1.5 pl-7 pr-3 text-left text-[10px] uppercase tracking-[0.18em] transition-colors hover:bg-neutral-50 ${
                                cityActive ? "text-neutral-900" : "text-neutral-500"
                              }`}
                            >
                              <span>{city}</span>
                              {cityActive && (
                                <svg className="h-2.5 w-3 shrink-0" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                                  <path d="M2 6l3 3 5-6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              )}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

function MobileTagsDropdown({
  value,
  onChange,
}: {
  value: SelectedTag;
  onChange: (tag: SelectedTag) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const tags: SelectedTag[] = ["ALL", ...semanticTags];

  useEffect(() => {
    if (!open) return;

    function onMouseDown(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative md:hidden">
      <button
        type="button"
        onClick={() => setOpen((isOpen) => !isOpen)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className={`flex w-full items-center justify-between border px-3 py-2 text-[10px] uppercase tracking-[0.2em] transition-colors ${
          value === "ALL" ? "border-neutral-200 text-neutral-500" : "border-neutral-900 text-neutral-900"
        }`}
      >
        <span>Tags</span>
        <span aria-hidden="true">&#9662;</span>
      </button>
      {open && (
        <ul
          role="listbox"
          aria-label="Tags"
          className="absolute inset-x-0 top-full z-30 mt-1 max-h-[min(60vh,28rem)] overflow-y-auto border border-neutral-200 bg-white"
        >
          {tags.map((filterTag) => {
            const active = value === filterTag;
            return (
              <li key={filterTag} role="option" aria-selected={active}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(active && filterTag !== "ALL" ? "ALL" : filterTag);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between px-3 py-2.5 text-left text-[10px] uppercase tracking-[0.18em] transition-colors hover:bg-neutral-50 ${
                    active ? "text-neutral-900" : "text-neutral-500"
                  }`}
                >
                  <span>{filterTag}</span>
                  {active && <span aria-hidden="true">&#10003;</span>}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();
  const { savedSlugs } = useSavedExhibitions();
  const [location, setLocation] = useState<LocationValue>({ kind: "all" });
  const [year, setYear] = useState("All");
  const [tag, setTag] = useState<SelectedTag>("ALL");
  const [tagsExpanded, setTagsExpanded] = useState(false);
  const [savedOnly, setSavedOnly] = useState(false);
  const [search, setSearch] = useState("");
  // Mobile-only: collapse Location/Year/Tags behind a single FILTERS toggle.
  // Desktop ignores this and always shows the rows.
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

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

  // Build the country → cities tree once. Both keys are sorted alphabetically.
  const locationTree = useMemo(() => {
    const byCountry = new Map<string, Set<string>>();
    for (const exhibition of exhibitions) {
      const country = exhibition.country?.trim();
      if (!country) continue;
      if (!byCountry.has(country)) {
        byCountry.set(country, new Set());
      }
      if (exhibition.city?.trim()) {
        byCountry.get(country)!.add(exhibition.city.trim());
      }
    }
    return Array.from(byCountry.entries())
      .map(([country, cities]) => ({
        country,
        cities: Array.from(cities).sort((a, b) => a.localeCompare(b)),
      }))
      .sort((a, b) => a.country.localeCompare(b.country));
  }, []);

  const filtered = useMemo(
    () =>
      exhibitions.filter((ex) => {
        const matchLocation = (() => {
          if (location.kind === "all") return true;
          if (location.kind === "country") return ex.country === location.country;
          return ex.country === location.country && ex.city === location.city;
        })();
        const matchYear = year === "All" || ex.year === year;
        const matchTag = tag === "ALL" || ex.tags.includes(tag);
        const matchSaved = !savedOnly || savedSlugs.has(ex.slug);
        const q = search.toLowerCase();
        const matchSearch =
          !q ||
          [
            displayExhibitionTitle(ex.title),
            ex.city,
            ex.country,
            ex.venue,
            ex.gallery,
            ex.description,
            ex.summary,
            ...(ex.artists ?? []),
          ].some((f) => f?.toLowerCase().includes(q));
        return matchLocation && matchYear && matchTag && matchSaved && matchSearch;
      }),
    [location, year, tag, savedOnly, savedSlugs, search],
  );

  const showsMoreTagSelected = tag !== "ALL" && (MORE_TAGS as readonly SelectedTag[]).includes(tag);

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
          <MobileNavigationMenu />
          <div className="hidden max-w-[5.3rem] flex-col items-start gap-1 text-[8px] uppercase leading-[1.35] tracking-[0.14em] text-neutral-900 md:flex md:max-w-none md:flex-row md:items-center md:gap-7 md:text-[11px] md:tracking-[0.28em]">
            <a href="https://www.artcnomad.com/">By ArtNomad Curators &#8599;</a>
            <a href="https://www.artcnomad.com/workflow-art">Workflow.Art &#8599;</a>
            {SHOW_PRACTICE_NAV && (
              <a href="https://www.artcnomad.com/practice">Practice &#8599;</a>
            )}
          </div>
          <Link
            href="/"
            className="absolute left-1/2 flex -translate-x-1/2 flex-col items-center whitespace-nowrap text-center text-[13px] font-medium leading-none tracking-tight text-neutral-900 transition-opacity hover:opacity-55 md:static md:translate-x-0 md:justify-self-center md:text-2xl"
            aria-label="FindArt Platform home"
          >
            <span>FindArt Platform</span>
            <span className="pointer-events-none mt-[6px] hidden whitespace-nowrap text-[10px] font-normal leading-none tracking-[0.12em] text-black/40 md:block">
              Contemporary Art Exhibition Archive
            </span>
          </Link>
          <div className="flex items-center gap-3 justify-self-end md:gap-5">
            <Link
              href="/about"
              className="hidden text-[9px] font-normal uppercase tracking-[0.16em] text-neutral-900 transition-opacity hover:opacity-55 md:inline md:text-[11px] md:tracking-[0.28em]"
            >
              About
            </Link>
            <a
              href="https://www.instagram.com/findart.platform/"
              className="hidden text-[9px] font-normal uppercase tracking-[0.16em] text-neutral-900 transition-opacity hover:opacity-55 md:inline md:text-[11px] md:tracking-[0.28em]"
            >
              Instagram
            </a>
            <Link
              href="/submit"
              className="text-[9px] font-semibold uppercase tracking-[0.16em] text-neutral-900 transition-opacity hover:opacity-55 md:text-[11px] md:tracking-[0.28em]"
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

      <section className="bg-white px-5 pb-6 pt-4 md:px-8 md:pb-8 md:pt-6 lg:px-12">
        <div className="mx-auto grid max-w-[1600px] grid-cols-1 items-center gap-10 md:grid-cols-[minmax(0,45fr)_minmax(0,55fr)] md:gap-20">
          <div className="min-w-0">
            <h1 className="mb-2 break-words text-[16px] font-medium leading-[1.05] tracking-[-0.04em] text-neutral-900 md:mb-0 md:text-[48px] md:leading-none md:tracking-[-0.055em]">
              WORKFLOW.ART
            </h1>
            <p className="mt-2 max-w-xl text-[14px] leading-[20px] text-neutral-900 opacity-80 md:mt-4 md:text-[1.35rem] md:leading-8 md:opacity-100">
              Workspace for artists, curators and art projects
            </p>
            <p className="mt-4 max-w-lg text-[0.98rem] leading-7 text-neutral-600 md:mt-5 md:text-[1.05rem] md:leading-8">
              Organize your studio, plan exhibitions, manage tasks and collaborate with ease.
            </p>
            <p className="mt-8 text-[10px] uppercase tracking-[0.28em] text-neutral-500">
              Developed by Art Curatorial Nomads
            </p>
            <a
              href="https://www.artcnomad.com/workflow-art"
              target="_blank"
              rel="noreferrer"
              className="mt-8 inline-flex min-h-11 w-full items-center justify-center border border-neutral-900 px-5 py-3 text-[10px] uppercase tracking-[0.24em] text-neutral-900 transition-colors hover:bg-neutral-950 hover:text-white md:w-fit"
            >
              Get Access
            </a>
          </div>
          <div className="min-w-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/banner/workflow.webp"
              alt="Workflow.Art interface preview"
              width={1920}
              height={880}
              loading="eager"
              fetchPriority="high"
              decoding="async"
              className="block h-auto w-full"
            />
          </div>
        </div>
      </section>

      {/* Filter bar */}
      <div className="border-b border-neutral-200 bg-white px-5 py-4 md:px-8 md:py-3 lg:px-12">
        <div className="space-y-4 md:space-y-3">
          {/* Mobile search — always visible above the FILTERS toggle. */}
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search exhibitions..."
            className="w-full border-0 border-b border-neutral-300 bg-transparent pb-2 text-[12px] text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none md:hidden"
          />

          {/* Mobile-only FILTERS toggle. On desktop the filter rows below are
              always visible, so this button is hidden. */}
          <button
            type="button"
            onClick={() => setMobileFiltersOpen((open) => !open)}
            aria-expanded={mobileFiltersOpen}
            aria-controls="mobile-filters-panel"
            className="flex w-full items-center justify-between border border-neutral-200 px-3 py-2 text-[10px] uppercase tracking-[0.22em] text-neutral-700 transition-colors hover:border-neutral-400 md:hidden"
          >
            <span>Filters</span>
            <span aria-hidden="true">{mobileFiltersOpen ? "−" : "+"}</span>
          </button>

          {/* Collapsible filter panel — hidden on mobile when collapsed,
              always visible on desktop. */}
          <div
            id="mobile-filters-panel"
            className={`${mobileFiltersOpen ? "block" : "hidden"} space-y-4 md:!block md:space-y-3`}
          >
            <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center md:gap-x-8 md:gap-y-2">
              {/* Location filter (countries → cities) */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-[0.25em] text-neutral-400">Location:</span>
                <LocationDropdown value={location} tree={locationTree} onChange={setLocation} />
              </div>

              {/* Year filter */}
              <div className="scrollbar-none flex min-w-0 items-center gap-2 overflow-x-auto pb-1 md:flex-wrap md:overflow-visible md:pb-0">
                <span className="text-[10px] uppercase tracking-[0.25em] text-neutral-400">Year:</span>
                {YEARS.map((y) => (
                  <FilterChip key={y} label={y} active={year === y} onClick={() => setYear(y)} />
                ))}
              </div>
            </div>

            <MobileTagsDropdown value={tag} onChange={selectTag} />
          </div>

          {/* Desktop tags — primary chips always shown, MORE chips expand
              inline (no floating dropdown). MORE auto-expands when the
              currently selected tag belongs to MORE_TAGS so the chip is
              visible to the user. */}
          <div className="hidden min-w-0 items-start gap-2 md:flex">
            <span className="shrink-0 pt-1.5 text-[10px] uppercase tracking-[0.25em] text-neutral-400">
              Tags:
            </span>
            <div className="scrollbar-none flex min-w-0 flex-1 flex-wrap gap-2 overflow-x-auto pb-1 md:overflow-visible md:pb-0">
              {PRIMARY_TAGS.map((filterTag) => (
                <FilterChip
                  key={filterTag}
                  label={filterTag}
                  active={tag === filterTag}
                  onClick={() => selectTag(filterTag)}
                />
              ))}
              {(tagsExpanded || showsMoreTagSelected) &&
                MORE_TAGS.map((moreTag) => (
                  <FilterChip
                    key={moreTag}
                    label={moreTag}
                    active={tag === moreTag}
                    onClick={() => selectTag(moreTag)}
                  />
                ))}
              <button
                type="button"
                onClick={() => setTagsExpanded((expanded) => !expanded)}
                aria-expanded={tagsExpanded || showsMoreTagSelected}
                className="shrink-0 border border-neutral-200 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-neutral-500 transition-colors hover:border-neutral-400 hover:text-neutral-700"
              >
                {tagsExpanded || showsMoreTagSelected ? "- Less" : "+ More"}
              </button>
            </div>
          </div>

          <div className="hidden pt-1 md:block">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search exhibitions..."
              className="h-11 w-full border-0 border-b border-neutral-300 bg-transparent text-[12px] uppercase tracking-[0.18em] text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none"
            />
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
                eager={index === 0}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
