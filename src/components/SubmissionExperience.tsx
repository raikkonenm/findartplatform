"use client";

import { useEffect, useState } from "react";
import { SubmissionForm } from "./SubmissionForm";

type SubmitPageType = "exhibition" | "artist" | "index";

const SUBMISSION_TYPES: SubmitPageType[] = ["exhibition", "artist", "index"];

const CONTENT: Record<SubmitPageType, {
  optionLabel: string;
  heading: string;
  intro: string;
  benefits: string[];
}> = {
  exhibition: {
    optionLabel: "Submit an Exhibition",
    heading: "SUBMIT TO FINDART",
    intro:
      "Submit your exhibition to FindArt Platform — an international contemporary art archive documenting exhibitions across galleries, institutions, and independent spaces worldwide.",
    benefits: [
      "Exhibition page on FindArt Platform Website",
      "Instagram publication on @findart.platform",
    ],
  },
  artist: {
    optionLabel: "Submit as an Artist to Artcnomads",
    heading: "SUBMIT TO ARTCNOMADS",
    intro:
      "Submit your practice to ArtNomads for curatorial review and consideration for future publications, features, and projects across our platforms.",
    benefits: [
      "Curatorial review",
      "Consideration for future publications and projects",
      "Portfolio added to our internal artist research archive",
    ],
  },
  index: {
    optionLabel: "Submit a Website",
    heading: "SUBMIT WEBSITE TO FINDART",
    intro:
      "Add your artist / studio / project website to the FindArt Index — a curated directory of independent contemporary-art web presences.",
    benefits: [
      "Listing on the Index directory",
      "Discoverable in the site-wide search",
    ],
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
  };

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8">
      <div>
        <p className="text-[10px] uppercase tracking-[0.28em] text-neutral-500">Open Submission</p>
        <h1 className="editorial-serif mt-3 text-[clamp(1.5rem,3.4vw,2.2rem)] uppercase leading-[1.02] tracking-[-0.02em] text-neutral-900">
          {content.heading}
        </h1>
      </div>

      <label className="block">
        <span className="mb-3 block text-[10px] uppercase tracking-[0.28em] text-neutral-500">
          I want to
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

      <p className="text-[15px] leading-[1.65] text-neutral-700 md:text-[16px]">{content.intro}</p>

      <ul className="space-y-1.5 border-y border-neutral-200 py-5 text-[14px] leading-[1.55] text-neutral-800">
        {content.benefits.map((benefit) => (
          <li key={benefit}>— {benefit}</li>
        ))}
      </ul>

      <SubmissionForm key={submissionType} submissionType={submissionType} />
    </div>
  );
}
