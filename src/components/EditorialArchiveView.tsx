"use client";

import { useEffect, useState } from "react";
import { DensityToggleButton, type DensityValue } from "./DensityToggleButton";
import { EditorialCard } from "./EditorialCard";
import { Header } from "./Header";
import { useSavedExhibitions } from "./SavedExhibitions";
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
  const [density, setDensity] = useState<DensityValue>("dense");
  const [search, setSearch] = useState("");

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
    <main className="min-h-screen overflow-x-hidden bg-white pt-[65px]">
      <Header
        savedOnly={savedOnly}
        onToggleSavedOnly={toggleSavedOnly}
        savedHref="/editorial?saved=1"
      />
      <section className="px-5 py-8 md:px-8 md:py-10 lg:px-12 lg:py-12">
        <div className="mb-8 flex items-center justify-between gap-5 md:mb-10">
          <a
            href="https://www.instagram.com/artcnomads/"
            className="text-[11px] uppercase tracking-[0.24em] text-neutral-900 transition-opacity hover:opacity-55"
          >
            By Art Curatorial Nomads &#8599;
          </a>
          <div className="hidden items-center gap-3 md:flex">
            <EditorialSearch value={search} onChange={setSearch} />
            <DensityToggleButton
              density={density}
              onCycle={() =>
                setDensity((current) => (current === "normal" ? "dense" : "normal"))
              }
            />
          </div>
        </div>
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search articles"
          className="mb-8 w-full border-0 border-b border-neutral-300 bg-transparent pb-2 text-[12px] uppercase tracking-[0.18em] text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none md:hidden"
        />
        {displayedArtists.length === 0 ? (
          <p className="py-16 text-center text-[11px] uppercase tracking-[0.25em] text-neutral-400">
            No saved editorial yet
          </p>
        ) : (
          <div
            className={`archive-card-grid grid grid-cols-1 gap-y-14 md:gap-y-16 ${
              density === "dense"
                ? "gap-x-5 md:grid-cols-3 lg:grid-cols-5"
                : "gap-x-12 md:grid-cols-2 lg:grid-cols-3"
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
    </main>
  );
}
