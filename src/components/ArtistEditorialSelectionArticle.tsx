import Image from "next/image";
import Link from "next/link";
import { getEditorialArtist, getEditorialArtistMeta } from "@/data/editorial";
import { getExhibition, type Exhibition } from "@/data/exhibitions";
import type { ArtistEditorialSelection } from "@/data/editorialSelections";
import {
  canonicalFacetValue,
  entityHref,
  exhibitionFacetHref,
} from "@/lib/entitySlugs";
import { displayExhibitionTitle } from "@/lib/displayExhibitionTitle";
import { displayMetadataText } from "@/lib/displayPersonName";

const LINK_CLASS =
  "underline decoration-neutral-300 decoration-1 underline-offset-[3px] transition-opacity hover:opacity-60";

type ArtistSelectionEntry = ArtistEditorialSelection["selectedArtists"][number];

function ArtistContextualLinks({
  artist,
  exhibition,
}: {
  artist: ArtistSelectionEntry;
  exhibition?: Exhibition;
}) {
  const chips: React.ReactNode[] = [];
  const arrow = <span className="ml-0.5 text-neutral-400" aria-hidden="true">→</span>;

  if (artist.editorialArtistSlug) {
    chips.push(
      <Link
        key="artist"
        href={entityHref("artist", artist.artistName)}
        className={LINK_CLASS}
      >
        ARTIST{arrow}
      </Link>,
    );
  }
  if (exhibition?.city) {
    chips.push(
      <Link key="city" href={exhibitionFacetHref("city", exhibition.city)} className={LINK_CLASS}>
        {canonicalFacetValue("city", exhibition.city).toUpperCase()}{arrow}
      </Link>,
    );
  }
  if (exhibition?.country) {
    chips.push(
      <Link
        key="country"
        href={exhibitionFacetHref("country", exhibition.country)}
        className={LINK_CLASS}
      >
        {canonicalFacetValue("country", exhibition.country).toUpperCase()}{arrow}
      </Link>,
    );
  }
  for (const tag of (exhibition?.tags ?? getEditorialArtistMeta(artist.editorialArtistSlug ?? "").tags).slice(0, 3)) {
    chips.push(
      <Link key={tag} href={entityHref("tag", tag)} className={LINK_CLASS}>
        {tag}{arrow}
      </Link>,
    );
  }
  if (exhibition?.year) {
    chips.push(
      <Link key="year" href={exhibitionFacetHref("year", exhibition.year)} className={LINK_CLASS}>
        {exhibition.year}{arrow}
      </Link>,
    );
  }

  if (chips.length === 0) return null;
  return (
    <div className="mt-6">
      <ul className="flex flex-wrap gap-x-5 gap-y-2 text-[11px] uppercase tracking-[0.18em] text-neutral-700">
        {chips.map((node, index) => <li key={index}>{node}</li>)}
      </ul>
    </div>
  );
}

