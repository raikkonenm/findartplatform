"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const editorialSlides = [
  "/editorial/card/0.webp",
  "/editorial/card/1.webp",
  "/editorial/card/2.webp",
  "/editorial/card/3.webp",
  "/editorial/card/4.webp",
];

export function EditorialPromoCard() {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % editorialSlides.length);
    }, 500);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <article>
      <Link
        href="/editorial"
        aria-label="Open Editorial"
        className="group relative block aspect-[3/4] overflow-hidden bg-neutral-100"
      >
        {editorialSlides.map((src, index) => (
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
        <span className="absolute inset-0 bg-black/15 transition-colors duration-300 group-hover:bg-black/25" />
        <span className="absolute inset-0 flex items-center justify-center px-2 text-center text-[11px] font-bold uppercase tracking-[0.14em] text-white md:px-4 md:text-[24px] md:tracking-[0.18em]">
          Editorial
        </span>
      </Link>
    </article>
  );
}
