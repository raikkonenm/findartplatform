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

export class ManualReviewRequiredError extends Error {
  constructor(url: string, reason: string) {
    super(`Manual review required for ${url}: ${reason}`);
    this.name = "ManualReviewRequiredError";
  }
}

function isCloudflareChallenge(response: Response): boolean {
  return (
    response.headers.get("cf-mitigated") === "challenge" ||
    response.headers.get("server")?.toLowerCase().includes("cloudflare") === true
  );
}

function fetchError(url: string, response: Response): Error {
  if (response.status !== 403) {
    return new Error(`Fetch failed: HTTP ${response.status}`);
  }

  if (isCloudflareChallenge(response)) {
    return new Error(
      `Fetch blocked by a Cloudflare browser challenge (HTTP 403) for ${new URL(url).hostname}. ` +
        "This source requires JavaScript/browser verification and cannot be fetched by the server-side ingest worker.",
    );
  }

  return new Error(`Fetch blocked by source: HTTP 403 (${new URL(url).hostname})`);
}

function stripHtml(value: string): string {
  return cheerio.load(value).text().replace(/\s+/g, " ").trim();
}

function fallbackIsSufficient(result: ScrapeResult): boolean {
  return Boolean(result.title && result.rawText.length >= 80 && result.imageCandidates.length > 0);
}

function sourcePath(url: string): string {
  const pathname = new URL(url).pathname.replace(/\/+$/, "");
  return pathname || "/";
}

function linkMatchesSource(candidate: string | undefined, sourceUrl: string): boolean {
  if (!candidate) return false;
  try {
    return new URL(candidate, sourceUrl).pathname.replace(/\/+$/, "") === sourcePath(sourceUrl);
  } catch {
    return false;
  }
}

function makeMetadataResult(args: {
  sourceUrl: string;
  title?: string;
  description?: string;
  imageUrls: string[];
  metadata: Record<string, unknown>;
}): ScrapeResult | undefined {
  const title = args.title?.trim();
  const rawText = args.description?.trim() ?? "";
  const imageCandidates = filterImageCandidates(
    args.imageUrls
      .map((imageUrl) => absoluteUrl(args.sourceUrl, imageUrl))
      .filter((imageUrl): imageUrl is string => Boolean(imageUrl))
      .map((url) => ({ url, reason: "metadata fallback" })),
  );

  if (!title) return undefined;
  return {
    sourceUrl: args.sourceUrl,
    source: new URL(args.sourceUrl).hostname.replace(/^www\./, ""),
    extractor: "generic",
    title,
    rawText,
    structuredHints: args.metadata,
    imageCandidates,
  };
}

async function fetchWordPressMetadata(sourceUrl: string): Promise<ScrapeResult | undefined> {
  const source = new URL(sourceUrl);
  const slug = sourcePath(sourceUrl).split("/").filter(Boolean).pop();
  if (!slug) return undefined;

  for (const resource of ["posts", "pages"]) {
    const endpoint = new URL(`/wp-json/wp/v2/${resource}`, source.origin);
    endpoint.searchParams.set("slug", slug);
    endpoint.searchParams.set("_fields", "link,title,content,excerpt,featured_media");

    try {
      const response = await fetch(endpoint, {
        headers: { ...BROWSER_HEADERS, accept: "application/json, */*;q=0.8" },
        cache: "no-store",
        signal: AbortSignal.timeout(8_000),
      });
      if (!response.ok) continue;
      const entries = (await response.json()) as Array<{
        link?: string;
        title?: { rendered?: string };
        content?: { rendered?: string };
        excerpt?: { rendered?: string };
      }>;
      const entry = entries.find((candidate) => linkMatchesSource(candidate.link, sourceUrl));
      if (!entry) continue;

      const content = entry.content?.rendered ?? entry.excerpt?.rendered ?? "";
      const $ = cheerio.load(content);
      const result = makeMetadataResult({
        sourceUrl,
        title: stripHtml(entry.title?.rendered ?? ""),
        description: $.text().replace(/\s+/g, " ").trim(),
        imageUrls: $("img")
          .map((_, image) => $(image).attr("src"))
          .get()
          .filter((image): image is string => Boolean(image)),
        metadata: {
          wordpress: { resource, link: entry.link },
          og: { title: stripHtml(entry.title?.rendered ?? "") },
        },
      });
      if (result && fallbackIsSufficient(result)) return result;
    } catch {
      // A blocked or unavailable metadata endpoint is non-fatal. RSS is the
      // next safe, public fallback and manual review remains the final state.
    }
  }

  return undefined;
}

async function fetchRssMetadata(sourceUrl: string): Promise<ScrapeResult | undefined> {
  const source = new URL(sourceUrl);
  const endpoints = ["/feed/", "/rss.xml", "/feed.xml"];

  for (const path of endpoints) {
    try {
      const response = await fetch(new URL(path, source.origin), {
        headers: { ...BROWSER_HEADERS, accept: "application/rss+xml, application/atom+xml, application/xml, text/xml;q=0.9, */*;q=0.8" },
        cache: "no-store",
        signal: AbortSignal.timeout(8_000),
      });
      if (!response.ok) continue;

      const xml = await response.text();
      const $ = cheerio.load(xml, { xmlMode: true });
      const item = $("item, entry")
        .filter((_, candidate) => {
          const link = $(candidate).find("link").first().attr("href") || $(candidate).find("link").first().text();
          const guid = $(candidate).find("guid").first().text();
          return linkMatchesSource(link, sourceUrl) || linkMatchesSource(guid, sourceUrl);
        })
        .first();
      if (!item.length) continue;

      const content =
        item.find("content\\:encoded").first().text() ||
        item.find("content").first().text() ||
        item.find("description").first().text();
      const contentHtml = cheerio.load(content);
      const imageUrls = [
        item.find("media\\:content, media\\:thumbnail").first().attr("url"),
        item.find("enclosure[type^=image]").first().attr("url"),
        ...contentHtml("img")
          .map((_, image) => contentHtml(image).attr("src"))
          .get(),
      ].filter((image): image is string => Boolean(image));
      const result = makeMetadataResult({
        sourceUrl,
        title: item.find("title").first().text(),
        description: contentHtml.text().replace(/\s+/g, " ").trim(),
        imageUrls,
        metadata: { rss: { endpoint: new URL(path, source.origin).toString() } },
      });
      if (result && fallbackIsSufficient(result)) return result;
    } catch {
      // Keep trying the remaining public feeds. Do not use browser automation.
    }
  }

  return undefined;
}

async function fetchBlockedPageMetadata(sourceUrl: string): Promise<ScrapeResult | undefined> {
  return (await fetchWordPressMetadata(sourceUrl)) ?? (await fetchRssMetadata(sourceUrl));
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
    if (response.status === 403 && isCloudflareChallenge(response)) {
      // Some WAFs still return the source document's head (and therefore OG,
      // Twitter or JSON-LD metadata) alongside a challenge body. Parse that
      // response before trying public site-level metadata endpoints.
      const blockedHtml = await response.text();
      const inlineMetadata = extractGeneric({
        url,
        html: blockedHtml,
        $: cheerio.load(blockedHtml),
      });
      if (fallbackIsSufficient(inlineMetadata)) return inlineMetadata;

      const fallback = await fetchBlockedPageMetadata(url);
      if (fallback) return fallback;
      throw new ManualReviewRequiredError(
        url,
        "the source requires Cloudflare browser verification and did not expose sufficient public metadata or RSS content",
      );
    }
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
