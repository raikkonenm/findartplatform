// One-off: download C.R.E.A.M. images from ofluxo, convert each to webp
// (q=82, cap 2000px wide, no upscaling), probe orientation, write out
// 02.webp … in order. 01.webp is reserved for the user-attached cover,
// which was pre-copied as _user-cover.webp.
//
// Not part of the regular pipeline — kept so the ingest is reproducible
// if images need to be re-pulled.

import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const SLUG = "c-r-e-a-m-cash-rules-everything-around-me";
const OUT_DIR = path.resolve(`public/exhibitions/${SLUG}`);

// Strip the ?fit= query from each URL to pull the full-size file.
const RAW_URLS = `
https://i0.wp.com/www.ofluxo.net/wp-content/uploads/2026/10/C.R.E.A.M-Cash-Rules-Everything-Around-Me-Exhibition-View.jpg
https://i0.wp.com/www.ofluxo.net/wp-content/uploads/2026/10/C.R.E.A.M-Cash-Rules-Everything-Around-Me-Exhibition-View1.jpg
https://i0.wp.com/www.ofluxo.net/wp-content/uploads/2026/10/C.R.E.A.M-Cash-Rules-Everything-Around-Me-Exhibition-View2.jpg
https://i0.wp.com/www.ofluxo.net/wp-content/uploads/2026/10/C.R.E.A.M-Cash-Rules-Everything-Around-Me-Exhibition-View3.jpg
https://i0.wp.com/www.ofluxo.net/wp-content/uploads/2026/10/C.R.E.A.M-Cash-Rules-Everything-Around-Me-Exhibition-View4.jpg
https://i0.wp.com/www.ofluxo.net/wp-content/uploads/2026/10/C.R.E.A.M-Cash-Rules-Everything-Around-Me-Exhibition-View6.jpg
https://i0.wp.com/www.ofluxo.net/wp-content/uploads/2026/10/C.R.E.A.M-Cash-Rules-Everything-Around-Me-Exhibition-View7.jpg
https://i0.wp.com/www.ofluxo.net/wp-content/uploads/2026/10/Exhibition-View.jpg
https://i0.wp.com/www.ofluxo.net/wp-content/uploads/2026/10/Miguel-Aguirre.jpg
https://i0.wp.com/www.ofluxo.net/wp-content/uploads/2026/10/Miguel-Aguirre1.jpg
https://i0.wp.com/www.ofluxo.net/wp-content/uploads/2026/10/Priscilla-Benyahia.jpg
https://i0.wp.com/www.ofluxo.net/wp-content/uploads/2026/10/Priscilla-Benyahia1.jpg
https://i0.wp.com/www.ofluxo.net/wp-content/uploads/2026/10/Priscilla-Benyahia2.jpg
https://i0.wp.com/www.ofluxo.net/wp-content/uploads/2026/10/Priscilla-Benyahia3.jpg
https://i0.wp.com/www.ofluxo.net/wp-content/uploads/2026/10/Jimena-Chavez-Delion.jpg
https://i0.wp.com/www.ofluxo.net/wp-content/uploads/2026/10/Jimena-Chavez-Delion1.jpg
https://i0.wp.com/www.ofluxo.net/wp-content/uploads/2026/10/Jimena-Chavez-Delion2.jpg
https://i0.wp.com/www.ofluxo.net/wp-content/uploads/2026/10/Jimena-Chavez-Delion3.jpg
https://i0.wp.com/www.ofluxo.net/wp-content/uploads/2026/10/Jimena-Chavez-Delion4.jpg
https://i0.wp.com/www.ofluxo.net/wp-content/uploads/2026/10/Jimena-Chavez-Delion5.jpg
https://i0.wp.com/www.ofluxo.net/wp-content/uploads/2026/10/Jimena-Chavez-Delion6.jpg
https://i0.wp.com/www.ofluxo.net/wp-content/uploads/2026/10/Jimena-Chavez-Delion7.jpg
https://i0.wp.com/www.ofluxo.net/wp-content/uploads/2026/10/Jimena-Chavez-Delion-Al-Instante-con-DNI.jpg
https://i0.wp.com/www.ofluxo.net/wp-content/uploads/2026/10/Civic-Views-Emilio-Martinez-Poppe.jpg
https://i0.wp.com/www.ofluxo.net/wp-content/uploads/2026/10/Civic-Views-Emilio-Martinez-Poppe1.jpg
https://i0.wp.com/www.ofluxo.net/wp-content/uploads/2026/10/Mykolas-Valantinas.jpg
https://i0.wp.com/www.ofluxo.net/wp-content/uploads/2026/10/Mykolas-Valantinas1.jpg
https://i0.wp.com/www.ofluxo.net/wp-content/uploads/2026/10/Mykolas-Valantinas2.jpg
https://i0.wp.com/www.ofluxo.net/wp-content/uploads/2026/10/Mykolas-Valantinas3.jpg
https://i0.wp.com/www.ofluxo.net/wp-content/uploads/2026/10/Mykolas-Valantinas4.jpg
https://i0.wp.com/www.ofluxo.net/wp-content/uploads/2026/10/Mykolas-Valantinas5.jpg
https://i0.wp.com/www.ofluxo.net/wp-content/uploads/2026/10/Mykolas-Valantinas6.jpg
https://i0.wp.com/www.ofluxo.net/wp-content/uploads/2026/10/Mykolas-Valantinas7.jpg
https://i0.wp.com/www.ofluxo.net/wp-content/uploads/2026/10/Mykolas-Valantinas8.jpg
https://i0.wp.com/www.ofluxo.net/wp-content/uploads/2026/10/Mykolas-Valantinas9.jpg
https://i0.wp.com/www.ofluxo.net/wp-content/uploads/2026/10/Mykolas-Valantinas10.jpg
https://i0.wp.com/www.ofluxo.net/wp-content/uploads/2026/10/Mykolas-Valantinas11.jpg
https://i0.wp.com/www.ofluxo.net/wp-content/uploads/2026/10/Mykolas-Valantinas12.jpg
https://i0.wp.com/www.ofluxo.net/wp-content/uploads/2026/10/Mykolas-Valantinas13.jpg
https://i0.wp.com/www.ofluxo.net/wp-content/uploads/2026/10/Mykolas-Valantinas14.jpg
https://i0.wp.com/www.ofluxo.net/wp-content/uploads/2026/10/Mykolas-Valantinas15.jpg
https://i0.wp.com/www.ofluxo.net/wp-content/uploads/2026/10/Mykolas-Valentinas.jpg
https://i0.wp.com/www.ofluxo.net/wp-content/uploads/2026/10/Mykolas-Valentinas1.jpg
https://i0.wp.com/www.ofluxo.net/wp-content/uploads/2026/10/UV-Detector-and-Flat-Lithuanian-Banknote.jpg
`
  .trim()
  .split(/\n+/)
  .map((url) => url.trim())
  .filter(Boolean);

