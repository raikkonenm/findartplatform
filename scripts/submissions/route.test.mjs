import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import ts from 'typescript';
import { FORM_FIELDS } from './gmail.mjs';

const file = new URL('../../src/app/api/submissions/route.ts', import.meta.url);
const code = ts.transpileModule(await readFile(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const native = createRequire(file), loaded = { exports: {} };
new Function('require','module','exports',code)(name => name === 'next/server' ? { NextResponse: { json: (body, options) => new Response(JSON.stringify(body), { status: options?.status || 200 }) } } : native(name), loaded, loaded.exports);
const { POST } = loaded.exports;
async function configured(overrides, callback) {
  const names = ['RESEND_API_KEY','SUBMISSION_FROM_EMAIL','SUBMISSIONS_CAPTURE_ENABLED','SUBMISSIONS_HMAC_KEY','SUBMISSIONS_SUPABASE_URL','SUBMISSIONS_SUPABASE_SERVICE_ROLE_KEY'];
  const previous = Object.fromEntries(names.map(name => [name, process.env[name]]));
  const original = globalThis.fetch;
  for (const name of names) delete process.env[name];
  Object.assign(process.env, { RESEND_API_KEY: 'synthetic-email-key', SUBMISSION_FROM_EMAIL: 'forms@example.test', ...overrides });
  try { return await callback(); }
  finally { globalThis.fetch = original; for (const name of names) { if (previous[name] === undefined) delete process.env[name]; else process.env[name] = previous[name]; } }
}
const request = body => new Request('https://example.test/api/submissions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

test('all five original form email contracts still succeed with queue capture disabled', async () => {
  await configured({}, async () => {
    let sent = 0;
    globalThis.fetch = async (url, options) => {
      assert.equal(url, 'https://api.resend.com/emails');
      const email = JSON.parse(options.body); assert.equal(email.headers, undefined); assert.ok(!email.text.includes('FINDART-SUBMISSION'));
      assert.equal(email.reply_to, 'applicant@example.test'); sent++;
      return new Response(JSON.stringify({ id: 'synthetic' }), { status: 200 });
    };
    for (const [type, names] of Object.entries(FORM_FIELDS)) {
      const fields = Object.fromEntries(names.map(name => [name, name === 'Email' ? 'applicant@example.test' : 'Provided ' + name]));
      const response = await POST(request({ submissionType: type, ...fields }));
      assert.equal(response.status, 200); assert.deepEqual(await response.json(), { ok: true });
    }
    assert.equal(sent, 5);
  });
});

test('queue outage after successful email does not fail form success or its existing payment redirect', async () => {
  await configured({ SUBMISSIONS_CAPTURE_ENABLED: 'true', SUBMISSIONS_HMAC_KEY: 'x'.repeat(64), SUBMISSIONS_SUPABASE_URL: 'https://private-test.supabase.co', SUBMISSIONS_SUPABASE_SERVICE_ROLE_KEY: 'synthetic-private-key' }, async () => {
    const calls = [], logged = [], originalError = console.error;
    console.error = value => logged.push(value);
    globalThis.fetch = async (url, options) => {
      calls.push(url);
      if (url.includes('resend.com')) { const email = JSON.parse(options.body); assert.ok(email.headers['X-Findart-Submission-ID']); assert.match(email.text, /FINDART-SUBMISSION/); return new Response('{}'); }
      return new Response('{}', { status: 503 });
    };
    try {
      const response = await POST(request({ submissionType: 'exhibition', Name: 'Applicant', Email: 'private@example.test', 'Download Link': 'https://www.dropbox.com/private' }));
      assert.equal(response.status, 200); assert.deepEqual(await response.json(), { ok: true });
      assert.equal(calls.length, 2); assert.deepEqual(logged, ['FINDART_SUBMISSION_CAPTURE_FAILED_EMAIL_FALLBACK']);
      assert.ok(!JSON.stringify(logged).includes('private@example.test'));
    } finally { console.error = originalError; }
  });
});

test('all five forms keep the primary email and enqueue one private copy without Gmail configuration', async () => {
  await configured({ SUBMISSIONS_CAPTURE_ENABLED: 'true', SUBMISSIONS_HMAC_KEY: 'x'.repeat(64), SUBMISSIONS_SUPABASE_URL: 'https://private-test.supabase.co', SUBMISSIONS_SUPABASE_SERVICE_ROLE_KEY: 'synthetic-private-key' }, async () => {
    const deliveries = [], queued = [];
    globalThis.fetch = async (url, options) => {
      const body = JSON.parse(options.body);
      if (url === 'https://api.resend.com/emails') deliveries.push(body);
      else { assert.equal(url, 'https://private-test.supabase.co/rest/v1/rpc/findart_submissions_enqueue'); queued.push(body); }
      return new Response('{}');
    };
    for (const [type, names] of Object.entries(FORM_FIELDS)) {
      const fields = Object.fromEntries(names.map(name => [name, name === 'Email' ? 'applicant@example.test' : 'Provided ' + name]));
      assert.equal((await POST(request({ submissionType: type, ...fields }))).status, 200);
      assert.deepEqual(deliveries.at(-1).to, ['raikkonenmaria7@gmail.com']);
      assert.equal(queued.at(-1).p_payload.type, type);
      assert.deepEqual(queued.at(-1).p_payload.fields, fields);
      assert.equal(queued.at(-1).p_source_key, 'form:' + deliveries.at(-1).headers['X-Findart-Submission-ID']);
    }
    assert.equal(deliveries.length, 5); assert.equal(queued.length, 5);
  });
});

test('failed email and invalid form inputs never enqueue a private job', async () => {
  await configured({ SUBMISSIONS_CAPTURE_ENABLED: 'true', SUBMISSIONS_HMAC_KEY: 'x'.repeat(64) }, async () => {
    const calls = [];
    globalThis.fetch = async url => { calls.push(url); return new Response('{}', { status: 502 }); };
    assert.equal((await POST(request({ submissionType: 'unknown' }))).status, 400);
    assert.equal((await POST(request({ submissionType: 'exhibition', Name: 'Applicant' }))).status, 400);
    assert.equal(calls.length, 0);
    assert.equal((await POST(request({ submissionType: 'exhibition', Name: 'Applicant', Email: 'test@example.test', 'Download Link': 'https://www.dropbox.com/a' }))).status, 502);
    assert.deepEqual(calls, ['https://api.resend.com/emails']);
  });
});
