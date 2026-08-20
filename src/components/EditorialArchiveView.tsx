"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { EditorialCard } from "./EditorialCard";
import { Header } from "./Header";
import { useSavedExhibitions } from "./SavedExhibitions";

type Banner = {
  type: "video" | "image";
  src: string;
  alt: string;
  duration: number;
  caption?: string;
  href?: string;
};

const VIDEO_BANNER: Banner = {
  type: "video",
  src: "/editorial/banner/1.mp4",
  alt: "Irene Molina",
  duration: 7500,
  caption: "IRENE MOLINA",
};
const IMAGE_BANNER: Banner = {
  type: "image",
  src: "/editorial/banner/3.webp",
  alt: "Isabelle Albuquerque",
  duration: 5000,
  caption: "ISABELLE ALBUQUERQUE",
  href: "/features/isabelle-albuquerque",
};

const MOBILE_BANNERS: Banner[] = [VIDEO_BANNER, IMAGE_BANNER];
const DESKTOP_BANNERS: Banner[] = [IMAGE_BANNER, VIDEO_BANNER];

function FeaturesBanner() {
  const [isDesktop, setIsDesktop] = useState(false);
  const [active, setActive] = useState(0);
  const pausedRef = useRef(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsDesktop(mq.matches);
    const onChange = (event: MediaQueryListEvent) => {
      setIsDesktop(event.matches);
      setActive(0);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const banners = isDesktop ? DESKTOP_BANNERS : MOBILE_BANNERS;
  const count = banners.length;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (pausedRef.current) return;
      setActive((current) => (current + 1) % count);
    }, banners[active].duration);
    return () => window.clearTimeout(timer);
  }, [active, count, banners]);

  const currentBanner = banners[active];
  const captionInner = currentBanner.caption ? (
    <span className="editorial-serif text-[clamp(0.9rem,2.2vw,1.15rem)] uppercase tracking-[0.24em] text-white drop-shadow-[0_2px_18px_rgba(0,0,0,0.5)]">
      {currentBanner.caption}
    </span>
  ) : null;

  return (
    <section aria-label="Features banners" className="relative">
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-neutral-100 md:aspect-auto md:h-screen">
        {banners.map((banner, index) =>
          banner.type === "video" ? (
            <video
              key={banner.src}
              src={banner.src}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              aria-label={banner.alt}
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-out ${
                index === active ? "opacity-100" : "opacity-0"
              }`}
            />
          ) : (
            <Image
              key={banner.src}
              src={banner.src}
              alt={index === 0 ? banner.alt : ""}
              fill
              unoptimized
              sizes="100vw"
              priority={index === 0}
              className={`object-cover transition-opacity duration-700 ease-out ${
                index === active ? "opacity-100" : "opacity-0"
              }`}
            />
          ),
        )}
        {captionInner && (
          currentBanner.href ? (
            <Link
              href={currentBanner.href}
              className="absolute inset-0 flex items-center justify-center transition-opacity duration-200 hover:opacity-90"
            >
              {captionInner}
            </Link>
          ) : (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              {captionInner}
            </div>
          )
        )}
      </div>
      <div className="absolute inset-x-0 bottom-4 flex justify-center gap-2">
        {banners.map((_, index) => (
          <button
            key={index}
            type="button"
            aria-label={`Show features banner ${index + 1}`}
            aria-current={index === active ? "true" : undefined}
            onClick={() => setActive(index)}
            onMouseEnter={() => {
              pausedRef.current = true;
              setActive(index);
            }}
            onMouseLeave={() => {
              pausedRef.current = false;
            }}
            className={`h-[3px] w-10 transition-colors duration-300 ${
              index === active ? "bg-white" : "bg-white/40"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
import {
  editorialSavedKey,
  type EditorialArtist,
} from "@/data/editorial";

function EditorialSearch({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const expanded = value.length > 0;

  return (
    <label className="group/search flex h-9 cursor-text items-center justify-end text-neutral-500">
      <span className="sr-only">Search articles</span>
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search articles"
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

const SECTIONS: { title: string; slugs: string[] }[] = [
  {
    title: "BODY / MUTATION",
    slugs: [
      "yukino-yamanaka",
      "isabelle-albuquerque",
      "anna-uddenberg",
      "sophia-gatzkan",
      "emma-beatrez",
      "que-fresca",
    ],
  },
  {
    title: "TECHNOLOGY / SYNTHETIC",
    slugs: ["00-zhang", "kim-myungchan", "koesy", "taewon-ahn"],
  },
  {
    title: "MYTH / RITUAL / SYMBOL",
    slugs: ["dew-kim", "xolo-cuintle", "arghavan-khosravi", "jacopo-pagin"],
  },
];

function FeaturesSection({
  title,
  artists,
  eagerFirst,
}: {
  title: string;
  artists: EditorialArtist[];
  eagerFirst: boolean;
}) {
  if (artists.length === 0) return null;
  return (
    <section aria-label={title} className="mt-12 md:mt-16">
      <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.28em] text-neutral-900 md:mb-6">
        {title}
      </h2>
      <div className="-mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-5 pb-2 md:mx-0 md:gap-6 md:px-0">
        {artists.map((artist, index) => (
          <div
            key={artist.slug}
            className="w-[70vw] shrink-0 snap-start md:w-[calc((100%-3*1.5rem)/4)] lg:w-[calc((100%-4*1.5rem)/5)]"
          >
            <EditorialCard artist={artist} eager={eagerFirst && index === 0} />
          </div>
        ))}
      </div>
    </section>
  );
}

export function EditorialArchiveView({ artists }: { artists: EditorialArtist[] }) {
  const { savedSlugs } = useSavedExhibitions();
  const [savedOnly, setSavedOnly] = useState(false);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("saved") === "1") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSavedOnly(true);
    }
  }, []);

  const bySlug = new Map(artists.map((artist) => [artist.slug, artist]));
  const usedSlugs = new Set<string>();
  const sectionData = SECTIONS.map((section) => {
    const sectionArtists = section.slugs
      .map((slug) => bySlug.get(slug))
      .filter((artist): artist is EditorialArtist => Boolean(artist));
    sectionArtists.forEach((artist) => usedSlugs.add(artist.slug));
    return { title: section.title, artists: sectionArtists };
  });
  const leftover = artists.filter((artist) => !usedSlugs.has(artist.slug));
  const finalSections = leftover.length > 0
    ? [...sectionData, { title: "MORE FROM THE ARCHIVE", artists: leftover }]
    : sectionData;

  const savedArtists = savedOnly
    ? artists.filter((artist) => savedSlugs.has(editorialSavedKey(artist.slug)))
    : null;

  const toggleSavedOnly = () => {
    const next = !savedOnly;
    const url = new URL(window.location.href);
    if (next) url.searchParams.set("saved", "1");
    else url.searchParams.delete("saved");
    window.history.replaceState(null, "", url);
    setSavedOnly(next);
  };

  return (
    <main className="min-h-screen overflow-x-hidden bg-white">
      <Header
        overlay
        savedOnly={savedOnly}
        onToggleSavedOnly={toggleSavedOnly}
        savedHref="/features?saved=1"
      />
      <FeaturesBanner />
      <section className="px-5 py-8 md:px-8 md:py-10 lg:px-12 lg:py-12">
        <div className="mb-8 flex items-center justify-between gap-5 md:mb-10">
          <a
            href="https://www.instagram.com/artcnomads/"
            className="text-[11px] uppercase tracking-[0.24em] text-neutral-900 transition-opacity hover:opacity-55"
          >
            By Art Curatorial Nomads &#8599;
          </a>
        </div>
        {savedArtists !== null ? (
          savedArtists.length === 0 ? (
            <p className="py-16 text-center text-[11px] uppercase tracking-[0.25em] text-neutral-400">
              No saved editorial yet
            </p>
          ) : (
            <div className="archive-card-grid grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-5 md:gap-y-16 lg:grid-cols-5">
              {savedArtists.map((artist, index) => (
                <EditorialCard key={artist.slug} artist={artist} eager={index === 0} />
              ))}
            </div>
          )
        ) : (
          finalSections.map((section, index) => (
            <FeaturesSection
              key={section.title}
              title={section.title}
              artists={section.artists}
              eagerFirst={index === 0}
            />
          ))
        )}
        <p className="mx-auto mt-16 text-center text-[clamp(1.2rem,2.2vw,2rem)] uppercase leading-tight tracking-[0.05em] md:mt-24">
          Read more on the{" "}
          <a
            href="https://www.instagram.com/artcnomads"
            className="font-semibold underline underline-offset-4 transition-opacity hover:opacity-55"
          >
            ArtNomads
          </a>{" "}
          Instagram ↗
        </p>
      </section>
    </main>
  );
}
