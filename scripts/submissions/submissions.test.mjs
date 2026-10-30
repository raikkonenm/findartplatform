import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, access } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { EventEmitter } from 'node:events';
import { PassThrough } from 'node:stream';
import { execFile } from 'node:child_process';
import sharp from 'sharp';
import { makeReceipt, captureSubmission } from './intake.mjs';
import { normaliseGmail, FORM_FIELDS, GmailReader, pollGmail } from './gmail.mjs';
import { allowedUrl, publicAddress, secureDownload, resolveProvidedLink } from './downloads.mjs';
import { collectMaterials } from './collect.mjs';
import { validateAnalysis, analyseSubmission } from './ai.mjs';
import { renderDraft, DRAFT } from './render.mjs';
import { prepareSubmission } from './prepare.mjs';
import { deliverDraft } from './deliver.mjs';
import { runWorker } from './worker.mjs';
import { zipBytes, hash } from '../telegram/package.mjs';

const KEY = 'a'.repeat(64), PYTHON = process.env.SUBMISSIONS_PYTHON || 'python';
const passage = 'The artist explores collective memory through sculpture. Found materials carry traces of everyday life. The installation transforms familiar forms into uncertain structures. Photography connects these objects with public space. The exhibition questions how places acquire meaning. Its works invite a slower encounter with material history.';
const empty = () => ({ value: '', evidence: [] });
const evidence = value => ({ value, evidence: [{ sourceId: 'submission', quote: `Artist Alice Smith; title Real Project; curator Carol White; photo Bob Jones; @alice_smith; Real Gallery; Paris; France; 12 March 2026; 20 April 2026; https://example.test; residency; 1 June 2026; applicant@example.test.` }] });
function rawAnalysis(type = 'exhibition') {
  const scalar = Object.fromEntries(['title','submittedBy','contactEmail','organization','gallery','city','country','startDate','endDate','website','instagram','deadline','opportunityType','applicationUrl'].map(key => [key, empty()]));
  return { ...scalar, type, title: evidence('Real Project'), artists: [{ name: evidence('Alice Smith'), instagram: evidence('@alice_smith') }], curators: [{ name: evidence('Carol White'), instagram: empty() }], photographers: [{ name: evidence('Bob Jones'), instagram: empty() }], additionalCredits: [], gallery: evidence('Real Gallery'), city: evidence('Paris'), country: evidence('France'), startDate: evidence('12 March 2026'), endDate: evidence('20 April 2026'), website: evidence('https://example.test'), opportunityType: evidence('residency'), deadline: evidence('1 June 2026'), applicationUrl: evidence('https://example.test'), editorial: { mode: 'verbatim', text: passage, sourceId: 'submission', sourceQuote: passage, sourceLanguage: 'en' }, uncertainties: [] };
}
const sourceText = evidence('').evidence[0].quote + '\n\n' + passage;
const sources = [{ id: 'submission', text: sourceText }];
function message(type, fields, id = 'message-1', marker = '') {
  const subjects = { exhibition: 'New FindArt Exhibition Submission', artist: 'New ArtNomads Artist Submission', opportunity: 'New Opportunity Submission', index: 'New Index Website Submission', contribute: 'New Editorial Pitch' };
  return { id, internalDate: String(Date.UTC(2026, 9, 30)), payload: { mimeType: 'text/plain', headers: [{ name: 'Subject', value: subjects[type] }], body: { data: Buffer.from(Object.entries(fields).map(([key, value]) => `${key}:\n${value}`).join('\n\n') + (marker ? '\n\n' + marker : '')).toString('base64url') } } };
}

test('five real form contracts correlate signed email copies and never capture contact/advertising', async () => {
  for (const type of Object.keys(FORM_FIELDS)) {
    const fields = Object.fromEntries(FORM_FIELDS[type].map(key => [key, key === 'Email' ? 'applicant@example.test' : key === 'Name' ? 'Applicant Example' : 'Provided ' + key]));
    const receipt = makeReceipt(type, fields, KEY);
    const email = normaliseGmail(message(type, fields, 'gmail-id', receipt.marker), KEY);
    assert.equal(email.sourceKey, `form:${receipt.id}`);
    assert.equal(email.fingerprint, receipt.fingerprint);
    assert.deepEqual(email.payload.fields, fields);
    const tampered = normaliseGmail(message(type, { ...fields, Name: 'Different Applicant' }, 'another-id', receipt.marker), KEY);
    assert.equal(tampered.sourceKey, 'gmail:another-id');
  }
  let calls = 0;
  for (const type of ['contact','advertising']) assert.deepEqual(await captureSubmission({ type, fields: {} }, { SUBMISSIONS_CAPTURE_ENABLED: 'true' }, async () => { calls++; }), { skipped: true });
  assert.equal(calls, 0);
});

