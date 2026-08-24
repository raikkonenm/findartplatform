// Telegram webhook — the only public entrypoint for the ingest bot.
//
// Security model:
//   - Verify X-Telegram-Bot-Api-Secret-Token before touching anything.
//   - Reject any update whose sender is not in TELEGRAM_ALLOWED_USER_IDS.
//   - Never surface tokens or Blob URLs to the sender.
//
// Flow:
//   message with a URL  → ingest pipeline → preview + [PUBLISH] [REJECT]
//   callback publish    → atomic GitHub commit → success message
//   callback reject     → mark rejected, best-effort clean Blob assets

import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { isAllowedUser, verifySecretHeader } from "@/lib/ingest/telegram/auth";
import {
  answerCallbackQuery,
  editMessageText,
  sendMessage,
} from "@/lib/ingest/telegram/api";
import { draftPreviewText, reviewKeyboard, statusText } from "@/lib/ingest/telegram/format";
import { fetchPage } from "@/lib/ingest/fetchPage";
import { normalizeScrape } from "@/lib/ingest/normalize";
import { downloadImages } from "@/lib/ingest/images";
import { detectDuplicate } from "@/lib/ingest/duplicate";
import { deleteDraftAssets, getDraft, saveDraft } from "@/lib/ingest/drafts";
import { publishDraft } from "@/lib/ingest/publish";
import type { Draft } from "@/lib/ingest/types";

export const runtime = "nodejs";
// Give ourselves headroom for a fetch → Claude → image downloads pass.
// Vercel Hobby caps this at 60s regardless; the constant keeps intent clear.
export const maxDuration = 300;

// ---------- Telegram update shape (only the fields we read) ----------
type TgUser = { id?: number };
type TgChat = { id: number };
type TgMessage = { message_id: number; from?: TgUser; chat: TgChat; text?: string };
type TgCallback = {
  id: string;
  from: TgUser;
  message?: { message_id: number; chat: TgChat };
  data?: string;
};
type TgUpdate = { message?: TgMessage; callback_query?: TgCallback };

