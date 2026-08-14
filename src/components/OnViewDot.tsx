"use client";

import { useEffect, useState } from "react";
import { isExhibitionOnView } from "@/lib/isOnView";

/**
 * Renders a small pulsing green dot when the given exhibition is
 * currently on view, i.e. today falls between its startDate and
 * endDate. Nothing is rendered otherwise, including for exhibitions
 * with missing or unparseable dates (safe fallback).
 *
 * The decision is made strictly in `useEffect` so SSR emits an empty
 * dot regardless of the build day; each visitor's client then flips
 * it on with their own `Date.now()`, keeping the flag correct on
 * dynamic and SSG pages alike.
 */
export function OnViewDot({
  startDate,
  endDate,
}: {
  startDate?: string;
  endDate?: string;
}) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVisible(isExhibitionOnView({ startDate, endDate }, Date.now()));
  }, [startDate, endDate]);
  if (!visible) return null;
  return <span className="on-view-dot" aria-label="On view now" />;
}
