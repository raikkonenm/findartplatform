"use client";

import { type FormEvent, useEffect, useState } from "react";

const TOPIC_OPTIONS = [
  "General inquiry",
  "Editorial",
  "Advertising",
  "Partnership",
  "Press",
  "Other",
] as const;

type Topic = (typeof TOPIC_OPTIONS)[number];

type ContactFields = {
  name: string;
  email: string;
  topic: Topic;
  subject: string;
  message: string;
};

const emptyFields: ContactFields = {
  name: "",
  email: "",
  topic: "General inquiry",
  subject: "",
  message: "",
};

export function ContactForm() {
  const [fields, setFields] = useState<ContactFields>(emptyFields);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  // Prefill topic from ?topic=advertising|editorial|... query param, so the
  // "Advertise with us" link (and any future entry point) can jump straight
  // to the right topic.
  useEffect(() => {
    const paramValue = new URLSearchParams(window.location.search).get("topic");
    if (!paramValue) return;
    const match = TOPIC_OPTIONS.find(
      (option) => option.toLowerCase() === paramValue.toLowerCase(),
    );
    if (match) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFields((current) => ({ ...current, topic: match }));
    }
  }, []);

  function update<Key extends keyof ContactFields>(key: Key, value: ContactFields[Key]) {
    setFields((current) => ({ ...current, [key]: value }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    try {
      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionType: "contact",
          Name: fields.name,
          Email: fields.email,
          Topic: fields.topic,
          Subject: fields.subject,
          Message: fields.message,
        }),
      });
      if (!response.ok) throw new Error("Contact request failed.");
      setStatus("success");
      setFields(emptyFields);
    } catch {
      setStatus("error");
    }
  }

  const inputClass =
    "mt-4 block w-full border-0 bg-transparent p-0 text-[15px] normal-case tracking-normal text-neutral-900 outline-none placeholder:text-neutral-400";
  const labelClass =
    "block border-b border-neutral-200 pb-5 pt-6 text-[10px] uppercase tracking-[0.26em] text-neutral-700";

  return (
    <form
      className="border-t border-neutral-900 pt-1"
      aria-label="Contact form"
      onSubmit={submit}
    >
      <div className="grid md:grid-cols-2 md:gap-x-8">
        <label className={labelClass}>
          Name
          <input
            type="text"
            required
            placeholder="Your name"
            value={fields.name}
            onChange={(event) => update("name", event.target.value)}
            className={inputClass}
          />
        </label>
        <label className={labelClass}>
          Email
          <input
            type="email"
            required
            placeholder="Email address"
            value={fields.email}
            onChange={(event) => update("email", event.target.value)}
            className={inputClass}
          />
        </label>
      </div>

      <label className={labelClass}>
        Topic
        <select
          required
          value={fields.topic}
          onChange={(event) => update("topic", event.target.value as Topic)}
          className={`${inputClass} cursor-pointer appearance-none`}
        >
          {TOPIC_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>

      <label className={labelClass}>
        Subject
        <input
          type="text"
          required
          placeholder="Short subject line"
          value={fields.subject}
          onChange={(event) => update("subject", event.target.value)}
          className={inputClass}
        />
      </label>

      <label className={labelClass}>
        Message
        <textarea
          required
          rows={7}
          placeholder="Your message"
          value={fields.message}
          onChange={(event) => update("message", event.target.value)}
          className={`${inputClass} resize-none leading-7`}
        />
      </label>

      <button
        type="submit"
        disabled={status === "submitting"}
        className="mt-8 w-full bg-neutral-950 px-8 py-5 text-[11px] uppercase tracking-[0.32em] text-white transition-opacity hover:opacity-75 disabled:cursor-wait disabled:opacity-60"
      >
        {status === "submitting" ? "Sending..." : "Send message"}
      </button>

      {status === "success" && (
        <p aria-live="polite" className="mt-6 text-[13px] leading-6 text-neutral-700">
          Thanks — we&rsquo;ll get back to you shortly.
        </p>
      )}
      {status === "error" && (
        <p aria-live="polite" className="mt-6 text-[13px] leading-6 text-neutral-700">
          Something went wrong. Please try again in a moment.
        </p>
      )}
    </form>
  );
}
