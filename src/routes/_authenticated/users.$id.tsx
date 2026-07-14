import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { getSupabase } from '~/lib/supabase'
import { SPORT_EMOJI, SPORT_LABEL, SKILL_LABEL } from '~/lib/sports'
import type { Profile } from '~/lib/types'

export const Route = createFileRoute('/_authenticated/users/$id')({
  component: UserProfilePage,
})

function UserProfilePage() {
  const { id } = Route.useParams()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getSupabase()
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data }) => {
        if (data) setProfile(data as Profile)
        setLoading(false)
      })
  }, [id])

  if (loading) {
    return (
      <div className="px-4 pt-6 text-center text-muted-foreground">
        Loading...
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="px-4 pt-6 text-center text-muted-foreground">
        Player not found.
      </div>
    )
  }

  return (
    <div className="px-4 pt-6 pb-8">
      {/* Header */}
      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-surface">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-3xl text-muted-foreground">
              {profile.name?.[0]?.toUpperCase() ?? '?'}
            </span>
          )}
        </div>
        <h1 className="font-display text-2xl font-bold text-foreground">
          {profile.name ?? 'Player'}
        </h1>
        {profile.city && (
          <p className="text-sm text-muted-foreground">{profile.city}</p>
        )}
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-border bg-surface p-3 text-center">
          <p className="font-display text-xl font-bold text-primary">
            {profile.games_played}
          </p>
          <p className="text-xs text-muted-foreground">Games</p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-3 text-center">
          <p className="font-display text-xl font-bold text-secondary">
            {profile.rating ?? '-'}
          </p>
          <p className="text-xs text-muted-foreground">Rating</p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-3 text-center">
          <p className="font-display text-xl font-bold text-foreground">
            {profile.skill_level
              ? SKILL_LABEL[
                  profile.skill_level as keyof typeof SKILL_LABEL
                ]?.split('-')[0]
              : '-'}
          </p>
          <p className="text-xs text-muted-foreground">Level</p>
        </div>
      </div>

      {/* Info */}
      <div className="space-y-4">
        {profile.position && (
          <div>
            <h3 className="mb-1 text-sm font-medium text-muted-foreground">
              Position
            </h3>
            <p className="text-foreground">{profile.position}</p>
          </div>
        )}

        {profile.bio && (
          <div>
            <h3 className="mb-1 text-sm font-medium text-muted-foreground">
              Bio
            </h3>
            <p className="text-foreground">{profile.bio}</p>
          </div>
        )}

        {profile.favorite_sports && profile.favorite_sports.length > 0 && (
          <div>
            <h3 className="mb-2 text-sm font-medium text-muted-foreground">
              Favorite Sports
            </h3>
            <div className="flex flex-wrap gap-2">
              {profile.favorite_sports.map((s) => (
                <span
                  key={s}
                  className="rounded-full border border-border bg-surface px-3 py-1 text-sm text-foreground"
                >
                  {SPORT_EMOJI[s as keyof typeof SPORT_EMOJI]}{' '}
                  {SPORT_LABEL[s as keyof typeof SPORT_LABEL]}
                </span>
              ))}
            </div>
          </div>
        )}

        {profile.preferred_times && (
          <div>
            <h3 className="mb-1 text-sm font-medium text-muted-foreground">
              Preferred Times
            </h3>
            <p className="text-foreground">{profile.preferred_times}</p>
          </div>
        )}
      </div>
    </div>
  )
}
