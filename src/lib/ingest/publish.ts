// Atomic publish. Every published exhibition lands in ONE git commit:
//   - N image blobs at  public/exhibitions/<slug>/<filename>
//   - 1 modified TypeScript blob for src/data/exhibitions.ts
//
// If main moves between read-HEAD and update-ref we re-read HEAD and
// safely rebuild the commit on top of the new base. We NEVER
// force-update the branch — a race just fails the publish so main
// stays as the operator's collaborators left it.

import {
  createBlob,
  createCommit,
  createTree,
  getBranchHead,
  getCommit,
  getFileContent,
  type TreeItem,
} from "./github";
import { assertProductionPublishAllowed, githubConfig } from "./env";
import { endMarker, renderExhibitionSeed, startMarker } from "./seedTemplate";
import type { Draft, DraftImage } from "./types";

const EXHIBITIONS_TS_PATH = "src/data/exhibitions.ts";
const ARRAY_ANCHOR = "const exhibitionSeeds: ExhibitionSeed[] = [";
const TAG_MAP_ANCHOR =
  "const semanticTagAssignments: Record<string, SemanticTag[]> = {";
const MAX_ATTEMPTS = 3;

// Splice a new AI_INGEST_START/END block into the seed array at the
// top (so it "floats to the top of the feed" — matches the archive's
// convention for unlisted new seeds). If a block for this slug
// already exists, replace it in place instead — makes publish
// idempotent when a retry hits main after the first commit succeeded.
export function insertSeed(source: string, slug: string, seedBlock: string): string {
  const start = startMarker(slug);
  const end = endMarker(slug);

  if (source.includes(start) && source.includes(end)) {
    const startIndex = source.indexOf(start);
    const endIndex = source.indexOf(end, startIndex);
    const before = source.slice(0, startIndex + start.length);
    const after = source.slice(endIndex);
    return `${before}\n${seedBlock}\n${after}`;
  }

  const anchor = source.indexOf(ARRAY_ANCHOR);
  if (anchor === -1) {
    throw new Error("Could not find exhibitionSeeds array anchor in exhibitions.ts");
  }
  const insertPoint = anchor + ARRAY_ANCHOR.length;
  return `${source.slice(0, insertPoint)}\n${start}\n${seedBlock}\n${end}\n${source.slice(insertPoint)}`;
}

// Adds or replaces a tag assignment line inside semanticTagAssignments
// without touching any other line in the map. Returns the source
// unchanged when the slug already has the exact same tag set.
export function upsertTagAssignment(source: string, slug: string, tags: readonly string[]): string {
  const line = `  ${JSON.stringify(slug)}: [${tags.map((t) => JSON.stringify(t)).join(", ")}],`;
  const existing = new RegExp(`^ {2}${JSON.stringify(slug).replace(/[.*+?^${}()|[\\]\\\\]/g, "\\$&")}:.*$`, "m");

  if (existing.test(source)) {
    return source.replace(existing, line);
  }

  const anchor = source.indexOf(TAG_MAP_ANCHOR);
  if (anchor === -1) {
    // Absence isn't fatal: the archive can still render without an
    // entry (empty tag array). Log a soft failure by leaving source
    // untouched.
    return source;
  }
  const insertPoint = anchor + TAG_MAP_ANCHOR.length;
  return `${source.slice(0, insertPoint)}\n${line}${source.slice(insertPoint)}`;
}

function commitMessage(draft: Draft): string {
  const title = draft.normalized.title.replace(/\s+/g, " ").trim().slice(0, 72);
  const cityYear = [draft.normalized.city, draft.normalized.year].filter(Boolean).join(" ");
  return `AI ingest: ${title}${cityYear ? ` — ${cityYear}` : ""} [${draft.normalized.slug}]`;
}

async function buildTreeItems(
  draft: Draft,
  selectedImages: DraftImage[],
  updatedExhibitionsTs: string,
): Promise<TreeItem[]> {
  const items: TreeItem[] = [];

  // Image blobs — each downloaded from the private Blob draft.
  for (const image of selectedImages) {
    const response = await fetch(image.blobUrl, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Draft image ${image.filename} unavailable (HTTP ${response.status})`);
    }
    const buffer = Buffer.from(await response.arrayBuffer());
    const blob = await createBlob(buffer);
    items.push({
      path: `public/exhibitions/${draft.normalized.slug}/${image.filename}`,
      mode: "100644",
      type: "blob",
      sha: blob.sha,
    });
  }

  const seedBlob = await createBlob(updatedExhibitionsTs);
  items.push({
    path: EXHIBITIONS_TS_PATH,
    mode: "100644",
    type: "blob",
    sha: seedBlob.sha,
  });

  return items;
}

export type PublishResult = {
  commitSha: string;
  attempts: number;
};

export async function publishDraft(draft: Draft): Promise<PublishResult> {
  const cfg = githubConfig();
  // Production-write guard. Fails LOUD before any GitHub API call
  // when the target branch is main and ALLOW_PRODUCTION_PUBLISH is
  // not explicitly "true". Prevents an accidental production write
  // during testing on a preview branch.
  assertProductionPublishAllowed(cfg.branch);

  const selectedImages = draft.images.filter((image) => image.selected);
  if (selectedImages.length === 0) {
    throw new Error("No selected images — refusing to publish");
  }
  const seedBlock = renderExhibitionSeed(draft);

  let lastError: Error | undefined;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      // 1. Read current HEAD + base tree.
      const head = await getBranchHead(cfg);
      const headCommit = await getCommit(head.sha, cfg);

      // 2. Read the current exhibitions.ts from the same ref, splice
      //    the seed block, upsert the tag entry.
      const source = await getFileContent(EXHIBITIONS_TS_PATH, head.sha, cfg);
      let next = insertSeed(source, draft.normalized.slug, seedBlock);
      next = upsertTagAssignment(next, draft.normalized.slug, draft.normalized.tags);

      // 3. Create image blobs + TS blob → tree → commit.
      const items = await buildTreeItems(draft, selectedImages, next);
      const tree = await createTree(headCommit.tree.sha, items, cfg);
      const commit = await createCommit({
        message: commitMessage(draft),
        tree: tree.sha,
        parents: [head.sha],
        cfg,
      });

      // 4. Safe (non-force) ref update. Fails-loud on race.
      const { updateBranchRef } = await import("./github");
      await updateBranchRef(commit.sha, cfg);

      return { commitSha: commit.sha, attempts: attempt };
    } catch (error) {
      lastError = error as Error;
      // Only retry if the failure came from the ref update race; the
      // simplest heuristic is to retry on any transient error up to
      // MAX_ATTEMPTS. First two attempts fall through; the third
      // rethrows.
      if (attempt >= MAX_ATTEMPTS) throw lastError;
      // Small jittered backoff so parallel operators don't lockstep.
      await new Promise((r) => setTimeout(r, 250 + Math.random() * 500));
    }
  }

  // Unreachable, but keeps the type checker happy.
  throw lastError ?? new Error("publishDraft: exhausted retries");
}
