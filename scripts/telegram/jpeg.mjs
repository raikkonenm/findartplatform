import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

export const JPEG_POLICY = { format: 'jpeg', extension: '.jpg', quality: 95, chromaSubsampling: '4:4:4', resize: false, version: 1 };
const digest = bytes => createHash('sha256').update(bytes).digest('hex');

export async function exportJpegs(sources, directory, limit) {
  const files = [], errors = [], warnings = [];
  for (const source of sources) {
    try {
      const original = await readFile(source.path);
      if (digest(original) !== source.sha256) throw new Error('Source changed during export');
      const converted = source.format !== 'jpeg';
      // Existing JPEGs stay byte-for-byte intact, including their EXIF. Other
      // photo formats are oriented, flattened on white and encoded as sRGB JPEG.
      // No resize is applied. Indexed directories prevent basename collisions.
      const bytes = converted
        ? await sharp(original).rotate().flatten({ background: '#ffffff' }).toColourspace('srgb').jpeg({ quality: JPEG_POLICY.quality, chromaSubsampling: JPEG_POLICY.chromaSubsampling, progressive: false }).toBuffer()
        : original;
      const metadata = await sharp(bytes).metadata();
      if (metadata.format !== 'jpeg') throw new Error('Output is not a valid JPEG');
      if (bytes.length > limit) throw new Error('JPEG exceeds the document upload limit; no resizing or quality reduction was applied');
      const folder = path.join(directory, 'documents', String(source.index).padStart(3, '0'));
      const filename = path.parse(source.filename).name + '.jpg';
      await mkdir(folder, { recursive: true });
      const target = path.join(folder, filename);
      await writeFile(target, bytes);
      files.push({ ...source, sourcePath: source.path, sourceFilename: source.filename, sourceBytes: source.bytes, sourceSha256: source.sha256, sourceFormat: source.format, sourceWidth: source.width, sourceHeight: source.height, sourceOrientation: source.orientation, path: target, filename, bytes: bytes.length, sha256: digest(bytes), format: 'jpeg', width: metadata.width, height: metadata.height, orientation: metadata.orientation, converted, jpegQuality: converted ? JPEG_POLICY.quality : null });
    } catch (error) { errors.push(`JPEG export failed for ${source.selected}: ${error.message}`); }
  }
  const converted = files.filter(file => file.converted).length;
  if (converted) warnings.push(`${converted} image(s) converted to JPEG quality 95 at full resolution. Conversion does not restore detail absent from the available source assets.`);
  return { files, errors, warnings };
}
