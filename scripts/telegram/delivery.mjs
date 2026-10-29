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

export { TelegramClient } from './telegram-client.mjs';

function receiptsFor(result) {
  return (Array.isArray(result) ? result : [result]).map(message => ({ messageId: message.message_id, kind: message.document ? 'document' : message.photo ? 'photo' : message.text ? 'text' : 'unknown', filename: message.document?.file_name, bytes: message.document?.file_size, textHash: message.text ? hash(message.text) : undefined }));
}

export async function deliver(pack, { client, ledger, resendId, resumeOnly = false, deploymentSha, sleep = pause }) {
  if (!pack.ready || pack.status !== 'published') throw new Error('Validation or publication status blocks live delivery');
  const destination = hash(client.chatId);
  if (!resendId && [...ledger.records.values()].some(record => record.id === pack.id && record.revisionHash === pack.revisionHash && record.destination === destination && record.complete)) return { skipped: 'duplicate' };
  const key = fingerprint({ id: pack.id, revisionHash: pack.revisionHash, destination, resendId: resendId || 'automatic' });
  if (resumeOnly && !ledger.records.has(key)) throw new Error('No matching resume checkpoint exists; refusing to start a new delivery.');
  const planHash = fingerprint(pack.steps.map(step => ({ method: step.method, text: step.text, mediaType: step.mediaType, files: step.files?.map(file => file.filename) })));
  const record = ledger.records.get(key) || { key, id: pack.id, revisionHash: pack.revisionHash, revision: pack.revision, destination, deploymentSha, planHash, steps: {} };
  if (record.complete) return { skipped: 'duplicate' };
  if (record.planHash !== planHash) throw new Error('Partially delivered payload changed; review before resending');
  await client.verifyPrivateChat();
  async function individualFiles(step, index) {
    const progress = record.steps[index];
    progress.transport = 'individual-files'; progress.parts ||= {};
    await ledger.put(record);
    for (const [fileIndex, file] of step.files.entries()) {
      const part = progress.parts[fileIndex];
      if (part?.status === 'complete') continue;
      if (['in-flight', 'uncertain'].includes(part?.status)) throw new Error(`File ${fileIndex + 1} has an uncertain outcome; refusing a duplicate.`);
      progress.parts[fileIndex] = { status: 'in-flight' }; await ledger.put(record);
      let result;
      try { result = await client.request(step.mediaType === 'photo' ? 'sendPhoto' : 'sendDocument', {}, [file], step.mediaType); }
      catch (error) { progress.parts[fileIndex].status = error.ambiguous === false ? 'failed' : 'uncertain'; await ledger.put(record); throw error; }
      progress.parts[fileIndex] = { status: 'complete', receipts: receiptsFor(result) };
      progress.receipts = Object.values(progress.parts).flatMap(part => part.receipts || []);
      progress.messageIds = progress.receipts.map(receipt => receipt.messageId);
      await ledger.put(record);
      console.log(`Telegram step ${index + 1}: file ${fileIndex + 1}/${step.files.length} acknowledged.`);
      await sleep(1200);
    }
    return progress.receipts;
  }
  for (const [index, step] of pack.steps.entries()) {
    const previous = record.steps[index];
    if (previous?.status === 'complete') { console.log(`Telegram step ${index + 1}/${pack.steps.length} already confirmed; skipped.`); continue; }
    if (previous?.status === 'in-flight' || previous?.status === 'uncertain') throw new Error(`Step ${index + 1} may already have been delivered. Review Telegram before an explicit manual resend.`);
    record.steps[index] = { ...previous, status: 'in-flight', started: new Date().toISOString() };
    await ledger.put(record);
    let receipts;
    try {
      if (previous?.transport === 'individual-files') receipts = await individualFiles(step, index);
      else {
        try { receipts = receiptsFor(await client.request(step.method, step.text === undefined ? {} : { text: step.text }, step.files || [], step.mediaType)); }
        catch (error) {
          // A definite attachment-resolution rejection delivered no album.
          // Preserve source bytes/order and journal every individual file.
          if (step.method !== 'sendMediaGroup' || error.ambiguous !== false || !/\(400\).*Wrong file identifier\/HTTP URL/i.test(error.message)) throw error;
          console.log(`Telegram step ${index + 1}: album attachment rejected; using individually checkpointed files.`);
          receipts = await individualFiles(step, index);
        }
      }
    }
    catch (error) {
      record.steps[index].status = error.ambiguous === false ? 'failed' : 'uncertain';
      await ledger.put(record); throw error;
    }
    record.steps[index] = { ...record.steps[index], status: 'complete', messageIds: receipts.map(receipt => receipt.messageId), receipts, completed: new Date().toISOString() };
    await ledger.put(record);
    console.log(`Telegram step ${index + 1}/${pack.steps.length} acknowledged (${receipts.length} message(s)).`);
    await sleep(1200);
  }
  record.complete = true; record.completed = new Date().toISOString(); await ledger.put(record);
  return { delivered: true };
}
