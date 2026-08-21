#!/usr/bin/env node
/* eslint-disable */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT = path.resolve(__dirname, '..');
const PUBLIC = path.join(ROOT, 'public');
const BACKUP = path.join(ROOT, '.compress-backup');

const EXTS = new Set(['.jpg', '.jpeg', '.png']);
const QUALITY = 90;
const MAX = 1800;

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

async function compressImages() {
  const files = walk(PUBLIC).filter((f) => EXTS.has(path.extname(f).toLowerCase()));
  console.log(`Found ${files.length} raster files to convert`);

  let converted = 0;
  let saved = 0;
  let failed = 0;
  const t0 = Date.now();

  for (let i = 0; i < files.length; i++) {
    const src = files[i];
    const dir = path.dirname(src);
    const base = path.basename(src, path.extname(src));
    const dst = path.join(dir, base + '.webp');
    const rel = path.relative(PUBLIC, src);
    const backupPath = path.join(BACKUP, rel);

    try {
      if (!fs.existsSync(dst)) {
        const srcSize = fs.statSync(src).size;
        await sharp(src, { failOn: 'none' })
          .rotate()
          .resize({ width: MAX, height: MAX, fit: 'inside', withoutEnlargement: true })
          .webp({ quality: QUALITY })
          .toFile(dst);
        const dstSize = fs.statSync(dst).size;
        saved += srcSize - dstSize;
      }
      ensureDir(path.dirname(backupPath));
      if (fs.existsSync(backupPath)) fs.unlinkSync(backupPath);
      fs.renameSync(src, backupPath);
      converted++;
      if (converted % 100 === 0) {
        const secs = ((Date.now() - t0) / 1000).toFixed(0);
        console.log(`  [${converted}/${files.length}] +${((saved) / 1024 / 1024).toFixed(0)} MB saved · ${secs}s`);
      }
    } catch (e) {
      failed++;
      console.error(`FAIL ${src}: ${e.message}`);
    }
  }

  console.log(`Converted: ${converted}, failed: ${failed}, saved: ${(saved / 1024 / 1024).toFixed(1)} MB`);
}

function rewriteCodeRefs() {
  // Walk src/ for .ts/.tsx and rewrite ".jpg"/".jpeg"/".png" extensions to
  // ".webp" whenever they appear right before a quote character (typical
  // string / template-literal ending). Skips lines that mention
  // IMAGE_EXTENSIONS so we don't corrupt whitelist arrays.
  const SRC = path.join(ROOT, 'src');
  const files = walk(SRC).filter((f) => /\.(ts|tsx)$/.test(f));
  const RE = /\.(jpe?g|png)(?=['"`])/gi;
  let touched = 0;
  let replacements = 0;
  for (const file of files) {
    const orig = fs.readFileSync(file, 'utf8');
    const lines = orig.split(/\r?\n/);
    let fileCount = 0;
    const out = lines.map((line) => {
      if (line.includes('IMAGE_EXTENSIONS')) return line;
      return line.replace(RE, () => {
        fileCount++;
        return '.webp';
      });
    });
    if (fileCount > 0) {
      fs.writeFileSync(file, out.join('\n'));
      touched++;
      replacements += fileCount;
      console.log(`  ${path.relative(ROOT, file)}: ${fileCount}`);
    }
  }
  console.log(`Rewrote ${replacements} refs across ${touched} files`);
}

async function main() {
  await compressImages();
  console.log('\n--- Rewriting code references ---');
  rewriteCodeRefs();
  console.log('\nDone.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
