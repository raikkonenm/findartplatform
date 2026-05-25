"use client";

import { type FormEvent, type ReactNode, useState } from "react";

type SubmissionFields = {
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

const emptyFields: SubmissionFields = {
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

export function SubmissionForm() {
  const [fields, setFields] = useState<SubmissionFields>(emptyFields);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  function updateField<Key extends keyof SubmissionFields>(key: Key, value: SubmissionFields[Key]) {
    setFields((current) => ({ ...current, [key]: value }));
  }

  async function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");

    try {
      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Name: fields.name,
          Email: fields.email,
          "Exhibition Title": fields.exhibitionTitle,
          Artists: fields.artists,
          "Curator(s) (optional)": fields.curators,
          "Venue / City / Country": fields.venueLocation,
          "Opening Date": fields.openingDate,
          "Closing Date": fields.closingDate,
          "Instagram (artist or venue)": fields.instagram,
          "Photo Credit": fields.photoCredit,
          "Documentation Link": fields.documentationLink,
          "Website Link (optional)": fields.websiteLink,
          "Exhibition Text": fields.exhibitionText,
          "Notes (optional)": fields.notes,
        }),
      });

      if (!response.ok) {
        throw new Error("Submission request failed.");
      }

      setFields(emptyFields);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  return (
    <form className="border-t border-neutral-900 pt-1" aria-label="Submission form" onSubmit={submitForm}>
      <div className="grid md:grid-cols-2 md:gap-x-8">
        <Field
          label="Name"
          placeholder="Your name"
          required
          value={fields.name}
          onChange={(value) => updateField("name", value)}
        />
        <Field
          label="Email"
          placeholder="Email address"
          type="email"
          required
          value={fields.email}
          onChange={(value) => updateField("email", value)}
        />
      </div>
      <Field
        label="Exhibition Title"
        placeholder="Title"
        required
        value={fields.exhibitionTitle}
        onChange={(value) => updateField("exhibitionTitle", value)}
      />
      <div className="grid md:grid-cols-2 md:gap-x-8">
        <Field
          label="Artists"
          placeholder="Artist name(s)"
          required
          value={fields.artists}
          onChange={(value) => updateField("artists", value)}
        />
        <Field
          label="Curator(s) (optional)"
          placeholder="Curator name(s)"
          value={fields.curators}
          onChange={(value) => updateField("curators", value)}
        />
      </div>
      <Field
        label="Venue / City / Country"
        placeholder="Venue / City / Country"
        required
        value={fields.venueLocation}
        onChange={(value) => updateField("venueLocation", value)}
      />
      <div className="grid md:grid-cols-2 md:gap-x-8">
        <Field
          label="Opening Date"
          placeholder="DD / MM / YYYY"
          required
          value={fields.openingDate}
          onChange={(value) => updateField("openingDate", value)}
        />
        <Field
          label="Closing Date"
          placeholder="DD / MM / YYYY"
          required
          value={fields.closingDate}
          onChange={(value) => updateField("closingDate", value)}
        />
      </div>
      <div className="grid md:grid-cols-2 md:gap-x-8">
        <Field
          label="Instagram (artist or venue)"
          placeholder="@username"
          value={fields.instagram}
          onChange={(value) => updateField("instagram", value)}
        />
        <Field
          label="Photo Credit"
          placeholder="Photo credit"
          value={fields.photoCredit}
          onChange={(value) => updateField("photoCredit", value)}
        />
      </div>
      <Field
        label={<>Documentation Link (Dropbox / Google Drive &mdash; non-expiring link)</>}
        placeholder="https://"
        type="url"
        required
        value={fields.documentationLink}
        onChange={(value) => updateField("documentationLink", value)}
      />
      <Field
        label="Website Link (optional)"
        placeholder="https://"
        type="url"
        value={fields.websiteLink}
        onChange={(value) => updateField("websiteLink", value)}
      />
      <TextAreaField
        label="Exhibition Text (press release or short description)"
        placeholder="Your text"
        rows={6}
        required
        value={fields.exhibitionText}
        onChange={(value) => updateField("exhibitionText", value)}
      />
      <TextAreaField
        label="Notes (optional)"
        placeholder="Additional notes"
        rows={3}
        value={fields.notes}
        onChange={(value) => updateField("notes", value)}
      />

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

      <button
        type="submit"
        disabled={status === "submitting"}
        className="mt-8 w-full bg-neutral-950 px-8 py-5 text-[11px] uppercase tracking-[0.32em] text-white transition-opacity hover:opacity-75 disabled:cursor-wait disabled:opacity-60"
      >
        {status === "submitting" ? "Submitting" : "Submit"}
      </button>

      {status === "success" && (
        <p aria-live="polite" className="mt-6 text-[13px] leading-6 text-neutral-700">
          Thank you. Your exhibition has been submitted for review.
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
