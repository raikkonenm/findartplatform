# Private FINDART submission drafts

This is a separate, disabled-by-default intake pipeline for the existing `@FINDART_content_bot`. It does not publish submissions to the website, deploy the site, alter exhibition records, or enable the existing published-content automation.

## Website forms: primary email plus Telegram

The existing `/api/submissions` handler continues to send through Resend to **raikkonenmaria7@gmail.com**. With `SUBMISSIONS_CAPTURE_ENABLED=true`, it also saves a private queue item after successful email delivery. No Gmail connection, ChatGPT Gmail plugin, extra recipient mailbox, or always-on personal computer is needed for these forms.

| Existing form | Intake type | Existing behavior preserved |
| --- | --- | --- |
| Exhibition | `exhibition` | Email, then existing Gumroad redirect |
| Artist | `artist` | Email, then existing Gumroad redirect |
| Editorial / Article | `contribute` | Email, free form success |
| Opportunities | `opportunity` | Email, then existing Gumroad redirect |
| Website / Index | `index` | Email, then existing Gumroad redirect |

Contact and Advertising are outside this intake. A Gumroad redirect does not prove payment: paid-form drafts show **Not verified**. Editorial is marked free only when its actual form type is `contribute`.

A signed receipt correlates the email copy with the direct event. The queue deduplicates source IDs and matching canonical form/email payloads within seven days. A later deliberate resubmission may be a new job. If private storage is unavailable after email succeeds, the form still succeeds and the server logs only `FINDART_SUBMISSION_CAPTURE_FAILED_EMAIL_FALLBACK`. The original email remains available for manual recovery; automatic email recovery requires the separately enabled Gmail adapter. Monitor this fixed error code before enabling capture.

## Cloud services and permissions

1. Create a dedicated Supabase project for private submissions. Apply [supabase/submissions.sql](../supabase/submissions.sql) in its SQL editor after review. The migration creates the queue, source IDs, cursors and **private** `findart-submissions-private` bucket. Tables deny anonymous and signed-in user access; only the server service role may use the RPCs and objects. The migration refuses a bucket that is already public. Do not create public bucket policies or download URLs.
2. On the development website server, configure `SUBMISSIONS_SUPABASE_URL`, `SUBMISSIONS_SUPABASE_SERVICE_ROLE_KEY` and a randomly generated `SUBMISSIONS_HMAC_KEY` of at least 32 characters. Keep the existing Resend configuration and recipient. Leave `SUBMISSIONS_CAPTURE_ENABLED=false` until review. None of these values belongs in `NEXT_PUBLIC_*`, committed files, chat messages or browser code.
3. In repository **Settings → Secrets and variables → Actions**, add the same three values as repository secrets, plus `OPENAI_API_KEY`. Configure `SUBMISSIONS_OPENAI_MODEL` as a variable naming a model that supports Responses Structured Outputs. Reuse the already configured `TELEGRAM_BOT_TOKEN` and personal `TELEGRAM_CHAT_ID`; do not create another bot. The worker verifies the bot username and exact private chat with `getMe` and `getChat` before sending.
4. Leave repository variable `TELEGRAM_SUBMISSIONS_ENABLED=false`. Leave `GMAIL_SUBMISSIONS_ENABLED=false`. The published-content `TELEGRAM_DELIVERY_ENABLED` is independent and remains off. The submission worker needs only `contents: read`, **no Issue permissions**. It never reads or writes Issue #1. No `VERCEL_PROJECT_ID` or `TELEGRAM_STATE_ISSUE` is needed by the private submission worker.

The source is intended for a dedicated private store even when the code repository is public. Service-role credentials bypass Supabase RLS: protect them as server-only secrets. Rotate credentials through their service and secret settings, never through committed configuration. Supabase retention/backup and cleanup policies must be chosen by the account owner; no automatic deletion of application materials is included.

## Optional email-only submissions

This is needed only for applications sent as email instead of using the website forms. **Connecting Gmail to ChatGPT does not configure the cloud worker.** Its OAuth permission is separate and can be granted in the user's own browser without anyone controlling their computer.

