"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

// Cross-fade carousel of 4 stills. Rhythm matches EditorialPromoCard
// (500ms per slide) so both promo cards share the same animation feel.
const submitSlides = [
  "/banner/submit.webp",
  "/banner/submit1.webp",
  "/banner/submit2.webp",
  "/banner/submit3.webp",
];

/**
 * Promo card injected at index 4 of the homepage masonry feed. Matches the
 * layout of ExhibitionCard (3:4 image) but shows a rotating Submit CTA.
 */
export function SubmitPromoCard() {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % submitSlides.length);
    }, 500);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <article>
      <Link
        href="/submit"
        aria-label="Submit your exhibition"
        className="group relative block aspect-[3/4] overflow-hidden bg-neutral-100"
      >
        {submitSlides.map((src, index) => (
          <Image
            key={src}
            src={src}
            alt=""
            fill
            loading="lazy"
            unoptimized
            sizes="(min-width: 1024px) 31vw, (min-width: 768px) 47vw, 100vw"
            className={`object-cover transition-opacity duration-300 ease-in-out ${
              index === activeSlide ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
        <span className="absolute inset-0 bg-black/25 transition-colors duration-300 group-hover:bg-black/40" />
        <span className="absolute inset-0 flex items-center justify-center px-2 text-center text-[22px] font-bold uppercase tracking-[0.18em] text-white md:px-4 md:text-[28px] md:tracking-[0.2em]">
          Submit exhibition
        </span>
      </Link>
    </article>
  );
}
