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
    // Prefer AVIF where the client accepts it (better compression
    // than WebP); WebP is the fallback. Both are broadly supported.
    formats: ["image/avif", "image/webp"],
    // Trim the default deviceSizes down to the widths this design
    // actually consumes (feed cards at 100vw / 47vw / 31vw across
    // mobile, tablet, desktop). Fewer variants = fewer edge cache
    // entries and faster first transform per unique width.
    deviceSizes: [640, 750, 828, 1080, 1200],
  },
};

export default nextConfig;
