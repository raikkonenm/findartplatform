"use client";

import { type FormEvent, type ReactNode, useState } from "react";

export type SubmissionType = "exhibition" | "artist";

type ExhibitionFields = {
  name: string;
  email: string;
  exhibitionTitle: string;
  artists: string;
  curators: string;
  venueLocation: string;
  openingDate: string;
  closingDate: string;
  instagram: string;
  photoCredit: string;
  documentationLink: string;
  websiteLink: string;
  exhibitionText: string;
  notes: string;
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

const emptyExhibitionFields: ExhibitionFields = {
  name: "",
  email: "",
  exhibitionTitle: "",
  artists: "",
  curators: "",
  venueLocation: "",
  openingDate: "",
  closingDate: "",
  instagram: "",
  photoCredit: "",
  documentationLink: "",
  websiteLink: "",
  exhibitionText: "",
  notes: "",
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

const GUMROAD_URLS: Record<SubmissionType, string> = {
  exhibition: "https://findartplatform.gumroad.com/l/exhibitionsubmission",
  artist: "https://findartplatform.gumroad.com/l/submitasanartist",
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
    <label className="block border-b border-neutral-200 pb-5 pt-6 text-[10px] uppercase tracking-[0.26em] text-neutral-700">
      {label}
      <input
        type={type}
        placeholder={placeholder}
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-4 block w-full border-0 bg-transparent p-0 text-[15px] normal-case tracking-normal text-neutral-900 outline-none placeholder:text-neutral-400"
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
    <label className="block border-b border-neutral-200 pb-5 pt-6 text-[10px] uppercase tracking-[0.26em] text-neutral-700">
      {label}
      <textarea
        placeholder={placeholder}
        rows={rows}
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-4 block w-full resize-none border-0 bg-transparent p-0 text-[15px] normal-case leading-7 tracking-normal text-neutral-900 outline-none placeholder:text-neutral-400"
      />
    </label>
  );
}

export function SubmissionForm({ submissionType }: { submissionType: SubmissionType }) {
  const [exhibitionFields, setExhibitionFields] = useState<ExhibitionFields>(emptyExhibitionFields);
  const [artistFields, setArtistFields] = useState<ArtistFields>(emptyArtistFields);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  function updateExhibitionField<Key extends keyof ExhibitionFields>(
    key: Key,
    value: ExhibitionFields[Key],
  ) {
    setExhibitionFields((current) => ({ ...current, [key]: value }));
  }

  function updateArtistField<Key extends keyof ArtistFields>(key: Key, value: ArtistFields[Key]) {
    setArtistFields((current) => ({ ...current, [key]: value }));
  }

  async function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setStatus("submitting");

    try {
      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          submissionType === "exhibition"
            ? {
                submissionType,
                Name: exhibitionFields.name,
                Email: exhibitionFields.email,
                "Exhibition Title": exhibitionFields.exhibitionTitle,
                Artists: exhibitionFields.artists,
                "Curator(s) (optional)": exhibitionFields.curators,
                "Venue / City / Country": exhibitionFields.venueLocation,
                "Opening Date": exhibitionFields.openingDate,
                "Closing Date": exhibitionFields.closingDate,
                "Instagram (artist or venue)": exhibitionFields.instagram,
                "Photo Credit": exhibitionFields.photoCredit,
                "Documentation Link": exhibitionFields.documentationLink,
                "Website Link (optional)": exhibitionFields.websiteLink,
                "Exhibition Text": exhibitionFields.exhibitionText,
                "Notes (optional)": exhibitionFields.notes,
              }
            : {
                submissionType,
                Name: artistFields.name,
                Email: artistFields.email,
                Instagram: artistFields.instagram,
                "Artist Statement / CV": artistFields.artistStatementCv,
                "Portfolio / Documentation Link": artistFields.portfolioLink,
                "Website (optional)": artistFields.website,
                "Additional Notes (optional)": artistFields.additionalNotes,
              },
        ),
      });

      if (!response.ok) {
        throw new Error("Submission request failed.");
      }

      setStatus("success");
      window.location.href = GUMROAD_URLS[submissionType];
    } catch {
      setStatus("error");
    }
  }

  return (
    <form
      className="border-t border-neutral-900 pt-1"
      aria-label={submissionType === "exhibition" ? "Exhibition submission form" : "Artist submission form"}
      onSubmit={submitForm}
    >
      {submissionType === "exhibition" ? (
        <>
          <div className="grid md:grid-cols-2 md:gap-x-8">
            <Field label="Name" placeholder="Your name" required value={exhibitionFields.name} onChange={(value) => updateExhibitionField("name", value)} />
            <Field label="Email" placeholder="Email address" type="email" required value={exhibitionFields.email} onChange={(value) => updateExhibitionField("email", value)} />
          </div>
          <Field label="Exhibition Title" placeholder="Title" required value={exhibitionFields.exhibitionTitle} onChange={(value) => updateExhibitionField("exhibitionTitle", value)} />
          <div className="grid md:grid-cols-2 md:gap-x-8">
            <Field label="Artists" placeholder="Artist name(s)" required value={exhibitionFields.artists} onChange={(value) => updateExhibitionField("artists", value)} />
            <Field label="Curator(s) (optional)" placeholder="Curator name(s)" value={exhibitionFields.curators} onChange={(value) => updateExhibitionField("curators", value)} />
          </div>
          <Field label="Venue / City / Country" placeholder="Venue / City / Country" required value={exhibitionFields.venueLocation} onChange={(value) => updateExhibitionField("venueLocation", value)} />
          <div className="grid md:grid-cols-2 md:gap-x-8">
            <Field label="Opening Date" placeholder="DD / MM / YYYY" required value={exhibitionFields.openingDate} onChange={(value) => updateExhibitionField("openingDate", value)} />
            <Field label="Closing Date" placeholder="DD / MM / YYYY" required value={exhibitionFields.closingDate} onChange={(value) => updateExhibitionField("closingDate", value)} />
          </div>
          <div className="grid md:grid-cols-2 md:gap-x-8">
            <Field label="Instagram (artist or venue)" placeholder="@username" value={exhibitionFields.instagram} onChange={(value) => updateExhibitionField("instagram", value)} />
            <Field label="Photo Credit" placeholder="Photo credit" value={exhibitionFields.photoCredit} onChange={(value) => updateExhibitionField("photoCredit", value)} />
          </div>
          <Field label={<>Documentation Link (Dropbox / Google Drive &mdash; non-expiring link)</>} placeholder="https://" type="url" required value={exhibitionFields.documentationLink} onChange={(value) => updateExhibitionField("documentationLink", value)} />
          <Field label="Website Link (optional)" placeholder="https://" type="url" value={exhibitionFields.websiteLink} onChange={(value) => updateExhibitionField("websiteLink", value)} />
          <TextAreaField label="Exhibition Text (press release or short description)" placeholder="Your text" rows={6} required value={exhibitionFields.exhibitionText} onChange={(value) => updateExhibitionField("exhibitionText", value)} />
          <TextAreaField label="Notes (optional)" placeholder="Additional notes" rows={3} value={exhibitionFields.notes} onChange={(value) => updateExhibitionField("notes", value)} />

          <aside className="mt-8 border border-neutral-200 bg-neutral-50 px-5 py-5">
            <p className="text-[10px] uppercase tracking-[0.28em] text-neutral-700">Guidelines</p>
            <p className="mt-4 text-[13px] leading-6 text-neutral-600">
              Please include installation views and images of individual works.
              <br />
              Images minimum 2000px.
              <br />
              Send via Dropbox or Google Drive (non-expiring link).
              <br />
              Include exhibition text or press release.
            </p>
          </aside>
        </>
      ) : (
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
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="mt-8 w-full bg-neutral-950 px-8 py-5 text-[11px] uppercase tracking-[0.32em] text-white transition-opacity hover:opacity-75 disabled:cursor-wait disabled:opacity-60"
      >
        {status === "submitting" ? "Submitting..." : "Submit"}
      </button>

      {status === "success" && (
        <p aria-live="polite" className="mt-6 text-[13px] leading-6 text-neutral-700">
          Submission received. Redirecting to payment&hellip;
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
