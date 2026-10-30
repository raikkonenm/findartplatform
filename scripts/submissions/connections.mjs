import { PrivateStore } from './store.mjs';
import { GmailReader } from './gmail.mjs';
import { TelegramClient } from '../telegram/telegram-client.mjs';

export async function checkConnections(env, { store, gmail, client, fetchImpl = fetch } = {}) {
  const report = { telegram: { state: 'unconfigured' }, storage: { state: 'unconfigured' }, ai: { state: 'unconfigured' }, gmail: { state: 'unconfigured' }, hmacConfigured: (env.SUBMISSIONS_HMAC_KEY || '').length >= 32, sent: 0 };
  if (env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID) {
    try {
      client ||= new TelegramClient({ token: env.TELEGRAM_BOT_TOKEN, chatId: env.TELEGRAM_CHAT_ID, expectedUsername: 'FINDART_content_bot', attempts: 2 });
      await client.verifyPrivateChat(); report.telegram = { state: 'ready', correctBotAndPrivateChat: true };
    } catch { report.telegram = { state: 'connection_failed' }; }
  }
  if (env.SUBMISSIONS_SUPABASE_URL && (env.SUBMISSIONS_SUPABASE_SECRET_KEY || env.SUBMISSIONS_SUPABASE_SERVICE_ROLE_KEY)) {
    try {
      store ||= new PrivateStore(env, fetchImpl);
      const health = await store.health(), bucket = await store.getBucket();
      if (health.schemaVersion !== 2 || !health.rlsEnabled || !health.publicAccessRevoked || !health.publicRpcRevoked || !health.privateStoragePolicy || bucket.public !== false) throw new Error('PRIVATE_SCHEMA_NOT_READY');
      const bytes = Buffer.from('FINDART private connection probe v1\n');
      const key = 'diagnostics/connection-probe.bin';
      await store.putObject(key, bytes);
      if (!(await store.getObject(key)).equals(bytes)) throw new Error('PRIVATE_STORAGE_PROBE_MISMATCH');
      const publicResponse = await fetchImpl(`${env.SUBMISSIONS_SUPABASE_URL}/storage/v1/object/public/${store.bucket}/${key}`, { signal: AbortSignal.timeout(15000) });
      if (![400,401,403,404].includes(publicResponse.status)) throw new Error('PRIVATE_STORAGE_PUBLIC_ACCESS_REVIEW_REQUIRED');
      report.storage = { state: 'ready', schemaVersion: 2, rlsEnabled: true, publicAccessBlocked: true, privateWriteReadVerified: true };
    } catch (error) { report.storage = { state: /PRIVATE_STORAGE_HTTP_404/.test(error.message || '') ? 'schema_or_bucket_missing' : 'connection_or_privacy_check_failed' }; }
  }
  if (env.OPENAI_API_KEY && env.SUBMISSIONS_OPENAI_MODEL) {
    try {
      const response = await fetchImpl('https://api.openai.com/v1/responses', { method: 'POST', headers: { Authorization: `Bearer ${env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ model: env.SUBMISSIONS_OPENAI_MODEL, store: false, input: 'Connection test. Return {"ok":true}.', text: { format: { type: 'json_schema', name: 'connection_probe', strict: true, schema: { type: 'object', properties: { ok: { type: 'boolean' } }, required: ['ok'], additionalProperties: false } } }, max_output_tokens: 2048 }), signal: AbortSignal.timeout(60000) });
      if (!response.ok) report.ai = { state: `http_${response.status}` };
      else {
        const data = await response.json();
        const text = (data.output || []).flatMap(item => item.content || []).filter(item => item.type === 'output_text').map(item => item.text).join('');
        if (data.status !== 'completed' || JSON.parse(text).ok !== true) throw new Error('AI_PROBE_INCOMPLETE');
        report.ai = { state: 'ready', structuredOutputVerified: true, inputTokens: data.usage?.input_tokens, outputTokens: data.usage?.output_tokens };
      }
    } catch { report.ai = { state: 'connection_or_output_check_failed' }; }
  }
  if (env.GMAIL_CLIENT_ID && env.GMAIL_CLIENT_SECRET && env.GMAIL_REFRESH_TOKEN && env.GMAIL_SUBMISSIONS_ADDRESS) {
    try {
      gmail ||= new GmailReader(env, fetchImpl);
      if ((await gmail.profile()).emailAddress.toLowerCase() !== env.GMAIL_SUBMISSIONS_ADDRESS.toLowerCase()) throw new Error('WRONG_ACCOUNT');
      report.gmail = { state: /\blabel:\S+/.test(env.GMAIL_SUBMISSIONS_QUERY || '') && Number.isFinite(Date.parse(env.GMAIL_SUBMISSIONS_START_AFTER || '')) ? 'ready' : 'filter_and_start_required', readOnlyClient: true };
    } catch { report.gmail = { state: 'connection_or_account_check_failed' }; }
  }
  report.coreReady = report.hmacConfigured && [report.telegram,report.storage,report.ai].every(check => check.state === 'ready');
  report.allSourcesReady = report.coreReady && report.gmail.state === 'ready';
  return report;
}
