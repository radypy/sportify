-- Sync script: brings an existing database up to date with the per-sport
-- level/position model (added in 001 after some databases were already created).
--
-- SAFE TO RUN on a live database: every statement is idempotent and none of
-- them delete rows from existing tables. Run the whole file in the Supabase
-- SQL editor.

-- ============================================================
-- 1. Per-sport profile details (player level & position)
-- ============================================================
create table if not exists public.profile_sports (
  id uuid default gen_random_uuid() primary key,
  profile_id uuid references public.profiles(id) on delete cascade not null,
  sport text not null check (sport in (
    'football','basketball','volleyball','tennis','table_tennis',
    'padel','squash','chess','board_games','esports',
    'paintball','martial_arts','running','other'
  )),
  player_level text not null default 'beginner' check (player_level in (
    'beginner','novice','intermediate','advanced','semi-pro','professional'
  )),
  player_position text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(profile_id, sport)
);

create index if not exists idx_profile_sports_profile
  on public.profile_sports(profile_id);

-- ============================================================
-- 2. updated_at trigger for profile_sports
-- ============================================================
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists on_profile_sport_update on public.profile_sports;
create trigger on_profile_sport_update
  before update on public.profile_sports
  for each row execute function public.update_updated_at();

-- ============================================================
-- 3. Row Level Security
-- ============================================================
alter table public.profile_sports enable row level security;

drop policy if exists "Profile sports are viewable by authenticated users" on public.profile_sports;
create policy "Profile sports are viewable by authenticated users"
  on public.profile_sports for select
  to authenticated
  using (true);

drop policy if exists "Users can add own sports" on public.profile_sports;
create policy "Users can add own sports"
  on public.profile_sports for insert
  to authenticated
  with check (auth.uid() = profile_id);

drop policy if exists "Users can update own sports" on public.profile_sports;
create policy "Users can update own sports"
  on public.profile_sports for update
  to authenticated
  using (auth.uid() = profile_id);

drop policy if exists "Users can delete own sports" on public.profile_sports;
create policy "Users can delete own sports"
  on public.profile_sports for delete
  to authenticated
  using (auth.uid() = profile_id);

-- ============================================================
-- 4. OPTIONAL — remove dead columns from profiles
-- ============================================================
-- These columns are no longer used by the app (level/position are now
-- per-sport in profile_sports). Dropping them permanently deletes any data
-- still stored in them. Uncomment only if you are sure you don't need it.
--
-- alter table public.profiles drop column if exists position;
-- alter table public.profiles drop column if exists skill_level;
-- alter table public.profiles drop column if exists favorite_sports;
