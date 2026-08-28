import type { MetadataRoute } from "next";
import { exhibitions } from "@/data/exhibitions";
import { editorialArtists } from "@/data/editorial";
import { editorialSelections } from "@/data/editorialSelections";
import { OPPORTUNITIES } from "@/data/opportunities";
import {
  ENTITY_ROUTE_SEGMENT,
  collectAuthorSlugs,
  collectEntitySlugs,
  collectExhibitionFacetSlugs,
  collectExhibitionMonthBuckets,
  collectTagSlugs,
  slugifyEntity,
} from "@/lib/entitySlugs";
import {
  allOpportunityTaxonomyEntries,
  opportunityUrl,
} from "@/lib/opportunityTaxonomy";

// Canonical origin. The apex (findartplatform.com) 308-redirects to
// www, so www is what we advertise to crawlers.
const SITE_URL = "https://www.findartplatform.com";

// Route handlers under /api/ and the intercepting @modal route are
// deliberately omitted — the former is not a page, the latter is not
// a standalone URL. Deprecated singular entity routes (/artist, /gallery,
// etc.) are also omitted; they exist only as permanent redirects and
// must not appear in the sitemap.
export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/` },
    { url: `${SITE_URL}/exhibitions` },
    { url: `${SITE_URL}/opportunities` },
    { url: `${SITE_URL}/about` },
    { url: `${SITE_URL}/submit` },
  ];

  // `instagram-post` is the persisted shape for homepage-only art objects.
  // They intentionally have no canonical exhibition URL.
  const exhibitionPages: MetadataRoute.Sitemap = exhibitions
    .filter((exhibition) => exhibition.dateSource !== "instagram-post")
    .map(
      (exhibition) => ({ url: `${SITE_URL}/exhibitions/${exhibition.slug}` }),
    );

  // Entity taxonomy pages — plural canonical routes only.
  const galleryPages = Array.from(collectEntitySlugs("gallery").keys()).map(
    (slug) => ({ url: `${SITE_URL}/${ENTITY_ROUTE_SEGMENT.gallery}/${slug}` }),
  );
  const curatorPages = Array.from(collectEntitySlugs("curator").keys()).map(
    (slug) => ({ url: `${SITE_URL}/${ENTITY_ROUTE_SEGMENT.curator}/${slug}` }),
  );
  const photographerPages = Array.from(collectEntitySlugs("photographer").keys()).map(
    (slug) => ({ url: `${SITE_URL}/${ENTITY_ROUTE_SEGMENT.photographer}/${slug}` }),
  );

  const artistSlugSet = new Set(collectEntitySlugs("artist").keys());
  for (const artist of editorialArtists) {
    const slug = slugifyEntity(artist.artistName);
    if (slug) artistSlugSet.add(slug);
  }
  const artistPages = Array.from(artistSlugSet).map((slug) => ({
    url: `${SITE_URL}/${ENTITY_ROUTE_SEGMENT.artist}/${slug}`,
  }));

  const tagPages = Array.from(collectTagSlugs().keys()).map((slug) => ({
    url: `${SITE_URL}/${ENTITY_ROUTE_SEGMENT.tag}/${slug}`,
  }));

  // Editorial features (long-form artist pages).
  const featurePages = editorialArtists.map((artist) => ({
    url: `${SITE_URL}/features/${artist.slug}`,
  }));

  // Exhibition facet archives.
  const cityPages = Array.from(collectExhibitionFacetSlugs("city").keys()).map(
    (slug) => ({ url: `${SITE_URL}/exhibitions/city/${slug}` }),
  );
  const countryPages = Array.from(collectExhibitionFacetSlugs("country").keys()).map(
    (slug) => ({ url: `${SITE_URL}/exhibitions/country/${slug}` }),
  );
  const yearPages = Array.from(collectExhibitionFacetSlugs("year").keys()).map(
    (slug) => ({ url: `${SITE_URL}/exhibitions/year/${slug}` }),
  );
  const monthPages = Array.from(collectExhibitionMonthBuckets().keys()).map(
    (slug) => ({ url: `${SITE_URL}/exhibitions/years/${slug}` }),
  );

  // Opportunity detail pages and standalone canonical taxonomies. Legacy
  // /opportunities/location/* URLs redirect and are intentionally omitted.
  const opportunityPages = OPPORTUNITIES.map((opportunity) => ({
    url: `${SITE_URL}${opportunityUrl(opportunity)}`,
  }));
  const opportunityTaxonomyPages = allOpportunityTaxonomyEntries().map((entry) => ({
    url: `${SITE_URL}${entry.path}`,
  }));

  // Exhibition-text authors.
  const authorPages = Array.from(collectAuthorSlugs().keys()).map((slug) => ({
    url: `${SITE_URL}/author/${slug}`,
  }));

  // Editorial selections — /editorial + each /editorial/[slug].
  const editorialIndex: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/editorial` },
  ];
  const editorialSelectionPages = editorialSelections.map((selection) => ({
    url: `${SITE_URL}/editorial/${selection.slug}`,
  }));

  return [
    ...staticPages,
    ...exhibitionPages,
    ...galleryPages,
    ...artistPages,
    ...curatorPages,
    ...photographerPages,
    ...tagPages,
    ...featurePages,
    ...cityPages,
    ...countryPages,
    ...yearPages,
    ...monthPages,
    ...opportunityPages,
    ...opportunityTaxonomyPages,
    ...authorPages,
    ...editorialIndex,
    ...editorialSelectionPages,
  ];
}
