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
import type { EditorialSelection } from "@/data/editorialSelections";

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
      {artist}
    </Link>
  ));
  return nodes.reduce<React.ReactNode[]>((acc, node, i) => {
    if (i > 0) acc.push(i === nodes.length - 1 ? " and " : ", ");
    acc.push(node);
    return acc;
  }, []);
}

// Small text-link index rendered under each exhibition section — 4–6
// contextual crawlable links to existing taxonomy pages, filtered to
// the metadata the exhibition actually has.
function ContextualLinks({ exhibition }: { exhibition: Exhibition }) {
  const items: React.ReactNode[] = [];
  if (exhibition.city) {
    items.push(
      <Link
        key="city"
        href={exhibitionFacetHref("city", exhibition.city)}
        className={LINK_CLASS}
      >
        More exhibitions in {canonicalFacetValue("city", exhibition.city)}
      </Link>,
    );
  }
  if (exhibition.country) {
    items.push(
      <Link
        key="country"
        href={exhibitionFacetHref("country", exhibition.country)}
        className={LINK_CLASS}
      >
        {canonicalFacetValue("country", exhibition.country)}
      </Link>,
    );
  }
  const tags = (exhibition.tags ?? []).slice(0, 3);
  for (const tag of tags) {
    items.push(
      <Link key={`t-${tag}`} href={entityHref("tag", tag)} className={LINK_CLASS}>
        {tag}
      </Link>,
    );
  }
  if (exhibition.year) {
    items.push(
      <Link
        key="year"
        href={exhibitionFacetHref("year", exhibition.year)}
        className={LINK_CLASS}
      >
        {exhibition.year}
      </Link>,
    );
  }
  if (items.length === 0) return null;
  return (
    <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-[12px] uppercase tracking-[0.16em] text-neutral-700">
      {items.map((node, i) => (
        <li key={i}>{node}</li>
      ))}
    </ul>
  );
}

function ExhibitionSection({
  exhibition,
  index,
}: {
  exhibition: Exhibition;
  index: number;
}) {
  const displayTitle = displayExhibitionTitle(exhibition.title);
  const cover = exhibition.coverImage ?? exhibition.previewImage;
  const flip = index % 2 === 1;
  const rawVenue = exhibition.gallery ?? exhibition.venue;

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
                {rawVenue}
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

      <p className="mt-5 text-[14px] leading-[1.65] text-neutral-800">
        {editorialExcerpt(exhibition)}
      </p>

      <ContextualLinks exhibition={exhibition} />
    </div>
  );

  const visual = (
    <Link href={`/exhibitions/${exhibition.slug}`} className="group block min-w-0">
      <div className="relative aspect-[4/5] w-full max-w-[300px] overflow-hidden bg-neutral-100 md:max-w-none">
        <Image
          src={cover}
          alt={`${displayTitle} — installation view`}
          fill
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
  // Top 3 topics by frequency across the selection.
  const topicCounts = new Map<string, number>();
  for (const ex of exhibitions) {
    for (const tag of ex.tags ?? []) {
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
  selection: EditorialSelection;
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
          />
        ))}

        <ExploreMore exhibitions={exhibitions} />
      </div>
    </article>
  );
}
