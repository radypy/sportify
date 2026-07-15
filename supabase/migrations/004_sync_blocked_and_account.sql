-- Sync script: brings an existing database up to date with the
-- remove/block-players feature and self-serve account deletion (added to 001
-- after some databases were already created).
--
-- SAFE TO RUN on a live database: every statement is idempotent and none of
-- them delete rows from existing tables. Run the whole file in the Supabase
-- SQL editor. Run 003_sync_profile_sports.sql first (or before this) if you
-- haven't already.

-- ============================================================
-- 1. Players blocked from rejoining a specific game
-- ============================================================
create table if not exists public.game_blocked_players (
  id uuid default gen_random_uuid() primary key,
  game_id uuid references public.games(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  blocked_by uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(game_id, user_id)
);

create index if not exists idx_game_blocked_players_game
  on public.game_blocked_players(game_id);

alter table public.game_blocked_players enable row level security;

-- ============================================================
-- 2. Updated join policy — block blocked players from rejoining
-- ============================================================
-- The original "Users can join games" policy only checked auth.uid() = user_id.
-- Replace it with the version that also excludes blocked players.
drop policy if exists "Users can join games" on public.game_participants;
create policy "Users can join games"
  on public.game_participants for insert
  to authenticated
  with check (
    auth.uid() = user_id
    and not exists (
      select 1 from public.game_blocked_players
      where game_blocked_players.game_id = game_participants.game_id
      and game_blocked_players.user_id = auth.uid()
    )
  );

-- ============================================================
-- 3. Creators can remove participants from their own games
-- ============================================================
drop policy if exists "Creators can remove participants" on public.game_participants;
create policy "Creators can remove participants"
  on public.game_participants for delete
  to authenticated
  using (
    exists (
      select 1 from public.games
      where games.id = game_participants.game_id
      and games.creator_id = auth.uid()
    )
  );

-- ============================================================
-- 4. RLS for game_blocked_players
-- ============================================================
drop policy if exists "Creators can view blocked players" on public.game_blocked_players;
create policy "Creators can view blocked players"
  on public.game_blocked_players for select
  to authenticated
  using (
    exists (
      select 1 from public.games
      where games.id = game_blocked_players.game_id
      and games.creator_id = auth.uid()
    )
  );

drop policy if exists "Users can check own block status" on public.game_blocked_players;
create policy "Users can check own block status"
  on public.game_blocked_players for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Creators can block players" on public.game_blocked_players;
create policy "Creators can block players"
  on public.game_blocked_players for insert
  to authenticated
  with check (
    exists (
      select 1 from public.games
      where games.id = game_blocked_players.game_id
      and games.creator_id = auth.uid()
    )
  );

drop policy if exists "Creators can unblock players" on public.game_blocked_players;
create policy "Creators can unblock players"
  on public.game_blocked_players for delete
  to authenticated
  using (
    exists (
      select 1 from public.games
      where games.id = game_blocked_players.game_id
      and games.creator_id = auth.uid()
    )
  );

-- ============================================================
-- 5. Self-serve account deletion RPC
-- ============================================================
-- Lets a user permanently delete their own account. Deleting the auth.users
-- row cascades to profiles and everything owned by them.
create or replace function public.delete_own_account()
returns void as $$
begin
  delete from auth.users where id = auth.uid();
end;
$$ language plpgsql security definer set search_path = public;

revoke all on function public.delete_own_account() from public;
grant execute on function public.delete_own_account() to authenticated;
