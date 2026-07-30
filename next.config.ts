import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  images: {
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
};

export default nextConfig;
