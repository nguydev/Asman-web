import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { caseService } from '../../../api/services/caseService.js'

import Icon from '../../../components/common/Icon.jsx'
import { Button } from '../../../components/ui/Button.jsx'
import { FilterSelect } from '../../../components/ui/FilterSelect.jsx'
import { FilterCard } from '../../../components/ui/FilterCard.jsx'
import { Pagination } from '../../../components/ui/Pagination.jsx'
import InitiateCaseModal from '../../../components/InitiateCaseModal.jsx'
import UserDetailModal from '../../../components/UserDetailModal.jsx'
import AttorneyDetailModal from '../../../components/AttorneyDetailModal.jsx'

const STATUS_OPTIONS = [
  { value: 'OPEN', label: 'Open' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'HEARING', label: 'Hearing' },
  { value: 'CLOSED', label: 'Closed' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'REOPENED', label: 'Reopened' },
  { value: 'ARCHIVED', label: 'Archived' },
]

const STATUS_STYLES = {
  OPEN: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
  IN_PROGRESS: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  HEARING: 'bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300',
  CLOSED: 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300',
  CANCELLED: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
  REOPENED: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-300',
  ARCHIVED: 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400',
}

const STATUS_LABELS = Object.fromEntries(
  STATUS_OPTIONS.map((option) => [option.value, option.label]),
)

function StatTile({ icon, tone, label, value }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <span className={`grid h-9 w-9 place-items-center rounded-lg ${tone}`}>
        <Icon name={icon} size={16} />
      </span>
      <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-zinc-400">
        {label}
      </p>
      <p className="mt-0.5 text-xl font-bold text-zinc-900 dark:text-zinc-50">
        {value}
      </p>
    </div>
  )
}

