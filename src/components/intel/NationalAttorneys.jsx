import { Link } from 'react-router-dom'
import { useIntelAttorneys } from '../../hooks/useIntelAttorneys.js'

export default function NationalAttorneys() {
  const { attorneys, isLoading, error, usingMock } = useIntelAttorneys({ limit: 100 })

  return (
    <div className="flex flex-col gap-4">
      <div className="mb-2 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
            Top HC Attorneys
          </h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Ranked by case volume and win rate
            {usingMock ? ' · demo roster' : ' from the attorneys API'}
          </p>
        </div>
        <Link
          to="/attorneys"
          className="text-xs font-semibold text-brand hover:underline dark:text-brand-dark"
        >
          Manage attorneys →
        </Link>
      </div>

      {isLoading ? (
        <p className="py-12 text-center text-sm text-zinc-500">Loading attorneys…</p>
      ) : error ? (
        <p className="py-12 text-center text-sm text-red-500">
          Could not load attorneys from the API.
        </p>
      ) : attorneys.length === 0 ? (
        <p className="py-12 text-center text-sm text-zinc-500">
          No attorneys yet. Import from Parkealo via the Attorneys page.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {attorneys.map((a, i) => (
            <Link
              key={a.id}
              to={`/attorneys/${a.id}`}
              className={`group rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 ${
                i < 3 ? 'border-t-2 border-t-brand dark:border-t-brand-dark' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="text-xl font-bold text-zinc-300 dark:text-zinc-700">
                  #{i + 1}
                </div>
                <div className="flex-1 text-right">
                  <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                    {a.rate}%
                  </div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Win Rate
                  </div>
                </div>
              </div>

              <div className="mt-3 flex items-start gap-3">
                {a.avatarUrl ? (
                  <img
                    src={a.avatarUrl}
                    alt=""
                    className="h-10 w-10 shrink-0 rounded-full object-cover ring-2 ring-brand/10"
                  />
                ) : null}
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-bold text-zinc-900 dark:text-zinc-50">
                    {a.name}
                  </h3>
                  <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">{a.firm}</p>
                </div>
              </div>

              <div className="mt-4 text-xs text-zinc-500 dark:text-zinc-400">
                <span className="font-semibold text-brand dark:text-brand-dark">
                  {a.circuit}
                  {a.circuit !== '—' ? ' Circuit' : ''}
                </span>
              </div>

              {a.specs ? (
                <p className="mt-2 line-clamp-2 text-xs text-zinc-500">{a.specs}</p>
              ) : null}

              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400"
                  style={{ width: `${Math.min(100, a.rate)}%` }}
                />
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs font-medium text-zinc-500 dark:text-zinc-400">
                <div>
                  <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    {a.wins.toLocaleString()}
                  </p>
                  <p>Won</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-red-500 dark:text-red-400">
                    {(a.lost || 0).toLocaleString()}
                  </p>
                  <p>Lost</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-zinc-800 dark:text-zinc-100">
                    {a.total.toLocaleString()}
                  </p>
                  <p>Total</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
