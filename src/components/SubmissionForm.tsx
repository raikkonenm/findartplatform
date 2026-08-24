"use client";

import { type FormEvent, type ReactNode, useRef, useState } from "react";
import { trackSubmissionEvent } from "./SubmissionInfoPanel";

export type SubmissionType = "exhibition" | "artist" | "opportunity" | "index" | "contribute";

// Simplified exhibition submission — Name / Email / Download Link /
// Message. Everything the archive used to collect via many fields
// (artists, venue, dates, photo credit, exhibition text …) is expected
// to live inside the linked Dropbox / Drive / WeTransfer folder and
// the optional Message body.
type ExhibitionFields = {
  name: string;
  email: string;
  downloadLink: string;
  message: string;
};

type ArtistFields = {
  name: string;
  email: string;
  instagram: string;
  artistStatementCv: string;
  portfolioLink: string;
  website: string;
  additionalNotes: string;
};

type OpportunityFields = {
  name: string;
  email: string;
  organization: string;
  opportunityTitle: string;
  opportunityType: string;
  deadline: string;
  location: string;
  audience: string;
  applicationFee: string;
  applicationLink: string;
  websiteLink: string;
  description: string;
};

type IndexFields = {
  name: string;
  email: string;
  websiteUrl: string;
  instagram: string;
  shortDescription: string;
};

type ContributeFields = {
  name: string;
  email: string;
  contributionType: string;
  pitchTitle: string;
  pitch: string;
  sampleLink: string;
  shortBio: string;
  notes: string;
};

const emptyExhibitionFields: ExhibitionFields = {
  name: "",
  email: "",
  downloadLink: "",
  message: "",
};

const emptyArtistFields: ArtistFields = {
  name: "",
  email: "",
  instagram: "",
  artistStatementCv: "",
  portfolioLink: "",
  website: "",
  additionalNotes: "",
};

const emptyOpportunityFields: OpportunityFields = {
  name: "",
  email: "",
  organization: "",
  opportunityTitle: "",
  opportunityType: "",
  deadline: "",
  location: "",
  audience: "",
  applicationFee: "",
  applicationLink: "",
  websiteLink: "",
  description: "",
};

const emptyIndexFields: IndexFields = {
  name: "",
  email: "",
  websiteUrl: "",
  instagram: "",
  shortDescription: "",
};

const emptyContributeFields: ContributeFields = {
  name: "",
  email: "",
  contributionType: "",
  pitchTitle: "",
  pitch: "",
  sampleLink: "",
  shortBio: "",
  notes: "",
};

// Paid submissions redirect to Gumroad after the form. Article (contribute)
// is free — no redirect. Fees: exhibition $10 / artist $15 / website $10 /
// opportunity $20 / article free.
const GUMROAD_URLS: Partial<Record<SubmissionType, string>> = {
  exhibition: "https://findartplatform.gumroad.com/l/exhibitionsubmission",
  artist: "https://findartplatform.gumroad.com/l/submitasanartist",
  index: "https://findartplatform.gumroad.com/l/submitwebsite",
  opportunity: "https://findartplatform.gumroad.com/l/submitopportunity",
};

export const SUBMISSION_FEES: Record<SubmissionType, string> = {
  exhibition: "$10",
  artist: "$15",
  index: "$10",
  opportunity: "$20",
  contribute: "Free",
};

const GUIDELINES: Record<SubmissionType, string[]> = {
  exhibition: [
    "Please include installation views and images of individual works.",
    "Images minimum 2000px.",
    "Send via Dropbox or Google Drive (non-expiring link).",
    "Include exhibition text or press release.",
  ],
  artist: [
    "Send a portfolio link with 10–20 selected works.",
    "Include an artist statement or short CV.",
    "Images minimum 2000px, non-expiring link.",
  ],
  opportunity: [
    "Opportunity listings are reviewed within a few days and published if a fit for the FindArt audience.",
    "Please submit at least 2 weeks before the deadline.",
  ],
  index: [
    "Independent artist / studio / project sites only — no group directories or aggregators.",
    "Reviewed within a few days.",
  ],
  contribute: [
    "We welcome proposals for essays, interviews, exhibition texts, research and other editorial formats.",
    "Free to pitch. Reviewed by the editorial team; we'll reply either way.",
  ],
};

