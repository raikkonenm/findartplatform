import { privateDigest, verifiedReceipt } from './intake.mjs';

export const FORM_FIELDS = {
  exhibition: ['Name','Email','Download Link','Message'],
  artist: ['Name','Email','Instagram','Artist Statement / CV','Portfolio / Documentation Link','Website (optional)','Additional Notes (optional)'],
  opportunity: ['Name','Email','Organization','Opportunity Title','Opportunity Type','Deadline','Location','For (audience)','Application Fee','Application Link','Website (optional)','Description'],
  index: ['Name','Email','Website URL','Instagram','Short Description'],
  contribute: ['Name','Email','Contribution Type','Pitch Title','Pitch','Sample / Portfolio Link','Short Bio','Notes (optional)'],
};
const SUBJECTS = [
  [/^New FindArt Exhibition Submission\b/i, 'exhibition'],
  [/^New ArtNomads Artist Submission\b/i, 'artist'],
  [/^New Opportunity Submission\b/i, 'opportunity'],
  [/^New Index Website Submission\b/i, 'index'],
  [/^New Editorial Pitch\b/i, 'contribute'],
];
const decode = value => Buffer.from(value || '', 'base64url');
export function htmlText(html) {
  return html.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, '').replace(/<br\s*\/?\s*>|<\/(?:p|div|li|h[1-6])>/gi, '\n').replace(/<[^>]*>/g, '').replace(/&nbsp;/gi, ' ').replace(/&amp;/gi, '&').replace(/&lt;/gi, '<').replace(/&gt;/gi, '>').replace(/&quot;/gi, '"').replace(/&#39;/g, "'");
}
export function normaliseGmail(message, key) {
  const headers = Object.fromEntries((message.payload?.headers || []).map(header => [header.name.toLowerCase(), header.value]));
  const plain = [], html = [], attachments = [];
  function walk(part) {
    if (part.filename) {
      attachments.push({ filename: part.filename, mimeType: part.mimeType, size: part.body?.size || 0, attachmentId: part.body?.attachmentId, partId: part.partId, data: part.body?.data, messageId: message.id, inline: (part.headers || []).some(header => header.name.toLowerCase() === 'content-disposition' && /^inline/i.test(header.value)) });
    } else if (part.mimeType === 'text/plain' && part.body?.data) plain.push(decode(part.body.data).toString('utf8'));
    else if (part.mimeType === 'text/html' && part.body?.data) html.push(decode(part.body.data).toString('utf8'));
    for (const child of part.parts || []) walk(child);
  }
  walk(message.payload || {});
  const rawText = (plain.length ? plain.join('\n\n') : html.map(htmlText).join('\n\n')).replace(/\r\n/g, '\n');
  const text = rawText.replace(/\n*FINDART-SUBMISSION [^\n]+/g, '').trim();
  const type = SUBJECTS.find(([pattern]) => pattern.test(headers.subject || ''))?.[1] || 'unknown';
  const fields = {};
  if (FORM_FIELDS[type]) {
    const names = FORM_FIELDS[type];
    const starts = names.map(name => ({ name, start: text.indexOf(`${name}:\n`) })).filter(entry => entry.start >= 0).sort((a, b) => a.start - b.start);
    for (const name of names) fields[name] = '';
    for (const [index, entry] of starts.entries()) fields[entry.name] = text.slice(entry.start + entry.name.length + 2, starts[index + 1]?.start ?? text.length).trim();
  } else {
    const from = headers['reply-to'] || headers.from || '';
    fields.Name = from.replace(/<[^>]+>/g, '').replace(/^"|"$/g, '').trim();
    fields.Email = from.match(/[A-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] || '';
    fields.Message = text;
  }
  const receipt = FORM_FIELDS[type] ? verifiedReceipt(rawText, type, fields, key) : null;
  const fingerprint = privateDigest({ type, fields }, key);
  const links = [...new Set([...text.matchAll(/https:\/\/[^\s<>"\u201c\u201d]+/g), ...html.join('\n').matchAll(/https:\/\/[^\s<>"\u201c\u201d]+/g)].map(match => match[0].replace(/[),.;]+$/, '')))];
  return { sourceKey: receipt ? `form:${receipt.id}` : `gmail:${message.id}`, fingerprint, payload: { type, fields, source: 'gmail', gmailMessageId: message.id, subject: headers.subject || '', receivedAt: new Date(Number(message.internalDate || 0)).toISOString(), originalText: text, links, attachments, payment: { status: type === 'contribute' ? 'Not required — free editorial form' : 'Not verified' } } };
}

