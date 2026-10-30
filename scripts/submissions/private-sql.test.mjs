import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
let PGlite;
try { ({ PGlite } = await import('@electric-sql/pglite')); }
catch (error) { if (process.env.REQUIRE_PRIVATE_SQL_TESTS === 'true' || error.code !== 'ERR_MODULE_NOT_FOUND') throw error; }

test('real PostgreSQL migration enforces private roles, cross-source dedupe, leases and durable checkpoints', { skip: !PGlite }, async () => {
  const db = new PGlite();
  try {
    await db.exec("create role anon; create role authenticated; create role service_role bypassrls; create schema storage; create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint); create table storage.objects(bucket_id text); alter table storage.objects enable row level security; grant usage on schema storage to anon,authenticated,service_role; grant select on storage.objects to anon,authenticated; create policy legacy_public_read on storage.objects for select to anon,authenticated using(true); insert into storage.objects values('findart-submissions-private'),('other-bucket');");
    const migration = await readFile(new URL('../../supabase/submissions.sql', import.meta.url), 'utf8');
    await db.exec(migration);
    assert.equal((await db.query("select public from storage.buckets where id='findart-submissions-private'")).rows[0].public, false);
    for (const role of ['anon','authenticated']) {
      await db.exec(`set role ${role}`);
      await assert.rejects(db.query('select * from public.findart_submission_jobs'), /permission denied/i);
      await assert.rejects(db.query("select public.findart_submissions_enqueue('x','x','{}')"), /permission denied/i);
      await assert.rejects(db.query('select public.findart_submissions_health()'), /permission denied/i);
      assert.deepEqual((await db.query('select bucket_id from storage.objects')).rows, [{ bucket_id: 'other-bucket' }]);
      await db.exec('reset role');
    }
    await db.exec('set role service_role');
    const health = (await db.query('select public.findart_submissions_health() as health')).rows[0].health;
    assert.deepEqual(health, { schemaVersion: 2, rlsEnabled: true, publicAccessRevoked: true, publicRpcRevoked: true, privateStoragePolicy: true });
    const enqueue = async (key, digest) => (await db.query('select public.findart_submissions_enqueue($1,$2,$3::jsonb) as id', [key,digest,JSON.stringify({ source: 'synthetic-test' })])).rows[0].id;
    const formId = await enqueue('form:signed-id', 'same-digest');
    assert.equal(await enqueue('gmail:message-id', 'same-digest'), formId);
    assert.equal(await enqueue('gmail:message-id', 'changed-digest'), formId);
    const other = await enqueue('gmail:another', 'different-digest'); assert.notEqual(other, formId);
    const owner = '11111111-1111-4111-8111-111111111111';
    const selected = (await db.query('select public.findart_submissions_claim_one($1,$2) as job', [owner,other])).rows[0].job;
    assert.equal(selected.id, other);
    const claim = (await db.query('select public.findart_submissions_claim($1) as job', [owner])).rows[0].job;
    assert.equal(claim.id, formId);
    const checkpoint = { delivery: { steps: { 0: { status: 'complete', receipt: { messageId: 1 } } } } };
    await assert.rejects(db.query('select public.findart_submissions_save($1,$2,$3::jsonb,$4,null,false)', [formId,'22222222-2222-4222-8222-222222222222',JSON.stringify(checkpoint),'sending']), /LEASE_LOST/);
    await db.query('select public.findart_submissions_save($1,$2,$3::jsonb,$4,null,true)', [formId,owner,JSON.stringify(checkpoint),'prepared']);
    const resumed = (await db.query('select public.findart_submissions_claim($1) as job', [owner])).rows[0].job;
    assert.equal(resumed.progress.delivery.steps[0].receipt.messageId, 1);
    const summary = (await db.query('select public.findart_submissions_summary($1) as summary', [formId])).rows[0].summary;
    assert.equal(summary.confirmedMessages, 1); assert.equal(summary.uncertainSteps, 0);
    assert.ok(!JSON.stringify(summary).includes('payload'));
    await db.exec('reset role');
    await db.exec("update storage.buckets set public=true where id='findart-submissions-private'");
    await assert.rejects(db.exec(migration), /MUST_BE_PRIVATE/);
  } finally { await db.close(); }
});
