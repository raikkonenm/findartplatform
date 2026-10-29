import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import { contentCaption, dateRange, creditName, nameHashtag, loadCatalog } from './content.mjs';
import { buildPackage, groups, archiveParts, zipBytes, fingerprint } from './package.mjs';
import { deliver, TelegramClient, FileLedger, GitHubLedger } from './delivery.mjs';
import { deploymentEvent, latestProductionSha, liveDeliveryAllowed } from './deployment.mjs';

test('native multipart round-trip resolves every document and photo attachment to unchanged bytes', async () => {
  const directory = await mkdtemp(path.join(tmpdir(), 'findart-multipart-'));
  const files = [];
  for (let i = 0; i < 3; i++) { const file = { path: path.join(directory, `${i}.webp`), filename: `${i}.webp` }; await writeFile(file.path, Buffer.from([i, 1, 2, 255, 13, 10])); files.push(file); }
  for (const type of ['document', 'photo']) {
    const client = new TelegramClient({ token: 'test', chatId: '123', fetchImpl: async (url, options) => {
      assert.equal(Number(options.headers['Content-Length']), options.body.length);
      const form = await new Request('http://localhost/upload', { method: 'POST', headers: options.headers, body: options.body }).formData();
      const media = JSON.parse(form.get('media'));
      assert.equal(media.length, files.length);
      for (const [i, entry] of media.entries()) {
        assert.equal(entry.type, type);
        const attachment = form.get(entry.media.slice('attach://'.length));
        assert.ok(attachment instanceof Blob);
        assert.equal(attachment.name, files[i].filename);
        assert.deepEqual(Buffer.from(await attachment.arrayBuffer()), await readFile(files[i].path));
      }
      return new Response(JSON.stringify({ ok: true, result: files.map((_, i) => ({ message_id: i + 1 })) }));
    } });
    await client.request('sendMediaGroup', {}, files, type);
  }
});

test('resume-only refuses a new delivery and retains confirmed caption/TXT across file fallback', async () => {
  const ledger = new FileLedger(await mkdtemp(path.join(tmpdir(), 'findart-resume-files-'))); await ledger.load();
  const pack = { id: 'exhibition:partial', revisionHash: 'same-content', ready: true, status: 'published', steps: [{ method: 'sendMessage', text: 'caption' }, { method: 'sendDocument', files: [{ filename: 'caption.txt' }] }, { method: 'sendMediaGroup', mediaType: 'document', files: [{ filename: 'cover.webp' }, { filename: '1.webp' }] }] };
  const calls = [];
  const client = { chatId: '123', verifyPrivateChat: async () => {}, request: async (method, fields, files) => {
    calls.push(method === 'sendMessage' ? fields.text : files.map(file => file.filename).join(','));
    if (method === 'sendMediaGroup') { const error = new Error('Telegram sendMediaGroup rejected the request (400): Wrong file identifier/HTTP URL specified'); error.ambiguous = false; throw error; }
    if (files[0]?.filename === '1.webp') { const error = new Error('Temporary explicit failure'); error.ambiguous = false; throw error; }
    return { message_id: calls.length, document: files[0] ? { file_name: files[0].filename } : undefined, text: fields.text };
  } };
  await assert.rejects(deliver(pack, { client, ledger, resendId: 'old-run', resumeOnly: true }), /No matching resume/);
  await assert.rejects(deliver(pack, { client, ledger, resendId: 'old-run', sleep: async () => {} }));
  const before = calls.length;
  client.request = async (method, fields, files) => { calls.push(files[0].filename); return { message_id: calls.length, document: { file_name: files[0].filename } }; };
  await deliver(pack, { client, ledger, resendId: 'old-run', resumeOnly: true, sleep: async () => {} });
  assert.deepEqual(calls.slice(before), ['1.webp']);
  assert.equal(calls.filter(value => value === 'caption').length, 1);
  assert.equal(calls.filter(value => value === 'caption.txt').length, 1);
  assert.equal(calls.filter(value => value === 'cover.webp').length, 1);
  await ledger.close();
});

