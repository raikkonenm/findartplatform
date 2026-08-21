#!/usr/bin/env node
/* eslint-disable */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const FILES = [
  'src/data/exhibitions.ts',
  'src/data/coverImages.ts',
  'src/data/salivaImport13.ts',
  'src/data/editorial.ts',
  'src/components/MobileGlobalSearch.tsx',
  'src/components/Hero.tsx',
];

const SKIP_LINE_RE = /IMAGE_EXTENSIONS/;

let totalReplacements = 0;

for (const rel of FILES) {
  const abs = path.join(ROOT, rel);
  if (!fs.existsSync(abs)) {
    console.warn(`skip missing: ${rel}`);
    continue;
  }
  const orig = fs.readFileSync(abs, 'utf8');
  const lines = orig.split(/\r?\n/);
  let fileCount = 0;
  const out = lines.map((line) => {
    if (SKIP_LINE_RE.test(line)) return line;
    // Replace ".jpg"/".jpeg"/".png" extensions when they appear right before
    // a quote character (', ", `) — the typical end of a path literal or
    // template string.
    return line.replace(/\.(jpe?g|png)(?=['"`])/gi, (m) => {
      fileCount++;
      return '.webp';
    });
  });
  const next = out.join('\n');
  if (next !== orig) {
    fs.writeFileSync(abs, next);
    console.log(`${rel}: ${fileCount} replaced`);
    totalReplacements += fileCount;
  } else {
    console.log(`${rel}: no changes`);
  }
}

console.log('');
console.log(`Total: ${totalReplacements} replacements`);
