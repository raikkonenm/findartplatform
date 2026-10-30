// One-off local consent helper. Never run from a public Actions log.
import http from 'node:http';
import { randomBytes, timingSafeEqual } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const env = process.env;
if (!env.GMAIL_CLIENT_ID || !env.GMAIL_CLIENT_SECRET || env.GITHUB_ACTIONS === 'true') throw new Error('LOCAL_OAUTH_CLIENT_REQUIRED');
const state = randomBytes(32).toString('hex');
const server = http.createServer();
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const redirect = `http://127.0.0.1:${server.address().port}/callback`;
const scope = 'https://www.googleapis.com/auth/gmail.readonly';
const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
url.search = new URLSearchParams({ client_id: env.GMAIL_CLIENT_ID, redirect_uri: redirect, response_type: 'code', scope, access_type: 'offline', prompt: 'consent', state }).toString();
console.log('Open this Google consent URL locally and select the FINDART submission mailbox. No password is handled by this script:\n' + url.href);
const timer = setTimeout(() => server.close(), 5 * 60 * 1000);
server.on('request', async (request, response) => {
  try {
    const callback = new URL(request.url, redirect);
    const receivedState = Buffer.from(callback.searchParams.get('state') || '');
    if (callback.pathname !== '/callback' || receivedState.length !== state.length || !timingSafeEqual(receivedState, Buffer.from(state)) || !callback.searchParams.get('code')) throw new Error('OAUTH_CALLBACK_REJECTED');
    const result = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ client_id: env.GMAIL_CLIENT_ID, client_secret: env.GMAIL_CLIENT_SECRET, code: callback.searchParams.get('code'), redirect_uri: redirect, grant_type: 'authorization_code' }), signal: AbortSignal.timeout(15000) });
    if (!result.ok) throw new Error('OAUTH_EXCHANGE_FAILED');
    const tokens = await result.json();
    if (!tokens.refresh_token || !String(tokens.scope || '').split(' ').includes(scope) || /gmail\.modify|gmail\.send|mail\.google\.com\//.test(tokens.scope || '')) throw new Error('READ_ONLY_OAUTH_REVIEW_REQUIRED');
    const directory = path.resolve('.submission-delivery/oauth'); await mkdir(directory, { recursive: true });
    await writeFile(path.join(directory, 'gmail-token.json'), JSON.stringify({ refresh_token: tokens.refresh_token, scope: tokens.scope }, null, 2), { mode: 0o600 });
    response.end('Read-only connection saved locally. Add the refresh token to GitHub Secrets; never paste it into chat.');
    console.log('Refresh token saved in ignored .submission-delivery/oauth/gmail-token.json. Its value was not logged.');
  } catch { response.statusCode = 400; response.end('Connection was not saved. Check the local OAuth client configuration.'); console.error('GMAIL_OAUTH_SETUP_FAILED'); }
  finally { clearTimeout(timer); server.close(); }
});
