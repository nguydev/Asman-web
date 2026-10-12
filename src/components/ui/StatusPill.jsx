const PILL_STYLES = {
  active: 'border border-green-500/30 bg-green-500/10 text-green-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]',
  available: 'border border-green-500/30 bg-green-500/10 text-green-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]',
  on_trip: 'border border-brand/30 bg-brand/10 text-brand shadow-[0_0_15px_rgba(0,229,255,0.2)]',
  idle: 'border border-zinc-700 bg-zinc-800/50 text-zinc-400',
  off_duty: 'border border-zinc-700 bg-zinc-800/50 text-zinc-400',
  inactive: 'border border-zinc-700 bg-zinc-800/50 text-zinc-400',
  maintenance: 'border border-amber-500/30 bg-amber-500/10 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]',
}

export function StatusPill({ status }) {
  const label = String(status).replaceAll('_', ' ')
  const cls = PILL_STYLES[status] || PILL_STYLES.idle
  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-[10px] font-bold tracking-widest uppercase backdrop-blur-md ${cls}`}
    >
      {label}
    </span>
  )
}
