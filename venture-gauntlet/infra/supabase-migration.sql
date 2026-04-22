-- ============================================================
-- Venture Gauntlet — Supabase Migration
-- Run this once in your Supabase project: SQL Editor → Run
-- ============================================================

-- Runs table: one row per completed analysis
create table if not exists public.runs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  idea        text not null,
  audience    text not null,
  geography   text not null,
  price_point integer not null,
  result      jsonb not null,
  decision    text not null check (decision in ('PROCEED', 'PIVOT', 'KILL')),
  probability integer not null check (probability >= 0 and probability <= 100),
  created_at  timestamptz not null default now()
);

-- Index for fast per-user history queries
create index if not exists runs_user_id_created_at
  on public.runs (user_id, created_at desc);

-- RLS: users can only read/write their own rows
alter table public.runs enable row level security;

create policy "Users can insert their own runs"
  on public.runs for insert
  with check (auth.uid() = user_id);

create policy "Users can read their own runs"
  on public.runs for select
  using (auth.uid() = user_id);
