#!/usr/bin/env node
/* eslint-disable */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'public/exhibitions/ROT SUMMER');
const BACKUP = path.join(ROOT, '.compress-backup/exhibitions/ROT SUMMER');

const QUALITY = 80;
const MAX = 1600;

async function main() {
  fs.mkdirSync(BACKUP, { recursive: true });

  const files = fs.readdirSync(SRC)
    .filter((f) => /\.(jpe?g|png)$/i.test(f))
    .sort();

  console.log(`Converting ${files.length} files in ROT SUMMER`);

  let saved = 0;
  for (let i = 0; i < files.length; i++) {
    const src = path.join(SRC, files[i]);
    const dst = path.join(SRC, `${i + 1}.webp`);
    const srcSize = fs.statSync(src).size;

    await sharp(src, { failOn: 'none' })
      .rotate()
      .resize({ width: MAX, height: MAX, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: QUALITY })
      .toFile(dst);

    const dstSize = fs.statSync(dst).size;
    saved += srcSize - dstSize;

    // Backup original with its clean-ish original filename
    fs.renameSync(src, path.join(BACKUP, files[i]));
    console.log(`  ${files[i]} → ${i + 1}.webp  ${(srcSize/1024).toFixed(0)}K → ${(dstSize/1024).toFixed(0)}K`);
  }

  console.log(`\nSaved ${(saved / 1024 / 1024).toFixed(1)} MB total.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
