import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { SubmissionForm } from "@/components/SubmissionForm";

const PAGE_URL = "https://www.findartplatform.com/submit-opportunities";
const PAGE_TITLE = "Submit an Opportunity — Open Calls, Residencies, Grants";
const PAGE_DESCRIPTION =
  "List an open call, residency, grant, award, commission, job or collaboration on FindArt Platform. Free to submit.";

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
        <div className="grid items-start gap-14 lg:grid-cols-[minmax(19rem,0.78fr)_minmax(32rem,1fr)] lg:gap-20 xl:gap-28">
          <div className="lg:sticky lg:top-32">
            <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-500">Open Submission</p>
            <h1 className="editorial-serif mt-6 break-words text-[clamp(2.75rem,13vw,5.3rem)] leading-[0.94] tracking-[-0.055em] md:text-[clamp(3.1rem,5vw,5.3rem)]">
              Submit an Opportunity
            </h1>
            <p className="mt-8 max-w-md text-[1.05rem] leading-8 text-neutral-600">
              List an open call, residency, grant, award, commission, job or collaboration on
              FindArt Platform. Free to submit — reviewed within a few days and published
              if a fit for the FindArt audience.
              <br />
              <br />
              Please submit at least two weeks before the deadline so applicants have time to
              prepare.
            </p>

            <p className="mt-9 text-[17px] leading-7 text-neutral-900">Included:</p>
            <ul className="mt-4 space-y-3 text-[17px] leading-7 text-neutral-800">
              <li>&mdash; Listing on the Opportunities archive</li>
              <li>&mdash; Automatic removal once the deadline passes</li>
              <li>&mdash; Discoverable via tag / location / audience filters</li>
            </ul>

            <aside className="mt-12 border border-neutral-200 bg-white p-6 md:mt-14">
              <p className="text-[15px] font-medium leading-6 text-neutral-900">Free submission</p>
              <p className="mt-4 text-[13px] leading-6 text-neutral-600">
                Each submission is individually reviewed by the FindArt team.
              </p>
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

          <SubmissionForm submissionType="opportunity" />
        </div>
      </section>
    </main>
  );
}
