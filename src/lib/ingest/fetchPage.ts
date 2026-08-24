// HTML fetcher + generic extractor. Runs the dedicated ArtViewer
// extractor first; falls back to a generic Open-Graph / JSON-LD /
// article-text extractor for every other host.

import * as cheerio from "cheerio";
import type { ScrapeResult, ScrapedImage } from "./types";
import { extractArtViewer } from "./extractors/artviewer";
import { extractGeneric } from "./extractors/generic";

const USER_AGENT =
  "Mozilla/5.0 (compatible; FindArtIngest/1.0; +https://www.findartplatform.com)";

export async function fetchPage(url: string): Promise<ScrapeResult> {
  // Basic URL guard — bail early on non-http(s).
  const parsed = new URL(url);
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error(`Unsupported protocol: ${parsed.protocol}`);
  }

  const response = await fetch(url, {
    headers: {
      "user-agent": USER_AGENT,
      accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "accept-language": "en-US,en;q=0.9",
    },
    redirect: "follow",
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`Fetch failed: HTTP ${response.status}`);
  }
  const html = await response.text();
  const $ = cheerio.load(html);
  const host = parsed.hostname.replace(/^www\./, "");

  if (host === "artviewer.org") {
    return extractArtViewer({ url, html, $ });
  }
  return extractGeneric({ url, html, $ });
}

// Utility: absolute URL resolver used by every extractor.
export function absoluteUrl(base: string, ref: string | undefined | null): string | undefined {
  if (!ref) return undefined;
  try {
    return new URL(ref, base).toString();
  } catch {
    return undefined;
  }
}

// Utility: drop image candidates that are clearly logos/avatars/nav.
// Applied by every extractor before passing candidates on.
export function filterImageCandidates(candidates: ScrapedImage[]): ScrapedImage[] {
  const seen = new Set<string>();
  const out: ScrapedImage[] = [];
  for (const image of candidates) {
    if (!image.url) continue;
    if (seen.has(image.url)) continue;
    if (!/^https?:\/\//i.test(image.url)) continue;
    const lower = image.url.toLowerCase();
    if (
      lower.includes("/logo") ||
      lower.includes("/favicon") ||
      lower.includes("/avatar") ||
      lower.includes("/gravatar") ||
      lower.endsWith(".svg") ||
      lower.includes("/wp-includes/") ||
      lower.includes("/wp-content/plugins/") ||
      lower.includes("/emoji/") ||
      /\bnav(igation)?\b/.test(lower)
    ) {
      continue;
    }
    // Filter obvious tiny thumbnails by dimension hint.
    if ((image.width && image.width < 300) || (image.height && image.height < 300)) continue;
    seen.add(image.url);
    out.push(image);
  }
  return out;
}
