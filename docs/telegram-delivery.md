# Telegram content delivery

Implementation is prepared locally. Live delivery is **off by default**. It sends only to the configured private user chat and never posts to Instagram. No deployment commands, website routes, styles or production configuration are changed.

## Configuration after dry-run review

In the GitHub repository `raikkonenm/findartplatform`, add Actions **secrets**:

| Secret | Value / purpose |
| --- | --- |
| `TELEGRAM_BOT_TOKEN` | BotFather's bot token. Never paste it in a chat, CLI argument, commit or public response. |
| `TELEGRAM_CHAT_ID` | Your numeric positive private user chat ID. Start the bot in Telegram first. Groups, channels and usernames are rejected. |

Add Actions **variables**:

| Variable | Value / purpose |
| --- | --- |
| `VERCEL_PROJECT_ID` | Actual `prj_...` ID of the FindArt project, from Vercel Settings. Other projects' events are ignored. |
| `TELEGRAM_STATE_ISSUE` | Number of a dedicated repository issue, e.g. titled “Telegram delivery ledger”. Keep its bot comments intact. |
| `TELEGRAM_DELIVERY_ENABLED` | Keep unset or `false` for preparation. Set to the exact string `true` only after reviewing and approving a package. |
| `TELEGRAM_MANUAL_DELIVERY_ENABLED` | Separate permission for approved manual sends. It can be `true` while automatic delivery remains `false`. |

Enable GitHub Actions, and keep the Vercel GitHub integration connected to this repository. The workflow must exist on the default branch before GitHub can trigger it automatically. Merge/publish this integration only under the human's normal publishing approval; this implementation does not do that for you.

The Actions token is supplied automatically. The workflow requests `contents: read` (checkout), `deployments: read` (verify manual resends), and `issues: write` (durable checkpoints). It does not need write permission to website code, a Vercel deployment token or Instagram credentials. Ensure repository/organization policy permits these token scopes and bot comments on the checkpoint issue. That issue is a ledger, not a public content feed: it contains IDs, hashes and message receipts, not secrets or full packages.

Manual live resends resolve the most recent active successful Production deployment in this repository through GitHub's Deployments API. Keep Vercel's **Deployment Events** enabled (its default), and reserve this repository's Production deployment environment for the actual FindArt site. If the deployment cannot be verified, manual live delivery fails closed. A manual dry-run can use the selected workflow commit without claiming it is published.

## Automatic flow

`.github/workflows/telegram-content.yml` observes Vercel `vercel.deployment.success` repository-dispatch events. It checks successful state, `production`, exact project ID, default branch and commit SHA. It checks out the **published SHA**, not the unrelated latest workflow SHA. The runner's engine comes from the trusted default branch in a separate `automation/` directory. Live checkouts must be ancestors of the default branch. Failed deployments, previews and other projects/branches do not qualify.

Only explicit `social.status: "published"` records are scanned. Unmanaged legacy records are not backfilled. A canonical fingerprint covers caption, actual description, relevant work fields, public URL and ordered source-file hashes. Unrelated code changes, feed sorting and revision bumps alone cause no duplicate sends. Delayed older deployment events are ignored after a newer delivery. Published draft metadata cannot accidentally bypass the exporter: validation blocks live sends.

`scripts/telegram/published-baseline.json` is the one-time migration snapshot of Ritual for Happiness, which was already published before this integration. An unchanged copy is skipped on automatic scans even before the first ledger record exists. Otherwise simply enabling delivery followed by an unrelated deployment would unexpectedly backfill this old item. A meaningful later change gets a different fingerprint and sends normally; an explicitly approved manual resend bypasses this migration exclusion. Do not regenerate or extend the migration snapshot during ordinary publishing.

The global concurrency group serializes automatic scans and manual resends. GitHub may replace older pending runs; the newest scan includes every opted-in published record, so still-current unsent content is caught up. Changes that are published and then removed before any scan may never be delivered; the system does not export content that is no longer present in the checked-out publication.

When the automatic switch is off, repository-dispatch jobs are skipped. Manual dry-runs remain available; manual live sends require their separate switch. The runner checks the configured public bot username with `getMe`, verifies `getChat` reports the exact configured **private** chat, then sends:

