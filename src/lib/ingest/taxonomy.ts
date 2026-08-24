// Snapshot of the FindArt closed taxonomies for the ingest pipeline.
// Everything Claude may output is constrained against these values —
// tags are dropped if they aren't in the semanticTags list, city and
// country are folded through FACET_CANONICAL_VALUES so newly ingested
// entries can never fragment the archive.

import {
  canonicalFacetValue,
  exhibitionSlug,
  slugifyEntity,
} from "@/lib/entitySlugs";
import { semanticTags, type SemanticTag } from "@/data/exhibitions";

export const ALLOWED_TAGS = new Set<string>(semanticTags as readonly string[]);

export function coerceTag(value: string): SemanticTag | undefined {
  const normalized = value.trim().toUpperCase();
  return ALLOWED_TAGS.has(normalized) ? (normalized as SemanticTag) : undefined;
}

export function coerceTags(values: unknown): SemanticTag[] {
  if (!Array.isArray(values)) return [];
  const out: SemanticTag[] = [];
  for (const raw of values) {
    if (typeof raw !== "string") continue;
    const tag = coerceTag(raw);
    if (tag && !out.includes(tag)) out.push(tag);
  }
  return out;
}

export function normalizeCity(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return canonicalFacetValue("city", trimmed);
}

export function normalizeCountry(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return canonicalFacetValue("country", trimmed);
}

export { exhibitionSlug, slugifyEntity };
