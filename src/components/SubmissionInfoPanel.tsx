"use client";

import Image from "next/image";
import Link from "next/link";
import { getExhibition, type Exhibition } from "@/data/exhibitions";
import { displayExhibitionTitle } from "@/lib/displayExhibitionTitle";

type SubmitPageType = "exhibition" | "artist" | "index";

// Small GA4 wrapper: pushes an event to gtag if it's on the page.
// Silently no-ops in local dev / for users who blocked scripts.
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

// Three real slugs per submission type, pulled from the archive.
// Displayed as a small horizontal row under the form.
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

export function RelatedExhibitionsRow({
  submissionType,
}: {
  submissionType: SubmitPageType;
}) {
  const exhibitions = RELATED_SLUGS[submissionType]
    .map((slug) => getExhibition(slug))
    .filter((ex): ex is Exhibition => Boolean(ex));

  if (exhibitions.length === 0) return null;

  return (
    <section className="mt-10 border-t border-neutral-200 pt-8">
      <p className="text-[10px] uppercase tracking-[0.28em] text-neutral-500">
        Related exhibitions
      </p>
      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-5">
        {exhibitions.map((exhibition) => {
          const displayTitle = displayExhibitionTitle(exhibition.title);
          const image = exhibition.coverImage ?? exhibition.previewImage;
          const venue = exhibition.gallery ?? exhibition.venue;
          const href = `/exhibitions/${exhibition.slug}`;
          return (
            <Link
              key={exhibition.slug}
              href={href}
              onClick={() =>
                track("submit_related_click", {
                  submission_type: submissionType,
                  exhibition_slug: exhibition.slug,
                })
              }
              className="group block min-w-0"
            >
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-neutral-100">
                <Image
                  src={image}
                  alt={`${displayTitle} — published exhibition on FindArt`}
                  fill
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
                  sizes="(min-width: 640px) 22vw, 90vw"
                />
              </div>
              <p className="mt-2.5 text-[9px] uppercase tracking-[0.22em] text-neutral-500">
                {[venue, exhibition.city, exhibition.year].filter(Boolean).join(" · ")}
              </p>
              <p className="editorial-serif mt-1.5 break-words text-[13px] leading-[1.15] tracking-[-0.02em] text-neutral-900">
                {displayTitle}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

// Public analytics helper — used by the parent to emit the type-changed
// event without pulling the tracker into the page component.
export function trackSubmissionEvent(event: string, params?: Record<string, unknown>) {
  track(event, params);
}
