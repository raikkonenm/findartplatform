import type { Exhibition } from "@/data/exhibitions";
import { ExhibitionCard } from "./ExhibitionCard";

type ExhibitionGridProps = {
  exhibitions: Exhibition[];
  heading?: string;
};

export function ExhibitionGrid({ exhibitions, heading = "Exhibition Archive" }: ExhibitionGridProps) {
  return (
    <section className="bg-white px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
      <div className="mb-14 flex items-end justify-between border-b border-neutral-200 pb-6 sm:mb-16">
        <h2 className="text-[11px] uppercase tracking-[0.32em]">{heading}</h2>
        <p className="text-[10px] uppercase tracking-[0.28em] text-neutral-500">
          {String(exhibitions.length).padStart(2, "0")} Exhibitions
        </p>
      </div>
      <div className="grid grid-cols-1 gap-x-10 gap-y-[72px] md:grid-cols-2 min-[1200px]:grid-cols-3 min-[1200px]:gap-x-14">
        {exhibitions.map((exhibition, index) => (
          <ExhibitionCard key={exhibition.slug} exhibition={exhibition} eager={index < 3} />
        ))}
      </div>
    </section>
  );
}
