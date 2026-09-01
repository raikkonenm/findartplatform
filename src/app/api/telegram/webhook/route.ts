// Telegram webhook — the only public entrypoint for the ingest bot.
//
// Security model:
//   - Verify X-Telegram-Bot-Api-Secret-Token before touching anything.
//   - Reject any update whose sender is not in TELEGRAM_ALLOWED_USER_IDS.
//   - Never surface tokens or Blob URLs to the sender.
//
// Flow:
//   message text + optional URL/photos → ingest pipeline → preview + controls
//   callback publish    → atomic GitHub commit → success message
//   callback reject     → mark rejected, best-effort clean Blob assets

import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { isAllowedUser, verifySecretHeader } from "@/lib/ingest/telegram/auth";
import {
  answerCallbackQuery,
  editMessageCaption,
  editMessageMedia,
  editMessageText,
  downloadTelegramPhoto,
  sendPhoto,
  sendMessage,
} from "@/lib/ingest/telegram/api";
import {
  draftReviewCaption,
  draftPreviewText,
  reviewKeyboard,
  statusText,
} from "@/lib/ingest/telegram/format";
import { fetchPage, ManualReviewRequiredError } from "@/lib/ingest/fetchPage";
import { normalizeScrape } from "@/lib/ingest/normalize";
import { downloadImages } from "@/lib/ingest/images";
import { detectDuplicate } from "@/lib/ingest/duplicate";
import {
  deleteDraftAssets,
  getDraft,
  getDraftAwaitingEdit,
  readPrivateDraftBlob,
  saveDraft,
} from "@/lib/ingest/drafts";
import { publishDraft } from "@/lib/ingest/publish";
import type { Draft, ScrapeResult, ScrapedImage } from "@/lib/ingest/types";
import { exhibitionSlug } from "@/lib/ingest/taxonomy";

export const runtime = "nodejs";
// Give ourselves headroom for a fetch → normalization → image downloads pass.
// Vercel Hobby caps this at 60s regardless; the constant keeps intent clear.
export const maxDuration = 300;