export default function CaseTracker() {
  const navigate = useNavigate()
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedDriverUser, setSelectedDriverUser] = useState(null)
  const [selectedAttorneyId, setSelectedAttorneyId] = useState(null)
  const [statusFilter, setStatusFilter] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 12

  const { data: statsData } = useQuery({
    queryKey: ['caseStats'],
    queryFn: () => caseService.getCaseStats()
  })

  const { data: paginatedResult, isLoading } = useQuery({
    queryKey: ['cases', currentPage, statusFilter, searchQuery],
    queryFn: () => {
      const params = { page: currentPage, limit: ITEMS_PER_PAGE }
      if (statusFilter !== 'All') params.status = statusFilter
      if (searchQuery) params.search = searchQuery
      return caseService.listCases(params)
    },
    placeholderData: keepPreviousData,
  })

  const paginatedCases = Array.isArray(paginatedResult?.data)
    ? paginatedResult.data
    : []
  const totalRecords = paginatedResult?.pagination?.total || 0
  const totalPages = paginatedResult?.pagination?.totalPages || 1

  const queryClient = useQueryClient()
  const handleCreated = () => {
    queryClient.invalidateQueries({ queryKey: ['cases'] })
    queryClient.invalidateQueries({ queryKey: ['caseStats'] })
  }

  // Reset page when filter changes
  const handleFilterChange = (val) => {
    setStatusFilter(val || 'All')
    setCurrentPage(1)
  }

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value)
    setCurrentPage(1)
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        <StatTile
          icon="clipboard"
          tone="bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
          label="Active Cases"
          value={statsData?.data?.active ?? '0'}
        />
        <StatTile
          icon="check"
          tone="bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400"
          label="Completed Cases"
          value={statsData?.data?.completed ?? '0'}
        />
        <StatTile
          icon="ban"
          tone="bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400"
          label="Failed Cases"
          value={statsData?.data?.failed ?? '0'}
        />
        <StatTile
          icon="folder"
          tone="bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
          label="Total Cases"
          value={statsData?.data?.total ?? '0'}
        />
        <StatTile
          icon="calendar"
          tone="bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
          label="Upcoming Hearings"
          value={statsData?.data?.upcomingHearings ?? '0'}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* left side: filters */}
        <FilterCard
          hasActiveFilters={statusFilter !== 'All' || searchQuery !== ''}
          onClear={() => { handleFilterChange('All'); setSearchQuery(''); }}
        >
          <div className="relative flex items-center">
            <Icon name="search" size={14} className="absolute left-3 text-zinc-400" />
            <input
              type="text"
              placeholder="Search ID or Court..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="h-10 w-full rounded-lg border border-zinc-200 bg-white pl-9 pr-3 text-sm text-zinc-900 outline-none transition focus:border-brand focus:ring-1 focus:ring-brand dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-brand-dark dark:focus:ring-brand-dark sm:w-64"
            />
          </div>
          <FilterSelect
            label="All Statuses"
            value={statusFilter === 'All' ? '' : statusFilter}
            options={STATUS_OPTIONS}
            onChange={handleFilterChange}
          />
        </FilterCard>

        {/* right side: action */}
        <Button
          variant="primary"
          icon="plus"
          onClick={() => setModalOpen(true)}
        >
          Add Case
        </Button>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 p-5 pb-4 dark:border-zinc-800">
          <h3 className="font-bold text-zinc-900 dark:text-zinc-50">
            Active Case Directory
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-180 border-collapse text-sm">
            <thead>
              <tr>
                <th className="px-5 pb-3 pt-4 text-left text-xs font-semibold uppercase tracking-wide text-zinc-400">
                  Case ID
                </th>
                <th className="px-5 pb-3 pt-4 text-left text-xs font-semibold uppercase tracking-wide text-zinc-400">
                  Driver
                </th>
                <th className="px-5 pb-3 pt-4 text-left text-xs font-semibold uppercase tracking-wide text-zinc-400">
                  Attorney <span className="normal-case text-zinc-300">(internal)</span>
                </th>
                <th className="px-5 pb-3 pt-4 text-left text-xs font-semibold uppercase tracking-wide text-zinc-400">
                  Status
                </th>
                <th className="px-5 pb-3 pt-4 text-left text-xs font-semibold uppercase tracking-wide text-zinc-400">
                  Court
                </th>
                <th className="px-5 pb-3 pt-4 text-left text-xs font-semibold uppercase tracking-wide text-zinc-400">
                  Hearing Date
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading && paginatedCases.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-sm text-zinc-500">
                    Loading cases...
                  </td>
                </tr>
              )}
              {!isLoading && paginatedCases.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-sm text-zinc-500">
                    No cases found.
                  </td>
                </tr>
              )}
              {paginatedCases.map((c) => {
                const driverProfile = c.driver?.user?.profile
                const driverName = driverProfile?.name ? driverProfile.name : 'Unknown Driver'
                const driverPhoto = driverProfile?.avatarUrl || null
                const statusLabel =
                  c.status === 'CLOSED' && c.outcome
                    ? `${STATUS_LABELS[c.status] || c.status} · ${c.outcome}`
                    : STATUS_LABELS[c.status] || c.status

                return (
                <tr key={c.id} className="border-t border-zinc-100 dark:border-zinc-800">
                  <td className="px-5 py-3.5">
                    <button
                      onClick={() => navigate(`/case-tracker/${c.id}`)}
                      className="font-semibold text-brand hover:underline dark:text-brand-dark"
                    >
                      #{c.id.substring(0, 8)}
                    </button>
                  </td>
                  <td className="px-5 py-3.5">
                    <button
                      onClick={() => {
                        if (c.driver?.user?.id) {
                          setSelectedDriverUser({ id: c.driver.user.id })
                        }
                      }}
                      className="flex items-center gap-2.5 text-left transition hover:opacity-80"
                    >
                      {driverPhoto ? (
                        <img
                          src={driverPhoto}
                          alt={driverName}
                          className="h-8 w-8 shrink-0 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-700 text-xs font-bold text-zinc-600 dark:text-zinc-300">
                          {driverName.charAt(0)}
                        </div>
                      )}
                      <p className="font-semibold text-zinc-900 hover:underline dark:text-zinc-50">
                        {driverName}
                      </p>
                    </button>
                  </td>
                  <td className="px-5 py-3.5 text-zinc-600 dark:text-zinc-300">
                    <button
                      onClick={() => {
                        if (c.attorneyId) {
                          setSelectedAttorneyId(c.attorneyId)
                        }
                      }}
                      className="flex items-center gap-2.5 text-left transition hover:opacity-80"
                    >
                      {c.attorney?.avatarUrl ? (
                        <img
                          src={c.attorney.avatarUrl}
                          alt={c.attorney.name || 'Attorney'}
                          className="h-8 w-8 shrink-0 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-700 text-xs font-bold text-zinc-600 dark:text-zinc-300">
                          {(c.attorney?.name || 'A').charAt(0)}
                        </div>
                      )}
                      <span className="font-medium text-zinc-900 hover:underline dark:text-zinc-100">
                        {c.attorney?.name ? c.attorney.name : 'Unknown Attorney'}
                      </span>
                    </button>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_STYLES[c.status] || STATUS_STYLES.ARCHIVED}`}>
                      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-75" />
                      {statusLabel}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-medium text-zinc-900 dark:text-zinc-100">
                    {c.court || 'N/A'}
                  </td>
                  <td className="px-5 py-3.5 text-zinc-600 dark:text-zinc-400">
                    {c.hearingDate ? new Date(c.hearingDate).toLocaleDateString() : 'Unassigned'}
                  </td>
                </tr>
              )})}
            </tbody>
          </table>

          {!isLoading && paginatedCases.length === 0 && (
            <p className="py-10 text-center text-sm text-zinc-400">
              No cases found.
            </p>
          )}

          {paginatedCases.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalRecords}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
      </div>



      <InitiateCaseModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={handleCreated}
      />

      <UserDetailModal
        open={!!selectedDriverUser}
        onClose={() => setSelectedDriverUser(null)}
        user={selectedDriverUser}
      />

      <AttorneyDetailModal
        open={!!selectedAttorneyId}
        onClose={() => setSelectedAttorneyId(null)}
        attorneyId={selectedAttorneyId}
      />
    </div>
  )
}
