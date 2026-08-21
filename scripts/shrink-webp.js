#!/usr/bin/env node
/* eslint-disable */
// Second-pass compression on already-webp files: 1200px max, q80.
// Buffer approach — read + transform in memory, then overwrite in one
// writeFile. Avoids Windows tmp-rename EPERM when a background process
// briefly opens a newly-written file.
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT = path.resolve(__dirname, '..');
const PUBLIC = path.join(ROOT, 'public');
const QUALITY = 80;
const MAX = 1200;

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

async function tryWrite(dst, buf, attempts = 5) {
  for (let i = 0; i < attempts; i++) {
    try {
      fs.writeFileSync(dst, buf);
      return true;
    } catch (e) {
      if (i === attempts - 1) throw e;
      await new Promise((r) => setTimeout(r, 200 * (i + 1)));
    }
  }
  return false;
}

async function main() {
  const files = walk(PUBLIC).filter((f) => f.toLowerCase().endsWith('.webp'));
  console.log(`Found ${files.length} .webp files`);

  let touched = 0;
  let skipped = 0;
  let failed = 0;
  let saved = 0;
  const t0 = Date.now();

  for (let i = 0; i < files.length; i++) {
    const src = files[i];
    let srcSize = 0;
    try {
      srcSize = fs.statSync(src).size;
      const inputBuf = fs.readFileSync(src);
      const outBuf = await sharp(inputBuf, { failOn: 'none' })
        .rotate()
        .resize({ width: MAX, height: MAX, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: QUALITY })
        .toBuffer();
      if (outBuf.length < srcSize) {
        await tryWrite(src, outBuf);
        saved += srcSize - outBuf.length;
        touched++;
      } else {
        skipped++;
      }
    } catch (e) {
      failed++;
      console.error(`FAIL ${src}: ${e.message}`);
    }
    if ((i + 1) % 200 === 0) {
      const secs = ((Date.now() - t0) / 1000).toFixed(0);
      console.log(`  [${i + 1}/${files.length}] touched=${touched} kept=${skipped} failed=${failed} · ${(saved / 1024 / 1024).toFixed(0)} MB saved · ${secs}s`);
    }
  }

  const secs = ((Date.now() - t0) / 1000).toFixed(0);
  console.log(`\nDone. Touched: ${touched}, kept: ${skipped}, failed: ${failed}, saved: ${(saved / 1024 / 1024).toFixed(1)} MB in ${secs}s`);
}

main().catch((e) => { console.error(e); process.exit(1); });