// ---------- Telegram update shape (only the fields we read) ----------
type TgUser = { id?: number };
type TgChat = { id: number };
type TgPhoto = {
  file_id: string;
  width?: number;
  height?: number;
  file_size?: number;
};
type TgMessage = {
  message_id: number;
  from?: TgUser;
  chat: TgChat;
  text?: string;
  caption?: string;
  photo?: TgPhoto[];
};
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

  const text = (message.text ?? message.caption)?.trim() ?? "";
  const hasPhoto = Boolean(message.photo?.length);
  if (!text && !hasPhoto) return;

  // An EDIT action turns the next text message from this chat into a focused
  // patch for the pending draft instead of creating a second draft.
  if (text) {
    const draftAwaitingEdit = await getDraftAwaitingEdit(chatId);
    if (draftAwaitingEdit) {
      await applyDraftEdit(draftAwaitingEdit, text);
      return;
    }
  }

  // /start / /help hint so a fresh bot has an obvious entrypoint.
  if (text.startsWith("/start") || text.startsWith("/help")) {
    await sendMessage({
      chat_id: chatId,
      text:
        "Send exhibition text, optionally with a source URL and photos. I'll create a deterministic draft and reply with a cover preview + PUBLISH / REJECT.",
      disable_web_page_preview: true,
    });
    return;
  }

  const url = firstUrl(text);
  const telegramImages = await telegramPhotoCandidates(message.photo);

  // Acknowledge fast so the user sees the pipeline started.
  const ack = await sendMessage({
    chat_id: chatId,
    text: url
      ? `⏳ Ingesting ${url}\nFetching → deterministic draft → images…`
      : "⏳ Creating a draft from your text and images…",
    disable_web_page_preview: true,
  });

  // Ingest.
  let draft: Draft;
  try {
    draft = await ingest({ url, rawText: text, imageCandidates: telegramImages, chatId });
  } catch (error) {
    if (error instanceof ManualReviewRequiredError) {
      await editMessageText({
        chat_id: chatId,
        message_id: ack.message_id,
        text: `⚠️ ${escapeUser(error.message)}`,
        disable_web_page_preview: true,
      });
      return;
    }
    await editMessageText({
      chat_id: chatId,
      message_id: ack.message_id,
      text: `❌ Ingest failed: ${escapeUser((error as Error).message)}`,
      disable_web_page_preview: true,
    });
    return;
  }

  // Send the selected cover first, then attach the callback keyboard to a
  // normal text message. Telegram supports inline keyboards on media, but a
  // dedicated review message makes the controls reliable across clients.
  const cover = selectedCover(draft);
  const coverPreview = cover
    ? await sendPhoto({
        chat_id: chatId,
        photo: { buffer: await readPrivateDraftBlob(cover.blobUrl), filename: cover.filename },
        caption: draftReviewCaption(draft),
        parse_mode: "HTML",
      })
    : undefined;

  // Instagram gates most anonymous server-side image fetches now — if the
  // extractor came back with 0 images from an Instagram source, tell the
  // user explicitly instead of silently sending a text-only preview.
  if (!cover && draft.source === "instagram.com") {
    await sendMessage({
      chat_id: chatId,
      text:
        "⚠️ Instagram did not expose photos for that post to server-side scraping.\n" +
        "Send the actual photos and the URL together in one Telegram message and I'll merge them into the same draft.",
      disable_web_page_preview: true,
    });
  }
  const preview = await sendMessage({
    chat_id: chatId,
    text: draftPreviewText(draft),
    parse_mode: "HTML",
    disable_web_page_preview: true,
    reply_markup: reviewKeyboard(draft),
  });

  await saveDraft({
    ...draft,
    telegramChatId: chatId,
    telegramMessageId: preview.message_id,
    telegramPreviewKind: "text",
    telegramCoverMessageId: coverPreview?.message_id,
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

  if (action === "type-exhibition" || action === "type-art-object") {
    if (draft.state !== "pending_review") {
      await answerCallbackQuery({
        callback_query_id: callback.id,
        text: "Type can only be changed before publishing",
        show_alert: true,
      });
      return;
    }

    const contentType = action === "type-art-object" ? "art-object" : "exhibition";
    const sourceTitle = draft.sourceTitle ?? draft.normalized.title;
    const artistName = draft.normalized.artists?.[0]?.trim() || draft.normalized.title;
    const title = contentType === "art-object" ? artistName : sourceTitle;
    const updated: Draft = {
      ...draft,
      contentType,
      sourceTitle,
      normalized: {
        ...draft.normalized,
        title,
        slug: exhibitionSlug(title, `draft-${draft.id}`),
        // An artwork card is indexed in the home feed by its artist name,
        // not by the source exhibition title.
        ...(contentType === "art-object" ? { artists: [artistName], subtitle: undefined } : {}),
      },
    };
    await saveDraft(updated);
    await refreshReviewPreview(updated);
    await answerCallbackQuery({
      callback_query_id: callback.id,
      text: contentType === "art-object" ? "Art object selected" : "Exhibition selected",
    });
    return;
  }

  if (action === "edit-title" || action === "edit-description") {
    if (draft.state !== "pending_review") {
      await answerCallbackQuery({
        callback_query_id: callback.id,
        text: "Fields can only be edited before publishing",
        show_alert: true,
      });
      return;
    }

    const editingField = action === "edit-title" ? "title" : "description";
    const pending: Draft = { ...draft, editingField };
    await saveDraft(pending);
    await answerCallbackQuery({ callback_query_id: callback.id });
    await sendMessage({
      chat_id: callback.message.chat.id,
      text:
        editingField === "title"
          ? "Send the replacement title. For ART OBJECT, send the artist's first and last name."
          : "Send the replacement description.",
      disable_web_page_preview: true,
    });
    return;
  }

  if (action === "cover-prev" || action === "cover-next") {
    if (draft.state !== "pending_review") {
      await answerCallbackQuery({
        callback_query_id: callback.id,
        text: "Cover can only be changed before publishing",
        show_alert: true,
      });
      return;
    }

    const updated = moveCover(draft, action === "cover-next" ? 1 : -1);
    if (!updated) {
      await answerCallbackQuery({ callback_query_id: callback.id, text: "No alternate cover" });
      return;
    }

    await saveDraft(updated);
    const cover = selectedCover(updated);
    if (cover && updated.telegramCoverMessageId) {
      await editMessageMedia({
        chat_id: callback.message.chat.id,
        message_id: updated.telegramCoverMessageId,
        media: {
          type: "photo",
          media: { buffer: await readPrivateDraftBlob(cover.blobUrl), filename: cover.filename },
          caption: draftReviewCaption(updated),
          parse_mode: "HTML",
        },
      });
    }

    if (updated.telegramPreviewKind === "photo" && cover) {
      // Supports review messages created by the earlier media-only preview.
      await editMessageMedia({
        chat_id: callback.message.chat.id,
        message_id: callback.message.message_id,
        media: {
          type: "photo",
          media: { buffer: await readPrivateDraftBlob(cover.blobUrl), filename: cover.filename },
          caption: draftReviewCaption(updated),
          parse_mode: "HTML",
        },
        reply_markup: reviewKeyboard(updated),
      });
    } else {
      await editMessageText({
        chat_id: callback.message.chat.id,
        message_id: callback.message.message_id,
        text: draftPreviewText(updated),
        parse_mode: "HTML",
        disable_web_page_preview: true,
        reply_markup: reviewKeyboard(updated),
      });
    }
    await answerCallbackQuery({ callback_query_id: callback.id, text: "Cover updated" });
    return;
  }

  // The first PUBLISH tap only asks for confirmation. It never touches
  // GitHub, so draft creation cannot turn into an accidental publication.
  if (action === "publish") {
    if (draft.state !== "pending_review") {
      await answerCallbackQuery({
        callback_query_id: callback.id,
        text: "This draft is no longer ready to publish",
        show_alert: true,
      });
      return;
    }

    const confirmation: Draft = {
      ...draft,
      state: "awaiting_publish_confirmation",
    };
    await saveDraft(confirmation);
    await editMessageText({
      chat_id: callback.message.chat.id,
      message_id: callback.message.message_id,
      text: `${draftPreviewText(confirmation)}\n\n<b>Confirm publication?</b>`,
      parse_mode: "HTML",
      disable_web_page_preview: true,
      reply_markup: reviewKeyboard(confirmation),
    });
    await answerCallbackQuery({ callback_query_id: callback.id, text: "Confirm publication" });
    return;
  }

  if (action === "cancel-publish") {
    if (draft.state !== "awaiting_publish_confirmation") {
      await answerCallbackQuery({ callback_query_id: callback.id });
      return;
    }
    const pending: Draft = { ...draft, state: "pending_review" };
    await saveDraft(pending);
    await editMessageText({
      chat_id: callback.message.chat.id,
      message_id: callback.message.message_id,
      text: draftPreviewText(pending),
      parse_mode: "HTML",
      disable_web_page_preview: true,
      reply_markup: reviewKeyboard(pending),
    });
    await answerCallbackQuery({ callback_query_id: callback.id, text: "Publication cancelled" });
    return;
  }

  // Idempotency guard — a double-tap on CONFIRM PUBLISH never creates two
  // entries. `publishing` is the transitional state we set BEFORE touching
  // GitHub, so a concurrent callback sees it and stops.
  if (action === "confirm-publish") {
    if (draft.state !== "awaiting_publish_confirmation") {
      await answerCallbackQuery({
        callback_query_id: callback.id,
        text: "Confirm publication from the current review message",
        show_alert: true,
      });
      return;
    }
    // Ack fast, then do the atomic commit after explicit confirmation.
    await answerCallbackQuery({ callback_query_id: callback.id, text: "Publishing…" });

    const publishing: Draft = { ...draft, state: "publishing" };
    await saveDraft(publishing);
    await updateReviewMessage(
      publishing,
      callback.message.chat.id,
      callback.message.message_id,
      statusText("⏳ Publishing", publishing),
    );

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
      await updateReviewMessage(
        published,
        callback.message.chat.id,
        callback.message.message_id,
        `${statusText("✅ Published", published)}\n` +
          `<code>${escapeUser(result.commitSha.slice(0, 7))}</code> · attempts ${result.attempts}`,
      );
    } catch (error) {
      const failed: Draft = {
        ...publishing,
        state: "failed",
        failureReason: (error as Error).message,
      };
      await saveDraft(failed);
      await updateReviewMessage(
        failed,
        callback.message.chat.id,
        callback.message.message_id,
        `❌ Publish failed: ${escapeUser((error as Error).message)}`,
      );
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
    await updateReviewMessage(
      rejected,
      callback.message.chat.id,
      callback.message.message_id,
      statusText("🗑 Rejected", rejected),
    );
    return;
  }

  await answerCallbackQuery({ callback_query_id: callback.id });
}

// ---------- Ingest pipeline ----------
async function ingest(input: {
  url?: string;
  rawText: string;
  imageCandidates: ScrapedImage[];
  chatId: number;
}): Promise<Draft> {
  const extracted = input.url ? await fetchPage(input.url) : undefined;
  const pastedText = input.url
    ? input.rawText.replace(input.url, "").trim()
    : input.rawText;
  const scrape: ScrapeResult = extracted
    ? {
        ...extracted,
        rawText: [pastedText, extracted.rawText].filter(Boolean).join("\n\n"),
        imageCandidates: [...input.imageCandidates, ...extracted.imageCandidates],
      }
    : {
        sourceUrl: "https://t.me",
        source: "telegram",
        extractor: "telegram",
        rawText: pastedText,
        structuredHints: { telegram: { messageText: pastedText } },
        imageCandidates: input.imageCandidates,
      };
  const normalization = await normalizeScrape(scrape);

  const dupe = detectDuplicate(normalization.normalized);
  if (dupe.hardConflict) {
    throw new Error(
      `Duplicate ${dupe.hardConflict.reason}: existing slug "${dupe.hardConflict.existingSlug}"`,
    );
  }

  const warnings = [...normalization.warnings];
  const instagramReviewMessage = (scrape.structuredHints.instagram as { reviewMessage?: unknown } | undefined)
    ?.reviewMessage;
  if (typeof instagramReviewMessage === "string") {
    warnings.push(instagramReviewMessage);
  }
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
    sourceUrl: input.url ?? "https://t.me",
    source: scrape.source,
    createdAt: now,
    updatedAt: now,
    normalized: normalization.normalized,
    images: download.images,
    warnings,
    missingFields: normalization.missingFields,
    confidence: normalization.confidence,
    sourceTitle: normalization.normalized.title,
    telegramChatId: input.chatId,
  };
  await saveDraft(draft);
  return draft;
}

