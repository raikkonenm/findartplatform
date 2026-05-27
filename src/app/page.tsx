"use client";

import { Suspense, useCallback, useState, useMemo, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { exhibitions, semanticTags, type SemanticTag } from "@/data/exhibitions";
import { ExhibitionCard } from "@/components/ExhibitionCard";
import { HeartIcon, useSavedExhibitions } from "@/components/SavedExhibitions";
import { MobileNavigationMenu } from "@/components/MobileNavigationMenu";
import { displayExhibitionTitle } from "@/lib/displayExhibitionTitle";

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
];
type SelectedTag = "ALL" | SemanticTag;
const FEATURED_SLUG = "lullaby-blossoms";

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
  const featuredExhibition = exhibitions.find((exhibition) => exhibition.slug === FEATURED_SLUG);
  const featuredTitle = featuredExhibition ? displayExhibitionTitle(featuredExhibition.title) : "";

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
            <a href="https://www.artcnomad.com/practice">Practice &#8599;</a>
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
              href="/submit"
              className="text-[9px] font-medium uppercase tracking-[0.16em] text-neutral-900 transition-opacity hover:opacity-55 md:text-[11px] md:tracking-[0.28em]"
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
                    alt={`${featuredTitle} exhibition view ${index + 1}`}
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
                {featuredTitle.toUpperCase()}
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
            {/* Search */}
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search exhibitions..."
              className="w-full border-0 border-b border-neutral-300 bg-transparent pb-2 text-[12px] text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none md:hidden"
            />

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
                eager={index < 3}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
