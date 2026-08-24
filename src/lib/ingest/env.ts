// Central env reader for the ingest pipeline. Every secret is read
// here and NEVER included in logs, error messages, or Telegram output.
// Consumers get a boolean or a small typed record — never the raw
// string when serializing.

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value || value.length === 0) {
    // Message deliberately omits the value; if the runtime shows this
    // in logs, only the var name leaks — never the secret.
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function telegramBotToken(): string {
  return requireEnv("TELEGRAM_BOT_TOKEN");
}

export function telegramWebhookSecret(): string {
  return requireEnv("TELEGRAM_WEBHOOK_SECRET");
}

// Parse allowlist from a comma-separated string. Numbers only —
// Telegram user IDs are always numeric.
export function telegramAllowedUserIds(): Set<number> {
  const raw = requireEnv("TELEGRAM_ALLOWED_USER_IDS");
  const ids = raw
    .split(",")
    .map((part) => part.trim())
    .filter((part) => /^\d+$/.test(part))
    .map((part) => Number.parseInt(part, 10));
  if (ids.length === 0) {
    throw new Error("TELEGRAM_ALLOWED_USER_IDS must contain at least one numeric user id");
  }
  return new Set(ids);
}

export function anthropicApiKey(): string {
  return requireEnv("ANTHROPIC_API_KEY");
}

export function blobReadWriteToken(): string {
  return requireEnv("BLOB_READ_WRITE_TOKEN");
}

export type GitHubConfig = {
  owner: string;
  repo: string;
  branch: string;
  token: string;
};

export function githubConfig(): GitHubConfig {
  const repoFull = requireEnv("GITHUB_REPO");           // "owner/name"
  const [owner, repo] = repoFull.split("/");
  if (!owner || !repo) {
    throw new Error("GITHUB_REPO must be in the form owner/name");
  }
  // Branch is intentionally required — no silent default to "main".
  // A misconfigured deploy must refuse to publish rather than pick a
  // target on its own.
  return {
    owner,
    repo,
    branch: requireEnv("GITHUB_TARGET_BRANCH"),
    token: requireEnv("GITHUB_TOKEN"),
  };
}

// Production write guard. Publishing to `main` is only allowed when
// ALLOW_PRODUCTION_PUBLISH is EXACTLY the string "true". Anything
// else (unset, "false", "1", "TRUE") is treated as "no".
//
// Called from the publisher before any GitHub write; the check runs
// in the caller so tests / dry-runs can be gated at the seam of their
// choice.
export function assertProductionPublishAllowed(branch: string): void {
  if (branch !== "main") return;
  if (process.env.ALLOW_PRODUCTION_PUBLISH === "true") return;
  throw new Error(
    "Refusing to publish to main: ALLOW_PRODUCTION_PUBLISH must be exactly \"true\".",
  );
}

export function allowProductionPublish(): boolean {
  return process.env.ALLOW_PRODUCTION_PUBLISH === "true";
}
