"use client";

import { Suspense, useCallback, useState, useMemo, useRef, useEffect, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { exhibitions, semanticTags, type SemanticTag } from "@/data/exhibitions";
import { MasonryGrid, type MasonryDensity } from "@/components/MasonryGrid";
import { HeartIcon } from "@/components/SavedExhibitions";
import { MobileNavigationMenu } from "@/components/MobileNavigationMenu";
import { NavigationProgress } from "@/components/NavigationProgress";
import { ThemeToggleButton } from "@/components/ThemeToggleButton";
import { displayExhibitionTitle } from "@/lib/displayExhibitionTitle";
import { isExhibitionOnView } from "@/lib/isOnView";

const YEARS = ["All", "2026", "2025", "2024", "2023"];
type SelectedTag = "ALL" | SemanticTag;

function FeaturedExhibitionSlideshow({
  slug,
  initialSrc,
  alt,
  priority = false,
  sizes,
}: {
  slug: string;
  initialSrc: string;
  alt: string;
  priority?: boolean;
  sizes: string;
}) {
  const exhibition = exhibitions.find((item) => item.slug === slug);
  const slides = [initialSrc, ...(exhibition?.images.map((image) => image.src) ?? [])].filter(
    (src, index, items) => items.indexOf(src) === index,
  );
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    if (slides.length < 2) return;
    const interval = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, 1000);

    return () => window.clearInterval(interval);
  }, [slides.length]);

  return (
    <div className="relative h-full w-full">
      {slides.map((src, index) => (
        <Image
          key={src}
          src={src}
          alt={index === 0 ? alt : ""}
          fill
          priority={priority && index === 0}
          {...(priority && index === 0
            ? { fetchPriority: "high" as const }
            : { loading: "lazy" as const })}
          unoptimized
          sizes={sizes}
          className={`object-cover transition-opacity duration-300 ease-in-out ${
            index === activeSlide ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
    </div>
  );
}

function MobileFeaturedCarousel() {
  const [activeSlide, setActiveSlide] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const slideCount = 4;

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % slideCount);
    }, 10000);
    return () => window.clearInterval(interval);
  }, []);

  const moveTo = (index: number) => {
    setActiveSlide((index + slideCount) % slideCount);
  };

  return (
    <section className="overflow-hidden bg-white pb-4 pt-4 md:hidden" aria-label="Featured exhibitions">
      <div
        className="overflow-hidden"
        onTouchStart={(event) => {
          touchStartX.current = event.touches[0]?.clientX ?? null;
        }}
        onTouchEnd={(event) => {
          if (touchStartX.current === null) return;
          const touchEndX = event.changedTouches[0]?.clientX;
          if (touchEndX === undefined) {
            touchStartX.current = null;
            return;
          }
          const delta = touchEndX - touchStartX.current;
          touchStartX.current = null;
          if (Math.abs(delta) < 40) return;
          moveTo(activeSlide + (delta < 0 ? 1 : -1));
        }}
      >
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${activeSlide * 100}%)` }}
        >
          <div className="w-full shrink-0 px-4">
            <Link
              href="/exhibitions/der-kopf-ist-rund"
              aria-label="View Der Kopf ist rund exhibition"
              className="relative block aspect-[16/9] overflow-hidden bg-neutral-100"
            >
              <FeaturedExhibitionSlideshow
                slug="der-kopf-ist-rund"
                initialSrc="/banner/banner1.webp"
                alt="Der Kopf ist rund exhibition installation view"
                priority
                sizes="100vw"
              />
            </Link>
          </div>
          <div className="w-full shrink-0 px-4">
            <Link
              href="/exhibitions/axial-core"
              aria-label="View Axial-Core exhibition"
              className="relative block aspect-[16/9] overflow-hidden bg-neutral-100"
            >
              <FeaturedExhibitionSlideshow
                slug="axial-core"
                initialSrc="/banner/blue.webp"
                alt="Axial-Core exhibition installation view"
                sizes="100vw"
              />
            </Link>
          </div>
          <div className="w-full shrink-0 px-4">
            <div className="relative aspect-[16/9] overflow-hidden bg-neutral-100">
              <video
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                aria-label="Artcnomads curatorial projects"
                className="absolute inset-0 h-full w-full object-cover"
              >
                <source src="/banner/AC.web.mp4" type="video/mp4" />
              </video>
            </div>
          </div>
          <div className="w-full shrink-0 px-4">
            <a
              href="https://www.artcnomad.com/workflow-art"
              aria-label="Open Workflow.Art"
              className="relative block aspect-[16/9] overflow-hidden bg-neutral-100"
            >
              <video
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                aria-label="Workflow.Art platform preview"
                className="absolute inset-0 h-full w-full scale-[1.04] object-cover"
              >
                <source src="/banner/workflow.web.mp4" type="video/mp4" />
              </video>
            </a>
          </div>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-center gap-2" aria-label="Choose featured banner">
        {Array.from({ length: slideCount }, (_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => moveTo(index)}
            aria-label={`Show featured banner ${index + 1}`}
            aria-current={index === activeSlide ? "true" : undefined}
            className={`h-1.5 w-1.5 rounded-full transition-colors duration-300 ${
              index === activeSlide ? "bg-neutral-900" : "bg-neutral-400"
            }`}
          />
        ))}
      </div>
    </section>
  );
}

