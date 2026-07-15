import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { getSupabase } from '~/lib/supabase'
import { SPORT_EMOJI, SPORT_LABEL, SKILL_LABEL } from '~/lib/sports'
import type { Game, Profile } from '~/lib/types'

export const Route = createFileRoute('/_authenticated/games/$id')({
  component: GameDetailsPage,
})

function GameDetailsPage() {
  const { id } = Route.useParams()
  const [game, setGame] = useState<Game | null>(null)
  const [creator, setCreator] = useState<Profile | null>(null)
  const [participants, setParticipants] = useState<Profile[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    loadGame()
  }, [id])

  const loadGame = async () => {
    const supabase = getSupabase()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (user) setUserId(user.id)

    const { data: gameData } = await supabase
      .from('games')
      .select('*')
      .eq('id', id)
      .single()

    if (gameData) {
      setGame(gameData as Game)

      const { data: creatorData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', gameData.creator_id)
        .single()
      if (creatorData) setCreator(creatorData as Profile)

      const { data: partData } = await supabase
        .from('game_participants')
        .select('user_id')
        .eq('game_id', id)

      if (partData) {
        const userIds = partData.map((p: any) => p.user_id)
        const { data: profiles } = await supabase
          .from('profiles')
          .select('*')
          .in('id', userIds)
        if (profiles) setParticipants(profiles as Profile[])
      }
    }
    setLoading(false)
  }

  const isParticipant = participants.some((p) => p.id === userId)
  const isCreator = game?.creator_id === userId

  const handleJoin = async () => {
    if (!userId || !game) return
    setActionLoading(true)
    const { error } = await getSupabase()
      .from('game_participants')
      .insert({ game_id: game.id, user_id: userId })
    if (error) alert(error.message)
    else await loadGame()
    setActionLoading(false)
  }

  const handleLeave = async () => {
    if (!userId || !game) return
    setActionLoading(true)
    await getSupabase()
      .from('game_participants')
      .delete()
      .eq('game_id', game.id)
      .eq('user_id', userId)
    await loadGame()
    setActionLoading(false)
  }

  const handleCancel = async () => {
    if (!game || !confirm('Cancel this game?')) return
    setActionLoading(true)
    await getSupabase()
      .from('games')
      .update({ status: 'cancelled' })
      .eq('id', game.id)
    await loadGame()
    setActionLoading(false)
  }

  if (loading) {
    return (
      <div className="px-4 pt-6 text-center text-muted-foreground">
        Loading game...
      </div>
    )
  }

  if (!game) {
    return (
      <div className="px-4 pt-6 text-center text-muted-foreground">
        Game not found.
      </div>
    )
  }

  const date = new Date(game.date_time)
  const spotsLeft = game.max_players - game.current_players
  const now = new Date()
  const diff = date.getTime() - now.getTime()
  const daysLeft = Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)))
  const hoursLeft = Math.max(
    0,
    Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
  )

  return (
    <div className="px-4 pt-6 pb-24">
      {/* Hero card */}
      <div className="mb-6 overflow-hidden rounded-2xl border border-border bg-surface">
        <div className="gradient-hero p-6 text-center">
          <span className="text-4xl">
            {SPORT_EMOJI[game.sport as keyof typeof SPORT_EMOJI]}
          </span>
          <h1 className="mt-2 font-display text-2xl font-bold text-background">
            {game.title}
          </h1>
          <span className="mt-1 inline-block rounded-full bg-background/20 px-3 py-0.5 text-sm text-background">
            {SPORT_LABEL[game.sport as keyof typeof SPORT_LABEL]}
          </span>
        </div>

        <div className="p-4">
          {/* Countdown */}
          {game.status === 'open' && diff > 0 && (
            <div className="mb-4 text-center text-sm text-muted-foreground">
              Starts in{' '}
              <span className="font-semibold text-primary">
                {daysLeft > 0 ? `${daysLeft}d ` : ''}
                {hoursLeft}h
              </span>
            </div>
          )}

          {game.status === 'cancelled' && (
            <div className="mb-4 rounded-lg bg-red-500/10 py-2 text-center text-sm font-medium text-red-400">
              This game has been cancelled
            </div>
          )}

          {/* Details */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date</span>
              <span className="text-foreground">
                {date.toLocaleDateString('en-GB', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                })}{' '}
                at{' '}
                {date.toLocaleTimeString('en-GB', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Location</span>
              <span className="text-foreground">{game.location}</span>
            </div>
            {game.city && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">City</span>
                <span className="text-foreground">{game.city}</span>
              </div>
            )}
            {game.skill_level && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Skill Level</span>
                <span className="text-secondary">
                  {SKILL_LABEL[game.skill_level as keyof typeof SKILL_LABEL]}
                </span>
              </div>
            )}
            {game.price != null && game.price > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Price</span>
                <span className="text-foreground">{game.price} BGN</span>
              </div>
            )}
          </div>

          {game.description && (
            <p className="mt-4 text-sm text-muted-foreground">
              {game.description}
            </p>
          )}
        </div>
      </div>

      {/* Squad meter */}
      <div className="mb-6">
        <h2 className="mb-3 font-display text-lg font-semibold text-foreground">
          Squad ({game.current_players}/{game.max_players})
        </h2>
        <div className="mb-3 h-3 overflow-hidden rounded-full bg-border">
          <div
            className="h-full rounded-full gradient-hero transition-all"
            style={{
              width: `${(game.current_players / game.max_players) * 100}%`,
            }}
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          {participants.map((p) => (
            <Link
              key={p.id}
              to="/users/$id"
              params={{ id: p.id }}
              className="flex items-center gap-2 rounded-xl border border-border bg-surface p-2.5 transition-colors hover:border-primary/50"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-background text-sm text-muted-foreground">
                {p.avatar_url ? (
                  <img
                    src={p.avatar_url}
                    alt=""
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  p.name?.[0]?.toUpperCase() ?? '?'
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">
                  {p.name ?? 'Player'}
                </p>
                <p className="truncate text-xs">
                  {p.skill_level ? (
                    <span className="text-secondary">
                      {SKILL_LABEL[p.skill_level]}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">No level set</span>
                  )}
                  {p.id === game.creator_id && (
                    <span className="text-primary"> · Host</span>
                  )}
                </p>
              </div>
            </Link>
          ))}
          {Array.from({ length: spotsLeft }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="flex items-center gap-2 rounded-xl border border-dashed border-border p-2.5"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-background text-muted-foreground">
                ?
              </div>
              <span className="text-sm text-muted-foreground">Open spot</span>
            </div>
          ))}
        </div>
      </div>

      {/* Host card */}
      {creator && (
        <div className="mb-6">
          <h2 className="mb-3 font-display text-lg font-semibold text-foreground">
            Host
          </h2>
          <Link
            to="/users/$id"
            params={{ id: creator.id }}
            className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3 transition-colors hover:border-primary/50"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-background text-lg text-muted-foreground">
              {creator.avatar_url ? (
                <img
                  src={creator.avatar_url}
                  alt=""
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                creator.name?.[0]?.toUpperCase() ?? '?'
              )}
            </div>
            <div>
              <p className="font-semibold text-foreground">
                {creator.name ?? 'Unknown'}
              </p>
              <p className="text-sm text-muted-foreground">
                {creator.games_played} games played
                {creator.rating ? ` · ${creator.rating} rating` : ''}
              </p>
            </div>
          </Link>
        </div>
      )}

      {/* Action bar */}
      {game.status === 'open' && (
        <div className="fixed bottom-16 left-0 right-0 border-t border-border bg-background/95 p-4 backdrop-blur-sm">
          <div className="mx-auto max-w-md">
            {isCreator ? (
              <button
                onClick={handleCancel}
                disabled={actionLoading}
                className="w-full rounded-xl border border-red-500/50 py-3 text-sm font-semibold text-red-400 transition-colors hover:bg-red-500/10 disabled:opacity-50"
              >
                {actionLoading ? 'Cancelling...' : 'Cancel Game'}
              </button>
            ) : isParticipant ? (
              <button
                onClick={handleLeave}
                disabled={actionLoading}
                className="w-full rounded-xl border border-border py-3 text-sm font-semibold text-muted-foreground transition-colors hover:bg-surface disabled:opacity-50"
              >
                {actionLoading ? 'Leaving...' : 'Leave Game'}
              </button>
            ) : spotsLeft > 0 ? (
              <button
                onClick={handleJoin}
                disabled={actionLoading}
                className="gradient-hero shadow-glow w-full rounded-xl py-3 font-display font-semibold text-background transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {actionLoading ? 'Joining...' : 'Join Game'}
              </button>
            ) : (
              <div className="rounded-xl bg-surface py-3 text-center text-sm text-muted-foreground">
                Game is full
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
