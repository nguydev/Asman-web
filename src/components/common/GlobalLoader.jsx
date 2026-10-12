export default function GlobalLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-zinc-200 border-t-brand dark:border-zinc-800 dark:border-t-brand-dark"></div>
        <p className="text-sm font-semibold tracking-wider text-zinc-500 uppercase dark:text-zinc-400">Loading ASMAN...</p>
      </div>
    </div>
  )
}
