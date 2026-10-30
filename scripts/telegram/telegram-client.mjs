import { readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';

const pause = ms => new Promise(resolve => setTimeout(resolve, ms));

export async function multipartUpload(method, params, files, mediaType) {
  const boundary = 'findart_' + randomUUID().replaceAll('-', '');
  const fields = { ...params };
  const names = files.map((_, index) => method === 'sendMediaGroup' ? `media_file_${index}` : method === 'sendPhoto' ? 'photo' : 'document');
  if (method === 'sendMediaGroup') {
    if (files.length < 2 || files.length > 10 || !['document', 'photo'].includes(mediaType)) throw new Error('Invalid Telegram media group');
    fields.media = files.map((file, index) => ({ type: mediaType, media: `attach://${names[index]}`, ...(mediaType === 'document' ? { disable_content_type_detection: true } : {}) }));
  }
  if (method === 'sendDocument') fields.disable_content_type_detection = true;
  const chunks = [];
  for (const [name, value] of Object.entries(fields)) {
    chunks.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="${name}"\r\n\r\n${typeof value === 'string' ? value : JSON.stringify(value)}\r\n`));
  }
  for (const [index, file] of files.entries()) {
    if (!file.filename || /["\r\n]/.test(file.filename)) throw new Error('Invalid upload filename');
    const mime = mediaType === 'photo' || method === 'sendPhoto' || /\.jpe?g$/i.test(file.filename) ? 'image/jpeg' : 'application/octet-stream';
    chunks.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="${names[index]}"; filename="${file.filename}"\r\nContent-Type: ${mime}\r\n\r\n`));
    chunks.push(await readFile(file.path));
    chunks.push(Buffer.from('\r\n'));
  }
  chunks.push(Buffer.from(`--${boundary}--\r\n`));
  const body = Buffer.concat(chunks);
  return { body, headers: { 'Content-Type': `multipart/form-data; boundary=${boundary}`, 'Content-Length': String(body.length) } };
}

export class TelegramClient {
  constructor({ token, chatId, expectedUsername, fetchImpl = fetch, sleep = pause, attempts = 5, readTimeout = 15000 }) {
    token = token?.trim(); chatId = chatId?.trim();
    if (!token || !/^[1-9]\d*$/.test(chatId || '')) throw new Error('TELEGRAM_BOT_TOKEN and a numeric private TELEGRAM_CHAT_ID are required');
    Object.assign(this, { token, chatId, expectedUsername, fetch: fetchImpl, sleep, attempts, readTimeout });
  }
  async request(method, fields = {}, files = [], mediaType) {
    const isRead = ['getChat', 'getMe'].includes(method);
    for (let attempt = 0; attempt < this.attempts; attempt++) {
      const params = { ...(method === 'getMe' ? {} : { chat_id: this.chatId }), ...fields };
      if (method === 'sendMessage') params.link_preview_options = { is_disabled: true };
      let body, headers;
      if (files.length === 0) {
        // Telegram accepts JSON for non-file methods. Do not send an empty
        // multipart body to getMe or use multipart for connection checks.
        body = JSON.stringify(params); headers = { 'Content-Type': 'application/json' };
      } else {
        ({ body, headers } = await multipartUpload(method, params, files, mediaType));
      }
      let response, raw;
      try {
        response = await this.fetch(`https://api.telegram.org/bot${this.token}/${method}`, { method: 'POST', headers, body, signal: AbortSignal.timeout(isRead ? this.readTimeout : 120000) });
        raw = await response.text();
      } catch (cause) {
        if (isRead && attempt + 1 < this.attempts) { await this.sleep(2 ** attempt * 1000); continue; }
        const code = String(cause.cause?.code || cause.code || cause.name || 'transport-error').replace(/[^A-Za-z0-9_-]/g, '');
        const error = new Error(`Telegram ${method} transport failure (${code}); ${isRead ? 'no content was sent' : 'outcome is unknown; automatic resend is stopped'}.`);
        error.ambiguous = !isRead; throw error;
      }
      let result;
      try { result = JSON.parse(raw); }
      catch {
        if (isRead && response.status >= 500 && attempt + 1 < this.attempts) { await this.sleep(2 ** attempt * 1000); continue; }
        const error = new Error(`Telegram ${method} returned a non-JSON response (HTTP ${response.status}).`);
        error.ambiguous = !isRead; throw error;
      }
      if (response.ok && result.ok) return result.result;
      const code = result.error_code || response.status;
      if (result.ok === false && (code === 429 || code >= 500) && attempt + 1 < this.attempts) {
        await this.sleep(Math.max(1, result.parameters?.retry_after || 2 ** attempt) * 1000); continue;
      }
      let detail = String(result.description || '');
      for (const secret of [this.token, this.chatId]) detail = detail.split(secret).join('[REDACTED]');
      const error = new Error(`Telegram ${method} rejected the request (${code})${detail ? ': ' + detail : '.'}`);
      error.ambiguous = result.ok !== false; throw error;
    }
  }
  async verifyPrivateChat() {
    if (this.expectedUsername) {
      const bot = await this.request('getMe');
      if (bot.username?.toLowerCase() !== this.expectedUsername.replace(/^@/, '').toLowerCase()) throw new Error('Telegram token belongs to a different bot; refusing delivery');
      if (String(bot.id) === this.chatId) throw new Error('TELEGRAM_CHAT_ID points to the bot itself, not your private user chat. Start the bot and configure your personal chat ID.');
    }
    const chat = await this.request('getChat');
    if (chat.type !== 'private' || String(chat.id) !== this.chatId) throw new Error('Configured destination is not the exact private chat; refusing delivery');
  }
}
