import Image from "next/image";
import Link from "next/link";
import { exhibitions, type Exhibition } from "@/data/exhibitions";
import { SaveExhibitionButton } from "./SavedExhibitions";

const METADATA_ACRONYMS = new Set(["cac", "acud", "moco"]);

function formatMetadataWord(word: string) {
  const normalized = word.toLowerCase();

  if (METADATA_ACRONYMS.has(normalized)) {
    return normalized.toUpperCase();
  }

  const spaced = word.replace(/([a-z])([A-Z])/g, "$1 $2");

  return spaced
    .split(" ")
    .map((part) => {
      const lowercase = part.toLowerCase();
      return lowercase.charAt(0).toUpperCase() + lowercase.slice(1);
    })
    .join(" ");
}

function displayMetadataText(value?: string) {
  return value?.replace(/[@#]([\p{L}\p{N}_.-]+)/gu, (_match, token: string) =>
    token
      .split(/[._-]+/)
      .filter(Boolean)
      .map(formatMetadataWord)
      .join(" "),
  );
}

function displayPersonText(value?: string) {
  const displayed = displayMetadataText(value);

  if (!displayed) {
    return displayed;
  }

  const lettersOnly = displayed.replace(/[^\p{L}]/gu, "");
  if (lettersOnly !== lettersOnly.toLocaleUpperCase()) {
    return displayed;
  }

  return displayed
    .toLocaleLowerCase()
    .replace(/(^|[\s,/&-]+)(\p{L})/gu, (_match, prefix: string, letter: string) => {
      return `${prefix}${letter.toLocaleUpperCase()}`;
    })
    .replace(/\bAnd\b/g, "and");
}

function displayCaptionText(value?: string) {
  const displayed = displayMetadataText(value);

  return displayed?.replace(/(Photo:\s*)(.+)$/i, (_match, label: string, name: string) => {
    return `${label}${displayPersonText(name)}`;
  });
}

function PanelMetadata({ exhibition }: { exhibition: Exhibition }) {
  const venue = displayMetadataText(exhibition.gallery ?? exhibition.venue);
  const artists = exhibition.artists?.map((artist) => displayPersonText(artist)).join(", ");
  const curator = displayPersonText(exhibition.curator);
  const photographer = displayPersonText(exhibition.photographer);
  const tagsEntry = {
    label: "Tags",
    value: (
      <div className="flex flex-wrap gap-2">
        {exhibition.tags.map((tag) => (
          <Link
            key={tag}
            href={{ pathname: "/", query: { tag } }}
            scroll={false}
            className="border border-neutral-200 bg-white px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-neutral-600 transition-colors hover:border-neutral-900 hover:text-neutral-900"
          >
            {tag}
          </Link>
        ))}
      </div>
    ),
  };
  const entries: Array<{ label: string; value?: React.ReactNode }> = [
    { label: "Dates", value: exhibition.dates },
    { label: "Venue", value: venue },
    exhibition.instagramUrl
      ? {
          label: "Instagram",
          value: (
            <a
              href={exhibition.instagramUrl}
              target="_blank"
              rel="noreferrer"
              className="transition-opacity hover:opacity-55"
            >
              View post
            </a>
          ),
        }
      : { label: "Instagram" },
    ...(!exhibition.photographer ? [tagsEntry] : []),
    { label: "Artists", value: artists },
    { label: "Curator", value: curator },
    { label: "Photo", value: photographer },
    ...(exhibition.photographer ? [tagsEntry] : []),
    { label: "Exhibition Text", value: exhibition.exhibitionText },
  ];

  return (
    <dl className="space-y-6">
      {entries
        .filter(({ value }) => Boolean(value))
        .map(({ label, value }) => (
          <div key={label} className="border-b border-neutral-200 pb-5 last:border-0">
            <dt className="text-[10px] uppercase tracking-[0.28em] text-neutral-500">{label}</dt>
            <dd className="mt-2 text-[13px] leading-6 text-neutral-800">{value}</dd>
          </div>
        ))}
    </dl>
  );
}

function RelatedExhibitions({
  exhibition,
  preservePanelNavigation,
}: {
  exhibition: Exhibition;
  preservePanelNavigation: boolean;
}) {
  const related = exhibitions
    .filter((candidate) => candidate.slug !== exhibition.slug)
    .map((candidate, index) => ({
      exhibition: candidate,
      index,
      overlap: candidate.tags.filter((tag) => exhibition.tags.includes(tag)).length,
    }))
    .filter(({ overlap }) => overlap > 0)
    .sort((first, second) => second.overlap - first.overlap || first.index - second.index)
    .slice(0, 3)
    .map(({ exhibition: candidate }) => candidate);

  const displayRelated = related.length > 0
    ? related
    : exhibitions.filter((candidate) => candidate.slug !== exhibition.slug).slice(0, 3);

  return (
    <section className="mt-14 border-t border-neutral-200 pt-10 md:mt-20 md:pt-12">
      <h2 className="text-[10px] uppercase tracking-[0.28em] text-neutral-500">
        Related Exhibitions
      </h2>
      <div className="mt-8 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {displayRelated.map((relatedExhibition) => {
          const content = (
            <>
            <div className="relative aspect-[4/5] overflow-hidden bg-neutral-100">
              <Image
                src={relatedExhibition.previewImage}
                alt={`${relatedExhibition.title} exhibition view`}
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 21vw, (min-width: 640px) 28vw, 100vw"
              />
            </div>
            <p className="mt-4 text-[10px] uppercase tracking-[0.26em] text-neutral-500">
              {relatedExhibition.city} / {relatedExhibition.year}
            </p>
            <h3 className="mt-2 text-[1.05rem] font-medium leading-[1.18] tracking-[-0.02em]">
              {relatedExhibition.title}
            </h3>
            {(relatedExhibition.gallery || relatedExhibition.venue) && (
              <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-[#888]">
                {relatedExhibition.gallery ?? relatedExhibition.venue}
              </p>
            )}
            </>
          );
          const className = "group block";
          const href = `/exhibitions/${relatedExhibition.slug}`;

          return preservePanelNavigation ? (
            <Link
              key={relatedExhibition.slug}
              href={href}
              scroll={false}
              className={className}
            >
              {content}
            </Link>
          ) : (
            <a key={relatedExhibition.slug} href={href} className={className}>
              {content}
            </a>
          );
        })}
      </div>
    </section>
  );
}

