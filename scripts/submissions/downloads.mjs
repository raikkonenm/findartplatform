import https from 'node:https';
import dns from 'node:dns/promises';
import { BlockList, isIP } from 'node:net';
import path from 'node:path';

export const LIMITS = { file: 49_000_000, total: 250_000_000, files: 200, links: 30, redirects: 5, html: 2_000_000 };
const blocked = new BlockList();
for (const [network, bits] of [['0.0.0.0',8],['10.0.0.0',8],['100.64.0.0',10],['127.0.0.0',8],['169.254.0.0',16],['172.16.0.0',12],['192.0.0.0',24],['192.0.2.0',24],['192.168.0.0',16],['198.18.0.0',15],['198.51.100.0',24],['203.0.113.0',24],['224.0.0.0',4],['240.0.0.0',4]]) blocked.addSubnet(network, bits, 'ipv4');
const publicV6 = new BlockList(); publicV6.addSubnet('2000::', 3, 'ipv6');
export function publicAddress(address) {
  if (isIP(address) === 4) return !blocked.check(address, 'ipv4');
  return isIP(address) === 6 && publicV6.check(address, 'ipv6') && !address.toLowerCase().startsWith('2001:db8:');
}
const defaults = ['drive.google.com','drive.usercontent.google.com','www.googleapis.com','*.googleusercontent.com','dropbox.com','www.dropbox.com','dl.dropboxusercontent.com','*.dropboxusercontent.com','we.tl','wetransfer.com','www.wetransfer.com','download.wetransfer.com','*.wetransfer.net'];
export function allowedUrl(value, extraHosts = []) {
  let url; try { url = new URL(value); } catch { throw new Error('INVALID_DOWNLOAD_URL'); }
  const host = url.hostname.toLowerCase();
  if (url.protocol !== 'https:' || url.username || url.password || (url.port && url.port !== '443') || isIP(host.replace(/^\[|\]$/g, ''))) throw new Error('UNSAFE_DOWNLOAD_URL');
  const allowed = [...defaults, ...extraHosts].some(pattern => pattern.startsWith('*.') ? host.endsWith(pattern.slice(1)) && host !== pattern.slice(2) : host === pattern);
  if (!allowed) throw new Error('DOWNLOAD_HOST_NOT_ALLOWED');
  return url;
}
export function safeFilename(value, fallback = 'material.bin') {
  const name = path.posix.basename(String(value || fallback).replaceAll('\\', '/')).replace(/[\x00-\x1f<>:"|?*]/g, '_').slice(0, 180);
  return name && !/^\.+$/.test(name) ? name : fallback;
}
export async function secureDownload(value, { extraHosts = [], limit = LIMITS.file, resolve = dns.lookup, request = https.request, headers = {} } = {}) {
  let url = allowedUrl(value, extraHosts);
  for (let redirect = 0; redirect <= LIMITS.redirects; redirect++) {
    let timer;
    const addresses = await Promise.race([resolve(url.hostname, { all: true }), new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('DOWNLOAD_DNS_TIMEOUT')), 5000); })]).finally(() => clearTimeout(timer));
    if (!addresses.length || addresses.some(entry => !publicAddress(entry.address))) throw new Error('DOWNLOAD_PRIVATE_ADDRESS_BLOCKED');
    const address = addresses[0];
    const result = await new Promise((resolveResult, reject) => {
      const req = request(url, { method: 'GET', agent: false, maxHeaderSize: 16384, headers: { 'User-Agent': 'FINDART-Submission-Reader/1.0', ...headers }, lookup: (_host, options, callback) => options.all ? callback(null, [address]) : callback(null, address.address, address.family) }, response => {
        if ([301,302,303,307,308].includes(response.statusCode)) { response.resume(); clearTimeout(deadline); resolveResult({ redirect: response.headers.location }); return; }
        if (response.statusCode !== 200) { response.resume(); clearTimeout(deadline); reject(new Error(`DOWNLOAD_HTTP_${response.statusCode}`)); return; }
        const bodyLimit = /text\/html/i.test(response.headers['content-type'] || '') ? Math.min(limit, LIMITS.html) : limit;
        if (Number(response.headers['content-length']) > bodyLimit) { response.destroy(); req.destroy(); clearTimeout(deadline); reject(new Error('DOWNLOAD_TOO_LARGE')); return; }
        const chunks = []; let size = 0;
        response.on('data', chunk => { size += chunk.length; if (size > bodyLimit) { response.destroy(); req.destroy(); reject(new Error('DOWNLOAD_TOO_LARGE')); } else chunks.push(chunk); });
        response.on('error', () => { clearTimeout(deadline); reject(new Error('DOWNLOAD_BODY_ERROR')); });
        response.on('end', () => { clearTimeout(deadline); resolveResult({ bytes: Buffer.concat(chunks), contentType: String(response.headers['content-type'] || '').split(';')[0], disposition: String(response.headers['content-disposition'] || ''), url: url.href }); });
      });
      const deadline = setTimeout(() => req.destroy(new Error('DOWNLOAD_TIMEOUT')), 20000);
      req.on('error', () => { clearTimeout(deadline); reject(new Error('DOWNLOAD_TRANSPORT_ERROR')); });
      req.end();
    });
    if (!result.redirect) return result;
    if (redirect === LIMITS.redirects) throw new Error('DOWNLOAD_TOO_MANY_REDIRECTS');
    const next = allowedUrl(new URL(result.redirect, url).href, extraHosts);
    if (next.origin !== url.origin) headers = {};
    url = next;
  }
}

