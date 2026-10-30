import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { hash, fingerprint, archiveParts, zipBytes, UPLOAD_LIMIT } from '../telegram/package.mjs';
import { exportJpegs } from '../telegram/jpeg.mjs';
import { collectMaterials } from './collect.mjs';
import { sourceDocuments, analyseSubmission, validateAnalysis } from './ai.mjs';
import { DRAFT, renderDraft } from './render.mjs';

export function textChunks(text, limit = 3800) {
  const chunks = []; let chunk = '';
  for (const char of text) { if (chunk.length + char.length > limit) { chunks.push(chunk); chunk = ''; } chunk += char; }
  if (chunk) chunks.push(chunk);
  return chunks;
}
export async function prepareSubmission(payload, { directory, env, gmail, reviewedAnalysis, collect = collectMaterials, analyse = analyseSubmission, onMaterials } = {}) {
  await mkdir(directory, { recursive: true });
  const materials = await collect(payload, { directory, env, gmail });
  if (onMaterials) await onMaterials(materials);
  const sources = sourceDocuments(payload, materials);
  if (sources.some(source => source.truncated)) materials.warnings.push({ code: 'AI_SOURCE_TEXT_TRUNCATED', source: 'Document size limit; full source remains in original material' });
  const rawAnalysis = reviewedAnalysis || await analyse(sources, payload.type, env);
  const analysis = validateAnalysis(rawAnalysis, sources, payload.type);
  const draft = renderDraft(payload, analysis, materials);
  const originals = [];
  for (const file of materials.images || []) {
    const bytes = await readFile(file.path), metadata = await sharp(bytes, { limitInputPixels: 40_000_000 }).metadata();
    if (metadata.pages > 1 || metadata.width * metadata.height > 40_000_000) throw new Error('SUBMISSION_IMAGE_LIMIT');
    originals.push({ index: originals.length + 1, path: file.path, filename: file.filename, selected: file.source, sha256: hash(bytes), bytes: bytes.length, format: metadata.format, width: metadata.width, height: metadata.height, orientation: metadata.orientation });
  }
  const exported = await exportJpegs(originals, directory, UPLOAD_LIMIT);
  draft.warnings.push(...exported.warnings, ...exported.errors);
  if (exported.errors.length) draft.card += '\n' + exported.errors.map(error => 'REVIEW: ' + error).join('\n');
  const files = [], steps = [];
  const addDocument = (file, kind) => {
    const index = files.length; files.push({ ...file, kind });
    steps.push({ method: 'sendDocument', fileIndex: index, fields: { caption: DRAFT } });
  };
  for (const chunk of textChunks(draft.card)) steps.push({ method: 'sendMessage', fields: { text: chunk.startsWith(DRAFT) ? chunk : DRAFT + '\n\n' + chunk } });
  if (draft.caption) steps.push({ method: 'sendMessage', fields: { text: `${DRAFT}\n\n${draft.caption}` } });
  const captionPath = path.join(directory, 'editorial-caption.txt');
  await writeFile(captionPath, draft.caption, 'utf8'); addDocument({ path: captionPath, filename: 'EDITORIAL-DRAFT-caption.txt' }, 'caption');
  const originalPath = path.join(directory, 'original-submission.txt');
  await writeFile(originalPath, payload.originalText || JSON.stringify(payload.fields || {}, null, 2), 'utf8'); addDocument({ path: originalPath, filename: 'original-submission.txt' }, 'original');
  for (const file of exported.files) addDocument(file, 'image');
  for (const [index, part] of archiveParts(exported.files).entries()) {
    const target = path.join(directory, `submission-images-${String(index + 1).padStart(2, '0')}.zip`);
    await writeFile(target, zipBytes(await Promise.all(part.map(async file => ({ name: file.archiveName, bytes: await readFile(file.path) })))));
    addDocument({ path: target, filename: path.basename(target) }, 'zip');
  }
  for (const file of files) { const bytes = await readFile(file.path); file.bytes = bytes.length; file.sha256 = hash(bytes); }
  const identity = fingerprint({ draft: draft.caption, card: draft.card, files: files.map(file => ({ filename: file.filename, sha256: file.sha256 })), steps });
  const result = { status: 'editorial-draft', approved: false, identity, type: analysis.type, draft, sources, analysis: rawAnalysis, images: exported.files, files, steps };
  await writeFile(path.join(directory, 'draft-package.json'), JSON.stringify(result, null, 2));
  return result;
}

export async function cachePrepared(job, pack, store) {
  const files = [];
  for (const [index, file] of pack.files.entries()) {
    const objectKey = `${job.id}/${pack.identity}/${index}${path.extname(file.filename).toLowerCase()}`;
    await store.putObject(objectKey, await readFile(file.path));
    files.push({ objectKey, filename: file.filename, bytes: file.bytes, sha256: file.sha256, kind: file.kind });
  }
  job.progress.prepared = { status: pack.status, approved: false, identity: pack.identity, type: pack.type, files, steps: pack.steps, warnings: pack.draft.warnings };
  await store.save(job, 'prepared');
  return job.progress.prepared;
}
