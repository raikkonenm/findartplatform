import Image from "next/image";
import Link from "next/link";
import {
  editorialSavedKey,
  getRelatedEditorialArtists,
  type EditorialArtist,
} from "@/data/editorial";
import { SaveExhibitionButton } from "./SavedExhibitions";

export function EditorialDetail({ artist }: { artist: EditorialArtist }) {
  const [heroImage, ...galleryImages] = artist.images;
  const relatedArtists = getRelatedEditorialArtists(artist.slug, 3);

  return (
    <article className="bg-white px-5 pb-20 pt-10 text-neutral-900 md:px-8 md:pb-28 md:pt-14 lg:px-12">
      <header className="flex items-start justify-between gap-6 border-b border-neutral-200 pb-8 md:pb-10">
        <div className="min-w-0">
          <h1 className="editorial-serif break-words text-[clamp(1.3rem,3vw,2.5rem)] uppercase leading-[1.04] tracking-[-0.035em]">
            {artist.artistName}
          </h1>
          <a
            href={artist.instagramUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-3 block text-[11px] uppercase tracking-[0.24em] text-neutral-600 transition-opacity hover:opacity-55"
          >
            {artist.instagramHandle}
          </a>
        </div>
        <SaveExhibitionButton
          slug={editorialSavedKey(artist.slug)}
          title={artist.artistName}
        />
      </header>

      <figure className="mx-auto mt-10 w-full max-w-[48rem] md:mt-14">
        <Image
          src={heroImage.src}
          alt={`${artist.artistName} editorial image 1`}
          width={heroImage.width}
          height={heroImage.height}
          className="mx-auto h-auto max-h-[82vh] w-auto max-w-full object-contain"
          priority
          fetchPriority="high"
          unoptimized
          sizes="(min-width: 1024px) 56vw, (min-width: 768px) 76vw, 100vw"
        />
      </figure>

      <section className="mx-auto mt-12 max-w-[40rem] border-t border-neutral-200 pt-10 md:mt-16 md:pt-12">
        {artist.body.split(/\n\n+/).map((paragraph) => (
          <p
            key={paragraph}
            className="mb-6 text-[1rem] leading-[1.7] text-neutral-800 last:mb-0 md:text-[1.05rem]"
          >
            {paragraph}
          </p>
        ))}
      </section>

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