async function jsonResponse(response, maxBytes = 40_000_000) {
  if (!response.ok) throw new Error(`GMAIL_HTTP_${response.status}`);
  const chunks = []; let total = 0;
  for await (const chunk of response.body) { total += chunk.length; if (total > maxBytes) throw new Error('GMAIL_RESPONSE_TOO_LARGE'); chunks.push(chunk); }
  return JSON.parse(Buffer.concat(chunks).toString());
}
export class GmailReader {
  constructor(env, fetchImpl = fetch) { this.env = env; this.fetch = fetchImpl; }
  async accessToken() {
    if (this.token && this.expires > Date.now()) return this.token;
    const { GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN } = this.env;
    if (!GMAIL_CLIENT_ID || !GMAIL_CLIENT_SECRET || !GMAIL_REFRESH_TOKEN) throw new Error('GMAIL_OAUTH_NOT_CONFIGURED');
    const response = await this.fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ client_id: GMAIL_CLIENT_ID, client_secret: GMAIL_CLIENT_SECRET, refresh_token: GMAIL_REFRESH_TOKEN, grant_type: 'refresh_token' }), signal: AbortSignal.timeout(15000) });
    const data = await jsonResponse(response, 20000);
    if (!data.access_token) throw new Error('GMAIL_OAUTH_TOKEN_MISSING');
    this.token = data.access_token; this.expires = Date.now() + Math.max(30, (data.expires_in || 3600) - 120) * 1000;
    return this.token;
  }
  async get(route) {
    let response;
    try { response = await this.fetch('https://gmail.googleapis.com/gmail/v1/users/me/' + route, { headers: { Authorization: `Bearer ${await this.accessToken()}` }, signal: AbortSignal.timeout(20000) }); }
    catch { throw new Error('GMAIL_TRANSPORT_ERROR'); }
    return jsonResponse(response);
  }
  profile() { return this.get('profile'); }
  list(params) { return this.get('messages?' + new URLSearchParams(params)); }
  message(id) { return this.get(`messages/${encodeURIComponent(id)}?format=full`); }
  async attachment(messageId, id) { return decode((await this.get(`messages/${encodeURIComponent(messageId)}/attachments/${encodeURIComponent(id)}`)).data); }
  async readAttachment(reference) {
    if (reference.attachmentId) return this.attachment(reference.messageId, reference.attachmentId);
    const message = await this.message(reference.messageId), matches = [];
    function walk(part) { if (part.filename === reference.filename && (!reference.partId || part.partId === reference.partId)) matches.push(part); for (const child of part.parts || []) walk(child); }
    walk(message.payload || {});
    if (matches.length !== 1 || !matches[0].body?.data) throw new Error('GMAIL_ATTACHMENT_NOT_ACCESSIBLE');
    return decode(matches[0].body.data);
  }
}

export async function pollGmail({ reader, store, env, now = Date.now() }) {
  const start = Date.parse(env.GMAIL_SUBMISSIONS_START_AFTER || '');
  const query = env.GMAIL_SUBMISSIONS_QUERY;
  if (!Number.isFinite(start) || !query || !/\blabel:\S+/.test(query) || !env.GMAIL_SUBMISSIONS_ADDRESS) throw new Error('GMAIL_FILTER_AND_START_REQUIRED');
  if ((await reader.profile()).emailAddress.toLowerCase() !== env.GMAIL_SUBMISSIONS_ADDRESS.toLowerCase()) throw new Error('GMAIL_WRONG_ACCOUNT');
  const cursor = await store.getCursor('gmail') || {};
  const after = Math.max(Math.floor(start / 1000), (cursor.after || Math.floor(start / 1000)) - 600);
  const before = cursor.before || Math.floor(now / 1000) + 1;
  const params = { q: `(${query}) -in:spam -in:trash after:${after} before:${before}`, maxResults: '25', ...(cursor.pageToken ? { pageToken: cursor.pageToken } : {}) };
  const page = await reader.list(params);
  let accepted = 0;
  for (const entry of page.messages || []) {
    const message = await reader.message(entry.id);
    if (Number(message.internalDate) < start) continue;
    const intake = normaliseGmail(message, env.SUBMISSIONS_HMAC_KEY);
    // Persist references, not large base64 attachment bodies. They are fetched
    // read-only from this exact message/part when the private job is prepared.
    intake.payload.attachments = intake.payload.attachments.map(reference => { const copy = { ...reference }; delete copy.data; return copy; });
    await store.enqueue(intake); accepted++;
  }
  await store.putCursor('gmail', page.nextPageToken ? { after, before, pageToken: page.nextPageToken } : { after: before - 1 });
  return { accepted };
}
