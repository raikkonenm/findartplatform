// Custom loader for `next/image` that selects a pre-generated -640 or
// -1080 width variant when one exists on disk, otherwise falls back
// to the original src. See `scripts/generate-image-variants.js` for
// how the manifest + variants are produced.
//
// We route around Vercel's /_next/image optimizer entirely — its
// quota is exhausted — but still want responsive srcsets. The loader
// returns a plain static asset path, so Next composes srcset entries
// out of the deviceSizes list by calling us once per size.

import manifest from "./imageVariants.manifest.json";

type ManifestWidths = Readonly<Record<string, readonly number[]>>;
const VARIANT_MANIFEST = manifest as ManifestWidths;

const WEBP_SOURCE_PATTERN = /\.webp$/i;

export interface CustomLoaderProps {
  src: string;
  width: number;
  quality?: number;
}

/**
 * Pick the smallest manifest-listed variant whose width is >= the
 * requested width. If none is wide enough we fall through to the
 * original (which is served at full resolution).
 */
function pickVariantWidth(available: readonly number[], requestedWidth: number): number | null {
  if (!available || available.length === 0) return null;
  for (const w of available) {
    if (w >= requestedWidth) return w;
  }
  return null;
}

/**
 * Rewrite `/exhibitions/foo/1.webp` → `/exhibitions/foo/1-640.webp`.
 * Assumes the input already matches WEBP_SOURCE_PATTERN; caller
 * guards.
 */
function withSuffix(src: string, width: number): string {
  return src.replace(WEBP_SOURCE_PATTERN, `-${width}.webp`);
}

export default function imageLoader({ src, width }: CustomLoaderProps): string {
  // Only our own absolute-rooted assets have variants. Anything else
  // (external URL, protocol-relative, data URI) returns unchanged.
  if (!src.startsWith("/")) return src;

  // Variants only exist for WebP sources — the generator is WebP-only
  // on purpose. jpg/png paths pass through as-is.
  if (!WEBP_SOURCE_PATTERN.test(src)) return src;

  // Hand-built posters and anything already pointing at a variant
  // (/foo-640.webp) must be served as-is: never recurse into variants.
  if (/-(?:640|1080)\.webp$/i.test(src)) return src;
  if (/\.poster\.webp$/i.test(src)) return src;

  const available = VARIANT_MANIFEST[src];
  if (!available) return src;

  const chosen = pickVariantWidth(available, width);
  if (chosen === null) return src;

  return withSuffix(src, chosen);
}
