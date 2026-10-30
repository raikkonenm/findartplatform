const safeName = value => /^[a-zA-Z0-9/_-]+(?:\.[a-zA-Z0-9_-]+)?$/.test(value) && !value.includes('..');

export class PrivateStore {
  constructor(env, fetchImpl = fetch) {
    const url = env.SUBMISSIONS_SUPABASE_URL;
    const key = env.SUBMISSIONS_SUPABASE_SECRET_KEY || env.SUBMISSIONS_SUPABASE_SERVICE_ROLE_KEY;
    if (!/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(url || '') || !key || key.startsWith('sb_publishable_')) throw new Error('PRIVATE_STORAGE_NOT_CONFIGURED');
    this.url = url; this.key = key; this.fetch = fetchImpl;
    this.bucket = 'findart-submissions-private';
  }
  async request(route, { method = 'POST', body, binary = false } = {}) {
    let response;
    try {
      response = await this.fetch(this.url + route, { method, headers: { apikey: this.key, ...(!this.key.startsWith('sb_secret_') ? { Authorization: `Bearer ${this.key}` } : {}), ...(binary ? { 'Content-Type': 'application/octet-stream', 'x-upsert': 'true' } : { 'Content-Type': 'application/json' }) }, body: body === undefined ? undefined : binary ? body : JSON.stringify(body), signal: AbortSignal.timeout(30000), cache: 'no-store' });
    } catch { throw new Error('PRIVATE_STORAGE_TRANSPORT_ERROR'); }
    if (!response.ok) throw new Error(`PRIVATE_STORAGE_HTTP_${response.status}`);
    return response;
  }
  async rpc(name, body) { return (await this.request(`/rest/v1/rpc/findart_submissions_${name}`, { body })).json(); }
  enqueue({ sourceKey, fingerprint, payload }) { return this.rpc('enqueue', { p_source_key: sourceKey, p_fingerprint: fingerprint, p_payload: payload }); }
  claim(owner, id) { return id ? this.rpc('claim_one', { p_owner: owner, p_id: id }) : this.rpc('claim', { p_owner: owner }); }
  health() { return this.rpc('health', {}); }
  summary(id) { return this.rpc('summary', { p_id: id }); }
  async getBucket() { return (await this.request(`/storage/v1/bucket/${this.bucket}`, { method: 'GET' })).json(); }
  save(job, status = job.status, release = false) { return this.rpc('save', { p_id: job.id, p_owner: job.lease_owner, p_progress: job.progress || {}, p_status: status, p_error_code: job.error_code || null, p_release: release }); }
  getCursor(key) { return this.rpc('cursor_get', { p_key: key }); }
  putCursor(key, value) { return this.rpc('cursor_put', { p_key: key, p_value: value }); }
  async putObject(name, bytes) {
    if (!safeName(name)) throw new Error('UNSAFE_PRIVATE_OBJECT_NAME');
    await this.request(`/storage/v1/object/${this.bucket}/${name}`, { method: 'POST', body: bytes, binary: true });
    return name;
  }
  async getObject(name) {
    if (!safeName(name)) throw new Error('UNSAFE_PRIVATE_OBJECT_NAME');
    const response = await this.request(`/storage/v1/object/authenticated/${this.bucket}/${name}`, { method: 'GET' });
    const limit = 50_000_000;
    if (Number(response.headers.get('content-length')) > limit) throw new Error('PRIVATE_OBJECT_TOO_LARGE');
    const chunks = []; let total = 0;
    for await (const chunk of response.body) { total += chunk.length; if (total > limit) throw new Error('PRIVATE_OBJECT_TOO_LARGE'); chunks.push(chunk); }
    return Buffer.concat(chunks);
  }
}
