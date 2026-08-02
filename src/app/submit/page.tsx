import type { Metadata } from "next";
import { headers } from "next/headers";
import { Header } from "@/components/Header";
import { MasonryGrid } from "@/components/MasonryGrid";
import { SubmissionExperience } from "@/components/SubmissionExperience";
import { exhibitions } from "@/data/exhibitions";

function isMobileUserAgent(ua: string): boolean {
  return /Mobi|Android|iP(hone|od)|BlackBerry|IEMobile|Opera Mini|Kindle|Silk/i.test(ua);
}

const SUBMIT_TITLE = "Submit Your Exhibition — Open Call for Artists";
const SUBMIT_DESCRIPTION =
  "Send us photos and details of your exhibition to be featured in the FindArt Platform archive. Free open call for artists, curators and galleries.";
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

const previewSlugs = [
  "metempsychosis-the-passion-of-pneumatics",
  "incommunicability-is-itself-a-source-of-pleasures",
  "the-worm-at-the-core",
];
const previewExhibitions = previewSlugs.flatMap((slug) => {
  const exhibition = exhibitions.find((candidate) => candidate.slug === slug);
  return exhibition ? [exhibition] : [];
});

export default async function SubmitPage() {
  const userAgent = (await headers()).get("user-agent") ?? "";
  const initialIsMobile = isMobileUserAgent(userAgent);
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-white pt-[95px] md:pt-[105px]">
      <Header />

      <section className="px-5 pb-20 md:px-8 lg:px-12">
        <SubmissionExperience />

        <section className="mt-16 border-t border-neutral-200 pt-10 md:mt-24 md:pt-12">
          <MasonryGrid exhibitions={previewExhibitions} eagerCount={3} initialIsMobile={initialIsMobile} />
        </section>
      </section>
    </main>
  );
}
