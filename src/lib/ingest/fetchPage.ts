// HTML fetcher + generic extractor. Runs the dedicated ArtViewer
// extractor first; falls back to a generic Open-Graph / JSON-LD /
// article-text extractor for every other host.

import * as cheerio from "cheerio";
import type { ScrapeResult, ScrapedImage } from "./types";
import { extractArtViewer } from "./extractors/artviewer";
import { extractGeneric } from "./extractors/generic";

// Use the same request shape as a normal desktop document navigation. Several
// publishers reject obvious bot user agents before serving their public HTML.
const BROWSER_HEADERS = {
  "user-agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
  accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
  "accept-language": "en-US,en;q=0.9",
  "accept-encoding": "gzip, deflate, br",
  "cache-control": "no-cache",
  "upgrade-insecure-requests": "1",
  "sec-ch-ua": '"Google Chrome";v="139", "Chromium";v="139", "Not=A?Brand";v="24"',
  "sec-ch-ua-mobile": "?0",
  "sec-ch-ua-platform": '"Windows"',
  "sec-fetch-dest": "document",
  "sec-fetch-mode": "navigate",
  "sec-fetch-site": "none",
};

function fetchError(url: string, response: Response): Error {
  if (response.status !== 403) {
    return new Error(`Fetch failed: HTTP ${response.status}`);
  }

  const isCloudflareChallenge =
    response.headers.get("cf-mitigated") === "challenge" ||
    response.headers.get("server")?.toLowerCase().includes("cloudflare");

  if (isCloudflareChallenge) {
    return new Error(
      `Fetch blocked by a Cloudflare browser challenge (HTTP 403) for ${new URL(url).hostname}. ` +
        "This source requires JavaScript/browser verification and cannot be fetched by the server-side ingest worker.",
    );
  }

  return new Error(`Fetch blocked by source: HTTP 403 (${new URL(url).hostname})`);
}

export async function fetchPage(url: string): Promise<ScrapeResult> {
  // Basic URL guard — bail early on non-http(s).
  const parsed = new URL(url);
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error(`Unsupported protocol: ${parsed.protocol}`);
  }

  const response = await fetch(url, {
    headers: BROWSER_HEADERS,
    redirect: "follow",
    cache: "no-store",
  });
  if (!response.ok) {
    throw fetchError(url, response);
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
    const alt = image.alt?.toLowerCase() ?? "";
    const imageLabel = `${lower} ${alt}`;
    if (
      /(?:^|[\/_\-.])(logo|favicon|icon|avatar|profile|author|header|footer|menu|navigation)(?:[\/_\-.]|$)/.test(imageLabel) ||
      lower.endsWith(".svg") ||
      lower.includes("/wp-includes/") ||
      lower.includes("/wp-content/plugins/") ||
      lower.includes("/emoji/") ||
      /\bnav(igation)?\b/.test(imageLabel)
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
