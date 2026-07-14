import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: LandingPage,
})

const FEATURED_SPORTS = [
  { emoji: '\u26BD', label: 'Football' },
  { emoji: '\uD83C\uDFC0', label: 'Basketball' },
  { emoji: '\uD83C\uDFD0', label: 'Volleyball' },
  { emoji: '\uD83C\uDFBE', label: 'Tennis' },
  { emoji: '\uD83C\uDFD3', label: 'Table Tennis' },
  { emoji: '\uD83C\uDFBE', label: 'Padel' },
  { emoji: '\u265F\uFE0F', label: 'Chess' },
  { emoji: '\uD83C\uDFAE', label: 'Esports' },
]

function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="mx-auto w-full max-w-md text-center">
        {/* Logo */}
        <div className="mb-2 text-5xl">
          <span className="text-gradient font-display text-6xl font-bold tracking-tight">
            Sportify
          </span>
        </div>

        {/* Tagline */}
        <p className="mb-8 text-lg text-muted-foreground">
          Find your game. Join the squad.
        </p>

        {/* Sport grid */}
        <div className="mb-10 grid grid-cols-4 gap-3">
          {FEATURED_SPORTS.map((sport) => (
            <div
              key={sport.label}
              className="flex flex-col items-center gap-1 rounded-xl bg-surface p-3 transition-transform hover:scale-105"
            >
              <span className="text-2xl">{sport.emoji}</span>
              <span className="text-xs text-muted-foreground">
                {sport.label}
              </span>
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col gap-3">
          <a
            href="/auth"
            className="gradient-hero shadow-glow inline-flex items-center justify-center rounded-full px-8 py-3.5 font-display text-base font-semibold text-background transition-opacity hover:opacity-90"
          >
            Get Started
          </a>
          <a
            href="/find"
            className="inline-flex items-center justify-center rounded-full border border-border bg-surface px-8 py-3.5 font-display text-base font-semibold text-foreground transition-colors hover:bg-border"
          >
            Find Games
          </a>
        </div>

        {/* Footer note */}
        <p className="mt-12 text-sm text-muted-foreground">
          Connect with players &middot; Organize games &middot; Build your squad
        </p>
      </div>
    </div>
  )
}
