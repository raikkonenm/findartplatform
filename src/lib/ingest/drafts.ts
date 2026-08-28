// Draft storage backed by Vercel Blob.
//
// All draft data — JSON metadata and downloaded WebP images — lives in
// the ingest bot's private Blob store. Server reads use the Blob token;
// Telegram previews receive a short-lived signed URL rather than a raw
// private object URL.
//
// Layout:
//   drafts/<uuid>.json                — Draft metadata
//   drafts/<uuid>/images/<index>.webp — compressed WebP originals
//
// The publisher promotes selected images from Blob to git under
// public/exhibitions/<slug>/ on publish.

import { del, get, issueSignedToken, list, presignUrl, put } from "@vercel/blob";
import { blobReadWriteToken } from "./env";
import type { Draft } from "./types";

function token(): { token: string } {
  return { token: blobReadWriteToken() };
}

function metadataKey(id: string): string {
  return `drafts/${id}.json`;
}

function pathnameFromBlobUrl(blobUrl: string): string {
  return new URL(blobUrl).pathname.replace(/^\//, "");
}

export async function saveDraft(draft: Draft): Promise<Draft> {
  const next: Draft = { ...draft, updatedAt: new Date().toISOString() };
  await put(metadataKey(draft.id), JSON.stringify(next, null, 2), {
    access: "private",
    addRandomSuffix: false,   // deterministic key so we can update in place
    contentType: "application/json",
    allowOverwrite: true,
    ...token(),
  });
  return next;
}

export async function getDraft(id: string): Promise<Draft | undefined> {
  // Blob doesn't expose a direct fetch-by-key without listing; resolve the
  // Blob first, then read it with server-side private access.
  const key = metadataKey(id);
  const entries = await list({ prefix: key, ...token() });
  const match = entries.blobs.find((b) => b.pathname === key);
  if (!match) return undefined;
  const result = await get(match.url, {
    access: "private",
    useCache: false,
    ...token(),
  });
  if (!result || result.statusCode !== 200 || !result.stream) return undefined;
  return JSON.parse(await new Response(result.stream).text()) as Draft;
}

// The next plain-text message after an EDIT button belongs to the most
// recently updated pending draft for that chat. Draft metadata is private,
// so this lookup remains server-side and does not expose Blob URLs.
export async function getDraftAwaitingEdit(chatId: number): Promise<Draft | undefined> {
  const entries = await list({ prefix: "drafts/", ...token() });
  const metadata = entries.blobs.filter((entry) => /^drafts\/[^/]+\.json$/.test(entry.pathname));
  const drafts = await Promise.all(
    metadata.map(async (entry) => {
      const result = await get(entry.url, {
        access: "private",
        useCache: false,
        ...token(),
      });
      if (!result || result.statusCode !== 200 || !result.stream) return undefined;
      return JSON.parse(await new Response(result.stream).text()) as Draft;
    }),
  );

  return drafts
    .filter((draft): draft is Draft => Boolean(draft))
    .filter(
      (draft) =>
        draft.telegramChatId === chatId &&
        draft.state === "pending_review" &&
        draft.editingField !== undefined,
    )
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
}

export async function uploadDraftImage(
  draftId: string,
  filename: string,
  data: Buffer,
): Promise<{ url: string; size: number }> {
  const result = await put(`drafts/${draftId}/images/${filename}`, data, {
    access: "private",
    addRandomSuffix: false,
    contentType: "image/webp",
    allowOverwrite: true,
    ...token(),
  });
  return { url: result.url, size: data.byteLength };
}

export async function readPrivateDraftBlob(blobUrl: string): Promise<Buffer> {
  const result = await get(blobUrl, {
    access: "private",
    useCache: false,
    ...token(),
  });
  if (!result || result.statusCode !== 200 || !result.stream) {
    throw new Error("Private draft asset is unavailable");
  }
  return Buffer.from(await new Response(result.stream).arrayBuffer());
}

export async function draftPreviewUrl(blobUrl: string): Promise<string> {
  const pathname = pathnameFromBlobUrl(blobUrl);
  const validUntil = Date.now() + 15 * 60 * 1000;
  const signedToken = await issueSignedToken({
    pathname,
    operations: ["get"],
    validUntil,
    ...token(),
  });
  const { presignedUrl } = await presignUrl(signedToken, {
    access: "private",
    operation: "get",
    pathname,
    validUntil,
  });
  return presignedUrl;
}

// Called by REJECT and by successful PUBLISH to clean up. Best-effort;
// a failure here should never block the calling flow.
export async function deleteDraftAssets(draftId: string): Promise<void> {
  try {
    const entries = await list({ prefix: `drafts/${draftId}/`, ...token() });
    if (entries.blobs.length > 0) {
      await del(entries.blobs.map((b) => b.url), token());
    }
  } catch {
    // Swallow — the draft metadata remains, showing final state.
  }
}
