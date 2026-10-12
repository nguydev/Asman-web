
import Icon from '../../../components/common/Icon.jsx'
import {
  DW_HC_CASES,
  DW_NEWS,
  dwTagBg,
  dwTagColor,
} from '../../../data/detentionWatchData.js'
import { useIntelAttorneys } from '../../../hooks/useIntelAttorneys.js'

function HcStatTile({ value, label, icon, toneClass, ringClass }) {
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white p-4 text-left shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
      <span className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${ringClass} opacity-90 transition group-hover:h-1.5`} />
      <div className="flex items-center justify-between">
        <span className={`grid h-9 w-9 place-items-center rounded-lg transition group-hover:scale-110 ${toneClass.icon}`}>
          <Icon name={icon} size={16} />
        </span>
      </div>
      <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-zinc-400">
        {label}
      </p>
      <p className={`mt-0.5 text-xl font-bold tracking-tight ${toneClass.value}`}>
        {value}
      </p>
    </div>
  )
}

function LiveIntelligenceFeed() {
  const visible = DW_NEWS.slice(0, 4)
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-start justify-between gap-2">
        <p className="flex items-center gap-2 text-base font-semibold text-zinc-900 dark:text-zinc-50">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
            <Icon name="broadcast" size={15} />
          </span>
          Live Intelligence Feed
        </p>
      </div>
      <p className="mt-1 text-base text-zinc-400">National detention &amp; enforcement news</p>

      <div className="mt-3 flex flex-col divide-y divide-zinc-100 dark:divide-zinc-800">
        {visible.map((n) => (
          <div key={n.head} className="py-2.5 transition hover:pl-1">
            <span
              className="rounded px-2 py-1 text-xs font-bold uppercase tracking-wide"
              style={{ background: dwTagBg(n.tag), color: dwTagColor(n.tag) }}
            >
              {n.lbl}
            </span>
            <p className="mt-1.5 text-base leading-snug text-zinc-800 dark:text-zinc-100">{n.head}</p>
            <div className="mt-1 flex justify-between text-xs text-zinc-400">
              <span>{n.src}</span>
              <span>{n.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function TopAttorneys() {
  const { attorneys, isLoading } = useIntelAttorneys({ limit: 24 })

  const ranked = attorneys.slice(0, 5)

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <p className="flex items-center gap-2 text-base font-semibold text-zinc-900 dark:text-zinc-50">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
          <Icon name="briefcase" size={15} />
        </span>
        Top HC Attorneys
      </p>
      <div className="mt-4 flex flex-col gap-4">
        {isLoading ? (
          <p className="text-sm text-zinc-500">Loading attorneys…</p>
        ) : ranked.length === 0 ? (
          <p className="text-sm text-zinc-500">
            No attorneys from API yet. Run import on the Attorneys page.
          </p>
        ) : (
          ranked.map((a, i) => (
            <div key={a.id} className="flex gap-3">
              <div className="text-sm font-bold text-zinc-400">#{i + 1}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50">{a.name}</p>
                <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">{a.firm}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {a.circuit}
                  {a.circuit !== '—' ? ' Circuit' : ''}
                </p>
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                    <div className="h-full bg-brand" style={{ width: `${Math.min(100, a.rate)}%` }} />
                  </div>
                  <span className="whitespace-nowrap text-xs font-bold text-brand dark:text-brand-dark">
                    {a.rate}% win ({a.wins}/{a.total})
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default function HabeasCorpusTracker({ embedded = false }) {
  const stats = [
    { value: '18,640', label: 'Total Filed', icon: 'clipboard', ring: 'from-brand/60 to-brand/10', tone: { icon: 'bg-brand/10 text-brand dark:bg-brand-dark/15 dark:text-brand-dark', value: 'text-zinc-900 dark:text-zinc-50' } },
    { value: '15,920', label: 'Granted', icon: 'check', ring: 'from-emerald-500/60 to-emerald-500/10', tone: { icon: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400', value: 'text-emerald-600 dark:text-emerald-400' } },
    { value: '1,780', label: 'Denied', icon: 'cross', ring: 'from-red-500/60 to-red-500/10', tone: { icon: 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400', value: 'text-red-600 dark:text-red-400' } },
    { value: '940', label: 'Pending/Appeal', icon: 'clock', ring: 'from-amber-500/60 to-amber-500/10', tone: { icon: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400', value: 'text-zinc-900 dark:text-zinc-50' } },
  ]

  return (
    <div className="flex flex-col gap-5">


      {/* stat tiles */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <HcStatTile key={s.label} value={s.value} label={s.label} icon={s.icon} ringClass={s.ring} toneClass={s.tone} />
        ))}
      </div>

      {/* Main content */}
      <div className={`grid gap-5 items-start ${embedded ? '' : 'lg:grid-cols-3'}`}>
        {/* Table — full width when embedded (feed lives in the hub's right rail) */}
        <div className={`${embedded ? '' : 'lg:col-span-2'} overflow-x-auto rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900`}>
          <p className="mb-4 flex items-center gap-2 text-base font-semibold text-zinc-900 dark:text-zinc-50">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
              <Icon name="list" size={15} />
            </span>
            Active Cases
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-zinc-600 dark:text-zinc-300">
              <thead className="border-b border-zinc-100 bg-zinc-50/50 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-400">
                <tr>
                  <th className="whitespace-nowrap px-3 py-3">Case No.</th>
                  <th className="whitespace-nowrap px-3 py-3">A-Number</th>
                  <th className="px-3 py-3">Respondent</th>
                  <th className="px-3 py-3">Court</th>
                  <th className="px-3 py-3">Judge</th>
                  <th className="px-3 py-3">Outcome</th>
                  <th className="px-3 py-3">Counsel</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                {DW_HC_CASES.map((c) => (
                  <tr key={c.cs} className="transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                    <td className="whitespace-nowrap px-3 py-3 font-medium text-brand dark:text-brand-dark">{c.cs}</td>
                    <td className="whitespace-nowrap px-3 py-3">{c.a}</td>
                    <td className="px-3 py-3">{c.resp}</td>
                    <td className="px-3 py-3">{c.court}</td>
                    <td className="px-3 py-3">{c.judge}</td>
                    <td className="px-3 py-3">
                      <span
                        className={`font-bold uppercase tracking-wide text-xs ${
                          c.out === 'granted'
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : c.out === 'denied'
                            ? 'text-red-600 dark:text-red-400'
                            : c.out === 'appealed'
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-amber-600 dark:text-amber-400'
                        }`}
                      >
                        {c.out}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-sm text-zinc-500 dark:text-zinc-400">{c.atty}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sidebar (Right, 1 col) — hidden when embedded in the hub */}
        {!embedded && (
          <div className="flex flex-col gap-5">
            <LiveIntelligenceFeed />
          </div>
        )}
      </div>

      <TopAttorneys />
    </div>
  )
}