test('manual permission never enables automatic delivery', () => {
  const env = { TELEGRAM_DELIVERY_ENABLED: 'false', TELEGRAM_MANUAL_DELIVERY_ENABLED: 'true' };
  assert.equal(liveDeliveryAllowed({ automatic: true }, env), false);
  assert.equal(liveDeliveryAllowed({ automatic: false }, env), true);
  assert.equal(liveDeliveryAllowed(null, env), false);
});

test('connection methods use JSON and normalize secret whitespace without logging values', async () => {
  const requests = [];
  const client = new TelegramClient({ token: '  test-token\n', chatId: ' 123\n', expectedUsername: 'FINDART_content_bot', fetchImpl: async (url, options) => {
    requests.push({ method: url.endsWith('/getMe') ? 'getMe' : 'getChat', contentType: options.headers['Content-Type'], body: JSON.parse(options.body), hasWhitespace: /\s/.test(url) });
    return new Response(JSON.stringify({ ok: true, result: url.endsWith('/getMe') ? { username: 'FINDART_content_bot' } : { id: 123, type: 'private' } }));
  } });
  await client.verifyPrivateChat();
  assert.deepEqual(requests, [{ method: 'getMe', contentType: 'application/json', body: {}, hasWhitespace: false }, { method: 'getChat', contentType: 'application/json', body: { chat_id: '123' }, hasWhitespace: false }]);
});

const exhibition = (names = ['Alice Smith']) => ({ type: 'exhibition', slug: 'example', title: 'Actual Title', artists: names, photographer: 'Bob Jones', gallery: 'Real Gallery', city: 'Paris', country: 'France', startDate: '2026-03-12', endDate: '2026-04-20', description: 'Actual source sentence. Another actual sentence.', publicUrl: 'https://www.findartplatform.com/exhibitions/example', social: { status: 'published', revision: 1, language: 'en', excerpt: 'Actual source sentence.' } });

test('exact uppercase headlines for one, two, three and four artists', () => {
  const cases = [
    [['Alice Smith'], 'ACTUAL TITLE BY ALICE SMITH'],
    [['Alice Smith', 'Bob Jones'], 'ACTUAL TITLE BY ALICE SMITH AND BOB JONES'],
    [['Alice Smith', 'Bob Jones', 'Carol White'], 'ACTUAL TITLE BY ALICE SMITH, BOB JONES AND CAROL WHITE'],
    [['Alice Smith', 'Bob Jones', 'Carol White', 'Dana Black'], 'ACTUAL TITLE (GROUP EXHIBITION)'],
  ];
  for (const [names, expected] of cases) { const result = contentCaption(exhibition(names)); assert.equal(result.caption.split('\n')[0], expected); assert.deepEqual(result.errors, []); }
  const item = exhibition(); item.title = 'Actual Title by Alice Smith'; assert.equal(contentCaption(item).caption.split('\n')[0], 'ACTUAL TITLE BY ALICE SMITH');
});

test('only verified structured handles; actual names otherwise', () => {
  assert.equal(creditName({ name: 'Alice Smith', instagram: { handle: '@alice', verified: true } }), '@alice');
  assert.equal(creditName({ name: 'Alice Smith', instagram: { handle: '@unverified', verified: false } }), '#AliceSmith');
  assert.equal(nameHashtag('Миша Гудвин'), '#MishaGudvin');
  assert.equal(nameHashtag('Anaïs Łódź'), '#AnaisLodz');
  assert.throws(() => creditName({ name: '@undocumented' }));
  assert.throws(() => nameHashtag('李明'), /Latin spelling/);
});

test('same-year, cross-year and invalid calendar dates', () => {
  assert.equal(dateRange('12 March 2026', '20 April 2026'), '12 March - 20 April 2026');
  assert.equal(dateRange('2026-12-12', '2027-01-20'), '12 December 2026 - 20 January 2027');
  assert.equal(dateRange('2026-03-12', '2026-03-12'), '12 March 2026');
  assert.throws(() => dateRange('2026-02-30', '2026-03-12'));
  assert.throws(() => dateRange('2026-04-01', '2026-03-12'));
});

