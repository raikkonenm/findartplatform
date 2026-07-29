"use client";

import { useEffect, useState } from "react";
import type { Exhibition } from "@/data/exhibitions";
import { ExhibitionCard } from "./ExhibitionCard";

// Determine how many columns the masonry grid should use. Mirrors the
// previous CSS breakpoints exactly: 1 column below 768px, 2 columns
// between 768–1023px, 3 columns from 1024px up. The initial value is
// seeded from a server-detected UA hint (`initialIsMobile` prop) so
// SSR HTML matches what the client hydrates to — no masonry CLS jump
// on mobile. After hydration, matchMedia takes over for genuine
// viewport changes (resize, orientation).
function useColumnCount(initialIsMobile: boolean): number {
  const [count, setCount] = useState(initialIsMobile ? 1 : 3);
  useEffect(() => {
    const single = window.matchMedia("(max-width: 767px)");
    const double = window.matchMedia("(max-width: 1023px)");
    const update = () => {
      if (single.matches) setCount(1);
      else if (double.matches) setCount(2);
      else setCount(3);
    };
    update();
    single.addEventListener("change", update);
    double.addEventListener("change", update);
    return () => {
      single.removeEventListener("change", update);
      double.removeEventListener("change", update);
    };
  }, []);
  return count;
}

type BucketItem = { exhibition: Exhibition; flatIdx: number };

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
}: {
  exhibitions: Exhibition[];
  eagerCount?: number;
  initialIsMobile?: boolean;
}) {
  const columnCount = useColumnCount(initialIsMobile);

  const columns: BucketItem[][] = Array.from({ length: columnCount }, () => []);
  exhibitions.forEach((exhibition, flatIdx) => {
    columns[flatIdx % columnCount].push({ exhibition, flatIdx });
  });

  return (
    <div className="masonry-rows">
      {columns.map((column, colIdx) => (
        <div className="masonry-col" key={colIdx}>
          {column.map(({ exhibition, flatIdx }) => (
            <ExhibitionCard
              key={exhibition.slug}
              exhibition={exhibition}
              eager={flatIdx < eagerCount}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
