"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Format = "billboard" | "pinned-feed";
type Duration = "1 month" | "3 months" | "6 months" | "1 year";

export const AD_FORMAT_LABEL: Record<Format, string> = {
  billboard: "Billboard Ad — Homepage",
  "pinned-feed": "Pinned Feed Ad — Explore",
};

const DURATIONS: Duration[] = ["1 month", "3 months", "6 months", "1 year"];

// Single source of truth for prices — mirrors the pricing tables on
// the two PlacementCard components above the form.
export const AD_PRICING: Record<Format, Record<Duration, number>> = {
  billboard: { "1 month": 179, "3 months": 489, "6 months": 899, "1 year": 1590 },
  "pinned-feed": { "1 month": 99, "3 months": 269, "6 months": 499, "1 year": 890 },
};

function formatEuro(value: number): string {
  return `€${value.toLocaleString("en-US")}`;
}

const FIELD_WRAPPER = "block";
const LABEL_CLASS = "mb-2 block text-[10px] uppercase tracking-[0.28em] text-neutral-500";
const INPUT_CLASS =
  "w-full border-0 border-b border-neutral-300 bg-transparent px-0 py-3 text-[15px] text-neutral-900 outline-none transition-colors hover:border-neutral-500 focus:border-neutral-900";
const SELECT_CLASS =
  "w-full cursor-pointer appearance-none border border-neutral-300 bg-white px-5 py-4 pr-12 text-[15px] text-neutral-900 outline-none transition-colors hover:border-neutral-500 focus:border-neutral-900";
const TEXTAREA_CLASS =
  "w-full resize-y border-0 border-b border-neutral-300 bg-transparent px-0 py-3 text-[15px] leading-[1.55] text-neutral-900 outline-none transition-colors hover:border-neutral-500 focus:border-neutral-900 min-h-[96px]";

type Status = "idle" | "sending" | "ok" | "error";

export const ADVERTISING_FORM_ANCHOR = "request-placement";

export const ADVERTISING_REQUEST_EVENT = "findart:ad-request-placement";

export type AdvertisingRequestEventDetail = { format: Format };

/**
 * Dispatch helper for the "Request this placement" buttons that live
 * on the server-rendered PlacementCard — client-only, so the card can
 * remain a static server component and just call this on click.
 */
export function requestAdvertisingPlacement(format: Format) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<AdvertisingRequestEventDetail>(ADVERTISING_REQUEST_EVENT, {
      detail: { format },
    }),
  );
}

