import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { attorneyService } from '../../../api/services/attorneyService.js'
import { caseService } from '../../../api/services/caseService.js'
import Icon from '../../../components/common/Icon.jsx'
import { getAttorneyCaseStats } from '../utils/attorneyStats.js'

function initials(name) {
  if (!name) return ''
  return name
    .replace(/^Hon\.\s*/, '')
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function formatCaseStatus(status) {
  return String(status || 'OPEN')
    .toLowerCase()
    .replace(/_/g, ' ')
}

function extractCaseList(res) {
  const body = res?.data ?? res
  if (Array.isArray(body)) return body
  if (Array.isArray(body?.data)) return body.data
  if (Array.isArray(body?.items)) return body.items
  return []
}

export default function AttorneyProfile() {
  const { attorneyId } = useParams()
  const navigate = useNavigate()
  const [a, setAttorney] = useState(null)
  const [cases, setCases] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [casesLoading, setCasesLoading] = useState(false)

  useEffect(() => {
    if (!attorneyId) return
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
  }, [attorneyId])

  useEffect(() => {
    if (!attorneyId) return
    const fetchCases = async () => {
      try {
        setCasesLoading(true)
        const res = await caseService.listCases({
          attorneyId,
          limit: 12,
          sortBy: 'createdAt',
          sortOrder: 'desc',
        })
        setCases(extractCaseList(res))
      } catch (err) {
        console.error('Failed to fetch attorney cases', err)
        setCases([])
      } finally {
        setCasesLoading(false)
      }
    }
    fetchCases()
  }, [attorneyId])

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-48 gap-4">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading attorney profile...</p>
      </div>
    )
  }

  if (!a) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Attorney not found.
        </p>
        <button
          onClick={() => navigate('/attorneys')}
          className="w-fit text-sm font-semibold text-brand hover:underline dark:text-brand-dark"
        >
          Back to Attorney Network
        </button>
      </div>
    )
  }

  const stats = getAttorneyCaseStats(a)

  return (
    <div className="flex flex-col gap-5">
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
                {initials(a.name)}
              </span>
            )}
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                  {a.name}
                </h1>
              </div>
              <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm text-zinc-500 dark:text-zinc-400">
                <span className="flex items-center gap-1.5">
                  <Icon name="mail" size={14} />
                  {a.email || 'No email provided'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl border-l-4 border-l-brand border-y border-r border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
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
            {stats.total.toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-zinc-400">
            {stats.wins.toLocaleString()} won · {stats.lost.toLocaleString()} lost
            {stats.pending > 0 ? ` · ${stats.pending.toLocaleString()} pending` : ''}
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

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-zinc-200 bg-white p-4 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            {stats.total.toLocaleString()}
          </p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Total cases
          </p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {stats.wins.toLocaleString()}
          </p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Won
          </p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-2xl font-bold text-red-500 dark:text-red-400">
            {stats.lost.toLocaleString()}
          </p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Lost
          </p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
            {stats.pending.toLocaleString()}
          </p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Pending
          </p>
        </div>
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
            <span className="block">
              {a.address?.city || 'No location specified'}
            </span>
          </p>

          <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Years of Experience
          </p>
          <p className="mt-1 text-base text-zinc-700 dark:text-zinc-200">
            {a.yearsOfExperience || 0} years
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
            {(!a.languageProficiencies || a.languageProficiencies.length === 0) && (
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
            {(!a.specialties || a.specialties.length === 0) && (
              <span className="text-sm text-zinc-500">No specialties listed</span>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="mb-4 font-bold text-zinc-900 dark:text-zinc-50">
              Professional Summary
            </h3>
            <div className="flex flex-col gap-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
              <p>{a.about || 'No professional summary available.'}</p>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="font-bold text-zinc-900 dark:text-zinc-50">
                  Platform cases
                </h3>
                <p className="mt-1 text-xs text-zinc-500">
                  Asman cases assigned to this attorney
                  {stats.platformTotal > 0
                    ? ` · ${stats.platformWins}/${stats.platformTotal} wins on platform`
                    : ''}
                </p>
              </div>
              <Link
                to="/case-tracker"
                className="text-xs font-semibold text-brand hover:underline dark:text-brand-dark"
              >
                Case tracker →
              </Link>
            </div>

            {casesLoading ? (
              <p className="py-6 text-center text-sm text-zinc-500">Loading cases…</p>
            ) : cases.length === 0 ? (
              <p className="py-6 text-center text-sm text-zinc-500">
                No platform cases linked yet.
                {stats.total > 0
                  ? ` Historical volume still shows ${stats.total.toLocaleString()} cases (${stats.rateLabel} win rate).`
                  : ''}
              </p>
            ) : (
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {cases.map((c) => {
                  const driverName =
                    c.driver?.user?.profile?.name ||
                    c.driver?.user?.email ||
                    'Driver'
                  return (
                    <Link
                      key={c.id}
                      to={`/case-tracker/${c.id}`}
                      className="flex items-center justify-between gap-3 py-3 transition hover:bg-zinc-50 dark:hover:bg-zinc-800/40"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                          {c.court || 'Case'} · {driverName}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-zinc-500">
                          {formatCaseStatus(c.status)}
                          {c.outcome ? ` · ${c.outcome}` : ''}
                          {c.hearingDate
                            ? ` · Hearing ${new Date(c.hearingDate).toLocaleDateString()}`
                            : ''}
                        </p>
                      </div>
                      <Icon name="chevronRight" size={16} className="shrink-0 text-zinc-400" />
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
