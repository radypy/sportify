import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { getSupabase } from '~/lib/supabase'
import { SPORTS, SPORT_LABEL, SPORT_EMOJI, SKILL_LABEL } from '~/lib/sports'
import type { Game } from '~/lib/types'
import type { Sport } from '~/lib/sports'

export const Route = createFileRoute('/_authenticated/find')({
  component: FindGamesPage,
})

function FindGamesPage() {
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sportFilter, setSportFilter] = useState<Sport | 'all'>('all')

  useEffect(() => {
    loadGames()
  }, [])

  const loadGames = async () => {
    setLoading(true)
    const { data, error } = await getSupabase()
      .from('games')
      .select('*')
      .eq('status', 'open')
      .gte('date_time', new Date().toISOString())
      .order('date_time', { ascending: true })

    if (!error && data) setGames(data as Game[])
    setLoading(false)
  }

  const filtered = games.filter((g) => {
    const matchesSearch =
      !search ||
      g.title.toLowerCase().includes(search.toLowerCase()) ||
      g.location.toLowerCase().includes(search.toLowerCase())
    const matchesSport = sportFilter === 'all' || g.sport === sportFilter
    return matchesSearch && matchesSport
  })

  const handleJoin = async (gameId: string) => {
    const supabase = getSupabase()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('game_participants')
      .insert({ game_id: gameId, user_id: user.id })

    if (error) {
      if (error.code === '23505') alert('You already joined this game!')
      else alert(error.message)
    } else {
      loadGames()
    }
  }

  return (
    <div className="px-4 pt-6">
      <h1 className="mb-4 font-display text-2xl font-bold text-foreground">
        Find Games
      </h1>

      {/* Search */}
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by title or location..."
        className="mb-4 w-full rounded-xl border border-border bg-surface px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
      />

      {/* Sport filter */}
      <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setSportFilter('all')}
          className={`shrink-0 rounded-full border px-3 py-1.5 text-sm transition-colors ${
            sportFilter === 'all'
              ? 'border-primary bg-primary/10 text-primary'
              : 'border-border text-muted-foreground'
          }`}
        >
          All
        </button>
        {SPORTS.map((s) => (
          <button
            key={s}
            onClick={() => setSportFilter(s)}
            className={`shrink-0 rounded-full border px-3 py-1.5 text-sm transition-colors ${
              sportFilter === s
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border text-muted-foreground'
            }`}
          >
            {SPORT_EMOJI[s]} {SPORT_LABEL[s]}
          </button>
        ))}
      </div>

      {/* Games list */}
      {loading ? (
        <div className="py-12 text-center text-muted-foreground">
          Loading games...
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface p-6 text-center text-muted-foreground">
          No games found. Be the first to create one!
        </div>
      ) : (
        <div className="space-y-3 pb-8">
          {filtered.map((game) => (
            <GameCard key={game.id} game={game} onJoin={handleJoin} />
          ))}
        </div>
      )}
    </div>
  )
}

function GameCard({
  game,
  onJoin,
}: {
  game: Game
  onJoin: (id: string) => void
}) {
  const date = new Date(game.date_time)
  const spotsLeft = game.max_players - game.current_players

  return (
    <Link
      to="/games/$id"
      params={{ id: game.id }}
      className="block rounded-xl border border-border bg-surface p-4 transition-colors hover:border-primary/50"
    >
      <div className="mb-2 flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">
            {SPORT_EMOJI[game.sport as keyof typeof SPORT_EMOJI]}
          </span>
          <div>
            <h3 className="font-display font-semibold text-foreground">
              {game.title}
            </h3>
            <p className="text-sm text-muted-foreground">{game.location}</p>
          </div>
        </div>
        {game.skill_level && (
          <span className="rounded-full border border-secondary/30 bg-secondary/10 px-2 py-0.5 text-xs text-secondary">
            {SKILL_LABEL[game.skill_level as keyof typeof SKILL_LABEL]}
          </span>
        )}
      </div>

      <div className="mb-3 flex items-center gap-4 text-sm text-muted-foreground">
        <span>
          {date.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
          })}{' '}
          {date.toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
        <span>
          {game.current_players}/{game.max_players} players
        </span>
        {game.price && game.price > 0 && <span>{game.price} BGN</span>}
      </div>

      <div className="flex items-center justify-between">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-border">
          <div
            className="h-full rounded-full gradient-hero transition-all"
            style={{
              width: `${(game.current_players / game.max_players) * 100}%`,
            }}
          />
        </div>
        <span className="ml-3 text-xs text-muted-foreground">
          {spotsLeft > 0 ? `${spotsLeft} spots left` : 'Full'}
        </span>
      </div>

      {spotsLeft > 0 && (
        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onJoin(game.id)
          }}
          className="mt-3 w-full rounded-xl bg-primary/10 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/20"
        >
          Join Game
        </button>
      )}
    </Link>
  )
}
