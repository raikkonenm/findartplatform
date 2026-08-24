// Shared result shape used by both normalization backends. Kept in
// its own file so normalize.ts, normalizeClaude.ts and
// normalizeDeterministic.ts can import it without cycles.

import type { NormalizedExhibition } from "./types";

export type NormalizationResult = {
  normalized: NormalizedExhibition;
  confidence?: number;
  warnings: string[];
  missingFields: string[];
};