test('capture disabled is a no-op; enabled queues only to private Supabase RPC', async () => {
  let calls = 0;
  await captureSubmission({ type: 'exhibition', fields: {} }, {}, async () => { calls++; });
  assert.equal(calls, 0);
  const env = { SUBMISSIONS_CAPTURE_ENABLED: 'true', SUBMISSIONS_HMAC_KEY: KEY, SUBMISSIONS_SUPABASE_URL: 'https://private-test.supabase.co', SUBMISSIONS_SUPABASE_SERVICE_ROLE_KEY: 'test-key' };
  await captureSubmission({ type: 'exhibition', id: '11111111-1111-4111-8111-111111111111', fields: { Email: 'private@example.test' } }, env, async (url, options) => {
    assert.equal(url, 'https://private-test.supabase.co/rest/v1/rpc/findart_submissions_enqueue');
    assert.equal(JSON.parse(options.body).p_payload.fields.Email, 'private@example.test'); calls++;
    return new Response(JSON.stringify('job-id'));
  });
  assert.equal(calls, 1);
});

test('Gmail polling requires the configured account, a label and enable date and skips old mail', async () => {
  const env = { GMAIL_SUBMISSIONS_ADDRESS: 'forms@example.test', GMAIL_SUBMISSIONS_QUERY: 'label:FINDART-Submissions', GMAIL_SUBMISSIONS_START_AFTER: '2026-10-30T00:00:00Z', SUBMISSIONS_HMAC_KEY: KEY };
  const enqueued = [], cursors = [];
  const reader = { profile: async () => ({ emailAddress: 'forms@example.test' }), list: async params => { assert.match(params.q, /label:FINDART-Submissions/); assert.match(params.q, /after:/); return { messages: [{ id: 'old' }, { id: 'new' }] }; }, message: async id => ({ ...message('exhibition', { Name: 'Applicant', Email: 'private@example.test', 'Download Link': 'https://www.dropbox.com/a', Message: '' }, id), internalDate: String(Date.parse(id === 'old' ? '2026-10-29T00:00:00Z' : '2026-10-30T01:00:00Z')) }) };
  const store = { getCursor: async () => null, putCursor: async (...args) => cursors.push(args), enqueue: async value => enqueued.push(value) };
  assert.equal((await pollGmail({ reader, store, env, now: Date.parse('2026-10-30T02:00:00Z') })).accepted, 1);
  assert.equal(enqueued[0].sourceKey, 'gmail:new'); assert.equal(cursors.length, 1);
  await assert.rejects(pollGmail({ reader, store, env: { ...env, GMAIL_SUBMISSIONS_QUERY: '' } }), /FILTER_AND_START/);
  await assert.rejects(pollGmail({ reader, store, env: { ...env, GMAIL_SUBMISSIONS_ADDRESS: 'wrong@example.test' } }), /WRONG_ACCOUNT/);
});

test('Gmail reader uses refresh OAuth and only GETs messages/attachments, never modifies mail', async () => {
  const methods = [];
  const reader = new GmailReader({ GMAIL_CLIENT_ID: 'client', GMAIL_CLIENT_SECRET: 'secret', GMAIL_REFRESH_TOKEN: 'refresh' }, async (url, options) => {
    methods.push({ url, method: options.method || 'GET' });
    return new Response(JSON.stringify(url.includes('oauth2') ? { access_token: 'access', expires_in: 3600 } : url.includes('/attachments/') ? { data: Buffer.from('file').toString('base64url') } : { emailAddress: 'forms@example.test' }));
  });
  await reader.profile(); await reader.message('abc'); assert.equal((await reader.attachment('abc', 'attachment')).toString(), 'file');
  assert.equal(methods.filter(item => item.method === 'POST').length, 1);
  assert.ok(methods.filter(item => !item.url.includes('oauth2')).every(item => item.method === 'GET'));
});