export function AdvertisingRequestForm() {
  const [format, setFormat] = useState<Format>("billboard");
  const [duration, setDuration] = useState<Duration>("1 month");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const sectionRef = useRef<HTMLElement | null>(null);
  const formatRadioRefs = useRef<Record<Format, HTMLInputElement | null>>({
    billboard: null,
    "pinned-feed": null,
  });

  const total = AD_PRICING[format][duration];

  // Listen for the "Request this placement" buttons above. They fire
  // a window CustomEvent carrying the chosen format; we preselect it,
  // reset duration to the shortest term, and smooth-scroll the form
  // into view. We compute the target Y ourselves and call
  // `window.scrollTo({behavior: 'smooth'})` because `scrollIntoView`
  // with smooth behaviour was observed to no-op on this layout — the
  // page's `html { overflow: clip visible }` interacts badly with it.
  // The sticky header sits ~105 px tall, so we subtract that so the
  // form heading isn't tucked behind the nav.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const applyFromEvent = (ev: Event) => {
      const detail = (ev as CustomEvent<AdvertisingRequestEventDetail>).detail;
      if (!detail) return;
      if (detail.format === "billboard" || detail.format === "pinned-feed") {
        setFormat(detail.format);
        setDuration("1 month");
      }
      requestAnimationFrame(() => {
        const el = sectionRef.current;
        if (!el) return;
        const headerOffset = 100;
        const y = el.getBoundingClientRect().top + window.scrollY - headerOffset;
        window.scrollTo({ top: y, behavior: "smooth" });
      });
    };
    window.addEventListener(ADVERTISING_REQUEST_EVENT, applyFromEvent as EventListener);
    return () =>
      window.removeEventListener(ADVERTISING_REQUEST_EVENT, applyFromEvent as EventListener);
  }, []);

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (status === "sending") return;
      setStatus("sending");
      setErrorMessage("");

      const data = new FormData(event.currentTarget);
      const payload: Record<string, string> = {
        submissionType: "advertising",
        "Advertising Format": AD_FORMAT_LABEL[format],
        Duration: duration,
        "Total Placement Price": formatEuro(total),
        Name: String(data.get("Name") ?? ""),
        Email: String(data.get("Email") ?? ""),
        "Project / Organization": String(data.get("Project / Organization") ?? ""),
        "Project Link": String(data.get("Project Link") ?? ""),
        "Preferred Start Date": String(data.get("Preferred Start Date") ?? ""),
        Message: String(data.get("Message") ?? ""),
      };

      try {
        const response = await fetch("/api/submissions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!response.ok) {
          let detail = "";
          try {
            const body = (await response.json()) as { error?: string };
            detail = body.error ?? "";
          } catch {
            // ignore JSON parse errors — fall through to generic message
          }
          throw new Error(detail || "Unable to send request.");
        }
        setStatus("ok");
      } catch (err) {
        setStatus("error");
        setErrorMessage(err instanceof Error ? err.message : "Something went wrong.");
      }
    },
    [format, duration, total, status],
  );

  if (status === "ok") {
    return (
      <section
        id={ADVERTISING_FORM_ANCHOR}
        ref={sectionRef}
        className="mx-auto mt-24 flex w-full max-w-xl flex-col items-center gap-5 text-center md:mt-32"
      >
        <p className="text-[10px] uppercase tracking-[0.28em] text-neutral-500">Advertising</p>
        <h2 className="editorial-serif text-[clamp(1.4rem,3vw,2rem)] uppercase leading-[1.05] tracking-[-0.02em] text-neutral-900">
          Request received
        </h2>
        <p className="text-[15px] leading-[1.65] text-neutral-700">
          Thank you for your interest in advertising on FindArt Platform. We&rsquo;ll review your
          request and contact you by email with availability and next steps.
        </p>
      </section>
    );
  }

  return (
    <section
      id={ADVERTISING_FORM_ANCHOR}
      ref={sectionRef}
      className="mx-auto mt-24 w-full max-w-2xl md:mt-32"
    >
      <header className="flex flex-col items-center gap-5 text-center">
        <p className="text-[10px] uppercase tracking-[0.28em] text-neutral-500">Advertising</p>
        <h2 className="editorial-serif text-[clamp(1.4rem,3vw,2rem)] uppercase leading-[1.05] tracking-[-0.02em] text-neutral-900">
          Request a Placement
        </h2>
        <p className="text-[15px] leading-[1.65] text-neutral-700 md:text-[16px]">
          Select your preferred advertising format and duration. We&rsquo;ll get back to you with
          availability and next steps.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="mt-10 flex flex-col gap-7" noValidate>
        {/* Format — radio */}
        <fieldset className="flex flex-col gap-3">
          <legend className={LABEL_CLASS}>Advertising Format*</legend>
          {(Object.keys(AD_FORMAT_LABEL) as Format[]).map((key) => (
            <label
              key={key}
              className="flex cursor-pointer items-center gap-3 border border-neutral-300 px-4 py-3 text-[14px] text-neutral-900 transition-colors hover:border-neutral-500 has-[:checked]:border-neutral-900"
            >
              <input
                ref={(el) => {
                  formatRadioRefs.current[key] = el;
                }}
                type="radio"
                name="format"
                value={key}
                checked={format === key}
                onChange={() => {
                  setFormat(key);
                }}
                className="h-4 w-4 accent-neutral-900"
              />
              <span>{AD_FORMAT_LABEL[key]}</span>
            </label>
          ))}
        </fieldset>

        {/* Duration — select */}
        <label className={FIELD_WRAPPER}>
          <span className={LABEL_CLASS}>Duration*</span>
          <div className="relative">
            <select
              value={duration}
              onChange={(event) => setDuration(event.target.value as Duration)}
              className={SELECT_CLASS}
            >
              {DURATIONS.map((item) => (
                <option key={item} value={item}>
                  {item}
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

        {/* Name + Email on the same row at md+ */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <label className={FIELD_WRAPPER}>
            <span className={LABEL_CLASS}>Name*</span>
            <input name="Name" type="text" required placeholder="Your name" className={INPUT_CLASS} />
          </label>
          <label className={FIELD_WRAPPER}>
            <span className={LABEL_CLASS}>Email*</span>
            <input
              name="Email"
              type="email"
              required
              placeholder="you@example.com"
              className={INPUT_CLASS}
            />
          </label>
        </div>

        <label className={FIELD_WRAPPER}>
          <span className={LABEL_CLASS}>Project / Organization*</span>
          <input
            name="Project / Organization"
            type="text"
            required
            placeholder="Gallery, art fair, project or artist name"
            className={INPUT_CLASS}
          />
        </label>

        <label className={FIELD_WRAPPER}>
          <span className={LABEL_CLASS}>Project Link</span>
          <input
            name="Project Link"
            type="url"
            placeholder="https://… or Instagram URL"
            className={INPUT_CLASS}
          />
        </label>

        <label className={FIELD_WRAPPER}>
          <span className={LABEL_CLASS}>Preferred Start Date</span>
          <input name="Preferred Start Date" type="date" className={INPUT_CLASS} />
        </label>

        <label className={FIELD_WRAPPER}>
          <span className={LABEL_CLASS}>Message</span>
          <textarea
            name="Message"
            placeholder="Anything we should know about your project"
            className={TEXTAREA_CLASS}
          />
        </label>

        {/* Total — live-updating */}
        <div className="flex items-baseline justify-between border-t border-neutral-200 pt-5">
          <span className="text-[11px] uppercase tracking-[0.28em] text-neutral-500">
            Total placement price
          </span>
          <span className="editorial-serif text-[clamp(1.3rem,2.5vw,1.8rem)] text-neutral-900">
            {formatEuro(total)}
          </span>
        </div>

        <PricingSummary format={format} />

        <button
          type="submit"
          disabled={status === "sending"}
          className="group mt-4 inline-flex items-center justify-center gap-2 bg-neutral-900 px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.28em] text-white transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "sending" ? "Sending…" : (
            <>
              Request Placement
              <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">
                ↗
              </span>
            </>
          )}
        </button>

        <p className="text-[12px] leading-[1.55] text-neutral-500 md:text-[13px]">
          No payment required at this stage. All placements are subject to availability and approval.
        </p>

        {status === "error" && (
          <p role="alert" className="text-[13px] text-red-600">
            {errorMessage || "Something went wrong — please try again."}
          </p>
        )}
      </form>
    </section>
  );
}

/**
 * Compact pricing cross-reference under the Total — makes it obvious
 * where the computed figure comes from without needing to scroll back
 * to the two placement cards above.
 */
function PricingSummary({ format }: { format: Format }) {
  const rows = DURATIONS.map((d) => ({ term: d, price: AD_PRICING[format][d] }));
  return (
    <div className="rounded-sm border border-neutral-200 bg-neutral-50 p-4">
      <p className="mb-2 text-[10px] uppercase tracking-[0.28em] text-neutral-500">
        {AD_FORMAT_LABEL[format]}
      </p>
      <ul className="divide-y divide-neutral-200">
        {rows.map(({ term, price }) => (
          <li key={term} className="flex items-baseline justify-between py-2 text-[13px] text-neutral-700">
            <span>{term}</span>
            <span className="font-medium text-neutral-900">{formatEuro(price)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
