import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { SubmissionForm } from "@/components/SubmissionForm";

const PAGE_URL = "https://www.findartplatform.com/submit-opportunities";
const PAGE_TITLE = "Submit an Opportunity — Open Calls, Residencies, Grants";
const PAGE_DESCRIPTION =
  "List an open call, residency, grant, award, commission, job or collaboration on FindArt Platform.";

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

export default function SubmitOpportunitiesPage() {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-white pt-[95px] md:pt-[105px]">
      <Header />
      <section className="px-5 pb-20 md:px-8 lg:px-12">
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-8">
          <div>
            <p className="text-[10px] uppercase tracking-[0.28em] text-neutral-500">Open Submission</p>
            <h1 className="editorial-serif mt-3 text-[clamp(1.5rem,3.4vw,2.2rem)] font-semibold uppercase leading-[1.02] tracking-[-0.02em] text-neutral-900">
              SUBMIT AN OPPORTUNITY
            </h1>
          </div>

          <p className="text-[15px] leading-[1.65] text-neutral-700 md:text-[16px]">
            List an open call, residency, grant, award, commission, job or collaboration
            on FindArt Platform. Reviewed within a few days and published if a fit for
            the FindArt audience. Please submit at least two weeks before the deadline
            so applicants have time to prepare.
          </p>

          <ul className="space-y-1.5 border-y border-neutral-200 py-5 text-[14px] leading-[1.55] text-neutral-800">
            <li>— Listing on the Opportunities archive</li>
            <li>— Automatic removal once the deadline passes</li>
            <li>— Discoverable via tag / location / audience filters</li>
          </ul>

          <SubmissionForm submissionType="opportunity" />
        </div>
      </section>
    </main>
  );
}
