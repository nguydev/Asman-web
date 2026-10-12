export function StatCard({ label, value, hint }) {
  return (
    <div className="flex flex-col gap-1.5 rounded-xl glass-panel p-5 transition-all duration-300 hover:border-brand/30 hover:shadow-[0_0_20px_rgba(0,229,255,0.1)] group">
      <span className="text-sm font-medium text-zinc-500 transition-colors group-hover:text-zinc-400">
        {label}
      </span>
      <span className="text-2xl font-bold tracking-tight capitalize text-zinc-50 transition-all group-hover:glow-text">
        {value}
      </span>
      {hint && (
        <span className="text-xs font-medium text-brand/70">{hint}</span>
      )}
    </div>
  )
}
