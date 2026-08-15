import Image from "next/image";
import { editorialSavedKey, type EditorialArtist } from "@/data/editorial";
import { SaveExhibitionButton } from "./SavedExhibitions";

export function EditorialDetail({ artist }: { artist: EditorialArtist }) {
  const [heroImage, ...galleryImages] = artist.images;

  return (
    <article className="bg-white px-5 pb-20 pt-10 text-neutral-900 md:px-8 md:pb-28 md:pt-14 lg:px-12">
      <header className="flex items-start justify-between gap-6 border-b border-neutral-200 pb-8 md:pb-10">
        <a
          href={artist.instagramUrl}
          target="_blank"
          rel="noreferrer"
          className="text-[11px] uppercase tracking-[0.28em] text-neutral-600 transition-opacity hover:opacity-55"
        >
          {artist.instagramHandle}
        </a>
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
    </article>
  );
}
