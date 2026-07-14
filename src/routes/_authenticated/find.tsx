import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/find')({
  component: () => (
    <div className="px-4 pt-6">
      <h1 className="font-display text-2xl font-bold text-foreground">
        Find Games
      </h1>
      <p className="mt-2 text-muted-foreground">Coming soon.</p>
    </div>
  ),
})