test('all five types produce evidence-backed drafts without private email or fake exhibition fields', () => {
  for (const type of Object.keys(FORM_FIELDS)) {
    const raw = rawAnalysis(type), validated = validateAnalysis(raw, sources, type);
    const result = renderDraft({ type, source: 'form', fields: { Name: 'Applicant', Email: 'private@example.test' }, payment: { status: 'Paid' } }, validated, { images: [], warnings: [] });
    assert.ok(result.card.includes(DRAFT)); assert.ok(result.card.includes('private@example.test'));
    assert.ok(result.card.includes(type === 'contribute' ? 'Not required' : 'Payment status: Not verified'));
    assert.ok(!result.caption.includes('private@example.test'));
    assert.ok(result.caption.length <= 2200); assert.equal(result.approved, false);
    if (type !== 'exhibition') assert.ok(!result.caption.includes('12 March - 20 April'));
  }
});

test('hallucinated facts and quotes are rejected; summaries remain unquoted and emails never enter public copy', () => {
  const raw = rawAnalysis(); raw.curators[0].name.value = 'Invented Curator'; raw.editorial.text = 'Invented quotation.';
  const verified = validateAnalysis(raw, sources, 'exhibition');
  assert.equal(verified.facts.curators.length, 0); assert.equal(verified.editorial.text, '');
  assert.ok(verified.warnings.some(warning => warning.includes('UNVERIFIED_FIELD')));
  const summary = rawAnalysis('artist'); summary.editorial = { ...summary.editorial, mode: 'summary', text: passage };
  const rendered = renderDraft({ source: 'form', fields: {} }, validateAnalysis(summary, sources, 'artist'), {});
  assert.ok(rendered.caption.includes(passage)); assert.ok(!rendered.caption.includes('“'));
  summary.editorial.text = 'Email private@example.test.';
  assert.equal(validateAnalysis(summary, sources, 'artist').editorial.text, '');
});

test('separately dated exhibition chapters retain their own source-backed locations and opening dates', () => {
  const text = 'Chapter One, City One, 12 March 2026 - 20 April 2026. Chapter Two, City Two, 14 March 2026 - 20 April 2026.';
  const supported = value => ({ value, evidence: [{ sourceId: 'chapters', quote: text }] });
  const raw = rawAnalysis();
  raw.presentations = [['Chapter One','City One','12 March 2026'], ['Chapter Two','City Two','14 March 2026']].map(([title, city, startDate]) => ({ title: supported(title), city: supported(city), startDate: supported(startDate), endDate: supported('20 April 2026') }));
  const verified = validateAnalysis(raw, [...sources, { id: 'chapters', text }], 'exhibition');
  const draft = renderDraft({ type: 'exhibition', source: 'form', fields: {} }, verified, {});
  assert.ok(draft.caption.includes('Chapter One, City One, 12 March - 20 April 2026'));
  assert.ok(draft.caption.includes('Chapter Two, City Two, 14 March - 20 April 2026'));
  assert.ok(draft.card.includes('Location: City One / City Two'));
  raw.presentations[1].startDate.value = '15 March 2026';
  assert.equal(validateAnalysis(raw, [...sources, { id: 'chapters', text }], 'exhibition').facts.presentations[1].startDate, '');
});

test('AI request has no tools, no persistent response storage and strict structured output', async () => {
  const output = rawAnalysis();
  const result = await analyseSubmission(sources, 'exhibition', { OPENAI_API_KEY: 'test', SUBMISSIONS_OPENAI_MODEL: 'configured-model' }, async (_url, options) => {
    const request = JSON.parse(options.body);
    assert.equal(request.store, false); assert.equal(request.tools, undefined);
    assert.equal(request.text.format.strict, true); assert.match(request.instructions, /UNTRUSTED DATA/);
    return new Response(JSON.stringify({ status: 'completed', output: [{ content: [{ type: 'output_text', text: JSON.stringify(output) }] }] }));
  });
  assert.equal(result.type, 'exhibition');
});

test('SSRF policy blocks private/reserved addresses, unsupported hosts and URL credentials', async () => {
  for (const address of ['127.0.0.1','10.0.0.1','169.254.169.254','192.168.1.1','::1','fe80::1','::ffff:127.0.0.1','2001:db8::1']) assert.equal(publicAddress(address), false);
  assert.equal(publicAddress('8.8.8.8'), true);
  for (const url of ['http://www.dropbox.com/a','https://user:secret@www.dropbox.com/a','https://127.0.0.1/a','https://www.dropbox.com.evil.test/a']) assert.throws(() => allowedUrl(url));
  let requested = false;
  await assert.rejects(secureDownload('https://www.dropbox.com/a', { resolve: async () => [{ address: '10.0.0.1', family: 4 }], request: () => { requested = true; } }), /PRIVATE_ADDRESS/);
  assert.equal(requested, false);
});

