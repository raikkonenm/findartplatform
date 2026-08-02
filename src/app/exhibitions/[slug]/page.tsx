import type { Metadata } from "next";
import { notFound } from "next/navigation";
import HomePageClient from "../../HomePageClient";
import { SlideOver } from "@/components/SlideOver";
import { ExhibitionDetail } from "@/components/ExhibitionDetail";
import {
  exhibitions,
  getExhibition,
  type Exhibition,
} from "@/data/exhibitions";
import { displayExhibitionTitle } from "@/lib/displayExhibitionTitle";

const SITE_URL = "https://www.findartplatform.com";

type DetailPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return exhibitions.map((exhibition) => ({ slug: exhibition.slug }));
}

/**
 * Compose an SEO `<title>` in the form:
 *   "{Title} — {Artists}, {Gallery}, {City} {Year}"
 * Falls back to just the title when the auxiliary fields are missing.
 */
function buildSeoTitle(ex: Exhibition): string {
  const title = displayExhibitionTitle(ex.title);
  const artists = ex.artists?.length ? ex.artists.join(", ") : "";
  const gallery = ex.gallery ?? ex.venue ?? "";
  const contextParts = [artists, gallery, ex.city]
    .filter((value): value is string => Boolean(value && value.trim()))
    .join(", ");
  const yearSuffix = ex.year ? ` ${ex.year}` : "";
  return contextParts
    ? `${title} — ${contextParts}${yearSuffix}`
    : `${title}${yearSuffix}`;
}

/**
 * Return a Google-friendly meta description: single-line, cleaned of
 * extra whitespace, and clipped to ~155 characters on a word boundary
 * with an ellipsis. Falls back to a metadata line when there is no
 * description text.
 */
function buildSeoDescription(ex: Exhibition): string {
  const raw = ex.description?.trim() ?? "";
  if (raw) {
    const oneLine = raw.replace(/\s+/g, " ").trim();
    if (oneLine.length <= 155) return oneLine;
    const truncated = oneLine.slice(0, 155);
    const lastSpace = truncated.lastIndexOf(" ");
    const cut =
      lastSpace > 100 ? truncated.slice(0, lastSpace) : truncated;
    return `${cut.replace(/[,;:.!?—–\-\s]+$/, "")}…`;
  }
  const parts = [
    ex.artists?.join(", "),
    ex.gallery ?? ex.venue,
    ex.city,
    ex.dates,
  ].filter((value): value is string => Boolean(value && value.trim()));
  return parts.join(" · ");
}

/**
 * Parse a human-readable date such as "31 May 2026" into an ISO date
 * (YYYY-MM-DD). Anchors to noon UTC so that server timezone never
 * shifts the calendar day off by one. Returns undefined if the string
 * cannot be parsed so the JSON-LD is emitted without an invalid field
 * rather than with a wrong one.
 */
function toIsoDate(humanDate: string | undefined): string | undefined {
  if (!humanDate) return undefined;
  const timestamp = Date.parse(`${humanDate} 12:00:00 UTC`);
  if (Number.isNaN(timestamp)) return undefined;
  return new Date(timestamp).toISOString().slice(0, 10);
}

function absoluteImageUrl(pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return `${SITE_URL}${pathOrUrl}`;
}

export async function generateMetadata({
  params,
}: DetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const exhibition = getExhibition(slug);
  if (!exhibition) {
    return { title: "Exhibition" };
  }

  const title = buildSeoTitle(exhibition);
  const description = buildSeoDescription(exhibition);
  const canonical = `${SITE_URL}/exhibitions/${exhibition.slug}`;
  const image = exhibition.coverImage ?? exhibition.previewImage;
  const displayTitle = displayExhibitionTitle(exhibition.title);

  return {
    title: { absolute: title },
    description,
    alternates: { canonical },
    openGraph: {
      type: "article",
      url: canonical,
      title,
      description,
      images: image
        ? [{ url: image, alt: `${displayTitle} — installation view` }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

/**
 * schema.org/ExhibitionEvent JSON-LD payload. Kept in the SSR HTML as
 * an inert `<script type="application/ld+json">` — invisible to
 * viewers, structured data for Google.
 */
function buildJsonLd(exhibition: Exhibition): Record<string, unknown> {
  const canonical = `${SITE_URL}/exhibitions/${exhibition.slug}`;
  const displayTitle = displayExhibitionTitle(exhibition.title);
  const startDate = toIsoDate(exhibition.startDate);
  const endDate = toIsoDate(exhibition.endDate);
  const galleryName = exhibition.gallery ?? exhibition.venue;
  const image = exhibition.coverImage ?? exhibition.previewImage;

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "ExhibitionEvent",
    name: displayTitle,
    description: buildSeoDescription(exhibition),
    url: canonical,
  };
  if (startDate) jsonLd.startDate = startDate;
  if (endDate) jsonLd.endDate = endDate;
  if (image) jsonLd.image = absoluteImageUrl(image);
  if (galleryName) {
    const address: Record<string, string> = { "@type": "PostalAddress" };
    if (exhibition.city) address.addressLocality = exhibition.city;
    if (exhibition.country) address.addressCountry = exhibition.country;
    jsonLd.location = {
      "@type": "Place",
      name: galleryName,
      ...(Object.keys(address).length > 1 ? { address } : {}),
    };
  }
  if (exhibition.artists?.length) {
    jsonLd.performer = exhibition.artists.map((name) => ({
      "@type": "Person",
      name,
    }));
  }
  return jsonLd;
}

export default async function ExhibitionDetailPage({
  params,
}: DetailPageProps) {
  const { slug } = await params;
  const exhibition = getExhibition(slug);

  if (!exhibition) {
    notFound();
  }

  const jsonLd = buildJsonLd(exhibition);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomePageClient initialIsMobile={false} />
      <SlideOver
        label={displayExhibitionTitle(exhibition.title)}
        closeHref="/"
        contentKey={exhibition.slug}
      >
        <ExhibitionDetail exhibition={exhibition} />
      </SlideOver>
    </>
  );
}
