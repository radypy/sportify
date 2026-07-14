import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/')({
  component: HomePage,
})

function HomePage() {
  return (
    <div className="px-4 pt-6">
      <h1 className="font-display text-2xl font-bold text-foreground">
        Welcome to <span className="text-gradient">Sportify</span>
      </h1>
      <p className="mt-2 text-muted-foreground">
        Your upcoming games and recommendations will appear here.
      </p>

      <section className="mt-8">
        <h2 className="mb-3 font-display text-lg font-semibold text-foreground">
          Your Upcoming Games
        </h2>
        <div className="rounded-xl border border-border bg-surface p-6 text-center text-muted-foreground">
          No upcoming games yet. Find or create one!
        </div>
      </section>

      <section className="mt-6">
        <h2 className="mb-3 font-display text-lg font-semibold text-foreground">
          Recommended for You
        </h2>
        <div className="rounded-xl border border-border bg-surface p-6 text-center text-muted-foreground">
          Set your favorite sports in your profile to get recommendations.
        </div>
      </section>
    </div>
  )
}
