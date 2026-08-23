import Image from "next/image";
import Link from "next/link";
import { exhibitions, type Exhibition } from "@/data/exhibitions";
import { displayExhibitionTitle } from "@/lib/displayExhibitionTitle";
import { displayVenueText } from "@/lib/displayVenueText";
import {
  authorHref,
  entityHref,
  exhibitionFacetHref,
  splitCuratorString,
} from "@/lib/entitySlugs";
import { OnViewDot } from "./OnViewDot";
import { SaveExhibitionButton } from "./SavedExhibitions";

const METADATA_ACRONYMS = new Set(["cac", "acud", "moco"]);

// Map of abbreviated month names → full month names. Applied to display values
// so dates render as "25 April 2026" instead of "25 Apr 2026".
const MONTH_ABBREVIATIONS: Record<string, string> = {
  jan: "January",
  feb: "February",
  mar: "March",
  apr: "April",
  may: "May",
  jun: "June",
  jul: "July",
  aug: "August",
  sep: "September",
  sept: "September",
  oct: "October",
  nov: "November",
  dec: "December",
};

function expandMonthAbbreviations(value?: string) {
  if (!value) return value;
  return value.replace(/\b(jan|feb|mar|apr|may|jun|jul|aug|sept|sep|oct|nov|dec)\.?\b/gi, (match) => {
    const key = match.replace(/\.$/, "").toLowerCase();
    const full = MONTH_ABBREVIATIONS[key];
    if (!full) return match;
    // Preserve title case based on the original first character
    return full;
  });
}

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

// Join an artists list as required by the design spec:
// 1 → "X"
// 2 → "X and Y"
// 3+ → "X, Y, Z" (comma-separated)
function joinArtists(artists?: string[]) {
  if (!artists || artists.length === 0) return undefined;
  const cleaned = artists.map((artist) => displayPersonText(artist) ?? artist);
  if (cleaned.length === 1) return cleaned[0];
  if (cleaned.length === 2) return `${cleaned[0]} and ${cleaned[1]}`;
  return cleaned.join(", ");
}

// Deterministic aspect-ratio variant per slug. Kept in sync with
// ExhibitionCard.aspectClassForSlug so Related Exhibitions cards crop
// identically to homepage cards.
function aspectClassForSlug(slug: string): string {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = (hash * 31 + slug.charCodeAt(i)) | 0;
  }
  const idx = Math.abs(hash) % 3;
  if (idx === 0) return "aspect-[3/4]";
  if (idx === 1) return "aspect-[4/5]";
  return "aspect-[1/1]";
}

const ENTITY_LINK_CLASS =
  "underline decoration-neutral-300 decoration-1 underline-offset-[3px] transition-opacity hover:opacity-55";

// Join a list of raw entity names as Link nodes, matching the joinArtists
// style: 1→"X"; 2→"X and Y"; 3+→comma-separated.
function joinEntityLinks(kind: "gallery" | "artist" | "curator" | "photographer", raws: string[]): React.ReactNode {
  const nodes = raws.map((raw) => (
    <Link key={raw} href={entityHref(kind, raw)} target="_blank" rel="noopener noreferrer" className={ENTITY_LINK_CLASS}>
      {displayPersonText(raw) ?? raw}
    </Link>
  ));
  if (nodes.length === 1) return nodes[0];
  if (nodes.length === 2) return (<>{nodes[0]} and {nodes[1]}</>);
  return nodes.reduce<React.ReactNode[]>((acc, node, index) => {
    if (index > 0) acc.push(", ");
    acc.push(node);
    return acc;
  }, []);
}