test('missing credits, drafts, invented excerpts, translations and length require review', () => {
  const item = exhibition(); delete item.photographer;
  assert.ok(contentCaption(item).errors.includes('Missing required credit: Photo'));
  assert.ok(!contentCaption(item).caption.includes('Photo:'));
  item.social.status = 'draft'; assert.ok(contentCaption(item).errors.some(value => value.includes('published')));
  item.social.excerpt = 'Invented quotation.'; assert.ok(contentCaption(item).errors.some(value => value.includes('verbatim')));
  item.social.language = 'de'; item.social.translatedExcerpt = { text: 'English translation.', sourceText: 'Not the source.', language: 'en', verified: true };
  assert.ok(contentCaption(item).errors.some(value => value.includes('Translation')));
  const long = exhibition(Array.from({ length: 140 }, (_, i) => `Documented Artist ${i}`));
  const result = contentCaption(long); assert.ok(result.errors.some(value => value.includes('2,200'))); assert.ok(result.caption.includes('#DocumentedArtist139'));
});

test('standalone artwork does not fabricate exhibition information', () => {
  const item = { type: 'artwork', slug: 'work', title: 'Blue', artists: [{ name: 'Alice Smith' }], year: '2026', medium: 'Oil', dimensions: '20 x 30 cm', publicUrl: 'https://www.findartplatform.com/collect', social: { status: 'published', revision: 1, language: 'en' } };
  const result = contentCaption(item); assert.deepEqual(result.errors, []); assert.equal(result.caption, 'BLUE BY ALICE SMITH\n\nArtist(s): #AliceSmith');
});

test('43+ photos: order, source bytes, preview selection, text and multipart plan', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'findart-telegram-'));
  await mkdir(path.join(root, 'public', 'gallery'), { recursive: true });
  const jpeg = await sharp({ create: { width: 20, height: 20, channels: 3, background: '#cccccc' } }).jpeg().toBuffer();
  const webp = await sharp(jpeg).webp().toBuffer();
  const item = exhibition(); item.coverImage = '/gallery/1.webp'; item.images = [];
  for (let i = 1; i <= 43; i++) { await writeFile(path.join(root, 'public', 'gallery', `${i}.webp`), webp); item.images.push({ src: `/gallery/${i}.webp` }); }
  await writeFile(path.join(root, 'public', 'gallery', '1.jpg'), jpeg);
  const pack = await buildPackage(item, { root, output: path.join(root, 'output') });
  assert.equal(pack.ready, true); assert.equal(pack.images.length, 43);
  assert.equal(pack.images[0].filename, '1.jpg'); assert.equal(pack.images[0].cover, true);
  assert.equal(pack.images.at(-1).filename, '43.webp');
  assert.deepEqual(pack.steps.filter(step => step.mediaType === 'document').map(step => step.files.length), [10, 10, 10, 10, 3]);
  assert.equal(pack.steps.find(step => step.mediaType === 'photo').files.length, 10);
  assert.equal(await readFile(pack.steps[1].files[0].path, 'utf8'), pack.caption);
  assert.deepEqual(await readFile(pack.images[0].path), jpeg);
  assert.ok(pack.warnings.some(value => value.includes('WebP')));
  const archive = pack.steps.find(step => step.files?.[0].filename.endsWith('.zip'));
  assert.ok((await readFile(archive.files[0].path)).length < 49_000_000);
  const repeated = await buildPackage({ ...item, sortDate: 'unrelated feed ordering', social: { ...item.social, revision: 2 } }, { root, output: path.join(root, 'output') });
  assert.equal(pack.revisionHash, repeated.revisionHash, 'Revision bumps or feed sorting alone are not meaningful updates');
  await writeFile(path.join(root, 'public', 'gallery', '2.webp'), await sharp(jpeg).tint('#ff0000').webp().toBuffer());
  const changed = await buildPackage(item, { root, output: path.join(root, 'output') });
  assert.notEqual(pack.revisionHash, changed.revisionHash, 'Replacing image bytes is a content revision');
  item.images.push({ src: '/../package.json' });
  assert.equal((await buildPackage(item, { root, output: path.join(root, 'bad') })).ready, false);
});

