"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { Exhibition } from "@/data/exhibitions";
import { displayExhibitionTitle } from "@/lib/displayExhibitionTitle";
import { displayVenueText } from "@/lib/displayVenueText";
import { OnViewDot } from "./OnViewDot";
import { HeartIcon, useSavedExhibitions } from "./SavedExhibitions";

type ExhibitionCardProps = {
  exhibition: Exhibition;
  eager?: boolean;
};

const DESKTOP_SLIDESHOW_SLUGS = new Set(["nymphenbrunnen", "make-me-yours"]);

function DesktopCardSlideshow({ exhibition, title }: { exhibition: Exhibition; title: string }) {
  const slides = exhibition.images.filter((image) => image.orientation === "vertical");
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    if (slides.length < 2) return;

    const desktop = window.matchMedia("(min-width: 1024px)");
    let interval: number | undefined;
    const syncInterval = () => {
      if (interval !== undefined) window.clearInterval(interval);
      interval = desktop.matches
        ? window.setInterval(() => {
            setActiveSlide((current) => (current + 1) % slides.length);
          }, 1000)
        : undefined;
    };

    syncInterval();
    desktop.addEventListener("change", syncInterval);
    return () => {
      desktop.removeEventListener("change", syncInterval);
      if (interval !== undefined) window.clearInterval(interval);
    };
  }, [slides.length]);

  return (
    <div className="absolute inset-0 hidden lg:block">
      {slides.map((image, index) => (
        <Image
          key={image.src}
          src={image.src}
          alt={index === 0 ? `${title} exhibition view` : ""}
          fill
          loading="lazy"
          className={`object-cover transition-opacity duration-300 ease-in-out ${
            index === activeSlide ? "opacity-100" : "opacity-0"
          }`}
          {...(exhibition.unoptimized ? { unoptimized: true } : {})}
          sizes="31vw"
        />
      ))}
    </div>
  );
}

/**
 * Deterministic aspect-ratio variant per slug so the masonry feed has natural
 * vertical rhythm instead of every card being identical. Tailwind needs the
 * literal class strings to be present in source for JIT compilation, hence
 * the explicit switch (no template-string class concatenation).
 */
function aspectClassForSlug(slug: string): string {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = (hash * 31 + slug.charCodeAt(i)) | 0;
  }
  const idx = Math.abs(hash) % 3;
  if (idx === 0) return "aspect-[3/4]";
  if (idx === 1) return "aspect-[4/5]";
  return "aspect-[1/1]";
}

export function ExhibitionCard({ exhibition, eager = false }: ExhibitionCardProps) {
  const aspect = aspectClassForSlug(exhibition.slug);
  const { isSaved, toggleSaved } = useSavedExhibitions();
  const saved = isSaved(exhibition.slug);
  const title = displayExhibitionTitle(exhibition.title);
  const desktopSlideshow = DESKTOP_SLIDESHOW_SLUGS.has(exhibition.slug);

  return (
    // The card is placed inside a `.masonry-col` flex column by
    // MasonryGrid. Sizing and vertical spacing come from that parent
    // flex layout (48px column gap, 64px row gap), so the card itself
    // stays markup-only — no wrapper margins here.
    <article className="group relative">
      <Link href={`/exhibitions/${exhibition.slug}`} className="block">
        <div className={`relative ${aspect} overflow-hidden bg-neutral-100`}>
          <Image
            src={exhibition.coverImage ?? exhibition.previewImage}
            alt={`${title} exhibition view`}
            fill
            className={`object-cover ${desktopSlideshow ? "lg:hidden" : ""}`}
            priority={eager}
            {...(eager
              ? { fetchPriority: "high" as const }
              : { loading: "lazy" as const })}
            {...(exhibition.unoptimized ? { unoptimized: true } : {})}
            sizes="(min-width: 1024px) 31vw, (min-width: 768px) 47vw, 100vw"
          />
          {desktopSlideshow && (
            <DesktopCardSlideshow exhibition={exhibition} title={title} />
          )}
        </div>
        <div className="archive-card-copy pt-5">
          <p className="mb-2 text-[10px] uppercase tracking-[0.28em] text-neutral-500">
            <OnViewDot
              startDate={exhibition.startDate}
              endDate={exhibition.endDate}
            />
            {exhibition.city} / {exhibition.year}
          </p>
          <h2 className="editorial-serif break-words text-[clamp(0.9rem,4vw,1.3rem)] leading-[1.08] tracking-[-0.035em] md:text-[2rem] md:leading-[1.04]">
            {title.toUpperCase()}
          </h2>
          <p className="mt-2 text-[0.85em] uppercase tracking-[0.2em] text-[#888]">
            {displayVenueText(exhibition.venue)}
          </p>
        </div>
      </Link>
      <button
        type="button"
        aria-label={saved ? `Remove ${title} from saved exhibitions` : `Save ${title}`}
        aria-pressed={saved}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          toggleSaved(exhibition.slug);
        }}
        className={`absolute right-4 top-4 z-10 text-neutral-900 transition-opacity duration-200 hover:opacity-60 focus-visible:opacity-100 focus-visible:outline-none ${
          saved ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
      >
        <HeartIcon filled={saved} className="h-5 w-5" />
      </button>
    </article>
  );
}
