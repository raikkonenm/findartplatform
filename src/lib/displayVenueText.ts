// Render a venue string for cards/grids. Data entries occasionally still
// carry @instagram-handle or #hashtag values; we strip the prefix and
// title-case the remaining segments so the homepage feed is visually
// consistent regardless of the underlying source format.
const VENUE_ACRONYMS = new Set(["cac", "acud", "nyc", "moco"]);

function titleCaseSegment(segment: string) {
  const normalized = segment.toLowerCase();
  if (VENUE_ACRONYMS.has(normalized)) {
    return normalized.toUpperCase();
  }
  return normalized.charAt(0).toLocaleUpperCase() + normalized.slice(1);
}

export function displayVenueText(value?: string): string | undefined {
  if (!value) return value;
  // Plain venue text passes through untouched.
  if (!/^[@#]/.test(value)) {
    return value;
  }
  return value
    .replace(/^[@#]/, "")
    .split(/[._-]+/)
    .filter(Boolean)
    .map(titleCaseSegment)
    .join(" ");
}
