# Simple FINDART submission forwarding

All five website forms already send their full fields through Resend to **raikkonenmaria7@gmail.com**. This version keeps that route and all payment redirects unchanged. A single private Google Apps Script forwards those existing notification emails to the existing **@FINDART_content_bot**. It needs no AI API, Supabase, new database, web server, Vercel deployment or computer left running.

Direct Telegram calls from stateless form invocations would need a persistent delivery marker to reliably avoid duplicates across retries. The existing Gmail mailbox provides that marker without another service. There is only one forwarding source, so the website event and its email copy cannot produce two packages.

| Form | Exact existing subject prefix |
| --- | --- |
| Exhibition | `New FindArt Exhibition Submission` |
| Artist | `New ArtNomads Artist Submission` |
| Editorial | `New Editorial Pitch` |
| Opportunities | `New Opportunity Submission` |
| Website / Index | `New Index Website Submission` |

The sender must also be exactly `submissions@findartplatform.com`, as in the supplied real notification. Contact, Advertising, replies, newsletters and personal mail do not qualify. Update this one allowlist if the website's sender/subjects deliberately change.

## One-time owner setup

Google account authorization cannot be performed through an unrelated connected Gmail account. This does not require connecting Gmail to ChatGPT or giving control of the computer.

1. Open [Google Apps Script](https://script.google.com/home/start) while signed in as **raikkonenmaria7@gmail.com**. Create a private standalone project, for example `FINDART Telegram Forwarder`.
2. Replace its `Code.gs` with [the ready script](../scripts/gmail-forwarder/Code.gs). In Project Settings enable showing the `appsscript.json` manifest, then replace that file with [the ready manifest](../scripts/gmail-forwarder/appsscript.json). It enables the built-in Advanced Gmail service; the default Apps Script Google Cloud project does not require creating another Cloud project or OAuth client.
3. In **Project Settings → Script properties**, add `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` using the **same existing values** as GitHub Secrets. Do not put them in source code, chat or screenshots. GitHub stores secrets encrypted and cannot reveal their original values; copy them from the owner's existing secure record/BotFather rather than rotating the bot unnecessarily. No key is printed by this script.
4. Select **`setupAndEnable` → Run** and approve Google's permissions in that account. Gmail permission is used to read matching messages and add two technical labels; the code never deletes mail, archives it or changes read/unread status. Permission to external requests sends to Telegram; trigger permission creates the timer. No web-app deployment is needed.
5. Setup checks the mailbox identity, correct bot and exact private chat. It sends one setup confirmation, saves its receipt, and **only after success** creates the five-minute cloud timer. Re-running setup does not repeat the confirmed setup notification and replaces only this forwarder's timer. New processing begins at activation time, so old applications are not backfilled.

If setup fails, the timer is not newly enabled. Fix the reported constant error code; do not clear a delivery checkpoint or retry an uncertain Telegram request without checking the chat. `disableFindart` disables only this forwarder. Its state and keys remain private to the Google project; do not share the project publicly.

## What gets sent

- Submission type, applicant name/email, an explicitly supplied project title when available, followed by **all original form fields unchanged**. The simplified Exhibition form does not separately collect a title; `Not provided` is used rather than an invented title.
- Every material/portfolio/Drive/Dropbox link, with long messages safely split for Telegram. No AI rewriting, caption generation, payment inference or automatic site publication.
- Email attachments as documents. Existing JPEGs retain their exact bytes and become `.jpg` documents, never compressed Telegram photos. Native Google conversion handles PNG/BMP/GIF when possible. Google exposes no JPEG quality parameter; this simple forwarder does not claim quality-95 conversion. WebP/AVIF/TIFF requiring another converter are reported as unavailable for conversion and retained in the original email, never renamed falsely or sent as WebP photographs.
- Direct downloadable image/PDF/ZIP/DOC/TXT links can be fetched as files. Ordinary portfolio pages, private/login pages and Drive/Dropbox folder links remain clickable links; **this minimal version does not crawl folders or unpack ZIPs**. Failed/oversized downloads are reported with the original reference rather than fabricated files. Attachments stay in the original private mailbox. A 45 MB document guard stays below Apps Script/Telegram limits.

## Duplicate prevention and failures

The script uses a project-wide lock and labels **individual Gmail messages**, not entire threads. `FINDART_TELEGRAM_SENT` permanently excludes already processed message IDs. A private content fingerprint suppresses separate identical notification copies for 30 days; deliberate later resubmissions remain possible. Read/unread and Inbox labels remain untouched. Do not remove the technical sent label to force a resend.

Private Script Properties store only hashes, timestamps, source message IDs and delivery cursors/receipt IDs, not email bodies or photos. They are pruned for completed content fingerprints after 30 days. Google has storage/execution quotas; this is intended for ordinary submission traffic, not a mass historical import.

Every Telegram step is checkpointed before sending and acknowledged before advancing. Definite rejections resume at the missing step with bounded attempts. An interrupted/uncertain request is held with `FINDART_TELEGRAM_REVIEW` and is not automatically repeated. This is necessary because Telegram provides no idempotency key. A Gmail label-write failure after delivery does not resend confirmed steps. Keep the private checkpoint for review.

## Verification

`npm run test:forwarder` verifies all five subject/sender filters, complete original fields/links, unchanged form email behavior, duplicate copies, JPEG byte preservation and partial/uncertain sends. `npm run test:telegram` covers the existing transport.

The existing GitHub Actions environment can perform one explicitly enabled **synthetic** test using the existing bot secrets: one structured submission, one JPEG document and one TXT attachment. It sends no real applicant data to GitHub and records only sanitized Telegram receipts. Previous acknowledged test runs prevent automatic repeat sends. The test flag is switched off afterwards.

That transport test does **not** authorize or enable the Gmail account's timer. Only the owner's successful `setupAndEnable` run proves Google-side activation. Do not report the system as fully automatic until that step is confirmed.

Official references: [Google time triggers](https://developers.google.com/apps-script/guides/triggers/installable), [Advanced Gmail service](https://developers.google.com/apps-script/advanced/gmail), [private Script Properties](https://developers.google.com/apps-script/guides/properties), [native image conversion](https://developers.google.com/apps-script/reference/base/blob#getAs(String)).
