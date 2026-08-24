// Tiny fetch-based GitHub REST client covering just the endpoints the
// publisher needs. We use the Git Database API (blobs / trees / commits
// / refs) instead of the Contents API so we get ONE atomic commit for
// the seed change + every image at once.
//
// All calls are authenticated with a fine-grained PAT scoped to the
// repo. The token is never logged; errors surface only status codes.

import { githubConfig, type GitHubConfig } from "./env";

const API = "https://api.github.com";

async function gh<T = unknown>(
  cfg: GitHubConfig,
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      accept: "application/vnd.github+json",
      authorization: `Bearer ${cfg.token}`,
      "user-agent": "findart-ingest",
      "x-github-api-version": "2022-11-28",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });
  if (!response.ok) {
    // Response body may contain useful diagnostics; do NOT include the
    // token or headers we sent.
    let hint = "";
    try {
      const body = await response.text();
      hint = body.slice(0, 240);
    } catch {}
    throw new Error(`GitHub ${response.status} on ${path}: ${hint}`);
  }
  return response.json() as Promise<T>;
}

export type RefInfo = { sha: string };
export type CommitInfo = { sha: string; tree: { sha: string } };
export type BlobRef = { sha: string };
export type TreeItem = {
  path: string;
  mode: "100644" | "100755" | "040000" | "160000" | "120000";
  type: "blob" | "tree" | "commit";
  sha?: string;
};
export type TreeCreated = { sha: string };
export type CommitCreated = { sha: string; parents: Array<{ sha: string }> };

export async function getBranchHead(cfg = githubConfig()): Promise<{ sha: string }> {
  const ref = await gh<{ object: { sha: string } }>(
    cfg,
    `/repos/${cfg.owner}/${cfg.repo}/git/refs/heads/${cfg.branch}`,
  );
  return { sha: ref.object.sha };
}

export async function getCommit(sha: string, cfg = githubConfig()): Promise<CommitInfo> {
  return gh<CommitInfo>(cfg, `/repos/${cfg.owner}/${cfg.repo}/git/commits/${sha}`);
}

export async function getFileContent(
  path: string,
  ref: string,
  cfg = githubConfig(),
): Promise<string> {
  const encoded = encodeURIComponent(path);
  const data = await gh<{ content: string; encoding: string }>(
    cfg,
    `/repos/${cfg.owner}/${cfg.repo}/contents/${encoded}?ref=${encodeURIComponent(ref)}`,
  );
  if (data.encoding !== "base64") {
    throw new Error(`Unexpected file encoding for ${path}: ${data.encoding}`);
  }
  return Buffer.from(data.content, "base64").toString("utf8");
}

export async function createBlob(
  content: Buffer | string,
  cfg = githubConfig(),
): Promise<BlobRef> {
  const contentBase64 =
    typeof content === "string" ? Buffer.from(content, "utf8").toString("base64") : content.toString("base64");
  return gh<BlobRef>(cfg, `/repos/${cfg.owner}/${cfg.repo}/git/blobs`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ content: contentBase64, encoding: "base64" }),
  });
}

export async function createTree(
  baseTreeSha: string,
  tree: TreeItem[],
  cfg = githubConfig(),
): Promise<TreeCreated> {
  return gh<TreeCreated>(cfg, `/repos/${cfg.owner}/${cfg.repo}/git/trees`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ base_tree: baseTreeSha, tree }),
  });
}

export async function createCommit(params: {
  message: string;
  tree: string;
  parents: string[];
  cfg?: GitHubConfig;
}): Promise<CommitCreated> {
  const cfg = params.cfg ?? githubConfig();
  return gh<CommitCreated>(cfg, `/repos/${cfg.owner}/${cfg.repo}/git/commits`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      message: params.message,
      tree: params.tree,
      parents: params.parents,
    }),
  });
}

// Safe (non-force) branch update. If the branch has moved since we
// read HEAD, GitHub returns 422 and this call throws — the publisher
// retries with a fresh HEAD.
export async function updateBranchRef(
  commitSha: string,
  cfg = githubConfig(),
): Promise<void> {
  await gh(cfg, `/repos/${cfg.owner}/${cfg.repo}/git/refs/heads/${cfg.branch}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ sha: commitSha, force: false }),
  });
}
