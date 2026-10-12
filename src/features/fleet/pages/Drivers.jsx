import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { driverService, unwrapApiData } from '../../../api/services/driverService.js'
import { getCurrentOrganizationId } from '../../../api/services/orgContext.js'
import Icon from '../../../components/common/Icon.jsx'
import { Button } from '../../../components/ui/Button.jsx'
import { Pagination } from '../../../components/ui/Pagination.jsx'
import DriverDocumentsModal from '../components/DriverDocumentsModal.jsx'

const PAGE_SIZE = 8

const DRIVER_STATUS_STYLES = {
  ACTIVE: 'bg-green-500/15 text-green-600 dark:text-green-400',
  SUSPENDED: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
  DELETED: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
}

const DRIVER_STATUS_LABELS = {
  ACTIVE: 'Active',
  SUSPENDED: 'Suspended',
  DELETED: 'Deleted',
}

const STATUS_ACCENT = {
  ACTIVE: 'from-green-400 to-green-500',
  SUSPENDED: 'from-amber-400 to-amber-500',
  DELETED: 'from-rose-400 to-rose-500',
}

const STAT_TILES = [
  {
    key: 'total',
    label: 'Total Drivers',
    icon: 'users',
    tone: 'bg-brand/10 text-brand dark:text-brand-dark',
  },
  {
    key: 'active',
    label: 'Active',
    icon: 'check',
    tone: 'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400',
  },
  {
    key: 'suspended',
    label: 'Suspended',
    icon: 'warning',
    tone: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
  },
]

function DriverAvatar({ name, photo, size = 'md', className = '' }) {
  const sizeClass =
    size === 'lg' ? 'h-20 w-20 text-2xl ring-4' : 'h-10 w-10 text-sm ring-2'
  const initial = (name || 'D').charAt(0).toUpperCase()

  if (photo) {
    return (
      <img
        src={photo}
        alt={name || 'Driver'}
        className={`${sizeClass} shrink-0 rounded-full object-cover ring-brand/15 ${className}`}
      />
    )
  }

  return (
    <div
      className={`${sizeClass} flex shrink-0 items-center justify-center rounded-full bg-zinc-200 font-bold text-zinc-600 ring-brand/15 dark:bg-zinc-700 dark:text-zinc-200 ${className}`}
      aria-label={name || 'Driver'}
    >
      {initial}
    </div>
  )
}

