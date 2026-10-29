import { mkdir, readFile, writeFile, rename, rmdir } from 'node:fs/promises';
import path from 'node:path';
import { hash, fingerprint } from './package.mjs';

const MARKER = '<!-- findart-telegram:v1 -->\n';
export const pause = ms => new Promise(resolve => setTimeout(resolve, ms));

export async function githubRequest(route, { token, method = 'GET', body, fetchImpl = fetch } = {}) {
  let response;
  try { response = await fetchImpl(`https://api.github.com${route}`, { method, headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined, signal: AbortSignal.timeout(60_000) }); }
  catch { throw new Error(`GitHub ${method} request did not complete; check the run before retrying.`); }
  if (!response.ok) throw new Error(`GitHub request failed with HTTP ${response.status}`);
  return response.status === 204 ? null : response.json();
}

export class FileLedger {
  constructor(directory) { this.directory = directory; this.records = new Map(); }
  async load() {
    await mkdir(this.directory, { recursive: true });
    await mkdir(path.join(this.directory, 'lock')); // Fail closed if another process owns it.
    this.locked = true;
    try { const data = JSON.parse(await readFile(path.join(this.directory, 'state.json'), 'utf8')); this.records = new Map(data.map(record => [record.key, record])); }
    catch (error) { if (error.code !== 'ENOENT') throw error; }
  }
  async put(record) {
    this.records.set(record.key, record);
    const target = path.join(this.directory, 'state.json');
    await writeFile(target + '.tmp', JSON.stringify([...this.records.values()], null, 2));
    await rename(target + '.tmp', target);
  }
  async close() { if (this.locked) { await rmdir(path.join(this.directory, 'lock')); this.locked = false; } }
}

// One checkpoint comment per content revision. Unlike Actions caches/artifacts,
// this ledger has no automatic retention expiry and does not trigger deployment.
export class GitHubLedger {
  constructor({ repository, issue, token }) {
    if (!/^[\w.-]+\/[\w.-]+$/.test(repository || '') || !/^\d+$/.test(issue || '') || !token) throw new Error('Configure GITHUB_REPOSITORY, TELEGRAM_STATE_ISSUE and GITHUB_TOKEN');
    this.repository = repository; this.issue = issue; this.token = token;
    this.records = new Map(); this.comments = new Map();
  }
  request(route, options = {}) { return githubRequest(`/repos/${this.repository}${route}`, { token: this.token, ...options }); }
  async load() {
    const issue = await this.request(`/issues/${this.issue}`);
    if (issue.pull_request) throw new Error('The delivery ledger must be an issue, not a pull request');
    for (let page = 1; ; page++) {
      const comments = await this.request(`/issues/${this.issue}/comments?per_page=100&page=${page}`);
      for (const comment of comments) {
        if (comment.user?.login !== 'github-actions[bot]' || !comment.body?.startsWith(MARKER)) continue;
        const record = JSON.parse(comment.body.slice(MARKER.length));
        if (this.records.has(record.key)) throw new Error('Duplicate checkpoint records found; review the ledger before sending');
        this.records.set(record.key, record); this.comments.set(record.key, comment.id);
      }
      if (comments.length < 100) break;
    }
  }
  async put(record) {
    const id = this.comments.get(record.key);
    const body = MARKER + JSON.stringify(record);
    if (body.length > 60_000) throw new Error('Checkpoint exceeds the safe issue-comment size');
    const result = await this.request(id ? `/issues/comments/${id}` : `/issues/${this.issue}/comments`, { method: id ? 'PATCH' : 'POST', body: { body } });
    this.comments.set(record.key, result.id); this.records.set(record.key, record);
  }
  async close() {}
}

