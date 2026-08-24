// Health check for the ingest bot.
//
// Returns:
//   - normalizationMode: "deterministic" | "claude"
//   - githubTargetBranch: the actual target branch value (non-secret)
//   - allowProductionPublish: boolean form of ALLOW_PRODUCTION_PUBLISH
//   - env: presence booleans for every required env var (never the values)
//
// Never returns secret values. In deterministic mode ANTHROPIC_API_KEY
// is not required and is omitted from the env-presence check so a
// deploy without a Claude key is not considered misconfigured.

import { NextResponse } from "next/server";
import { normalizationMode } from "@/lib/ingest/mode";
import { allowProductionPublish } from "@/lib/ingest/env";

const ALWAYS_REQUIRED = [
  "TELEGRAM_BOT_TOKEN",
  "TELEGRAM_WEBHOOK_SECRET",
  "TELEGRAM_ALLOWED_USER_IDS",
  "BLOB_READ_WRITE_TOKEN",
  "GITHUB_REPO",
  "GITHUB_TOKEN",
  "GITHUB_TARGET_BRANCH",
];

export async function GET() {
  const mode = normalizationMode();
  const required =
    mode === "claude" ? [...ALWAYS_REQUIRED, "ANTHROPIC_API_KEY"] : ALWAYS_REQUIRED;
  const env = Object.fromEntries(
    required.map((name) => [name, Boolean(process.env[name])]),
  );
  return NextResponse.json({
    ok: true,
    normalizationMode: mode,
    githubTargetBranch: process.env.GITHUB_TARGET_BRANCH ?? null,
    allowProductionPublish: allowProductionPublish(),
    env,
  });
}
