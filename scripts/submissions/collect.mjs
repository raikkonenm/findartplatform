import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import path from 'node:path';
import { providedLinks, resolveProvidedLink, secureDownload, safeFilename, LIMITS } from './downloads.mjs';
import { setTimeout as delay } from 'node:timers/promises';

const errorCode = error => /^[A-Z][A-Z0-9_]+$/.test(error.message || '') ? error.message : 'MATERIAL_DOWNLOAD_FAILED';
function responseName(response, fallback) {
  const extended = /filename\*=UTF-8''([^;]+)/i.exec(response.disposition || '');
  if (extended) { try { return safeFilename(decodeURIComponent(extended[1])); } catch { /* Use ordinary filename. */ } }
  const ordinary = /filename="?([^";]+)/i.exec(response.disposition || '')?.[1];
  const extension = { 'application/zip': '.zip', 'application/pdf': '.pdf', 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'text/plain': '.txt' }[response.contentType];
  const name = ordinary || fallback || new URL(response.url).pathname.split('/').at(-1);
  return safeFilename(name && /\.[a-z0-9]{2,5}$/i.test(name) ? name : `material${extension || '.bin'}`);
}
export async function collectMaterials(payload, { directory, env = {}, gmail, download = secureDownload, resolveLink = resolveProvidedLink, extract = true, sleep = delay } = {}) {
  await mkdir(path.join(directory, 'incoming'), { recursive: true });
  const incoming = [], warnings = []; let total = 0;
  const deadline = Date.now() + 180000;
  async function readDownload(url, options) {
    for (let attempt = 0; attempt < 3; attempt++) {
      if (Date.now() > deadline) throw new Error('MATERIAL_COLLECTION_TIME_LIMIT');
      try { return await download(url, options); }
      catch (error) {
        if (attempt === 2 || !/DOWNLOAD_(?:HTTP_(?:429|5\d\d)|TRANSPORT|TIMEOUT|DNS_TIMEOUT|BODY)|ENOTFOUND|ECONNRESET/.test(error.message + ' ' + error.code)) throw error;
        await sleep(2 ** attempt * 1000);
      }
    }
  }
  async function add(bytes, filename, source, inline = false) {
    total += bytes.length;
    if (bytes.length > LIMITS.file || total > LIMITS.total || incoming.length >= LIMITS.files) throw new Error('MATERIAL_SIZE_LIMIT');
    const folder = path.join(directory, 'incoming', String(incoming.length + 1).padStart(3, '0'));
    await mkdir(folder, { recursive: true });
    const target = path.join(folder, safeFilename(filename));
    await writeFile(target, bytes); incoming.push({ path: target, filename: safeFilename(filename), source, inline });
  }
  for (const attachment of payload.attachments || []) {
    try {
      if (attachment.size > LIMITS.file) throw new Error('ATTACHMENT_TOO_LARGE');
      const bytes = attachment.data ? Buffer.from(attachment.data, 'base64url') : gmail ? await gmail.readAttachment(attachment) : null;
      if (!bytes) throw new Error('ATTACHMENT_NOT_ACCESSIBLE');
      await add(bytes, attachment.filename, `Email attachment: ${attachment.filename}`, attachment.inline);
    } catch (error) { warnings.push({ code: errorCode(error), source: `Email attachment: ${attachment.filename}` }); }
  }
  const extraHosts = (env.SUBMISSIONS_DOWNLOAD_HOSTS || '').split(',').map(host => host.trim().toLowerCase()).filter(Boolean);
  for (const link of providedLinks(payload)) {
    try {
      const files = await resolveLink(link, { env, download: readDownload });
      for (const file of files) {
        try {
          if (file.size > LIMITS.file) throw new Error('DOWNLOAD_TOO_LARGE');
          const result = await readDownload(file.downloadUrl, { extraHosts, headers: file.headers || {} });
          if (result.contentType === 'text/html') {
            warnings.push({ code: /we\.tl|wetransfer/.test(new URL(link).hostname) ? 'WETRANSFER_SHARED_PAGE_REQUIRES_ACCESSIBLE_DOWNLOAD' : 'SHARED_PAGE_OR_LOGIN_NOT_A_DOWNLOAD', source: link });
            continue;
          }
          await add(result.bytes, responseName(result, file.filename), file.source || link);
        } catch (error) { warnings.push({ code: errorCode(error), source: file.source || link }); }
      }
    } catch (error) { warnings.push({ code: errorCode(error), source: link }); }
  }
  await writeFile(path.join(directory, 'incoming.json'), JSON.stringify(incoming));
  if (!extract) return { incoming, warnings };
  return extractCollected(directory, env, warnings);
}

export async function extractCollected(directory, env = {}, downloadWarnings = []) {
  const script = path.resolve(import.meta.dirname, 'extract_materials.py');
  await new Promise((resolve, reject) => execFile(env.SUBMISSIONS_PYTHON || 'python', [script, directory], { timeout: 45000, maxBuffer: 16000, windowsHide: true }, error => error ? reject(new Error('MATERIAL_EXTRACTION_PROCESS_FAILED')) : resolve()));
  const extracted = JSON.parse(await readFile(path.join(directory, 'extracted.json'), 'utf8'));
  const incoming = JSON.parse(await readFile(path.join(directory, 'incoming.json'), 'utf8'));
  return { ...extracted, warnings: [...downloadWarnings, ...extracted.warnings], downloadWarnings, incomingCount: incoming.length };
}
