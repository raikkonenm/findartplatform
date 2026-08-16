"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const images = [
  "/index/ivana.jpg",
  "/index/ivana1.jpg",
  "/index/ivana2.jpg",
  "/index/ivana3.jpg",
  "/index/ivana4.jpg",
];

export function IndexImageCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % images.length);
    }, 2500);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="relative aspect-[16/9] overflow-hidden bg-neutral-100">
      {images.map((src, index) => (
        <Image
          key={src}
          src={src}
          alt="Ivana Basic"
          fill
          unoptimized
          sizes="(min-width: 1024px) 31vw, (min-width: 768px) 48vw, 100vw"
          className={`object-cover transition-all duration-700 ease-out md:group-hover:scale-[1.025] ${
            index === activeIndex ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
    </div>
  );
}
