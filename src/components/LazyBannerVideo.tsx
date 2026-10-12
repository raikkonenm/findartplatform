"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Shows a cheap poster image until the player is within the viewport
 * (IntersectionObserver), then swaps in a `<video>` element with
 * autoplay + muted + loop. The video uses `preload="none"` so no
 * bytes are fetched before intersection; once visible, we flip to
 * `preload="auto"` and let the browser stream.
 *
 * The homepage featured-banner strip has four tiles side-by-side. Two
 * of them are videos (AC + Workflow). Before this component, both
 * started a `preload="metadata"` fetch at page load, competing with
 * the LCP image bandwidth on mobile. Now the fetch starts only once
 * the tile is actually scrolled into view (desktop first page) or on
 * swipe (mobile carousel).
 *
 * The `onlyDesktop` prop lets us keep the video out of the mobile
 * DOM entirely — mobile hero already has its own carousel path.
 */
export function LazyBannerVideo({
  src,
  poster,
  alt,
  className,
  onlyDesktop = false,
  rootMargin = "200px",
}: {
  src: string;
  poster: string;
  alt: string;
  className?: string;
  onlyDesktop?: boolean;
  rootMargin?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);
  const [canUseVideo, setCanUseVideo] = useState(!onlyDesktop);

  // On mount in a browser, decide whether to hydrate the video at all.
  // `onlyDesktop` + narrow viewport = stay on the poster; the mobile
  // hero slideshow renders its own path.
  useEffect(() => {
    if (!onlyDesktop) return;
    const update = () => setCanUseVideo(window.matchMedia("(min-width: 768px)").matches);
    update();
    const mq = window.matchMedia("(min-width: 768px)");
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [onlyDesktop]);

  useEffect(() => {
    if (!canUseVideo) return;
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      // Fallback: just load it.
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            io.disconnect();
            break;
          }
        }
      },
      { rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [canUseVideo, rootMargin]);

  return (
    <div ref={ref} className={`relative h-full w-full ${className ?? ""}`}>
      {/* Poster — always rendered as the ground layer. Serves as the
          LCP-eligible pixel until the real video decodes. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={poster}
        alt={alt}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover"
      />
      {canUseVideo && visible && (
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster={poster}
          aria-label={alt}
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source src={src} type="video/mp4" />
        </video>
      )}
    </div>
  );
}
