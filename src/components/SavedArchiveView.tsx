"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Exhibition } from "@/data/exhibitions";
import { editorialSavedKey, type EditorialArtist } from "@/data/editorial";
import { artworkSavedKey, buildCollectArtworks } from "@/lib/collectArtworks";
import { CollectArtworkCard } from "./CollectArtworkCard";
import { EditorialCard } from "./EditorialCard";
import { ExhibitionCard } from "./ExhibitionCard";
import { Header } from "./Header";
import {
  OPPORTUNITIES,
  opportunitySavedKey,
  type Opportunity,
} from "./OpportunitiesArchiveView";
import { useSavedExhibitions } from "./SavedExhibitions";

type SavedCategory = "exhibitions" | "editorial" | "artworks" | "opportunities";

function wordsFromEditorial(artist: EditorialArtist): Set<string> {
  return new Set(
    `${artist.artistName} ${artist.excerpt} ${artist.body}`
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((word) => word.length > 5),
  );
}

export function SavedArchiveView({
  exhibitions,
  artists,
  artworkImages,
}: {
  exhibitions: Exhibition[];
  artists: EditorialArtist[];
  artworkImages: string[];
}) {
  const { savedSlugs } = useSavedExhibitions();
  const [selectedCategory, setSelectedCategory] = useState<SavedCategory | null>(null);
  const artworks = useMemo(() => buildCollectArtworks(artworkImages), [artworkImages]);

  const savedExhibitions = exhibitions.filter((exhibition) => savedSlugs.has(exhibition.slug));
  const savedEditorial = artists.filter((artist) => savedSlugs.has(editorialSavedKey(artist.slug)));
  const savedArtworks = artworks.filter((artwork) => savedSlugs.has(artworkSavedKey(artwork.src)));
  const savedOpportunities: Opportunity[] = OPPORTUNITIES.filter((opportunity) =>
    savedSlugs.has(opportunitySavedKey(opportunity.slug)),
  );
  const defaultCategory: SavedCategory = savedExhibitions.length
    ? "exhibitions"
    : savedEditorial.length
      ? "editorial"
      : savedOpportunities.length
        ? "opportunities"
        : savedArtworks.length
          ? "artworks"
          : "exhibitions";
  const activeCategory = selectedCategory ?? defaultCategory;

  const recommendedExhibitions = useMemo(() => {
    const saved = exhibitions.filter((exhibition) => savedSlugs.has(exhibition.slug));
    const tags = new Set(saved.flatMap((exhibition) => exhibition.tags));
    return exhibitions
      .filter((exhibition) => !savedSlugs.has(exhibition.slug))
      .map((exhibition, index) => ({
        exhibition,
        index,
        score: exhibition.tags.filter((tag) => tags.has(tag)).length,
      }))
      .sort((first, second) => second.score - first.score || first.index - second.index)
      .slice(0, 3)
      .map(({ exhibition }) => exhibition);
  }, [exhibitions, savedSlugs]);

  const recommendedEditorial = useMemo(() => {
    const saved = artists.filter((artist) => savedSlugs.has(editorialSavedKey(artist.slug)));
    const savedWords = new Set(saved.flatMap((artist) => Array.from(wordsFromEditorial(artist))));
    return artists
      .filter((artist) => !savedSlugs.has(editorialSavedKey(artist.slug)))
      .map((artist, index) => ({
        artist,
        index,
        score: Array.from(wordsFromEditorial(artist)).filter((word) => savedWords.has(word)).length,
      }))
      .sort((first, second) => second.score - first.score || first.index - second.index)
      .slice(0, 3)
      .map(({ artist }) => artist);
  }, [artists, savedSlugs]);

  const recommendedArtworks = useMemo(() => {
    const saved = artworks.filter((artwork) => savedSlugs.has(artworkSavedKey(artwork.src)));
    const categories = new Set(saved.map((artwork) => artwork.category));
    return artworks
      .filter((artwork) => !savedSlugs.has(artworkSavedKey(artwork.src)))
      .map((artwork) => ({ artwork, score: categories.has(artwork.category) ? 1 : 0 }))
      .sort((first, second) => second.score - first.score || first.artwork.index - second.artwork.index)
      .slice(0, 3)
      .map(({ artwork }) => artwork);
  }, [artworks, savedSlugs]);

  const counts: Record<SavedCategory, number> = {
    exhibitions: savedExhibitions.length,
    editorial: savedEditorial.length,
    artworks: savedArtworks.length,
    opportunities: savedOpportunities.length,
  };
  const recommendations =
    activeCategory === "exhibitions"
      ? recommendedExhibitions
      : activeCategory === "editorial"
        ? recommendedEditorial
        : recommendedArtworks;

  return (
    <main className="min-h-screen overflow-x-hidden bg-white pt-[65px]">
      <Header />
      <section className="px-5 pb-20 pt-8 md:px-8 md:pt-10 lg:px-12">
        <h1 className="editorial-serif text-[clamp(2rem,6vw,4.5rem)] leading-none tracking-[-0.045em]">
          Saved
        </h1>

        <div className="mt-8 flex flex-wrap items-center gap-6 md:mt-10">
          {(["exhibitions", "editorial", "opportunities", "artworks"] as const).map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setSelectedCategory(category)}
              className={`text-[10px] uppercase tracking-[0.18em] transition-colors ${
                activeCategory === category
                  ? "font-semibold text-[var(--foreground)]"
                  : "text-neutral-500 hover:text-neutral-900"
              }`}
            >
              {category} ({counts[category]})
            </button>
          ))}
        </div>

        <div className="mt-8 md:mt-10">
          {activeCategory === "exhibitions" &&
            (savedExhibitions.length ? (
              <div className="archive-card-grid grid grid-cols-1 gap-x-12 gap-y-16 md:grid-cols-2 lg:grid-cols-3">
                {savedExhibitions.map((exhibition) => (
                  <ExhibitionCard key={exhibition.slug} exhibition={exhibition} />
                ))}
              </div>
            ) : (
              <p className="py-16 text-center text-[11px] uppercase tracking-[0.2em] text-neutral-400">
                No saved exhibitions yet
              </p>
            ))}

          {activeCategory === "editorial" &&
            (savedEditorial.length ? (
              <div className="archive-card-grid grid grid-cols-1 gap-x-12 gap-y-16 md:grid-cols-2 lg:grid-cols-3">
                {savedEditorial.map((artist) => (
                  <EditorialCard key={artist.slug} artist={artist} />
                ))}
              </div>
            ) : (
              <p className="py-16 text-center text-[11px] uppercase tracking-[0.2em] text-neutral-400">
                No saved editorial yet
              </p>
            ))}

          {activeCategory === "artworks" &&
            (savedArtworks.length ? (
              <div className="grid grid-cols-1 gap-x-12 gap-y-16 md:grid-cols-2 lg:grid-cols-3">
                {savedArtworks.map((artwork) => (
                  <CollectArtworkCard key={artwork.src} artwork={artwork} columns={3} />
                ))}
              </div>
            ) : (
              <p className="py-16 text-center text-[11px] uppercase tracking-[0.2em] text-neutral-400">
                No saved artworks yet
              </p>
            ))}

          {activeCategory === "opportunities" &&
            (savedOpportunities.length ? (
              <ul className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-5 lg:grid-cols-3">
                {savedOpportunities.map((opportunity) => (
                  <li key={opportunity.slug}>
                    <Link
                      href={`/opportunities?opp=${opportunity.slug}`}
                      className="group flex h-full flex-col border border-[var(--border)] p-4 transition-colors hover:border-neutral-500 md:p-5"
                    >
                      <p className="text-[9px] uppercase tracking-[0.2em] text-neutral-500 md:text-[10px]">
                        {opportunity.organizer}
                      </p>
                      <h3 className="editorial-serif mt-4 break-words text-[clamp(1.15rem,4vw,1.5rem)] leading-[1.05] tracking-[-0.03em] text-neutral-900 transition-opacity group-hover:opacity-75 md:text-[clamp(1.2rem,2vw,1.6rem)]">
                        {opportunity.title}
                      </h3>
                      <div className="mt-auto grid grid-cols-2 gap-3 pt-6 text-[11px] leading-relaxed text-neutral-700 md:text-[12px]">
                        <div>
                          <p className="text-[8px] uppercase tracking-[0.2em] text-neutral-500 md:text-[9px]">Deadline</p>
                          <p>{opportunity.deadline}</p>
                        </div>
                        <div>
                          <p className="text-[8px] uppercase tracking-[0.2em] text-neutral-500 md:text-[9px]">Location</p>
                          <p>{opportunity.location}</p>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="py-16 text-center text-[11px] uppercase tracking-[0.2em] text-neutral-400">
                No saved opportunities yet
              </p>
            ))}
        </div>

        {savedSlugs.size > 0 && recommendations.length > 0 && (
          <section className="mt-20 border-t border-neutral-200 pt-10 md:mt-24 md:pt-12">
            <h2 className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">
              You might be interested
            </h2>
            <div className="mt-8 grid grid-cols-1 gap-x-12 gap-y-16 md:grid-cols-3">
              {activeCategory === "exhibitions" &&
                recommendedExhibitions.map((exhibition) => (
                  <ExhibitionCard key={exhibition.slug} exhibition={exhibition} />
                ))}
              {activeCategory === "editorial" &&
                recommendedEditorial.map((artist) => (
                  <EditorialCard key={artist.slug} artist={artist} />
                ))}
              {activeCategory === "artworks" &&
                recommendedArtworks.map((artwork) => (
                  <CollectArtworkCard key={artwork.src} artwork={artwork} columns={3} />
                ))}
            </div>
          </section>
        )}
      </section>
    </main>
  );
}