Create a Google Cloud OAuth client with Gmail API enabled. Authorize only `https://www.googleapis.com/auth/gmail.readonly` with offline access for the intended mailbox. The optional local `node scripts/submissions/google-oauth.mjs` helper displays the consent link, receives the localhost callback and saves the refresh token only to ignored `.submission-delivery/oauth/gmail-token.json`. Supply `GMAIL_CLIENT_ID` and `GMAIL_CLIENT_SECRET` through the local environment; the helper does not print tokens. Move the resulting token directly into an Actions secret, then remove the local token file when no longer needed. Google consent/testing restrictions and refresh-token lifetime must be resolved in the Google Cloud project before unattended use.

Required optional Actions secrets:

- `GMAIL_CLIENT_ID`, `GMAIL_CLIENT_SECRET`, `GMAIL_REFRESH_TOKEN`.
- `GMAIL_SUBMISSIONS_ADDRESS`: the exact authorized mailbox, verified against Gmail's profile before polling.
- `GMAIL_SUBMISSIONS_QUERY`: a narrow query containing a dedicated label, for example `label:FINDART-Submissions`. Create a Gmail filter applying that label only to relevant submissions. Never use a whole-inbox query.

Set `GMAIL_SUBMISSIONS_START_AFTER` as an ISO date/time variable for the agreed activation time. This prevents historical backfill; polling uses bounded pages and a private cursor. Enable `GMAIL_SUBMISSIONS_ENABLED` only after approval. The adapter uses read-only GET requests; it never marks read, modifies labels, deletes or sends mail. Signed website copies deduplicate against direct capture.

## Editorial and media processing

The worker obtains applicant-provided attachments and links, extracts text from PDF, DOCX, TXT/HTML and bounded ZIPs, and optionally reads document scans with Tesseract. It does not execute applicant code, scripts, macros or instructions. Missing OCR, unreadable/encrypted documents and inaccessible links appear as review notices in the private administrative card.

OpenAI Responses receives the application materials for extraction and English editorial drafting with `store:false`, no command/browsing tools and a strict JSON schema. This still transmits the materials to OpenAI for processing. Factual values must carry exact source evidence. Missing credits, uncertain accounts, unavailable Latin spellings and conflicting information require review. AI summaries remain unquoted; English quotations must occur verbatim in a real source. The renderer reserves the title and all supported credits within 2,200 characters, using a continuous **5–7 sentence passage, maximum seven**; shorter sources are disclosed. Every package is marked **EDITORIAL DRAFT — NOT APPROVED** and remains subject to human editorial review. Applicant email appears only in private administrative/original material, not the Instagram caption.

Download support and explicit limits:

- Public Google Drive file links; public Drive folders require optional `GOOGLE_DRIVE_API_KEY`. Folder traversal is bounded and filenames sorted naturally when no authoritative order is supplied. Private/confirmation pages require manual access.
- Public Dropbox download links and folder ZIPs.
- Direct downloadable WeTransfer/CDN files. **Interactive WeTransfer shared pages requiring JavaScript, login, a password or access confirmation are not automatically resolved.** They are reported honestly with their original link; no images are invented or substituted.
- Other HTTPS download hosts only through explicitly approved `SUBMISSIONS_DOWNLOAD_HOSTS` (comma-separated exact hosts or subdomain patterns). Website/portfolio pages are not scraped indiscriminately for replacement images.
- Downloads: 49 MB/file, 250 MB total, 200 files, 30 source links, five redirects, public-IP checks and pinned DNS. Archive paths, links, encryption, entry count, expansion ratio and nested depth are checked. Oversized files require review rather than silent shrinking.

Provided image order is preserved; duplicate bytes and technical icons/logos/thumbnails are excluded. The existing JPEG exporter copies original JPEG bytes unchanged, converts other supported photo formats at quality 95, 4:4:4, sRGB without resizing, and changes extensions to `.jpg`. Original website images are untouched. Each JPEG uses `sendDocument`, never compressed Telegram photos. ZIP parts contain the exact exported JPEG bytes and fit the existing upload limit.

