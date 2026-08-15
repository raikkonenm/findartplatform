import type { Exhibition } from "@/data/exhibitions";
import { ExhibitionCard } from "./ExhibitionCard";

type ExhibitionGridProps = {
  exhibitions: Exhibition[];
  heading?: string;
};

export function ExhibitionGrid({ exhibitions, heading = "Exhibition Archive" }: ExhibitionGridProps) {
  return (
    <section className="bg-white px-5 py-12 md:px-8 md:py-20 lg:px-12 lg:py-24">
      <div className="mb-12 flex items-end justify-between gap-4 border-b border-neutral-200 pb-6 md:mb-16">
        <h2 className="text-[11px] uppercase tracking-[0.32em]">{heading}</h2>
        <p className="text-[10px] uppercase tracking-[0.28em] text-neutral-500">
          {String(exhibitions.length).padStart(2, "0")} Exhibitions
        </p>
      </div>
      <div className="archive-card-grid grid grid-cols-1 gap-x-10 gap-y-[64px] md:grid-cols-2 lg:grid-cols-3 lg:gap-x-14 lg:gap-y-[72px]">
        {exhibitions.map((exhibition, index) => (
          <ExhibitionCard key={exhibition.slug} exhibition={exhibition} eager={index < 3} />
        ))}
      </div>
    </section>
  );
}
