"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { getExhibition } from "@/data/exhibitions";
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

// One row in the What-You-Get list. Structure is deliberately editorial:
// a short bold label above a one-line prose sentence, no icons.
type BenefitItem = { label: string; body: string };

type ProcessStep = { label: string; body: string };

type FeeInfo = {
  amount: string;              // "$10"
  note: string;                // caveat sentence
  reviewNote?: string;         // optional review-time line
};

// Static per-submission-type content model. Copy is short and factual —
// no invented promises, no marketing verbs. The Example uses a real
// FindArt exhibition slug so the card is a live preview and its "View
// example →" link points at a page that actually exists.
type PanelContent = {
  benefitsHeadline: string;
  benefits: BenefitItem[];
  exampleExhibitionSlug: string | null;
  exampleLabel: string;
  processHeadline: string;
  processSteps: ProcessStep[];
  fee: FeeInfo;
};

const CONTENT: Record<SubmitPageType, PanelContent> = {
  exhibition: {
    benefitsHeadline: "What you get",
    benefits: [
      {
        label: "Permanent exhibition page",
        body: "Selected exhibitions receive a dedicated FindArt exhibition page.",
      },
      {
        label: "Connected across the archive",
        body: "Linked through artist, venue, city, country, year and topics.",
      },
      {
        label: "FindArt discovery",
        body: "The exhibition becomes part of the searchable archive and can appear across related archive and editorial pages.",
      },
      {
        label: "Instagram publication",
        body: "Selected exhibitions can also be published through @findart.platform.",
      },
    ],
    exampleExhibitionSlug: "tangerine-reverie",
    exampleLabel: "A recent published submission",
    processHeadline: "How it works",
    processSteps: [
      { label: "Submit your materials", body: "Send images, exhibition text and metadata via the form." },
      { label: "Curatorial review", body: "The submission is reviewed by the FindArt editorial team." },
      { label: "Selected submissions are published", body: "Approved exhibitions become part of the FindArt archive." },
    ],
    fee: {
      amount: "$10",
      note: "The submission fee covers curatorial review and does not guarantee publication.",
      reviewNote: "Usually reviewed within a few days.",
    },
  },
  artist: {
    benefitsHeadline: "What you get",
    benefits: [
      {
        label: "Curatorial review",
        body: "Your practice is reviewed by the FindArt editorial team.",
      },
      {
        label: "Consideration for Features",
        body: "Selected practices can be considered for editorial Features on FindArt.",
      },
      {
        label: "Internal artist archive",
        body: "Portfolios are added to our internal artist research archive used across future editorial selections.",
      },
      {
        label: "Instagram consideration",
        body: "Selected artists can be published through @findart.platform.",
      },
    ],
    exampleExhibitionSlug: "nymphenbrunnen",
    exampleLabel: "A recent artist Feature context",
    processHeadline: "How it works",
    processSteps: [
      { label: "Submit your portfolio", body: "Send bio, works and links via the form." },
      { label: "Curatorial review", body: "Reviewed for editorial fit with current FindArt selections." },
      { label: "Selected practices are contacted", body: "For possible Features, Editorial inclusion or Instagram publication." },
    ],
    fee: {
      amount: "$10",
      note: "The submission fee covers curatorial review and does not guarantee publication.",
      reviewNote: "Usually reviewed within a few days.",
    },
  },
  index: {
    benefitsHeadline: "What you get",
    benefits: [
      {
        label: "Directory listing",
        body: "Your site is added to the FindArt Index — a curated directory of independent contemporary-art web presences.",
      },
      {
        label: "Site-wide discovery",
        body: "The listing is discoverable through the FindArt search and connected across the platform.",
      },
      {
        label: "Editorial context",
        body: "Curated alongside artists, studios and projects already documented by FindArt.",
      },
    ],
    exampleExhibitionSlug: null,
    exampleLabel: "How Index listings live on FindArt",
    processHeadline: "How it works",
    processSteps: [
      { label: "Submit your website", body: "Send the URL and a short description via the form." },
      { label: "Curatorial review", body: "Reviewed for editorial and curatorial fit with the Index." },
      { label: "Selected sites are listed", body: "Approved websites join the FindArt Index directory." },
    ],
    fee: {
      amount: "$10",
      note: "The submission fee covers curatorial review and does not guarantee listing.",
      reviewNote: "Usually reviewed within a few days.",
    },
  },
};

type Tab = "benefits" | "example" | "process";
const TABS: { key: Tab; label: string }[] = [
  { key: "benefits", label: "Benefits" },
  { key: "example", label: "Example" },
  { key: "process", label: "Process" },
];

