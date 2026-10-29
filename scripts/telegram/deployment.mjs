import { githubRequest } from './delivery.mjs';

export function liveDeliveryAllowed(event, env) {
  return event?.automatic === true
    ? env.TELEGRAM_DELIVERY_ENABLED === 'true'
    : event?.automatic === false && env.TELEGRAM_MANUAL_DELIVERY_ENABLED === 'true';
}

export function deploymentEvent(event, { projectId, defaultBranch }) {
  const data = event.client_payload;
  if (event.action !== 'vercel.deployment.success' || data?.state?.type !== 'success' || data?.environment !== 'production') return null;
  if (!projectId || data.project?.id !== projectId || data.git?.ref !== defaultBranch) return null;
  if (!/^[a-f0-9]{40}$/i.test(data.git.sha || '') || !/^https:\/\//.test(data.url || '')) throw new Error('Invalid successful deployment payload');
  return { sha: data.git.sha, automatic: true, dryRun: false };
}

export async function latestProductionSha({ repository, token, request = githubRequest }) {
  const deployments = await request(`/repos/${repository}/deployments?per_page=100`, { token });
  for (const deployment of deployments) {
    if (!deployment.production_environment && deployment.environment?.toLowerCase() !== 'production') continue;
    const statuses = await request(`/repos/${repository}/deployments/${deployment.id}/statuses?per_page=1`, { token });
    if (statuses[0]?.state === 'success' && /^[a-f0-9]{40}$/i.test(deployment.sha)) return deployment.sha;
  }
  throw new Error('No successful active production deployment found. Keep Vercel GitHub Deployment Events enabled for verified manual resends.');
}