function firstUrl(text: string): string | undefined {
  const match = text.match(/https?:\/\/[^\s<>()"']+/i);
  return match ? match[0] : undefined;
}

// ---------- Telegram entrypoint ----------
export async function POST(request: Request) {
  // Step 1: header check. Telegram signs every webhook call with the
  // secret we configured on setWebhook. Reject on mismatch without
  // reading the body.
  if (!verifySecretHeader(request.headers.get("x-telegram-bot-api-secret-token"))) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  let update: TgUpdate;
  try {
    update = (await request.json()) as TgUpdate;
  } catch {
    return NextResponse.json({ ok: false }, { status: 200 });
  }

  // Telegram retries webhooks that return non-2xx. Every path below
  // returns 200 with { ok: true } so failed ingests don't storm us.
  try {
    if (update.message) {
      await handleMessage(update.message);
    } else if (update.callback_query) {
      await handleCallback(update.callback_query);
    }
  } catch (error) {
    // Log to server logs only; NEVER echo back the raw error to Telegram
    // — it might contain a token from an upstream failure text.
    console.error("[telegram-webhook] unhandled error", (error as Error).message);
  }

  return NextResponse.json({ ok: true });
}

// ---------- Message handler ----------
async function handleMessage(message: TgMessage): Promise<void> {
  const userId = message.from?.id;
  if (!isAllowedUser(userId)) return;
  const chatId = message.chat.id;

  const text = message.text?.trim();
  if (!text) return;

  // /start / /help hint so a fresh bot has an obvious entrypoint.
  if (text.startsWith("/start") || text.startsWith("/help")) {
    await sendMessage({
      chat_id: chatId,
      text:
        "Send me an exhibition or artist URL. I'll scrape it, ask Claude to normalize it, and reply with a preview + PUBLISH / REJECT.",
      disable_web_page_preview: true,
    });
    return;
  }

  const url = firstUrl(text);
  if (!url) {
    await sendMessage({ chat_id: chatId, text: "No URL found in that message." });
    return;
  }

  // Acknowledge fast so the user sees the pipeline started.
  const ack = await sendMessage({
    chat_id: chatId,
    text: `⏳ Ingesting ${url}\nFetching → Claude → images…`,
    disable_web_page_preview: true,
  });

  // Ingest.
  let draft: Draft;
  try {
    draft = await ingest(url, chatId);
  } catch (error) {
    await editMessageText({
      chat_id: chatId,
      message_id: ack.message_id,
      text: `❌ Ingest failed: ${escapeUser((error as Error).message)}`,
      disable_web_page_preview: true,
    });
    return;
  }

  // Send the preview as a fresh message so the ack stays as history.
  const preview = await sendMessage({
    chat_id: chatId,
    text: draftPreviewText(draft),
    parse_mode: "HTML",
    disable_web_page_preview: true,
    reply_markup: reviewKeyboard(draft.id),
  });

  await saveDraft({
    ...draft,
    telegramChatId: chatId,
    telegramMessageId: preview.message_id,
  });
}

// ---------- Callback handler ----------
async function handleCallback(callback: TgCallback): Promise<void> {
  const userId = callback.from?.id;
  if (!isAllowedUser(userId)) {
    await answerCallbackQuery({
      callback_query_id: callback.id,
      text: "Not authorized",
      show_alert: true,
    });
    return;
  }

  const data = callback.data ?? "";
  const [action, draftId] = data.split(":", 2);
  if (!action || !draftId || !callback.message) {
    await answerCallbackQuery({ callback_query_id: callback.id });
    return;
  }

  const draft = await getDraft(draftId);
  if (!draft) {
    await answerCallbackQuery({
      callback_query_id: callback.id,
      text: "Draft not found",
      show_alert: true,
    });
    return;
  }

  // Idempotency guard — a double-tap on PUBLISH never creates two
  // entries. `publishing` is the transitional state we set BEFORE
  // touching GitHub, so a concurrent callback sees it and stops.
  if (action === "publish") {
    if (draft.state === "published") {
      await answerCallbackQuery({
        callback_query_id: callback.id,
        text: "Already published",
      });
      return;
    }
    if (draft.state === "publishing") {
      await answerCallbackQuery({
        callback_query_id: callback.id,
        text: "Publish already in progress",
      });
      return;
    }
    if (draft.state === "rejected") {
      await answerCallbackQuery({
        callback_query_id: callback.id,
        text: "Already rejected",
      });
      return;
    }

    // Ack fast, then do the atomic commit.
    await answerCallbackQuery({ callback_query_id: callback.id, text: "Publishing…" });

    const publishing: Draft = { ...draft, state: "publishing" };
    await saveDraft(publishing);
    await editMessageText({
      chat_id: callback.message.chat.id,
      message_id: callback.message.message_id,
      text: statusText("⏳ Publishing", publishing),
      parse_mode: "HTML",
      disable_web_page_preview: true,
    });

    try {
      const result = await publishDraft(publishing);
      const published: Draft = {
        ...publishing,
        state: "published",
        publishedCommitSha: result.commitSha,
        publishedAt: new Date().toISOString(),
      };
      await saveDraft(published);
      // Best-effort blob cleanup.
      await deleteDraftAssets(published.id);
      await editMessageText({
        chat_id: callback.message.chat.id,
        message_id: callback.message.message_id,
        text:
          `${statusText("✅ Published", published)}\n` +
          `<code>${escapeUser(result.commitSha.slice(0, 7))}</code> · attempts ${result.attempts}`,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      });
    } catch (error) {
      const failed: Draft = {
        ...publishing,
        state: "failed",
        failureReason: (error as Error).message,
      };
      await saveDraft(failed);
      await editMessageText({
        chat_id: callback.message.chat.id,
        message_id: callback.message.message_id,
        text: `❌ Publish failed: ${escapeUser((error as Error).message)}`,
        disable_web_page_preview: true,
      });
    }
    return;
  }

  if (action === "reject") {
    if (draft.state === "published") {
      await answerCallbackQuery({
        callback_query_id: callback.id,
        text: "Already published — cannot reject",
        show_alert: true,
      });
      return;
    }
    await answerCallbackQuery({ callback_query_id: callback.id, text: "Rejected" });
    const rejected: Draft = { ...draft, state: "rejected" };
    await saveDraft(rejected);
    await deleteDraftAssets(draft.id);
    await editMessageText({
      chat_id: callback.message.chat.id,
      message_id: callback.message.message_id,
      text: statusText("🗑 Rejected", rejected),
      parse_mode: "HTML",
      disable_web_page_preview: true,
    });
    return;
  }

  await answerCallbackQuery({ callback_query_id: callback.id });
}

// ---------- Ingest pipeline ----------
async function ingest(url: string, chatId: number): Promise<Draft> {
  const scrape = await fetchPage(url);
  const normalization = await normalizeScrape(scrape);

  const dupe = detectDuplicate(normalization.normalized);
  if (dupe.hardConflict) {
    throw new Error(
      `Duplicate ${dupe.hardConflict.reason}: existing slug "${dupe.hardConflict.existingSlug}"`,
    );
  }

  const warnings = [...normalization.warnings];
  if (dupe.softMatches.length > 0) {
    for (const m of dupe.softMatches) {
      warnings.push(
        `Possible duplicate of "${m.existingTitle}" (similarity ${m.similarity})`,
      );
    }
  }

  const draftId = randomUUID();
  const download = await downloadImages(draftId, scrape.imageCandidates);
  for (const w of download.warnings) warnings.push(w);

  const now = new Date().toISOString();
  const draft: Draft = {
    id: draftId,
    state: "pending_review",
    sourceUrl: url,
    source: scrape.source,
    createdAt: now,
    updatedAt: now,
    normalized: normalization.normalized,
    images: download.images,
    warnings,
    missingFields: normalization.missingFields,
    confidence: normalization.confidence,
    telegramChatId: chatId,
  };
  await saveDraft(draft);
  return draft;
}

// User-safe escaping for text that goes into Telegram HTML mode.
function escapeUser(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .slice(0, 500);
}
