import Image from "next/image";
import Link from "next/link";
import { getExhibition, type Exhibition } from "@/data/exhibitions";
import {
  canonicalFacetValue,
  entityHref,
  exhibitionFacetHref,
  isIndexableEntityValue,
} from "@/lib/entitySlugs";
import { displayExhibitionTitle } from "@/lib/displayExhibitionTitle";
import { displayPersonText, displayMetadataText } from "@/lib/displayPersonName";
import type { ExhibitionEditorialSelection } from "@/data/editorialSelections";

const LINK_CLASS =
  "underline decoration-neutral-300 decoration-1 underline-offset-[3px] transition-opacity hover:opacity-60";

// First-paragraph excerpt truncated at ~maxWords on a word boundary.
// Used to spin an editorial paragraph from the exhibition's own
// description without copying it verbatim.
function editorialExcerpt(exhibition: Exhibition, maxWords = 110): string {
  const raw =
    (exhibition.summary && exhibition.summary.trim()) ||
    (exhibition.description ?? "").split(/\n\n+/)[0]?.trim() ||
    "";
  if (!raw) return "";
  const words = raw.split(/\s+/);
  if (words.length <= maxWords) return raw;
  const clipped = words.slice(0, maxWords).join(" ");
  return `${clipped.replace(/[,;:.!?—–\-\s]+$/, "")}…`;
}

function joinArtistLinks(exhibition: Exhibition) {
  const artists = (exhibition.artists ?? [])
    .filter((raw) => isIndexableEntityValue("artist", raw))
    .slice(0, 6);
  if (artists.length === 0) return null;
  const nodes = artists.map((artist) => (
    <Link key={artist} href={entityHref("artist", artist)} className={LINK_CLASS}>
      {displayPersonText(artist) ?? artist}
    </Link>
  ));
  return nodes.reduce<React.ReactNode[]>((acc, node, i) => {
    if (i > 0) acc.push(i === nodes.length - 1 ? " and " : ", ");
    acc.push(node);
    return acc;
  }, []);
}

// Small text-link index rendered under each exhibition section. Split
// into two visual rows: a quiet uppercase chip row of SEOUL →,
// SOUTH KOREA →, INSTALLATION →, ECOLOGY →, 2026 →; then a single
// more emphatic "More exhibitions in <city> →" CTA below.
function ContextualLinks({ exhibition }: { exhibition: Exhibition }) {
  const chips: React.ReactNode[] = [];
  const arrow = <span className="ml-0.5 text-neutral-400" aria-hidden="true">→</span>;

  if (exhibition.city) {
    const cityName = canonicalFacetValue("city", exhibition.city);
    chips.push(
      <Link key="city" href={exhibitionFacetHref("city", exhibition.city)} className={LINK_CLASS}>
        {cityName.toUpperCase()}{arrow}
      </Link>,
    );
  }
  if (exhibition.country) {
    const countryName = canonicalFacetValue("country", exhibition.country);
    chips.push(
      <Link key="country" href={exhibitionFacetHref("country", exhibition.country)} className={LINK_CLASS}>
        {countryName.toUpperCase()}{arrow}
      </Link>,
    );
  }
  const tags = (exhibition.tags ?? []).slice(0, 3);
  for (const tag of tags) {
    chips.push(
      <Link key={`t-${tag}`} href={entityHref("tag", tag)} className={LINK_CLASS}>
        {tag}{arrow}
      </Link>,
    );
  }
  if (exhibition.year) {
    chips.push(
      <Link key="year" href={exhibitionFacetHref("year", exhibition.year)} className={LINK_CLASS}>
        {exhibition.year}{arrow}
      </Link>,
    );
  }
  if (chips.length === 0 && !exhibition.city) return null;
  return (
    <div className="mt-6">
      <ul className="flex flex-wrap gap-x-5 gap-y-2 text-[11px] uppercase tracking-[0.18em] text-neutral-700">
        {chips.map((node, i) => (
          <li key={i}>{node}</li>
        ))}
      </ul>
      {exhibition.city && (
        <p className="mt-3 text-[13px] font-semibold uppercase tracking-[0.18em] text-neutral-900">
          <Link
            href={exhibitionFacetHref("city", exhibition.city)}
            className="transition-opacity hover:opacity-60"
          >
            More exhibitions in {canonicalFacetValue("city", exhibition.city)} →
          </Link>
        </p>
      )}
    </div>
  );
}

