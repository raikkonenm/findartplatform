// Two-layer webhook authentication:
//   1. Verify the header Telegram attaches to every webhook request
//      (X-Telegram-Bot-Api-Secret-Token) matches TELEGRAM_WEBHOOK_SECRET.
//      This is Telegram's official mechanism — we NEVER put the
//      secret in the URL path.
//   2. Verify the message / callback originates from a user in
//      TELEGRAM_ALLOWED_USER_IDS. `chat.id` is insufficient (bot can
//      be added to a chat where multiple users type) so we check the
//      user id on `from`.

import { telegramAllowedUserIds, telegramWebhookSecret } from "../env";

// Constant-time string comparison so a timing attack can't leak the
// secret one character at a time. Node's `timingSafeEqual` requires
// equal-length buffers — bail on length mismatch first to avoid a
// throw that could itself be a signal.
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export function verifySecretHeader(headerValue: string | null): boolean {
  if (!headerValue) return false;
  return safeEqual(headerValue, telegramWebhookSecret());
}

export function isAllowedUser(userId: number | undefined): boolean {
  if (userId === undefined || !Number.isFinite(userId)) return false;
  return telegramAllowedUserIds().has(userId);
}
