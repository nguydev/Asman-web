import { useState, useEffect } from 'react'
import Icon from './common/Icon.jsx'
import { attorneyService } from '../api/services/attorneyService.js'
import { getAttorneyCaseStats } from '../features/users/utils/attorneyStats.js'

export default function AttorneyDetailModal({ open, onClose, attorneyId, onEdit }) {
  const [a, setAttorney] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!open || !attorneyId) return
    const fetchAttorney = async () => {
      try {
        setIsLoading(true)
        const res = await attorneyService.getAttorney(attorneyId)
        setAttorney(res.data?.data || res.data)
      } catch (err) {
        console.error('Failed to fetch attorney', err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchAttorney()
  }, [attorneyId, open])

  if (!open) return null

  const stats = a ? getAttorneyCaseStats(a) : null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4 py-10 backdrop-blur-sm">
      <div className="relative max-h-[85vh] w-full max-w-4xl flex-col gap-5 overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl dark:bg-zinc-900">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 grid h-8 w-8 place-items-center rounded-lg bg-zinc-100 text-zinc-400 transition hover:bg-zinc-200 hover:text-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700"
        >
          <Icon name="close" size={18} />
        </button>

        {isLoading ? (
          <div className="flex h-48 items-center justify-center">
            <p className="text-zinc-500 dark:text-zinc-400">
              Loading attorney profile...
            </p>
          </div>
        ) : !a || !stats ? (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Attorney not found.
            </p>
          </div>
        ) : (
          <div className="mt-4 flex flex-col gap-5">
            <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex flex-wrap items-start gap-4">
                  {a.avatarUrl ? (
                    <img
                      src={a.avatarUrl}
                      alt={a.name}
                      className="h-20 w-20 shrink-0 rounded-xl object-cover ring-4 ring-brand/10"
                    />
                  ) : (
                    <span className="grid h-20 w-20 shrink-0 place-items-center rounded-xl bg-brand/10 text-2xl font-bold text-brand ring-4 ring-brand/10 dark:text-brand-dark">
                      {(a.name || 'Unknown').substring(0, 2).toUpperCase()}
                    </span>
                  )}
                  <div>
                    <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                      {a.name}
                    </h1>
                    <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm text-zinc-500 dark:text-zinc-400">
                      <span className="flex items-center gap-1.5">
                        <Icon name="mail" size={14} />
                        {a.email || 'No email provided'}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    onClose()
                    onEdit(a)
                  }}
                  className="flex shrink-0 items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-black dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                >
                  <Icon name="edit" size={14} />
                  Edit Profile
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <div className="rounded-xl border border-y border-r border-l-4 border-zinc-200 border-l-brand bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                  Bar License Number
                </p>
                <p className="mt-1 font-bold text-zinc-900 dark:text-zinc-50">
                  {a.barLicenseNumber || 'Pending'}
                </p>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                  Federal Circuit
                </p>
                <p className="mt-1 font-bold text-zinc-900 dark:text-zinc-50">
                  {a.federalCircuit || 'Not Specified'}
                </p>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                  Case Volume
                </p>
                <p className="mt-1 font-bold text-zinc-900 dark:text-zinc-50">
                  {stats.total.toLocaleString()} Total
                </p>
                <p className="mt-1 text-sm text-zinc-400">
                  {stats.wins.toLocaleString()} won · {stats.lost.toLocaleString()}{' '}
                  lost
                </p>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                  Win Rate
                </p>
                <p className="mt-1 font-bold text-emerald-600 dark:text-emerald-400">
                  {stats.rateLabel}
                </p>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400"
                    style={{ width: `${stats.ratePct}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                {
                  label: 'Total',
                  value: stats.total,
                  tone: 'text-zinc-900 dark:text-zinc-50',
                },
                {
                  label: 'Won',
                  value: stats.wins,
                  tone: 'text-emerald-600 dark:text-emerald-400',
                },
                {
                  label: 'Lost',
                  value: stats.lost,
                  tone: 'text-red-500 dark:text-red-400',
                },
                {
                  label: 'Pending',
                  value: stats.pending,
                  tone: 'text-amber-600 dark:text-amber-400',
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl border border-zinc-200 bg-white p-3 text-center dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <p className={`text-xl font-bold ${item.tone}`}>
                    {item.value.toLocaleString()}
                  </p>
                  <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>

            <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
              <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
                <h3 className="mb-4 font-bold text-zinc-900 dark:text-zinc-50">
                  Detailed Information
                </h3>

                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                  Office Location
                </p>
                <p className="mt-1 text-base text-zinc-700 dark:text-zinc-200">
                  {a.address?.city || 'No location specified'}
                </p>

                <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-zinc-400">
                  Language Preferences
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {a.languageProficiencies?.map((l) => (
                    <span
                      key={l}
                      className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                    >
                      {l}
                    </span>
                  ))}
                  {(!a.languageProficiencies ||
                    a.languageProficiencies.length === 0) && (
                    <span className="text-sm text-zinc-500">Not specified</span>
                  )}
                </div>

                <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-zinc-400">
                  Specialties
                </p>
                <div className="mt-1.5 flex flex-col gap-2">
                  {a.specialties?.map((s) => (
                    <span
                      key={s}
                      className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-200"
                    >
                      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-brand/10 text-brand dark:text-brand-dark">
                        <Icon name="star" size={13} />
                      </span>
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
                <h3 className="mb-4 font-bold text-zinc-900 dark:text-zinc-50">
                  Professional Summary
                </h3>
                <div className="flex flex-col gap-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                  <p>{a.about || 'No professional summary available.'}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