export function providedLinks(payload) {
  const values = [payload.originalText || '', ...Object.values(payload.fields || {}), ...(payload.links || [])];
  return [...new Set(values.flatMap(value => [...String(value).matchAll(/https:\/\/[^\s<>"\u201c\u201d]+/g)].map(match => match[0].replace(/[),.;]+$/, ''))))].slice(0, LIMITS.links);
}

export async function resolveProvidedLink(link, { env = {}, download = secureDownload, depth = 0 } = {}) {
  const extraHosts = (env.SUBMISSIONS_DOWNLOAD_HOSTS || '').split(',').map(host => host.trim().toLowerCase()).filter(Boolean);
  let url = allowedUrl(link, extraHosts);
  const folder = url.hostname === 'drive.google.com' && /\/folders\/([a-zA-Z0-9_-]+)/.exec(url.pathname);
  if (folder) {
    if (!env.GOOGLE_DRIVE_API_KEY) throw new Error('DRIVE_FOLDER_API_KEY_REQUIRED');
    if (depth > 2) throw new Error('DRIVE_FOLDER_DEPTH_LIMIT');
    const files = []; let token = '';
    do {
      const query = new URLSearchParams({ q: `'${folder[1]}' in parents and trashed = false`, fields: 'files(id,name,mimeType,size),nextPageToken', pageSize: '100', ...(token ? { pageToken: token } : {}) });
      const response = await download(`https://www.googleapis.com/drive/v3/files?${query}`, { extraHosts, limit: LIMITS.html, headers: { 'X-Goog-Api-Key': env.GOOGLE_DRIVE_API_KEY } });
      const page = JSON.parse(response.bytes.toString());
      for (const file of page.files || []) {
        if (files.length >= LIMITS.files) throw new Error('DRIVE_FOLDER_FILE_LIMIT');
        if (file.mimeType === 'application/vnd.google-apps.folder') files.push(...await resolveProvidedLink(`https://drive.google.com/drive/folders/${file.id}`, { env, download, depth: depth + 1 }));
        else if (/^(image\/(?:jpeg|png|webp|avif|tiff)|application\/(?:pdf|zip|vnd.openxmlformats-officedocument.wordprocessingml.document))$/.test(file.mimeType || '')) files.push({ downloadUrl: `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(file.id)}?alt=media`, filename: file.name, source: link, size: Number(file.size || 0), headers: { 'X-Goog-Api-Key': env.GOOGLE_DRIVE_API_KEY } });
      }
      token = page.nextPageToken || '';
      if (token && files.length >= LIMITS.files) throw new Error('DRIVE_FOLDER_FILE_LIMIT');
    } while (token);
    return files.sort((a, b) => a.filename.localeCompare(b.filename, 'en', { numeric: true }));
  }
  const driveFile = url.hostname === 'drive.google.com' && (/\/file\/d\/([a-zA-Z0-9_-]+)/.exec(url.pathname)?.[1] || url.searchParams.get('id'));
  if (driveFile) url = new URL(`https://drive.google.com/uc?export=download&id=${encodeURIComponent(driveFile)}`);
  if (['dropbox.com','www.dropbox.com'].includes(url.hostname)) url.searchParams.set('dl', '1');
  return [{ downloadUrl: url.href, source: link }];
}
