// Shared types for the AI ingest pipeline. Kept in one place so the
// scraper, normalizer, drafts store, publisher and Telegram bot all
// agree on the shape they pass around.

import type { SemanticTag } from "@/data/exhibitions";

export type DraftState =
  | "pending_review"
  | "awaiting_publish_confirmation"
  | "rejected"
  | "publishing"
  | "published"
  | "failed";

// A draft starts without a public destination. The Telegram reviewer must
// choose one before publishing so a single artwork never lands in the
// exhibitions archive by accident.
export type DraftContentType = "exhibition" | "art-object";
export type DraftEditableField = "title" | "description";

// The normalized exhibition payload — subset of the Exhibition type
// that the ingest pipeline can safely fill from a page. Unknown fields
// are left `undefined`; the seed generator drops undefined keys.
export type NormalizedExhibition = {
  slug: string;
  title: string;
  subtitle?: string;
  venue?: string;
  gallery?: string;
  city?: string;
  country?: string;
  year?: string;
  dates?: string;
  startDate?: string;
  endDate?: string;
  artists?: string[];
  curator?: string;
  photographer?: string;
  exhibitionText?: string;
  description: string;
  summary?: string;
  tags: SemanticTag[];
  source?: string;
  sourceUrl: string;
};

// One image in a draft. Original URL is preserved so a maintainer can
// trace where each asset came from. `filename` is the final basename
// under public/exhibitions/<slug>/ once the draft is published.
export type DraftImage = {
  originalUrl: string;
  blobUrl: string;      // private Vercel Blob URL for the compressed WebP
  filename: string;     // e.g. "1.webp"
  width: number;
  height: number;
  bytes: number;
  selected: boolean;    // false = filtered out (logo/avatar/nav/etc.)
  cover: boolean;       // true for exactly one image in the selected set
};

export type Draft = {
  id: string;                     // uuid
  state: DraftState;
  sourceUrl: string;
  source?: string;                // human host label ("artviewer.org")
  createdAt: string;              // ISO
  updatedAt: string;              // ISO
  normalized: NormalizedExhibition;
  images: DraftImage[];
  warnings: string[];
  missingFields: string[];
  confidence?: number;            // 0..1 rough Claude self-report
  contentType?: DraftContentType;
  // Keeps the extracted exhibition title while an ART OBJECT draft displays
  // the artist name as its public card title. Switching back is lossless.
  sourceTitle?: string;
  editingField?: DraftEditableField;
  telegramChatId?: number;
  telegramMessageId?: number;
  telegramPreviewKind?: "photo" | "text";
  telegramCoverMessageId?: number;
  publishedCommitSha?: string;
  publishedAt?: string;
  failureReason?: string;
};

// What the scraper emits before Claude sees it.
export type ScrapeResult = {
  sourceUrl: string;
  source: string;              // e.g. "artviewer.org"
  extractor: "artviewer" | "generic" | "saliva" | "telegram";
  title?: string;
  rawText: string;             // page's main textual content
  structuredHints: Record<string, unknown>;  // JSON-LD / OG / __NEXT_DATA__ blobs
  imageCandidates: ScrapedImage[];
};

export type ScrapedImage = {
  url: string;
  // Telegram uploads are downloaded server-side before they reach the shared
  // image pipeline. `originalUrl` is deliberately token-free and is what the
  // draft keeps for traceability after publish.
  originalUrl?: string;
  data?: Buffer;
  width?: number;
  height?: number;
  alt?: string;
  reason?: string;             // why the extractor kept this candidate
};
