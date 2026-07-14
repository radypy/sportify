import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { getSupabase } from '~/lib/supabase'
import {
  SPORTS,
  SPORT_LABEL,
  SPORT_EMOJI,
  SKILL_LEVELS,
  SKILL_LABEL,
} from '~/lib/sports'
import type { Profile } from '~/lib/types'
import type { Sport, SkillLevel } from '~/lib/sports'

export const Route = createFileRoute('/_authenticated/profile')({
  component: ProfilePage,
})

function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  const [name, setName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [age, setAge] = useState('')
  const [city, setCity] = useState('')
  const [position, setPosition] = useState('')
  const [preferredTimes, setPreferredTimes] = useState('')
  const [skillLevel, setSkillLevel] = useState<SkillLevel>('intermediate')
  const [favoriteSports, setFavoriteSports] = useState<Sport[]>([])
  const [bio, setBio] = useState('')

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    const supabase = getSupabase()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (data) {
      const p = data as Profile
      setProfile(p)
      setName(p.name ?? '')
      setAvatarUrl(p.avatar_url ?? '')
      setAge(p.age?.toString() ?? '')
      setCity(p.city ?? '')
      setPosition(p.position ?? '')
      setPreferredTimes(p.preferred_times ?? '')
      setSkillLevel((p.skill_level as SkillLevel) ?? 'intermediate')
      setFavoriteSports((p.favorite_sports as Sport[]) ?? [])
      setBio(p.bio ?? '')
    }
    setLoading(false)
  }

  const toggleSport = (sport: Sport) => {
    setFavoriteSports((prev) =>
      prev.includes(sport) ? prev.filter((s) => s !== sport) : [...prev, sport],
    )
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    setSaving(true)

    try {
      const supabase = getSupabase()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('profiles')
        .update({
          name: name || null,
          avatar_url: avatarUrl || null,
          age: age ? parseInt(age) : null,
          city: city || null,
          position: position || null,
          preferred_times: preferredTimes || null,
          skill_level: skillLevel,
          favorite_sports: favoriteSports,
          bio: bio || null,
        })
        .eq('id', user.id)

      if (error) throw error
      setMessage({ type: 'success', text: 'Profile updated!' })
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message ?? 'Failed to save' })
    } finally {
      setSaving(false)
    }
  }

  const handleSignOut = async () => {
    await getSupabase().auth.signOut()
    window.location.href = '/auth'
  }

  if (loading) {
    return (
      <div className="px-4 pt-6 text-center text-muted-foreground">
        Loading profile...
      </div>
    )
  }

  return (
    <div className="px-4 pt-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-foreground">
          Profile
        </h1>
        <button
          onClick={handleSignOut}
          className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-red-500/50 hover:text-red-400"
        >
          Sign Out
        </button>
      </div>

      {/* Avatar preview */}
      <div className="mb-6 flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-surface">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Avatar"
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-2xl text-muted-foreground">
              {name ? name[0].toUpperCase() : '?'}
            </span>
          )}
        </div>
        <div>
          <p className="font-display font-semibold text-foreground">
            {name || 'Set your name'}
          </p>
          <p className="text-sm text-muted-foreground">
            {profile?.games_played ?? 0} games played
            {profile?.rating ? ` · ${profile.rating} rating` : ''}
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-4 pb-8">
        {/* Name */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Avatar URL */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Avatar URL
          </label>
          <input
            type="url"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="https://..."
            className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Age & City */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Age
            </label>
            <input
              type="number"
              min={1}
              max={149}
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="25"
              className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              City
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Sofia"
              className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        {/* Position */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Position
          </label>
          <input
            type="text"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            placeholder="e.g. Goalkeeper, Point Guard"
            className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Preferred Times */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Preferred Playing Times
          </label>
          <input
            type="text"
            value={preferredTimes}
            onChange={(e) => setPreferredTimes(e.target.value)}
            placeholder="e.g. Weekday evenings, Weekend mornings"
            className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Skill Level */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Skill Level
          </label>
          <div className="flex flex-wrap gap-2">
            {SKILL_LEVELS.map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setSkillLevel(level)}
                className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                  skillLevel === level
                    ? 'border-secondary bg-secondary/10 text-secondary'
                    : 'border-border text-muted-foreground hover:border-secondary/50'
                }`}
              >
                {SKILL_LABEL[level]}
              </button>
            ))}
          </div>
        </div>

        {/* Favorite Sports */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Favorite Sports
          </label>
          <div className="grid grid-cols-4 gap-2">
            {SPORTS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => toggleSport(s)}
                className={`flex flex-col items-center gap-1 rounded-xl border p-2 text-xs transition-colors ${
                  favoriteSports.includes(s)
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-surface text-muted-foreground hover:border-primary/50'
                }`}
              >
                <span className="text-lg">{SPORT_EMOJI[s]}</span>
                <span className="leading-tight">{SPORT_LABEL[s]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Bio */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Bio
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell others about yourself..."
            rows={3}
            className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {message && (
          <div
            className={`rounded-xl border px-4 py-3 text-sm ${
              message.type === 'success'
                ? 'border-green-500/30 bg-green-500/10 text-green-400'
                : 'border-red-500/30 bg-red-500/10 text-red-400'
            }`}
          >
            {message.text}
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="gradient-hero shadow-glow w-full rounded-xl px-4 py-3.5 font-display font-semibold text-background transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </form>
    </div>
  )
}
