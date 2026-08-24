// Normalization entrypoint. Deterministic extraction always produces a
// reviewable draft. Claude can enrich it when explicitly enabled, but is
// never a publishing dependency.

import { semanticTags } from "@/data/exhibitions";
import { ALLOWED_TAGS } from "./taxonomy";
import { normalizationMode } from "./mode";
import { normalizeDeterministically } from "./normalizeDeterministic";
import type { NormalizationResult } from "./normalizeResult";
import type { ScrapeResult } from "./types";

export type { NormalizationResult } from "./normalizeResult";

export async function normalizeScrape(scrape: ScrapeResult): Promise<NormalizationResult> {
  const deterministic = normalizeDeterministically(scrape);
  if (normalizationMode() !== "claude") return deterministic;

  try {
    // Lazy import keeps the Claude SDK out of the default ingestion path.
    const { normalizeWithClaude } = await import("./normalizeClaude");
    return await normalizeWithClaude(scrape);
  } catch (error) {
    console.warn("[ingest] Claude enrichment unavailable; using deterministic draft", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return {
      ...deterministic,
      warnings: [
        ...deterministic.warnings,
        "Claude enrichment was unavailable; review the deterministic draft before publishing.",
      ],
    };
  }
}

// Re-exported so external callers can inspect the taxonomy without
// pulling the raw semanticTags import path themselves.
export const ALLOWED_TAG_LIST: readonly string[] = Array.from(ALLOWED_TAGS).sort();
export { semanticTags };
