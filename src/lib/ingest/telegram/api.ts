// Tiny typed fetch wrapper around the Telegram Bot API. We deliberately
// avoid an SDK — the four calls we use are small, and staying on
// `fetch` keeps the edge/node compatibility unambiguous.

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
  photo: string;              // URL
  caption?: string;
  parse_mode?: "HTML" | "MarkdownV2";
  reply_markup?: InlineKeyboard;
}): Promise<SentMessage> {
  return call<SentMessage>("sendPhoto", params);
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

export function editMessageMedia(params: {
  chat_id: number;
  message_id: number;
  media: {
    type: "photo";
    media: string;
    caption?: string;
    parse_mode?: "HTML" | "MarkdownV2";
  };
  reply_markup?: InlineKeyboard;
}): Promise<unknown> {
  return call("editMessageMedia", params);
}

export function answerCallbackQuery(params: {
  callback_query_id: string;
  text?: string;
  show_alert?: boolean;
}): Promise<unknown> {
  return call("answerCallbackQuery", params);
}
