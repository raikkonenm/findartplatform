"use client";

import { useEffect, useState } from "react";
import { SubmissionForm } from "./SubmissionForm";
import { SubmissionInfoPanel, trackSubmissionEvent } from "./SubmissionInfoPanel";

type SubmitPageType = "exhibition" | "artist" | "index";

const SUBMISSION_TYPES: SubmitPageType[] = ["exhibition", "artist", "index"];

// Copy above the form. Kept short — the detailed pitch lives in the
// right-hand sticky panel now, so this row only needs to name the
// action and one one-line follow-up. Marketing verbs stay out.
const CONTENT: Record<SubmitPageType, {
  optionLabel: string;
  heading: string;
  intro: string;
  secondaryIntro?: string;
}> = {
  exhibition: {
    optionLabel: "Exhibition",
    heading: "SUBMIT TO FINDART",
    intro:
      "Submit your exhibition to FindArt Platform — an international contemporary art archive documenting exhibitions across galleries, institutions and independent spaces worldwide.",
    secondaryIntro:
      "Selected submissions become part of the FindArt archive and are connected through artists, venues, cities, years and topics.",
  },
  artist: {
    optionLabel: "As an artist to Artcnomads",
    heading: "SUBMIT TO ARTCNOMADS",
    intro:
      "Submit your practice for curatorial review and consideration for FindArt Editorial Features, selections and Instagram publication.",
    secondaryIntro:
      "Selected practices are connected across the archive through topics, cities and related exhibitions.",
  },
  index: {
    optionLabel: "Website",
    heading: "SUBMIT WEBSITE TO FINDART",
    intro:
      "Add your artist, studio or project website to the FindArt Index — a curated directory of independent contemporary-art web presences.",
    secondaryIntro:
      "Selected listings are discoverable through FindArt search and connected to the wider archive.",
  },
};

export function SubmissionExperience() {
  const [submissionType, setSubmissionType] = useState<SubmitPageType>("exhibition");
  const content = CONTENT[submissionType];

  useEffect(() => {
    const paramValue = new URLSearchParams(window.location.search).get("type");
    if (paramValue && (SUBMISSION_TYPES as string[]).includes(paramValue)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSubmissionType(paramValue as SubmitPageType);
    }
  }, []);

  // Sync ?type= into the URL whenever the user picks something new, so
  // the link is copy-pasteable and the browser Back button behaves.
  const handleTypeChange = (next: SubmitPageType) => {
    setSubmissionType(next);
    const url = new URL(window.location.href);
    url.searchParams.set("type", next);
    window.history.replaceState(null, "", url);
    trackSubmissionEvent("submit_type_selected", { submission_type: next });
  };

  // Layout intent:
  //   - Mobile (< md): stacks in the order requested — title/selector →
  //     intro → info panel (below form spec order the user asked for is
  //     panel-above-form because they want to see benefits BEFORE
  //     filling anything out) → form.
  //   - Desktop (md+): two columns. Left ≈ 60% form. Right ≈ 40% info
  //     panel, sticky to the viewport so it stays with the user as
  //     they scroll through the form.
  // Layout intent:
  //   Mobile stacks in three flow slots, in this order:
  //     1) heading + selector + intro
  //     2) info panel (BENEFITS / EXAMPLE / PROCESS)
  //     3) form
  //   The user asked for the panel to sit ABOVE the form on mobile so
  //   the value proposition is visible before scrolling into fields.
  //   Desktop merges (1) + (3) into the left column and pins the panel
  //   sticky in the right column.
  return (
    <div className="mx-auto w-full max-w-6xl md:grid md:grid-cols-[minmax(0,52fr)_minmax(0,48fr)] md:gap-16 lg:gap-20">
      {/* Slot 1 — heading + selector + intro. Left column on desktop. */}
      <div className="order-1 flex flex-col gap-8 md:col-start-1 md:row-start-1">
        <div>
          <p className="text-[10px] uppercase tracking-[0.28em] text-neutral-500">Open Submission</p>
          <h1 className="editorial-serif mt-3 text-[clamp(1.5rem,3.4vw,2.2rem)] uppercase leading-[1.02] tracking-[-0.02em] text-neutral-900">
            {content.heading}
          </h1>
        </div>

        <label className="block">
          <span className="mb-3 block text-[10px] uppercase tracking-[0.28em] text-neutral-500">
            I want submit
          </span>
          <div className="relative">
            <select
              value={submissionType}
              onChange={(event) => handleTypeChange(event.target.value as SubmitPageType)}
              className="w-full cursor-pointer appearance-none border border-neutral-300 bg-white px-5 py-4 pr-12 text-[15px] text-neutral-900 outline-none transition-colors hover:border-neutral-500 focus:border-neutral-900"
            >
              {SUBMISSION_TYPES.map((option) => (
                <option key={option} value={option}>
                  {CONTENT[option].optionLabel}
                </option>
              ))}
            </select>
            <span
              aria-hidden="true"
              className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-[10px] text-neutral-500"
            >
              ▼
            </span>
          </div>
        </label>

        <div className="space-y-3 text-[15px] leading-[1.65] text-neutral-700 md:text-[16px]">
          <p>{content.intro}</p>
          {content.secondaryIntro && (
            <p className="text-neutral-600">{content.secondaryIntro}</p>
          )}
        </div>
      </div>

      {/* Slot 2 — info panel. Second on mobile, right column sticky on
          desktop. Sticky top matches the header height offset. */}
      <div className="order-2 mt-10 md:order-none md:col-start-2 md:row-start-1 md:row-span-2 md:mt-0">
        <div className="md:sticky md:top-[105px]">
          <SubmissionInfoPanel submissionType={submissionType} />
        </div>
      </div>

      {/* Slot 3 — form. Third on mobile, sits under Slot 1 on desktop. */}
      <div className="order-3 mt-10 md:mt-8 md:col-start-1 md:row-start-2">
        <SubmissionForm key={submissionType} submissionType={submissionType} />
      </div>
    </div>
  );
}
