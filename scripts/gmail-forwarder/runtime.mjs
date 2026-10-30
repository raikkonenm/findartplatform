// Node-only verification adapter; not deployed to Google or the website.
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

export async function loadForwarder(overrides = {}) {
  class Blob {
    constructor(bytes, mime = 'application/octet-stream', name = 'attachment') { this.bytes = Buffer.from(bytes); this.mime = mime; this.name = name; }
    getBytes() { return [...this.bytes]; }
    getContentType() { return this.mime; }
    getName() { return this.name; }
    setName(name) { this.name = name; return this; }
    setContentType(mime) { this.mime = mime; return this; }
    getDataAsString() { return this.bytes.toString('utf8'); }
    getAs() { throw new Error('Native Google conversion requires the authorized Apps Script runtime'); }
  }
  const values = new Map();
  const properties = { getProperty: key => values.get(key) ?? null, setProperty: (key, value) => { values.set(key,String(value)); return properties; }, deleteProperty: key => values.delete(key), getProperties: () => Object.fromEntries(values) };
  const context = { PropertiesService: { getScriptProperties: () => properties }, Utilities: { newBlob: (bytes,mime,name) => new Blob(bytes,mime,name), base64DecodeWebSafe: text => [...Buffer.from(text, 'base64url')], computeDigest: (_algorithm,text) => [...createHash('sha256').update(text).digest()], DigestAlgorithm: { SHA_256: 'sha256' }, sleep: () => {} }, console: { log: () => {} }, LockService: { getScriptLock: () => ({ tryLock: () => true, releaseLock: () => {} }) }, ...overrides };
  vm.createContext(context);
  vm.runInContext(await readFile(new URL('./Code.gs', import.meta.url), 'utf8'), context, { timeout: 3000 });
  return { api: context, properties, Blob };
}

export function syntheticMessage() {
  const text = 'Name:\nTest Applicant\n\nEmail:\ntest@example.invalid\n\nDownload Link:\nhttps://example.invalid/portfolio\n\nMessage:\nProject Title:\nFINDART forwarding test\n\nSynthetic submission. No real applicant data.';
  return { id: 'synthetic-test', internalDate: String(Date.now()), payload: { mimeType: 'text/plain', headers: [{ name: 'From', value: 'FindArt Platform <submissions@findartplatform.com>' }, { name: 'Subject', value: 'New FindArt Exhibition Submission — Test Applicant' }], body: { data: Buffer.from(text).toString('base64url') } } };
}