1. Exact caption text in one plain message, with no Markdown parse mode or extra commentary.
2. UTF-8 caption TXT containing the identical string, without an added trailing newline.
3. Cover and ordered gallery files as documents, deduplicated by actual local path. Groups contain at most ten; a remaining singleton uses `sendDocument`.
4. A JPEG preview album: cover first, then up to nine gallery images in source order. A singleton uses `sendPhoto`. These are lossy previews, clearly separate from unchanged document bytes.
5. Independent ZIP parts containing unchanged source bytes, each below 49,000,000 bytes. Original basenames are preserved inside ordered `001/`, `002/` directories. `--no-zip` omits this optional step for local preparation.
6. Separate administrative text with the real public URL, content type, revision, counts, artwork fields where applicable and all warnings.

The 49 MB cap leaves headroom below the hosted Bot API's 50 MB document limit. An individual source image above the cap blocks delivery for review; it is not silently recompressed or omitted. Only local files under real `public/` are accepted; path traversal, remote media URLs, broken original paths and escaping symlinks block validation. WebP fallback is explicitly reported, never called original or lossless conversion.

## Manual commands

```text
npm run telegram:export -- exhibition ritual-for-happiness-gudwin --dry-run
npm run telegram:resend -- exhibition ritual-for-happiness-gudwin --dispatch
npm run telegram:resend -- exhibition ritual-for-happiness-gudwin --dispatch --send
npm run test:telegram
```

Dry-run is the default, and needs no secrets or network access. Output goes to ignored `.telegram-delivery/packages/<type>/<slug>/<fingerprint>/`: caption TXT, `image-inventory.tsv`, `payload.json`, JPEG previews and ZIPs; `run-report.json` summarizes validation. Outputs are never put under `public/`. Review artifacts in Actions expire after seven days; this expiry does not affect the permanent duplicate ledger.

For explicitly requested exports of legacy publications without `social` metadata, `scripts/telegram/manual-publications.json` holds reviewed delivery-only metadata and its source references. Each entry must match the canonical hash of the entire existing catalog record; a changed record requires review. This manifest is used only for an explicitly selected manual item, never for automatic scans. Manual workflow runs use their selected workflow commit for the exporter and the verified Production SHA for website content, so an export branch can send existing publications without merging or deploying website changes.

For local dispatch only, supply `GITHUB_REPOSITORY` and a GitHub token with Actions write permission via environment variables (fine-grained PAT limited to this repository). The token is not the Telegram token. A local ignored `.env.telegram` can be loaded explicitly with `node --env-file=.env.telegram scripts/telegram-export.mjs ... --dispatch`; the tool does not automatically read website environment files. `TELEGRAM_DEFAULT_BRANCH` defaults to `main` for local dispatch; Actions uses the repository's actual default branch. Direct local live sends are rejected so they cannot race the workflow ledger.

GitHub's Run workflow UI also accepts content type, slug and a dry-run checkbox (checked by default). Every newly dispatched live manual run is an intentional resend. Rerunning the same workflow run resumes its existing checkpoint instead of inventing a new resend ID.

To continue a partially delivered manual run after a code fix, fill its original numeric ID into `resume_run`, or use `--resume-run <original-run-id>` with the dispatch command. Resume mode requires the exact existing content/destination/plan checkpoint and cannot start a fresh delivery. Confirmed steps are skipped. A definite album attachment rejection can fall back to individually uploaded files, preserving bytes/names/order and checkpointing each file; uncertain outcomes never trigger this fallback.

