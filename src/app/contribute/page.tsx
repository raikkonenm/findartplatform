import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { SubmissionForm } from "@/components/SubmissionForm";

const PAGE_URL = "https://www.findartplatform.com/contribute";
const PAGE_TITLE = "Contribute to FindArt — Editorial Pitches, Essays & Research";
const PAGE_DESCRIPTION =
  "Pitch an essay, interview, exhibition text, research or other editorial format for FindArt Platform's editorial section.";

export const metadata: Metadata = {
  title: { absolute: PAGE_TITLE },
  description: PAGE_DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    type: "website",
    url: PAGE_URL,
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
  },
};

export default function ContributePage() {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-white pt-[95px] md:pt-[105px]">
      <Header />
      <section className="px-5 pb-20 md:px-8 lg:px-12">
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-8">
          <div>
            <p className="text-[10px] uppercase tracking-[0.28em] text-neutral-500">Open Pitch</p>
            <h1 className="editorial-serif mt-3 text-[clamp(1.5rem,3.4vw,2.2rem)] uppercase leading-[1.02] tracking-[-0.02em] text-neutral-900">
              CONTRIBUTE TO FINDART
            </h1>
          </div>

          <p className="text-[15px] leading-[1.65] text-neutral-700 md:text-[16px]">
            We welcome proposals for essays, interviews, exhibition texts, research and
            other editorial formats. Send a short pitch with a working title, a paragraph
            on the subject or argument, and a link to prior writing or portfolio.
          </p>

          <ul className="space-y-1.5 border-y border-neutral-200 py-5 text-[14px] leading-[1.55] text-neutral-800">
            <li>— Essays &amp; long-form criticism</li>
            <li>— Artist &amp; curator interviews</li>
            <li>— Exhibition texts &amp; reviews</li>
            <li>— Research pieces</li>
          </ul>

          <SubmissionForm submissionType="contribute" />
        </div>
      </section>
    </main>
  );
}
