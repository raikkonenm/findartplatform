"use client";

import { useEffect, useState } from "react";
import { GUIDELINES, SubmissionForm } from "./SubmissionForm";
import { RelatedExhibitionsRow, trackSubmissionEvent } from "./SubmissionInfoPanel";

type SubmitPageType = "exhibition" | "artist" | "index";

const SUBMISSION_TYPES: SubmitPageType[] = ["exhibition", "artist", "index"];

// Copy above the form. Kept short — the value proposition is the
// couple of intro sentences; a small Related Exhibitions strip below
// the form gives the user something to browse if they're not ready
// to submit yet.
const CONTENT: Record<SubmitPageType, {
  optionLabel: string;
  heading: string;
  intro: string;
  secondaryIntro?: string;
}> = {
  exhibition: {
    optionLabel: "Exhibition",
    heading: "SUBMIT EXHIBITION TO FINDART",
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

  const handleTypeChange = (next: SubmitPageType) => {
    setSubmissionType(next);
    const url = new URL(window.location.href);
    url.searchParams.set("type", next);
    window.history.replaceState(null, "", url);
    trackSubmissionEvent("submit_type_selected", { submission_type: next });
  };

  // Single centered reading column. Related exhibitions strip lives at
  // the bottom rather than as a sidebar so nothing competes with the
  // form for horizontal attention.
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div>
        <p className="text-[10px] uppercase tracking-[0.28em] text-neutral-500">Open Submission</p>
        <h1 className="editorial-serif mt-3 text-[clamp(1.5rem,3.4vw,2.2rem)] uppercase leading-[1.02] tracking-[-0.02em] text-neutral-900">
          {content.heading}
        </h1>
      </div>

      <label className="block">
        <span className="mb-2 block text-[10px] uppercase tracking-[0.28em] text-neutral-500">
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

      <aside className="border border-neutral-200 bg-neutral-50 px-5 py-5">
        <p className="text-[10px] uppercase tracking-[0.28em] text-neutral-700">Guidelines</p>
        <ul className="mt-4 space-y-1.5 text-[13px] leading-6 text-neutral-600">
          {GUIDELINES[submissionType].map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </aside>

      <div className="space-y-2 text-[15px] leading-[1.6] text-neutral-700 md:text-[16px]">
        <p>{content.intro}</p>
        {content.secondaryIntro && (
          <p className="text-neutral-600">{content.secondaryIntro}</p>
        )}
      </div>

      <SubmissionForm key={submissionType} submissionType={submissionType} />

      <RelatedExhibitionsRow submissionType={submissionType} />
    </div>
  );
}