test('ZIP parts stay under budget, preserve filenames and grouping handles singletons', () => {
  const files = Array.from({ length: 43 }, (_, i) => ({ index: i + 1, filename: `${i + 1}.jpg`, bytes: 100 }));
  const parts = archiveParts(files, 1000);
  assert.ok(parts.length > 1);
  for (const part of parts) {
    const data = zipBytes(part.map(file => ({ name: file.archiveName, bytes: Buffer.alloc(file.bytes, 1) })));
    assert.ok(data.length < 1000); assert.equal(data.readUInt32LE(0), 0x04034b50);
  }
  assert.deepEqual(groups(Array(21)).map(group => group.length), [10, 10, 1]);
});

test('durable duplicate prevention, recovery, draft blocking and intentional resend', async () => {
  const directory = await mkdtemp(path.join(tmpdir(), 'findart-ledger-'));
  const ledger = new FileLedger(directory); await ledger.load();
  let calls = 0;
  const client = { chatId: '123', verifyPrivateChat: async () => {}, request: async () => { calls++; return { message_id: calls }; } };
  const pack = { id: 'exhibition:example', revisionHash: fingerprint('first'), revision: 1, ready: true, status: 'published', steps: [{ method: 'sendMessage', text: 'Finished caption' }] };
  await deliver(pack, { ledger, client, sleep: async () => {} }); await ledger.close();
  const persisted = new FileLedger(directory); await persisted.load();
  assert.equal((await deliver(pack, { ledger: persisted, client })).skipped, 'duplicate'); assert.equal(calls, 1);
  await deliver(pack, { ledger: persisted, client, resendId: 'explicit-manual-run', sleep: async () => {} }); assert.equal(calls, 2);
  await assert.rejects(deliver({ ...pack, status: 'draft' }, { ledger: persisted, client }));
  const failing = { ...client, request: async () => { const error = new Error('Lost response'); error.ambiguous = true; throw error; } };
  const changed = { ...pack, revisionHash: fingerprint('second') };
  await assert.rejects(deliver(changed, { ledger: persisted, client: failing }));
  await assert.rejects(deliver(changed, { ledger: persisted, client }), /may already have been delivered/);
  assert.equal(calls, 2); await persisted.close();
});

test('explicit API rate limits retry, ambiguous sends stop, non-private chats reject', async () => {
  let attempts = 0; const waits = [];
  const client = new TelegramClient({ token: 'test-token', chatId: '123', sleep: async ms => waits.push(ms), fetchImpl: async () => ++attempts === 1 ? new Response(JSON.stringify({ ok: false, error_code: 429, parameters: { retry_after: 3 } }), { status: 429 }) : new Response(JSON.stringify({ ok: true, result: { message_id: 1 } })) });
  await client.request('sendMessage', { text: 'caption' }); assert.equal(attempts, 2); assert.deepEqual(waits, [3000]);
  let serverAttempts = 0;
  const recoverable = new TelegramClient({ token: 'test', chatId: '123', sleep: async () => {}, fetchImpl: async () => ++serverAttempts === 1 ? new Response(JSON.stringify({ ok: false, error_code: 503 }), { status: 503 }) : new Response(JSON.stringify({ ok: true, result: { message_id: 2 } })) });
  await recoverable.request('sendMessage', { text: 'caption' }); assert.equal(serverAttempts, 2);
  const lost = new TelegramClient({ token: 'secret-token', chatId: '123', fetchImpl: async () => { throw new Error('https://api.telegram.org/botsecret-token/sendMessage'); } });
  await assert.rejects(lost.request('sendMessage', { text: 'caption' }), error => error.ambiguous === true && !error.message.includes('secret-token'));
  const group = new TelegramClient({ token: 'test', chatId: '123', fetchImpl: async () => new Response(JSON.stringify({ ok: true, result: { id: 123, type: 'supergroup' } })) });
  await assert.rejects(group.verifyPrivateChat(), /not the exact private chat/);
});

