"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type IndexImageCarouselProps = {
  images: string[];
  alt: string;
};

export function IndexImageCarousel({ images, alt }: IndexImageCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (images.length < 2) return;
    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % images.length);
    }, 2500);
    return () => window.clearInterval(interval);
  }, [images.length]);

  return (
    <div className="absolute inset-0">
      {images.map((src, index) => (
        <Image
          key={src}
          src={src}
          alt={index === 0 ? alt : ""}
          fill
          sizes="(min-width: 1024px) 31vw, (min-width: 768px) 47vw, 100vw"
          className={`object-cover transition-opacity duration-700 ease-out ${
            index === activeIndex ? "opacity-100" : "opacity-0"
          }`}
          priority={index === 0}
        />
      ))}
    </div>
  );
}
