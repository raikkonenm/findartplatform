#!/usr/bin/env node
/**
 * Generate small resized variants of our existing WebP assets so the
 * site can serve a right-sized image to each viewport WITHOUT relying
 * on Vercel's Image Optimization API (quota exhausted).
 *
 * Policy, matching the plan the user approved:
 *   - Originals are NEVER modified.
 *   - For each source image under targeted roots we emit:
 *       <base>-640.webp   (if source width > 640)
 *       <base>-1080.webp  (if source width > 1080)
 *     i.e. we never upscale.
 *   - Quality: 85 (floor set by user; previous script used 80).
 *   - Only ever resize by width — height follows aspect ratio.
 *
 * The companion custom loader in `next.config.ts` chooses which
 * variant to request based on the width the browser asks for.
 *
 * Usage:
 *   node scripts/generate-image-variants.js                 # all defaults
 *   node scripts/generate-image-variants.js --dry           # list only
 *   node scripts/generate-image-variants.js --paths a b c   # only those paths
 */

const path = require("path");
const fs = require("fs");
const sharp = require("sharp");

const ROOT = path.resolve(__dirname, "..");
const PUBLIC = path.join(ROOT, "public");

// Target directories (recursed). Anything else in public/ is left alone.
const DEFAULT_ROOTS = [
  path.join(PUBLIC, "exhibitions"),
  path.join(PUBLIC, "banner"),
  path.join(PUBLIC, "editorial"),
  path.join(PUBLIC, "advertising"),
  path.join(PUBLIC, "directory"),
  path.join(PUBLIC, "promo"),
];

const VARIANTS = [
  { width: 640, suffix: "-640" },
  { width: 1080, suffix: "-1080" },
];
const QUALITY = 85;

// Skip anything whose basename already matches a variant naming
// convention or isn't a WebP source. Also skip video posters we hand-
// built so we don't recursively multiply assets.
function isSource(filename) {
  if (!filename.toLowerCase().endsWith(".webp")) return false;
  // Already a generated variant.
  if (/-\d{3,4}\.webp$/.test(filename)) return false;
  // Hand-built posters: fine to leave at native size.
  if (/\.poster\.webp$/.test(filename)) return false;
  return true;
}

async function* walk(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walk(full);
    } else if (entry.isFile() && isSource(entry.name)) {
      yield full;
    }
  }
}

async function emitVariants(sourcePath, { dry }) {
  const meta = await sharp(sourcePath).metadata();
  if (!meta.width) return { skipped: true, reason: "no-width" };

  const results = [];
  for (const variant of VARIANTS) {
    if (meta.width <= variant.width) {
      // Source already smaller — don't upscale, don't duplicate.
      continue;
    }
    const base = sourcePath.replace(/\.webp$/i, "");
    const target = `${base}${variant.suffix}.webp`;
    if (fs.existsSync(target)) {
      results.push({ target, status: "exists" });
      continue;
    }
    if (dry) {
      results.push({ target, status: "would-create", width: variant.width });
      continue;
    }
    const tmp = `${target}.tmp.webp`;
    await sharp(sourcePath)
      .resize({ width: variant.width, withoutEnlargement: true })
      .webp({ quality: QUALITY })
      .toFile(tmp);
    fs.renameSync(tmp, target);
    const size = fs.statSync(target).size;
    results.push({ target, status: "created", width: variant.width, bytes: size });
  }
  return { source: sourcePath, srcWidth: meta.width, results };
}

async function main() {
  const argv = process.argv.slice(2);
  const dry = argv.includes("--dry");
  const explicitIdx = argv.indexOf("--paths");
  let roots = DEFAULT_ROOTS;
  if (explicitIdx !== -1) {
    const after = argv.slice(explicitIdx + 1);
    roots = after.map((p) => (path.isAbsolute(p) ? p : path.join(ROOT, p)));
  }

  const summary = { scanned: 0, created: 0, skipped: 0, bytes: 0 };
  for (const root of roots) {
    const files = [];
    if (!fs.existsSync(root)) continue;
    const stat = fs.statSync(root);
    if (stat.isDirectory()) {
      for await (const f of walk(root)) files.push(f);
    } else if (stat.isFile() && isSource(path.basename(root))) {
      files.push(root);
    }
    for (const file of files) {
      summary.scanned += 1;
      const outcome = await emitVariants(file, { dry });
      if (outcome.skipped) { summary.skipped += 1; continue; }
      for (const r of outcome.results) {
        if (r.status === "created") {
          summary.created += 1;
          summary.bytes += r.bytes;
          const rel = path.relative(ROOT, r.target).replace(/\\/g, "/");
          console.log(`+ ${rel.padEnd(70)} ${(r.bytes/1024).toFixed(0)} KB`);
        } else if (r.status === "would-create") {
          const rel = path.relative(ROOT, r.target).replace(/\\/g, "/");
          console.log(`? ${rel}`);
        }
      }
    }
  }
  const total = (summary.bytes / 1024 / 1024).toFixed(1);
  console.log(`\n${summary.created} variants generated · ${total} MB added · ${summary.scanned} sources scanned${dry ? "  (DRY RUN)" : ""}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
