// Normalization router. Picks the backend based on
// INGEST_NORMALIZATION_MODE (default: deterministic) and delegates.
// Both backends return the same NormalizationResult shape, so the
// webhook, drafts store and publisher don't care which ran.

import { semanticTags } from "@/data/exhibitions";
import { ALLOWED_TAGS } from "./taxonomy";
import { normalizationMode } from "./mode";
import { normalizeDeterministically } from "./normalizeDeterministic";
import type { NormalizationResult } from "./normalizeResult";
import type { ScrapeResult } from "./types";

export type { NormalizationResult } from "./normalizeResult";

export async function normalizeScrape(scrape: ScrapeResult): Promise<NormalizationResult> {
  const mode = normalizationMode();
  if (mode === "deterministic") {
    return normalizeDeterministically(scrape);
  }
  // Lazy import so the Claude SDK (and its ANTHROPIC_API_KEY read) is
  // never loaded in deterministic mode. This keeps a plain deploy
  // green even if the env var is absent.
  const { normalizeWithClaude } = await import("./normalizeClaude");
  return normalizeWithClaude(scrape);
}

// Re-exported so external callers can inspect the taxonomy without
// pulling the raw semanticTags import path themselves.
export const ALLOWED_TAG_LIST: readonly string[] = Array.from(ALLOWED_TAGS).sort();
export { semanticTags };
