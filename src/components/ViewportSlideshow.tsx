"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

/** Keep the first frame server-rendered, and only load/animate nearby frames
 * while the slideshow is actually visible (including inside clipped carousels).
 */
export function ViewportSlideshow({
  images,
  alt,
  sizes,
  priority = false,
  className = "absolute inset-0",
  imageClassName = "object-cover transition-[opacity,transform] duration-500 ease-out md:group-hover:scale-[1.025]",
}: {
  images: readonly { src: string }[];
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
  imageClassName?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const loaded = useRef(new Set<string>());
  const [inView, setInView] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [ready, setReady] = useState(false);
  const [frame, setFrame] = useState({ current: 0, previous: -1 });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting));
    observer.observe(element);
    const updateVisibility = () => setPageVisible(!document.hidden);
    document.addEventListener("visibilitychange", updateVisibility);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", updateVisibility);
    };
  }, []);

  const playing = inView && pageVisible && ready;
  useEffect(() => {
    if (!playing || images.length < 2) return;
    const interval = window.setInterval(() => {
      setFrame((current) => {
        const next = (current.current + 1) % images.length;
        // Keep the displayed image until its successor has finished loading.
        if (!loaded.current.has(images[next].src)) return current;
        return { current: next, previous: current.current };
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [playing, images]);

  const next = playing && images.length > 1 ? (frame.current + 1) % images.length : -1;
  return (
    <div ref={ref} className={className}>
      {images.map((image, index) => {
        const active = index === frame.current;
        if (!active && index !== next && !(playing && index === frame.previous)) return null;
        return (
          <Image
            key={image.src}
            src={image.src}
            alt={active ? alt : ""}
            fill
            priority={priority && active}
            {...(priority && active ? { fetchPriority: "high" as const } : { loading: "lazy" as const })}
            sizes={sizes}
            onLoad={() => {
              loaded.current.add(image.src);
              if (active) setReady(true);
            }}
            className={`${imageClassName} ${active ? "opacity-100" : "opacity-0"}`}
          />
        );
      })}
    </div>
  );
}