test('a definite later-step failure resumes without repeating an acknowledged caption', async () => {
  const ledger = new FileLedger(await mkdtemp(path.join(tmpdir(), 'findart-resume-'))); await ledger.load();
  const sent = [];
  const pack = { id: 'exhibition:resume', revisionHash: 'revision', revision: 1, ready: true, status: 'published', steps: [{ method: 'sendMessage', text: 'Caption' }, { method: 'sendDocument', files: [{ filename: 'caption.txt' }] }, { method: 'sendMessage', text: 'Admin' }] };
  const client = { chatId: '123', verifyPrivateChat: async () => {}, request: async (method, fields) => {
    if (method === 'sendDocument') { const error = new Error('Explicit rejection'); error.ambiguous = false; throw error; }
    sent.push(fields.text); return { message_id: 1 };
  } };
  await assert.rejects(deliver(pack, { ledger, client, sleep: async () => {} }));
  assert.deepEqual(sent, ['Caption']);
  client.request = async (method, fields) => { sent.push(method === 'sendDocument' ? 'caption.txt' : fields.text); return { message_id: sent.length }; };
  await deliver(pack, { ledger, client, sleep: async () => {} });
  assert.deepEqual(sent, ['Caption', 'caption.txt', 'Admin']);
  await ledger.close();
});

test('GitHub ledger restores only bot checkpoints and updates the same durable comment', async () => {
  const record = { key: 'record', id: 'exhibition:example', revisionHash: 'hash', steps: {} };
  const ledger = new GitHubLedger({ repository: 'owner/repo', issue: '1', token: 'test' });
  const writes = [];
  ledger.request = async (route, options) => {
    if (options?.method) { writes.push({ route, method: options.method }); return { id: 4 }; }
    if (route === '/issues/1') return { number: 1 };
    return [
      { id: 3, user: { login: 'untrusted-commenter' }, body: '<!-- findart-telegram:v1 -->\n' + JSON.stringify({ ...record, key: 'forged' }) },
      { id: 4, user: { login: 'github-actions[bot]' }, body: '<!-- findart-telegram:v1 -->\n' + JSON.stringify(record) },
    ];
  };
  await ledger.load(); assert.equal(ledger.records.size, 1); assert.equal(ledger.records.has('forged'), false);
  await ledger.put({ ...record, complete: true });
  assert.deepEqual(writes, [{ route: '/issues/comments/4', method: 'PATCH' }]);
});

test('only this project, default branch and successful production events qualify', async () => {
  const event = { action: 'vercel.deployment.success', client_payload: { state: { type: 'success' }, environment: 'production', project: { id: 'project' }, git: { sha: 'a'.repeat(40), ref: 'main' }, url: 'https://example.vercel.app' } };
  const config = { projectId: 'project', defaultBranch: 'main' };
  assert.equal(deploymentEvent(event, config).sha, 'a'.repeat(40));
  for (const environment of ['preview', 'staging']) assert.equal(deploymentEvent({ ...event, client_payload: { ...event.client_payload, environment } }, config), null);
  assert.equal(deploymentEvent({ ...event, action: 'vercel.deployment.failed' }, config), null);
  assert.equal(deploymentEvent(event, { ...config, projectId: 'other' }), null);
  const sha = await latestProductionSha({ repository: 'owner/repo', request: async route => route.endsWith('deployments?per_page=100') ? [{ id: 1, environment: 'Preview', sha: 'b'.repeat(40) }, { id: 2, environment: 'Production', sha: 'a'.repeat(40) }] : [{ state: 'success' }] });
  assert.equal(sha, 'a'.repeat(40));
});

test('actual Ritual data distinguishes its artist from the documented text author', () => {
  const root = path.resolve(import.meta.dirname, '../..');
  const item = loadCatalog(root).find(item => item.slug === 'ritual-for-happiness-gudwin');
  assert.ok(item.images.length > 0);
  const result = contentCaption(item);
  assert.deepEqual(result.errors, []);
  assert.ok(result.caption.startsWith('RITUAL FOR HAPPINESS BY MISHA GUDWIN\n\n'));
  assert.ok(result.caption.includes('Text: #TimoPoeppel'));
  assert.ok(item.description.includes(item.social.excerpt));
});