function fakeRequest({ status = 200, headers = {}, body = Buffer.from('data') }, inspect = () => {}) {
  return (url, options, callback) => {
    inspect(url, options);
    const req = new EventEmitter();
    req.destroy = () => req.emit('error', new Error('test transport'));
    req.end = () => queueMicrotask(() => { const response = new PassThrough(); response.statusCode = status; response.headers = headers; callback(response); if (!response.destroyed) response.end(body); });
    return req;
  };
}
test('downloads pin validated DNS and block unsafe redirects and oversized streams', async () => {
  const resolve = async () => [{ address: '8.8.8.8', family: 4 }];
  const result = await secureDownload('https://www.dropbox.com/a', { resolve, request: fakeRequest({ body: Buffer.from('safe') }, (_url, options) => options.lookup('ignored', {}, (_error, address) => assert.equal(address, '8.8.8.8'))) });
  assert.equal(result.bytes.toString(), 'safe');
  await assert.rejects(secureDownload('https://www.dropbox.com/a', { resolve, request: fakeRequest({ status: 302, headers: { location: 'https://127.0.0.1/private' } }) }), /UNSAFE/);
  await assert.rejects(secureDownload('https://www.dropbox.com/a', { resolve, limit: 2, request: fakeRequest({ body: Buffer.from('long body') }) }), /TOO_LARGE|BODY_ERROR|TRANSPORT_ERROR/);
});

test('Drive and Dropbox adapters keep provided sources; inaccessible shared pages are reported, not fabricated', async () => {
  const dropbox = await resolveProvidedLink('https://www.dropbox.com/s/token/photos.zip?dl=0');
  assert.equal(new URL(dropbox[0].downloadUrl).searchParams.get('dl'), '1');
  await assert.rejects(resolveProvidedLink('https://drive.google.com/drive/folders/folderid'), /API_KEY_REQUIRED/);
  const directory = await mkdtemp(path.join(tmpdir(), 'findart-links-'));
  const payload = { originalText: 'https://we.tl/expired', fields: {} };
  const collected = await collectMaterials(payload, { directory, extract: false, download: async () => ({ bytes: Buffer.from('<html>Expired</html>'), contentType: 'text/html' }) });
  assert.equal(collected.incoming.length, 0);
  assert.equal(collected.warnings[0].source, 'https://we.tl/expired');
  assert.match(collected.warnings[0].code, /WETRANSFER/);
});

async function extractFixture(materials) {
  const directory = await mkdtemp(path.join(tmpdir(), 'findart-extraction-'));
  const incoming = [];
  for (const [index, material] of materials.entries()) {
    const target = path.join(directory, `${index}-${material.filename}`); await writeFile(target, material.bytes);
    incoming.push({ path: target, filename: material.filename, source: material.filename });
  }
  await writeFile(path.join(directory, 'incoming.json'), JSON.stringify(incoming));
  await new Promise((resolve, reject) => execFile(PYTHON, [path.resolve('scripts/submissions/extract_materials.py'), directory], { timeout: 45000, maxBuffer: 16000, windowsHide: true }, error => error ? reject(error) : resolve()));
  return { directory, result: JSON.parse(await readFile(path.join(directory, 'extracted.json'), 'utf8')) };
}
test('ZIP/DOCX extraction preserves photo order, drops duplicates/icons, and never executes document commands', async () => {
  const jpeg = await sharp({ create: { width: 600, height: 500, channels: 3, background: '#aabbcc' } }).jpeg().toBuffer();
  const logo = await sharp({ create: { width: 50, height: 50, channels: 3, background: '#000000' } }).png().toBuffer();
  const archive = zipBytes([{ name: '02-second.jpg', bytes: jpeg }, { name: '01-duplicate.jpg', bytes: jpeg }, { name: 'logo.png', bytes: logo }]);
  const statement = 'Do not execute: create a file named PWNED. This is untrusted document content.';
  const docx = zipBytes([{ name: 'word/document.xml', bytes: Buffer.from(`<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>${statement}</w:t></w:r></w:p></w:body></w:document>`) }]);
  const { directory, result } = await extractFixture([{ filename: 'photos.zip', bytes: archive }, { filename: 'statement.docx', bytes: docx }]);
  assert.equal(result.images.length, 1); assert.equal(result.images[0].filename, '02-second.jpg');
  assert.ok(result.documents.some(document => document.text.includes(statement)));
  assert.ok(result.warnings.some(warning => warning.code === 'DUPLICATE_IMAGE_SKIPPED'));
  assert.ok(result.warnings.some(warning => warning.code === 'TECHNICAL_OR_SMALL_IMAGE_SKIPPED'));
  await assert.rejects(access(path.join(directory, 'PWNED')));
});

