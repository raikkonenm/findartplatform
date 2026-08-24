// Download → EXIF-rotate → resize (max 1600px) → WebP q80 → upload to
// private Vercel Blob. Mirrors the on-disk `compress-new-cards.js`
// pipeline exactly so ingested images match the archive's existing
// visual quality and compression ratio.

import sharp from "sharp";
import { uploadDraftImage } from "./drafts";
import type { DraftImage, ScrapedImage } from "./types";

const USER_AGENT =
  "Mozilla/5.0 (compatible; FindArtIngest/1.0; +https://www.findartplatform.com)";
const MAX_DIMENSION = 1600;
const WEBP_QUALITY = 80;
const MAX_IMAGES = 20;
const MIN_DIMENSION = 400;  // filter tiny thumbnails found only after fetch

// Fetch one image as a Buffer. Rejects if the server responds with
// non-2xx or with a content-type that isn't image/*.
async function downloadImage(url: string): Promise<Buffer> {
  const response = await fetch(url, {
    headers: { "user-agent": USER_AGENT, accept: "image/*,*/*;q=0.8" },
    redirect: "follow",
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.startsWith("image/")) throw new Error(`Not an image (${contentType})`);
  if (contentType.includes("svg")) throw new Error("SVG is not a publishable raster image");
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function processToWebp(input: Buffer): Promise<{ data: Buffer; width: number; height: number }> {
  const pipeline = sharp(input, { failOn: "none" })
    .rotate()
    .resize({
      width: MAX_DIMENSION,
      height: MAX_DIMENSION,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: WEBP_QUALITY });
  const { data, info } = await pipeline.toBuffer({ resolveWithObject: true });
  return { data, width: info.width, height: info.height };
}

// Deduplicate by content hash (first 8 KB is enough to catch identical
// remote assets served under multiple URLs).
function contentKey(buffer: Buffer): string {
  const slice = buffer.subarray(0, 8192);
  let hash = 2166136261;
  for (let i = 0; i < slice.length; i++) {
    hash ^= slice[i];
    hash = Math.imul(hash, 16777619);
  }
  return hash.toString(16);
}

export type DownloadImagesResult = {
  images: DraftImage[];
  warnings: string[];
};

// Downloads, compresses and uploads up to MAX_IMAGES candidates for a
// given draft. Preserves candidate order — extractors put the strongest
// image first. The first successful download becomes the cover.
export async function downloadImages(
  draftId: string,
  candidates: ScrapedImage[],
): Promise<DownloadImagesResult> {
  const images: DraftImage[] = [];
  const warnings: string[] = [];
  const seenKeys = new Set<string>();
  const seenUrls = new Set<string>();

  let picked = 0;
  for (const candidate of candidates) {
    if (picked >= MAX_IMAGES) break;
    if (seenUrls.has(candidate.url)) continue;
    seenUrls.add(candidate.url);

    const originalUrl = candidate.originalUrl ?? candidate.url;
    let raw: Buffer;
    try {
      raw = candidate.data ?? (await downloadImage(candidate.url));
    } catch (error) {
      warnings.push(`Skipped ${originalUrl}: ${(error as Error).message}`);
      continue;
    }
    const key = contentKey(raw);
    if (seenKeys.has(key)) continue;
    seenKeys.add(key);

    let processed: { data: Buffer; width: number; height: number };
    try {
      processed = await processToWebp(raw);
    } catch (error) {
      warnings.push(`Skipped ${originalUrl}: ${(error as Error).message}`);
      continue;
    }

    // Reject tiny images that only revealed their real size post-decode.
    if (processed.width < MIN_DIMENSION || processed.height < MIN_DIMENSION) {
      warnings.push(`Skipped ${originalUrl}: below ${MIN_DIMENSION}px minimum`);
      continue;
    }

    picked += 1;
    const filename = `${picked}.webp`;
    const uploaded = await uploadDraftImage(draftId, filename, processed.data);
    images.push({
      originalUrl,
      blobUrl: uploaded.url,
      filename,
      width: processed.width,
      height: processed.height,
      bytes: uploaded.size,
      selected: true,
      cover: picked === 1,
    });
  }

  if (images.length === 0) {
    warnings.push("No images could be downloaded — verify the source page.");
  }

  return { images, warnings };
}
