import { getEditorialSelectionCard, type EditorialSelection } from "@/data/editorialSelections";
import { EditorialSelectionCard } from "./EditorialSelectionCard";

export function EditorialCardsSection({ selections }: { selections: EditorialSelection[] }) {
  const cards = selections.map(getEditorialSelectionCard).filter(card => card !== null);
  if (cards.length === 0) return null;
  return <section className="mt-12 md:mt-16" aria-label="Related Editorial">
    <h2 className="text-[10px] uppercase tracking-[0.28em] text-neutral-500">Editorial</h2>
    <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 sm:gap-x-6 md:gap-x-8 md:gap-y-14 lg:grid-cols-4">
      {cards.map(card => <EditorialSelectionCard key={card.slug} selection={card} />)}
    </div>
  </section>;
}