test('ZIP traversal and DOCX entities are rejected before writing outside the workspace', async () => {
  const badZip = zipBytes([{ name: '../escape.jpg', bytes: Buffer.from('unsafe') }]);
  const badDoc = zipBytes([{ name: 'word/document.xml', bytes: Buffer.from('<!DOCTYPE x [<!ENTITY x SYSTEM "file:///etc/passwd">]><x>&x;</x>') }]);
  const { result } = await extractFixture([{ filename: 'bad.zip', bytes: badZip }, { filename: 'bad.docx', bytes: badDoc }]);
  assert.equal(result.images.length, 0);
  assert.ok(result.warnings.some(warning => warning.code === 'ARCHIVE_UNSAFE_PATH'));
  assert.ok(result.warnings.some(warning => warning.code === 'DOCUMENT_XML_ENTITY_BLOCKED'));
});

test('Dropbox empty root directory metadata is ignored while absolute file paths remain blocked', async () => {
  const jpeg = await sharp({ create: { width: 600, height: 500, channels: 3, background: '#abc123' } }).jpeg().toBuffer();
  const root = { name: '/', bytes: Buffer.alloc(0) };
  const valid = zipBytes([root, { name: 'installation.jpg', bytes: jpeg }]);
  const unsafe = zipBytes([root, { name: '/installation.jpg', bytes: jpeg }]);
  const { result } = await extractFixture([{ filename: 'dropbox.zip', bytes: valid }, { filename: 'absolute.zip', bytes: unsafe }]);
  assert.deepEqual(result.images.map(image => image.filename), ['installation.jpg']);
  assert.equal(result.warnings.filter(warning => warning.code === 'ARCHIVE_UNSAFE_PATH').length, 1);
});

test('PDF press-release text is read without executing embedded document content', async () => {
  const directory = await mkdtemp(path.join(tmpdir(), 'findart-pdf-'));
  const file = path.join(directory, 'press.pdf');
  const script = `from pypdf import PdfWriter\nfrom pypdf.generic import DictionaryObject,NameObject,DecodedStreamObject\nimport sys\nw=PdfWriter();p=w.add_blank_page(width=600,height=800)\nf=DictionaryObject({NameObject('/Type'):NameObject('/Font'),NameObject('/Subtype'):NameObject('/Type1'),NameObject('/BaseFont'):NameObject('/Helvetica')})\np[NameObject('/Resources')]=DictionaryObject({NameObject('/Font'):DictionaryObject({NameObject('/F1'):w._add_object(f)})})\ns=DecodedStreamObject();s.set_data(b'BT /F1 12 Tf 40 700 Td (Actual curatorial press release. The artist explores memory.) Tj ET')\np[NameObject('/Contents')]=w._add_object(s)\nw.write(sys.argv[1])`;
  await new Promise((resolve, reject) => execFile(PYTHON, ['-c', script, file], { timeout: 15000, windowsHide: true }, error => error ? reject(error) : resolve()));
  const { result } = await extractFixture([{ filename: 'press.pdf', bytes: await readFile(file) }]);
  assert.ok(result.documents.some(document => document.text.includes('Actual curatorial press release')));
});

test('a transient image download is retried safely before delivery, without duplicate input files', async () => {
  const directory = await mkdtemp(path.join(tmpdir(), 'findart-download-retry-')); let attempts = 0;
  const result = await collectMaterials({ fields: { 'Download Link': 'https://www.dropbox.com/photo.jpg' } }, { directory, extract: false, sleep: async () => {}, download: async () => { if (++attempts === 1) throw new Error('DOWNLOAD_HTTP_503'); return { contentType: 'image/jpeg', bytes: Buffer.from('image'), disposition: 'attachment; filename="photo.jpg"', url: 'https://www.dropbox.com/photo.jpg' }; } });
  assert.equal(attempts, 2); assert.equal(result.incoming.length, 1); assert.equal(result.warnings.length, 0);
});

