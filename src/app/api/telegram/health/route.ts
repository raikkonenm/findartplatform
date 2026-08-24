// Health check for the ingest bot.
//
// Returns:
//   - normalizationMode: "deterministic" or "claude"
//   - githubTargetBranch: the actual target branch value (non-secret)
//   - allowProductionPublish: boolean form of ALLOW_PRODUCTION_PUBLISH
//   - env: presence booleans for every required env var (never the values)
//
// Never returns secret values.

import { NextResponse } from "next/server";
import { normalizationMode } from "@/lib/ingest/mode";
import { allowProductionPublish, telegramWebhookSecret } from "@/lib/ingest/env";
import { getWebhookInfo, setWebhook } from "@/lib/ingest/telegram/api";

const INGEST_BRANCH_ALIAS =
  "findartplatform-git-ai-ingest-test-maria-raikkonen-s-projects.vercel.app";

const ALWAYS_REQUIRED = [
  "TELEGRAM_BOT_TOKEN",
  "TELEGRAM_WEBHOOK_SECRET",
  "TELEGRAM_ALLOWED_USER_IDS",
  "BLOB_READ_WRITE_TOKEN",
  "GITHUB_REPO",
  "GITHUB_TOKEN",
  "GITHUB_TARGET_BRANCH",
];

export async function GET(request: Request) {
  const mode = normalizationMode();
  const required = mode === "claude"
    ? [...ALWAYS_REQUIRED, "ANTHROPIC_API_KEY"]
    : ALWAYS_REQUIRED;
  const env = Object.fromEntries(
    required.map((name) => [name, Boolean(process.env[name])]),
  );

  let webhook: {
    configured: boolean;
    url?: string;
    pendingUpdateCount?: number;
    lastErrorMessage?: string;
  } | undefined;

  // The stable Git branch alias is the only endpoint allowed to repair the
  // webhook. It never accepts a caller-provided URL and never returns secrets.
  if (new URL(request.url).host === INGEST_BRANCH_ALIAS) {
    const webhookUrl = `https://${INGEST_BRANCH_ALIAS}/api/telegram/webhook`;
    await setWebhook({
      url: webhookUrl,
      secret_token: telegramWebhookSecret(),
      allowed_updates: ["message", "callback_query"],
      drop_pending_updates: false,
    });
    const info = await getWebhookInfo();
    webhook = {
      configured: info.url === webhookUrl,
      url: info.url,
      pendingUpdateCount: info.pending_update_count,
      lastErrorMessage: info.last_error_message,
    };
  }

  return NextResponse.json({
    ok: true,
    normalizationMode: mode,
    githubTargetBranch: process.env.GITHUB_TARGET_BRANCH ?? null,
    allowProductionPublish: allowProductionPublish(),
    env,
    webhook,
  });
}
