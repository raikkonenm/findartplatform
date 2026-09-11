"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

// Cross-fade carousel of 4 stills for the Opportunities-for-artists banner
// (mobile featured carousel slot 1 + desktop featured grid slot 1). Same
// 500ms cadence as SubmitPromoCard / EditorialPromoCard so all rotating
// promo images share the same rhythm.
const opportunitiesSlides = [
  "/banner/submitopp.webp",
  "/banner/submitopp1.webp",
  "/banner/submitopp2.webp",
  "/banner/submitopp3.webp",
];

type OpportunitiesBannerCarouselProps = {
  priority?: boolean;
  sizes: string;
  className?: string;
};

export function OpportunitiesBannerCarousel({
  priority = false,
  sizes,
  className = "absolute inset-0 h-full w-full object-cover",
}: OpportunitiesBannerCarouselProps) {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % opportunitiesSlides.length);
    }, 500);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <>
      {opportunitiesSlides.map((src, index) => (
        <Image
          key={src}
          src={src}
          alt=""
          fill
          priority={priority && index === 0}
          unoptimized
          sizes={sizes}
          className={`${className} transition-opacity duration-300 ease-in-out ${
            index === activeSlide ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
    </>
  );
}