export class TelegramClient {
  constructor({ token, chatId, expectedUsername, fetchImpl = fetch, sleep = pause, attempts = 5 }) {
    if (!token || !/^[1-9]\d*$/.test(chatId || '')) throw new Error('TELEGRAM_BOT_TOKEN and a numeric private TELEGRAM_CHAT_ID are required');
    this.token = token; this.chatId = String(chatId); this.fetch = fetchImpl; this.sleep = sleep; this.attempts = attempts;
    this.expectedUsername = expectedUsername;
  }
  async request(method, fields = {}, files = [], mediaType) {
    for (let attempt = 0; attempt < this.attempts; attempt++) {
      const form = new FormData(); if (method !== 'getMe') form.set('chat_id', this.chatId);
      for (const [key, value] of Object.entries(fields)) form.set(key, typeof value === 'string' ? value : JSON.stringify(value));
      if (method === 'sendMessage') form.set('link_preview_options', JSON.stringify({ is_disabled: true }));
      if (method === 'sendMediaGroup') {
        form.set('media', JSON.stringify(files.map((file, index) => ({ type: mediaType, media: `attach://file${index}`, ...(mediaType === 'document' ? { disable_content_type_detection: true } : {}) }))));
      }
      for (const [index, file] of files.entries()) {
        const key = method === 'sendMediaGroup' ? `file${index}` : method === 'sendPhoto' ? 'photo' : 'document';
        form.set(key, new Blob([await readFile(file.path)], { type: mediaType === 'photo' || method === 'sendPhoto' ? 'image/jpeg' : 'application/octet-stream' }), file.filename);
      }
      if (method === 'sendDocument') form.set('disable_content_type_detection', 'true');
      let response, result;
      try {
        response = await this.fetch(`https://api.telegram.org/bot${this.token}/${method}`, { method: 'POST', body: form, signal: AbortSignal.timeout(120_000) });
        result = await response.json();
      } catch {
        if (['getChat', 'getMe'].includes(method) && attempt + 1 < this.attempts) { await this.sleep(2 ** attempt * 1000); continue; }
        const error = new Error(`Telegram ${method} has an unknown outcome; automatic resend is stopped.`);
        error.ambiguous = !['getChat', 'getMe'].includes(method); throw error;
      }
      if (response.ok && result.ok) return result.result;
      const code = result.error_code || response.status;
      // Only explicit API rejections are safe to retry. Lost responses may
      // already have delivered a message and must not be blindly repeated.
      if (result.ok === false && (code === 429 || code >= 500) && attempt + 1 < this.attempts) {
        await this.sleep(Math.max(1, result.parameters?.retry_after || 2 ** attempt) * 1000); continue;
      }
      const error = new Error(`Telegram ${method} rejected the request (${code}).`);
      error.ambiguous = result.ok !== false; throw error;
    }
  }
  async verifyPrivateChat() {
    if (this.expectedUsername) {
      const bot = await this.request('getMe');
      if (bot.username?.toLowerCase() !== this.expectedUsername.replace(/^@/, '').toLowerCase()) throw new Error('Telegram token belongs to a different bot; refusing delivery');
    }
    const chat = await this.request('getChat');
    if (chat.type !== 'private' || String(chat.id) !== this.chatId) throw new Error('Configured destination is not the exact private chat; refusing delivery');
  }
}

export async function deliver(pack, { client, ledger, resendId, deploymentSha, sleep = pause }) {
  if (!pack.ready || pack.status !== 'published') throw new Error('Validation or publication status blocks live delivery');
  const destination = hash(client.chatId);
  if (!resendId && [...ledger.records.values()].some(record => record.id === pack.id && record.revisionHash === pack.revisionHash && record.destination === destination && record.complete)) return { skipped: 'duplicate' };
  const key = fingerprint({ id: pack.id, revisionHash: pack.revisionHash, destination, resendId: resendId || 'automatic' });
  const planHash = fingerprint(pack.steps.map(step => ({ method: step.method, text: step.text, mediaType: step.mediaType, files: step.files?.map(file => file.filename) })));
  const record = ledger.records.get(key) || { key, id: pack.id, revisionHash: pack.revisionHash, revision: pack.revision, destination, deploymentSha, planHash, steps: {} };
  if (record.complete) return { skipped: 'duplicate' };
  if (record.planHash !== planHash) throw new Error('Partially delivered payload changed; review before resending');
  await client.verifyPrivateChat();
  for (const [index, step] of pack.steps.entries()) {
    const previous = record.steps[index];
    if (previous?.status === 'complete') continue;
    if (previous?.status === 'in-flight' || previous?.status === 'uncertain') throw new Error(`Step ${index + 1} may already have been delivered. Review Telegram before an explicit manual resend.`);
    record.steps[index] = { status: 'in-flight', started: new Date().toISOString() };
    await ledger.put(record);
    let result;
    try { result = await client.request(step.method, step.text === undefined ? {} : { text: step.text }, step.files || [], step.mediaType); }
    catch (error) {
      record.steps[index].status = error.ambiguous === false ? 'failed' : 'uncertain';
      await ledger.put(record); throw error;
    }
    const messages = Array.isArray(result) ? result : [result];
    record.steps[index] = { status: 'complete', messageIds: messages.map(message => message.message_id), receipts: messages.map(message => ({ messageId: message.message_id, kind: message.document ? 'document' : message.photo ? 'photo' : message.text ? 'text' : 'unknown', filename: message.document?.file_name, bytes: message.document?.file_size, textHash: message.text ? hash(message.text) : undefined })), completed: new Date().toISOString() };
    await ledger.put(record);
    console.log(`Telegram step ${index + 1}/${pack.steps.length} acknowledged (${messages.length} message(s)).`);
    await sleep(1200);
  }
  record.complete = true; record.completed = new Date().toISOString(); await ledger.put(record);
  return { delivered: true };
}
