#!/usr/bin/env node
/* eslint-disable */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PUBLIC = path.join(ROOT, 'public');
const BACKUP = path.join(ROOT, '.compress-backup');

// Anything with mtime AFTER this threshold is treated as "newly created by
// the compression run" and gets removed. Threshold = 30 minutes ago, which
// safely brackets the run.
const THRESHOLD_MS = Date.now() - 30 * 60 * 1000;

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
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
  const backups = walk(BACKUP);
  console.log(`Backup contains ${backups.length} files`);

  let restored = 0;
  let webpRemoved = 0;
  let webpKept = 0;
  let failed = 0;

  for (const src of backups) {
    const rel = path.relative(BACKUP, src);
    const dst = path.join(PUBLIC, rel);
    const webpSibling = path.join(path.dirname(dst), path.basename(dst, path.extname(dst)) + '.webp');

    try {
      // Restore original.
      ensureDir(path.dirname(dst));
      if (fs.existsSync(dst)) fs.unlinkSync(dst);
      fs.renameSync(src, dst);
      restored++;

      // Remove the webp sibling only if it was created by this run.
      if (fs.existsSync(webpSibling)) {
        const mtime = fs.statSync(webpSibling).mtimeMs;
        if (mtime > THRESHOLD_MS) {
          fs.unlinkSync(webpSibling);
          webpRemoved++;
        } else {
          webpKept++;
        }
      }
    } catch (e) {
      failed++;
      console.error(`FAIL ${src}: ${e.message}`);
    }
  }

  console.log('');
  console.log(`Restored originals: ${restored}`);
  console.log(`Removed newly-created .webp: ${webpRemoved}`);
  console.log(`Kept pre-existing .webp: ${webpKept}`);
  console.log(`Failed: ${failed}`);

  // Remove empty backup subdirs.
  function pruneEmpty(dir) {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) pruneEmpty(path.join(dir, entry.name));
    }
    try {
      if (fs.readdirSync(dir).length === 0) fs.rmdirSync(dir);
    } catch {}
  }
  pruneEmpty(BACKUP);
  console.log('Backup pruned.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