Dropbox ZIPs may contain a zero-byte `/` directory marker. This one metadata entry is ignored without extracting any absolute path; absolute file entries, traversal, links and encrypted entries remain blocked. For multi-location exhibitions, extract each separately dated presentation with its own evidenced title, city and date range. Preserve each chapter's opening date in both the administrative card and editorial credits; do not apply one city's date to every location. Unparseable date wording remains visible for review rather than being silently discarded.

Delivery order is the administrative card, English editorial text, caption TXT, original submission TXT, JPEG documents, then JPEG ZIP part(s). All documents have the draft label as their Telegram caption. The caption TXT contains copy-ready editorial text and has `EDITORIAL-DRAFT` in its filename. The private administrative card includes the requested submission fields, original source reference, all available download links, warnings and actual obtained-image count.

## Checkpoints and recovery

Jobs and file receipts stay in private Supabase tables; prepared files stay in the private bucket. Local dry-runs stay in ignored `.submission-delivery/`. The workflow prints aggregate counts and fixed error codes only: no applicant payloads, captions, emails, URLs, draft artifacts or issue comments.

The database leases a job to one worker; each Telegram step is saved **before** the request and its receipt saved before proceeding. Successful steps are skipped on resume. Explicit rejections have bounded retries; a lost response/in-flight step becomes private review and is never automatically resent. File hashes and Telegram-returned names/sizes are checked. Inspect the bot and private checkpoint before resolving an uncertain step; do not wipe progress or bypass duplicate detection. Review/error jobs are not automatically claimed again. Storage/AI failures also require private review, with already-written delivery checkpoints preserved.

The scheduled workflow processes at most two jobs per run and shares the existing Telegram transport lock without sharing published-content state. It is cloud-hosted, so the user's computer can be off. GitHub scheduled runs are best-effort, can be delayed, and run only from the default branch. Public-repository scheduled workflows may be disabled after 60 days without activity. For ongoing operation, prefer a separately configured private worker repository or monitor activity/Actions quotas and schedule status. A branch-only implementation cannot collect production form events until the approved site code/configuration is deployed; this task does **not** perform that deployment.

## Review before activation

All new switches remain false. The current implementation can be tested without sending anything:

```sh
python -m pip install -r scripts/submissions/requirements.txt
npm run test:telegram
npm run test:submissions
npm run submissions:dry-run -- --input .submission-delivery/example.json
```

`example.json` is a private normalized application object with `type`, `fields`, `originalText`, `source` and optional `attachments`/`links`. For an actual historical Gmail message, normalize its full API response with `normaliseGmail` first; do not put it in a workflow input. For a one-time offline human-reviewed analysis, the dry-run also accepts `--reviewed-analysis .submission-delivery/analysis.json` matching the extraction schema. Live execution never accepts that override.

Open the generated private `draft-package.json`, exact caption TXT and ordered JPEG inventory. Show the actual English caption, sentence/character counts, obtained-image count and planned steps to the owner. A synthetic fixture is a code test, **not** a completed real-application dry-run. Obtain approval for the real example and activation separately; never mass-send old applications. Website production deployment and enabling the production capture flag also require the owner's authorization.

The synthetic CI installs PGlite only for tests and requires the real PostgreSQL migration/permission/checkpoint test to run. Local tests skip that single test if PGlite is unavailable; do not report it as passed. The tests also cover all five form contracts, unchanged primary email delivery, direct delivery without Gmail, source evidence, private email exclusion, inaccessible links, JPEG/ZIP preparation, untrusted ZIP/XML inputs, duplicate input and partial/uncertain delivery.

References: [Gmail read-only scopes](https://developers.google.com/workspace/gmail/api/auth/scopes), [Supabase storage access control](https://supabase.com/docs/guides/storage/security/access-control), [OpenAI Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs?api-mode=responses), [GitHub scheduled workflows](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule).
