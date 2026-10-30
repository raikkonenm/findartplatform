import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';

export const SUBMISSION_TYPES = ['exhibition', 'artist', 'contribute', 'opportunity', 'index'];
const canonical = value => Array.isArray(value) ? value.map(canonical) : value && typeof value === 'object' ? Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([key, item]) => [key, canonical(item)])) : typeof value === 'string' ? value.replace(/\r\n/g, '\n').trim() : value;
export const privateDigest = (value, key) => {
  if (!key || key.length < 32) throw new Error('SUBMISSIONS_HMAC_KEY_REQUIRED');
  return createHmac('sha256', key).update(JSON.stringify(canonical(value))).digest('hex');
};
export function makeReceipt(type, fields, key, id = randomUUID()) {
  if (!SUBMISSION_TYPES.includes(type)) return null;
  const fingerprint = privateDigest({ type, fields }, key);
  const signature = privateDigest({ id, type, fingerprint }, key);
  return { id, fingerprint, marker: `FINDART-SUBMISSION ${id} ${type} ${fingerprint} ${signature}` };
}
export function verifiedReceipt(text, type, fields, key) {
  const match = /FINDART-SUBMISSION ([0-9a-f-]{36}) (exhibition|artist|contribute|opportunity|index) ([0-9a-f]{64}) ([0-9a-f]{64})/.exec(text);
  if (!match || match[2] !== type) return null;
  const expected = makeReceipt(type, fields, key, match[1]);
  const actual = Buffer.from(match[0]); const wanted = Buffer.from(expected.marker);
  return actual.length === wanted.length && timingSafeEqual(actual, wanted) ? expected : null;
}
export function captureEnabled(env) {
  return env.SUBMISSIONS_CAPTURE_ENABLED === 'true';
}
export async function captureSubmission({ id, type, fields, receivedAt = new Date().toISOString() }, env, fetchImpl = fetch) {
  if (!captureEnabled(env) || !SUBMISSION_TYPES.includes(type)) return { skipped: true };
  const receipt = makeReceipt(type, fields, env.SUBMISSIONS_HMAC_KEY, id);
  const { PrivateStore } = await import('./store.mjs');
  const store = new PrivateStore(env, fetchImpl);
  return store.enqueue({ sourceKey: `form:${receipt.id}`, fingerprint: receipt.fingerprint, payload: { type, fields, source: 'form', receivedAt, submissionId: receipt.id, originalText: Object.entries(fields).map(([key, value]) => `${key}:\n${value}`).join('\n\n'), attachments: [], payment: { status: type === 'contribute' ? 'Not required — free editorial form' : 'Not verified' } } });
}
