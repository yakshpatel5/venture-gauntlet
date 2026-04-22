-- ============================================================
-- Venture Gauntlet — Sprint 5 Migration (Public Runs + API Keys)
-- Run AFTER previous migrations in Supabase SQL Editor
-- ============================================================

-- Add is_public flag to runs (opt-in, default private)
alter table public.runs
  add column if not exists is_public boolean not null default false;

-- Index for fast public run lookups
create index if not exists runs_is_public on public.runs (id)
  where is_public = true;

-- Public read policy: anyone can read public runs
create policy "Anyone can read public runs"
  on public.runs for select
  using (is_public = true OR auth.uid() = user_id);

-- Drop the old restrictive select policy if it exists
drop policy if exists "Users can read their own runs" on public.runs;

-- API keys table
create table if not exists public.api_keys (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  key_hash    text not null unique,           -- SHA-256 of the raw key
  key_prefix  text not null,                  -- first 8 chars for display (e.g. "vg_live_")
  label       text not null default 'Default key',
  created_at  timestamptz not null default now(),
  last_used_at timestamptz,
  is_active   boolean not null default true
);

-- RLS: users only see their own keys
alter table public.api_keys enable row level security;

create policy "Users manage own API keys"
  on public.api_keys for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