// Layout intent: this component renders inline on mobile (below the
// form) and sticky on desktop (right column). Sticky positioning is
// applied by the parent grid via a wrapper class — the component
// stays presentational and layout-agnostic.
export function SubmissionInfoPanel({
  submissionType,
}: {
  submissionType: SubmitPageType;
}) {
  const content = CONTENT[submissionType];
  const [tab, setTab] = useState<Tab>("benefits");
  // First-view detection per tab so we only track the "viewed" event
  // once per session per tab per submission type — avoids inflating
  // counts on every re-render.
  const viewedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Page-view for the submit form. Fires once per submission type
    // as the user lands or switches. Panel view fires alongside.
    const key = `pv:${submissionType}`;
    if (viewedRef.current.has(key)) return;
    viewedRef.current.add(key);
    track("submit_page_view", { submission_type: submissionType });
  }, [submissionType]);

  useEffect(() => {
    const key = `tab:${submissionType}:${tab}`;
    if (viewedRef.current.has(key)) return;
    viewedRef.current.add(key);
    track("submit_panel_tab_view", { submission_type: submissionType, tab });
  }, [tab, submissionType]);

  return (
    <aside className="border border-neutral-200 bg-white p-6 md:p-8">
      <div className="min-h-[380px]">
        {tab === "benefits" && (
          <div>
            <p className="text-[10px] uppercase tracking-[0.28em] text-neutral-500">
              {content.benefitsHeadline}
            </p>
            <ul className="mt-4 space-y-4 text-[13.5px] leading-[1.55] text-neutral-800">
              {content.benefits.map((item) => (
                <li key={item.label}>
                  <p className="font-semibold text-neutral-900">{item.label}</p>
                  <p className="mt-1 text-neutral-700">{item.body}</p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {tab === "example" && <ExampleCard content={content} submissionType={submissionType} />}

        {tab === "process" && (
          <div>
            <p className="text-[10px] uppercase tracking-[0.28em] text-neutral-500">
              {content.processHeadline}
            </p>
            <ol className="mt-4 space-y-4 text-[13.5px] leading-[1.55] text-neutral-800">
              {content.processSteps.map((step, i) => (
                <li key={step.label} className="grid grid-cols-[28px_1fr] gap-3">
                  <span className="text-[10px] uppercase tracking-[0.24em] text-neutral-500">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <p className="font-semibold text-neutral-900">{step.label}</p>
                    <p className="mt-1 text-neutral-700">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="mt-8 border-t border-neutral-200 pt-6">
              <p className="text-[10px] uppercase tracking-[0.28em] text-neutral-500">Submission fee</p>
              <p className="mt-2 text-[22px] leading-[1] text-neutral-900">{content.fee.amount}</p>
              <p className="mt-3 text-[12px] leading-[1.55] text-neutral-600">{content.fee.note}</p>
              {content.fee.reviewNote && (
                <p className="mt-1 text-[12px] leading-[1.55] text-neutral-600">{content.fee.reviewNote}</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom strip — three short horizontal bars. Hover a bar to
          switch the visible card. Tap on touch (no hover) also works.
          No auto-rotation. */}
      <div className="mt-8 flex items-center justify-center gap-3">
        {TABS.map(({ key, label }) => {
          const active = tab === key;
          return (
            <button
              key={key}
              type="button"
              onMouseEnter={() => setTab(key)}
              onFocus={() => setTab(key)}
              onClick={() => setTab(key)}
              aria-label={`Show ${label}`}
              aria-pressed={active}
              className="group flex flex-col items-center gap-1.5 py-2"
            >
              <span
                className={`block h-[2px] w-9 transition-colors ${
                  active ? "bg-neutral-900" : "bg-neutral-300 group-hover:bg-neutral-500"
                }`}
              />
              <span
                className={`text-[9px] uppercase tracking-[0.22em] transition-colors ${
                  active ? "text-neutral-900" : "text-neutral-400 group-hover:text-neutral-700"
                }`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}

function ExampleCard({
  content,
  submissionType,
}: {
  content: PanelContent;
  submissionType: SubmitPageType;
}) {
  const example = content.exampleExhibitionSlug
    ? getExhibition(content.exampleExhibitionSlug)
    : undefined;

  if (!example) {
    return (
      <div>
        <p className="text-[10px] uppercase tracking-[0.28em] text-neutral-500">
          {content.exampleLabel}
        </p>
        <p className="mt-4 text-[13.5px] leading-[1.55] text-neutral-700">
          Approved submissions live on FindArt as part of the searchable archive and can be linked to from artists, venues and topics.
        </p>
      </div>
    );
  }

  const displayTitle = displayExhibitionTitle(example.title);
  const image = example.coverImage ?? example.previewImage;
  const href = `/exhibitions/${example.slug}`;
  const venue = example.gallery ?? example.venue;

  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.28em] text-neutral-500">
        {content.exampleLabel}
      </p>
      <Link
        href={href}
        onClick={() =>
          track("submit_panel_example_click", {
            submission_type: submissionType,
            example_slug: example.slug,
          })
        }
        className="group mt-4 block"
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
          {venue ?? "Published on FindArt"}
          {example.city ? ` · ${example.city}` : ""}
          {example.year ? ` · ${example.year}` : ""}
        </p>
        <p className="editorial-serif mt-2 break-words text-[clamp(1rem,1.6vw,1.15rem)] leading-[1.15] tracking-[-0.02em] text-neutral-900">
          {displayTitle}
        </p>
        {example.artists && example.artists.length > 0 && (
          <p className="mt-1 text-[12px] uppercase tracking-[0.16em] text-neutral-600">
            {example.artists.join(", ")}
          </p>
        )}
        <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-900">
          View example →
        </p>
      </Link>
    </div>
  );
}

// Public analytics helper — used by the parent to emit the type-changed
// event without pulling the tracker into the page component.
export function trackSubmissionEvent(event: string, params?: Record<string, unknown>) {
  track(event, params);
}
