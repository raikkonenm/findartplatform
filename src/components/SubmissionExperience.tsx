"use client";

import { useEffect, useState } from "react";
import { SubmissionForm, type SubmissionType } from "./SubmissionForm";

const submitContent = {
  exhibition: {
    tabTitle: "FindArt Platform",
    tabSubtitle: "Submit an Exhibition",
    title: "Submit an Exhibition",
    description: (
      <>
        Submit your exhibition to FindArt Platform &mdash; an international contemporary
        art archive documenting exhibitions across galleries, institutions, and
        independent spaces worldwide.
        <br />
        <br />
        Selected exhibitions are published on FindArt and shared with curators, collectors,
        galleries, artists, and contemporary art audiences internationally.
      </>
    ),
    benefits: [
      "Exhibition page on FindArt Platform Website",
      "Instagram publication on @findart.platform",
    ],
    processingFee: "$10 processing fee",
  },
  artist: {
    tabTitle: "ArtNomads",
    tabSubtitle: "Submit as an Artist",
    title: "Submit as an Artist",
    description: (
      <>
        Submit your practice to ArtNomads for curatorial review and consideration for
        future publications, features, and projects across our platforms.
        <br />
        <br />
        Selected artists may be featured through ArtNomads editorial channels, social
        media, exhibitions, and curatorial initiatives. Submitted portfolios are also
        added to our internal artist research archive for future opportunities and
        collaborations.
      </>
    ),
    benefits: [
      "Curatorial review",
      "Consideration for future publications and projects",
      "Portfolio added to our internal artist research archive",
    ],
    processingFee: "$15 processing fee",
  },
  opportunity: {
    tabTitle: "Opportunities",
    tabSubtitle: "Submit an Opportunity",
    title: "Submit an Opportunity",
    description: (
      <>
        List an open call, residency, grant, award, commission, job or collaboration on
        FindArt Platform. Free to submit &mdash; reviewed within a few days and
        published if a fit for the FindArt audience.
        <br />
        <br />
        Please submit at least two weeks before the deadline so applicants have time to
        prepare.
      </>
    ),
    benefits: [
      "Listing on the Opportunities archive",
      "Automatic removal once the deadline passes",
      "Discoverable via tag / location / audience filters",
    ],
    processingFee: "Free",
  },
  index: {
    tabTitle: "Index",
    tabSubtitle: "Submit a Website",
    title: "Submit Your Website",
    description: (
      <>
        Add your artist / studio / project website to the FindArt Index &mdash; a
        curated directory of independent contemporary-art web presences.
        <br />
        <br />
        Independent sites only. No group directories, aggregators or promo pages.
        Reviewed within a few days.
      </>
    ),
    benefits: [
      "Listing on the Index directory",
      "Discoverable in the site-wide search",
      "Optional follow-up feature in the Features section",
    ],
    processingFee: "Free",
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

// /submit page only handles these three; /submit-opportunities and
// /contribute live at their own routes.
type SubmitPageType = "exhibition" | "artist" | "index";
const SUBMISSION_TYPES: SubmitPageType[] = ["exhibition", "artist", "index"];

export function SubmissionExperience() {
  const [submissionType, setSubmissionType] = useState<SubmitPageType>("exhibition");
  const content = submitContent[submissionType];

  // ?type=opportunity | index | artist | exhibition pre-selects a tab so
  // deep links from /opportunities or /directory land on the right form.
  useEffect(() => {
    const paramValue = new URLSearchParams(window.location.search).get("type");
    if (paramValue && (SUBMISSION_TYPES as string[]).includes(paramValue)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSubmissionType(paramValue as SubmitPageType);
    }
  }, []);

  return (
    <>
      <div
        className="mb-8 grid grid-cols-1 gap-2 sm:grid-cols-3 md:mb-10"
        role="tablist"
        aria-label="Submission type"
      >
        {(["exhibition", "artist", "index"] as const).map((key) => (
          <TabButton
            key={key}
            selected={submissionType === key}
            title={submitContent[key].tabTitle}
            subtitle={submitContent[key].tabSubtitle}
            onClick={() => setSubmissionType(key)}
          />
        ))}
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

          <p className="mt-9 text-[17px] leading-7 text-neutral-900">Included:</p>
          <ul className="mt-4 space-y-3 text-[17px] leading-7 text-neutral-800">
            {content.benefits.map((benefit) => (
              <li key={benefit}>&mdash; {benefit}</li>
            ))}
          </ul>

          {/* Fee + review + contact box — visible on both desktop and
              mobile. Replaces the previous contact-only paragraph and
              also absorbs the under-button fee/review lines so this
              information lives in one place. */}
          <aside className="mt-12 border border-neutral-200 bg-white p-6 md:mt-14">
            <p className="text-[15px] font-medium leading-6 text-neutral-900">
              {content.processingFee === "Free"
                ? "Free submission"
                : `${submissionType === "exhibition" ? "$10" : "$15"} Submission Fee`}
            </p>
            <p className="mt-4 text-[13px] leading-6 text-neutral-600">
              Each submission is individually reviewed by our curatorial team.
            </p>
            {content.processingFee !== "Free" && (
              <p className="mt-3 text-[13px] leading-6 text-neutral-600">
                The fee supports the review process and helps us maintain curatorial standards
                across the platform.
              </p>
            )}
            <p className="mt-4 text-[13px] leading-6 text-neutral-600">
              Questions? Write to us at{" "}
              <a
                href="mailto:artcnomads@gmail.com"
                className="text-neutral-800 underline decoration-neutral-300 underline-offset-4 transition-opacity hover:opacity-55"
              >
                artcnomads@gmail.com
              </a>
            </p>
          </aside>
        </div>

        <SubmissionForm key={submissionType} submissionType={submissionType} />
      </div>
    </>
  );
}
