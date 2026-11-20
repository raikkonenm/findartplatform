import Image from "next/image";
import Link from "next/link";
import { Fragment } from "react";
import type { EssayEditorialSelection, EditorialEssayImage, EditorialEssayRun } from "@/data/editorialSelections";
import { getExhibition } from "@/data/exhibitions";
import type { EditorialCreditEntity } from "@/data/editorialCredits";
import { authorHref, splitCuratorString } from "@/lib/entitySlugs";
import { EditorialCreditText } from "./EditorialCreditText";

function EssayFigure({ image, priority = false, creditEntities, artistEntities }: { image: EditorialEssayImage; priority?: boolean; creditEntities?: EditorialCreditEntity[]; artistEntities?: EditorialCreditEntity[] }) {
  return (
    <figure className="mx-auto" style={{ maxWidth: image.height > image.width ? 560 : undefined }}>
      <Image src={image.src} alt={image.alt} width={image.width} height={image.height}
        priority={priority} sizes="(min-width: 960px) 860px, calc(100vw - 40px)"
        className="h-auto w-full" />
      <figcaption className="mt-3 text-[11px] leading-[1.6] text-neutral-500">
        <span className="block"><EditorialCreditText text={image.caption} entities={artistEntities} /></span>
        <span className="block"><EditorialCreditText text={image.credit} entities={creditEntities} /></span>
      </figcaption>
    </figure>
  );
}

export function EditorialEssayArticle({ selection }: { selection: EssayEditorialSelection }) {
  const exhibition = selection.coverExhibitionSlug ? getExhibition(selection.coverExhibitionSlug) : undefined;
  const image = exhibition?.coverImage ?? exhibition?.previewImage;
  const paragraphs: EditorialEssayRun[][] = selection.paragraphs ?? selection.body.split(/\n\s*\n/).map(text => [{ text }]);
  const creditEntities = selection.credits?.filter(credit => credit.label === "Photography" || credit.label === "Courtesy").flatMap(credit => credit.entities ?? []);
  const artistEntities: EditorialCreditEntity[] = selection.artistName ? [{ kind: "artist", name: selection.artistName }] : [];

  return (
    <article className="bg-white px-5 pb-24 pt-14 text-neutral-900 md:px-8 md:pb-32 md:pt-20 lg:px-12">
      <div className="mx-auto max-w-[860px]">
        <header className="max-w-[720px]">
          <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-500">Essay</p>
          <h1 className="editorial-serif mt-4 break-words text-[clamp(1.8rem,4vw,2.8rem)] leading-[1.08] tracking-[-0.02em]">
            {selection.title}
          </h1>
          <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] leading-6 text-neutral-600">
            <p>By <Link href={authorHref(selection.author)} className="underline decoration-neutral-300 underline-offset-4 transition-opacity hover:opacity-60">{selection.author}</Link></p>
            <span aria-hidden="true">·</span>
            {selection.status === "draft" ? <span>Preview</span> : <time dateTime={selection.publishedAt}>{selection.publishedAtDisplay}</time>}
          </div>
          {selection.coverImage && <p className="mt-4 text-[14px] leading-7 text-neutral-600">{selection.subtitle}</p>}
        </header>

        {selection.coverImage ? (
          <div className="mt-10 md:mt-12"><EssayFigure image={selection.coverImage} priority creditEntities={creditEntities} artistEntities={artistEntities} /></div>
        ) : exhibition && image ? (
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
            {exhibition.photographer && <> Photo: <EditorialCreditText text={exhibition.photographer} entities={splitCuratorString(exhibition.photographer).map(name => ({ kind: "photographer", name }))} />.</>}
          </figcaption>
        </figure>
        ) : null}

        <div className="mx-auto mt-10 max-w-[680px] space-y-7 text-[15px] leading-[1.85] text-neutral-800 md:mt-14 md:text-[16px]">
          {paragraphs.map((runs, index) => (
            <Fragment key={index}>
              <p>{runs.map((run, part) => {
                const text = run.italic ? <em>{run.text}</em> : run.text;
                return <Fragment key={part}>{run.bold ? <strong>{text}</strong> : text}</Fragment>;
              })}</p>
              {selection.images?.filter(image => image.afterParagraph === index + 1).map(image => (
                <div key={image.src} className="py-4 md:py-6"><EssayFigure image={image} creditEntities={creditEntities} artistEntities={artistEntities} /></div>
              ))}
            </Fragment>
          ))}
        </div>

        <footer className="mx-auto mt-16 max-w-[680px] border-t border-neutral-200 pt-8 md:mt-20">
          {selection.credits && <section aria-label="Article credits" className="mb-10">
            <h2 className="text-[10px] uppercase tracking-[0.28em] text-neutral-500">Credits</h2>
            <dl className="mt-5 space-y-3 text-[13px] leading-6">
              {selection.credits.map(credit => <div key={credit.label}><dt className="inline font-medium">{credit.label}: </dt><dd className="inline"><EditorialCreditText text={credit.value} entities={credit.entities} /></dd></div>)}
            </dl>
          </section>}
          {exhibition && <>
          <p className="text-[10px] uppercase tracking-[0.28em] text-neutral-500">Explore the exhibition</p>
          <Link
            href={`/exhibitions/${exhibition.slug}`}
            className="mt-4 inline-block text-[14px] leading-6 underline decoration-neutral-300 underline-offset-4 transition-opacity hover:opacity-60"
          >
            {exhibition.title} — {selection.artistName} at {exhibition.gallery} →
          </Link>
          </>}
          <p className="mt-8 text-[12px] leading-6 text-neutral-600">
            <Link href="/editorial" className="transition-opacity hover:opacity-60">← Back to Editorial</Link>
          </p>
        </footer>
      </div>
    </article>
  );
}
