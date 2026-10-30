// Private queue intake only. This script has no Telegram send capability.
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { PrivateStore } from './submissions/store.mjs';
import { SUBMISSION_TYPES, privateDigest } from './submissions/intake.mjs';

try {
  const args = process.argv.slice(2), file = path.resolve(args[0] || '');
  const root = path.resolve('.submission-delivery') + path.sep;
  if (args.length !== 1 || !file.startsWith(root)) throw new Error('PRIVATE_TEST_INPUT_REQUIRED');
  const payload = JSON.parse(await readFile(file, 'utf8'));
  if (!SUBMISSION_TYPES.includes(payload.type) || !payload.fields || !payload.originalText) throw new Error('INVALID_PRIVATE_TEST_INPUT');
  const fingerprint = privateDigest({ type: payload.type, fields: payload.fields }, process.env.SUBMISSIONS_HMAC_KEY);
  const store = new PrivateStore(process.env);
  const id = await store.enqueue({ sourceKey: 'manual-test:' + fingerprint, fingerprint, payload });
  console.log(JSON.stringify({ privateJobId: id, enqueued: true, sent: 0 }));
} catch { console.error('PRIVATE_SUBMISSION_TEST_ENQUEUE_FAILED'); process.exitCode = 1; }
