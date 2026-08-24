// Draft storage backed by Vercel Blob.
//
// All draft data — JSON metadata and downloaded WebP images — lives in
// the ingest bot's private Blob store. `access: "public"` is what the
// Vercel Blob SDK exposes; the bucket itself is scoped by
// BLOB_READ_WRITE_TOKEN, and Blob URLs are unguessable UUID paths.
// We still use `random-suffix` names to prevent enumeration and never
// share Blob URLs with anyone except the operator's own Telegram chat.
//
// Layout:
//   drafts/<uuid>.json                — Draft metadata
//   drafts/<uuid>/images/<index>.webp — compressed WebP originals
//
// The publisher promotes selected images from Blob to git under
// public/exhibitions/<slug>/ on publish.

import { del, list, put } from "@vercel/blob";
import { blobReadWriteToken } from "./env";
import type { Draft } from "./types";

function token(): { token: string } {
  return { token: blobReadWriteToken() };
}

function metadataKey(id: string): string {
  return `drafts/${id}.json`;
}

export async function saveDraft(draft: Draft): Promise<Draft> {
  const next: Draft = { ...draft, updatedAt: new Date().toISOString() };
  await put(metadataKey(draft.id), JSON.stringify(next, null, 2), {
    access: "public",
    addRandomSuffix: false,   // deterministic key so we can update in place
    contentType: "application/json",
    allowOverwrite: true,
    ...token(),
  });
  return next;
}

export async function getDraft(id: string): Promise<Draft | undefined> {
  // Blob doesn't expose a direct fetch-by-key without listing; we look
  // it up via list() then fetch the resolved URL over HTTPS.
  const key = metadataKey(id);
  const entries = await list({ prefix: key, ...token() });
  const match = entries.blobs.find((b) => b.pathname === key);
  if (!match) return undefined;
  const response = await fetch(match.url, { cache: "no-store" });
  if (!response.ok) return undefined;
  return (await response.json()) as Draft;
}

export async function uploadDraftImage(
  draftId: string,
  filename: string,
  data: Buffer,
): Promise<{ url: string; size: number }> {
  const result = await put(`drafts/${draftId}/images/${filename}`, data, {
    access: "public",
    addRandomSuffix: false,
    contentType: "image/webp",
    allowOverwrite: true,
    ...token(),
  });
  return { url: result.url, size: data.byteLength };
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
