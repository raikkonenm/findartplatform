// Compact Telegram preview + inline keyboard. HTML parse mode so
// titles / venue names with markdown-heavy characters render safely.

import type { Draft } from "../types";
import type { InlineKeyboard } from "./api";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function draftPreviewText(draft: Draft): string {
  const n = draft.normalized;
  const lines: string[] = [`<b>NEW ${draftKindLabel(draft)}</b>`, "", `<b>${escapeHtml(n.title)}</b>`];

  if (n.subtitle) lines.push(`<i>${escapeHtml(n.subtitle)}</i>`);
  lines.push("");

  if (n.artists && n.artists.length > 0) {
    lines.push(`Artist: ${escapeHtml(n.artists.join(", "))}`);
  }
  const venue = n.gallery ?? n.venue;
  if (venue) lines.push(`Venue: ${escapeHtml(venue)}`);
  const location = [n.city, n.country].filter(Boolean).join(", ");
  if (location || n.year || n.dates) {
    lines.push(
      escapeHtml(
        [location, n.dates ?? n.year].filter(Boolean).join(" · "),
      ),
    );
  }
  lines.push("");

  if (n.tags.length > 0) {
    lines.push(`Tags: ${escapeHtml(n.tags.join(", "))}`);
  }

  const selected = draft.images.filter((image) => image.selected);
  if (selected.length > 0) {
    const coverIndex = selected.findIndex((image) => image.cover) + 1;
    lines.push(`Images: ${selected.length}${coverIndex > 0 ? ` · Cover: image ${coverIndex}` : ""}`);
  } else {
    lines.push("Images: 0");
  }
  lines.push("");

  lines.push("Description:");
  // Telegram messages are capped at 4096 characters. The complete source
  // text remains in the draft for publishing; preview shows a concise slice.
  lines.push(escapeHtml(shortDescription(n.description, 1200)));

  if (draft.warnings.length > 0) {
    lines.push("");
    lines.push("<b>Warnings:</b>");
    for (const warning of draft.warnings) {
      lines.push(`• ${escapeHtml(warning)}`);
    }
  }
  if (draft.missingFields.length > 0) {
    lines.push("");
    lines.push(`Missing: ${escapeHtml(draft.missingFields.join(", "))}`);
  }
  if (typeof draft.confidence === "number") {
    lines.push("");
    lines.push(`Confidence: ${draft.confidence.toFixed(2)}`);
  }

  lines.push("");
  lines.push(`<a href="${draft.sourceUrl}">Source</a> · Draft <code>${escapeHtml(draft.id.slice(0, 8))}</code>`);

  return lines.join("\n");
}

function shortDescription(value: string, maxLength = 360): string {
  const collapsed = value.replace(/\s+/g, " ").trim();
  return collapsed.length > maxLength ? `${collapsed.slice(0, maxLength - 1).trimEnd()}…` : collapsed;
}

// Telegram photo captions have a much smaller limit than standard messages.
// Keep the review controls on the cover image while retaining the complete
// description in the source page and draft record.
export function draftReviewCaption(draft: Draft): string {
  const n = draft.normalized;
  const lines = [`<b>NEW ${draftKindLabel(draft)}</b>`, "", `<b>${escapeHtml(n.title)}</b>`];

  if (n.subtitle) lines.push(`<i>${escapeHtml(n.subtitle)}</i>`);
  const venue = n.gallery ?? n.venue;
  if (venue) lines.push(`Venue: ${escapeHtml(venue)}`);
  const location = [n.city, n.country].filter(Boolean).join(", ");
  if (location || n.year || n.dates) {
    lines.push(escapeHtml([location, n.dates ?? n.year].filter(Boolean).join(" · ")));
  }
  if (n.tags.length > 0) lines.push(`Tags: ${escapeHtml(n.tags.join(", "))}`);

  const selected = draft.images.filter((image) => image.selected);
  const coverIndex = selected.findIndex((image) => image.cover) + 1;
  lines.push(`Images: ${selected.length}${coverIndex > 0 ? ` · Cover: image ${coverIndex}` : ""}`);
  lines.push("", escapeHtml(shortDescription(n.description)));

  return lines.join("\n");
}

export function reviewKeyboard(draft: Draft): InlineKeyboard {
  // Callback payloads are constrained by Telegram to ≤ 64 bytes.
  // Prefix + uuid fits well within.
  const selectedCount = draft.images.filter((image) => image.selected).length;
  const coverControls = selectedCount > 1
    ? [[
        { text: "← COVER", callback_data: `cover-prev:${draft.id}` },
        { text: "COVER →", callback_data: `cover-next:${draft.id}` },
      ]]
    : [];

  if (draft.state === "awaiting_publish_confirmation") {
    return {
      inline_keyboard: [[
        { text: "✅ CONFIRM PUBLISH", callback_data: `confirm-publish:${draft.id}` },
        { text: "CANCEL", callback_data: `cancel-publish:${draft.id}` },
      ]],
    };
  }

  const typeControls = [[
    {
      text: `${draft.contentType === "exhibition" ? "✓ " : ""}EXHIBITION`,
      callback_data: `type-exhibition:${draft.id}`,
    },
    {
      text: `${draft.contentType === "art-object" ? "✓ " : ""}ART OBJECT`,
      callback_data: `type-art-object:${draft.id}`,
    },
  ]];
  const editControls = [[
    { text: "EDIT TITLE", callback_data: `edit-title:${draft.id}` },
    { text: "EDIT DESCRIPTION", callback_data: `edit-description:${draft.id}` },
  ]];

  return {
    inline_keyboard: [
      ...typeControls,
      ...editControls,
      ...coverControls,
      ...(draft.contentType
        ? [[
            { text: "✅ PUBLISH", callback_data: `publish:${draft.id}` },
            { text: "🗑 REJECT", callback_data: `reject:${draft.id}` },
          ]]
        : [[{ text: "🗑 REJECT", callback_data: `reject:${draft.id}` }]]),
    ],
  };
}

function draftKindLabel(draft: Draft): string {
  if (draft.contentType === "art-object") return "ART OBJECT";
  if (draft.contentType === "exhibition") return "EXHIBITION";
  return "DRAFT";
}

export function statusText(prefix: string, draft: Draft): string {
  return `${prefix} — <b>${escapeHtml(draft.normalized.title)}</b>`;
}
