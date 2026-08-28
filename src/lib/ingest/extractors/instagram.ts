// Instagram serves a login page to many server-side requests. Its Open Graph
// image is the Instagram glyph, not the post, so never hand that fallback to
// the media pipeline. The public embed page occasionally exposes the actual
// post CDN assets without authentication.

import type { CheerioAPI } from "cheerio";
import { absoluteUrl, filterImageCandidates } from "../fetchPage";
import type { ScrapeResult, ScrapedImage } from "../types";

const POST_PATH = /^\/(?:p|reel|tv)\/([^/?#]+)\/?$/i;

export function isInstagramPostUrl(url: URL): boolean {
  const host = url.hostname.replace(/^www\./, "").toLowerCase();
  return host === "instagram.com" && POST_PATH.test(url.pathname);
}

export function instagramEmbedUrl(url: URL): string {
  const [, shortcode] = url.pathname.match(POST_PATH) ?? [];
  const kind = url.pathname.split("/").filter(Boolean)[0] ?? "p";
  return `https://www.instagram.com/${kind}/${shortcode}/embed/captioned/`;
}

function isBrandOrLoginImage(url: string): boolean {
  const value = url.toLowerCase();
  return (
    value.includes("instagram-gradient") ||
    value.includes("instagram-logo") ||
    value.includes("instagram-glyph") ||
    value.includes("/static/images/ico/") ||
    value.includes("/rsrc.php/") ||
    value.includes("favicon")
  );
}

function normaliseEscapedUrl(value: string): string {
  return value
    .replace(/\\u0026/gi, "&")
    .replaceAll("\\/", "/")
    .replace(/&amp;/gi, "&");
}

function isInstagramMediaUrl(url: string): boolean {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    return (hostname.includes("scontent") || hostname.includes("cdninstagram") || hostname.includes("fbcdn")) &&
      !isBrandOrLoginImage(url);
  } catch {
    return false;
  }
}

function isLoginWall($: CheerioAPI): boolean {
  const text = $("body").text().replace(/\s+/g, " ").toLowerCase();
  return (
    text.includes("log into instagram") ||
    text.includes("log in to instagram") ||
    text.includes("see everyday moments from your close friends") ||
    text.includes("forgot password?")
  );
}

export function extractInstagram({
  url,
  html,
  $,
}: {
  url: string;
  html: string;
  $: CheerioAPI;
}): ScrapeResult {
  const candidates: ScrapedImage[] = [];
  const seen = new Set<string>();
  const add = (value: string | undefined, reason: string) => {
    const absolute = absoluteUrl(url, value);
    if (!absolute || seen.has(absolute) || !isInstagramMediaUrl(absolute)) return;
    seen.add(absolute);
    candidates.push({ url: absolute, reason });
  };

  // The embed's OG/Twitter image is the preferred cover whenever it is an
  // actual post asset. Login-wall values are explicitly rejected above.
  add($("meta[property='og:image']").attr("content"), "Instagram post metadata");
  add($("meta[name='twitter:image']").attr("content"), "Instagram post metadata");

  // Instagram serializes carousel images into script payloads. Normalise JSON
  // escaping first, then pull only CDN image URLs in source order.
  const serialisedHtml = normaliseEscapedUrl(html);
  for (const match of serialisedHtml.matchAll(/https?:\/\/[^\s"'<>]+/g)) {
    add(normaliseEscapedUrl(match[0]), "Instagram post media");
  }

  const description =
    $("meta[property='og:description']").attr("content") ||
    $("meta[name='description']").attr("content") ||
    "";
  const loginWall = isLoginWall($);

  return {
    sourceUrl: url,
    source: "instagram.com",
    extractor: "generic",
    // Do not use the generic page title — it is normally just "Instagram".
    rawText: loginWall ? "" : description.trim(),
    structuredHints: {
      instagram: {
        permalink: url,
        loginWall,
        mediaAvailable: candidates.length > 0,
      },
    },
    imageCandidates: filterImageCandidates(candidates),
  };
}