function PanelMetadata({ exhibition }: { exhibition: Exhibition }) {
  const dates = expandMonthAbbreviations(exhibition.dates);
  const rawVenue = exhibition.gallery ?? exhibition.venue;
  const venue = displayMetadataText(rawVenue);
  const venueNode = rawVenue && venue
    ? (
      <Link
        href={entityHref("gallery", rawVenue)}
        target="_blank"
        rel="noopener noreferrer"
        className={ENTITY_LINK_CLASS}
      >
        {venue}
      </Link>
    )
    : venue;

  const artistsJoined = exhibition.artists && exhibition.artists.length > 0
    ? joinEntityLinks("artist", exhibition.artists)
    : undefined;

  const curatorJoined = (() => {
    if (!exhibition.curator) return undefined;
    const parts = splitCuratorString(exhibition.curator);
    if (parts.length === 0) return undefined;
    return joinEntityLinks("curator", parts);
  })();

  const photographerNode = (() => {
    if (!exhibition.photographer) return undefined;
    const parts = splitCuratorString(exhibition.photographer);
    if (parts.length === 0) return undefined;
    return joinEntityLinks("photographer", parts);
  })();

  // Required order: Dates, Venue, Artists, Curators, Photo, View, Tags, Exhibition Text.
  // Each row is rendered only if its value exists. Dates get a tiny
  // on-view dot rendered inline before the date string when the
  // exhibition is running today.
  const datesValue = dates ? (
    <>
      <OnViewDot
        startDate={exhibition.startDate}
        endDate={exhibition.endDate}
      />
      {dates}
    </>
  ) : undefined;
  const entries: Array<{ label: string; value?: React.ReactNode }> = [
    { label: "Dates", value: datesValue },
    { label: "Venue", value: venueNode },
    { label: "Artists", value: artistsJoined },
    { label: "Curators", value: curatorJoined },
    { label: "Photo", value: photographerNode },
    exhibition.instagramUrl
      ? {
          label: "View",
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
      : { label: "View" },
    {
      label: "Tags",
      value:
        exhibition.tags && exhibition.tags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {exhibition.tags.map((tag) => (
              <Link
                key={tag}
                href={entityHref("tag", tag)}
                target="_blank"
                rel="noopener noreferrer"
                className="border border-neutral-200 bg-white px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-neutral-600 transition-colors hover:border-neutral-900 hover:text-neutral-900"
              >
                {tag}
              </Link>
            ))}
          </div>
        ) : undefined,
    },
    {
      label: "Exhibition Text",
      value: exhibition.exhibitionText ? (
        <Link
          href={authorHref(exhibition.exhibitionText)}
          target="_blank"
          rel="noopener noreferrer"
          className="underline decoration-neutral-300 decoration-1 underline-offset-[3px] transition-opacity hover:opacity-55"
        >
          {exhibition.exhibitionText}
        </Link>
      ) : undefined,
    },
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
      <div className="archive-card-grid mt-8 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {displayRelated.map((relatedExhibition) => {
          const relatedTitle = displayExhibitionTitle(relatedExhibition.title);
          // Match homepage ExhibitionCard exactly: same cover-image fallback chain
          // and same deterministic per-slug aspect ratio.
          const relatedAspect = aspectClassForSlug(relatedExhibition.slug);
          const relatedCover =
            relatedExhibition.coverImage ?? relatedExhibition.previewImage;
          const content = (
            <>
              <div className={`relative ${relatedAspect} overflow-hidden bg-neutral-100`}>
                <Image
                  src={relatedCover}
                  alt={`${relatedTitle} exhibition view`}
                  fill
                  className="object-cover"
                  sizes="(min-width: 1024px) 21vw, (min-width: 640px) 28vw, 100vw"
                />
              </div>
              <p className="mt-4 text-[10px] uppercase tracking-[0.26em] text-neutral-500">
                {relatedExhibition.city} / {relatedExhibition.year}
              </p>
              <h3 className="mt-2 text-[1.05rem] font-medium leading-[1.18] tracking-[-0.02em]">
                {relatedTitle.toUpperCase()}
              </h3>
              {relatedExhibition.venue && (
                <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-[#888]">
                  {displayVenueText(relatedExhibition.venue)}
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
  const title = displayExhibitionTitle(exhibition.title);
  const eyebrowParts: React.ReactNode[] = [];
  if (exhibition.city) {
    eyebrowParts.push(
      <Link
        key="city"
        href={exhibitionFacetHref("city", exhibition.city)}
        target="_blank"
        rel="noopener noreferrer"
        className="transition-opacity hover:opacity-55"
      >
        {exhibition.city.toUpperCase()}
      </Link>,
    );
  }
  if (exhibition.country) {
    if (eyebrowParts.length > 0) eyebrowParts.push(", ");
    eyebrowParts.push(
      <Link
        key="country"
        href={exhibitionFacetHref("country", exhibition.country)}
        target="_blank"
        rel="noopener noreferrer"
        className="transition-opacity hover:opacity-55"
      >
        {exhibition.country.toUpperCase()}
      </Link>,
    );
  }
  if (exhibition.year) {
    if (eyebrowParts.length > 0) eyebrowParts.push(" / ");
    eyebrowParts.push(
      <Link
        key="year"
        href={exhibitionFacetHref("year", exhibition.year)}
        target="_blank"
        rel="noopener noreferrer"
        className="transition-opacity hover:opacity-55"
      >
        {exhibition.year}
      </Link>,
    );
  }

  // Subtitle line under the title: "Venue / Artist(s)" — built from the
  // venue field and the artists array (joined with "and" / commas).
  const venueText = displayMetadataText(exhibition.gallery ?? exhibition.venue);
  const artistsJoined = joinArtists(exhibition.artists);
  const venueLine = [venueText, artistsJoined].filter(Boolean).join(" / ");

  const photographer = displayPersonText(exhibition.photographer);
  const panelGallery = exhibition.images.filter(
    (image, index) => image.src !== exhibition.heroImage || index > 0,
  );

  return (
      <article className="min-w-0 bg-white px-5 pb-16 pt-16 text-neutral-900 md:px-10 md:pb-20 md:pt-12 lg:px-12 lg:pt-12">
        <header className="relative min-w-0 max-w-5xl border-b border-neutral-200 pb-8 md:pb-10 md:pr-[13rem]">
          <div className="mb-7 flex justify-end pr-12 md:absolute md:right-20 md:top-0 md:mb-0 md:pr-0">
            <SaveExhibitionButton slug={exhibition.slug} title={title} />
          </div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-500">
            {eyebrowParts}
          </p>
          <h1 className="mt-5 max-w-4xl break-words text-[clamp(1.75rem,9vw,3.5rem)] font-medium leading-[1.08] tracking-[-0.04em] md:text-[clamp(2rem,4vw,3.5rem)]">
            {title.toUpperCase()}
          </h1>
          {venueLine && (
            <p className="mt-4 text-[13px] leading-6 text-neutral-500">{venueLine}</p>
          )}
        </header>

        <section className="mt-8 grid min-w-0 items-start gap-10 md:mt-10 lg:grid-cols-[minmax(0,1fr)_14rem] lg:gap-10">
          <figure className="mx-auto w-full max-w-[38rem]">
            <Image
              src={exhibition.heroImage}
              alt={`${title} installation view`}
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
                  alt={`${title} installation view ${index + 2}`}
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
