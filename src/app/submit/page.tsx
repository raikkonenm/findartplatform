import type { Metadata } from "next";
import { ExhibitionCard } from "@/components/ExhibitionCard";
import { Header } from "@/components/Header";
import { SubmissionForm } from "@/components/SubmissionForm";
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

export default function SubmitPage() {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-white pt-20 md:pt-28">
      <Header />

      <section className="px-5 pb-20 pt-10 md:px-8 lg:px-12 lg:pt-14">
        <div className="grid items-start gap-14 lg:grid-cols-[minmax(19rem,0.78fr)_minmax(32rem,1fr)] lg:gap-20 xl:gap-28">
          <div className="lg:sticky lg:top-32">
            <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-500">
              Open Submission
            </p>
            <h1 className="editorial-serif mt-6 break-words text-[clamp(2.75rem,13vw,5.3rem)] leading-[0.94] tracking-[-0.055em] md:text-[clamp(3.1rem,5vw,5.3rem)]">
              Submit an Exhibition
            </h1>
            <p className="mt-8 max-w-md text-[1.05rem] leading-8 text-neutral-600">
              Feature your exhibition on FindArt Platform &mdash; a contemporary art archive
              seen by curators, collectors, and art professionals worldwide.
            </p>

            <ul className="mt-10 space-y-4 text-[17px] leading-7 text-neutral-800">
              <li>Your exhibition page on findart.platform</li>
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

          <SubmissionForm />
        </div>

        <section className="mt-16 border-t border-neutral-200 pt-10 md:mt-24 md:pt-12">
          <div className="masonry">
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
