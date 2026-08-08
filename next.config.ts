import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  images: {
    // Serve every source image straight from public/ instead of
    // routing through /_next/image. Vercel Hobby's monthly image-
    // optimization quota is exhausted; as previously-cached
    // transformations age out of edge cache, uncached sizes start
    // returning HTTP 402 and old exhibitions' covers break. Every
    // exhibition source is already q=80/1600 WebP averaging
    // ~50-100 KB, so shipping it as-is is the reliable path.
    // The `minimumCacheTTL`, `deviceSizes`, `imageSizes`, and any
    // per-exhibition `unoptimized: true` flags below become inert
    // under this global switch — kept in place so we can flip back
    // to optimized delivery in one line once quota is available.
    unoptimized: true,
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
    ];
  },
};

export default nextConfig;
