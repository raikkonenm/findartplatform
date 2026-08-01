import type { MetadataRoute } from "next";
import { exhibitions } from "@/data/exhibitions";

// Canonical origin. The apex (findartplatform.com) 307-redirects to
// www, so www is what we advertise to crawlers.
const SITE_URL = "https://www.findartplatform.com";

// Route handlers under /api/ and the intercepting @modal route are
// deliberately omitted — the former is not a page, the latter is not
// a standalone URL. `lastmod`, `changefreq`, and `priority` are also
// omitted because we do not track a real per-page modification date;
// a single-<loc> sitemap is fully valid.
export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/` },
    { url: `${SITE_URL}/exhibitions` },
    { url: `${SITE_URL}/about` },
    { url: `${SITE_URL}/submit` },
  ];

  const exhibitionPages: MetadataRoute.Sitemap = exhibitions.map(
    (exhibition) => ({
      url: `${SITE_URL}/exhibitions/${exhibition.slug}`,
    }),
  );

  return [...staticPages, ...exhibitionPages];
}
