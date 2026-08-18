"use client";

import Image from "next/image";
import type { CollectArtwork } from "@/lib/collectArtworks";
import { artworkSavedKey } from "@/lib/collectArtworks";
import { HeartIcon, useSavedExhibitions } from "./SavedExhibitions";

const DESKTOP_ASPECTS = ["3 / 4", "4 / 5", "1 / 1"];

const WORK_TITLES = [
  "Untitled",
  "Silent Field",
  "Interior Study",
  "Passage",
  "Second Skin",
  "Fragment",
  "Nocturne",
  "Threshold",
  "Ephemera",
  "After the Rain",
  "Pale Light",
  "Undertow",
  "Companion",
  "Landmark",
  "Interval",
];

function workTitleFor(index: number): string {
  return WORK_TITLES[index % WORK_TITLES.length];
}

function workYearFor(index: number): number {
  return 2023 + (index % 3);
}

export function CollectArtworkCard({
  artwork,
  columns = 4,
  className = "",
}: {
  artwork: CollectArtwork;
  columns?: 2 | 3 | 4;
  className?: string;
}) {
  const { isSaved, toggleSaved } = useSavedExhibitions();
  const savedKey = artworkSavedKey(artwork.src);
  const saved = isSaved(savedKey);

  const title = workTitleFor(artwork.index);
  const year = workYearFor(artwork.index);

  return (
    <article
      tabIndex={0}
      aria-label={`${title} by Chungkook Lee, ${year}`}
      className={`group relative outline-none ${className}`}
    >
      <div
        className="relative aspect-[3/4] overflow-hidden bg-neutral-100 md:[aspect-ratio:var(--card-aspect)] md:aspect-auto"
        style={{ ["--card-aspect" as string]: DESKTOP_ASPECTS[artwork.index % DESKTOP_ASPECTS.length] }}
      >
        <Image
          src={artwork.src}
          alt={`${title} by Chungkook Lee, ${year}`}
          fill
          unoptimized
          loading="lazy"
          sizes={
            columns === 4
              ? "(min-width: 1024px) 23vw, 47vw"
              : columns === 3
                ? "(min-width: 1024px) 31vw, (min-width: 640px) 47vw, 100vw"
                : "(min-width: 1024px) 47vw, (min-width: 640px) 47vw, 100vw"
          }
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
        />
        <button
          type="button"
          aria-label={saved ? `Remove ${title} from saved artworks` : `Save ${title}`}
          aria-pressed={saved}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            toggleSaved(savedKey);
          }}
          className={`absolute right-3 top-3 z-10 text-neutral-900 transition-opacity duration-200 hover:opacity-60 focus-visible:opacity-100 focus-visible:outline-none ${
            saved ? "opacity-100" : "opacity-100 md:opacity-0 md:group-hover:opacity-100"
          }`}
        >
          <HeartIcon filled={saved} className="h-4 w-4" />
        </button>
      </div>
      <div className="pt-2.5 md:pt-3">
        <p className="text-[12px] font-medium leading-tight text-neutral-900 md:text-[13px]">
          Chungkook Lee
        </p>
        <p className="mt-1 text-[11px] leading-snug text-neutral-500 md:text-[12px]">
          <span className="italic">{title}</span>, {year}
        </p>
        <p className="mt-1 text-[11px] leading-snug text-neutral-500 md:text-[12px]">
          Price on request
        </p>
      </div>
    </article>
  );
}
