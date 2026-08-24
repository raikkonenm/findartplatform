// Raw extractors collect page signals only. Claude is the single
// normalization layer that decides which signals are title, dates, artists,
// venue and other review-card fields.

export type NormalizationMode = "claude";

export function normalizationMode(): NormalizationMode {
  return "claude";
}
