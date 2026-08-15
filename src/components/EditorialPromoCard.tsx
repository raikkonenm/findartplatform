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
    }, 3000);

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
            className={`object-cover transition-opacity duration-700 ease-in-out ${
              index === activeSlide ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
        <span className="absolute inset-0 bg-black/15 transition-colors duration-300 group-hover:bg-black/25" />
        <span className="absolute inset-0 flex items-center justify-center px-4 text-center text-[16px] font-bold uppercase tracking-[0.24em] text-white md:text-[20px]">
          Editorial
        </span>
      </Link>
    </article>
  );
}
