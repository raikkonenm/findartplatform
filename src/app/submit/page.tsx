import type { Metadata } from "next";
import { headers } from "next/headers";
import { Header } from "@/components/Header";
import { MasonryGrid } from "@/components/MasonryGrid";
import { SubmissionExperience } from "@/components/SubmissionExperience";
import { exhibitions } from "@/data/exhibitions";

function isMobileUserAgent(ua: string): boolean {
  return /Mobi|Android|iP(hone|od)|BlackBerry|IEMobile|Opera Mini|Kindle|Silk/i.test(ua);
}

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
