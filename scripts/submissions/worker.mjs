import { randomUUID } from 'node:crypto';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { TelegramClient } from '../telegram/telegram-client.mjs';
import { prepareSubmission, cachePrepared } from './prepare.mjs';
import { deliverDraft } from './deliver.mjs';
import { GmailReader, pollGmail } from './gmail.mjs';
import { PrivateStore } from './store.mjs';

export async function runWorker(env, { store, gmail, client, prepare = prepareSubmission } = {}) {
  // Form capture runs in the existing website handler. Gmail is an optional,
  // independent source; direct website submissions require no mailbox access.
  if (env.GMAIL_SUBMISSIONS_ENABLED !== 'true' && env.TELEGRAM_SUBMISSIONS_ENABLED !== 'true') return { disabled: true };
  if (env.GITHUB_ACTIONS !== 'true') throw new Error('SUBMISSIONS_LIVE_REQUIRES_CLOUD_WORKFLOW');
  store ||= new PrivateStore(env); gmail ||= new GmailReader(env);
  const counts = { accepted: 0, completed: 0, review: 0, retry: 0 };
  if (env.GMAIL_SUBMISSIONS_ENABLED === 'true') {
    try { counts.accepted = (await pollGmail({ reader: gmail, store, env })).accepted; }
    catch { counts.gmailReviewRequired = true; await store.putCursor('gmail-error', { code: 'GMAIL_REVIEW_REQUIRED', at: new Date().toISOString() }); }
  }
  if (env.TELEGRAM_SUBMISSIONS_ENABLED !== 'true') return counts;
  client ||= new TelegramClient({ token: env.TELEGRAM_BOT_TOKEN, chatId: env.TELEGRAM_CHAT_ID, expectedUsername: 'FINDART_content_bot' });
  const owner = randomUUID();
  for (let index = 0; index < 2; index++) {
    const job = await store.claim(owner);
    if (!job) break;
    const directory = await mkdtemp(path.join(tmpdir(), 'findart-private-submission-'));
    try {
      job.progress ||= {};
      if (!job.progress.prepared) {
        const pack = await prepare(job.payload, { directory, env, gmail });
        await cachePrepared(job, pack, store);
      }
      const result = await deliverDraft(job, { store, client, directory: path.join(directory, 'send') });
      if (result.complete) counts.completed++;
      if (result.review) counts.review++;
      if (result.retry) counts.retry++;
    } catch {
      // Full details, source links, email and document contents never enter
      // public logs or Issue #1. Preserve every already-written checkpoint.
      job.error_code = 'SUBMISSION_PROCESSING_REVIEW_REQUIRED';
      await store.save(job, 'review'); counts.review++;
    } finally {
      // Only this mkdtemp-created directory is removed; no applicant/site files.
      await rm(directory, { recursive: true, force: true });
    }
  }
  return counts;
}
