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
  const lines: string[] = ["<b>NEW EXHIBITION</b>", "", `<b>${escapeHtml(n.title)}</b>`];

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
  lines.push(escapeHtml(n.description));

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

export function reviewKeyboard(draftId: string): InlineKeyboard {
  // Callback payloads are constrained by Telegram to ≤ 64 bytes.
  // Prefix + uuid fits well within.
  return {
    inline_keyboard: [
      [
        { text: "✅ PUBLISH", callback_data: `publish:${draftId}` },
        { text: "🗑 REJECT", callback_data: `reject:${draftId}` },
      ],
    ],
  };
}

export function statusText(prefix: string, draft: Draft): string {
  return `${prefix} — <b>${escapeHtml(draft.normalized.title)}</b>`;
}