type FieldProps = {
  label: ReactNode;
  placeholder: string;
  type?: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
};

function Field({
  label,
  placeholder,
  type = "text",
  required = false,
  value,
  onChange,
}: FieldProps) {
  return (
    <label className="block border-b border-neutral-200 pb-2.5 pt-3 text-[10px] uppercase tracking-[0.24em] text-neutral-700">
      {label}
      <input
        type={type}
        placeholder={placeholder}
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1.5 block w-full border-0 bg-transparent p-0 text-[14px] normal-case tracking-normal text-neutral-900 outline-none placeholder:text-neutral-400"
      />
    </label>
  );
}

function TextAreaField({
  label,
  placeholder,
  rows,
  required = false,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  rows: number;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block border-b border-neutral-200 pb-2.5 pt-3 text-[10px] uppercase tracking-[0.24em] text-neutral-700">
      {label}
      <textarea
        placeholder={placeholder}
        rows={rows}
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1.5 block w-full resize-none border-0 bg-transparent p-0 text-[14px] normal-case leading-6 tracking-normal text-neutral-900 outline-none placeholder:text-neutral-400"
      />
    </label>
  );
}

// Bold-label + heavy black-bordered field. Used only for the
// simplified exhibition submission; every other type keeps the
// standard underline Field style.
function BoxedField({
  label,
  placeholder,
  type = "text",
  required = false,
  value,
  onChange,
}: FieldProps) {
  return (
    <label className="block">
      <span className="block text-[15px] font-bold text-neutral-900">
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </span>
      <input
        type={type}
        placeholder={placeholder}
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-3 block w-full border-[1.5px] border-neutral-900 bg-white px-4 py-3.5 text-[15px] text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-neutral-900"
      />
    </label>
  );
}

function BoxedTextArea({
  label,
  placeholder,
  rows,
  required = false,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  rows: number;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="block text-[15px] font-bold text-neutral-900">
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </span>
      <textarea
        placeholder={placeholder}
        rows={rows}
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-3 block w-full resize-y border-[1.5px] border-neutral-900 bg-white px-4 py-3 text-[15px] leading-6 text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-neutral-900"
      />
    </label>
  );
}

