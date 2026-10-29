import { createHash } from 'node:crypto';
import { mkdir, readFile, realpath, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { contentCaption } from './content.mjs';

export const UPLOAD_LIMIT = 49_000_000; // Below the hosted Bot API's 50 MB limit.
export const hash = value => createHash('sha256').update(value).digest('hex');
export const groups = (items, count = 10) => Array.from({ length: Math.ceil(items.length / count) }, (_, i) => items.slice(i * count, (i + 1) * count));
const stable = value => Array.isArray(value) ? value.map(stable) : value && typeof value === 'object' ? Object.fromEntries(Object.keys(value).sort().map(key => [key, stable(value[key])])) : value;
export const fingerprint = value => hash(JSON.stringify(stable(value)));

async function mediaPath(root, source) {
  if (typeof source !== 'string' || !source.startsWith('/') || source.startsWith('//') || /[?#]/.test(source)) throw new Error('Media must be a local public/ path');
  const publicRoot = await realpath(path.join(root, 'public'));
  const resolved = await realpath(path.resolve(publicRoot, '.' + decodeURIComponent(source)));
  if (!resolved.startsWith(publicRoot + path.sep) || !(await stat(resolved)).isFile()) throw new Error('Media path escapes public/ or is not a file');
  if (!/\.(jpe?g|png|webp|avif|tiff?)$/i.test(resolved)) throw new Error('Unsupported image file');
  return resolved;
}

export async function inventory(item, root) {
  const errors = [], warnings = [], files = [];
  const cover = item.coverImage || item.previewImage;
  const sources = [{ src: cover, originalSrc: item.social?.coverOriginalSrc, cover: true }, ...(item.images || []).map(image => ({ ...image, cover: false }))];
  const seen = new Set();
  for (const source of sources) {
    if (!source.src) { errors.push('Missing cover or gallery image path'); continue; }
    try {
      let selected = source.originalSrc || source.src;
      let provenance = source.originalSrc ? 'documented original path' : 'available website asset; original quality unverified';
      if (!source.originalSrc && /\.webp$/i.test(source.src)) {
        for (const extension of ['.jpg', '.jpeg', '.png', '.tif', '.tiff']) {
          const candidate = source.src.replace(/\.webp$/i, extension);
          try { await mediaPath(root, candidate); selected = candidate; provenance = 'same-basename source asset; original quality unverified'; break; } catch { /* No counterpart. */ }
        }
      }
      const absolute = await mediaPath(root, selected);
      if (seen.has(absolute)) continue;
      seen.add(absolute);
      const bytes = await readFile(absolute);
      if (bytes.length > UPLOAD_LIMIT) errors.push(`Image exceeds document upload limit: ${selected}`);
      const meta = await sharp(bytes).metadata();
      files.push({ index: files.length + 1, src: source.src, selected, path: absolute, filename: path.basename(absolute), bytes: bytes.length, sha256: hash(bytes), cover: source.cover, provenance, format: meta.format, width: meta.width, height: meta.height });
    } catch { errors.push(`Missing, unsafe or unreadable image: ${source.originalSrc || source.src}`); }
  }
  if (!files.length) errors.push('No associated images available');
  const webp = files.filter(file => file.format === 'webp').length;
  if (webp) warnings.push(`${webp} document(s) are available WebP website assets. Original uploads are not documented; no original-quality claim is made.`);
  return { files, errors, warnings };
}

// Standard uncompressed ZIP32. The source bytes are stored unchanged; no image
// conversion is involved. Each part is an independent, valid ZIP archive.
const CRC_TABLE = Array.from({ length: 256 }, (_, value) => {
  for (let i = 0; i < 8; i++) value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
  return value >>> 0;
});
function crc32(bytes) { let crc = 0xffffffff; for (const value of bytes) crc = CRC_TABLE[(crc ^ value) & 255] ^ (crc >>> 8); return (crc ^ 0xffffffff) >>> 0; }
export function zipBytes(entries) {
  const local = [], central = []; let offset = 0;
  for (const entry of entries) {
    const name = Buffer.from(entry.name), bytes = entry.bytes, crc = crc32(bytes);
    const header = Buffer.alloc(30);
    header.writeUInt32LE(0x04034b50); header.writeUInt16LE(20, 4); header.writeUInt16LE(0x800, 6); header.writeUInt32LE(crc, 14);
    header.writeUInt16LE(33, 12); // 1 January 1980 in DOS date format.
    header.writeUInt32LE(bytes.length, 18); header.writeUInt32LE(bytes.length, 22); header.writeUInt16LE(name.length, 26);
    const directory = Buffer.alloc(46);
    directory.writeUInt32LE(0x02014b50); directory.writeUInt16LE(20, 4); directory.writeUInt16LE(20, 6); directory.writeUInt16LE(0x800, 8);
    directory.writeUInt16LE(33, 14);
    directory.writeUInt32LE(crc, 16); directory.writeUInt32LE(bytes.length, 20); directory.writeUInt32LE(bytes.length, 24); directory.writeUInt16LE(name.length, 28); directory.writeUInt32LE(offset, 42);
    local.push(header, name, bytes); central.push(directory, name); offset += header.length + name.length + bytes.length;
  }
  const directory = Buffer.concat(central), end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50); end.writeUInt16LE(entries.length, 8); end.writeUInt16LE(entries.length, 10); end.writeUInt32LE(directory.length, 12); end.writeUInt32LE(offset, 16);
  return Buffer.concat([...local, directory, end]);
}

export function archiveParts(files, limit = UPLOAD_LIMIT) {
  const parts = []; let part = [], size = 22;
  for (const file of files) {
    const name = `${String(file.index).padStart(3, '0')}/${file.filename}`;
    const needed = file.bytes + 76 + 2 * Buffer.byteLength(name);
    if (needed + 22 >= limit) throw new Error('An image cannot fit in a ZIP part below the upload limit');
    if (size + needed >= limit || part.length === 65535) { parts.push(part); part = []; size = 22; }
    part.push({ ...file, archiveName: name }); size += needed;
  }
  if (part.length) parts.push(part);
  return parts;
}

export async function buildPackage(item, { root, output, includeZip = true }) {
  const validation = contentCaption(item), images = await inventory(item, root);
  validation.errors.push(...images.errors); validation.warnings.push(...images.warnings);
  const id = `${item.type}:${item.slug}`;
  const semantic = { format: 1, id, caption: validation.caption, description: item.description, year: item.year, medium: item.medium, dimensions: item.dimensions, publicUrl: validation.publicUrl, galleryCaptions: (item.images || []).map(image => image.caption || ''), images: images.files.map(({ selected, sha256, cover }) => ({ selected, sha256, cover })) };
  const revisionHash = fingerprint(semantic);
  const directory = path.resolve(output, item.type, item.slug, revisionHash.slice(0, 12));
  await mkdir(path.join(directory, 'previews'), { recursive: true });
  const captionPath = path.join(directory, `${item.slug}-caption.txt`);
  await writeFile(captionPath, validation.caption, 'utf8');
  const steps = [{ method: 'sendMessage', text: validation.caption }, { method: 'sendDocument', files: [{ path: captionPath, filename: path.basename(captionPath) }] }];
  for (const batch of groups(images.files)) steps.push({ method: batch.length === 1 ? 'sendDocument' : 'sendMediaGroup', mediaType: 'document', files: batch });
  const previews = [];
  for (const file of images.files.slice(0, 10)) {
    try {
      const target = path.join(directory, 'previews', `${String(file.index).padStart(3, '0')}-${path.parse(file.filename).name}.jpg`);
      const ratio = file.width / file.height;
      await sharp(await readFile(file.path)).rotate().resize({ width: 1280, height: 1280, fit: ratio > 20 || ratio < 0.05 ? 'contain' : 'inside', withoutEnlargement: true, background: '#ffffff' }).flatten({ background: '#ffffff' }).jpeg({ quality: 85 }).toFile(target);
      previews.push({ path: target, filename: path.basename(target) });
    } catch { validation.errors.push(`Could not produce photo preview for ${file.selected}`); }
  }
  if (previews.length) steps.push({ method: previews.length === 1 ? 'sendPhoto' : 'sendMediaGroup', mediaType: 'photo', files: previews });
  validation.warnings.push('Preview JPEGs are lossy display copies; the document files remain unchanged.');
  if (includeZip && images.files.length && !images.errors.length) {
    for (const [index, part] of archiveParts(images.files).entries()) {
      const target = path.join(directory, `${item.slug}-images-part-${String(index + 1).padStart(2, '0')}.zip`);
      await writeFile(target, zipBytes(await Promise.all(part.map(async file => ({ name: file.archiveName, bytes: await readFile(file.path) })))));
      steps.push({ method: 'sendDocument', files: [{ path: target, filename: path.basename(target) }] });
    }
  }
  const admin = [validation.publicUrl, `Content: ${id}`, `Revision: ${item.social?.revision ?? 'missing'} / ${revisionHash}`, `Images: ${images.files.length} unique document files; ${item.images?.length || 0} gallery entries; cover included first.`, item.type === 'artwork' ? `Year: ${item.year || 'unknown'}; Medium: ${item.medium || 'unknown'}; Dimensions: ${item.dimensions || 'unknown'}` : '', ...validation.warnings.map(warning => `Warning: ${warning}`), ...validation.errors.map(error => `REVIEW: ${error}`)].filter(Boolean).join('\n');
  for (let start = 0; start < admin.length; start += 3500) steps.push({ method: 'sendMessage', text: admin.slice(start, start + 3500), administrative: true });
  const report = { id, revision: item.social?.revision, revisionHash, status: item.social?.status ?? 'unmanaged', ready: validation.errors.length === 0, ...validation, images: images.files, steps };
  await writeFile(path.join(directory, 'payload.json'), JSON.stringify(report, null, 2), 'utf8');
  await writeFile(path.join(directory, 'image-inventory.tsv'), ['Order\tFilename\tBytes\tSource\tSHA256', ...images.files.map(file => `${file.index}\t${file.filename}\t${file.bytes}\t${file.selected}\t${file.sha256}`)].join('\n'), 'utf8');
  return { ...report, directory };
}
