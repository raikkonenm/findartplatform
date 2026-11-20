import Image from "next/image";
import Link from "next/link";
import type { EditorialSelectionCardData } from "@/data/editorialSelections";
import { authorHref } from "@/lib/entitySlugs";

export function EditorialSelectionCard({ selection, sizes = "(min-width: 1024px) 22vw, (min-width: 640px) 30vw, 48vw", feed = false }: {
  selection: EditorialSelectionCardData;
  sizes?: string;
  feed?: boolean;
}) {
  return (
    <article className="group min-w-0">
      <Link href={`/editorial/${selection.slug}`} className="block" scroll={false}>
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-neutral-100">
          <Image src={selection.image} alt={`${selection.title} — cover image`} fill sizes={sizes}
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]" />
        </div>
        <div className={feed ? "archive-card-copy pt-5" : "pt-3"}>
          <p className="text-[10px] uppercase tracking-[0.22em] text-neutral-500">{feed || selection.kind !== "essay" ? "Editorial" : "Essay"}</p>
          <h2 className="editorial-serif mt-2 break-words text-[clamp(0.95rem,1.7vw,1.2rem)] leading-[1.15] tracking-[-0.02em]">{selection.title}</h2>
          <p className={`mt-2 text-[12.5px] leading-[1.5] text-neutral-600 ${feed ? "line-clamp-3" : ""}`}>{selection.subtitle}</p>
        </div>
      </Link>
      {selection.author && <p className="mt-3 text-[11px] leading-5 text-neutral-500">
        By <Link href={authorHref(selection.author)} className="underline decoration-neutral-300 underline-offset-4 hover:opacity-60">{selection.author}</Link>
      </p>}
    </article>
  );
}
