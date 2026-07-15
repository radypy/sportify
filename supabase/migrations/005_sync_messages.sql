-- Sync script: brings an existing database up to date with the game chat
-- feature (messages table). Mirrors 002_chat.sql but is safe to re-run.
--
-- SAFE TO RUN on a live database: every statement is idempotent and none of
-- them delete rows from existing tables. Run the whole file in the Supabase
-- SQL editor.

-- ============================================================
-- 1. Chat messages for game group chats
-- ============================================================
create table if not exists public.messages (
  id uuid default gen_random_uuid() primary key,
  game_id uuid references public.games(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  content text not null check (char_length(content) > 0 and char_length(content) <= 1000),
  created_at timestamptz default now()
);

create index if not exists idx_messages_game on public.messages(game_id, created_at);
create index if not exists idx_messages_user on public.messages(user_id);

-- ============================================================
-- 2. Row Level Security
-- ============================================================
alter table public.messages enable row level security;

-- Only game participants can read messages
drop policy if exists "Game participants can read messages" on public.messages;
create policy "Game participants can read messages"
  on public.messages for select
  to authenticated
  using (
    exists (
      select 1 from public.game_participants
      where game_participants.game_id = messages.game_id
      and game_participants.user_id = auth.uid()
    )
  );

-- Only game participants can send messages
drop policy if exists "Game participants can send messages" on public.messages;
create policy "Game participants can send messages"
  on public.messages for insert
  to authenticated
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.game_participants
      where game_participants.game_id = messages.game_id
      and game_participants.user_id = auth.uid()
    )
  );

-- Users can delete their own messages
drop policy if exists "Users can delete own messages" on public.messages;
create policy "Users can delete own messages"
  on public.messages for delete
  to authenticated
  using (auth.uid() = user_id);

-- ============================================================
-- 3. Enable realtime for messages (guarded — add only if not already a member)
-- ============================================================
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'messages'
  ) then
    alter publication supabase_realtime add table public.messages;
  end if;
end $$;
