"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { getExhibition, type Exhibition } from "@/data/exhibitions";
import { displayExhibitionTitle } from "@/lib/displayExhibitionTitle";

type SubmitPageType = "exhibition" | "artist" | "index";

// Small GA4 wrapper: pushes an event to gtag if it's on the page.
// Silently no-ops in local dev / for users who blocked scripts. Kept in
// one place so all the submission-panel events read consistently.
function track(event: string, params: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  const w = window as unknown as {
    gtag?: (command: "event", name: string, params?: Record<string, unknown>) => void;
    dataLayer?: Array<Record<string, unknown>>;
  };
  try {
    if (typeof w.gtag === "function") {
      w.gtag("event", event, params);
    } else if (Array.isArray(w.dataLayer)) {
      w.dataLayer.push({ event, ...params });
    }
  } catch {
    // Analytics failures never break the UI.
  }
}

// Three exhibitions per submission type — real slugs in the archive.
// The panel cycles between them via the bottom strip, no other UI.
const RELATED_SLUGS: Record<SubmitPageType, string[]> = {
  exhibition: [
    "tangerine-reverie",
    "rot-summer",
    "techno-worlds-final-sampling",
  ],
  artist: [
    "nymphenbrunnen",
    "a-flower-is-growing-inside-me-nils-alix-tabeling",
    "the-jewel-box-nanna-starck",
  ],
  index: [
    "tangerine-reverie",
    "rot-summer",
    "techno-worlds-final-sampling",
  ],
};

// Layout intent: this component renders inline on mobile (below the
// heading and above the form) and sticky on desktop (right column).
// Sticky positioning is applied by the parent grid via a wrapper class.
export function SubmissionInfoPanel({
  submissionType,
}: {
  submissionType: SubmitPageType;
}) {
  const slugs = RELATED_SLUGS[submissionType];
  const exhibitions = slugs
    .map((slug) => getExhibition(slug))
    .filter((ex): ex is Exhibition => Boolean(ex));

  const [index, setIndex] = useState(0);
  const current = exhibitions[Math.min(index, exhibitions.length - 1)];

  // Fire a page-view once per submission type + a view event each time
  // the visible card changes (guarded to avoid re-render loops).
  const seenRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    const key = `pv:${submissionType}`;
    if (seenRef.current.has(key)) return;
    seenRef.current.add(key);
    track("submit_page_view", { submission_type: submissionType });
  }, [submissionType]);

  useEffect(() => {
    if (!current) return;
    const key = `view:${submissionType}:${current.slug}`;
    if (seenRef.current.has(key)) return;
    seenRef.current.add(key);
    track("submit_panel_card_view", {
      submission_type: submissionType,
      exhibition_slug: current.slug,
    });
  }, [current, submissionType]);

  if (!current) return null;

  const displayTitle = displayExhibitionTitle(current.title);
  const image = current.coverImage ?? current.previewImage;
  const href = `/exhibitions/${current.slug}`;
  const venue = current.gallery ?? current.venue;

  return (
    <aside className="border border-neutral-200 bg-white p-6 md:p-8">
      <p className="text-[10px] uppercase tracking-[0.28em] text-neutral-500">
        Related
      </p>

      <Link
        key={current.slug}
        href={href}
        onClick={() =>
          track("submit_panel_card_click", {
            submission_type: submissionType,
            exhibition_slug: current.slug,
          })
        }
        className="group mt-5 block"
      >
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-neutral-100">
          <Image
            src={image}
            alt={`${displayTitle} — published exhibition on FindArt`}
            fill
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
            sizes="(min-width: 1024px) 30vw, (min-width: 768px) 40vw, 90vw"
          />
        </div>
        <p className="mt-4 text-[10px] uppercase tracking-[0.24em] text-neutral-500">
          {[venue, current.city, current.year].filter(Boolean).join(" · ")}
        </p>
        <p className="editorial-serif mt-2 break-words text-[clamp(1rem,1.6vw,1.2rem)] leading-[1.15] tracking-[-0.02em] text-neutral-900">
          {displayTitle}
        </p>
        {current.artists && current.artists.length > 0 && (
          <p className="mt-1 text-[12px] uppercase tracking-[0.16em] text-neutral-600">
            {current.artists.join(", ")}
          </p>
        )}
      </Link>

      {/* Bottom strip — one short horizontal bar per card. Hover to
          switch. Focus + click also switch, so keyboard and touch work. */}
      <div className="mt-8 flex items-center justify-center gap-3">
        {exhibitions.map((ex, i) => {
          const active = i === index;
          return (
            <button
              key={ex.slug}
              type="button"
              onMouseEnter={() => setIndex(i)}
              onFocus={() => setIndex(i)}
              onClick={() => setIndex(i)}
              aria-label={`Show ${displayExhibitionTitle(ex.title)}`}
              aria-pressed={active}
              className="py-2"
            >
              <span
                className={`block h-[2px] w-9 transition-colors ${
                  active ? "bg-neutral-900" : "bg-neutral-300 hover:bg-neutral-500"
                }`}
              />
            </button>
          );
        })}
      </div>
    </aside>
  );
}

// Public analytics helper — used by the parent to emit the type-changed
// event without pulling the tracker into the page component.
export function trackSubmissionEvent(event: string, params?: Record<string, unknown>) {
  track(event, params);
}