// Drop a trailing ", <city>" or ", <city>, <country>" suffix from a
// venue string when we already surface city + country in the Where row.
// The dataset occasionally carries these in the venue field (e.g.
// "Galerie Suzanne Tarasieve, Paris, France") — leaving them makes the
// row read as duplicated location text.
function stripLocationSuffix(
  venue: string | undefined,
  city: string | undefined,
  country: string | undefined,
): string | undefined {
  if (!venue) return venue;
  let cleaned = venue.trim();
  const parts = [country, city].filter((v): v is string => Boolean(v));
  for (const part of parts) {
    const re = new RegExp(`,\\s*${part.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\$&")}\\s*$`, "i");
    cleaned = cleaned.replace(re, "").trim();
  }
  return cleaned;
}

function ExhibitionSection({
  exhibition,
  index,
  editorialText,
}: {
  exhibition: Exhibition;
  index: number;
  editorialText?: string;
}) {
  const displayTitle = displayExhibitionTitle(exhibition.title);
  const cover = exhibition.coverImage ?? exhibition.previewImage;
  const flip = index % 2 === 1;
  const rawVenue = stripLocationSuffix(
    exhibition.gallery ?? exhibition.venue,
    exhibition.city,
    exhibition.country,
  );
  const venueLabel = displayMetadataText(rawVenue) ?? rawVenue;
  const cityLabel = exhibition.city
    ? canonicalFacetValue("city", exhibition.city)
    : undefined;
  const altParts = [venueLabel, cityLabel, exhibition.year]
    .filter(Boolean)
    .join(", ");
  const altText = altParts
    ? `${displayTitle} installation view at ${altParts}`
    : `${displayTitle} — installation view`;

  const text = (
    <div className="min-w-0">
      <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-500">
        {String(index + 1).padStart(2, "0")}
      </p>
      <h2 className="editorial-serif mt-3 break-words text-[clamp(1.15rem,2.4vw,1.6rem)] leading-[1.1] tracking-[-0.02em]">
        <Link href={`/exhibitions/${exhibition.slug}`} className="hover:opacity-70 transition-opacity">
          {displayTitle}
        </Link>
      </h2>

      <dl className="mt-5 space-y-2 text-[12.5px] leading-6 text-neutral-800">
        {(exhibition.artists?.length ?? 0) > 0 && (
          <div className="flex flex-wrap gap-x-3">
            <dt className="w-24 shrink-0 text-[10px] uppercase tracking-[0.22em] text-neutral-500">
              Artist
            </dt>
            <dd className="min-w-0 flex-1">{joinArtistLinks(exhibition)}</dd>
          </div>
        )}
        {rawVenue && (
          <div className="flex flex-wrap gap-x-3">
            <dt className="w-24 shrink-0 text-[10px] uppercase tracking-[0.22em] text-neutral-500">
              Venue
            </dt>
            <dd className="min-w-0 flex-1">
              <Link href={entityHref("gallery", rawVenue)} className={LINK_CLASS}>
                {venueLabel}
              </Link>
            </dd>
          </div>
        )}
        {(exhibition.city || exhibition.country || exhibition.year) && (
          <div className="flex flex-wrap gap-x-3">
            <dt className="w-24 shrink-0 text-[10px] uppercase tracking-[0.22em] text-neutral-500">
              Where
            </dt>
            <dd className="min-w-0 flex-1">
              {exhibition.city && (
                <Link href={exhibitionFacetHref("city", exhibition.city)} className={LINK_CLASS}>
                  {canonicalFacetValue("city", exhibition.city)}
                </Link>
              )}
              {exhibition.country && (
                <>
                  {exhibition.city ? ", " : ""}
                  <Link href={exhibitionFacetHref("country", exhibition.country)} className={LINK_CLASS}>
                    {canonicalFacetValue("country", exhibition.country)}
                  </Link>
                </>
              )}
              {exhibition.year && (
                <>
                  {" · "}
                  <Link href={exhibitionFacetHref("year", exhibition.year)} className={LINK_CLASS}>
                    {exhibition.year}
                  </Link>
                </>
              )}
            </dd>
          </div>
        )}
      </dl>

      <div className="mt-5 space-y-4 text-[14px] leading-[1.65] text-neutral-800">
        {(editorialText ?? editorialExcerpt(exhibition))
          .split(/\n\n+/)
          .map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
      </div>

      <ContextualLinks exhibition={exhibition} />
    </div>
  );

  const visual = (
    <Link href={`/exhibitions/${exhibition.slug}`} className="group block min-w-0">
      <div className="relative aspect-[4/5] w-full max-w-[300px] overflow-hidden bg-neutral-100 md:max-w-none">
        <Image
          src={cover}
          alt={altText}
          fill
          // First section image loads with priority for LCP; the rest
          // use the default lazy strategy. Either way Next renders a
          // real <img> with alt in SSR HTML, so text crawlers get the
          // image tag and caption regardless of loading strategy.
          {...(index === 0 ? { priority: true } : {})}
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
          sizes="(min-width: 1024px) 26vw, (min-width: 768px) 32vw, 60vw"
        />
      </div>
      <p className="mt-3 text-[10px] uppercase tracking-[0.24em] text-neutral-500">
        View exhibition →
      </p>
    </Link>
  );

  return (
    <section className="mt-16 grid grid-cols-1 items-start gap-8 border-t border-neutral-200 pt-10 md:mt-20 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] md:gap-12 md:pt-12">
      {flip ? (
        <>
          {visual}
          {text}
        </>
      ) : (
        <>
          {text}
          {visual}
        </>
      )}
    </section>
  );
}

function ExploreMore({ exhibitions }: { exhibitions: Exhibition[] }) {
  // Top city / country / year / topics drawn from the selection itself.
  const first = exhibitions[0];
  if (!first) return null;
  const items: React.ReactNode[] = [];
  if (first.city) {
    items.push(
      <Link key="city" href={exhibitionFacetHref("city", first.city)} className={LINK_CLASS}>
        More exhibitions in {canonicalFacetValue("city", first.city)}
      </Link>,
    );
  }
  if (first.country) {
    items.push(
      <Link
        key="country"
        href={exhibitionFacetHref("country", first.country)}
        className={LINK_CLASS}
      >
        Contemporary art in {canonicalFacetValue("country", first.country)}
      </Link>,
    );
  }
  if (first.year) {
    items.push(
      <Link key="year" href={exhibitionFacetHref("year", first.year)} className={LINK_CLASS}>
        {first.year} exhibitions
      </Link>,
    );
  }
  // Top 3 topics by frequency across the selection. Skip structural /
  // format tags ("GROUP SHOW") — they read as noise at the bottom of an
  // editorial article; save the slots for real thematic topics.
  const EXPLORE_TOPIC_DENYLIST = new Set(["GROUP SHOW"]);
  const topicCounts = new Map<string, number>();
  for (const ex of exhibitions) {
    for (const tag of ex.tags ?? []) {
      if (EXPLORE_TOPIC_DENYLIST.has(tag)) continue;
      topicCounts.set(tag, (topicCounts.get(tag) ?? 0) + 1);
    }
  }
  const topTopics = Array.from(topicCounts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 3);
  for (const [tag] of topTopics) {
    items.push(
      <Link key={`t-${tag}`} href={entityHref("tag", tag)} className={LINK_CLASS}>
        {tag}
      </Link>,
    );
  }
  if (items.length === 0) return null;
  return (
    <section className="mt-24 border-t border-neutral-200 pt-14">
      <p className="text-[10px] uppercase tracking-[0.28em] text-neutral-500">Explore more</p>
      <ul className="mt-6 flex flex-wrap gap-x-8 gap-y-3 text-[15px] leading-6 text-neutral-800 md:text-[16px]">
        {items.map((node, i) => (
          <li key={i}>{node}</li>
        ))}
      </ul>
    </section>
  );
}

export function EditorialSelectionArticle({
  selection,
}: {
  selection: ExhibitionEditorialSelection;
}) {
  const exhibitions = selection.exhibitionSlugs
    .map((slug) => getExhibition(slug))
    .filter((ex): ex is Exhibition => Boolean(ex));

  return (
    <article className="bg-white px-5 pb-24 pt-14 text-neutral-900 md:px-8 md:pb-32 md:pt-20 lg:px-12">
      <div className="mx-auto max-w-[860px]">
        {/* Header — centered, no hero image */}
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

        {exhibitions.map((exhibition, index) => (
          <ExhibitionSection
            key={exhibition.slug}
            exhibition={exhibition}
            index={index}
            editorialText={selection.perExhibitionText?.[exhibition.slug]}
          />
        ))}

        <ExploreMore exhibitions={exhibitions} />
      </div>
    </article>
  );
}