function ArtistSection({
  artist,
  index,
  editorialText,
}: {
  artist: ArtistSelectionEntry;
  index: number;
  editorialText: string;
}) {
  const editorialArtist = artist.editorialArtistSlug
    ? getEditorialArtist(artist.editorialArtistSlug)
    : undefined;
  const exhibition = artist.featuredExhibitionSlug
    ? getExhibition(artist.featuredExhibitionSlug)
    : undefined;
  const image = editorialArtist?.coverImage.src ?? exhibition?.coverImage ?? exhibition?.previewImage;
  const descriptor = editorialArtist
    ? [getEditorialArtistMeta(editorialArtist.slug).medium, ...getEditorialArtistMeta(editorialArtist.slug).tags.slice(0, 2)].join(" · ")
    : (exhibition?.tags ?? []).slice(0, 3).join(" · ");
  const flip = index % 2 === 1;
  const venue = displayMetadataText(exhibition?.gallery ?? exhibition?.venue) ?? exhibition?.gallery ?? exhibition?.venue;
  const location = [
    exhibition?.city ? canonicalFacetValue("city", exhibition.city) : undefined,
    exhibition?.country ? canonicalFacetValue("country", exhibition.country) : undefined,
  ].filter(Boolean).join(", ");

  const text = (
    <div className="min-w-0">
      <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-500">
        {String(index + 1).padStart(2, "0")}
      </p>
      <h2 className="editorial-serif mt-3 break-words text-[clamp(1.35rem,3vw,2rem)] leading-[1.08] tracking-[-0.02em]">
        <Link href={entityHref("artist", artist.artistName)} className="transition-opacity hover:opacity-60">
          {artist.artistName}
        </Link>
      </h2>
      {descriptor && (
        <p className="mt-3 text-[10px] uppercase tracking-[0.22em] text-neutral-500">
          {descriptor}
        </p>
      )}

      <p className="mt-6 text-[14px] leading-[1.65] text-neutral-800">{editorialText}</p>

      {exhibition ? (
        <div className="mt-7 border-l border-neutral-200 pl-4 text-[13px] leading-[1.55] text-neutral-700">
          <p className="text-[10px] uppercase tracking-[0.22em] text-neutral-500">Featured in</p>
          <Link href={`/exhibitions/${exhibition.slug}`} className={`mt-2 inline-block ${LINK_CLASS}`}>
            {displayExhibitionTitle(exhibition.title)} →
          </Link>
          <p className="mt-1">
            {venue && <Link href={entityHref("gallery", venue)} className={LINK_CLASS}>{venue}</Link>}
            {venue && (location || exhibition.year) ? " · " : null}
            {location && exhibition.city && exhibition.country ? (
              <>
                <Link href={exhibitionFacetHref("city", exhibition.city)} className={LINK_CLASS}>
                  {canonicalFacetValue("city", exhibition.city)}
                </Link>
                {", "}
                <Link href={exhibitionFacetHref("country", exhibition.country)} className={LINK_CLASS}>
                  {canonicalFacetValue("country", exhibition.country)}
                </Link>
              </>
            ) : location}
            {location && exhibition.year ? " · " : null}
            {exhibition.year && <Link href={exhibitionFacetHref("year", exhibition.year)} className={LINK_CLASS}>{exhibition.year}</Link>}
          </p>
        </div>
      ) : null}

      {editorialArtist && (
        <p className="mt-5 text-[13px] font-semibold uppercase tracking-[0.18em] text-neutral-900">
          <Link href={`/features/${editorialArtist.slug}`} className="transition-opacity hover:opacity-60">
            Featured in FindArt Features →
          </Link>
        </p>
      )}

      <ArtistContextualLinks artist={artist} exhibition={exhibition} />
      <p className="mt-5 text-[13px] font-semibold uppercase tracking-[0.18em] text-neutral-900">
        <Link href={entityHref("artist", artist.artistName)} className="transition-opacity hover:opacity-60">
          View artist →
        </Link>
      </p>
    </div>
  );

  const visual = image ? (
    <Link
      href={exhibition ? `/exhibitions/${exhibition.slug}` : `/features/${editorialArtist?.slug}`}
      className="group block min-w-0"
    >
      <div className="relative aspect-[4/5] w-full max-w-[300px] overflow-hidden bg-neutral-100 md:max-w-none">
        <Image
          src={image}
          alt={exhibition
            ? `Work by ${artist.artistName} from ${displayExhibitionTitle(exhibition.title)}, ${exhibition.year ?? ""}`
            : `Work by ${artist.artistName}`}
          fill
          {...(index === 0 ? { priority: true } : {})}
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
          sizes="(min-width: 1024px) 26vw, (min-width: 768px) 32vw, 60vw"
        />
      </div>
      <p className="mt-3 text-[10px] uppercase tracking-[0.24em] text-neutral-500">
        {exhibition ? "View exhibition" : "View feature"} →
      </p>
    </Link>
  ) : null;

  return (
    <section className="mt-16 grid grid-cols-1 items-start gap-8 border-t border-neutral-200 pt-10 md:mt-20 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] md:gap-12 md:pt-12">
      {flip ? <>{visual}{text}</> : <>{text}{visual}</>}
    </section>
  );
}

function ExploreMore() {
  const items = [
    { label: "FindArt Features", href: "/features" },
    { label: "2026 exhibitions", href: exhibitionFacetHref("year", "2026") },
    { label: "Body", href: entityHref("tag", "BODY") },
    { label: "Materiality", href: entityHref("tag", "MATERIALITY") },
    { label: "Installation", href: entityHref("tag", "INSTALLATION") },
    { label: "Technology", href: entityHref("tag", "TECHNOLOGY") },
  ];

  return (
    <section className="mt-24 border-t border-neutral-200 pt-14">
      <p className="text-[10px] uppercase tracking-[0.28em] text-neutral-500">Explore more</p>
      <ul className="mt-6 flex flex-wrap gap-x-8 gap-y-3 text-[15px] leading-6 text-neutral-800 md:text-[16px]">
        {items.map((item) => (
          <li key={item.href}>
            <Link href={item.href} className={LINK_CLASS}>{item.label}</Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function ArtistEditorialSelectionArticle({
  selection,
}: {
  selection: ArtistEditorialSelection;
}) {
  return (
    <article className="bg-white px-5 pb-24 pt-14 text-neutral-900 md:px-8 md:pb-32 md:pt-20 lg:px-12">
      <div className="mx-auto max-w-[860px]">
        <header className="text-left">
          <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-500">
            Editorial · {selection.publishedAtDisplay}
          </p>
          <h1 className="editorial-serif mt-4 break-words text-[clamp(1.6rem,4vw,2.6rem)] leading-[1.08] tracking-[-0.02em]">
            {selection.title}
          </h1>
          <p className="mt-4 text-[15px] leading-[1.55] text-neutral-700 md:text-[16px]">
            {selection.subtitle}
          </p>
          <p className="mt-8 text-[14.5px] leading-[1.75] text-neutral-800 md:text-[15.5px]">
            {selection.intro}
          </p>
        </header>

        {selection.selectedArtists.map((artist, index) => (
          <ArtistSection
            key={artist.artistName}
            artist={artist}
            index={index}
            editorialText={selection.perArtistText[artist.artistName]}
          />
        ))}

        <ExploreMore />
      </div>
    </article>
  );
}