type ExhibitionDetailProps = {
  exhibition: Exhibition;
  preservePanelNavigation?: boolean;
};

export function ExhibitionDetail({
  exhibition,
  preservePanelNavigation = false,
}: ExhibitionDetailProps) {
  const location = [exhibition.city, exhibition.country].filter(Boolean).join(", ");
  const venueLine = [
    displayMetadataText(exhibition.gallery ?? exhibition.venue),
    displayPersonText(exhibition.subtitle),
  ]
    .filter(Boolean)
    .join(" / ");
  const photographer = displayPersonText(exhibition.photographer);
  const panelGallery = exhibition.images.filter(
    (image, index) => image.src !== exhibition.heroImage || index > 0,
  );

  return (
      <article className="min-w-0 bg-white px-5 pb-16 pt-16 text-neutral-900 md:px-10 md:pb-20 md:pt-12 lg:px-12 lg:pt-12">
        <header className="relative min-w-0 max-w-5xl border-b border-neutral-200 pb-8 md:pb-10 md:pr-[13rem]">
          <div className="mb-7 flex justify-end pr-12 md:absolute md:right-20 md:top-0 md:mb-0 md:pr-0">
            <SaveExhibitionButton slug={exhibition.slug} title={exhibition.title} />
          </div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-500">
            {[location, exhibition.year].filter(Boolean).join(" / ")}
          </p>
          <h1 className="mt-5 max-w-4xl break-words text-[clamp(1.75rem,9vw,3.5rem)] font-medium leading-[1.08] tracking-[-0.04em] md:text-[clamp(2rem,4vw,3.5rem)]">
            {exhibition.title}
          </h1>
          {(exhibition.gallery || exhibition.venue || exhibition.subtitle) && (
            <p className="mt-4 text-[13px] leading-6 text-neutral-500">{venueLine}</p>
          )}
        </header>

        <section className="mt-8 grid min-w-0 items-start gap-10 md:mt-10 lg:grid-cols-[minmax(0,1fr)_14rem] lg:gap-10">
          <figure className="mx-auto w-full max-w-[38rem]">
            <Image
              src={exhibition.heroImage}
              alt={`${exhibition.title} installation view`}
              width={1600}
              height={1200}
              className="mx-auto h-auto max-h-[60vh] w-full max-w-full object-contain md:w-auto"
              sizes="(min-width: 1200px) 34vw, (min-width: 1024px) 42vw, 100vw"
            />
            <figcaption className="mt-4 text-[11px] leading-5 text-neutral-500">
              {photographer
                ? `Installation view. Photo: ${photographer}`
                : "Installation view."}
            </figcaption>
          </figure>
          <aside>
            <PanelMetadata exhibition={exhibition} />
          </aside>
        </section>

        <section className="mx-auto mt-12 max-w-[40rem] border-t border-neutral-200 pt-10 md:mt-16 md:pt-12">
          {exhibition.description.split(/\n\n+/).map((paragraph) => (
            <p
              key={paragraph}
              className="mb-6 break-words text-[1rem] leading-[1.7] text-neutral-800 last:mb-0 md:text-[1.05rem]"
            >
              {paragraph}
            </p>
          ))}
        </section>

        {panelGallery.length > 0 && (
          <section className="mt-14 space-y-14 border-t border-neutral-200 pt-12 md:mt-20 md:space-y-20 md:pt-16">
            {panelGallery.map((image, index) => (
              <figure
                key={`${image.src}-${index}`}
                className={`mx-auto ${
                  image.orientation === "vertical" ? "max-w-2xl" : "max-w-5xl"
                }`}
              >
                <Image
                  src={image.src}
                  alt={`${exhibition.title} installation view ${index + 2}`}
                  width={image.orientation === "vertical" ? 1200 : 1800}
                  height={image.orientation === "vertical" ? 1800 : 1200}
                  className="h-auto max-h-[86vh] w-full object-contain"
                  sizes={
                    image.orientation === "vertical"
                      ? "(min-width: 1024px) 48vw, 92vw"
                      : "(min-width: 1024px) 70vw, 92vw"
                  }
                />
                <figcaption className="mt-4 text-[11px] leading-5 text-neutral-500">
                  {displayCaptionText(image.caption) ??
                    (photographer
                      ? `Installation view. Photo: ${photographer}`
                      : "Installation view.")}
                </figcaption>
              </figure>
            ))}
          </section>
        )}
        <RelatedExhibitions
          exhibition={exhibition}
          preservePanelNavigation={preservePanelNavigation}
        />
      </article>
  );
}
