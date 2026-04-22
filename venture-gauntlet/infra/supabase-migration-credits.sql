-- ============================================================
-- Venture Gauntlet — Sprint 4 Migration (Credits + Stripe)
-- Run AFTER supabase-migration.sql in Supabase SQL Editor
-- ============================================================

-- Credits balance per user (one row per user)
create table if not exists public.user_credits (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  credits    integer not null default 0 check (credits >= 0),
  updated_at timestamptz not null default now()
);

-- Credits transaction log (audit trail)
create table if not exists public.credits_log (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  delta            integer not null,           -- positive = credit, negative = debit
  reason           text not null,              -- 'signup_bonus' | 'purchase' | 'run_consumed'
  stripe_session_id text,                      -- set on purchase events
  created_at       timestamptz not null default now()
);

-- Index for balance lookups
create index if not exists credits_log_user_id on public.credits_log (user_id, created_at desc);

-- RLS: users can only read their own rows
alter table public.user_credits enable row level security;
alter table public.credits_log enable row level security;

create policy "Users read own credits"
  on public.user_credits for select using (auth.uid() = user_id);

create policy "Users read own log"
  on public.credits_log for select using (auth.uid() = user_id);

-- Function: grant 1 free credit on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.user_credits (user_id, credits) values (new.id, 1);
  insert into public.credits_log (user_id, delta, reason) values (new.id, 1, 'signup_bonus');
  return new;
end;
$$;

-- Trigger: fires after every new user is created
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- RPC: atomic decrement (returns remaining credits, errors if < 0)
create or replace function public.decrement_credit(p_user_id uuid)
returns void language plpgsql security definer as $$
begin
  update public.user_credits
  set credits = credits - 1, updated_at = now()
  where user_id = p_user_id and credits > 0;

  if not found then
    raise exception 'insufficient_credits';
  end if;
end;
$$;

-- RPC: add credits (upsert)
create or replace function public.add_credits(p_user_id uuid, p_amount integer)
returns void language plpgsql security definer as $$
begin
  insert into public.user_credits (user_id, credits)
  values (p_user_id, p_amount)
  on conflict (user_id)
  do update set credits = user_credits.credits + p_amount, updated_at = now();
end;
$$;
