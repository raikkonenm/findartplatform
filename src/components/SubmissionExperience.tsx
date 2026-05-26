"use client";

import { useState } from "react";
import { SubmissionForm, type SubmissionType } from "./SubmissionForm";

const submitContent = {
  exhibition: {
    tabTitle: "FindArt Platform",
    tabSubtitle: "Submit an Exhibition",
    title: "Submit an Exhibition",
    description: (
      <>
        Submit your exhibition to FindArt Platform &mdash; a growing contemporary art archive
        viewed daily by curators, collectors, galleries, and art professionals worldwide.
        Selected exhibitions are published on the FindArt website and Instagram.
      </>
    ),
    benefits: [
      "Your exhibition page on findart.platform",
      "Shared with @artnomads audience (127K+)",
      "Instagram post on @findart.platform (20K+)",
    ],
    feeLabel: "Publication fee: $10.",
  },
  artist: {
    tabTitle: "ArtNomads",
    tabSubtitle: "Submit as an Artist",
    title: "Submit as an Artist",
    description: (
      <>
        Submit your practice to ArtNomads for curatorial review, future features, exhibitions,
        publications, and long-term opportunities across our network.
        <br />
        <br />
        Selected artists may be considered for ArtNomads projects, editorial features,
        exhibitions, and curatorial initiatives.
      </>
    ),
    benefits: [
      "Curatorial review by ArtNomads",
      "Consideration for future projects and features",
      "Portfolio added to our internal artist research base",
    ],
    feeLabel: "Review fee: $10.",
  },
} as const;

function TabButton({
  selected,
  title,
  subtitle,
  onClick,
}: {
  selected: boolean;
  title: string;
  subtitle: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={selected}
      onClick={onClick}
      className={`min-h-[68px] flex-1 border px-5 py-4 text-left transition-colors sm:max-w-[18rem] ${
        selected
          ? "border-neutral-950 bg-neutral-950 text-white"
          : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-400 hover:text-neutral-900"
      }`}
    >
      <span className="block text-[10px] uppercase tracking-[0.28em]">{title}</span>
      <span className="mt-2 block text-[13px] normal-case tracking-normal">{subtitle}</span>
    </button>
  );
}

export function SubmissionExperience() {
  const [submissionType, setSubmissionType] = useState<SubmissionType>("exhibition");
  const content = submitContent[submissionType];

  return (
    <>
      <div
        className="mb-12 flex flex-col gap-2 sm:flex-row md:mb-14"
        role="tablist"
        aria-label="Submission type"
      >
        <TabButton
          selected={submissionType === "exhibition"}
          title={submitContent.exhibition.tabTitle}
          subtitle={submitContent.exhibition.tabSubtitle}
          onClick={() => setSubmissionType("exhibition")}
        />
        <TabButton
          selected={submissionType === "artist"}
          title={submitContent.artist.tabTitle}
          subtitle={submitContent.artist.tabSubtitle}
          onClick={() => setSubmissionType("artist")}
        />
      </div>

      <div className="grid items-start gap-14 lg:grid-cols-[minmax(19rem,0.78fr)_minmax(32rem,1fr)] lg:gap-20 xl:gap-28">
        <div className="lg:sticky lg:top-32">
          <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-500">Open Submission</p>
          <h1 className="editorial-serif mt-6 break-words text-[clamp(2.75rem,13vw,5.3rem)] leading-[0.94] tracking-[-0.055em] md:text-[clamp(3.1rem,5vw,5.3rem)]">
            {content.title}
          </h1>
          <p className="mt-8 max-w-md text-[1.05rem] leading-8 text-neutral-600">
            {content.description}
          </p>

          <p className="mt-9 text-[17px] leading-7 text-neutral-900">$10 processing fee.</p>

          <ul className="mt-9 space-y-4 text-[17px] leading-7 text-neutral-800">
            {content.benefits.map((benefit) => (
              <li key={benefit}>{benefit}</li>
            ))}
          </ul>

          <div className="mt-12 border-t border-neutral-200 pt-8 text-[15px] leading-7 text-neutral-800">
            <p>Submission is free.</p>
            <p>{content.feeLabel}</p>
            <p>We&apos;ll get back to you within 3 days.</p>
          </div>

          <p className="mt-16 text-[13px] text-neutral-500 lg:mt-24">
            Questions? Write to us at{" "}
            <a
              href="mailto:artnomads@gmail.com"
              className="text-neutral-800 underline decoration-neutral-300 underline-offset-4 transition-opacity hover:opacity-55"
            >
              artnomads@gmail.com
            </a>
          </p>
        </div>

        <SubmissionForm key={submissionType} submissionType={submissionType} />
      </div>
    </>
  );
}
