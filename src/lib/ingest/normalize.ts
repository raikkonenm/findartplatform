// Normalization entrypoint. Raw extractors collect source signals; Claude
// turns those signals into a reviewable exhibition draft.

import { semanticTags } from "@/data/exhibitions";
import { ALLOWED_TAGS } from "./taxonomy";
import type { NormalizationResult } from "./normalizeResult";
import type { ScrapeResult } from "./types";

export type { NormalizationResult } from "./normalizeResult";

export async function normalizeScrape(scrape: ScrapeResult): Promise<NormalizationResult> {
  // Lazy import so the Claude SDK (and its ANTHROPIC_API_KEY read) is only
  // loaded by the ingest route, not by unrelated page renders.
  const { normalizeWithClaude } = await import("./normalizeClaude");
  return normalizeWithClaude(scrape);
}

// Re-exported so external callers can inspect the taxonomy without
// pulling the raw semanticTags import path themselves.
export const ALLOWED_TAG_LIST: readonly string[] = Array.from(ALLOWED_TAGS).sort();
export { semanticTags };
