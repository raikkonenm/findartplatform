import { checkConnections } from './submissions/connections.mjs';
try {
  const report = await checkConnections(process.env);
  console.log('SUBMISSIONS_CONNECTION_REPORT=' + JSON.stringify(report));
  if (!report.coreReady) process.exitCode = 1;
} catch { console.error('SUBMISSIONS_CONNECTION_CHECK_FAILED'); process.exitCode = 1; }