export function SubmissionForm({ submissionType }: { submissionType: SubmissionType }) {
  const [exhibitionFields, setExhibitionFields] = useState<ExhibitionFields>(emptyExhibitionFields);
  const [artistFields, setArtistFields] = useState<ArtistFields>(emptyArtistFields);
  const [opportunityFields, setOpportunityFields] = useState<OpportunityFields>(emptyOpportunityFields);
  const [indexFields, setIndexFields] = useState<IndexFields>(emptyIndexFields);
  const [contributeFields, setContributeFields] = useState<ContributeFields>(emptyContributeFields);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  // Fire submit_form_started once per submission-type mount, when the
  // user touches any field. Kept behind a ref so a single field change
  // doesn't emit a repeat event.
  const formStartedRef = useRef(false);
  function noteFormStarted() {
    if (formStartedRef.current) return;
    formStartedRef.current = true;
    trackSubmissionEvent("submit_form_started", { submission_type: submissionType });
  }

  function updateExhibitionField<Key extends keyof ExhibitionFields>(
    key: Key,
    value: ExhibitionFields[Key],
  ) {
    noteFormStarted();
    setExhibitionFields((current) => ({ ...current, [key]: value }));
  }

  function updateArtistField<Key extends keyof ArtistFields>(key: Key, value: ArtistFields[Key]) {
    noteFormStarted();
    setArtistFields((current) => ({ ...current, [key]: value }));
  }

  function updateOpportunityField<Key extends keyof OpportunityFields>(key: Key, value: OpportunityFields[Key]) {
    noteFormStarted();
    setOpportunityFields((current) => ({ ...current, [key]: value }));
  }

  function updateIndexField<Key extends keyof IndexFields>(key: Key, value: IndexFields[Key]) {
    noteFormStarted();
    setIndexFields((current) => ({ ...current, [key]: value }));
  }

  function updateContributeField<Key extends keyof ContributeFields>(key: Key, value: ContributeFields[Key]) {
    noteFormStarted();
    setContributeFields((current) => ({ ...current, [key]: value }));
  }

  function buildPayload() {
    switch (submissionType) {
      case "exhibition":
        return {
          submissionType,
          Name: exhibitionFields.name,
          Email: exhibitionFields.email,
          "Download Link": exhibitionFields.downloadLink,
          Message: exhibitionFields.message,
        };
      case "artist":
        return {
          submissionType,
          Name: artistFields.name,
          Email: artistFields.email,
          Instagram: artistFields.instagram,
          "Artist Statement / CV": artistFields.artistStatementCv,
          "Portfolio / Documentation Link": artistFields.portfolioLink,
          "Website (optional)": artistFields.website,
          "Additional Notes (optional)": artistFields.additionalNotes,
        };
      case "opportunity":
        return {
          submissionType,
          Name: opportunityFields.name,
          Email: opportunityFields.email,
          Organization: opportunityFields.organization,
          "Opportunity Title": opportunityFields.opportunityTitle,
          "Opportunity Type": opportunityFields.opportunityType,
          Deadline: opportunityFields.deadline,
          Location: opportunityFields.location,
          "For (audience)": opportunityFields.audience,
          "Application Fee": opportunityFields.applicationFee,
          "Application Link": opportunityFields.applicationLink,
          "Website (optional)": opportunityFields.websiteLink,
          Description: opportunityFields.description,
        };
      case "index":
        return {
          submissionType,
          Name: indexFields.name,
          Email: indexFields.email,
          "Website URL": indexFields.websiteUrl,
          Instagram: indexFields.instagram,
          "Short Description": indexFields.shortDescription,
        };
      case "contribute":
        return {
          submissionType,
          Name: contributeFields.name,
          Email: contributeFields.email,
          "Contribution Type": contributeFields.contributionType,
          "Pitch Title": contributeFields.pitchTitle,
          Pitch: contributeFields.pitch,
          "Sample / Portfolio Link": contributeFields.sampleLink,
          "Short Bio": contributeFields.shortBio,
          "Notes (optional)": contributeFields.notes,
        };
    }
  }

  async function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setStatus("submitting");

    try {
      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload()),
      });

      if (!response.ok) {
        throw new Error("Submission request failed.");
      }

      setStatus("success");
      trackSubmissionEvent("submit_form_completed", { submission_type: submissionType });
      const gumroadUrl = GUMROAD_URLS[submissionType];
      if (gumroadUrl) {
        trackSubmissionEvent("submit_payment_started", {
          submission_type: submissionType,
          provider: "gumroad",
        });
        window.location.href = gumroadUrl;
      }
    } catch {
      setStatus("error");
      trackSubmissionEvent("submit_form_error", { submission_type: submissionType });
    }
  }

  const ariaLabel =
    submissionType === "exhibition"
      ? "Exhibition submission form"
      : submissionType === "artist"
        ? "Artist submission form"
        : submissionType === "opportunity"
          ? "Opportunity submission form"
          : submissionType === "contribute"
            ? "Editorial contribution form"
            : "Index website submission form";

  return (
    <form
      className="border-t border-neutral-900 pt-1"
      aria-label={ariaLabel}
      onSubmit={submitForm}
    >
      {submissionType === "exhibition" ? (
        <div className="space-y-6">
          <BoxedField
            label="Name"
            placeholder=""
            required
            value={exhibitionFields.name}
            onChange={(value) => updateExhibitionField("name", value)}
          />
          <BoxedField
            label="Email"
            placeholder=""
            type="email"
            required
            value={exhibitionFields.email}
            onChange={(value) => updateExhibitionField("email", value)}
          />
          <BoxedField
            label="Download Link (Dropbox, Drive, We Transfer Link, etc)"
            placeholder=""
            type="url"
            required
            value={exhibitionFields.downloadLink}
            onChange={(value) => updateExhibitionField("downloadLink", value)}
          />
          <BoxedTextArea
            label="Message (Optional)"
            placeholder=""
            rows={5}
            value={exhibitionFields.message}
            onChange={(value) => updateExhibitionField("message", value)}
          />
        </div>
      ) : submissionType === "artist" ? (
        <>
          <div className="grid md:grid-cols-2 md:gap-x-8">
            <Field label="Name" placeholder="Your name" required value={artistFields.name} onChange={(value) => updateArtistField("name", value)} />
            <Field label="Email" placeholder="Email address" type="email" required value={artistFields.email} onChange={(value) => updateArtistField("email", value)} />
          </div>
          <Field label="Instagram" placeholder="@username" required value={artistFields.instagram} onChange={(value) => updateArtistField("instagram", value)} />
          <Field label="Artist Statement / CV" placeholder="https://" type="url" required value={artistFields.artistStatementCv} onChange={(value) => updateArtistField("artistStatementCv", value)} />
          <Field label="Portfolio / Documentation Link" placeholder="https://" type="url" required value={artistFields.portfolioLink} onChange={(value) => updateArtistField("portfolioLink", value)} />
          <Field label="Website (optional)" placeholder="https://" type="url" value={artistFields.website} onChange={(value) => updateArtistField("website", value)} />
          <TextAreaField label="Additional Notes (optional)" placeholder="Anything else you'd like us to know - your goals, interests, or what you're looking for." rows={4} value={artistFields.additionalNotes} onChange={(value) => updateArtistField("additionalNotes", value)} />
        </>
      ) : submissionType === "opportunity" ? (
        <>
          <div className="grid md:grid-cols-2 md:gap-x-8">
            <Field label="Name" placeholder="Your name" required value={opportunityFields.name} onChange={(value) => updateOpportunityField("name", value)} />
            <Field label="Email" placeholder="Email address" type="email" required value={opportunityFields.email} onChange={(value) => updateOpportunityField("email", value)} />
          </div>
          <Field label="Organization / Host" placeholder="Institution, gallery or organizer" required value={opportunityFields.organization} onChange={(value) => updateOpportunityField("organization", value)} />
          <Field label="Opportunity Title" placeholder="Title of the open call, residency, grant…" required value={opportunityFields.opportunityTitle} onChange={(value) => updateOpportunityField("opportunityTitle", value)} />
          <div className="grid md:grid-cols-2 md:gap-x-8">
            <Field label="Type" placeholder="Open Call / Residency / Grant / Award / Job / Collaboration" required value={opportunityFields.opportunityType} onChange={(value) => updateOpportunityField("opportunityType", value)} />
            <Field label="Deadline" placeholder="DD / MM / YYYY" required value={opportunityFields.deadline} onChange={(value) => updateOpportunityField("deadline", value)} />
          </div>
          <div className="grid md:grid-cols-2 md:gap-x-8">
            <Field label="Location" placeholder="City, Country (or Worldwide)" required value={opportunityFields.location} onChange={(value) => updateOpportunityField("location", value)} />
            <Field label="For (audience)" placeholder="Artists / Curators / Emerging / All" required value={opportunityFields.audience} onChange={(value) => updateOpportunityField("audience", value)} />
          </div>
          <div className="grid md:grid-cols-2 md:gap-x-8">
            <Field label="Application Fee" placeholder="Free / $25 / etc." required value={opportunityFields.applicationFee} onChange={(value) => updateOpportunityField("applicationFee", value)} />
            <Field label="Application Link" placeholder="https://" type="url" required value={opportunityFields.applicationLink} onChange={(value) => updateOpportunityField("applicationLink", value)} />
          </div>
          <Field label="Website (optional)" placeholder="https://" type="url" value={opportunityFields.websiteLink} onChange={(value) => updateOpportunityField("websiteLink", value)} />
          <TextAreaField label="Short Description" placeholder="Brief description of the opportunity, eligibility, what's offered." rows={6} required value={opportunityFields.description} onChange={(value) => updateOpportunityField("description", value)} />
        </>
      ) : submissionType === "index" ? (
        <>
          <div className="grid md:grid-cols-2 md:gap-x-8">
            <Field label="Name" placeholder="Your name" required value={indexFields.name} onChange={(value) => updateIndexField("name", value)} />
            <Field label="Email" placeholder="Email address" type="email" required value={indexFields.email} onChange={(value) => updateIndexField("email", value)} />
          </div>
          <Field label="Website URL" placeholder="https://" type="url" required value={indexFields.websiteUrl} onChange={(value) => updateIndexField("websiteUrl", value)} />
          <Field label="Instagram (optional)" placeholder="@username" value={indexFields.instagram} onChange={(value) => updateIndexField("instagram", value)} />
          <TextAreaField label="Short Description" placeholder="One or two sentences about your practice and what visitors will find on the site." rows={4} required value={indexFields.shortDescription} onChange={(value) => updateIndexField("shortDescription", value)} />
        </>
      ) : (
        <>
          <div className="grid md:grid-cols-2 md:gap-x-8">
            <Field label="Name" placeholder="Your name" required value={contributeFields.name} onChange={(value) => updateContributeField("name", value)} />
            <Field label="Email" placeholder="Email address" type="email" required value={contributeFields.email} onChange={(value) => updateContributeField("email", value)} />
          </div>
          <Field label="Type of contribution" placeholder="Essay / Interview / Exhibition text / Research / Other" required value={contributeFields.contributionType} onChange={(value) => updateContributeField("contributionType", value)} />
          <Field label="Working title of the pitch" placeholder="Title" required value={contributeFields.pitchTitle} onChange={(value) => updateContributeField("pitchTitle", value)} />
          <TextAreaField label="Pitch / abstract" placeholder="A short paragraph describing the piece — argument, subject, form." rows={6} required value={contributeFields.pitch} onChange={(value) => updateContributeField("pitch", value)} />
          <Field label="Sample / portfolio link" placeholder="https://" type="url" required value={contributeFields.sampleLink} onChange={(value) => updateContributeField("sampleLink", value)} />
          <TextAreaField label="Short bio" placeholder="A few sentences on your practice, publications, focus." rows={4} required value={contributeFields.shortBio} onChange={(value) => updateContributeField("shortBio", value)} />
          <TextAreaField label="Notes (optional)" placeholder="Anything else we should know — timeline, prior conversations, references." rows={3} value={contributeFields.notes} onChange={(value) => updateContributeField("notes", value)} />
        </>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="mt-8 w-full bg-neutral-950 px-8 py-5 text-[11px] uppercase tracking-[0.32em] text-white transition-opacity hover:opacity-75 disabled:cursor-wait disabled:opacity-60"
      >
        {status === "submitting" ? "Submitting..." : "Submit"}
      </button>

      <p className="mt-5 text-[18px] font-semibold text-neutral-900 md:text-[20px]">
        {SUBMISSION_FEES[submissionType] === "Free"
          ? "Free submission"
          : `${SUBMISSION_FEES[submissionType]} submission fee`}
      </p>

      <aside className="mt-4 border border-neutral-200 bg-neutral-50 px-5 py-5">
        <p className="text-[10px] uppercase tracking-[0.28em] text-neutral-700">Guidelines</p>
        <ul className="mt-4 space-y-1.5 text-[13px] leading-6 text-neutral-600">
          {GUIDELINES[submissionType].map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </aside>

      {status === "success" && (
        <p aria-live="polite" className="mt-6 text-[13px] leading-6 text-neutral-700">
          {GUMROAD_URLS[submissionType]
            ? "Submission received. Redirecting to payment…"
            : "Submission received — we'll be in touch shortly."}
        </p>
      )}
      {status === "error" && (
        <p aria-live="polite" className="mt-6 text-[13px] leading-6 text-neutral-700">
          Submission failed. Please try again or email us directly.
        </p>
      )}
    </form>
  );
}
