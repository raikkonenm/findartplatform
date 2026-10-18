"use client";

import { useEffect, useState, type ReactNode } from "react";
import type { Exhibition } from "@/data/exhibitions";
import type { EditorialArtist } from "@/data/editorial";
import { EditorialCard } from "./EditorialCard";
import { EditorialPromoCard } from "./EditorialPromoCard";
import { ExhibitionCard } from "./ExhibitionCard";
import { SubmitAdCard } from "./SubmitAdCard";

export type MasonryDensity = "normal" | "dense";

// Per-breakpoint column counts for each density mode:
//   normal → 1 (mobile) / 2 (tablet) / 3 (desktop)  ← current default
//   dense  → 2 (mobile) / 3 (tablet) / 5 (desktop)
// The density toggle simply flips between normal and dense on
// every viewport. Everything else in the layout — row-major
// bucketing, gap, per-card aspect ratios — stays untouched.
const COLUMNS_BY_DENSITY: Record<MasonryDensity, { small: number; medium: number; large: number }> = {
  normal: { small: 1, medium: 2, large: 3 },
  dense: { small: 2, medium: 3, large: 5 },
};

// Determine how many columns the masonry grid should use. Mirrors the
// previous CSS breakpoints exactly: <768px = small, 768–1023px = medium,
// ≥1024px = large. The initial value is seeded from a server-detected UA
// hint (`initialIsMobile` prop) so SSR HTML matches what the client
// hydrates to — no masonry CLS jump on mobile. After hydration,
// matchMedia takes over for genuine viewport changes (resize, orientation).
function useColumnCount(initialIsMobile: boolean, density: MasonryDensity): [number, boolean] {
  const cols = COLUMNS_BY_DENSITY[density];
  const [count, setCount] = useState(initialIsMobile ? cols.small : cols.large);
  const [isMobile, setIsMobile] = useState(initialIsMobile);
  useEffect(() => {
    const single = window.matchMedia("(max-width: 767px)");
    const double = window.matchMedia("(max-width: 1023px)");
    const update = () => {
      setIsMobile(single.matches);
      if (single.matches) setCount(cols.small);
      else if (double.matches) setCount(cols.medium);
      else setCount(cols.large);
    };
    update();
    single.addEventListener("change", update);
    double.addEventListener("change", update);
    return () => {
      single.removeEventListener("change", update);
      double.removeEventListener("change", update);
    };
  }, [cols.small, cols.medium, cols.large]);
  return [count, isMobile];
}

type BucketItem =
  | { kind: "exhibition"; exhibition: Exhibition; flatIdx: number }
  | { kind: "editorial"; flatIdx: number }
  | { kind: "submit-ad"; flatIdx: number }
  | { kind: "artist"; artist: EditorialArtist; flatIdx: number };

// Interleave editorial artist cards among exhibitions so no two artist
// cards land adjacent. Gap = ceil(exhibitions / (artists + 1)) with a
// floor of 2 to protect against tiny inputs.
function interleaveArtists(
  exhibitions: Exhibition[],
  artists: EditorialArtist[],
): BucketItem[] {
  if (artists.length === 0) {
    return exhibitions.map((exhibition, flatIdx) => ({
      kind: "exhibition" as const,
      exhibition,
      flatIdx,
    }));
  }
  const gap = Math.max(2, Math.ceil(exhibitions.length / (artists.length + 1)));
  const out: BucketItem[] = [];
  let artistIndex = 0;
  let flatIdx = 0;
  exhibitions.forEach((exhibition, exhibitionIndex) => {
    out.push({ kind: "exhibition", exhibition, flatIdx: flatIdx++ });
    if (
      (exhibitionIndex + 1) % gap === 0 &&
      artistIndex < artists.length
    ) {
      out.push({ kind: "artist", artist: artists[artistIndex++], flatIdx: flatIdx++ });
    }
  });
  while (artistIndex < artists.length) {
    out.push({ kind: "artist", artist: artists[artistIndex++], flatIdx: flatIdx++ });
  }
  return out;
}