async function applyDraftEdit(draft: Draft, rawValue: string): Promise<void> {
  const value = rawValue.trim();
  if (!value) return;

  const editingField = draft.editingField;
  if (!editingField) return;

  const normalized = { ...draft.normalized };
  let sourceTitle = draft.sourceTitle;
  if (editingField === "title") {
    const title = value.slice(0, 180);
    normalized.title = title;
    normalized.slug = exhibitionSlug(title, `draft-${draft.id}`);
    if (draft.contentType === "art-object") {
      normalized.artists = [title];
    } else {
      sourceTitle = title;
    }
  } else {
    normalized.description = value.slice(0, 12000);
  }

  const updated: Draft = {
    ...draft,
    normalized,
    sourceTitle,
    editingField: undefined,
  };
  await saveDraft(updated);
  await refreshReviewPreview(updated);
  await sendMessage({
    chat_id: draft.telegramChatId!,
    text: `${editingField === "title" ? "Title" : "Description"} updated. Review the draft and publish when ready.`,
    disable_web_page_preview: true,
  });
}

async function refreshReviewPreview(draft: Draft): Promise<void> {
  if (!draft.telegramChatId || !draft.telegramMessageId) return;
  const cover = selectedCover(draft);
  if (cover && draft.telegramCoverMessageId) {
    await editMessageMedia({
      chat_id: draft.telegramChatId,
      message_id: draft.telegramCoverMessageId,
      media: {
        type: "photo",
        media: { buffer: await readPrivateDraftBlob(cover.blobUrl), filename: cover.filename },
        caption: draftReviewCaption(draft),
        parse_mode: "HTML",
      },
    });
  }
  await editMessageText({
    chat_id: draft.telegramChatId,
    message_id: draft.telegramMessageId,
    text: draftPreviewText(draft),
    parse_mode: "HTML",
    disable_web_page_preview: true,
    reply_markup: reviewKeyboard(draft),
  });
}

