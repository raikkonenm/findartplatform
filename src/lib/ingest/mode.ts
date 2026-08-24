// Deterministic normalization is the ingest default. Claude is opt-in
// enrichment only, so a missing key or exhausted account can never block
// drafting from Telegram text, images, or a source URL.

export type NormalizationMode = "deterministic" | "claude";

export function normalizationMode(): NormalizationMode {
  return process.env.INGEST_ENABLE_CLAUDE === "true" && Boolean(process.env.ANTHROPIC_API_KEY)
    ? "claude"
    : "deterministic";
}
