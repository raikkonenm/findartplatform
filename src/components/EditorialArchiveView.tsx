"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { DensityToggleButton, type DensityValue } from "./DensityToggleButton";
import { EditorialCard } from "./EditorialCard";
import { Header } from "./Header";
import { useSavedExhibitions } from "./SavedExhibitions";
import {
  editorialSavedKey,
  type EditorialArtist,
} from "@/data/editorial";

export function EditorialArchiveView({ artists }: { artists: EditorialArtist[] }) {
  const { savedSlugs } = useSavedExhibitions();
  const [savedOnly, setSavedOnly] = useState(false);
  const [density, setDensity] = useState<DensityValue>("normal");

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("saved") === "1") {
      // The query string is only available after hydration on this static page.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSavedOnly(true);
    }
  }, []);

  const displayedArtists = savedOnly
    ? artists.filter((artist) => savedSlugs.has(editorialSavedKey(artist.slug)))
    : artists;

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
      <Image
        src="/banner/banner3.webp"
        alt="Editorial featured artwork"
        width={1739}
        height={796}
        sizes="100vw"
        priority
        unoptimized
        className="block h-auto w-full"
      />
      <div className="hidden items-center justify-end border-b border-neutral-200 bg-white px-8 py-4 md:flex lg:px-12">
        <DensityToggleButton
          density={density}
          onCycle={() =>
            setDensity((current) => (current === "normal" ? "dense" : "normal"))
          }
        />
      </div>
      <section className="px-5 py-10 md:px-8 md:py-16 lg:px-12 lg:py-20">
        {displayedArtists.length === 0 ? (
          <p className="py-16 text-center text-[11px] uppercase tracking-[0.25em] text-neutral-400">
            No saved editorial yet
          </p>
        ) : (
          <div
            className={`archive-card-grid grid grid-cols-1 gap-x-12 gap-y-14 md:gap-y-16 ${
              density === "dense"
                ? "md:grid-cols-3 md:gap-x-6 lg:grid-cols-5 lg:gap-x-5"
                : "md:grid-cols-2 lg:grid-cols-3"
            }`}
          >
            {displayedArtists.map((artist, index) => (
              <EditorialCard key={artist.slug} artist={artist} eager={index === 0} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
