"use client";

import Image from "next/image";
import Link from "next/link";

/**
 * Promo card shown as the FIRST item in the homepage masonry feed. Pushes
 * every exhibition one position back so the user hits a Submit CTA before
 * scrolling the archive. Matches the layout of ExhibitionCard (3:4 image
 * with title beneath) but uses a static image and a fixed CTA overlay.
 */
export function SubmitPromoCard() {
  return (
    <article>
      <Link
        href="/submit"
        aria-label="Submit your exhibition"
        className="group relative block aspect-[3/4] overflow-hidden bg-neutral-100"
      >
        <Image
          src="/banner/submit.webp"
          alt=""
          fill
          loading="lazy"
          unoptimized
          sizes="(min-width: 1024px) 31vw, (min-width: 768px) 47vw, 100vw"
          className="object-cover"
        />
        <span className="absolute inset-0 bg-black/25 transition-colors duration-300 group-hover:bg-black/40" />
        <span className="absolute inset-0 flex items-center justify-center px-2 text-center text-[22px] font-bold uppercase tracking-[0.18em] text-white md:px-4 md:text-[28px] md:tracking-[0.2em]">
          Submit exhibition
        </span>
      </Link>
    </article>
  );
}
