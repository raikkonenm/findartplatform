import { timingSafeEqual } from 'node:crypto';

export function cronAuthorized(header, secret) {
  if (!secret || secret.length < 32) return false;
  const actual = Buffer.from(header || ''), expected = Buffer.from('Bearer ' + secret);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
export async function wakeSubmissionWorker(env, fetchImpl = fetch) {
  if (env.SUBMISSIONS_WORKER_WAKE_ENABLED !== 'true' || env.VERCEL_ENV !== 'production') return { disabled: true };
  const repository = env.SUBMISSIONS_GITHUB_REPOSITORY || 'raikkonenm/findartplatform';
  if (!/^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/.test(repository) || !env.SUBMISSIONS_GITHUB_ACTIONS_TOKEN) throw new Error('SUBMISSIONS_WAKE_NOT_CONFIGURED');
  const base = `https://api.github.com/repos/${repository}/actions/workflows/telegram-submissions.yml`;
  async function request(url, method = 'GET', body) {
    let response;
    try { response = await fetchImpl(url, { method, headers: { Authorization: `Bearer ${env.SUBMISSIONS_GITHUB_ACTIONS_TOKEN}`, Accept: 'application/vnd.github+json', 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined, signal: AbortSignal.timeout(6000), cache: 'no-store' }); }
    catch { throw new Error('SUBMISSIONS_WAKE_TRANSPORT_ERROR'); }
    if (!response.ok) throw new Error(`SUBMISSIONS_WAKE_HTTP_${response.status}`);
    return response.status === 204 ? null : response.json();
  }
  const workflow = await request(base);
  if (workflow.state === 'disabled_manually') return { disabledByOwner: true, dispatched: false };
  const revived = workflow.state === 'disabled_inactivity';
  if (revived) await request(base + '/enable', 'PUT');
  else if (workflow.state !== 'active') throw new Error('SUBMISSIONS_WORKFLOW_NOT_ACTIVE');
  await request(base + '/dispatches', 'POST', { ref: env.SUBMISSIONS_WORKER_REF || 'main' });
  return { dispatched: true, revived };
}