For an explicitly requested caption correction, use `--caption-only` (or the manual workflow's `caption_only` checkbox). Prepare and review the new text in dry-run first. This manual-only scope has exactly two delivery steps: the updated plain text and its identical UTF-8 TXT. It does not read or package source images, generate previews or ZIPs, or send an administrative message. It keeps the same serialized workflow, private-chat verification and durable API-receipt journal, with a separate caption-only fingerprint. Automatic and ordinary full-package sends remain unchanged.

## Reliability and recovery

### Curatorial quotations

Every future caption selects a substantive, continuous **5–10 sentence** passage from the full original curatorial prose, preserving its exact wording and paragraph breaks. A reviewed `social.excerpt` within this range is preferred; older short excerpts are expanded from the full description. Automatic selection favours artistic practice, materials and ideas, paragraph openings, and complete sentences. Bibliographic references, role-credit blocks and isolated verse are excluded. This is deterministic selection of source text, not generated interpretation.

The generator reserves the entire uppercase headline, all artists/curator/photo/additional roles, gallery and dates before fitting the quotation into **2,200 characters**. When shortening a longer selection it prefers **5–7 sentences**. A genuinely shorter source uses its maximum continuous passage and emits a warning. If five full source sentences cannot fit alongside every credit, validation blocks sending for editorial review. Verified English translations obey the same rules and cannot be expanded from untranslated material. `payload.json` records `excerpt` and `excerptSentences` for review.

There is one durable GitHub issue comment per destination/content/fingerprint/manual-run key, written by `github-actions[bot]`. It checkpoints every step before and after delivery and stores returned Telegram message IDs. Completed revisions are skipped automatically. It does not use expiring Actions cache as the duplicate authority and does not create a state branch that would trigger Vercel.

Explicit Telegram `ok:false` rate limits and server failures receive bounded retries; `retry_after` is honored. Requests are paced. An interrupted POST or lost/unparseable response has an **uncertain outcome**: Telegram provides no client idempotency key, so exact-once delivery across that failure boundary cannot be guaranteed. The exporter stops instead of blindly repeating a possibly delivered upload. Inspect Telegram and the checkpoint issue before authorizing a new manual resend. Never delete an in-flight/uncertain checkpoint merely to make the run green. A full manual resend can intentionally repeat earlier steps, so review this decision first.

A failed checkpoint write also stops the run. Preserve the issue/comments and prevent unrelated automation from editing them. Live writes are restricted to the serialized workflow. The file-backed ledger is for isolated tests, not an alternative production state store. Missing required credits, invalid dates, unverified translation provenance, missing media and captions over 2,200 conservative UTF-16 units are review errors; caption credits are never truncated to force compliance.

## Verified external references

- [Telegram Bot API](https://core.telegram.org/bots/api#sending-files): upload limits and [2–10-item media groups](https://core.telegram.org/bots/api#sendmediagroup).
- [Vercel repository-dispatch events](https://vercel.com/docs/git/vercel-for-github#repository-dispatch-events) and the [official payload example](https://github.com/vercel/repository-dispatch/tree/main/packages/repository-dispatch#payload-example).
- [GitHub workflow events](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#repository_dispatch).

## Changed files

- `src/data/contentDelivery.ts`: optional public publication/credit schema and typed artwork records.
- `src/data/artworks.ts`: empty registry; no fabricated artwork data or new website route.
- `src/data/exhibitions.ts`: optional schema fields and Ritual's real publication/excerpt/Text metadata; existing descriptions and images retained.
- `src/data/editorial.ts`: optional publication metadata and original media paths.
- `scripts/telegram-export.mjs`: offline/manual/CI entry point and safe live gate.
- `scripts/telegram/content.mjs`: existing-data adapters, captions, dates, verified credits and validation.
- `scripts/telegram/package.mjs`: inventory, source preference, semantic fingerprint, previews, ZIPs and exact payload plan.
- `scripts/telegram/delivery.mjs`: private destination check, bounded API retries and durable step checkpoints.
- `scripts/telegram/telegram-client.mjs`: native-only Telegram client; JSON for non-file methods, trimmed secret inputs and sanitized transport errors.
- `scripts/telegram/deployment.mjs`: successful-production event and manual publication verification.
- `scripts/telegram/published-baseline.json`: one-time existing-content migration exclusion; do not update during normal publication.
- `scripts/telegram/telegram.test.mjs`: formatting, media, publication and reliability tests.
- `.github/workflows/telegram-content.yml`: post-publication observer and manual workflow; does not deploy the site.
- `.github/workflows/telegram-connection.yml`: connection-only getMe/getChat, issue-write and failed-run diagnostics; no content sending.
- `.claude/skills/telegram-export/SKILL.md`: reusable Claude command.
- `CLAUDE.md`: publishing convention.
- `docs/telegram-delivery.md`: configuration, usage, limits, recovery and file inventory.
- `.env.example`: empty credential/configuration names only.
- `.gitignore`: ignore generated packages while versioning only the new Claude skill, retaining ignored local Claude settings.
- `package.json`: export/resend/test commands; no new dependency.
