import type { MetadataRoute } from "next";
import { exhibitions } from "@/data/exhibitions";
import { editorialArtists } from "@/data/editorial";
import {
  ENTITY_ROUTE_SEGMENT,
  collectAuthorSlugs,
  collectEntitySlugs,
  collectExhibitionFacetSlugs,
  collectExhibitionMonthSlugs,
  collectTagSlugs,
  slugifyEntity,
} from "@/lib/entitySlugs";
import { collectOpportunityLocationSlugs } from "@/lib/opportunityLocations";

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
    { url: `${SITE_URL}/about` },
    { url: `${SITE_URL}/submit` },
  ];

  const exhibitionPages: MetadataRoute.Sitemap = exhibitions.map(
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
  const monthPages = Array.from(collectExhibitionMonthSlugs().keys()).map(
    (slug) => ({ url: `${SITE_URL}/exhibitions/${slug}` }),
  );

  // Opportunities.
  const oppLocationPages = Array.from(collectOpportunityLocationSlugs().keys()).map(
    (slug) => ({ url: `${SITE_URL}/opportunities/location/${slug}` }),
  );

  // Exhibition-text authors.
  const authorPages = Array.from(collectAuthorSlugs().keys()).map((slug) => ({
    url: `${SITE_URL}/author/${slug}`,
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
    ...oppLocationPages,
    ...authorPages,
  ];
}
