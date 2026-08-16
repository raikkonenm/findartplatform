"use client";

import Image from "next/image";
import Link from "next/link";
import { editorialSavedKey, type EditorialArtist } from "@/data/editorial";
import { HeartIcon, useSavedExhibitions } from "./SavedExhibitions";

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

  return (
    <article className="group relative min-w-0">
      <Link href={`/editorial/${artist.slug}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden bg-neutral-100">
          <Image
            src={artist.coverImage.src}
            alt={`${artist.artistName} editorial portrait`}
            fill
            className="object-cover"
            priority={eager}
            {...(eager
              ? { fetchPriority: "high" as const }
              : { loading: "lazy" as const })}
            unoptimized
            sizes="(min-width: 1024px) 31vw, (min-width: 768px) 47vw, 100vw"
          />
        </div>
        <div className="archive-card-copy pt-5">
          <h2 className="editorial-serif break-words text-[clamp(0.9rem,4vw,1.3rem)] leading-[1.08] tracking-[-0.035em] md:text-[2rem] md:leading-[1.04]">
            {artist.artistName.toUpperCase()}
          </h2>
          <p className="mt-2 truncate text-[0.85em] uppercase tracking-[0.2em] text-[#888]">
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
        className={`absolute right-4 top-4 z-10 text-neutral-900 transition-opacity duration-200 hover:opacity-60 focus-visible:opacity-100 focus-visible:outline-none ${
          saved ? "opacity-100" : "opacity-100 md:opacity-0 md:group-hover:opacity-100"
        }`}
      >
        <HeartIcon filled={saved} className="h-5 w-5" />
      </button>
    </article>
  );
}
