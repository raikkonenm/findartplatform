#!/usr/bin/env node
/* eslint-disable */
// Targeted compressor for the 13 new exhibition/art-object folders.
//   - Renumbers each folder's photos as 1.jpg, 2.jpg, … (natural sort)
//   - Photos → 1.webp, 2.webp, … at q80, max 1600px, EXIF-rotated
//   - .mp4 → .web.mp4 via bundled ffmpeg, libx264, CRF 24, no audio
//   - Originals moved to .compress-backup/exhibitions/<folder>/
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const { execFileSync } = require("child_process");
const FF = require("@ffmpeg-installer/ffmpeg").path;

const ROOT = path.resolve(__dirname, "..");
const PUBLIC = path.join(ROOT, "public/exhibitions");
const BACKUP = path.join(ROOT, ".compress-backup/exhibitions");

const FOLDERS = [
  "THE JEWEL BOX",
  "Nexus",
  "Ancient Girl Starter Pack",
  "A Flower Is Growing Inside Me",
  "alex",
  "lizzy",
  "ханна",
  "обьект",
  "koesy",
  "Signal",
  "fight",
  "the room is empty, but pregnant",
  "Call me gravity",
];

const PHOTO_EXTS = new Set([".jpg", ".jpeg", ".png"]);
const VIDEO_EXTS = new Set([".mp4", ".mov"]);
const QUALITY = 80;
const MAX = 1600;

function ensureDir(d) { fs.mkdirSync(d, { recursive: true }); }

function naturalSort(a, b) {
  const re = /(\d+)|(\D+)/g;
  const at = String(a).match(re) || [];
  const bt = String(b).match(re) || [];
  const len = Math.min(at.length, bt.length);
  for (let i = 0; i < len; i++) {
    const an = Number(at[i]);
    const bn = Number(bt[i]);
    if (!Number.isNaN(an) && !Number.isNaN(bn)) {
      if (an !== bn) return an - bn;
    } else if (at[i] !== bt[i]) return at[i] < bt[i] ? -1 : 1;
  }
  return at.length - bt.length;
}

async function processFolder(folder) {
  const dir = path.join(PUBLIC, folder);
  if (!fs.existsSync(dir)) { console.warn(`SKIP: ${dir} (missing)`); return; }

  const files = fs.readdirSync(dir).filter((f) => !f.startsWith("."));
  const photos = files.filter((f) => PHOTO_EXTS.has(path.extname(f).toLowerCase())).sort(naturalSort);
  const videos = files.filter((f) => VIDEO_EXTS.has(path.extname(f).toLowerCase())).sort(naturalSort);

  const backupFolder = path.join(BACKUP, folder);
  ensureDir(backupFolder);

  let savedBytes = 0;
  let n = 0;

  // Renumber and convert photos.
  for (let i = 0; i < photos.length; i++) {
    const srcName = photos[i];
    const src = path.join(dir, srcName);
    const outName = `${i + 1}.webp`;
    const dst = path.join(dir, outName);
    if (dst === src) continue;
    try {
      const srcSize = fs.statSync(src).size;
      await sharp(src, { failOn: "none" })
        .rotate()
        .resize({ width: MAX, height: MAX, fit: "inside", withoutEnlargement: true })
        .webp({ quality: QUALITY })
        .toFile(dst + ".tmp");
      // Move original to backup before overwriting src's original name.
      fs.renameSync(src, path.join(backupFolder, srcName));
      // Finalize output.
      fs.renameSync(dst + ".tmp", dst);
      const dstSize = fs.statSync(dst).size;
      savedBytes += srcSize - dstSize;
      n += 1;
    } catch (e) {
      console.error(`FAIL photo ${src}: ${e.message}`);
    }
  }

  // Convert videos.
  for (let i = 0; i < videos.length; i++) {
    const srcName = videos[i];
    const src = path.join(dir, srcName);
    const outName = `v${i + 1}.web.mp4`;
    const dst = path.join(dir, outName);
    try {
      const srcSize = fs.statSync(src).size;
      execFileSync(FF, [
        "-y",
        "-i", src,
        "-c:v", "libx264",
        "-preset", "slow",
        "-crf", "24",
        "-pix_fmt", "yuv420p",
        "-vf", "scale='min(1280,iw)':-2",
        "-movflags", "+faststart",
        "-an",
        dst,
      ], { stdio: ["ignore", "ignore", "pipe"] });
      fs.renameSync(src, path.join(backupFolder, srcName));
      const dstSize = fs.statSync(dst).size;
      savedBytes += srcSize - dstSize;
      n += 1;
    } catch (e) {
      console.error(`FAIL video ${src}: ${e.message}`);
    }
  }

  console.log(`  ${folder.padEnd(40)} -> ${n} file(s), saved ${(savedBytes/1024/1024).toFixed(1)} MB`);
}

async function main() {
  console.log("Compressing new-card folders…\n");
  ensureDir(BACKUP);
  for (const f of FOLDERS) await processFolder(f);
  console.log("\nDone.");
}
main().catch((e) => { console.error(e); process.exit(1); });
