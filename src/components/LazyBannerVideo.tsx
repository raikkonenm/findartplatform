"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Shows a cheap poster image until the player is within the viewport
 * (IntersectionObserver), then attaches the video source and starts
 * playback. Keeping the player/poster in the initial markup avoids
 * replacing the first visible image with a late-loading player.
 * Offscreen players have no source and use `preload="none"`.
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
  rootMargin = "0px",
  priority = false,
  visibleRatio = 0,
}: {
  src: string;
  poster: string;
  alt: string;
  className?: string;
  onlyDesktop?: boolean;
  rootMargin?: string;
  priority?: boolean;
  visibleRatio?: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [visible, setVisible] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [canUseVideo, setCanUseVideo] = useState(!onlyDesktop);
  const [pageVisible, setPageVisible] = useState(true);

  useEffect(() => {
    const update = () => setPageVisible(!document.hidden);
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);

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
      const frame = window.requestAnimationFrame(() => {
        setLoaded(true);
        setVisible(true);
      });
      return () => window.cancelAnimationFrame(frame);
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const inView = entry.isIntersecting && entry.intersectionRatio >= visibleRatio;
          if (inView) {
            setLoaded(true);
          }
          setVisible(inView);
        }
      },
      { rootMargin, threshold: visibleRatio },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [canUseVideo, rootMargin, visibleRatio]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (visible && pageVisible) void video.play().catch(() => {});
    else video.pause();
  }, [visible, pageVisible, loaded, canUseVideo]);

  return (
    <div ref={ref} className={`relative h-full w-full ${className ?? ""}`}>
      {/* Poster — always rendered as the ground layer. Serves as the
          LCP-eligible pixel until the real video decodes. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={poster}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : undefined}
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover"
      />
      {canUseVideo && (
        <video
          ref={videoRef}
          src={loaded ? src : undefined}
          autoPlay={visible && pageVisible}
          muted
          loop
          playsInline
          preload={loaded ? "auto" : "none"}
          poster={priority || loaded ? poster : undefined}
          aria-label={alt}
          className={`absolute inset-0 h-full w-full object-cover ${priority || loaded ? "opacity-100" : "opacity-0"}`}
        />
      )}
    </div>
  );
}
