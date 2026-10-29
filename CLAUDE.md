# FINDART publishing and Telegram delivery

The existing site uses `src/data/exhibitions.ts`, `src/data/editorial.ts` and local `public/` media. Keep the website's current architecture and presentation. Telegram tooling does not modify or delete existing exhibitions/assets or publish to Instagram.

## Publishing convention

1. Maintain the real website record and ordered gallery. Leave unfinished material `social.status: "draft"`.
2. For every new or meaningfully updated item published through Claude Code, add/update `social` metadata (type: `src/data/contentDelivery.ts`): `status`, positive integer `revision`, source `language`, a verbatim English `excerpt`, structured artist/gallery accounts and documented additional credits. The field is optional in TypeScript only for backward compatibility. Set `published` for content intended to be live in its successful production deployment. Existing untouched records without `social` remain unmanaged and are not mass-exported.
3. `social.artists` supplies full names and optionally `instagram: { handle, verified: true, source }`. `social.gallery` does the same for the venue. Only assert verification with documented evidence. Do not infer accounts from similarly named profiles or free-text captions. Keep website artist names consistent with this metadata.
4. Add `social.credits: [{ role: "Text", people: [{ name: "Documented Author" }] }]` for an actual text author, and other roles only when documented. Existing `artists`, `curator` and `photographer` remain valid name sources. Default required credits are Artist(s) and Photo for exhibitions, Artist(s) otherwise. Unknown curator is omitted with a warning; declare it in `requiredCredits` when required.
5. For non-English descriptions, provide `translatedExcerpt: { text, sourceText, language: "en", verified: true }` after reviewing the translation. `sourceText` must occur in the actual description. The exporter never fabricates a translation or quotation. An unsupported non-Latin name needs its documented `latinName`.
6. Set each image's `originalSrc` and `social.coverOriginalSrc` to original local public paths when available. Gallery order is authoritative. Same-basename JPG/PNG/TIFF counterparts are preferred to WebP, but are not represented as verified originals unless explicitly mapped.
7. Run `npm run telegram:export -- exhibition <slug> --dry-run`, inspect all package files and fix validation errors. Run `npm run test:telegram` for changes to delivery code.
8. Only carry out an actual deployment when the human has authorized it. The separate Telegram workflow observes successful production deployments; it does not deploy the website. Never enable live Telegram delivery before its dry-run has been reviewed.

Increase `revision` for content changes. Meaningful metadata and file bytes also receive a computed SHA-256 revision, so forgetting a bump cannot hide an image replacement. Feed order, deployment IDs and a revision bump alone do not trigger repeat packages. Drafts and failed/preview deployments never send.

Do not modify `scripts/telegram/published-baseline.json` during publishing. It suppresses only the unchanged, already-live Ritual migration sample; new/updated content must not be added to it.

## Artworks and features

The Collect page currently scans `public/example`; `collectArtworks.ts` cycles category/price values, and `CollectArtworkCard.tsx` cycles titles/years with a fixed artist label. These are not verified per-image cataloguing records. `src/data/artworks.ts` is an empty, typed registry for actual catalogued artworks. Add real titles, artists, year, medium, dimensions, images and an existing public URL before opting in; do not turn cycling display labels or filenames into fabricated catalogue facts. The existing website is unchanged. Features adapt `editorialArtists` and its real `/features/<slug>` routes; they also require explicit publication metadata.

## Commands and skill

- `/telegram-export <type> <slug>`: reusable Claude skill in `.claude/skills/telegram-export/SKILL.md`.
- `npm run telegram:export -- <type> <slug> --dry-run`: default, offline package preparation; no credentials or outgoing requests.
- `npm run telegram:resend -- <type> <slug> --dispatch`: request a GitHub-hosted manual dry-run.
- `npm run telegram:resend -- <type> <slug> --dispatch --send`: explicitly approved resend of verified published content, through the single-writer workflow.

Configuration, delivery limits, checkpoint recovery and exact permissions: [docs/telegram-delivery.md](docs/telegram-delivery.md). Never print tokens, commit environment files, add `NEXT_PUBLIC_` prefixes to bot secrets, or put them in website data.
