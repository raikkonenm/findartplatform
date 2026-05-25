import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ExhibitionCard } from "@/components/ExhibitionCard";
import { Header } from "@/components/Header";
import { exhibitions } from "@/data/exhibitions";

export const metadata: Metadata = {
  title: "Submit",
};

const previewSlugs = [
  "metempsychosis-the-passion-of-pneumatics",
  "incommunicability-is-itself-a-source-of-pleasures",
  "the-worm-at-the-core",
];
const previewExhibitions = previewSlugs.flatMap((slug) => {
  const exhibition = exhibitions.find((candidate) => candidate.slug === slug);
  return exhibition ? [exhibition] : [];
});

type FieldProps = {
  label: ReactNode;
  placeholder: string;
  type?: string;
  className?: string;
};

function Field({ label, placeholder, type = "text", className = "" }: FieldProps) {
  return (
    <label
      className={`block border-b border-neutral-200 pb-5 pt-6 text-[10px] uppercase tracking-[0.26em] text-neutral-700 ${className}`}
    >
      {label}
      <input
        type={type}
        placeholder={placeholder}
        className="mt-4 block w-full border-0 bg-transparent p-0 text-[15px] normal-case tracking-normal text-neutral-900 outline-none placeholder:text-neutral-400"
      />
    </label>
  );
}

function TextAreaField({
  label,
  placeholder,
  rows,
}: {
  label: string;
  placeholder: string;
  rows: number;
}) {
  return (
    <label className="block border-b border-neutral-200 pb-5 pt-6 text-[10px] uppercase tracking-[0.26em] text-neutral-700">
      {label}
      <textarea
        placeholder={placeholder}
        rows={rows}
        className="mt-4 block w-full resize-none border-0 bg-transparent p-0 text-[15px] normal-case leading-7 tracking-normal text-neutral-900 outline-none placeholder:text-neutral-400"
      />
    </label>
  );
}

export default function SubmitPage() {
  return (
    <main className="relative min-h-screen bg-white pt-24 sm:pt-28">
      <Header />

      <section className="px-5 pb-20 pt-10 sm:px-8 lg:px-12 lg:pt-14">
        <div className="grid items-start gap-14 lg:grid-cols-[minmax(19rem,0.78fr)_minmax(32rem,1fr)] lg:gap-20 xl:gap-28">
          <div className="lg:sticky lg:top-32">
            <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-500">
              Open Submission
            </p>
            <h1 className="editorial-serif mt-6 text-[clamp(3.1rem,5vw,5.3rem)] leading-[0.94] tracking-[-0.055em]">
              Submit an Exhibition
            </h1>
            <p className="mt-8 max-w-md text-[1.05rem] leading-8 text-neutral-600">
              Feature your exhibition on FindArt Platform &mdash; a contemporary art archive
              seen by curators, collectors, and art professionals worldwide.
            </p>

            <ul className="mt-10 space-y-4 text-[17px] leading-7 text-neutral-800">
              <li>Your exhibition page on findart.platform</li>
              <li>2M+ monthly impressions across the network</li>
              <li>Shared with @artcnomads audience (127K+)</li>
              <li>Instagram post on @findart.platform (20K+)</li>
            </ul>

            <div className="mt-12 border-t border-neutral-200 pt-8 text-[15px] leading-7 text-neutral-800">
              <p>Submission is free.</p>
              <p>Publication fee: $29.</p>
              <p>We&apos;ll get back to you within 3 days.</p>
            </div>

            <p className="mt-16 text-[13px] text-neutral-500 lg:mt-24">
              Questions? Write to us at{" "}
              <a
                href="mailto:artcnomads@gmail.com"
                className="text-neutral-800 underline decoration-neutral-300 underline-offset-4 transition-opacity hover:opacity-55"
              >
                artcnomads@gmail.com
              </a>
            </p>
          </div>

          <form className="border-t border-neutral-900 pt-1" aria-label="Submission form">
            <div className="grid sm:grid-cols-2 sm:gap-x-8">
              <Field label="Name" placeholder="Your name" />
              <Field label="Email" placeholder="Email address" type="email" />
            </div>
            <Field label="Exhibition Title" placeholder="Title" />
            <div className="grid sm:grid-cols-2 sm:gap-x-8">
              <Field label="Artists" placeholder="Artist name(s)" />
              <Field label="Curator(s) (optional)" placeholder="Curator name(s)" />
            </div>
            <Field label="Venue / City / Country" placeholder="Venue / City / Country" />
            <div className="grid sm:grid-cols-2 sm:gap-x-8">
              <Field label="Opening Date" placeholder="DD / MM / YYYY" />
              <Field label="Closing Date" placeholder="DD / MM / YYYY" />
            </div>
            <div className="grid sm:grid-cols-2 sm:gap-x-8">
              <Field label="Instagram (artist or venue)" placeholder="@username" />
              <Field label="Photo Credit" placeholder="Photo credit" />
            </div>
            <Field
              label={<>Documentation Link (Dropbox / Google Drive &mdash; non-expiring link)</>}
              placeholder="https://"
              type="url"
            />
            <Field label="Website Link (optional)" placeholder="https://" type="url" />
            <TextAreaField
              label="Exhibition Text (press release or short description)"
              placeholder="Your text"
              rows={6}
            />
            <TextAreaField label="Notes (optional)" placeholder="Additional notes" rows={3} />

            <aside className="mt-8 border border-neutral-200 bg-neutral-50 px-5 py-5">
              <p className="text-[10px] uppercase tracking-[0.28em] text-neutral-700">
                Guidelines
              </p>
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
              type="button"
              className="mt-8 w-full bg-neutral-950 px-8 py-5 text-[11px] uppercase tracking-[0.32em] text-white transition-opacity hover:opacity-75"
            >
              Submit
            </button>
          </form>
        </div>

        <section className="mt-20 border-t border-neutral-200 pt-10 sm:mt-24 sm:pt-12">
          <h2 className="text-[13px] tracking-[0.01em] text-neutral-800">
            See how exhibitions look on FindArt &rarr;
          </h2>

          <div className="masonry mt-8">
            {previewExhibitions.map((exhibition, index) => (
              <ExhibitionCard
                key={exhibition.slug}
                exhibition={exhibition}
                eager={index < 3}
              />
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
