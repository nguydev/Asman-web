import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon from '../../../components/common/Icon.jsx'
import { Button } from '../../../components/ui/Button.jsx'
import OrganizationDetailModal from '../../fleet/components/OrganizationDetailModal.jsx'
import { organizationService } from '../../../api/services/organizationService.js'

const ICON_TONES = {
  blue: 'bg-brand/10 text-brand shadow-[0_0_10px_rgba(0,229,255,0.2)]',
  dark: 'bg-zinc-800 text-zinc-100 shadow-[0_0_10px_rgba(255,255,255,0.1)]',
  red: 'bg-red-500/10 text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.2)]',
  amber: 'bg-amber-500/10 text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.2)]',
}

const STATUS_ACCENT = {
  ACTIVE: 'from-green-400 to-green-500',
  PENDING: 'from-zinc-400 to-zinc-500',
  SUSPENDED: 'from-red-400 to-red-500',
  REJECTED: 'from-red-400 to-red-500',
}

const STATUS_BADGE = {
  ACTIVE: 'bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/30',
  PENDING: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700',
  SUSPENDED: 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30',
  REJECTED: 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30',
}

const STATUS_LABEL = {
  ACTIVE: 'Active',
  PENDING: 'Pending',
  SUSPENDED: 'Suspended',
  REJECTED: 'Rejected',
}

function OrganizationCard({ org, onManage, onView }) {
  const activeDrivers = org._count?.members || org.members?.length || 0
  const subscription = org.subscriptions?.[0]?.plan?.name || 'None'

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl glass-panel shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(0,229,255,0.1)] hover:border-brand/30">
      <span className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${STATUS_ACCENT[org.status] || STATUS_ACCENT.PENDING}`} />

      <div className="flex flex-col p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            {org.logoUrl ? (
              <img 
                src={org.logoUrl} 
                alt={org.name} 
                className="h-11 w-11 shrink-0 rounded-xl object-cover ring-4 ring-black/[0.02] transition group-hover:scale-110"
              />
            ) : (
              <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ring-4 ring-black/[0.02] transition group-hover:scale-110 ${ICON_TONES.blue}`}>
                <Icon name="building" size={18} />
              </span>
            )}
            <p className="font-bold text-zinc-900 dark:text-zinc-50">
              {org.name}
            </p>
          </div>
          <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_BADGE[org.status] || STATUS_BADGE.PENDING}`}>
            {STATUS_LABEL[org.status] || org.status}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
              Active Drivers
            </p>
            <p className="font-bold text-zinc-900 dark:text-zinc-50">
              {activeDrivers}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
              Subscription
            </p>
            <button
              className="font-bold text-brand hover:underline dark:text-brand-dark"
            >
              {subscription}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-auto grid grid-cols-2 border-t border-zinc-100 dark:border-zinc-800">
        <button
          onClick={() => onView(org)}
          className="flex items-center justify-center gap-1.5 py-3 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          <Icon name="eye" size={14} />
          View
        </button>
        <button
          onClick={() => onManage(org)}
          className="flex items-center justify-center gap-1.5 border-l border-zinc-100 py-3 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-50 dark:border-zinc-800/50 dark:text-zinc-300 dark:hover:bg-brand/10 dark:hover:text-brand"
        >
          <Icon name="edit" size={14} />
          Manage
        </button>
      </div>
    </div>
  )
}

export default function Fleets() {
  const navigate = useNavigate()
  const [organizations, setOrganizations] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({ totalOrgs: 0, totalFleets: 0, totalDrivers: 0 })
  const [detailFleet, setDetailFleet] = useState(null)
  const [isSuspending, setIsSuspending] = useState(false)

  const refreshOrgs = async () => {
    const res = await organizationService.getOrganizations({ limit: 100 })
    const data = res.data?.data || res.data
    if (Array.isArray(data)) {
      setOrganizations(data)
    }
  }

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await organizationService.getStats()
        setStats(res.data?.data || res.data)
      } catch (err) {
        console.error('Failed to fetch org stats', err)
      }
    }
    const fetchOrgs = async () => {
      setIsLoading(true)
      try {
        await refreshOrgs()
      } catch (error) {
        console.error("Failed to fetch organizations", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchStats()
    fetchOrgs()
  }, [])

  const handleSuspend = async (org) => {
    const reason = window.prompt(
      `Suspend "${org.name}"? Enter a reason (required):`,
    )
    if (reason == null) return
    const trimmed = reason.trim()
    if (!trimmed) {
      window.alert('A suspension reason is required.')
      return
    }

    setIsSuspending(true)
    try {
      await organizationService.updateStatus(org.id, {
        status: 'SUSPENDED',
        reason: trimmed,
      })
      await refreshOrgs()
      setDetailFleet(null)
    } catch (err) {
      const msg = err.response?.data?.message
      window.alert(
        (Array.isArray(msg) ? msg[0] : msg) || 'Failed to suspend organization.',
      )
    } finally {
      setIsSuspending(false)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {/* stat tiles */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl glass-panel p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Total Organizations
            </p>
            <Icon name="building" size={16} className="text-brand dark:text-brand-dark" />
          </div>
          <p className="mt-1 text-xl font-bold text-zinc-900 dark:text-zinc-50">{stats.totalOrgs || 0}</p>
        </div>
        <div className="rounded-xl glass-panel p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Total Fleets
            </p>
            <Icon name="truck" size={16} className="text-brand dark:text-brand-dark" />
          </div>
          <p className="mt-1 text-xl font-bold text-zinc-900 dark:text-zinc-50">{stats.totalFleets || 0}</p>
        </div>
        <div className="rounded-xl glass-panel p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Total Drivers
            </p>
            <Icon name="user" size={16} className="text-brand dark:text-brand-dark" />
          </div>
          <p className="mt-1 text-xl font-bold text-zinc-900 dark:text-zinc-50">{stats.totalDrivers || 0}</p>
        </div>
      </div>

      {/* header */}
      <div className="flex flex-wrap items-start justify-end gap-3">
        <Button
          onClick={() => navigate('/fleets/onboard')}
          variant="primary"
          icon="plus"
        >
          Add Organization
        </Button>
      </div>

      {/* company grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <div className="col-span-full py-20 flex justify-center text-zinc-500">
            <Icon name="spinner" className="animate-spin text-brand" size={32} />
          </div>
        ) : organizations.length === 0 ? (
           <div className="col-span-full py-20 flex flex-col items-center justify-center text-zinc-500">
             <Icon name="building" size={48} className="mb-4 opacity-50" />
             <p>No organizations found.</p>
           </div>
        ) : (
          organizations.map((org) => (
            <OrganizationCard
              key={org.id}
              org={org}
              onManage={(o) => navigate(`/fleets/onboard?id=${o.id}`, { state: { editOrg: o } })}
              onView={(o) => setDetailFleet(o)}
            />
          ))
        )}
      </div>

      <OrganizationDetailModal
        open={!!detailFleet}
        org={detailFleet}
        onClose={() => setDetailFleet(null)}
        onSuspend={isSuspending ? undefined : handleSuspend}
      />
    </div>
  )
}
