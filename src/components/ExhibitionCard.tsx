"use client";

import Image from "next/image";
import Link from "next/link";
import type { Exhibition } from "@/data/exhibitions";
import { displayExhibitionTitle } from "@/lib/displayExhibitionTitle";
import { displayVenueText } from "@/lib/displayVenueText";
import { HeartIcon, useSavedExhibitions } from "./SavedExhibitions";

type ExhibitionCardProps = {
  exhibition: Exhibition;
  eager?: boolean;
};

/**
 * Deterministic aspect-ratio variant per slug so the masonry feed has natural
 * vertical rhythm instead of every card being identical. Tailwind needs the
 * literal class strings to be present in source for JIT compilation, hence
 * the explicit switch (no template-string class concatenation).
 */
function aspectClassForSlug(slug: string): string {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = (hash * 31 + slug.charCodeAt(i)) | 0;
  }
  const idx = Math.abs(hash) % 3;
  if (idx === 0) return "aspect-[3/4]";
  if (idx === 1) return "aspect-[4/5]";
  return "aspect-[1/1]";
}

export function ExhibitionCard({ exhibition, eager = false }: ExhibitionCardProps) {
  const aspect = aspectClassForSlug(exhibition.slug);
  const { isSaved, toggleSaved } = useSavedExhibitions();
  const saved = isSaved(exhibition.slug);
  const title = displayExhibitionTitle(exhibition.title);
  const useDirectPublicImage = ["accomplice", "dislocation", "haus-der-luge"].includes(
    exhibition.slug,
  );

  return (
    // The parent `.masonry > *` rule in globals.css handles
    // `break-inside: avoid`, `display: block`, `width: 100%`, and
    // `margin-bottom`, so the card itself stays markup-only.
    <article className="group relative">
      <Link href={`/exhibitions/${exhibition.slug}`} className="block">
        <div className={`relative ${aspect} overflow-hidden bg-neutral-100`}>
          <Image
            src={exhibition.coverImage ?? exhibition.previewImage}
            alt={`${title} exhibition view`}
            fill
            className="object-cover"
            loading={eager ? "eager" : "lazy"}
            unoptimized={useDirectPublicImage}
            sizes="(min-width: 1024px) 31vw, (min-width: 768px) 47vw, 100vw"
          />
        </div>
        <div className="pt-5">
          <p className="mb-2 text-[10px] uppercase tracking-[0.28em] text-neutral-500">
            {exhibition.city} / {exhibition.year}
          </p>
          <h2 className="editorial-serif break-words text-[clamp(1.5rem,7.5vw,2rem)] leading-[1.04] tracking-[-0.035em] md:text-[2rem]">
            {title.toUpperCase()}
          </h2>
          <p className="mt-2 text-[0.85em] uppercase tracking-[0.2em] text-[#888]">
            {displayVenueText(exhibition.venue)}
          </p>
        </div>
      </Link>
      <button
        type="button"
        aria-label={saved ? `Remove ${title} from saved exhibitions` : `Save ${title}`}
        aria-pressed={saved}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          toggleSaved(exhibition.slug);
        }}
        className={`absolute right-4 top-4 z-10 text-neutral-900 transition-opacity duration-200 hover:opacity-60 focus-visible:opacity-100 focus-visible:outline-none ${
          saved ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
      >
        <HeartIcon filled={saved} className="h-5 w-5" />
      </button>
    </article>
  );
}
