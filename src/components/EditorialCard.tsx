"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { editorialSavedKey, type EditorialArtist } from "@/data/editorial";
import { HeartIcon, useSavedExhibitions } from "./SavedExhibitions";

const SLIDESHOW_ARTISTS = new Set([
  "isabelle-albuquerque",
  "kim-myungchan",
  "anna-uddenberg",
  "yihan-pan",
]);

export function EditorialCard({
  artist,
  eager = false,
}: {
  artist: EditorialArtist;
  eager?: boolean;
}) {
  const { isSaved, toggleSaved } = useSavedExhibitions();
  const savedKey = editorialSavedKey(artist.slug);
  const saved = isSaved(savedKey);
  const slideshow = SLIDESHOW_ARTISTS.has(artist.slug) && artist.images.length > 1;
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    if (!slideshow) return;
    const interval = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % artist.images.length);
    }, 1000);
    return () => window.clearInterval(interval);
  }, [artist.images.length, slideshow]);

  return (
    <article className="group relative min-w-0">
      <Link href={`/features/${artist.slug}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden rounded bg-neutral-100 md:rounded-none">
          {(slideshow ? artist.images : [artist.coverImage]).map((image, index) => (
            <Image
              key={image.src}
              src={image.src}
              alt={index === 0 ? `${artist.artistName} editorial portrait` : ""}
              fill
              className={`object-cover transition-[opacity,transform] duration-500 ease-out md:group-hover:scale-[1.025] ${
                index === activeSlide ? "opacity-100" : "opacity-0"
              }`}
              priority={eager && index === 0}
              {...(eager && index === 0
                ? { fetchPriority: "high" as const }
                : { loading: "lazy" as const })}
              unoptimized
              sizes="(min-width: 1024px) 20vw, (min-width: 768px) 33vw, 100vw"
            />
          ))}
        </div>
        <div className="archive-card-copy pt-5">
          <h2 className="editorial-serif break-words text-[clamp(0.9rem,4vw,1.3rem)] leading-[1.08] tracking-[-0.035em] md:text-[clamp(1rem,1.7vw,1.65rem)] md:leading-[1.02]">
            {artist.artistName.toUpperCase()}
          </h2>
          <p className="mt-2 truncate text-[0.85em] uppercase tracking-[0.2em] text-[#888] md:text-[11px] md:tracking-[0.18em] md:text-neutral-500">
            {artist.instagramHandle}
          </p>
        </div>
      </Link>
      <button
        type="button"
        aria-label={saved ? `Remove ${artist.artistName} from saved` : `Save ${artist.artistName}`}
        aria-pressed={saved}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          toggleSaved(savedKey);
        }}
        className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-md border border-neutral-300 bg-white/85 text-neutral-900 shadow-sm backdrop-blur-sm transition-opacity duration-200 hover:opacity-70 focus-visible:opacity-100 focus-visible:outline-none"
      >
        <HeartIcon filled={saved} className="h-4 w-4" />
      </button>
    </article>
  );
}