async function download(url) {
  const response = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  return Buffer.from(await response.arrayBuffer());
}

async function processOne(sourceUrl, index) {
  // Our 01.webp slot is the user-attached cover; start the ofluxo gallery at 02.
  const outName = `${String(index + 2).padStart(2, "0")}.webp`;
  const outPath = path.join(OUT_DIR, outName);
  const buffer = await download(sourceUrl);
  const image = sharp(buffer, { failOn: "none" });
  const metadata = await image.metadata();
  const width = metadata.width ?? 0;
  const height = metadata.height ?? 0;
  const orientation = width >= height ? "horizontal" : "vertical";
  await image
    .resize({ width: Math.min(width || 2000, 2000), withoutEnlargement: true })
    .webp({ quality: 82, effort: 6 })
    .toFile(outPath);
  const { size } = await fs.stat(outPath);
  return { name: outName, orientation, kb: Math.round(size / 1024), width, height, url: sourceUrl };
}

const results = [];
for (let i = 0; i < RAW_URLS.length; i++) {
  try {
    const result = await processOne(RAW_URLS[i], i);
    results.push(result);
    console.log(`${result.name}  ${result.orientation.padEnd(10)}  ${result.kb} KB  ${result.width}x${result.height}  ${path.basename(result.url)}`);
  } catch (error) {
    console.error(`FAIL ${RAW_URLS[i]}: ${error.message}`);
  }
}

// Also probe the user cover we pre-copied, so the entry can list its orientation correctly.
try {
  const coverSrc = path.join(OUT_DIR, "_user-cover.webp");
  const metadata = await sharp(coverSrc).metadata();
  await fs.rename(coverSrc, path.join(OUT_DIR, "01.webp"));
  const orientation = (metadata.width ?? 0) >= (metadata.height ?? 0) ? "horizontal" : "vertical";
  const { size } = await fs.stat(path.join(OUT_DIR, "01.webp"));
  console.log(`\n01.webp (cover)  ${orientation}  ${Math.round(size / 1024)} KB  ${metadata.width}x${metadata.height}`);
  results.unshift({ name: "01.webp", orientation, kb: Math.round(size / 1024), width: metadata.width, height: metadata.height, url: "user-attached" });
} catch (error) {
  console.error(`Cover probe failed: ${error.message}`);
}

await fs.writeFile(
  path.join(OUT_DIR, "_inventory.json"),
  JSON.stringify(results, null, 2),
);
console.log(`\nWrote inventory for ${results.length} files.`);
