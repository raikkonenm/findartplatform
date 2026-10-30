import { randomUUID } from 'node:crypto';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { TelegramClient } from '../telegram/telegram-client.mjs';
import { prepareSubmission, cachePrepared } from './prepare.mjs';
import { deliverDraft } from './deliver.mjs';
import { GmailReader, pollGmail } from './gmail.mjs';
import { PrivateStore } from './store.mjs';
import { cacheSourceFiles, restoreSourceFiles } from './source-cache.mjs';

export async function runWorker(env, { store, gmail, client, prepare = prepareSubmission, jobId } = {}) {
  // Form capture runs in the existing website handler. Gmail is an optional,
  // independent source; direct website submissions require no mailbox access.
  const manual = jobId !== undefined;
  if (manual && (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(jobId) || env.TELEGRAM_SUBMISSIONS_MANUAL_ENABLED !== 'true')) throw new Error('MANUAL_SUBMISSION_TEST_NOT_AUTHORIZED');
  if (!manual && env.GMAIL_SUBMISSIONS_ENABLED !== 'true' && env.TELEGRAM_SUBMISSIONS_ENABLED !== 'true') return { disabled: true };
  if (env.GITHUB_ACTIONS !== 'true') throw new Error('SUBMISSIONS_LIVE_REQUIRES_CLOUD_WORKFLOW');
  store ||= new PrivateStore(env); gmail ||= new GmailReader(env);
  const counts = { accepted: 0, completed: 0, review: 0, retry: 0 };
  if (!manual && env.GMAIL_SUBMISSIONS_ENABLED === 'true') {
    try { counts.accepted = (await pollGmail({ reader: gmail, store, env })).accepted; }
    catch { counts.gmailReviewRequired = true; await store.putCursor('gmail-error', { code: 'GMAIL_REVIEW_REQUIRED', at: new Date().toISOString() }); }
  }
  if (!manual && env.TELEGRAM_SUBMISSIONS_ENABLED !== 'true') return counts;
  client ||= new TelegramClient({ token: env.TELEGRAM_BOT_TOKEN, chatId: env.TELEGRAM_CHAT_ID, expectedUsername: 'FINDART_content_bot' });
  const owner = randomUUID();
  for (let index = 0; index < (manual ? 1 : 2); index++) {
    const job = await store.claim(owner, manual ? jobId : undefined);
    if (!job) break;
    const directory = await mkdtemp(path.join(tmpdir(), 'findart-private-submission-'));
    try {
      job.progress ||= {};
      if (!job.progress.prepared) {
        job.progress.preparationAttempts = (job.progress.preparationAttempts || 0) + 1;
        await store.save(job, 'pending');
        const pack = await prepare(job.payload, { directory, env, gmail,
          collect: job.progress.sourceFiles ? () => restoreSourceFiles(job, directory, env, store) : undefined,
          onMaterials: async materials => { if (!job.progress.sourceFiles) await cacheSourceFiles(job, directory, materials, store); },
        });
        await cachePrepared(job, pack, store);
      }
      const result = await deliverDraft(job, { store, client, directory: path.join(directory, 'send') });
      if (result.complete) counts.completed++;
      if (result.review) counts.review++;
      if (result.retry) counts.retry++;
    } catch (error) {
      // Full details, source links, email and document contents never enter
      // public logs or Issue #1. Preserve every already-written checkpoint.
      const uncertain = Object.values(job.progress.delivery?.steps || {}).some(step => ['in-flight','uncertain'].includes(step.status));
      if (!job.progress.prepared && !uncertain && job.progress.preparationAttempts < 3 && /^(?:SUBMISSIONS_AI_(?:TRANSPORT_ERROR|HTTP_(?:429|5\d\d))|PRIVATE_STORAGE_(?:TRANSPORT_ERROR|HTTP_(?:429|5\d\d)))$/.test(error.message || '')) {
        job.error_code = 'SUBMISSION_PREPARATION_RETRY'; await store.save(job, 'pending', true); counts.retry++; break;
      }
      job.error_code = /^(?:SUBMISSIONS_|PRIVATE_STORAGE_|SOURCE_CACHE_|MATERIAL_|TELEGRAM_|SEPARATE_)[A-Z0-9_]{1,100}$/.test(error.message || '') ? error.message : 'SUBMISSION_PROCESSING_REVIEW_REQUIRED';
      await store.save(job, 'review'); counts.review++;
    } finally {
      // Only this mkdtemp-created directory is removed; no applicant/site files.
      if (!path.resolve(directory).startsWith(path.resolve(tmpdir()) + path.sep + 'findart-private-submission-')) throw new Error('UNSAFE_WORKER_TEMP_PATH');
      await rm(directory, { recursive: true, force: true });
    }
  }
  if (manual) counts.test = await store.summary(jobId);
  return counts;
}
