// Tiny typed fetch wrapper around the Telegram Bot API. We deliberately
// avoid an SDK — the calls we use are small, and staying on fetch keeps
// the Node runtime unambiguous. Photo methods support both URL strings
// and raw Buffers; buffers upload via multipart, which lets us serve
// media out of a private Vercel Blob without minting signed URLs.

import { telegramBotToken } from "../env";

const BASE = "https://api.telegram.org";

// InlineKeyboardMarkup with a single row of callback buttons, which
// is all the ingest bot ever renders.
export type InlineKeyboard = {
  inline_keyboard: Array<Array<{
    text: string;
    callback_data: string;
  }>>;
};

async function call<T = unknown>(method: string, body: Record<string, unknown>): Promise<T> {
  const token = telegramBotToken();
  const response = await fetch(`${BASE}/bot${token}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const json = (await response.json()) as { ok: boolean; result?: T; description?: string };
  if (!response.ok || !json.ok) {
    // Never surface the raw token in error text — the URL contains it.
    // Description from Telegram is safe to include.
    throw new Error(`Telegram ${method} failed: ${json.description ?? response.status}`);
  }
  return json.result as T;
}

async function callForm<T = unknown>(method: string, form: FormData): Promise<T> {
  const token = telegramBotToken();
  const response = await fetch(`${BASE}/bot${token}/${method}`, {
    method: "POST",
    body: form,
    cache: "no-store",
  });
  const json = (await response.json()) as { ok: boolean; result?: T; description?: string };
  if (!response.ok || !json.ok) {
    throw new Error(`Telegram ${method} failed: ${json.description ?? response.status}`);
  }
  return json.result as T;
}

// A photo source is either an absolute URL (Telegram fetches it) or a
// raw image Buffer (Telegram receives it multipart). This is the only
// place in the pipeline that needs to know the difference.
export type PhotoSource = string | { buffer: Buffer; filename?: string; contentType?: string };

function isBufferSource(source: PhotoSource): source is { buffer: Buffer; filename?: string; contentType?: string } {
  return typeof source === "object" && source !== null && Buffer.isBuffer(source.buffer);
}

function bufferToBlob(source: { buffer: Buffer; filename?: string; contentType?: string }): Blob {
  const contentType = source.contentType ?? "image/webp";
  // Convert Buffer to Uint8Array so it matches Blob's expected BlobPart.
  // Fresh Uint8Array so Blob doesn't hold on to Node's Buffer internals.
  const view = new Uint8Array(source.buffer.buffer, source.buffer.byteOffset, source.buffer.byteLength).slice();
  return new Blob([view], { type: contentType });
}

export type SentMessage = { message_id: number; chat: { id: number } };

export type WebhookInfo = {
  url: string;
  pending_update_count?: number;
  last_error_date?: number;
  last_error_message?: string;
  max_connections?: number;
  allowed_updates?: string[];
};

export function setWebhook(params: {
  url: string;
  secret_token: string;
  allowed_updates: string[];
  drop_pending_updates?: boolean;
}): Promise<unknown> {
  return call("setWebhook", params);
}

export function getWebhookInfo(): Promise<WebhookInfo> {
  return call<WebhookInfo>("getWebhookInfo", {});
}

export async function downloadTelegramPhoto(fileId: string): Promise<Buffer> {
  const file = await call<{ file_path?: string }>("getFile", { file_id: fileId });
  if (!file.file_path) throw new Error("Telegram did not return an image file path");

  const response = await fetch(`${BASE}/file/bot${telegramBotToken()}/${file.file_path}`, {
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Telegram image download failed: HTTP ${response.status}`);
  return Buffer.from(await response.arrayBuffer());
}

export function sendMessage(params: {
  chat_id: number;
  text: string;
  parse_mode?: "HTML" | "MarkdownV2";
  disable_web_page_preview?: boolean;
  reply_markup?: InlineKeyboard;
}): Promise<SentMessage> {
  return call<SentMessage>("sendMessage", params);
}

export function sendPhoto(params: {
  chat_id: number;
  photo: PhotoSource;
  caption?: string;
  parse_mode?: "HTML" | "MarkdownV2";
  reply_markup?: InlineKeyboard;
}): Promise<SentMessage> {
  if (isBufferSource(params.photo)) {
    const form = new FormData();
    form.append("chat_id", String(params.chat_id));
    if (params.caption) form.append("caption", params.caption);
    if (params.parse_mode) form.append("parse_mode", params.parse_mode);
    if (params.reply_markup) form.append("reply_markup", JSON.stringify(params.reply_markup));
    form.append("photo", bufferToBlob(params.photo), params.photo.filename ?? "cover.webp");
    return callForm<SentMessage>("sendPhoto", form);
  }
  return call<SentMessage>("sendPhoto", {
    chat_id: params.chat_id,
    photo: params.photo,
    caption: params.caption,
    parse_mode: params.parse_mode,
    reply_markup: params.reply_markup,
  });
}

export function editMessageReplyMarkup(params: {
  chat_id: number;
  message_id: number;
  reply_markup?: InlineKeyboard;
}): Promise<unknown> {
  return call("editMessageReplyMarkup", params);
}

export function editMessageText(params: {
  chat_id: number;
  message_id: number;
  text: string;
  parse_mode?: "HTML" | "MarkdownV2";
  disable_web_page_preview?: boolean;
  reply_markup?: InlineKeyboard;
}): Promise<unknown> {
  return call("editMessageText", params);
}

export function editMessageCaption(params: {
  chat_id: number;
  message_id: number;
  caption: string;
  parse_mode?: "HTML" | "MarkdownV2";
  reply_markup?: InlineKeyboard;
}): Promise<unknown> {
  return call("editMessageCaption", params);
}

// InputMediaPhoto payload with either an inline URL/file_id or a
// Buffer that will be attached via multipart.
export type MediaPhotoInput = {
  type: "photo";
  media: PhotoSource;
  caption?: string;
  parse_mode?: "HTML" | "MarkdownV2";
};

export function editMessageMedia(params: {
  chat_id: number;
  message_id: number;
  media: MediaPhotoInput;
  reply_markup?: InlineKeyboard;
}): Promise<unknown> {
  const { media } = params;
  if (isBufferSource(media.media)) {
    // Telegram's multipart pattern: `media.media` becomes "attach://<name>"
    // and the actual bytes are added as a separate form part with the same
    // name.
    const attachName = "cover";
    const mediaJson: Record<string, unknown> = {
      type: "photo",
      media: `attach://${attachName}`,
    };
    if (media.caption) mediaJson.caption = media.caption;
    if (media.parse_mode) mediaJson.parse_mode = media.parse_mode;

    const form = new FormData();
    form.append("chat_id", String(params.chat_id));
    form.append("message_id", String(params.message_id));
    form.append("media", JSON.stringify(mediaJson));
    if (params.reply_markup) form.append("reply_markup", JSON.stringify(params.reply_markup));
    form.append(attachName, bufferToBlob(media.media), media.media.filename ?? "cover.webp");
    return callForm("editMessageMedia", form);
  }
  return call("editMessageMedia", {
    chat_id: params.chat_id,
    message_id: params.message_id,
    media: {
      type: "photo",
      media: media.media,
      caption: media.caption,
      parse_mode: media.parse_mode,
    },
    reply_markup: params.reply_markup,
  });
}

export function answerCallbackQuery(params: {
  callback_query_id: string;
  text?: string;
  show_alert?: boolean;
}): Promise<unknown> {
  return call("answerCallbackQuery", params);
}
