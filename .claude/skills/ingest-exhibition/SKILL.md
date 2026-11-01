---
name: ingest-exhibition
description: End-to-end ingest of an exhibition from a source URL (typically ofluxo.net or saliva.live) into the FindArt website and Telegram pipeline. Fetches the page, downloads and compresses images, creates the exhibitions.ts entry with social metadata, verifies the Telegram dry-run reports `ready`, commits directly to main, and pushes. After a successful Vercel production deploy, the Telegram workflow sends automatically — provided TELEGRAM_DELIVERY_ENABLED=true in repo variables. Use for /ingest-exhibition and "add this exhibition" requests when the user supplies a source URL (and optionally a cover image attachment).
---

Resolve the source URL and extract: exact title, venue (gallery name + city + country), published dates ("D Month YYYY — D Month YYYY"), full artist list with correct diacritics, curator, named photographer if one exists, and the complete curatorial essay as published. Prefer the user's pasted text over any WebFetch summary — Cloudflare-protected sources (ofluxo etc.) usually force a paste.

Pick a slug: lowercase ASCII, hyphenated, derived from the title or the path segment of the source URL. Must match `^[a-z0-9][a-z0-9-]*$`.

Switch to `main`, `git pull --ff-only`, then stay on main (follow the previous AI-ingest convention — those commits land straight on main). If the user explicitly asks for a review branch, create one; otherwise work on main.

Place the user-attached cover (if any) at `public/exhibitions/<slug>/01.webp`. If the user did not attach one, pick the strongest ofluxo image for 01.webp — usually an installation view that reads at thumbnail size. Build a line-separated manifest of every remaining exhibition image URL from the source (strip ads / banners / header logos; keep only installation and work views) and pipe it to the helper:

```
printf '%s\n' <url1> <url2> ... | node scripts/ingest-exhibition.mjs <slug>
```

The helper downloads each URL, compresses to WebP (sharp q=82, cap 2000px wide, no upscaling), probes orientation, and writes `02.webp` … on disk. It prints a TSV inventory to stdout; keep that output — the orientation column is what `localExhibitionGalleryWithOrientations` consumes.

Insert the entry at the TOP of `exhibitionSeeds[]` in `src/data/exhibitions.ts` (new seeds float to the top of the feed by convention — see the comment in the sort callback at the end of the file). Wrap it in `// AI_INGEST_START: <slug>` / `// AI_INGEST_END: <slug>` markers to match the existing ingest format. Fields:

- `slug`, `title`, `venue`, `gallery` (same as venue unless the source distinguishes), `city`, `country`, `year`, `dates`, `startDate`, `endDate`, `dateSource: "exhibition"`.
- `artists` with correct diacritics as published in the body text (body text overrides the credits line when they disagree — typos in the credit line like "Emlio" don't belong on the website).
- `curator` (string), `photographer` only when a specific person is named by the source.
- `source`, `sourceUrl`.
- `description`: full essay verbatim, template literal, paragraphs separated by blank lines, ending with `— Text: <Author>` if the source attributes the essay.
- `coverImage`, `previewImage` both pointing to `01.webp`; `heroImage` to a landscape view (usually `02.webp`).
- `images`: `localExhibitionGalleryWithOrientations("<slug>", [ { filename, orientation }, … ])` using the TSV output from the helper verbatim.

Also add `"<slug>": ["GROUP SHOW", "INSTALLATION", …]` to `semanticTagAssignments` — pick 3–5 tags from the `semanticTags` array at the top of the file that genuinely match the show's subject. Do not invent tags that aren't in the array (TypeScript enforces this).

Build `social`:

- `status: "published"` — the user has explicitly opted into auto-delivery.
- `revision: 1` for a new ingest.
- `language: "en"`.
- `excerpt`: one verbatim sentence (not a paragraph) from the opening of the essay. The validator counts `[.!?]` followed by whitespace as sentence terminators, so abbreviations like "U.S." inflate the count; staying at one real sentence (which still typically counts as 1–2 after abbreviations) stays under the 1–3 cap. The excerpt MUST appear verbatim in `description` — never edit the quoted text.
- `credits`:
  - `{ role: "Text", people: [{ name: "<essay author>" }] }` when the source attributes the essay (ofluxo always does).
  - `{ role: "Photo", people: [{ name: "<Gallery name>" }] }` when no individual photographer is named — the gallery is the courtesy source. Keep this in `social.credits`, NOT in the top-level `photographer` field, so no `/photographers/<gallery>` taxonomy page is created.
  - Add `{ role: "Curator", people: [{ name: "<Curator>" }] }` only if the exporter asks for it (usually it reads `item.curator` automatically — no credit entry needed).

Run `npx tsc --noEmit` (should finish silently) and then `npm run telegram:export -- exhibition <slug> --dry-run`. Read `.telegram-delivery/packages/run-report.json`:

- `ready: true, errors: []` → proceed to commit.
- Anything else → fix the entry (not the validator). Common cases:
  - "Excerpt must contain one to three sentences" — the excerpt has too many `.`-followed-by-space counts; drop to a single short sentence.
  - "Selected quotation is not verbatim source text" — the excerpt string doesn't appear exactly in `description`; copy it directly from the essay.
  - "Missing required credit: Photo" — no Photo credit; add the gallery as courtesy source.
  - "An actual HTTPS FindArt public URL is required" — stale `publicUrl` in `social`; usually omit and let the exporter derive it from the slug.

Only commit after the dry-run reports `ready`. Stage the entry, images, and (if used) the manifest script, then commit with a message in the existing ingest style:

```
AI ingest: <Title> — <Venue>, <City> <Year> [<slug>]

<one short paragraph: curator, dates, artist list, source>

- <N> webp images: 01 is <cover source>; 02–<N> are <source> views in page order, compressed via sharp.
- social.status: "published", <Nsentences>-sentence verbatim excerpt, Text credit <author>, Photo credit <gallery courtesy>. telegram-export dry-run: ready, <N> docs, <steps> steps.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
```

Push to main.

Immediately after the push, trigger the Telegram workflow directly — do NOT rely on Vercel's `vercel.deployment.success` repository_dispatch, which is unreliable in this project. If a local `.env.telegram` exists (gitignored, contains `GITHUB_REPOSITORY` and a GitHub token with `actions:write`), run:

```
node --env-file=.env.telegram scripts/telegram-export.mjs exhibition <slug> --dispatch --send
```

That POSTs to the workflow dispatch endpoint; the hosted runner then takes over, re-validates with the published SHA, and sends to the bot. If `.env.telegram` is missing, tell the user once what to put in it (two lines: `GITHUB_REPOSITORY=raikkonenm/findartplatform` and `GITHUB_TOKEN=<fine-grained PAT with Actions:write + Contents:read on this repo>`), and remind them this is a one-time setup — after it exists the dispatch step runs on every ingest with no further action.

Report back to the user with:

1. Live URL on findartplatform.com.
2. Dry-run summary (image count, delivery steps, any warnings — not errors, those blocked the commit).
3. Dispatch result: either "workflow dispatched, bot sends in ~1 min" or "`.env.telegram` missing, set it up once as above."

Do NOT ingest if the source material is non-English and the user has not provided a verified English `translatedExcerpt` — the exporter blocks this correctly, and inventing a translation violates CLAUDE.md. Do NOT ingest if the images are not accessible (Cloudflare 403 on every URL, broken paths) — ask the user to attach them manually. Do NOT invent artist names, dates, or photographers; stop and ask when a required field is missing from the source.
