"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

// Show a lightweight WebP poster on first paint; upgrade to the real
// looping video only after the element scrolls into the viewport.
// The two banner videos on the homepage (AC.web.mp4 ≈ 3 MB, workflow
// ≈ 1 MB) previously dominated the mobile LCP. This defers all bytes
// until the user actually reaches that slide / tile.
export function LazyBannerVideo({
  src,
  poster,
  alt,
  className = "absolute inset-0 h-full w-full object-cover",
  sizes = "100vw",
  onlyDesktop = false,
}: {
  src: string;
  poster: string;
  alt: string;
  className?: string;
  sizes?: string;
  // Set true for tiles that are hidden on mobile via CSS — spares
  // mobile users the JS mount entirely.
  onlyDesktop?: boolean;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    if (onlyDesktop && window.matchMedia("(max-width: 767px)").matches) return;
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setLive(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setLive(true);
          io.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [onlyDesktop]);

  return (
    <div ref={ref} className="absolute inset-0">
      {live ? (
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          aria-label={alt}
          className={className}
        >
          <source src={src} type="video/mp4" />
        </video>
      ) : (
        <Image
          src={poster}
          alt={alt}
          fill
          className="object-cover"
          sizes={sizes}
          priority={false}
        />
      )}
    </div>
  );
}
