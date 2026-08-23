import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  images: {
    // Route through Vercel's image optimizer. Sources are already q80
    // WebP averaging ~46 KB after the shrink pass, so per-variant
    // transformation cost is minimal. Serving smaller variants per
    // breakpoint is what actually drives LCP down on mobile — the
    // masonry cards render at ~200–400 px CSS width and used to pull
    // the full-size webp because unoptimized: true was set.
    unoptimized: false,
    // Cache transformed images at Vercel edge for one year — image
    // URLs are content-addressed by (source, width, quality), so a
    // long TTL never serves stale content and eliminates the cold-
    // transform latency (~1.4s TTFB) we were seeing on every visit.
    minimumCacheTTL: 31536000,
    // Stay on Next.js's default format ("image/webp"). AVIF at
    // quality=75 was over-compressing card covers into visibly
    // softer/mushier previews on the feed — the ~30–50% size
    // savings weren't worth the quality regression.
    // Trim the default deviceSizes down to the widths this design
    // actually consumes (feed cards at 100vw / 47vw / 31vw across
    // mobile, tablet, desktop). Fewer variants = fewer edge cache
    // entries and faster first transform per unique width.
    deviceSizes: [640, 750, 828, 1080, 1200],
    // Trim default imageSizes too — feed cards never render below
    // ~240 px CSS width even on the smallest phones, so anything
    // below 128 is dead weight in the srcSet. Two entries keep
    // low-DPR retina renders covered without bloating the HTML.
    imageSizes: [128, 256],
  },
  // Force the apex domain to permanent-redirect (308) to www so
  // Google consolidates ranking signals and stops flagging apex
  // URLs as duplicates. Vercel's default apex→www hop is 307
  // (temporary), which keeps Google treating both hosts as live.
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "findartplatform.com" }],
        destination: "https://www.findartplatform.com/:path*",
        permanent: true,
      },
      // Legacy singular entity routes → new plural canonical routes.
      // Google already indexed some `/artist/…`, `/gallery/…` etc. URLs
      // before the taxonomy standardization; permanent (308) redirects
      // consolidate ranking signals onto the new URLs and prevent 404s
      // for external links. destination is a same-host path (Next.js
      // preserves host/query), so no redirect chains.
      { source: "/artist/:slug", destination: "/artists/:slug", permanent: true },
      { source: "/curator/:slug", destination: "/curators/:slug", permanent: true },
      { source: "/photographer/:slug", destination: "/photographers/:slug", permanent: true },
      { source: "/gallery/:slug", destination: "/venues/:slug", permanent: true },
    ];
  },
  // Long-term immutable Cache-Control on every static image + video
  // under public/. Vercel's default is max-age=0 must-revalidate, so
  // every browser reload conditionally re-validates all 589 <img>
  // referenced in the SSR HTML — that's what pushed LCP to 25s on
  // repeat visits. Content is addressed by path; if we ever need to
  // change a file we version its filename, we don't invalidate cache.
  async headers() {
    const immutable = [
      { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
    ];
    return [
      { source: "/:path*.webp", headers: immutable },
      { source: "/:path*.jpg", headers: immutable },
      { source: "/:path*.jpeg", headers: immutable },
      { source: "/:path*.png", headers: immutable },
      { source: "/:path*.mp4", headers: immutable },
      { source: "/:path*.svg", headers: immutable },
      { source: "/:path*.woff2", headers: immutable },
    ];
  },
};

export default nextConfig;
