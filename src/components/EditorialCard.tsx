"use client";

import Image from "next/image";
import Link from "next/link";
import { editorialSavedKey, type EditorialArtist } from "@/data/editorial";
import { HeartIcon, useSavedExhibitions } from "./SavedExhibitions";
import { ViewportSlideshow } from "./ViewportSlideshow";

const SLIDESHOW_ARTISTS = new Set([
  "isabelle-albuquerque",
  "kim-myungchan",
  "anna-uddenberg",
  "yihan-pan",
]);

export function EditorialCard({
  artist,
  eager = false,
  sizes = "(min-width: 1024px) 20vw, (min-width: 768px) 33vw, 100vw",
}: {
  artist: EditorialArtist;
  eager?: boolean;
  sizes?: string;
}) {
  const slideshow = SLIDESHOW_ARTISTS.has(artist.slug) && artist.images.length > 1;
  const { isSaved, toggleSaved } = useSavedExhibitions();
  const savedKey = editorialSavedKey(artist.slug);
  const saved = isSaved(savedKey);

  return (
    <article className="group relative min-w-0">
      <Link href={`/features/${artist.slug}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden rounded bg-neutral-100 md:rounded-none">
          {slideshow ? (
            <ViewportSlideshow images={artist.images} alt={`${artist.artistName} editorial portrait`} sizes={sizes} priority={eager} />
          ) : (
            <Image
              src={artist.coverImage.src}
              alt={`${artist.artistName} editorial portrait`}
              fill
              className="object-cover transition-[opacity,transform] duration-500 ease-out md:group-hover:scale-[1.025]"
              priority={eager}
              {...(eager
                ? { fetchPriority: "high" as const }
                : { loading: "lazy" as const })}
              sizes={sizes}
            />
          )}
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
        className={`absolute right-3 top-3 z-10 hidden h-9 w-9 items-center justify-center rounded-md border border-neutral-300 bg-white/85 text-neutral-900 shadow-sm backdrop-blur-sm transition-opacity duration-200 focus-visible:opacity-100 focus-visible:outline-none md:flex ${
          saved ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
      >
        <HeartIcon filled={saved} className="h-4 w-4" />
      </button>
    </article>
  );
}
