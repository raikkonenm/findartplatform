"use client";

import { useEffect, useState } from "react";
import type { Exhibition } from "@/data/exhibitions";
import { EditorialPromoCard } from "./EditorialPromoCard";
import { ExhibitionCard } from "./ExhibitionCard";

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
function useColumnCount(initialIsMobile: boolean, density: MasonryDensity): number {
  const cols = COLUMNS_BY_DENSITY[density];
  const [count, setCount] = useState(initialIsMobile ? cols.small : cols.large);
  useEffect(() => {
    const single = window.matchMedia("(max-width: 767px)");
    const double = window.matchMedia("(max-width: 1023px)");
    const update = () => {
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
  return count;
}

type BucketItem =
  | { kind: "exhibition"; exhibition: Exhibition; flatIdx: number }
  | { kind: "editorial"; flatIdx: number };

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
}: {
  exhibitions: Exhibition[];
  eagerCount?: number;
  initialIsMobile?: boolean;
  density?: MasonryDensity;
  editorialPromo?: boolean;
  hideMobileSubtitles?: boolean;
}) {
  const columnCount = useColumnCount(initialIsMobile, density);

  const items: BucketItem[] = exhibitions.map((exhibition, flatIdx) => ({
    kind: "exhibition",
    exhibition,
    flatIdx,
  }));
  if (editorialPromo) {
    const editorialPromoIndex = Math.min(5, items.length);
    items.splice(editorialPromoIndex, 0, {
      kind: "editorial",
      flatIdx: editorialPromoIndex,
    });
  }

  const columns: BucketItem[][] = Array.from({ length: columnCount }, () => []);
  items.forEach((item, itemIndex) => {
    columns[itemIndex % columnCount].push(item);
  });

  return (
    <div className="archive-card-grid masonry-rows">
      {columns.map((column, colIdx) => (
        <div className="masonry-col" key={colIdx}>
          {column.map((item) =>
            item.kind === "editorial" ? (
              <EditorialPromoCard key="editorial-promo" />
            ) : (
              <ExhibitionCard
                key={item.exhibition.slug}
                exhibition={item.exhibition}
                eager={item.flatIdx < eagerCount}
                hideMobileSubtitle={hideMobileSubtitles}
              />
            ),
          )}
        </div>
      ))}
    </div>
  );
}
