import { readFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { runWorker } from './submissions/worker.mjs';
import { prepareSubmission } from './submissions/prepare.mjs';

const args = process.argv.slice(2);
const failClosed = () => { console.error('FINDART_SUBMISSIONS_WORKER_FAILED_CHECK_PRIVATE_STATE'); process.exitCode = 1; };
process.on('unhandledRejection', failClosed);
process.on('uncaughtException', () => { failClosed(); process.exit(1); });
async function main() {
  if (args.includes('--dry-run')) {
    const inputIndex = args.indexOf('--input'), reviewedIndex = args.indexOf('--reviewed-analysis');
    if (inputIndex < 0 || !args[inputIndex + 1]) throw new Error('DRY_RUN_PRIVATE_INPUT_REQUIRED');
    const payload = JSON.parse(await readFile(args[inputIndex + 1], 'utf8'));
    const reviewedAnalysis = reviewedIndex >= 0 ? JSON.parse(await readFile(args[reviewedIndex + 1], 'utf8')) : undefined;
    const directory = path.resolve('.submission-delivery', 'dry-run');
    await mkdir(directory, { recursive: true });
    const pack = await prepareSubmission(payload, { directory, env: process.env, reviewedAnalysis });
    console.log(JSON.stringify({ mode: 'dry-run', approved: false, type: pack.type, images: pack.images.length, files: pack.files.length, messages: pack.steps.length, warnings: pack.draft.warnings.length, report: '.submission-delivery/dry-run/draft-package.json' }));
    return;
  }
  if (args.length) throw new Error('UNSUPPORTED_WORKER_OPTION');
  console.log(JSON.stringify(await runWorker(process.env)));
}
main().catch(failClosed);