/**
 * Row-major masonry grid.
 *
 * Distributes exhibitions across N columns in round-robin order
 * (card i goes to column i % N). Each column renders top-to-bottom
 * as a flex column, so the staggered masonry look — cards of
 * different heights, columns NOT aligned by row — is preserved.
 * The visible top row reads exhibitions 0, 1, ..., N-1 in order.
 *
 * `eagerCount` marks the first N flat-index cards for eager image
 * loading (defaults to 0). The flat index is the position of the
 * card in the input `exhibitions` array, not its position inside
 * whichever column it lands in.
 */
export function MasonryGrid({
  exhibitions,
  eagerCount = 0,
  initialIsMobile = false,
  density = "normal",
  editorialPromo = false,
  hideMobileSubtitles = false,
  interleavedArtists,
  pinSubmitAd = false,
  latestOpportunities,
}: {
  exhibitions: Exhibition[];
  eagerCount?: number;
  initialIsMobile?: boolean;
  density?: MasonryDensity;
  editorialPromo?: boolean;
  hideMobileSubtitles?: boolean;
  interleavedArtists?: EditorialArtist[];
  /**
   * When true, splice a static Submit-Exhibition ad card into the feed at
   * flat index 6 — the second slot of the second row in the dense
   * 5-column desktop grid. See `SubmitAdCard`.
   */
  pinSubmitAd?: boolean;
  /** Desktop: top of last column. Mobile: in the last column after four feed cards. */
  latestOpportunities?: (isMobile: boolean) => ReactNode;
}) {
  const [columnCount, isMobile] = useColumnCount(initialIsMobile, density);

  const items: BucketItem[] = interleavedArtists && interleavedArtists.length > 0
    ? interleaveArtists(exhibitions, interleavedArtists)
    : exhibitions.map((exhibition, flatIdx) => ({
        kind: "exhibition",
        exhibition,
        flatIdx,
      }));
  // Splice pinned cards into the flat items list. Each pinned index is
  // the FINAL slot that card should occupy, so we splice from the
  // LOWEST final index upward — then each subsequent splice targets a
  // slot that's already stable because earlier (lower) splices have
  // been applied. Dense desktop grid = 5 columns, round-robin, so flat
  // index N lands at column (N % 5), row floor(N / 5).
  //   - Submit ad                 → index 8  = col 3 row 2 (row 2 pos 4)
  //   - Features (editorialPromo) → index 16 = col 1 row 4 (row 4 pos 2)
  if (pinSubmitAd) {
    const submitAdIndex = Math.min(8, items.length);
    items.splice(submitAdIndex, 0, {
      kind: "submit-ad",
      flatIdx: submitAdIndex,
    });
  }
  if (editorialPromo) {
    const editorialPromoIndex = Math.min(16, items.length);
    items.splice(editorialPromoIndex, 0, {
      kind: "editorial",
      flatIdx: editorialPromoIndex,
    });
  }

  const columns: BucketItem[][] = Array.from({ length: columnCount }, () => []);
  items.forEach((item, itemIndex) => {
    columns[itemIndex % columnCount].push(item);
  });

  const opportunityModule = latestOpportunities?.(isMobile);

  const renderItem = (item: BucketItem) => {
    if (item.kind === "editorial") {
      return <EditorialPromoCard key="editorial-promo" />;
    }
    if (item.kind === "submit-ad") {
      return <SubmitAdCard key="submit-ad" />;
    }
    if (item.kind === "artist") {
      return <EditorialCard key={`artist-${item.artist.slug}`} artist={item.artist} />;
    }
    return (
      <ExhibitionCard
        key={item.exhibition.slug}
        exhibition={item.exhibition}
        eager={item.flatIdx < eagerCount}
        hideMobileSubtitle={hideMobileSubtitles}
      />
    );
  };

  // Insert after bucketing: exhibitions keep their existing column and order,
  // and each column keeps its natural heights and gaps around the module.
  const moduleIndex = isMobile ? Math.ceil(4 / columnCount) : 0;
  return (
    <div className="archive-card-grid masonry-rows">
      {columns.map((column, colIdx) => (
        <div className="masonry-col" key={colIdx}>
          {colIdx === columnCount - 1 ? (
            <>
              {column.slice(0, moduleIndex).map(renderItem)}
              {opportunityModule}
              {column.slice(moduleIndex).map(renderItem)}
            </>
          ) : column.map(renderItem)}
        </div>
      ))}
    </div>
  );
}
