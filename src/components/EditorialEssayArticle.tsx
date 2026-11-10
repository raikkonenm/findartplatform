import Image from "next/image";
import Link from "next/link";
import type { EssayEditorialSelection } from "@/data/editorialSelections";
import { getExhibition } from "@/data/exhibitions";

export function EditorialEssayArticle({ selection }: { selection: EssayEditorialSelection }) {
  const exhibition = getExhibition(selection.coverExhibitionSlug)!;
  const image = exhibition.coverImage ?? exhibition.previewImage;

  return (
    <article className="bg-white px-5 pb-24 pt-14 text-neutral-900 md:px-8 md:pb-32 md:pt-20 lg:px-12">
      <div className="mx-auto max-w-[860px]">
        <header className="max-w-[720px]">
          <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-500">Essay</p>
          <h1 className="editorial-serif mt-4 break-words text-[clamp(1.8rem,4vw,2.8rem)] leading-[1.08] tracking-[-0.02em]">
            {selection.title}
          </h1>
          <p className="mt-5 text-[13px] leading-6 text-neutral-600">By {selection.author}</p>
        </header>

        <figure className="mt-10 md:mt-12">
          <Image
            src={image}
            alt={`${selection.artistName}, ${exhibition.title}, installation view at ${exhibition.gallery}`}
            width={1280}
            height={960}
            priority
            sizes="(min-width: 960px) 860px, calc(100vw - 40px)"
            className="h-auto w-full"
          />
          <figcaption className="mt-3 text-[11px] leading-[1.6] text-neutral-500">
            {exhibition.title}, {exhibition.gallery}, {exhibition.city}, {exhibition.year}.
            {exhibition.photographer && <> Photo: {exhibition.photographer}.</>}
          </figcaption>
        </figure>

        <div className="mx-auto mt-10 max-w-[680px] space-y-7 text-[15px] leading-[1.85] text-neutral-800 md:mt-14 md:text-[16px]">
          {selection.body.split(/\n\s*\n/).map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>

        <footer className="mx-auto mt-16 max-w-[680px] border-t border-neutral-200 pt-8 md:mt-20">
          <p className="text-[10px] uppercase tracking-[0.28em] text-neutral-500">Explore the exhibition</p>
          <Link
            href={`/exhibitions/${exhibition.slug}`}
            className="mt-4 inline-block text-[14px] leading-6 underline decoration-neutral-300 underline-offset-4 transition-opacity hover:opacity-60"
          >
            {exhibition.title} — {selection.artistName} at {exhibition.gallery} →
          </Link>
          <p className="mt-8 text-[12px] leading-6 text-neutral-600">
            <Link href="/editorial" className="transition-opacity hover:opacity-60">← Back to Editorial</Link>
          </p>
        </footer>
      </div>
    </article>
  );
}
