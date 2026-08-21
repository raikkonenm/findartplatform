#!/usr/bin/env node
/* eslint-disable */
// Strip every `unoptimized` prop on <Image> and every `unoptimized: true`
// object literal from src/ so Next.js image optimization takes over
// site-wide. Run once, then re-enable per-image only if a specific asset
// needs to bypass optimization (which shouldn't be necessary now that
// sources are ~46 KB webp on average).
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

const files = walk(SRC).filter((f) => /\.(ts|tsx)$/.test(f));

let touched = 0;
for (const file of files) {
  const orig = fs.readFileSync(file, 'utf8');
  let next = orig;

  // Prop on <Image .../>: standalone "unoptimized" attribute on its own
  // line — remove the whole line so surrounding formatting stays clean.
  next = next.replace(/^[ \t]*unoptimized\r?\n/gm, '');

  // Object-spread form: {...(x.unoptimized ? { unoptimized: true } : {})}
  next = next.replace(
    /^[ \t]*\{\.\.\.\([^)]*\.unoptimized[^)]*\)\}\r?\n/gm,
    '',
  );

  // Object literal field `unoptimized: true,` (in data seeds).
  next = next.replace(/^[ \t]*unoptimized:\s*true,?\r?\n/gm, '');

  if (next !== orig) {
    fs.writeFileSync(file, next);
    touched++;
    console.log(`  ${path.relative(ROOT, file)}`);
  }
}

console.log(`\nStripped unoptimized in ${touched} files`);
