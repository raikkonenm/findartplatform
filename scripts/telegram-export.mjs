import { readFile, mkdir, writeFile, appendFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { loadCatalog } from './telegram/content.mjs';
import { buildPackage, fingerprint } from './telegram/package.mjs';
import { GitHubLedger, TelegramClient, deliver, githubRequest } from './telegram/delivery.mjs';
import { deploymentEvent, latestProductionSha, liveDeliveryAllowed } from './telegram/deployment.mjs';

const engineRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const flags = new Map(), positional = [];
const values = new Set(['--root', '--output', '--event-file', '--resume-run']);
const switches = new Set(['--dry-run', '--send', '--resend', '--dispatch', '--resolve-event', '--no-zip', '--caption-only']);
for (let i = 2; i < process.argv.length; i++) {
  const arg = process.argv[i];
  if (values.has(arg)) { if (!process.argv[i + 1] || process.argv[i + 1].startsWith('--')) throw new Error(`Value required for ${arg}`); flags.set(arg, process.argv[++i]); }
  else if (switches.has(arg)) flags.set(arg, true);
  else if (arg.startsWith('--')) throw new Error('Unknown option; use the documented flags. Credentials are accepted only from the environment.');
  else positional.push(arg);
}

async function main() {
  const env = process.env;
  if (flags.has('--dry-run') && flags.has('--send')) throw new Error('Choose dry-run or send, not both');
  if (flags.has('--resolve-event')) {
    const event = JSON.parse(await readFile(env.GITHUB_EVENT_PATH, 'utf8'));
    let resolved;
    if (env.GITHUB_EVENT_NAME === 'repository_dispatch') {
      resolved = deploymentEvent(event, { projectId: env.VERCEL_PROJECT_ID, defaultBranch: event.repository.default_branch });
      if (resolved) resolved.dryRun = env.TELEGRAM_DELIVERY_ENABLED !== 'true';
    } else if (env.GITHUB_EVENT_NAME === 'workflow_dispatch') {
      const inputs = event.inputs || {};
      const dryRun = inputs.dry_run !== 'false';
      const resumeRun = (inputs.resume_run || '').trim();
      if (resumeRun && !/^\d+$/.test(resumeRun)) throw new Error('Resume run must be a numeric manual workflow run ID.');
      if (!dryRun && !liveDeliveryAllowed({ automatic: false }, env)) throw new Error('Manual live delivery is disabled; enable TELEGRAM_MANUAL_DELIVERY_ENABLED for an approved manual run.');
      resolved = { sha: dryRun ? env.GITHUB_SHA : await latestProductionSha({ repository: env.GITHUB_REPOSITORY, token: env.GITHUB_TOKEN }), automatic: false, dryRun, type: inputs.content_type, slug: inputs.slug, captionOnly: inputs.caption_only === 'true', resendId: resumeRun || env.GITHUB_RUN_ID, resumeOnly: Boolean(resumeRun) };
    }
    if (!resolved) { await appendFile(env.GITHUB_OUTPUT, 'eligible=false\n'); return; }
    if (!/^[a-f0-9]{40}$/i.test(resolved.sha)) throw new Error('Invalid published commit SHA');
    const file = path.join(env.RUNNER_TEMP, 'findart-telegram-event.json');
    await writeFile(file, JSON.stringify(resolved));
    await appendFile(env.GITHUB_OUTPUT, `eligible=true\npublished_sha=${resolved.sha}\n`);
    return;
  }
  if (flags.has('--dispatch')) {
    const [type, slug] = positional;
    if (!['exhibition', 'artwork', 'feature'].includes(type) || !/^[a-z0-9][a-z0-9-]*$/.test(slug || '')) throw new Error('Usage: npm run telegram:resend -- <exhibition|artwork|feature> <slug> --dispatch [--send]');
    if (!/^[\w.-]+\/[\w.-]+$/.test(env.GITHUB_REPOSITORY || '') || !env.GITHUB_TOKEN) throw new Error('Configure GITHUB_REPOSITORY and an actions:write GITHUB_TOKEN to dispatch the serialized workflow');
    await githubRequest(`/repos/${env.GITHUB_REPOSITORY}/actions/workflows/telegram-content.yml/dispatches`, { token: env.GITHUB_TOKEN, method: 'POST', body: { ref: env.TELEGRAM_DEFAULT_BRANCH || 'main', inputs: { content_type: type, slug, dry_run: flags.has('--send') ? 'false' : 'true', ...(flags.has('--caption-only') ? { caption_only: 'true' } : {}), ...(flags.has('--resume-run') ? { resume_run: flags.get('--resume-run') } : {}) } } });
    console.log('Manual workflow requested. Follow its result in GitHub Actions.'); return;
  }
  const root = path.resolve(flags.get('--root') || engineRoot);
  const output = path.resolve(flags.get('--output') || path.join(engineRoot, '.telegram-delivery', 'packages'));
  const event = flags.has('--event-file') ? JSON.parse(await readFile(flags.get('--event-file'), 'utf8')) : null;
  const live = !flags.has('--dry-run') && (event ? !event.dryRun : flags.has('--send'));
  if (live && (env.GITHUB_ACTIONS !== 'true' || !liveDeliveryAllowed(event, env))) throw new Error('Live sends require the serialized GitHub workflow and its separate automatic/manual permission.');
  if (event && execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim() !== event.sha) throw new Error('Catalog checkout does not match the published SHA');
  if (event && !event.dryRun) execFileSync('git', ['merge-base', '--is-ancestor', event.sha, `origin/${env.TELEGRAM_DEFAULT_BRANCH || 'main'}`], { cwd: root, stdio: 'pipe' });
  const catalog = loadCatalog(root);
  const migrationBaseline = JSON.parse(await readFile(path.join(engineRoot, 'scripts', 'telegram', 'published-baseline.json'), 'utf8'));
  let selected;
  if (event?.automatic) selected = catalog.filter(item => item.social?.status === 'published');
  else {
    const type = event?.type || positional[0], slug = event?.slug || positional[1];
    let item = catalog.find(item => item.type === type && item.slug === slug);
    if (!item) throw new Error('Content not found. Supply the existing content type and unique slug.');
    // Manual exports of existing publications may carry reviewed delivery-only
    // metadata, without editing or redeploying the website's catalog. Bind it to
    // the exact published record; automatic scans never consume this manifest.
    if (!item.social) {
      const manifest = JSON.parse(await readFile(path.join(engineRoot, 'scripts', 'telegram', 'manual-publications.json'), 'utf8'));
      const entry = manifest[`${item.type}:${item.slug}`];
      if (entry) {
        if (fingerprint(item) !== entry.sourceHash) throw new Error('Manual publication metadata does not match this catalog record; review before sending.');
        item = { ...item, ...(entry.title ? { title: entry.title } : {}), social: entry.social };
      }
    }
    selected = [item];
  }
  let ledger, client;
  const results = [];
  try {
    if (live) {
      ledger = new GitHubLedger({ repository: env.GITHUB_REPOSITORY, issue: env.TELEGRAM_STATE_ISSUE, token: env.GITHUB_TOKEN });
      await ledger.load();
      client = new TelegramClient({ token: env.TELEGRAM_BOT_TOKEN, chatId: env.TELEGRAM_CHAT_ID, expectedUsername: env.TELEGRAM_BOT_USERNAME });
      // Ignore delayed deployment events after a newer successful publication.
      if (event.automatic) for (const record of ledger.records.values()) {
        if (record.complete && record.deploymentSha && record.deploymentSha !== event.sha) {
          try { execFileSync('git', ['merge-base', '--is-ancestor', event.sha, record.deploymentSha], { cwd: root, stdio: 'pipe' }); console.log('Skipped an obsolete deployment event.'); return; } catch { /* Not an ancestor. */ }
        }
      }
    }
    for (const item of selected) {
      try {
        const pack = await buildPackage(item, { root, output, includeZip: !flags.has('--no-zip'), captionOnly: !event?.automatic && Boolean(event?.captionOnly || flags.has('--caption-only')) });
        const baselineMatch = event?.automatic && migrationBaseline[pack.id] === pack.revisionHash;
        const delivery = live
          ? baselineMatch ? { skipped: 'migration-baseline' } : await deliver(pack, { client, ledger, deploymentSha: event.sha, resendId: event.automatic ? undefined : event.resendId, resumeOnly: event.resumeOnly })
          : { dryRun: true, ...(baselineMatch ? { wouldSkip: 'migration-baseline' } : {}) };
        results.push({ id: pack.id, ready: pack.ready, directory: pack.directory, images: pack.images.length, steps: pack.steps.length, errors: pack.errors, warnings: pack.warnings, ...delivery });
        console.log(`${pack.id}: ${pack.ready ? 'ready' : 'REVIEW REQUIRED'}, ${pack.images.length} images, ${pack.steps.length} delivery steps. ${pack.directory}`);
        if (!pack.ready) process.exitCode = 2;
      } catch (error) {
        let message = error.message || 'Delivery failed';
        for (const secret of [env.TELEGRAM_BOT_TOKEN, env.GITHUB_TOKEN, env.TELEGRAM_CHAT_ID]) if (secret) message = message.split(secret).join('[REDACTED]');
        console.error(`${item.type}:${item.slug}: ${message}`);
        results.push({ id: `${item.type}:${item.slug}`, error: message }); process.exitCode = 1;
      }
    }
  } finally { await ledger?.close(); }
  await mkdir(output, { recursive: true });
  await writeFile(path.join(output, 'run-report.json'), JSON.stringify({ mode: live ? 'live' : 'dry-run', publishedSha: event?.sha, results }, null, 2));
  if (process.exitCode) throw new Error('Some content requires review. See run-report.json; no validation-blocked item was sent.');
}

main().catch(error => {
  let message = error.message || 'Telegram export failed';
  for (const secret of [process.env.TELEGRAM_BOT_TOKEN, process.env.GITHUB_TOKEN]) if (secret) message = message.split(secret).join('[REDACTED]');
  console.error(message); process.exitCode = process.exitCode || 1;
});
