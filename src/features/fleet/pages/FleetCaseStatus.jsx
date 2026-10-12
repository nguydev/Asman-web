import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { caseService } from '../../../api/services/caseService.js'
import { getCurrentOrganizationId } from '../../../api/services/orgContext.js'
import Icon from '../../../components/common/Icon.jsx'

const STAGE_STYLES = {
  OPEN: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  IN_PROGRESS: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
  HEARING: 'bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300',
  CLOSED: 'bg-pink-100 text-pink-700 dark:bg-pink-500/15 dark:text-pink-300',
  CANCELLED: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
  REOPENED: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-300',
  ARCHIVED: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-500/15 dark:text-zinc-300',
}

const STAGE_LABELS = {
  OPEN: 'Open',
  IN_PROGRESS: 'In Progress',
  HEARING: 'Hearing',
  CLOSED: 'Closed',
  CANCELLED: 'Cancelled',
  REOPENED: 'Reopened',
  ARCHIVED: 'Archived',
}

const STAGE_ACCENT = {
  OPEN: 'from-emerald-400 to-emerald-500',
  IN_PROGRESS: 'from-blue-400 to-blue-500',
  HEARING: 'from-purple-400 to-purple-500',
  CLOSED: 'from-pink-400 to-pink-500',
  CANCELLED: 'from-rose-400 to-rose-500',
  REOPENED: 'from-cyan-400 to-cyan-500',
  ARCHIVED: 'from-zinc-400 to-zinc-500',
}

function unwrapCases(res) {
  const payload = res?.data ?? res
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  return []
}

function CaseStatusCard({ driver, caseRecord }) {
  const status = caseRecord.status || 'OPEN'
  const subtitle = [driver.licensePlate, driver.vinNumber]
    .filter(Boolean)
    .join(' · ')

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
      <span
        className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${STAGE_ACCENT[status] || STAGE_ACCENT.ARCHIVED}`}
      />

      <div className="flex items-start justify-between gap-2 p-5 pb-3">
        <div className="flex items-center gap-3">
          {driver.photo ? (
            <img
              src={driver.photo}
              alt={driver.name}
              className="h-11 w-11 shrink-0 rounded-full object-cover ring-4 ring-brand/10 transition group-hover:scale-105"
            />
          ) : (
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-lg font-bold text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">
              {(driver.name || 'D').charAt(0)}
            </div>
          )}
          <div>
            <p className="font-bold text-zinc-900 dark:text-zinc-50">
              {driver.name}
            </p>
            <p className="text-xs text-zinc-400">{subtitle || 'Driver'}</p>
          </div>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${STAGE_STYLES[status] || STAGE_STYLES.ARCHIVED}`}
        >
          {STAGE_LABELS[status] || status}
          {status === 'CLOSED' && caseRecord.outcome
            ? ` · ${caseRecord.outcome}`
            : ''}
        </span>
      </div>

      <div className="flex flex-col gap-2 border-t border-zinc-100 px-5 py-3 dark:border-zinc-800">
        <p className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
          <Icon name="building" size={13} className="shrink-0 text-zinc-400" />
          {caseRecord.court || 'N/A'}
        </p>
        <p className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
          <Icon name="calendar" size={13} className="shrink-0 text-zinc-400" />
          Hearing:{' '}
          {caseRecord.hearingDate
            ? new Date(caseRecord.hearingDate).toLocaleDateString()
            : 'TBD'}
        </p>
        {caseRecord.attorney?.name ? (
          <p className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
            <Icon
              name="briefcase"
              size={13}
              className="shrink-0 text-zinc-400"
            />
            {caseRecord.attorney.name}
          </p>
        ) : null}
      </div>
    </div>
  )
}

export default function FleetCaseStatus() {
  const [sortOption, setSortOption] = useState('newest')

  const sortParams = useMemo(() => {
    switch (sortOption) {
      case 'oldest':
        return { sortBy: 'createdAt', sortOrder: 'asc' }
      case 'updated':
        return { sortBy: 'updatedAt', sortOrder: 'desc' }
      case 'newest':
      default:
        return { sortBy: 'createdAt', sortOrder: 'desc' }
    }
  }, [sortOption])

  const {
    data: cases = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['organization-cases', sortOption],
    queryFn: async () => {
      const orgId = await getCurrentOrganizationId()
      const res = await caseService.listOrganizationCases(orgId, {
        page: 1,
        limit: 100,
        ...sortParams,
      })
      return unwrapCases(res)
    },
  })

  const rows = cases
    .map((c) => {
      const driver = c.driver
      const profile = driver?.user?.profile
      return {
        case: c,
        driver: {
          name: profile?.name || 'Unknown Driver',
          photo: profile?.avatarUrl || null,
          vinNumber: driver?.vinNumber || null,
          licensePlate: driver?.licensePlate || null,
        },
      }
    })
    .filter((r) => r.case?.driverId || r.case?.driver)

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-100 pb-4 dark:border-zinc-800">
        <div>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
            Driver Cases
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Track the legal status of your organization drivers.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Sort by
          </label>
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/30 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="updated">Recently Updated</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="py-16 text-center text-sm text-zinc-500">
          Loading driver cases...
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-6 text-center text-sm text-red-600 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
          {error?.response?.data?.message ||
            error?.message ||
            'Failed to load organization cases'}
        </div>
      ) : rows.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map(({ case: c, driver }) => (
            <CaseStatusCard key={c.id} driver={driver} caseRecord={c} />
          ))}
        </div>
      ) : (
        <div className="flex w-full flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 bg-white/50 px-12 py-24 dark:border-zinc-800 dark:bg-zinc-900/50">
          <span className="mb-5 grid h-20 w-20 place-items-center rounded-full bg-brand/10 text-brand dark:bg-brand-dark/15 dark:text-brand-dark">
            <Icon name="check" size={40} />
          </span>
          <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            No Cases Yet
          </h3>
          <p className="mt-2 max-w-md text-center text-base text-zinc-500 dark:text-zinc-400">
            There are no cases linked to drivers in your organization right now.
          </p>
        </div>
      )}

      <div className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand/10 text-brand dark:text-brand-dark">
          <Icon name="info" size={12} />
        </span>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Case status updates automatically when our legal team updates a
          driver&apos;s case — no action needed on your end.
        </p>
      </div>
    </div>
  )
}
