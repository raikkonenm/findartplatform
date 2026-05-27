import type { Metadata } from "next";
import { ExhibitionCard } from "@/components/ExhibitionCard";
import { Header } from "@/components/Header";
import { SubmissionExperience } from "@/components/SubmissionExperience";
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
    <main className="relative min-h-screen overflow-x-hidden bg-white pt-[95px] md:pt-[105px]">
      <Header />

      <section className="px-5 pb-20 md:px-8 lg:px-12">
        <SubmissionExperience />

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
