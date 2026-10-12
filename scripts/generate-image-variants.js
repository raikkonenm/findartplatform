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

// Scan the whole target tree and build the manifest the custom loader
// will read at request time. The manifest is a flat object:
//   { "/exhibitions/foo/1.webp": [640, 1080], ... }
// Keys are URL-SAFE paths starting with "/" (the same shape that
// `localExhibitionImage` and friends produce via encodeURIComponent),
// so the loader can look up by `src` directly without any decoding.
function manifestKey(absPath) {
  const rel = path.relative(PUBLIC, absPath).replace(/\\/g, "/");
  return "/" + rel.split("/").map(encodeURIComponent).join("/");
}

function buildManifestForDirs(dirs) {
  const manifest = {};
  for (const root of dirs) {
    if (!fs.existsSync(root)) continue;
    const stack = [root];
    while (stack.length) {
      const next = stack.pop();
      const entries = fs.readdirSync(next, { withFileTypes: true });
      for (const entry of entries) {
        const full = path.join(next, entry.name);
        if (entry.isDirectory()) {
          stack.push(full);
          continue;
        }
        if (!entry.isFile()) continue;
        // Match either "<base>-640.webp" or "<base>-1080.webp".
        const m = entry.name.match(/^(.*)-(640|1080)\.webp$/i);
        if (!m) continue;
        const basename = `${m[1]}.webp`;
        const width = Number(m[2]);
        const sourceAbs = path.join(next, basename);
        if (!fs.existsSync(sourceAbs)) continue;
        const key = manifestKey(sourceAbs);
        if (!manifest[key]) manifest[key] = [];
        if (!manifest[key].includes(width)) manifest[key].push(width);
      }
    }
  }
  for (const key of Object.keys(manifest)) manifest[key].sort((a, b) => a - b);
  return manifest;
}

const MANIFEST_PATH = path.join(ROOT, "src/lib/imageVariants.manifest.json");

async function main() {
  const argv = process.argv.slice(2);
  const dry = argv.includes("--dry");
  const manifestOnly = argv.includes("--manifest-only");
  const explicitIdx = argv.indexOf("--paths");
  let roots = DEFAULT_ROOTS;
  if (explicitIdx !== -1) {
    const after = argv.slice(explicitIdx + 1);
    roots = after.map((p) => (path.isAbsolute(p) ? p : path.join(ROOT, p)));
  }

  if (!manifestOnly) {
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

  // Always refresh the manifest so git tracks the authoritative list
  // of available variants. We scan the DEFAULT_ROOTS regardless of
  // --paths — the loader needs to know about every variant on disk,
  // not just the ones from the last partial run.
  const manifest = buildManifestForDirs(DEFAULT_ROOTS);
  fs.mkdirSync(path.dirname(MANIFEST_PATH), { recursive: true });
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + "\n");
  const entries = Object.keys(manifest).length;
  const rel640 = Object.values(manifest).filter((v) => v.includes(640)).length;
  const rel1080 = Object.values(manifest).filter((v) => v.includes(1080)).length;
  console.log(`manifest: ${entries} sources · ${rel640} with -640 · ${rel1080} with -1080  → ${path.relative(ROOT, MANIFEST_PATH).replace(/\\/g, "/")}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
