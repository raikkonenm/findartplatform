#!/usr/bin/env node
// Reusable ingest helper for exhibitions. Downloads every image URL from
// the given manifest, converts each to webp (sharp q=82, cap 2000px wide,
// no upscaling), probes orientation per file, and writes a numbered
// 02.webp, 03.webp … under public/exhibitions/<slug>/. Slot 01.webp is
// reserved for a user-attached cover and is NOT touched; place that cover
// manually before or after running this script. An inventory TSV with
// filename / orientation / size / original URL is printed to stdout so the
// caller can paste the orientation list straight into
// localExhibitionGalleryWithOrientations.
//
// Manifest input (STDIN):
//   One absolute image URL per line, in the order they should appear in
//   the gallery (02 onwards). Blank lines and `#` comments are ignored.
//
// Usage:
//   cat manifest.txt | node scripts/ingest-exhibition.mjs <slug>
//   printf '%s\n' "$URL1" "$URL2" | node scripts/ingest-exhibition.mjs <slug>

import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const slug = process.argv[2];
if (!slug || !/^[a-z0-9][a-z0-9-]*$/.test(slug)) {
  console.error("Usage: node scripts/ingest-exhibition.mjs <slug>");
  console.error("Slug must be lowercase ASCII letters/digits/hyphens.");
  process.exit(1);
}

const outDir = path.resolve(`public/exhibitions/${slug}`);
await fs.mkdir(outDir, { recursive: true });

const stdinText = await new Promise((resolve, reject) => {
  let data = "";
  process.stdin.setEncoding("utf8");
  process.stdin.on("data", (chunk) => (data += chunk));
  process.stdin.on("end", () => resolve(data));
  process.stdin.on("error", reject);
});
const urls = stdinText
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter((line) => line && !line.startsWith("#"));

if (urls.length === 0) {
  console.error("Manifest is empty. Pipe URLs on stdin, one per line.");
  process.exit(1);
}

async function fetchBuffer(url) {
  const response = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  return Buffer.from(await response.arrayBuffer());
}

const rows = [];
for (let i = 0; i < urls.length; i++) {
  const url = urls[i];
  const name = `${String(i + 2).padStart(2, "0")}.webp`;
  try {
    const buf = await fetchBuffer(url);
    const img = sharp(buf, { failOn: "none" });
    const meta = await img.metadata();
    const width = meta.width ?? 0;
    const height = meta.height ?? 0;
    const orientation = width >= height ? "horizontal" : "vertical";
    await img
      .resize({ width: Math.min(width || 2000, 2000), withoutEnlargement: true })
      .webp({ quality: 82, effort: 6 })
      .toFile(path.join(outDir, name));
    const { size } = await fs.stat(path.join(outDir, name));
    rows.push({ name, orientation, kb: Math.round(size / 1024), width, height, url });
    console.error(`${name}  ${orientation.padEnd(10)}  ${rows[rows.length - 1].kb} KB  ${width}x${height}  ${path.basename(url).split("?")[0]}`);
  } catch (error) {
    console.error(`FAIL ${name} <- ${url}: ${error.message}`);
  }
}

// Probe 01.webp if the caller already dropped a cover there.
try {
  const coverPath = path.join(outDir, "01.webp");
  const meta = await sharp(coverPath).metadata();
  const width = meta.width ?? 0;
  const height = meta.height ?? 0;
  const orientation = width >= height ? "horizontal" : "vertical";
  const { size } = await fs.stat(coverPath);
  rows.unshift({ name: "01.webp", orientation, kb: Math.round(size / 1024), width, height, url: "pre-placed cover" });
  console.error(`\n01.webp (cover)  ${orientation}  ${rows[0].kb} KB  ${width}x${height}`);
} catch {
  console.error("\nNote: 01.webp not found. Place the user-attached cover there before building the entry.");
}

// Stdout is the inventory the caller consumes.
console.log("name\torientation\tkb\twidth\theight\tsource");
for (const row of rows) {
  console.log(`${row.name}\t${row.orientation}\t${row.kb}\t${row.width}\t${row.height}\t${row.url}`);
}
