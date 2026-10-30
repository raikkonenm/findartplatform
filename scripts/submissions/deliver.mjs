import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { hash } from '../telegram/package.mjs';
import { pause } from '../telegram/delivery.mjs';

function receipt(message) {
  return { messageId: message.message_id, kind: message.document ? 'document' : message.text ? 'text' : 'unexpected', filename: message.document?.file_name, bytes: message.document?.file_size, mimeType: message.document?.mime_type, textHash: message.text ? hash(message.text) : undefined };
}
export async function deliverDraft(job, { store, client, directory, sleep = pause }) {
  const pack = job.progress.prepared;
  if (pack?.status !== 'editorial-draft' || pack.approved !== false) throw new Error('DRAFT_PACKAGE_REQUIRED');
  await client.verifyPrivateChat();
  job.progress.delivery ||= { identity: pack.identity, steps: {} };
  const delivery = job.progress.delivery;
  if (delivery.identity !== pack.identity) throw new Error('PARTIAL_DRAFT_CHANGED');
  await mkdir(directory, { recursive: true });
  for (const [index, step] of pack.steps.entries()) {
    const previous = delivery.steps[index];
    if (previous?.status === 'complete') continue;
    if (previous?.status === 'in-flight' || previous?.status === 'uncertain') {
      job.error_code = 'TELEGRAM_UNCERTAIN_REVIEW_REQUIRED'; await store.save(job, 'review'); return { review: true };
    }
    let file;
    if (step.method === 'sendDocument') {
      const expected = pack.files[step.fileIndex], bytes = await store.getObject(expected.objectKey);
      if (bytes.length !== expected.bytes || hash(bytes) !== expected.sha256) throw new Error('PRIVATE_FILE_INTEGRITY_FAILED');
      const target = path.join(directory, `${index}.bin`); await writeFile(target, bytes);
      file = { path: target, filename: expected.filename };
    } else if (step.method !== 'sendMessage') throw new Error('DRAFT_METHOD_NOT_ALLOWED');
    delivery.steps[index] = { status: 'in-flight', attempts: (previous?.attempts || 0) + 1 };
    await store.save(job, 'sending');
    let result;
    try { result = await client.request(step.method, step.fields || {}, file ? [file] : [], file ? 'document' : undefined); }
    catch (error) {
      const definite = error.ambiguous === false;
      delivery.steps[index].status = definite ? 'failed' : 'uncertain';
      job.error_code = definite ? 'TELEGRAM_EXPLICIT_REJECTION' : 'TELEGRAM_UNCERTAIN_REVIEW_REQUIRED';
      const retry = definite && delivery.steps[index].attempts < 3;
      await store.save(job, retry ? 'prepared' : 'review', retry);
      return { review: !retry, retry };
    }
    const confirmed = receipt(result);
    delivery.steps[index] = { ...delivery.steps[index], status: 'complete', receipt: confirmed };
    await store.save(job, 'sending');
    const expected = file ? pack.files[step.fileIndex] : null;
    if (expected ? confirmed.kind !== 'document' || confirmed.filename !== expected.filename || confirmed.bytes !== expected.bytes || (expected.kind === 'image' && confirmed.mimeType !== 'image/jpeg') : confirmed.textHash !== hash(step.fields.text)) {
      job.error_code = 'TELEGRAM_RECEIPT_MISMATCH'; await store.save(job, 'review'); return { review: true };
    }
    await sleep(1200);
  }
  job.progress.delivery.complete = true;
  await store.save(job, 'complete');
  return { complete: true };
}
