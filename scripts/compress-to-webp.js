#!/usr/bin/env node
/* eslint-disable */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT = path.resolve(__dirname, '..');
const PUBLIC = path.join(ROOT, 'public');
const BACKUP = path.join(ROOT, '.compress-backup');

const EXTS = new Set(['.jpg', '.jpeg', '.png']);
const QUALITY = 80;
const MAX = 1600;

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

function ensureDir(d) {
  fs.mkdirSync(d, { recursive: true });
}

async function main() {
  const files = walk(PUBLIC).filter((f) => EXTS.has(path.extname(f).toLowerCase()));
  console.log(`Found ${files.length} raster files to convert`);

  let converted = 0;
  let skipped = 0;
  let saved = 0;
  let failed = 0;
  const t0 = Date.now();

  for (let i = 0; i < files.length; i++) {
    const src = files[i];
    const dir = path.dirname(src);
    const base = path.basename(src, path.extname(src));
    const dst = path.join(dir, base + '.webp');

    if (fs.existsSync(dst)) {
      // Already has a webp sibling — just move the original to backup and remove.
      const rel = path.relative(PUBLIC, src);
      const backupPath = path.join(BACKUP, rel);
      ensureDir(path.dirname(backupPath));
      try {
        fs.renameSync(src, backupPath);
        skipped++;
      } catch (e) {
        failed++;
        console.error(`skip-move failed: ${src}: ${e.message}`);
      }
      continue;
    }

    try {
      const srcSize = fs.statSync(src).size;
      await sharp(src, { failOn: 'none' })
        .rotate()
        .resize({ width: MAX, height: MAX, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: QUALITY })
        .toFile(dst);
      const dstSize = fs.statSync(dst).size;
      saved += srcSize - dstSize;

      // Backup original and remove from public.
      const rel = path.relative(PUBLIC, src);
      const backupPath = path.join(BACKUP, rel);
      ensureDir(path.dirname(backupPath));
      fs.renameSync(src, backupPath);

      converted++;
      if (converted % 50 === 0) {
        const secs = ((Date.now() - t0) / 1000).toFixed(0);
        console.log(`  [${converted}/${files.length}] +${((saved) / 1024 / 1024).toFixed(1)} MB saved so far · ${secs}s`);
      }
    } catch (e) {
      failed++;
      console.error(`FAIL ${src}: ${e.message}`);
    }
  }

  const secs = ((Date.now() - t0) / 1000).toFixed(0);
  console.log('');
  console.log(`Converted: ${converted}`);
  console.log(`Skipped (webp existed): ${skipped}`);
  console.log(`Failed: ${failed}`);
  console.log(`Saved: ${(saved / 1024 / 1024).toFixed(1)} MB`);
  console.log(`Elapsed: ${secs}s`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
