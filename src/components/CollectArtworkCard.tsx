"use client";

import Image from "next/image";
import type { CollectArtwork } from "@/lib/collectArtworks";
import { artworkSavedKey } from "@/lib/collectArtworks";
import { HeartIcon, useSavedExhibitions } from "./SavedExhibitions";

const ASPECT_CLASSES = ["aspect-[3/4]", "aspect-[4/5]", "aspect-square"];

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

  return (
    <article
      tabIndex={0}
      aria-label={`Name by Chungkook Lee, artwork ${artwork.index + 1}`}
      className={`group relative overflow-hidden bg-neutral-100 outline-none ${className}`}
    >
      <div className={`relative ${ASPECT_CLASSES[artwork.index % ASPECT_CLASSES.length]}`}>
        <Image
          src={artwork.src}
          alt={`Name by Chungkook Lee, artwork ${artwork.index + 1}`}
          fill
          unoptimized
          loading="lazy"
          sizes={
            columns === 4
              ? "(min-width: 1024px) 23vw, (min-width: 640px) 47vw, 100vw"
              : columns === 3
                ? "(min-width: 1024px) 31vw, (min-width: 640px) 47vw, 100vw"
                : "(min-width: 1024px) 47vw, (min-width: 640px) 47vw, 100vw"
          }
          className="object-cover"
        />
      </div>
      <div className="archive-card-copy bg-white pt-4">
        <h2 className="editorial-serif break-words text-[clamp(0.9rem,4vw,1.3rem)] uppercase leading-[1.08] tracking-[-0.035em] md:text-[2rem] md:leading-[1.04]">
          CHUNKOOK LEE
        </h2>
      </div>
      <button
        type="button"
        aria-label={saved ? "Remove Name from saved artworks" : "Save Name"}
        aria-pressed={saved}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          toggleSaved(savedKey);
        }}
        className={`absolute right-4 top-4 z-10 text-neutral-900 transition-opacity duration-200 hover:opacity-60 focus-visible:opacity-100 focus-visible:outline-none ${
          saved ? "opacity-100" : "opacity-100 md:opacity-0 md:group-hover:opacity-100"
        }`}
      >
        <HeartIcon filled={saved} className="h-5 w-5" />
      </button>
      <div className="absolute inset-x-0 bottom-0 translate-y-3 bg-black/90 px-4 py-4 text-white opacity-0 transition-[opacity,transform] duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100 md:px-5 md:py-5">
        <p className="text-[18px] leading-tight md:text-[20px]">Name</p>
        <p className="mt-3 text-[11px] font-medium uppercase tracking-[0.18em]">
          CHUNKOOK LEE
        </p>
        <p className="mt-1 text-[12px] tracking-[0.05em] text-white/80">
          Price by request
        </p>
      </div>
    </article>
  );
}