// User-safe escaping for text that goes into Telegram HTML mode.
function escapeUser(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .slice(0, 500);
}

async function telegramPhotoCandidates(photos: TgPhoto[] | undefined): Promise<ScrapedImage[]> {
  const largest = photos?.at(-1);
  if (!largest) return [];

  const data = await downloadTelegramPhoto(largest.file_id);
  return [{
    url: `telegram:file:${largest.file_id}`,
    originalUrl: `telegram:file:${largest.file_id}`,
    data,
    width: largest.width,
    height: largest.height,
    reason: "Telegram upload",
  }];
}

function selectedCover(draft: Draft) {
  const selected = draft.images.filter((image) => image.selected);
  return selected.find((image) => image.cover) ?? selected[0];
}

function moveCover(draft: Draft, direction: 1 | -1): Draft | undefined {
  const selected = draft.images.filter((image) => image.selected);
  if (selected.length < 2) return undefined;

  const currentIndex = Math.max(0, selected.findIndex((image) => image.cover));
  const nextIndex = (currentIndex + direction + selected.length) % selected.length;
  const nextFilename = selected[nextIndex].filename;

  return {
    ...draft,
    images: draft.images.map((image) => ({
      ...image,
      cover: image.selected && image.filename === nextFilename,
    })),
  };
}

async function updateReviewMessage(
  draft: Draft,
  chatId: number,
  messageId: number,
  text: string,
): Promise<void> {
  const emptyKeyboard = { inline_keyboard: [] };
  if (draft.telegramPreviewKind === "photo") {
    await editMessageCaption({
      chat_id: chatId,
      message_id: messageId,
      caption: text,
      parse_mode: "HTML",
      reply_markup: emptyKeyboard,
    });
    return;
  }

  await editMessageText({
    chat_id: chatId,
    message_id: messageId,
    text,
    parse_mode: "HTML",
    disable_web_page_preview: true,
    reply_markup: emptyKeyboard,
  });
}
