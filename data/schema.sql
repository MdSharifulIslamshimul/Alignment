-- Neeva — full Postgres schema for the Supabase-backed version
-- Snapshot: 2026-08-31 (58 rows total across 5 tables)
--
-- To recreate the schema on a fresh Postgres/Supabase project:
--   psql < schema.sql
-- Then bulk-load rows from the sibling JSON files.
--
-- Tables:
--   alignment_metrics          — Operating Metrics Review page
--   alignment_follow_ups       — Weekly Alignment Huddle (/cadence)
--   alignment_signals          — Signals page (with detail sub-page)
--   alignment_blockers         — legacy blockers table (unused by current UI)
--   alignment_allowed_emails   — login gate allowlist
-- Storage:
--   alignment-signal-images    — public-read bucket for uploaded signal images

--------------------------------------------------------------------------------
-- alignment_metrics
--------------------------------------------------------------------------------
create table if not exists public.alignment_metrics (
  id          uuid primary key default gen_random_uuid(),
  objective   text not null default '',
  initiative  text not null default '',
  squad       text not null default '',
  metric      text not null default '',
  baseline    text not null default '',
  target      text not null default '',
  delivery    date,
  follow_up   date,
  achieved    text not null default '',
  owner       text not null default '',
  created_at  timestamptz not null default now()
);

--------------------------------------------------------------------------------
-- alignment_follow_ups
--------------------------------------------------------------------------------
create table if not exists public.alignment_follow_ups (
  id           uuid primary key default gen_random_uuid(),
  item         text not null default '',
  owner        text not null default '',
  due          date,
  severity     text not null default 'medium',
  status       text not null default 'not_started',
  context      text not null default '',
  week_label   text,
  status_note  text not null default '',
  kind         text not null default 'priority',
  created_at   timestamptz not null default now()
);

--------------------------------------------------------------------------------
-- alignment_signals (with detail sections + jsonb sub-lists + image URLs)
--------------------------------------------------------------------------------
create table if not exists public.alignment_signals (
  id                uuid primary key default gen_random_uuid(),
  observation       text  not null default '',
  kind              text  not null default 'problem',   -- 'problem' | 'opportunity'
  theme             text  not null default '',
  status            text  not null default 'new',       -- 'new' | 'exploring' | 'decided' | 'dismissed'
  note              text  not null default '',
  source            text  not null default '',
  -- detail-page sections
  background        text  not null default '',
  problem           text  not null default '',
  goal              text  not null default '',
  why_now           text  not null default '',
  positioning      text  not null default '',
  risks             text  not null default '',
  success_metrics   text  not null default '',
  -- sub-lists
  qna_ledger        jsonb not null default '[]'::jsonb,   -- [{id, question, answer, askedAt}]
  action_list       jsonb not null default '[]'::jsonb,   -- [{id, text, owner, done}]
  image_urls        text[] not null default '{}',
  created_at        timestamptz not null default now()
);

--------------------------------------------------------------------------------
-- alignment_blockers  (legacy, unused by current UI — kept for the schema)
--------------------------------------------------------------------------------
create table if not exists public.alignment_blockers (
  id         uuid primary key default gen_random_uuid(),
  title      text not null default '',
  impact     text not null default '',
  owner      text not null default '',
  severity   text not null default 'medium',
  since      date,
  created_at timestamptz not null default now()
);

--------------------------------------------------------------------------------
-- alignment_allowed_emails (login gate)
--------------------------------------------------------------------------------
create table if not exists public.alignment_allowed_emails (
  email     text primary key,
  added_at  timestamptz not null default now()
);

--------------------------------------------------------------------------------
-- Row-level security (all four data tables require an authenticated session)
--------------------------------------------------------------------------------
alter table public.alignment_metrics       enable row level security;
alter table public.alignment_follow_ups    enable row level security;
alter table public.alignment_signals       enable row level security;
alter table public.alignment_blockers      enable row level security;
alter table public.alignment_allowed_emails enable row level security;

do $$ begin
  for tbl in select unnest(array[
    'alignment_metrics','alignment_follow_ups',
    'alignment_signals','alignment_blockers'
  ]) loop
    execute format('create policy "%s_read"   on public.%I for select using (auth.role() = ''authenticated'');', tbl, tbl);
    execute format('create policy "%s_insert" on public.%I for insert with check (auth.role() = ''authenticated'');', tbl, tbl);
    execute format('create policy "%s_update" on public.%I for update using (auth.role() = ''authenticated'') with check (auth.role() = ''authenticated'');', tbl, tbl);
    execute format('create policy "%s_delete" on public.%I for delete using (auth.role() = ''authenticated'');', tbl, tbl);
  end loop;
end $$;

-- allowlist is readable by anon so the login gate can check the address BEFORE session exists
create policy "allowed_emails_public_read" on public.alignment_allowed_emails
  for select using (true);

--------------------------------------------------------------------------------
-- Storage: signal images bucket
--------------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('alignment-signal-images', 'alignment-signal-images', true)
on conflict (id) do nothing;

create policy "signal_images_read"
  on storage.objects for select
  using (bucket_id = 'alignment-signal-images');

create policy "signal_images_insert"
  on storage.objects for insert
  with check (bucket_id = 'alignment-signal-images' and auth.role() = 'authenticated');

create policy "signal_images_delete"
  on storage.objects for delete
  using (bucket_id = 'alignment-signal-images' and auth.role() = 'authenticated');
