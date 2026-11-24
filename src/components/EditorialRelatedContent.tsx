import Image from "next/image";
import Link from "next/link";
import { editorialRelatedContent } from "@/data/editorialRelatedContent";
import { getEditorialSelection, getEditorialSelectionCoverImage } from "@/data/editorialSelections";
import { getExhibition } from "@/data/exhibitions";

export function EditorialRelatedContent({ selectionSlug }: { selectionSlug: string }) {
  const entries = editorialRelatedContent[selectionSlug] ?? [];
  if (!entries.length) return null;
  const cards = entries.map(entry => {
    const editorial = entry.kind === "editorial" ? getEditorialSelection(entry.slug) : undefined;
    const exhibition = entry.kind === "exhibition" ? getExhibition(entry.slug) : undefined;
    const title = editorial?.title ?? exhibition?.title;
    const image = editorial ? getEditorialSelectionCoverImage(editorial) : exhibition?.coverImage ?? exhibition?.previewImage;
    if (!title || !image) throw new Error(`Missing related ${entry.kind}: ${entry.slug}`);
    return { ...entry, title, image, href: `/${entry.kind === "editorial" ? "editorial" : "exhibitions"}/${entry.slug}` };
  });

  return (
    <section aria-label="Related on FindArt" className="mt-12 border-t border-neutral-200 pt-8">
      <h2 className="text-[14px] uppercase tracking-[0.2em]">Related on FindArt</h2>
      <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 md:gap-x-6">
        {cards.map(card => <li key={card.href} className="min-w-0">
          <Link href={card.href} scroll={false} prefetch={false} className="group block">
            <div className="relative aspect-[4/5] overflow-hidden bg-neutral-100">
              <Image src={card.image} alt={`${card.title} — preview`} fill sizes="(min-width: 1024px) 300px, (min-width: 768px) 30vw, 45vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.02]" />
            </div>
            <p className="mt-3 text-[11px] uppercase tracking-[0.18em] text-neutral-500">{card.kind === "editorial" ? "Editorial" : "Exhibition"}</p>
            <h3 className="editorial-serif mt-2 break-words text-[18px] leading-[1.2]">{card.title}</h3>
            <p className="mt-2 text-[13px] leading-5 text-neutral-600">{card.context}</p>
          </Link>
        </li>)}
      </ul>
    </section>
  );
}
