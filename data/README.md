# data/ — Supabase snapshot

Full snapshot of the Supabase database backing this app, captured 2026-08-31.
Use this to seed a rebuild without depending on Supabase.

## What's here

| File | Rows | Purpose |
|---|---|---|
| `schema.sql` | — | Postgres DDL for all 5 tables + storage bucket + RLS policies |
| `alignment_metrics.json` | 27 | Operating-metrics rows (`/metrics` page) |
| `alignment_follow_ups.json` | 12 | Weekly-cadence follow-ups / blockers (`/cadence` page) |
| `alignment_signals.json` | 18 | Signals (`/signals` page) — includes detail sections, QnA ledger, action list, image URLs |
| `alignment_blockers.json` | 0 | Legacy blockers table (unused by current UI) |
| `alignment_allowed_emails.json` | 1 | Login-gate allowlist |

Total: **58 rows.** Each JSON is an array of row objects, sorted by `created_at`.

## Shape reference

Column shapes match the Supabase client's `fromDb*` mappers in `src/lib/api.js`
(camelCase in the UI, snake_case in the DB — the mapper handles the conversion).

- Signals detail sections: `background`, `problem`, `goal`, `why_now`,
  `positioning`, `risks`, `success_metrics` (all `text`)
- Signals sub-lists: `qna_ledger`, `action_list` (both `jsonb`, default `[]`)
- Signal image URLs: `image_urls` (`text[]`, default `{}`) — image files live in
  Supabase Storage bucket `alignment-signal-images` (public-read); the URLs in
  the JSON reference them.

## Rebuild paths

**A. Same Supabase shape, new project**
1. Create a new Supabase project.
2. Run `psql < schema.sql` (or paste into the SQL editor).
3. Bulk-insert each JSON via `COPY` or the Supabase JS client's `.insert()`.
4. Upload the image files still hosted in the old bucket to the new bucket
   (or leave the URLs pointing at the old one — it's public-read).
5. Point the frontend at the new project URL + anon key in `src/lib/supabase.js`.

**B. Ditch Supabase — use these JSONs as static seed data**
- Import each `*.json` at build time and hand them to the page components.
- For persistence, wire the app to whatever store the rebuild uses
  (`localStorage`, GitHub Contents API, another DB) — the shape of every write
  is already in `src/lib/api.js`.

## Not captured here

- Auth sessions (Supabase Auth tokens) — cleared on schema teardown.
- Realtime subscriptions — none in current app.
- The 1 row of `alignment_allowed_emails` contains the operator's email; treat
  it like any other personal data before publishing this repo elsewhere.
