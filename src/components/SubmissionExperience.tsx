"use client";

import { useEffect, useState } from "react";
import { SubmissionForm, SUBMISSION_FEES, type SubmissionType } from "./SubmissionForm";

type SubmitPageType = "exhibition" | "artist" | "index";

const SUBMISSION_TYPES: SubmitPageType[] = ["exhibition", "artist", "index"];

const CONTENT: Record<SubmitPageType, {
  optionLabel: string;
  intro: string;
  benefits: string[];
}> = {
  exhibition: {
    optionLabel: "Submit an Exhibition",
    intro:
      "Submit your exhibition to FindArt Platform — an international contemporary art archive documenting exhibitions across galleries, institutions, and independent spaces worldwide.",
    benefits: [
      "Exhibition page on FindArt Platform Website",
      "Instagram publication on @findart.platform",
    ],
  },
  artist: {
    optionLabel: "Submit as an Artist",
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
  const fee = SUBMISSION_FEES[submissionType as SubmissionType];

  useEffect(() => {
    const paramValue = new URLSearchParams(window.location.search).get("type");
    if (paramValue && (SUBMISSION_TYPES as string[]).includes(paramValue)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSubmissionType(paramValue as SubmitPageType);
    }
  }, []);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8">
      <label className="block">
        <span className="mb-3 block text-[10px] uppercase tracking-[0.28em] text-neutral-500">
          I want to
        </span>
        <div className="relative">
          <select
            value={submissionType}
            onChange={(event) => setSubmissionType(event.target.value as SubmitPageType)}
            className="w-full cursor-pointer appearance-none border border-neutral-300 bg-white px-5 py-4 pr-12 text-[15px] text-neutral-900 outline-none transition-colors hover:border-neutral-500 focus:border-neutral-900"
          >
            {SUBMISSION_TYPES.map((option) => (
              <option key={option} value={option}>
                {CONTENT[option].optionLabel} — {SUBMISSION_FEES[option as SubmissionType]}
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

      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <p className="text-[15px] font-semibold text-neutral-900">
          {fee === "Free" ? "Free submission" : `${fee} submission fee`}
        </p>
        <a
          href="mailto:artcnomads@gmail.com"
          className="text-[13px] text-neutral-600 underline decoration-neutral-300 underline-offset-4 transition-opacity hover:opacity-55"
        >
          Questions? artcnomads@gmail.com
        </a>
      </div>

      <SubmissionForm key={submissionType} submissionType={submissionType} />
    </div>
  );
}