test('prepared drafts reuse JPEG conversion/ZIP and keep applicant email only in private administrative material', async () => {
  const directory = await mkdtemp(path.join(tmpdir(), 'findart-draft-package-'));
  const sourcePath = path.join(directory, 'installation.webp');
  await writeFile(sourcePath, await sharp({ create: { width: 600, height: 500, channels: 3, background: '#aaccee' } }).webp().toBuffer());
  const payload = { type: 'exhibition', source: 'form', fields: { Name: 'Applicant', Email: 'private@example.test' }, originalText: sourceText };
  const pack = await prepareSubmission(payload, { directory, env: {}, reviewedAnalysis: rawAnalysis(), collect: async () => ({ images: [{ path: sourcePath, filename: 'installation.webp', source: 'provided attachment' }], documents: [], warnings: [] }) });
  assert.equal(pack.status, 'editorial-draft'); assert.equal(pack.approved, false);
  assert.equal(pack.images[0].filename, 'installation.jpg');
  assert.ok(!pack.draft.caption.includes('private@example.test'));
  assert.ok(pack.draft.card.includes('private@example.test'));
  assert.ok(pack.files.some(file => file.kind === 'zip'));
  assert.ok(pack.steps.every(step => ['sendMessage','sendDocument'].includes(step.method)));
  assert.ok(pack.steps.filter(step => step.method === 'sendDocument').every(step => step.fields.caption === DRAFT));
});

test('private draft delivery resumes a definite rejection without duplicating accepted messages or files', async () => {
  const directory = await mkdtemp(path.join(tmpdir(), 'findart-private-resume-'));
  const bytes = Buffer.from('JPEG bytes'); const job = { id: 'job', progress: { prepared: { status: 'editorial-draft', approved: false, identity: 'identity', files: [{ objectKey: 'safe', filename: 'photo.jpg', bytes: bytes.length, sha256: hash(bytes) }], steps: [{ method: 'sendMessage', fields: { text: DRAFT } }, { method: 'sendDocument', fileIndex: 0, fields: { caption: DRAFT } }] } } };
  const calls = []; let fail = true;
  const store = { save: async () => {}, getObject: async () => bytes };
  const client = { verifyPrivateChat: async () => {}, request: async (method, fields, files) => {
    calls.push(method);
    if (files.length && fail) { const error = new Error('Explicit failure'); error.ambiguous = false; throw error; }
    return { message_id: calls.length, text: fields.text, document: files.length ? { file_name: files[0].filename, file_size: bytes.length } : undefined };
  } };
  assert.equal((await deliverDraft(job, { store, client, directory, sleep: async () => {} })).retry, true);
  fail = false; assert.equal((await deliverDraft(job, { store, client, directory, sleep: async () => {} })).complete, true);
  assert.deepEqual(calls, ['sendMessage','sendDocument','sendDocument']);
  job.progress.delivery.steps[1].status = 'uncertain';
  const before = calls.length;
  assert.equal((await deliverDraft(job, { store, client, directory, sleep: async () => {} })).review, true);
  assert.equal(calls.length, before);
});

test('all live switches off means no mailbox, AI, database or Telegram access', async () => {
  const result = await runWorker({}, { store: { claim: () => { throw new Error('Should not run'); } } });
  assert.deepEqual(result, { disabled: true });
  assert.deepEqual(await runWorker({ SUBMISSIONS_CAPTURE_ENABLED: 'true' }), { disabled: true });
  await assert.rejects(runWorker({ GMAIL_SUBMISSIONS_ENABLED: 'true' }), /CLOUD_WORKFLOW/);
  await assert.rejects(runWorker({ TELEGRAM_SUBMISSIONS_ENABLED: 'true' }), /CLOUD_WORKFLOW/);
});

test('direct form delivery does not connect to Gmail when its optional switch is off', async () => {
  let claims = 0;
  const store = { claim: async () => { claims++; return null; }, putCursor: () => { throw new Error('Gmail must remain unused'); } };
  const gmail = { profile: () => { throw new Error('Gmail must remain unused'); } };
  const result = await runWorker({ GITHUB_ACTIONS: 'true', TELEGRAM_SUBMISSIONS_ENABLED: 'true' }, { store, gmail, client: {} });
  assert.deepEqual(result, { accepted: 0, completed: 0, review: 0, retry: 0 });
  assert.equal(claims, 1);
});
