-- ===========================================================================
-- TrustTap AI — initial schema
--
-- Privacy principles encoded in this file:
--
--   * There is NO column for raw message text or uploaded images. If a future
--     change wants to store content, it must add a separate opt-in table with
--     its own retention policy and a documented deletion path.
--   * Every user-owned table is protected by row-level security enabled with
--     policies scoped to `auth.uid()`. Ownership is enforced by the database,
--     not by application code.
--   * No table is publicly readable. In particular, there is deliberately NO
--     public "reported numbers" table: an unverified accusation database of
--     phone numbers, UPI IDs or organisations would be a defamation and privacy
--     hazard. Community reporting, if ever added, needs moderation, rate
--     limiting, minimised evidence and cautious wording.
--
-- Apply with:  supabase db push
-- or by pasting into the Supabase SQL editor.
-- ===========================================================================

-- --- Profiles ---------------------------------------------------------------
-- One row per authenticated user. Stores only preferences.
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  preferred_language text not null default 'en' check (preferred_language in ('en', 'hi')),
  preferred_theme text not null default 'system' check (preferred_theme in ('light', 'dark', 'system')),
  history_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "profiles_delete_own" on public.profiles;
create policy "profiles_delete_own"
  on public.profiles for delete
  using (auth.uid() = id);

-- --- Saved analyses ---------------------------------------------------------
create table if not exists public.analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  content_type text not null,
  risk_level text not null check (
    risk_level in ('high', 'elevated', 'caution', 'no_obvious_red_flags', 'unable_to_assess')
  ),
  risk_score integer not null check (risk_score between 0 and 100),
  language text not null default 'en' check (language in ('en', 'hi')),
  summary text not null,
  -- Structured findings as returned by the validated engine output.
  structured_findings jsonb not null default '[]'::jsonb,
  recommended_actions jsonb not null default '[]'::jsonb,
  -- Redacted, length-capped excerpt only. Never the full message.
  redacted_preview text,
  created_at timestamptz not null default now()
);

create index if not exists analyses_user_created_idx
  on public.analyses (user_id, created_at desc);

alter table public.analyses enable row level security;

drop policy if exists "analyses_select_own" on public.analyses;
create policy "analyses_select_own"
  on public.analyses for select
  using (auth.uid() = user_id);

drop policy if exists "analyses_insert_own" on public.analyses;
create policy "analyses_insert_own"
  on public.analyses for insert
  with check (auth.uid() = user_id);

drop policy if exists "analyses_delete_own" on public.analyses;
create policy "analyses_delete_own"
  on public.analyses for delete
  using (auth.uid() = user_id);

-- Saved checks are an immutable record of what the user was told.
-- Updates are intentionally not permitted, so there is no UPDATE policy.

-- --- Optional: user reports -------------------------------------------------
-- Included for completeness. Only minimised, redacted evidence is stored, and
-- every row starts unmoderated. There is no public read policy: nothing here is
-- ever shown to another user.
create table if not exists public.user_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  report_category text not null,
  redacted_evidence text,
  moderation_status text not null default 'pending' check (
    moderation_status in ('pending', 'reviewed', 'actioned', 'rejected')
  ),
  created_at timestamptz not null default now()
);

alter table public.user_reports enable row level security;

drop policy if exists "user_reports_insert_own" on public.user_reports;
create policy "user_reports_insert_own"
  on public.user_reports for insert
  with check (auth.uid() = user_id);

drop policy if exists "user_reports_select_own" on public.user_reports;
create policy "user_reports_select_own"
  on public.user_reports for select
  using (auth.uid() = user_id);

-- --- Keep updated_at current ------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute function public.touch_updated_at();

-- --- Auto-create a profile on signup ---------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
