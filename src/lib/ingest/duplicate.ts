// Duplicate detection against the shipped exhibitions dataset.
//
//   HARD block:  matching slug, or matching sourceUrl.
//   SOFT warn:   fuzzy title + venue overlap (title similarity ≥ 0.85
//                and the same venue name after simple normalization).
//
// The soft path never blocks a publish — it surfaces a warning that
// the operator sees in the Telegram preview.

import { exhibitions } from "@/data/exhibitions";
import { slugifyEntity } from "./taxonomy";
import type { NormalizedExhibition } from "./types";

export type DuplicateReport = {
  hardConflict?: { reason: "slug" | "sourceUrl"; existingSlug: string };
  softMatches: Array<{ existingSlug: string; existingTitle: string; similarity: number }>;
};

function normalizeToken(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

// Jaccard similarity over word bigrams — cheap, good enough for
// spotting near-duplicates like "TANGERINE REVERIE" vs "Tangerine
// Reverie (Bangdo)".
function bigrams(value: string): Set<string> {
  const tokens = normalizeToken(value).split(/\s+/).filter(Boolean);
  const out = new Set<string>();
  for (let i = 0; i < tokens.length - 1; i++) out.add(`${tokens[i]} ${tokens[i + 1]}`);
  if (tokens.length === 1) out.add(tokens[0]);
  return out;
}

function similarity(a: string, b: string): number {
  const A = bigrams(a);
  const B = bigrams(b);
  if (A.size === 0 || B.size === 0) return 0;
  let inter = 0;
  for (const g of A) if (B.has(g)) inter += 1;
  const union = A.size + B.size - inter;
  return union === 0 ? 0 : inter / union;
}

export function detectDuplicate(input: NormalizedExhibition): DuplicateReport {
  const report: DuplicateReport = { softMatches: [] };

  const candidateSlug = slugifyEntity(input.title);
  const candidateVenue = normalizeToken(input.venue ?? "");

  for (const existing of exhibitions) {
    if (existing.slug === candidateSlug || existing.slug === input.slug) {
      report.hardConflict = { reason: "slug", existingSlug: existing.slug };
      return report;
    }
    if (input.sourceUrl && existing.sourceUrl && existing.sourceUrl === input.sourceUrl) {
      report.hardConflict = { reason: "sourceUrl", existingSlug: existing.slug };
      return report;
    }
  }

  for (const existing of exhibitions) {
    const sim = similarity(input.title, existing.title);
    if (sim < 0.85) continue;
    const existingVenue = normalizeToken(existing.gallery ?? existing.venue ?? "");
    if (candidateVenue && existingVenue && candidateVenue === existingVenue) {
      report.softMatches.push({
        existingSlug: existing.slug,
        existingTitle: existing.title,
        similarity: Number(sim.toFixed(2)),
      });
    }
  }

  return report;
}
