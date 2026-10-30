import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { hash } from '../telegram/package.mjs';
import { safeFilename, LIMITS } from './downloads.mjs';
import { extractCollected } from './collect.mjs';

export async function cacheSourceFiles(job, directory, materials, store) {
  const root = path.resolve(directory);
  const manifest = JSON.parse(await readFile(path.join(root, 'incoming.json'), 'utf8'));
  const references = [];
  for (const [index, item] of manifest.entries()) {
    const source = path.resolve(item.path);
    if (!source.startsWith(root + path.sep)) throw new Error('SOURCE_CACHE_PATH_ESCAPE');
    const bytes = await readFile(source);
    if (bytes.length > LIMITS.file) throw new Error('SOURCE_CACHE_FILE_LIMIT');
    const digest = hash(bytes), extension = /^\.[a-z0-9]{1,8}$/i.test(path.extname(item.filename)) ? path.extname(item.filename).toLowerCase() : '.bin';
    const objectKey = `${job.id}/source/${index}-${digest}${extension}`;
    await store.putObject(objectKey, bytes);
    references.push({ objectKey, filename: safeFilename(item.filename), source: item.source, inline: Boolean(item.inline), bytes: bytes.length, sha256: digest });
  }
  job.progress.sourceFiles = references;
  job.progress.sourceDownloadWarnings = materials.downloadWarnings || [];
  await store.save(job, 'pending');
}

export async function restoreSourceFiles(job, directory, env, store) {
  const manifest = [];
  for (const [index, reference] of job.progress.sourceFiles.entries()) {
    const bytes = await store.getObject(reference.objectKey);
    if (bytes.length !== reference.bytes || hash(bytes) !== reference.sha256) throw new Error('SOURCE_CACHE_INTEGRITY_FAILED');
    const folder = path.join(directory, 'incoming', String(index+1).padStart(3,'0'));
    await mkdir(folder, { recursive: true });
    const target = path.join(folder, safeFilename(reference.filename)); await writeFile(target, bytes);
    manifest.push({ path: target, filename: reference.filename, source: reference.source, inline: reference.inline });
  }
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, 'incoming.json'), JSON.stringify(manifest));
  return extractCollected(directory, env, job.progress.sourceDownloadWarnings || []);
}
