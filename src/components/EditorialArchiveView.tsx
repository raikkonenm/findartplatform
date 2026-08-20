"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { DensityToggleButton, type DensityValue } from "./DensityToggleButton";
import { EditorialCard } from "./EditorialCard";
import { Header } from "./Header";
import { LayoutGlyphs, LayoutSection, MobileFilterSheet } from "./MobileFilterSheet";
import { SearchBar } from "./SearchBar";
import { useSavedExhibitions } from "./SavedExhibitions";

type Banner =
  | { type: "video"; src: string; alt: string; duration: number }
  | { type: "image"; src: string; alt: string; duration: number };

const FEATURES_BANNERS: Banner[] = [
  { type: "video", src: "/editorial/banner/1.mp4", alt: "Features banner 1", duration: 7500 },
  { type: "image", src: "/editorial/banner/2.webp", alt: "Features banner 2", duration: 5000 },
  { type: "image", src: "/editorial/banner/3.webp", alt: "Features banner 3", duration: 5000 },
];

function FeaturesBanner() {
  const [active, setActive] = useState(0);
  const pausedRef = useRef(false);
  const count = FEATURES_BANNERS.length;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (pausedRef.current) return;
      setActive((current) => (current + 1) % count);
    }, FEATURES_BANNERS[active].duration);
    return () => window.clearTimeout(timer);
  }, [active, count]);

  return (
    <section aria-label="Features banners" className="relative">
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-neutral-100 md:aspect-[21/9]">
        {FEATURES_BANNERS.map((banner, index) =>
          banner.type === "video" ? (
            <video
              key={banner.src}
              src={banner.src}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              aria-label={banner.alt}
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-out ${
                index === active ? "opacity-100" : "opacity-0"
              }`}
            />
          ) : (
            <Image
              key={banner.src}
              src={banner.src}
              alt={index === 0 ? banner.alt : ""}
              fill
              unoptimized
              sizes="100vw"
              priority={index === 0}
              className={`object-cover transition-opacity duration-700 ease-out ${
                index === active ? "opacity-100" : "opacity-0"
              }`}
            />
          ),
        )}
      </div>
      <div className="absolute inset-x-0 bottom-4 flex justify-center gap-2">
        {FEATURES_BANNERS.map((_, index) => (
          <button
            key={index}
            type="button"
            aria-label={`Show features banner ${index + 1}`}
            aria-current={index === active ? "true" : undefined}
            onClick={() => setActive(index)}
            onMouseEnter={() => {
              pausedRef.current = true;
              setActive(index);
            }}
            onMouseLeave={() => {
              pausedRef.current = false;
            }}
            className={`h-[3px] w-10 transition-colors duration-300 ${
              index === active ? "bg-white" : "bg-white/40"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
import {
  editorialSavedKey,
  type EditorialArtist,
} from "@/data/editorial";

function EditorialSearch({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const expanded = value.length > 0;

  return (
    <label className="group/search flex h-9 cursor-text items-center justify-end text-neutral-500">
      <span className="sr-only">Search articles</span>
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search articles"
        className={`h-9 border-0 border-b border-neutral-300 bg-transparent text-[12px] uppercase tracking-[0.18em] text-neutral-900 transition-[width,opacity] duration-300 ease-out placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none ${
          expanded
            ? "mr-2 w-56 opacity-100"
            : "w-0 opacity-0 group-hover/search:mr-2 group-hover/search:w-56 group-hover/search:opacity-100 group-focus-within/search:mr-2 group-focus-within/search:w-56 group-focus-within/search:opacity-100"
        }`}
      />
      <svg
        viewBox="0 0 20 20"
        className="h-4 w-4 shrink-0 transition-colors duration-200 group-hover/search:text-neutral-900 group-focus-within/search:text-neutral-900"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="1.25" />
        <path d="m12.5 12.5 4 4" stroke="currentColor" strokeWidth="1.25" />
      </svg>
    </label>
  );
}

export function EditorialArchiveView({ artists }: { artists: EditorialArtist[] }) {
  const { savedSlugs } = useSavedExhibitions();
  const [savedOnly, setSavedOnly] = useState(false);
  // Mobile: dense = 2 cols (default), normal = 1 col.
  // Desktop: dense = 5 cols, normal = 3 cols.
  const [density, setDensity] = useState<DensityValue>("dense");
  const [search, setSearch] = useState("");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("saved") === "1") {
      // The query string is only available after hydration on this static page.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSavedOnly(true);
    }
  }, []);

  const savedArtists = savedOnly
    ? artists.filter((artist) => savedSlugs.has(editorialSavedKey(artist.slug)))
    : artists;
  const normalizedSearch = search.trim().toLowerCase();
  const displayedArtists = normalizedSearch
    ? savedArtists.filter((artist) =>
        [artist.artistName, artist.instagramHandle, artist.excerpt, artist.body]
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearch),
      )
    : savedArtists;

  const toggleSavedOnly = () => {
    const next = !savedOnly;
    const url = new URL(window.location.href);
    if (next) url.searchParams.set("saved", "1");
    else url.searchParams.delete("saved");
    window.history.replaceState(null, "", url);
    setSavedOnly(next);
  };

  return (
    <main className="min-h-screen overflow-x-hidden bg-white">
      <Header
        overlay
        savedOnly={savedOnly}
        onToggleSavedOnly={toggleSavedOnly}
        savedHref="/editorial?saved=1"
      />
      <FeaturesBanner />
      <section className="px-5 py-8 md:px-8 md:py-10 lg:px-12 lg:py-12">
        <div className="mb-8 flex items-center justify-between gap-5 md:mb-10">
          <a
            href="https://www.instagram.com/artcnomads/"
            className="text-[11px] uppercase tracking-[0.24em] text-neutral-900 transition-opacity hover:opacity-55"
          >
            By Art Curatorial Nomads &#8599;
          </a>
          <div className="hidden items-center gap-3 md:flex">
            <DensityToggleButton
              density={density}
              onCycle={() =>
                setDensity((current) => (current === "normal" ? "dense" : "normal"))
              }
            />
          </div>
        </div>
        <div className="mb-8 md:hidden">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search articles"
            onFilterClick={() => setMobileFiltersOpen(true)}
          />
        </div>
        {displayedArtists.length === 0 ? (
          <p className="py-16 text-center text-[11px] uppercase tracking-[0.25em] text-neutral-400">
            No saved editorial yet
          </p>
        ) : (
          <div
            className={`archive-card-grid grid gap-y-10 md:gap-y-16 ${
              density === "dense"
                ? "grid-cols-2 gap-x-4 md:grid-cols-3 md:gap-x-5 lg:grid-cols-5"
                : "grid-cols-1 gap-x-6 md:grid-cols-2 md:gap-x-12 lg:grid-cols-3"
            }`}
          >
            {displayedArtists.map((artist, index) => (
              <EditorialCard key={artist.slug} artist={artist} eager={index === 0} />
            ))}
          </div>
        )}
        <p className="mx-auto mt-16 text-center text-[clamp(1.2rem,2.2vw,2rem)] uppercase leading-tight tracking-[0.05em] md:mt-24">
          Read more on the{" "}
          <a
            href="https://www.instagram.com/artcnomads"
            className="font-semibold underline underline-offset-4 transition-opacity hover:opacity-55"
          >
            ArtNomads
          </a>{" "}
          Instagram ↗
        </p>
      </section>
      <MobileFilterSheet
        open={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search articles"
        onClearAll={() => setDensity("dense")}
        resultCount={displayedArtists.length}
      >
        <LayoutSection<DensityValue>
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
