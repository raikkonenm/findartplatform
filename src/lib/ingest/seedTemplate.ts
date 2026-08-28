// Generate the TypeScript seed block the publisher inserts into
// src/data/exhibitions.ts between:
//
//   // AI_INGEST_START: <slug>
//   { … }
//   // AI_INGEST_END: <slug>
//
// The block reuses the archive's existing `localExhibitionGallery`
// helper so the data file stays consistent with hand-authored entries.

import type { Draft } from "./types";

// Safe TS string literal — escapes backticks and the ${ interpolation
// opener so descriptions containing either land as inert text.
function tpl(value: string): string {
  return "`" + value.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${") + "`";
}

function str(value: string): string {
  return JSON.stringify(value);
}

function stringArray(values: string[]): string {
  return `[${values.map((v) => str(v)).join(", ")}]`;
}

// Render the seed object literal. The tag list lives in a separate
// map (semanticTagAssignments) and is emitted by publish.ts — not here.
export function renderExhibitionSeed(draft: Draft): string {
  const n = draft.normalized;
  const folder = n.slug;
  const selectedImages = draft.images.filter((image) => image.selected);
  const filenames = selectedImages.map((image) => image.filename);
  const cover = selectedImages.find((image) => image.cover) ?? selectedImages[0];
  const coverFilename = cover ? cover.filename : filenames[0];

  const lines: string[] = [];
  lines.push("  {");
  lines.push(`    slug: ${str(n.slug)},`);
  lines.push(`    title: ${str(n.title)},`);
  if (n.subtitle) lines.push(`    subtitle: ${str(n.subtitle)},`);
  if (n.venue) lines.push(`    venue: ${str(n.venue)},`);
  if (n.gallery) lines.push(`    gallery: ${str(n.gallery)},`);
  if (n.city) lines.push(`    city: ${str(n.city)},`);
  if (n.country) lines.push(`    country: ${str(n.country)},`);
  if (n.year) lines.push(`    year: ${str(n.year)},`);
  if (n.dates) lines.push(`    dates: ${str(n.dates)},`);
  if (n.startDate) lines.push(`    startDate: ${str(n.startDate)},`);
  if (n.endDate) lines.push(`    endDate: ${str(n.endDate)},`);
  lines.push(`    dateSource: ${str(draft.contentType === "art-object" ? "instagram-post" : "exhibition")},`);
  if (n.artists && n.artists.length > 0) {
    lines.push(`    artists: ${stringArray(n.artists)},`);
  }
  if (n.curator) lines.push(`    curator: ${str(n.curator)},`);
  if (n.photographer) lines.push(`    photographer: ${str(n.photographer)},`);
  if (n.exhibitionText) lines.push(`    exhibitionText: ${str(n.exhibitionText)},`);
  if (n.source) lines.push(`    source: ${str(n.source)},`);
  if (n.sourceUrl) lines.push(`    sourceUrl: ${str(n.sourceUrl)},`);
  if (n.summary) lines.push(`    summary: ${tpl(n.summary)},`);
  lines.push(`    description: ${tpl(n.description)},`);
  if (coverFilename) {
    lines.push(`    previewImage: localExhibitionImage(${str(folder)}, ${str(coverFilename)}),`);
    lines.push(`    heroImage: localExhibitionImage(${str(folder)}, ${str(coverFilename)}),`);
  }
  lines.push(
    `    images: localExhibitionGallery(${str(folder)}, ${stringArray(filenames)}, "vertical"${
      n.photographer ? `, ${str(n.photographer)}` : ""
    }),`,
  );
  lines.push("  },");

  return lines.join("\n");
}

// Marker helpers so publish.ts and any future tool insert / find blocks
// consistently.
export function startMarker(slug: string): string {
  return `  // AI_INGEST_START: ${slug}`;
}
export function endMarker(slug: string): string {
  return `  // AI_INGEST_END: ${slug}`;
}
