"use client";

import Image from "next/image";
import Link from "next/link";
import type { Exhibition } from "@/data/exhibitions";
import { displayExhibitionTitle } from "@/lib/displayExhibitionTitle";
import { displayVenueText } from "@/lib/displayVenueText";
import { OnViewDot } from "./OnViewDot";
import { HeartIcon, useSavedExhibitions } from "./SavedExhibitions";
import { ViewportSlideshow } from "./ViewportSlideshow";

type ExhibitionCardProps = {
  exhibition: Exhibition;
  eager?: boolean;
  hideMobileSubtitle?: boolean;
  sizes?: string;
};

const DESKTOP_SLIDESHOW_SLUGS = new Set([
  "rot-summer",
  "make-me-yours",
  "who-composes-the-song-of-the-crickets",
  "everything-comes-together-while-pushing-all-apart",
  "rootkit",
  "profusion-antagonist-wishlist",
  "axes",
  "actualization-machine",
  "grass-on-roadside-4",
  "edges-that-blur-bodies-that-fold-into-something-other",
  "love",
  "kassandra",
  "incommunicability-is-itself-a-source-of-pleasures",
  "bidim-blo",
  "enter-woodland-spirits",
  "skeletal-scenes",
  "contempt",
  "limo",
  "farm",
  "lunar-ensemble-for-uprising-seas",
  "metal-memory",
  "distant-endless-hum",
  "fantasy-vanishes-in-flesh",
  "doubled-presence-in-a-disembodied-space",
  "ethereal-robes-of-vulnerability",
  "after-the-offerings",
  "24-preludes-op-34-no-22-in-g-minor-adagio",
  "triangle-reshapes-the-o-of-my-mouth",
  "luca",
  "the-room-i",
  "parade",
  "call-me-we-by-lom-of-lama",
  "massage-platz",
  "lullaby-blossoms",
  "parachute-group-exhibition",
  "ausserkoerperliche-erfahrung-wandering-spirit",
  "presence-by-proxy",
  "sweet-world-1",
  "fight-or-flight-sex-bethanien",
  "a-flower-is-growing-inside-me-nils-alix-tabeling",
  "flood-hannah-rowan",
  "mouth-sarah-friend",
  "nexus-open-studio-anais-gauthier",
  "dog-and-angel",
  "pulses-within",
  "kin-too",
  "eureka-by-koesy",
  "ritual-for-happiness-gudwin",
  "inner-licht-iacolare",
  "acacia-bloom",
  "chronic-inflammation-adler",
  "unzucht-kiss-the-devil-s-arse",
  "within-and-for-each-other",
  "i-am-just-a-dog",
  "ausgeweidet-gutted",
]);

const ALL_IMAGE_SLIDESHOW_SLUGS = new Set([
  "after-the-offerings",
  "sweet-world-1",
  "rot-summer",
]);

function CardSlideshow({ exhibition, title, sizes, eager }: { exhibition: Exhibition; title: string; sizes: string; eager: boolean }) {
  const slides = ALL_IMAGE_SLIDESHOW_SLUGS.has(exhibition.slug)
    ? exhibition.images
    : exhibition.images.filter((image) => image.orientation === "vertical");
  return (
    <ViewportSlideshow images={slides} alt={`${title} exhibition view`} sizes={sizes} priority={eager} />
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

export function ExhibitionCard({
  exhibition,
  eager = false,
  hideMobileSubtitle = false,
  sizes = "(min-width: 1024px) 31vw, (min-width: 768px) 47vw, 100vw",
}: ExhibitionCardProps) {
  const aspect = aspectClassForSlug(exhibition.slug);
  const title = displayExhibitionTitle(exhibition.title);
  const desktopSlideshow = DESKTOP_SLIDESHOW_SLUGS.has(exhibition.slug);
  const { isSaved, toggleSaved } = useSavedExhibitions();
  const saved = isSaved(exhibition.slug);

  return (
    // The card is placed inside a `.masonry-col` flex column by
    // MasonryGrid. Sizing and vertical spacing come from that parent
    // flex layout (48px column gap, 64px row gap), so the card itself
    // stays markup-only — no wrapper margins here.
    <article className="group relative">
      <Link href={`/exhibitions/${exhibition.slug}`} prefetch={false} className="block">
        <div className={`relative ${aspect} overflow-hidden rounded bg-neutral-100 md:rounded-none`}>
          {!desktopSlideshow && <Image
            src={exhibition.coverImage ?? exhibition.previewImage}
            alt={`${title} exhibition view`}
            fill
            className="object-cover transition-transform duration-500 ease-out md:group-hover:scale-[1.025]"
            priority={eager}
            {...(eager
              ? { fetchPriority: "high" as const }
              : { loading: "lazy" as const, fetchPriority: "low" as const })}
            sizes={sizes}
          />}
          {desktopSlideshow && (
            <CardSlideshow exhibition={exhibition} title={title} sizes={sizes} eager={eager} />
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
          <h2 className="editorial-serif break-words text-[clamp(0.9rem,4vw,1.3rem)] leading-[1.08] tracking-[-0.035em] md:text-[clamp(1rem,1.7vw,1.65rem)] md:leading-[1.02]">
            {title.toUpperCase()}
          </h2>
          <p
            className={`mt-2 text-[0.85em] uppercase tracking-[0.2em] text-[#888] md:text-[11px] md:tracking-[0.18em] md:text-neutral-500 ${
              hideMobileSubtitle ? "hidden md:block" : ""
            }`}
          >
            {displayVenueText(exhibition.venue)}
          </p>
        </div>
      </Link>
      {/* Desktop-only save chip — top-right of the image, appears on hover. */}
      <button
        type="button"
        aria-label={saved ? `Remove ${title} from saved exhibitions` : `Save ${title}`}
        aria-pressed={saved}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          toggleSaved(exhibition.slug);
        }}
        className={`absolute right-3 top-3 z-10 hidden h-9 w-9 items-center justify-center rounded-md border border-neutral-300 bg-white/85 text-neutral-900 shadow-sm backdrop-blur-sm transition-opacity duration-200 focus-visible:opacity-100 focus-visible:outline-none md:flex ${
          saved ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
      >
        <HeartIcon filled={saved} className="h-4 w-4" />
      </button>
    </article>
  );
}
