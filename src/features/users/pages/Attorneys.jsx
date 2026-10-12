import { useState, useRef, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import Icon from '../../../components/common/Icon.jsx'
import { Button } from '../../../components/ui/Button.jsx'
import { FilterSelect } from '../../../components/ui/FilterSelect.jsx'
import { FilterCard } from '../../../components/ui/FilterCard.jsx'
import { Pagination } from '../../../components/ui/Pagination.jsx'
import OnboardAttorneyModal from '../../../components/OnboardAttorneyModal.jsx'
import { attorneyService } from '../../../api/services/attorneyService.js'
import { attorneyAdmin } from '../../../data/mockData.js'
import { getAttorneyCaseStats } from '../utils/attorneyStats.js'

const PAGE_SIZE = 12

function initials(name) {
  return name
    .replace(/^Hon\.\s*/, '')
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function attorneyLanguages(a) {
  return a.languageProficiencies || a.languages || []
}

function AttorneyCard({ a, onRemove, onView, onEdit }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)
  const languages = attorneyLanguages(a)

  useEffect(() => {
    if (!menuOpen) return
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [menuOpen])

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
      <span
        className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand to-brand-dark`}
      />

      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {a.avatarUrl ? (
            <img
              src={a.avatarUrl}
              alt={a.name}
              className="h-12 w-12 shrink-0 rounded-full object-cover ring-4 ring-brand/10 transition group-hover:scale-105"
            />
          ) : (
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-brand/10 text-sm font-bold text-brand ring-4 ring-brand/10 transition group-hover:scale-105 dark:text-brand-dark">
              {initials(a.name || 'A')}
            </span>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="truncate font-bold text-zinc-900 dark:text-zinc-50">{a.name}</p>
            </div>
            <p className="text-xs text-zinc-400">
              {a.address?.city || a.states?.[0] || 'No location specified'}
            </p>
          </div>
        </div>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="grid h-8 w-8 place-items-center rounded-lg text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          >
            <Icon name="moreVertical" size={18} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 z-20 w-32 overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-xl dark:border-zinc-700 dark:bg-zinc-800">
              <button
                onClick={() => { setMenuOpen(false); onEdit(a); }}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-700"
              >
                <Icon name="edit" size={14} />
                Edit
              </button>
              <button
                onClick={() => { setMenuOpen(false); onRemove(a.id) }}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
              >
                <Icon name="trash" size={14} />
                Remove
              </button>
            </div>
          )}
        </div>
      </div>

      {(() => {
        const stats = getAttorneyCaseStats(a)
        return (
          <div className="mt-4 space-y-3 border-t border-zinc-100 pt-3 dark:border-zinc-800">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                  Win Rate
                </p>
                <p className="font-bold text-emerald-600 dark:text-emerald-400">
                  {stats.rateLabel}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                  Total Cases
                </p>
                <p className="font-bold text-zinc-900 dark:text-zinc-50">
                  {stats.total.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
              <span>
                Won{' '}
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {stats.wins.toLocaleString()}
                </span>
              </span>
              <span>
                Lost{' '}
                <span className="font-semibold text-red-500 dark:text-red-400">
                  {stats.lost.toLocaleString()}
                </span>
              </span>
              {stats.pending > 0 ? (
                <span>
                  Pending{' '}
                  <span className="font-semibold text-amber-600 dark:text-amber-400">
                    {stats.pending.toLocaleString()}
                  </span>
                </span>
              ) : null}
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400"
                style={{ width: `${stats.ratePct}%` }}
              />
            </div>
          </div>
        )
      })()}

      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {languages.map((lang) => (
            <span key={lang} className="flex items-center gap-1 rounded-md bg-zinc-100 px-2 py-1 text-[11px] font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
              {lang}
            </span>
          ))}
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => onView(a)}
          className="shrink-0"
        >
          View Profile
        </Button>
      </div>
    </div>
  )
}

export default function Attorneys() {
  const [editAttorney, setEditAttorney] = useState(null)
  const [langFilter, setLangFilter] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [importing, setImporting] = useState(false)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const refreshTimers = useRef([])

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput.trim())
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  useEffect(() => {
    return () => {
      refreshTimers.current.forEach((id) => clearTimeout(id))
    }
  }, [])

  const { data: listResult, isLoading, isFetching, isPlaceholderData } = useQuery({
    queryKey: ['attorneys', page, searchQuery, langFilter],
    queryFn: () => {
      const params = {
        page,
        limit: PAGE_SIZE,
        sortBy: 'remoteTotalCases',
        sortOrder: 'desc',
      }
      if (searchQuery) params.search = searchQuery
      if (langFilter) params.language = langFilter
      return attorneyService.getAttorneys(params)
    },
    placeholderData: keepPreviousData,
  })

  const apiAttorneys = Array.isArray(listResult?.data) ? listResult.data : []
  const apiHasVolume = apiAttorneys.some((a) => getAttorneyCaseStats(a).total > 0)
  const usingMock = !isLoading && !apiHasVolume

  const mockFiltered = useMemo(() => {
    let rows = [...attorneyAdmin]
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      rows = rows.filter(
        (a) =>
          a.name?.toLowerCase().includes(q) ||
          a.email?.toLowerCase().includes(q) ||
          a.firm?.toLowerCase().includes(q) ||
          a.barLicenseNumber?.toLowerCase().includes(q),
      )
    }
    if (langFilter) {
      rows = rows.filter((a) => attorneyLanguages(a).includes(langFilter))
    }
    return rows.sort(
      (a, b) =>
        getAttorneyCaseStats(b).total - getAttorneyCaseStats(a).total ||
        getAttorneyCaseStats(b).ratePct - getAttorneyCaseStats(a).ratePct,
    )
  }, [searchQuery, langFilter])

  const attorneys = usingMock
    ? mockFiltered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
    : apiAttorneys
  const totalRecords = usingMock
    ? mockFiltered.length
    : listResult?.pagination?.total || 0
  const totalPages = usingMock
    ? Math.max(1, Math.ceil(mockFiltered.length / PAGE_SIZE))
    : listResult?.pagination?.totalPages || 1
  const showInitialLoading = isLoading && attorneys.length === 0
  const isRefreshing = isFetching && (isPlaceholderData || (!usingMock && attorneys.length > 0))

  const allLangs = Array.from(
    new Set(
      (usingMock ? attorneyAdmin : attorneys).flatMap((a) => attorneyLanguages(a)),
    ),
  ).sort()

  const handleRemove = async (id) => {
    if (!window.confirm('Are you sure you want to remove this attorney?')) return
    try {
      await attorneyService.deleteAttorney(id)
      queryClient.invalidateQueries({ queryKey: ['attorneys'] })
    } catch (err) {
      console.error('Failed to remove attorney', err)
      alert('Failed to remove attorney')
    }
  }

  const handleImport = async () => {
    try {
      setImporting(true)
      const res = await attorneyService.importAttorneys()
      const jobId = res?.data?.jobId || res?.jobId
      alert(
        jobId
          ? `Attorney import queued (job ${jobId}). The list will refresh shortly.`
          : 'Attorney import queued. The list will refresh shortly.',
      )
      refreshTimers.current.forEach((id) => clearTimeout(id))
      refreshTimers.current = [5_000, 15_000, 30_000].map((delay) =>
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ['attorneys'] })
        }, delay),
      )
    } catch (err) {
      console.error('Failed to import attorneys', err)
      const message =
        err?.response?.data?.message || 'Failed to start attorney import'
      alert(Array.isArray(message) ? message.join(', ') : message)
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {usingMock ? (
        <span className="w-fit rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
          Showing demo roster with case volume · import attorneys for live data
        </span>
      ) : null}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <FilterCard
          hasActiveFilters={!!langFilter || !!searchQuery}
          onClear={() => {
            setLangFilter('')
            setSearchInput('')
            setSearchQuery('')
            setPage(1)
          }}
        >
          <div className="relative flex items-center">
            <Icon name="search" size={14} className="absolute left-3 text-zinc-400" />
            <input
              type="text"
              placeholder="Search name, email, phone..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="h-10 w-full rounded-lg border border-zinc-200 bg-white pl-9 pr-3 text-sm text-zinc-900 outline-none transition focus:border-brand focus:ring-1 focus:ring-brand dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-brand-dark dark:focus:ring-brand-dark sm:w-64"
            />
          </div>
          <FilterSelect
            label="All Languages"
            value={langFilter}
            options={allLangs}
            onChange={(val) => {
              setLangFilter(val)
              setPage(1)
            }}
          />
        </FilterCard>

        <Button
          variant="primary"
          icon="sync"
          onClick={handleImport}
          isLoading={importing}
        >
          Import Attorneys
        </Button>
      </div>

      {showInitialLoading ? (
        <div className="rounded-xl border border-zinc-200 bg-white p-10 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900">
          Loading attorneys...
        </div>
      ) : attorneys.length === 0 ? (
        <div className="rounded-xl border border-zinc-200 bg-white p-10 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900">
          No attorneys found.
        </div>
      ) : (
        <div
          className={
            'grid gap-4 sm:grid-cols-2 lg:grid-cols-3 transition-opacity duration-150 ' +
            (isRefreshing ? 'opacity-60' : 'opacity-100')
          }
        >
          {attorneys.map((a) => (
            <AttorneyCard
              key={a.id}
              a={a}
              onRemove={handleRemove}
              onView={(attorney) => navigate(`/attorneys/${attorney.id}`)}
              onEdit={(attorney) => {
                setEditAttorney(attorney)
              }}
            />
          ))}
        </div>
      )}

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        totalItems={totalRecords}
        itemsPerPage={PAGE_SIZE}
        onPageChange={setPage}
      />

      <OnboardAttorneyModal
        open={!!editAttorney}
        onClose={() => {
          setEditAttorney(null)
        }}
        editAttorney={editAttorney}
        onCreated={() => {
          queryClient.invalidateQueries({ queryKey: ['attorneys'] })
        }}
      />
    </div>
  )
}