function DriverDetailPanel({ driver, onClose, onEdit, onViewDocuments }) {
  const status = driver.status || 'ACTIVE'

  return (
    <div className="relative flex h-full flex-col items-center overflow-hidden rounded-xl border border-zinc-200 bg-white p-6 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <span
        className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${STATUS_ACCENT[status] || STATUS_ACCENT.SUSPENDED}`}
      />

      <Button
        variant="ghost"
        size="icon"
        icon="close"
        onClick={onClose}
        className="absolute right-4 top-4"
      />

      <DriverAvatar name={driver.name} photo={driver.photo} size="lg" />
      <p className="mt-3 text-base font-bold text-zinc-900 dark:text-zinc-50">
        {driver.name}
      </p>

      <div className="mt-3 rounded-lg bg-zinc-50 px-5 py-2 dark:bg-zinc-800">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
          Status
        </p>
        <p
          className={`text-sm font-bold ${
            status === 'ACTIVE'
              ? 'text-green-600 dark:text-green-400'
              : status === 'SUSPENDED'
                ? 'text-amber-600 dark:text-amber-300'
                : 'text-zinc-500'
          }`}
        >
          {DRIVER_STATUS_LABELS[status] || status}
        </p>
      </div>

      <div className="mt-6 w-full border-t border-zinc-100 pt-5 text-left dark:border-zinc-800">
        <p className="mb-3 text-xs font-bold uppercase tracking-wide text-zinc-400">
          Driver Details
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <p className="text-xs text-zinc-400">Email</p>
            <p className="font-semibold text-zinc-900 dark:text-zinc-50">
              {driver.email || '—'}
            </p>
          </div>
          <div>
            <p className="text-xs text-zinc-400">VIN</p>
            <p className="font-semibold text-zinc-900 dark:text-zinc-50">
              {driver.vinNumber || '—'}
            </p>
          </div>
          <div>
            <p className="text-xs text-zinc-400">License Plate</p>
            <p className="font-semibold text-zinc-900 dark:text-zinc-50">
              {driver.licensePlate || '—'}
            </p>
          </div>
          <div className="col-span-2">
            <p className="text-xs text-zinc-400">Joined</p>
            <p className="font-semibold text-zinc-900 dark:text-zinc-50">
              {driver.joinedDate || '—'}
            </p>
          </div>
        </div>
      </div>

      <Button
        variant="outline"
        icon="file"
        className="mt-5 w-full"
        onClick={onViewDocuments}
      >
        View Documents
      </Button>
      <Button variant="secondary" className="mt-3 w-full" onClick={onEdit}>
        Edit Profile
      </Button>
    </div>
  )
}

export default function Drivers() {
  const navigate = useNavigate()
  const { data: driversData = [], isLoading, isError, error } = useQuery({
    queryKey: ['organization-drivers'],
    queryFn: async () => {
      let orgId
      try {
        orgId = await getCurrentOrganizationId()
      } catch {
        return []
      }
      const res = await driverService.getOrganizationDrivers(orgId)
      const drivers = unwrapApiData(res)
      if (!Array.isArray(drivers)) return []

      return drivers.map((d) => ({
        id: d.id,
        name: d.user?.profile?.name || 'Unknown Driver',
        photo: d.user?.profile?.avatarUrl || null,
        email: d.user?.email || null,
        vinNumber: d.vinNumber || null,
        licensePlate: d.licensePlate || null,
        status: d.status || 'ACTIVE',
        joinedDate: d.createdAt
          ? new Date(d.createdAt).toLocaleDateString()
          : null,
      }))
    },
  })

  const [selectedId, setSelectedId] = useState(null)
  const [page, setPage] = useState(1)
  const [docsDriver, setDocsDriver] = useState(null)

  useEffect(() => {
    if (!selectedId && driversData.length > 0) {
      setSelectedId(driversData[0].id)
    }
  }, [driversData, selectedId])

  const selected = driversData.find((d) => d.id === selectedId) ?? null

  const pageCount = Math.max(1, Math.ceil(driversData.length / PAGE_SIZE))
  const pageRows = driversData.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const statValues = {
    total: driversData.length,
    active: driversData.filter((d) => d.status === 'ACTIVE').length,
    suspended: driversData.filter((d) => d.status === 'SUSPENDED').length,
  }

  if (isLoading) {
    return (
      <div className="p-8 text-center text-zinc-500">Loading drivers...</div>
    )
  }

  if (isError) {
    return (
      <div className="p-8 text-center text-red-500">
        Failed to load drivers
        {error?.response?.data?.message
          ? `: ${Array.isArray(error.response.data.message) ? error.response.data.message.join(', ') : error.response.data.message}`
          : error?.message
            ? `: ${error.message}`
            : '.'}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex justify-end">
        <Button
          variant="primary"
          icon="plus"
          onClick={() => navigate('/drivers/new')}
        >
          New Driver
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {STAT_TILES.map((s) => (
          <div
            key={s.key}
            className="group flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900"
          >
            <span
              className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl transition group-hover:scale-110 ${s.tone}`}
            >
              <Icon name={s.icon} size={18} />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                {s.label}
              </p>
              <p className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                {statValues[s.key]}
              </p>
            </div>
          </div>
        ))}
      </div>

      {driversData.length > 0 ? (
        <div className="grid items-stretch gap-5 lg:grid-cols-3">
          <div className="flex h-full flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm lg:col-span-2 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex-1 overflow-x-auto">
              <table className="w-full min-w-[520px] border-collapse text-sm">
                <thead>
                  <tr className="bg-zinc-50/80 dark:bg-zinc-800/40">
                    <th className="px-5 pb-3 pt-4 text-left text-xs font-semibold uppercase tracking-wide text-zinc-400">
                      Driver
                    </th>
                    <th className="px-5 pb-3 pt-4 text-left text-xs font-semibold uppercase tracking-wide text-zinc-400">
                      Plate
                    </th>
                    <th className="px-5 pb-3 pt-4 text-left text-xs font-semibold uppercase tracking-wide text-zinc-400">
                      VIN
                    </th>
                    <th className="px-5 pb-3 pt-4 text-left text-xs font-semibold uppercase tracking-wide text-zinc-400">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pageRows.map((d) => (
                    <tr
                      key={d.id}
                      onClick={() => setSelectedId(d.id)}
                      className={
                        'cursor-pointer border-t border-zinc-100 transition-colors dark:border-zinc-800 ' +
                        (selectedId === d.id
                          ? 'bg-brand/5'
                          : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/60')
                      }
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <DriverAvatar name={d.name} photo={d.photo} />
                          <div>
                            <p className="font-semibold text-zinc-900 dark:text-zinc-50">
                              {d.name}
                            </p>
                            <p className="text-xs text-zinc-400">
                              {d.email || '—'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 font-medium text-zinc-900 dark:text-zinc-50">
                        {d.licensePlate || '—'}
                      </td>
                      <td className="px-5 py-3 text-zinc-600 dark:text-zinc-300">
                        {d.vinNumber || '—'}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${DRIVER_STATUS_STYLES[d.status] || DRIVER_STATUS_STYLES.SUSPENDED}`}
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-current" />
                          {DRIVER_STATUS_LABELS[d.status] || d.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={page}
              totalPages={pageCount}
              totalItems={driversData.length}
              itemsPerPage={PAGE_SIZE}
              onPageChange={setPage}
            />
          </div>

          {selected && (
            <DriverDetailPanel
              driver={selected}
              onClose={() => setSelectedId(null)}
              onViewDocuments={() => setDocsDriver(selected)}
              onEdit={() => navigate(`/drivers/${selected.id}/edit`)}
            />
          )}
        </div>
      ) : (
        <div className="mt-4 flex w-full flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 bg-white/50 px-12 py-24 dark:border-zinc-800 dark:bg-zinc-900/50">
          <span className="mb-5 grid h-20 w-20 place-items-center rounded-full bg-brand/10 text-brand dark:bg-brand-dark/15 dark:text-brand-dark">
            <Icon name="users" size={40} />
          </span>
          <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            No Drivers Found
          </h3>
          <p className="mt-2 max-w-md text-center text-base text-zinc-500 dark:text-zinc-400">
            There are currently no drivers in this organization. Add a new
            driver to get started.
          </p>
        </div>
      )}

      <DriverDocumentsModal
        open={!!docsDriver}
        driver={docsDriver}
        onClose={() => setDocsDriver(null)}
      />
    </div>
  )
}
