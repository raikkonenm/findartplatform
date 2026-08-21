import Image from "next/image";
import Link from "next/link";
import {
  editorialSavedKey,
  getEditorialArtistMeta,
  getRelatedEditorialArtists,
  type EditorialArtist,
} from "@/data/editorial";
import { SaveExhibitionButton } from "./SavedExhibitions";

export function EditorialDetail({ artist }: { artist: EditorialArtist }) {
  const [heroImage, ...galleryImages] = artist.images;
  const relatedArtists = getRelatedEditorialArtists(artist.slug, 3);
  const meta = getEditorialArtistMeta(artist.slug);

  return (
    <article className="bg-white px-5 pb-20 pt-10 text-neutral-900 md:px-8 md:pb-28 md:pt-14 lg:px-12">
      {/* Header row above the photo: eyebrow + full-width single-line title, SAVE right. */}
      <header className="flex items-start justify-between gap-6 pb-8 md:pb-10">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] uppercase tracking-[0.28em] text-neutral-500">Feature</p>
          <h1 className="editorial-serif mt-3 min-w-0 whitespace-nowrap text-[clamp(1.4rem,5vw,3.5rem)] uppercase leading-[1.02] tracking-[-0.035em]">
            {artist.artistName}
          </h1>
        </div>
        <SaveExhibitionButton
          slug={editorialSavedKey(artist.slug)}
          title={artist.artistName}
        />
      </header>

      {/* Photo left / metadata table right — no title in the right column now,
          so the table sits at the top of the photo. */}
      <div className="grid grid-cols-1 gap-10 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] md:gap-14 lg:gap-20">
        <div className="relative w-full">
          <div className="relative aspect-[4/5] w-full overflow-hidden bg-neutral-100">
            <Image
              src={heroImage.src}
              alt={`${artist.artistName} editorial image 1`}
              fill
              priority
              fetchPriority="high"
              unoptimized
              sizes="(min-width: 1024px) 50vw, (min-width: 768px) 55vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>

        <dl className="divide-y divide-neutral-200 border-y border-neutral-200 self-start">
          <div className="grid grid-cols-[100px_1fr] gap-4 py-4 md:grid-cols-[120px_1fr] md:gap-6">
            <dt className="text-[10px] uppercase tracking-[0.22em] text-neutral-500">Artist</dt>
            <dd className="text-[14px] leading-relaxed">{artist.artistName}</dd>
          </div>
          <div className="grid grid-cols-[100px_1fr] gap-4 py-4 md:grid-cols-[120px_1fr] md:gap-6">
            <dt className="text-[10px] uppercase tracking-[0.22em] text-neutral-500">Medium</dt>
            <dd className="text-[14px] leading-relaxed">{meta.medium}</dd>
          </div>
          <div className="grid grid-cols-[100px_1fr] gap-4 py-4 md:grid-cols-[120px_1fr] md:gap-6">
            <dt className="text-[10px] uppercase tracking-[0.22em] text-neutral-500">Tags</dt>
            <dd className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] uppercase tracking-[0.14em] text-neutral-800">
              {meta.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </dd>
          </div>
          <div className="grid grid-cols-[100px_1fr] gap-4 py-4 md:grid-cols-[120px_1fr] md:gap-6">
            <dt className="text-[10px] uppercase tracking-[0.22em] text-neutral-500">Instagram</dt>
            <dd>
              <a
                href={artist.instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[14px] leading-relaxed text-neutral-900 underline decoration-neutral-300 underline-offset-4 transition-opacity hover:opacity-60"
              >
                {artist.instagramHandle}
              </a>
            </dd>
          </div>
        </dl>
      </div>

      {/* Description */}
      <section className="mx-auto mt-14 max-w-[42rem] border-t border-neutral-200 pt-10 md:mt-20 md:pt-12">
        {artist.body.split(/\n\n+/).map((paragraph) => (
          <p
            key={paragraph}
            className="mb-6 text-[1rem] leading-[1.7] text-neutral-800 last:mb-0 md:text-[1.05rem]"
          >
            {paragraph}
          </p>
        ))}
      </section>

      {/* Gallery carousel — full-width figures stacked */}
      {galleryImages.length > 0 && (
        <section className="mt-14 space-y-14 border-t border-neutral-200 pt-12 md:mt-20 md:space-y-20 md:pt-16">
          {galleryImages.map((image, index) => (
            <figure key={image.src} className="mx-auto max-w-5xl">
              <Image
                src={image.src}
                alt={`${artist.artistName} editorial image ${index + 2}`}
                width={image.width}
                height={image.height}
                className="mx-auto h-auto max-h-[86vh] w-auto max-w-full object-contain"
                loading="lazy"
                unoptimized
                sizes="(min-width: 1024px) 70vw, 92vw"
              />
            </figure>
          ))}
        </section>
      )}

      {relatedArtists.length > 0 && (
        <section className="mt-16 border-t border-neutral-200 pt-10 md:mt-24 md:pt-14">
          <h2 className="mb-6 text-[11px] font-semibold uppercase tracking-[0.28em] text-neutral-900 md:mb-8">
            Related artists
          </h2>
          <div className="grid grid-cols-3 gap-3 md:gap-6">
            {relatedArtists.map((related) => (
              <Link
                key={related.slug}
                href={`/features/${related.slug}`}
                className="group block min-w-0"
              >
                <div className="relative aspect-[4/5] w-full overflow-hidden rounded bg-neutral-100 md:rounded-none">
                  <Image
                    src={related.coverImage.src}
                    alt={`${related.artistName} portrait`}
                    fill
                    unoptimized
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                    sizes="(min-width: 1024px) 20vw, (min-width: 768px) 30vw, 32vw"
                  />
                </div>
                <p className="editorial-serif mt-3 break-words text-[clamp(0.8rem,3vw,1rem)] uppercase leading-[1.08] tracking-[-0.03em] md:text-[clamp(0.95rem,1.4vw,1.3rem)]">
                  {related.artistName.toUpperCase()}
                </p>
                <p className="mt-1 truncate text-[10px] uppercase tracking-[0.18em] text-neutral-500">
                  {related.instagramHandle}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
