import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { SubmissionExperience } from "@/components/SubmissionExperience";

const SUBMIT_TITLE = "Submit — Exhibitions, Artists, Websites";
const SUBMIT_DESCRIPTION =
  "Send us your exhibition, artist practice or website to be featured on FindArt Platform.";
const SUBMIT_URL = "https://www.findartplatform.com/submit";

export const metadata: Metadata = {
  title: { absolute: SUBMIT_TITLE },
  description: SUBMIT_DESCRIPTION,
  alternates: { canonical: SUBMIT_URL },
  openGraph: {
    type: "website",
    url: SUBMIT_URL,
    title: SUBMIT_TITLE,
    description: SUBMIT_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: SUBMIT_TITLE,
    description: SUBMIT_DESCRIPTION,
  },
};

export default function SubmitPage() {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-white pt-[95px] md:pt-[105px]">
      <Header />
      <section className="px-5 pb-20 md:px-8 lg:px-12">
        <SubmissionExperience />
      </section>
    </main>
  );
}
