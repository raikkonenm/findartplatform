// Selects the normalization backend at runtime.
//
//   deterministic  — no LLM. Facts pulled directly from OG / JSON-LD /
//                    scraped text. Missing fields stay missing.
//   claude         — the existing Anthropic-powered normalizer.
//
// Default is deterministic so the ingest pipeline is deployable and
// testable without any Anthropic billing / quota. Flip the env var to
// enable Claude on a per-environment basis.

export type NormalizationMode = "deterministic" | "claude";

export function normalizationMode(): NormalizationMode {
  const raw = process.env.INGEST_NORMALIZATION_MODE?.trim().toLowerCase();
  return raw === "claude" ? "claude" : "deterministic";
}