// Hierarchical location filter: "all" / by country / by specific city
// inside a country.
type LocationValue =
  | { kind: "all" }
  | { kind: "country"; country: string }
  | { kind: "city"; country: string; city: string };

function tagFromQueryParam(value: string | null): SelectedTag {
  if (value && (semanticTags as readonly string[]).includes(value)) {
    return value as SemanticTag;
  }

  return "ALL";
}

function TagQuerySync({ onChange }: { onChange: (tag: SelectedTag) => void }) {
  const searchParams = useSearchParams();
  const queryTag = searchParams.get("tag");

  useEffect(() => {
    onChange(tagFromQueryParam(queryTag));
  }, [onChange, queryTag]);

  return null;
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 border px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] transition duration-200 ease-out ${
        active
          ? "border-neutral-900 text-neutral-900"
          : "border-neutral-200 text-neutral-400 hover:border-neutral-400 hover:text-neutral-600"
      }`}
    >
      {label}
    </button>
  );
}

/**
 * Icon-only toggle that cycles feed density. Glyph shows current
 * state (3 / 4 / 5 vertical bars) so the user can tell which mode
 * they are in without a label. Active border styling matches
 * FilterChip so the button reads as part of the same filter row.
 */
function DensityToggleButton({
  density,
  onCycle,
}: {
  density: MasonryDensity;
  onCycle: () => void;
}) {
  const isActive = density !== "normal";
  return (
    <button
      type="button"
      onClick={onCycle}
      aria-label={`Feed density: ${density}. Tap to cycle.`}
      className={`shrink-0 border p-2 transition duration-200 ease-out ${
        isActive
          ? "border-neutral-900 text-neutral-900"
          : "border-neutral-200 text-neutral-500 hover:border-neutral-400 hover:text-neutral-700"
      }`}
    >
      <DensityGlyph density={density} />
    </button>
  );
}

/**
 * Three vertical strokes that rotate 90° when density flips to
 * `dense`, so the toggle reads as an orientation switch rather than
 * a count switch. Same glyph in every state — only its rotation
 * changes, with a smooth CSS transition.
 */
function DensityGlyph({ density }: { density: MasonryDensity }) {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="square"
      aria-hidden="true"
      className={`transition-transform duration-300 ease-out ${
        density === "dense" ? "rotate-90" : "rotate-0"
      }`}
    >
      <line x1="3" y1="3" x2="3" y2="13" />
      <line x1="8" y1="3" x2="8" y2="13" />
      <line x1="13" y1="3" x2="13" y2="13" />
    </svg>
  );
}

function DesktopSearch({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const expanded = value.length > 0;

  return (
    <label className="group/search flex h-9 cursor-text items-center justify-end text-neutral-500">
      <span className="sr-only">Search exhibitions</span>
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search exhibitions..."
        className={`h-9 border-0 border-b border-neutral-300 bg-transparent text-[12px] uppercase tracking-[0.18em] text-neutral-900 transition-[width,opacity] duration-300 ease-out placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none ${
          expanded
            ? "mr-2 w-56 opacity-100"
            : "w-0 opacity-0 group-hover/search:mr-2 group-hover/search:w-56 group-hover/search:opacity-100 group-focus-within/search:mr-2 group-focus-within/search:w-56 group-focus-within/search:opacity-100"
        }`}
      />
      <svg
        viewBox="0 0 20 20"
        className="h-4 w-4 shrink-0 transition-colors duration-200 group-hover/search:text-neutral-900 group-focus-within/search:text-neutral-900"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="1.25" />
        <path d="m12.5 12.5 4 4" stroke="currentColor" strokeWidth="1.25" />
      </svg>
    </label>
  );
}

function DesktopFeaturedCarousel({ initialIsMobile }: { initialIsMobile: boolean }) {
  const [activePage, setActivePage] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActivePage((current) => (current + 1) % 2);
    }, 10000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <section
      className="hidden overflow-hidden bg-white px-8 pb-12 pt-4 md:block lg:px-12"
      aria-label="Featured exhibitions"
    >
      <div className="overflow-hidden">
        <div
          className="grid gap-6 [--banner-gap:1.5rem] transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] lg:gap-8 lg:[--banner-gap:2rem]"
          style={{
            gridTemplateColumns:
              "repeat(4, calc((100% - var(--banner-gap) - var(--banner-gap)) / 3))",
            transform:
              activePage === 0
                ? "translateX(0)"
                : "translateX(calc(-1 * (((100% - var(--banner-gap) - var(--banner-gap)) / 3) + var(--banner-gap))))",
          }}
        >
          <article className="min-w-0">
            <Link
              href="/exhibitions/der-kopf-ist-rund"
              aria-label="View Der Kopf ist rund exhibition"
              className="relative block aspect-[16/9] overflow-hidden bg-neutral-100"
            >
              <FeaturedExhibitionSlideshow
                slug="der-kopf-ist-rund"
                initialSrc="/banner/banner1.webp"
                alt="Der Kopf ist rund exhibition installation view"
                priority
                sizes="33vw"
              />
            </Link>
            <div className="pt-4">
              <p className="text-[10px] uppercase tracking-[0.26em] text-neutral-500">
                Klaus in Vorarlberg / 2026
              </p>
              <Link
                href="/exhibitions/der-kopf-ist-rund"
                className="editorial-serif mt-2 block break-words text-[clamp(1rem,1.7vw,1.65rem)] uppercase leading-[1.02] tracking-[-0.035em] transition-opacity hover:opacity-60"
              >
                Der Kopf ist rund, damit das Denken die Richtung wechseln kann
              </Link>
              <p className="mt-2 text-[11px] uppercase tracking-[0.18em] text-neutral-500">
                Galerie Brugger
              </p>
            </div>
          </article>

          <article className="min-w-0">
            <Link
              href="/exhibitions/axial-core"
              aria-label="View Axial-Core exhibition"
              className="relative block aspect-[16/9] overflow-hidden bg-neutral-100"
            >
              <FeaturedExhibitionSlideshow
                slug="axial-core"
                initialSrc="/banner/blue.webp"
                alt="Axial-Core exhibition installation view"
                sizes="33vw"
              />
            </Link>
            <div className="pt-4">
              <p className="text-[10px] uppercase tracking-[0.26em] text-neutral-500">
                May 22 — June 01, 2026
              </p>
              <h2 className="editorial-serif mt-2 break-words text-[clamp(1rem,1.7vw,1.65rem)] uppercase leading-[1.02] tracking-[-0.035em]">
                Axial-Core
              </h2>
              <p className="mt-2 text-[11px] uppercase tracking-[0.18em] text-neutral-500">
                Leo Pum @La Térmica, Málaga KRVCE festival
              </p>
            </div>
          </article>

          <article className="min-w-0">
            <div className="relative aspect-[16/9] overflow-hidden bg-neutral-100">
              {!initialIsMobile && (
                <video
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  aria-label="Artcnomads curatorial projects"
                  className="absolute inset-0 h-full w-full object-cover"
                >
                  <source src="/banner/AC.web.mp4" type="video/mp4" />
                </video>
              )}
            </div>
            <div className="pt-4">
              <p className="text-[10px] tracking-[0.18em] text-neutral-500">artcnomad.com</p>
              <a
                href="https://www.artcnomad.com/"
                className="editorial-serif mt-2 block break-words text-[clamp(1rem,1.7vw,1.65rem)] uppercase leading-[1.02] tracking-[-0.035em] transition-opacity hover:opacity-60"
              >
                ART CURATORIAL NOMADS
              </a>
              <p className="mt-2 text-[11px] uppercase tracking-[0.18em] text-neutral-500">
                Curate your exhibition
              </p>
            </div>
          </article>

          <article className="min-w-0">
            <a
              href="https://www.artcnomad.com/workflow-art"
              aria-label="Open Workflow.Art"
              className="relative block aspect-[16/9] overflow-hidden bg-neutral-100"
            >
              <video
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                aria-label="Workflow.Art platform preview"
                className="absolute inset-0 h-full w-full scale-[1.04] object-cover"
              >
                <source src="/banner/workflow.web.mp4" type="video/mp4" />
              </video>
            </a>
            <div className="pt-4">
              <a
                href="https://www.artcnomad.com/workflow-art"
                className="editorial-serif mt-2 block break-words text-[clamp(1rem,1.7vw,1.65rem)] uppercase leading-[1.02] tracking-[-0.035em] transition-opacity hover:opacity-60"
              >
                Workflow.Art
              </a>
              <p className="mt-2 text-[11px] leading-relaxed tracking-[0.04em] text-neutral-500">
                Everything you need to plan, apply, and move your art career forward.
              </p>
            </div>
          </article>
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-2" aria-label="Choose featured banners">
        {[0, 1].map((page) => (
          <button
            key={page}
            type="button"
            onClick={() => setActivePage(page)}
            onMouseEnter={() => setActivePage(page)}
            aria-label={`Show featured banners ${page + 1}`}
            aria-current={page === activePage ? "true" : undefined}
            className={`h-px w-10 transition-colors duration-300 ${
              page === activePage ? "bg-[var(--foreground)]" : "bg-neutral-400"
            }`}
          />
        ))}
      </div>
    </section>
  );
}

type DesktopFilterPanel = "tags" | "location" | "year";

function DesktopFilterModeButton({
  label,
  active,
  onHover,
}: {
  label: string;
  active: boolean;
  onHover: () => void;
}) {
  return (
    <button
      type="button"
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") onHover();
      }}
      onFocus={onHover}
      className={`shrink-0 border px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] transition-colors duration-200 ${
        active
          ? "border-[var(--foreground)] text-[var(--foreground)]"
          : "border-neutral-200 text-neutral-500 hover:border-neutral-400"
      }`}
    >
      {label}
    </button>
  );
}

function HorizontalFilterRail({
  children,
  resetKey,
  autoLoop = false,
}: {
  children: ReactNode;
  resetKey: string;
  autoLoop?: boolean;
}) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const scrollTimerRef = useRef<number | null>(null);
  const autoPausedRef = useRef(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateArrows = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    setCanScrollLeft(viewport.scrollLeft > 2);
    setCanScrollRight(viewport.scrollLeft + viewport.clientWidth < viewport.scrollWidth - 2);
  }, []);

  const stopScrolling = useCallback(() => {
    if (scrollTimerRef.current !== null) {
      window.clearInterval(scrollTimerRef.current);
      scrollTimerRef.current = null;
    }
  }, []);

  const startScrolling = (direction: -1 | 1) => {
    stopScrolling();
    scrollTimerRef.current = window.setInterval(() => {
      viewportRef.current?.scrollBy({ left: direction * 10 });
    }, 20);
  };

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    viewport.scrollLeft = 0;
    updateArrows();
    const resizeObserver = new ResizeObserver(updateArrows);
    resizeObserver.observe(viewport);
    return () => resizeObserver.disconnect();
  }, [resetKey, updateArrows]);

  useEffect(() => stopScrolling, [stopScrolling]);

  useEffect(() => {
    if (!autoLoop || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => {
      const viewport = viewportRef.current;
      if (!viewport || autoPausedRef.current || viewport.scrollWidth <= viewport.clientWidth) return;
      const end = viewport.scrollWidth - viewport.clientWidth;
      viewport.scrollLeft = viewport.scrollLeft >= end - 1 ? 0 : viewport.scrollLeft + 1;
    }, 30);
    return () => window.clearInterval(timer);
  }, [autoLoop, resetKey]);

  const hasOverflow = canScrollLeft || canScrollRight;

  return (
    <div className="flex min-w-0 flex-1 items-center gap-2">
      {hasOverflow && (
        <button
          type="button"
          aria-label="Scroll filters left"
          disabled={!canScrollLeft}
          onPointerEnter={() => startScrolling(-1)}
          onPointerLeave={stopScrolling}
          onClick={() => viewportRef.current?.scrollBy({ left: -240, behavior: "smooth" })}
          className="shrink-0 px-1.5 py-1 text-[15px] text-neutral-500 transition-colors hover:text-neutral-900 disabled:opacity-25"
        >
          &#8592;
        </button>
      )}
      <div
        ref={viewportRef}
        onScroll={updateArrows}
        onPointerEnter={(event) => {
          if (!autoLoop || event.pointerType !== "mouse") return;
          autoPausedRef.current = true;
          event.currentTarget.scrollLeft = 0;
        }}
        onPointerLeave={(event) => {
          if (autoLoop && event.pointerType === "mouse") autoPausedRef.current = false;
        }}
        className="scrollbar-none flex min-w-0 flex-1 items-center gap-6 overflow-x-auto py-1"
      >
        {children}
      </div>
      {hasOverflow && (
        <button
          type="button"
          aria-label="Scroll filters right"
          disabled={!canScrollRight}
          onPointerEnter={() => startScrolling(1)}
          onPointerLeave={stopScrolling}
          onClick={() => viewportRef.current?.scrollBy({ left: 240, behavior: "smooth" })}
          className="shrink-0 px-1.5 py-1 text-[15px] text-neutral-500 transition-colors hover:text-neutral-900 disabled:opacity-25"
        >
          &#8594;
        </button>
      )}
    </div>
  );
}

function RailOption({
  label,
  active,
  onClick,
  onHover,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  onHover?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") onHover?.();
      }}
      className={`shrink-0 whitespace-nowrap text-[10px] uppercase tracking-[0.16em] transition-colors duration-200 ${
        active
          ? "font-semibold text-[var(--foreground)]"
          : "text-neutral-500 hover:text-neutral-900"
      }`}
    >
      {label}
    </button>
  );
}

// LOCATION dropdown — countries listed first, with a plus-icon expander on
// each country revealing its cities inline. Clicking the country header
// filters to that country; clicking a city filters to that city only.
function supportsDesktopHover(pointerType: string) {
  return (
    pointerType === "mouse" &&
    typeof window !== "undefined" &&
    window.matchMedia("(hover: hover) and (pointer: fine)").matches
  );
}

function LocationDropdown({
  value,
  tree,
  onChange,
}: {
  value: LocationValue;
  tree: Array<{ country: string; cities: string[] }>;
  onChange: (next: LocationValue) => void;
}) {
  const [open, setOpen] = useState(false);
  const [expandedCountries, setExpandedCountries] = useState<Set<string>>(() => {
    // Auto-expand the currently selected country so the active city is visible.
    if (value.kind === "city" || value.kind === "country") {
      return new Set([value.country]);
    }
    return new Set();
  });
  const ref = useRef<HTMLDivElement>(null);
  const hoverCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearHoverCloseTimer = () => {
    if (hoverCloseTimerRef.current) {
      window.clearTimeout(hoverCloseTimerRef.current);
      hoverCloseTimerRef.current = null;
    }
  };

  const handlePointerEnter = (pointerType: string) => {
    if (!supportsDesktopHover(pointerType)) return;
    clearHoverCloseTimer();
    setOpen(true);
  };

  const handlePointerLeave = (pointerType: string) => {
    if (!supportsDesktopHover(pointerType)) return;
    clearHoverCloseTimer();
    hoverCloseTimerRef.current = setTimeout(() => {
      setOpen(false);
      hoverCloseTimerRef.current = null;
    }, 180);
  };

  useEffect(
    () => () => {
      if (hoverCloseTimerRef.current) {
        window.clearTimeout(hoverCloseTimerRef.current);
      }
    },
    [],
  );

  useEffect(() => {
    if (!open) return;
    function onMouseDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const label = (() => {
    if (value.kind === "all") return "All locations";
    if (value.kind === "country") return value.country;
    return `${value.city}, ${value.country}`;
  })();

  const toggleCountryExpand = (country: string) => {
    setExpandedCountries((prev) => {
      const next = new Set(prev);
      if (next.has(country)) next.delete(country);
      else next.add(country);
      return next;
    });
  };

  return (
    <div
      ref={ref}
      className="relative"
      onPointerEnter={(event) => handlePointerEnter(event.pointerType)}
      onPointerLeave={(event) => handlePointerLeave(event.pointerType)}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className="flex shrink-0 items-center gap-2 whitespace-nowrap border border-neutral-200 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-neutral-700 transition duration-200 ease-out hover:border-neutral-400"
      >
        <span>{label}</span>
        <svg
          className={`h-2 w-2.5 transition-transform ${open ? "rotate-180" : ""}`}
          viewBox="0 0 10 6"
          fill="none"
          aria-hidden="true"
        >
          <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      </button>
      {open && (
        <div
          role="listbox"
          aria-label="Locations"
          className="absolute left-0 top-full z-30 mt-1 max-h-[28rem] w-60 overflow-y-auto border border-neutral-200 bg-white"
        >
          <button
            type="button"
            onClick={() => {
              onChange({ kind: "all" });
              setOpen(false);
            }}
            className={`flex w-full items-center justify-between border-b border-neutral-100 px-3 py-2 text-left text-[10px] uppercase tracking-[0.18em] transition duration-200 ease-out hover:bg-neutral-50 ${
              value.kind === "all" ? "text-neutral-900" : "text-neutral-500"
            }`}
          >
            <span>All locations</span>
            {value.kind === "all" && (
              <svg className="h-2.5 w-3 shrink-0" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M2 6l3 3 5-6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
          <ul role="group">
            {tree.map(({ country, cities }) => {
              const expanded = expandedCountries.has(country);
              const countryActive = value.kind === "country" && value.country === country;
              return (
                <li key={country} className="border-b border-neutral-100 last:border-0">
                  <div className="flex items-stretch">
                    <button
                      type="button"
                      onClick={() => {
                        onChange({ kind: "country", country });
                        // Keep country expanded so the user can drill into a
                        // city without re-clicking the +
                        setExpandedCountries((prev) => {
                          const next = new Set(prev);
                          next.add(country);
                          return next;
                        });
                      }}
                      className={`flex flex-1 items-center justify-between px-3 py-2 text-left text-[10px] uppercase tracking-[0.18em] transition duration-200 ease-out hover:bg-neutral-50 ${
                        countryActive ? "text-neutral-900" : "text-neutral-600"
                      }`}
                    >
                      <span>{country}</span>
                      {countryActive && (
                        <svg className="h-2.5 w-3 shrink-0" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                          <path d="M2 6l3 3 5-6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </button>
                    {cities.length > 0 && (
                      <button
                        type="button"
                        onClick={() => toggleCountryExpand(country)}
                        aria-label={expanded ? `Collapse ${country}` : `Expand ${country}`}
                        aria-expanded={expanded}
                        className="flex shrink-0 items-center justify-center px-3 text-neutral-500 transition duration-200 ease-out hover:bg-neutral-50 hover:text-neutral-900"
                      >
                        <span aria-hidden="true" className="text-[14px] leading-none">
                          {expanded ? "−" : "+"}
                        </span>
                      </button>
                    )}
                  </div>
                  {expanded && cities.length > 0 && (
                    <ul role="group" aria-label={`${country} cities`}>
                      {cities.map((city) => {
                        const cityActive =
                          value.kind === "city" &&
                          value.country === country &&
                          value.city === city;
                        return (
                          <li key={`${country}/${city}`}>
                            <button
                              type="button"
                              onClick={() => {
                                onChange({ kind: "city", country, city });
                                setOpen(false);
                              }}
                              className={`flex w-full items-center justify-between py-1.5 pl-7 pr-3 text-left text-[10px] uppercase tracking-[0.18em] transition duration-200 ease-out hover:bg-neutral-50 ${
                                cityActive ? "text-neutral-900" : "text-neutral-500"
                              }`}
                            >
                              <span>{city}</span>
                              {cityActive && (
                                <svg className="h-2.5 w-3 shrink-0" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                                  <path d="M2 6l3 3 5-6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              )}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

/**
 * Reusable dropdown for flat single-select filters (Tags, Year).
 * Same visual language as LocationDropdown — chevron button, click-
 * outside/Escape closes, active option gets a check. `allValue` is
 * the sentinel that represents "no filter"; clicking any option
 * commits the selection and closes the panel.
 */
function SelectDropdown<T extends string>({
  label,
  value,
  allValue,
  allLabel,
  options,
  onChange,
  className = "",
}: {
  label: string;
  value: T;
  allValue: T;
  allLabel: string;
  options: readonly T[];
  onChange: (next: T) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const hoverCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearHoverCloseTimer = () => {
    if (hoverCloseTimerRef.current) {
      window.clearTimeout(hoverCloseTimerRef.current);
      hoverCloseTimerRef.current = null;
    }
  };

  const handlePointerEnter = (pointerType: string) => {
    if (!supportsDesktopHover(pointerType)) return;
    clearHoverCloseTimer();
    setOpen(true);
  };

  const handlePointerLeave = (pointerType: string) => {
    if (!supportsDesktopHover(pointerType)) return;
    clearHoverCloseTimer();
    hoverCloseTimerRef.current = setTimeout(() => {
      setOpen(false);
      hoverCloseTimerRef.current = null;
    }, 180);
  };

  useEffect(
    () => () => {
      if (hoverCloseTimerRef.current) {
        window.clearTimeout(hoverCloseTimerRef.current);
      }
    },
    [],
  );

  useEffect(() => {
    if (!open) return;
    function onMouseDown(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const isAll = value === allValue;
  const displayLabel = isAll ? allLabel : (value as string);

  return (
    <div
      ref={ref}
      className={`relative ${className}`}
      onPointerEnter={(event) => handlePointerEnter(event.pointerType)}
      onPointerLeave={(event) => handlePointerLeave(event.pointerType)}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={label}
        className={`flex w-full shrink-0 items-center justify-between gap-2 whitespace-nowrap border px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] transition duration-200 ease-out md:w-auto ${
          isAll
            ? "border-neutral-200 text-neutral-700 hover:border-neutral-400"
            : "border-neutral-900 text-neutral-900"
        }`}
      >
        <span>{displayLabel}</span>
        <svg
          className={`h-2 w-2.5 shrink-0 transition-transform duration-200 ease-out ${open ? "rotate-180" : ""}`}
          viewBox="0 0 10 6"
          fill="none"
          aria-hidden="true"
        >
          <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      </button>
      {open && (
        <ul
          role="listbox"
          aria-label={label}
          className="absolute left-0 top-full z-30 mt-1 max-h-[min(60vh,28rem)] w-full min-w-[10rem] overflow-y-auto border border-neutral-200 bg-white md:w-auto"
        >
          {options.map((option) => {
            const active = value === option;
            const optionLabel = option === allValue ? allLabel : (option as string);
            return (
              <li key={option} role="option" aria-selected={active}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(option);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between px-3 py-2 text-left text-[10px] uppercase tracking-[0.18em] transition duration-200 ease-out hover:bg-neutral-50 ${
                    active ? "text-neutral-900" : "text-neutral-500"
                  }`}
                >
                  <span>{optionLabel}</span>
                  {active && (
                    <svg className="h-2.5 w-3 shrink-0" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                      <path
                        d="M2 6l3 3 5-6"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default function HomePageClient({
  initialIsMobile,
  showFeaturedBanners = true,
  showEditorialPromo = true,
  initialDensity,
}: {
  initialIsMobile: boolean;
  showFeaturedBanners?: boolean;
  showEditorialPromo?: boolean;
  initialDensity?: MasonryDensity;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [location, setLocation] = useState<LocationValue>({ kind: "all" });
  const [year, setYear] = useState("All");
  const [tag, setTag] = useState<SelectedTag>("ALL");
  const [onViewOnly, setOnViewOnly] = useState(false);
  // Timestamp used by the "On view" filter. Refreshed on mount and on
  // every toggle so filtering always uses a recent `Date.now()`, but
  // never during render (that would violate react-hooks/purity).
  const [nowMs, setNowMs] = useState(0);
  const navLinkClass = (href: string, emphasized = false) => {
    const active = href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
    return `transition-opacity hover:opacity-55 ${active ? "font-semibold" : ""} ${
      emphasized ? "font-semibold" : ""
    }`;
  };
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNowMs(Date.now());
  }, [onViewOnly]);
  // Feed density — two states on every viewport:
  //   normal: 1 (mobile) / 3 (desktop)  ← default
  //   dense : 2 (mobile) / 5 (desktop)
  // The toggle just flips between them; the icon spins 90° so the
  // active state is obvious.
  const [density, setDensity] = useState<MasonryDensity>(
    initialDensity ?? (initialIsMobile ? "dense" : "normal"),
  );
  useEffect(() => {
    if (!showFeaturedBanners || !window.matchMedia("(max-width: 767px)").matches) return;
    // Mobile Explore always starts in the two-column catalogue view.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDensity("dense");
  }, [showFeaturedBanners]);
  const cycleDensity = useCallback(() => {
    setDensity((current) => (current === "normal" ? "dense" : "normal"));
  }, []);
  const [search, setSearch] = useState("");
  const [desktopFilterPanel, setDesktopFilterPanel] = useState<DesktopFilterPanel>("tags");
  const [hoveredLocationCountry, setHoveredLocationCountry] = useState<string | null>(null);

  const selectTag = useCallback(
    (nextTag: SelectedTag) => {
      setTag(nextTag);
      const params = new URLSearchParams(window.location.search);

      if (nextTag === "ALL") {
        params.delete("tag");
      } else {
        params.set("tag", nextTag);
      }

      const query = params.toString();
      router.replace(query ? `/?${query}` : "/", { scroll: false });
    },
    [router],
  );

  // Build the country → cities tree once. Both keys are sorted alphabetically.
  const locationTree = useMemo(() => {
    const byCountry = new Map<string, Set<string>>();
    for (const exhibition of exhibitions) {
      const country = exhibition.country?.trim();
      if (!country) continue;
      if (!byCountry.has(country)) {
        byCountry.set(country, new Set());
      }
      if (exhibition.city?.trim()) {
        byCountry.get(country)!.add(exhibition.city.trim());
      }
    }
    return Array.from(byCountry.entries())
      .map(([country, cities]) => ({
        country,
        cities: Array.from(cities).sort((a, b) => a.localeCompare(b)),
      }))
      .sort((a, b) => a.country.localeCompare(b.country));
  }, []);

  const filtered = useMemo(
    () => {
      return exhibitions.filter((ex) => {
        const matchLocation = (() => {
          if (location.kind === "all") return true;
          if (location.kind === "country") return ex.country === location.country;
          return ex.country === location.country && ex.city === location.city;
        })();
        const matchYear = year === "All" || ex.year === year;
        const matchTag = tag === "ALL" || ex.tags.includes(tag);
        // `nowMs > 0` guards the very first render before useEffect
        // has run — if the flag somehow starts true, we play it safe
        // and treat as "no match" until we have a real timestamp.
        const matchOnView =
          !onViewOnly || (nowMs > 0 && isExhibitionOnView(ex, nowMs));
        const q = search.toLowerCase();
        const matchSearch =
          !q ||
          [
            displayExhibitionTitle(ex.title),
            ex.city,
            ex.country,
            ex.venue,
            ex.gallery,
            ex.description,
            ex.summary,
            ...(ex.artists ?? []),
          ].some((f) => f?.toLowerCase().includes(q));
        return (
          matchLocation &&
          matchYear &&
          matchTag &&
          matchOnView &&
          matchSearch
        );
      });
    },
    [location, year, tag, onViewOnly, nowMs, search],
  );

  const tagOptions: SelectedTag[] = ["ALL", ...semanticTags];
  const desktopLocationLabel =
    location.kind === "all"
      ? "All locations"
      : location.kind === "country"
        ? location.country
        : `${location.city}, ${location.country}`;
  const hoveredLocationCities = hoveredLocationCountry
    ? locationTree.find(({ country }) => country === hoveredLocationCountry)?.cities ?? []
    : [];

  return (
    <main className="min-h-screen bg-white">
      <Suspense fallback={null}>
        <TagQuerySync onChange={setTag} />
      </Suspense>
      {/* Header — sticky + high z-index so it remains visible above the
          slide-over panel when an exhibition detail is open. */}
      <header className="sticky top-0 z-50 h-[65px] bg-white px-4 md:px-8 lg:px-12">
        <nav
          className="relative flex h-full items-center justify-between md:grid md:grid-cols-[1fr_auto_1fr]"
          aria-label="Primary navigation"
        >
          <MobileNavigationMenu />
          <Link
            href="/"
            className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-[12px] font-medium tracking-tight text-neutral-900 transition-opacity hover:opacity-55 md:static md:translate-x-0 md:justify-self-start md:text-[16px]"
            aria-label="FindArt Platform home"
          >
            FindArt Platform
          </Link>
          <div className="editorial-serif hidden items-center gap-5 text-[11px] font-normal uppercase tracking-[0.08em] text-neutral-900 md:flex md:justify-self-center">
            <Link
              href="/"
              className={navLinkClass("/")}
            >
              Explore
            </Link>
            <Link href="/collect" className={navLinkClass("/collect")}>
              COLLECT
            </Link>
            <Link href="/exhibitions" className={navLinkClass("/exhibitions")}>
              Exhibitions
            </Link>
            <Link href="/editorial" className={navLinkClass("/editorial")}>
              Editorial
            </Link>
            <Link
              href="/submit"
              className={navLinkClass("/submit", true)}
            >
              Submit
            </Link>
          </div>
          <div className="flex items-center gap-3 justify-self-end md:gap-5">
            <Link
              href="/submit"
              className="editorial-serif text-[9px] font-semibold uppercase tracking-[0.24em] text-neutral-900 transition-opacity hover:opacity-55 md:hidden"
            >
              Submit
            </Link>
            <Link
              href="/saved"
              aria-label="View saved items"
              className="text-neutral-900 transition-opacity hover:opacity-55 focus-visible:outline-none"
            >
              <HeartIcon filled={false} className="h-4 w-4" />
            </Link>
            <ThemeToggleButton className="hidden md:flex" />
          </div>
        </nav>
        <NavigationProgress />
      </header>

      {showFeaturedBanners && (
        <>
          <MobileFeaturedCarousel />
          <DesktopFeaturedCarousel initialIsMobile={initialIsMobile} />
        </>
      )}

      {/* Filter bar — same on mobile and desktop now: the Filters
          collapsible button is gone, every filter is a dropdown
          (Tags → Location → Year), then the On view chip. Density
          + search live at the right edge on desktop; on mobile the
          density button sits after the On view chip and the search
          field is the row above. */}
      <div className="bg-white px-5 py-4 md:px-8 md:py-3 lg:px-12">
        <div className="space-y-3">
          {/* Mobile search — full-width row above the filter chips. */}
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search exhibitions..."
            className="w-full border-0 border-b border-neutral-300 bg-transparent pb-2 text-[12px] text-neutral-900 transition duration-200 ease-out placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none md:hidden"
          />

          {/* Mobile keeps the existing tap-driven dropdown controls. */}
          <div className="flex flex-wrap items-center gap-2 md:hidden">
            <SelectDropdown<SelectedTag>
              label="Tags"
              value={tag}
              allValue="ALL"
              allLabel="All tags"
              options={tagOptions}
              onChange={selectTag}
            />
            <LocationDropdown value={location} tree={locationTree} onChange={setLocation} />
            <SelectDropdown<string>
              label="Year"
              value={year}
              allValue="All"
              allLabel="All years"
              options={YEARS}
              onChange={setYear}
            />
            <FilterChip
              label="On view"
              active={onViewOnly}
              onClick={() => setOnViewOnly((v) => !v)}
            />

            <div className="ml-auto">
              <DensityToggleButton density={density} onCycle={cycleDensity} />
            </div>
          </div>

          {/* Desktop filter labels switch the horizontal option rail on hover. */}
          <div className="hidden items-center gap-3 md:flex">
            <DesktopFilterModeButton
              label={tag === "ALL" ? "All tags" : tag}
              active={desktopFilterPanel === "tags"}
              onHover={() => {
                setDesktopFilterPanel("tags");
                setHoveredLocationCountry(null);
              }}
            />
            <DesktopFilterModeButton
              label={desktopLocationLabel}
              active={desktopFilterPanel === "location"}
              onHover={() => {
                setDesktopFilterPanel("location");
                if (location.kind !== "all") setHoveredLocationCountry(location.country);
              }}
            />
            <DesktopFilterModeButton
              label={year === "All" ? "All years" : year}
              active={desktopFilterPanel === "year"}
              onHover={() => {
                setDesktopFilterPanel("year");
                setHoveredLocationCountry(null);
              }}
            />
            <FilterChip
              label="On view"
              active={onViewOnly}
              onClick={() => setOnViewOnly((value) => !value)}
            />
            <div className="ml-auto flex shrink-0 items-center gap-3">
              <DesktopSearch value={search} onChange={setSearch} />
              <DensityToggleButton density={density} onCycle={cycleDensity} />
            </div>
          </div>

          <div className="hidden min-w-0 items-center gap-4 pt-3 md:flex">
            <div className="min-w-0 flex-1">
              {desktopFilterPanel === "tags" && (
                <HorizontalFilterRail resetKey="tags" autoLoop>
                  {tagOptions.map((option) => (
                    <RailOption
                      key={option}
                      label={option === "ALL" ? "All tags" : option}
                      active={tag === option}
                      onClick={() => selectTag(option)}
                    />
                  ))}
                </HorizontalFilterRail>
              )}

              {desktopFilterPanel === "year" && (
                <HorizontalFilterRail resetKey="years">
                  {YEARS.map((option) => (
                    <RailOption
                      key={option}
                      label={option === "All" ? "All years" : option}
                      active={year === option}
                      onClick={() => setYear(option)}
                    />
                  ))}
                </HorizontalFilterRail>
              )}

              {desktopFilterPanel === "location" && (
                <div>
                  <HorizontalFilterRail resetKey="locations">
                    <RailOption
                      label="All locations"
                      active={location.kind === "all"}
                      onHover={() => setHoveredLocationCountry(null)}
                      onClick={() => {
                        setLocation({ kind: "all" });
                        setHoveredLocationCountry(null);
                      }}
                    />
                    {locationTree.map(({ country }) => (
                      <RailOption
                        key={country}
                        label={country}
                        active={location.kind !== "all" && location.country === country}
                        onHover={() => setHoveredLocationCountry(country)}
                        onClick={() => setLocation({ kind: "country", country })}
                      />
                    ))}
                  </HorizontalFilterRail>
                  {hoveredLocationCountry && hoveredLocationCities.length > 0 && (
                    <div className="pt-2">
                      <HorizontalFilterRail resetKey={`cities-${hoveredLocationCountry}`}>
                        {hoveredLocationCities.map((city) => (
                          <RailOption
                            key={`${hoveredLocationCountry}/${city}`}
                            label={city}
                            active={
                              location.kind === "city" &&
                              location.country === hoveredLocationCountry &&
                              location.city === city
                            }
                            onClick={() =>
                              setLocation({
                                kind: "city",
                                country: hoveredLocationCountry,
                                city,
                              })
                            }
                          />
                        ))}
                      </HorizontalFilterRail>
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Exhibition feed — CSS columns provides masonry without JS. Cards have
          their own `mb-[72px]` for row rhythm and `break-inside-avoid` to stay
          intact across column boundaries. */}
      <section className="bg-white px-5 pb-10 pt-3 md:px-8 md:pb-16 md:pt-4 lg:px-12 lg:pb-20">
        {filtered.length === 0 ? (
          <p className="text-[11px] uppercase tracking-[0.25em] text-neutral-400">
            No exhibitions match your filters.
          </p>
        ) : (
          <MasonryGrid
            exhibitions={filtered}
            eagerCount={1}
            initialIsMobile={initialIsMobile}
            density={density}
            editorialPromo={showEditorialPromo}
            hideMobileSubtitles={showEditorialPromo}
          />
        )}
      </section>
    </main>
  );
}
