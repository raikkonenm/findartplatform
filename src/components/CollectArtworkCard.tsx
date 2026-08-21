"use client";

import Image from "next/image";
import type { CollectArtwork } from "@/lib/collectArtworks";

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

  const title = workTitleFor(artwork.index);
  const year = workYearFor(artwork.index);

  return (
    <article
      tabIndex={0}
      aria-label={`${title} by Chungkook Lee, ${year}`}
      className={`group relative outline-none ${className}`}
    >
      <div className="relative aspect-[3/4] overflow-hidden rounded bg-neutral-100 md:rounded-none">
        <Image
          src={artwork.src}
          alt={`${title} by Chungkook Lee, ${year}`}
          fill
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
