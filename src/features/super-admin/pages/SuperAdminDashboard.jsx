import { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import Icon from '../../../components/common/Icon.jsx'
import { Button } from '../../../components/ui/Button.jsx'
import GoogleMapView from '../../../components/GoogleMapView.jsx'
import { useMapLocations } from '../../../hooks/useMapLocations.js'
import { dashboardService } from '../../../api/services/dashboardService.js'

const STAT_META = [
  { key: 'subscribers', label: 'Subscribers', icon: 'creditCard', accent: 'brand', trend: 'Active', to: '/subscription' },
  { key: 'activeDrivers', label: 'Active Drivers', icon: 'truck', accent: 'green', trend: 'Live', to: '/fleets' },
  { key: 'fleets', label: 'Fleets', icon: 'clipboard', accent: 'purple', trend: 'Orgs', to: '/fleets' },
  { key: 'attorneys', label: 'Attorneys', icon: 'briefcase', accent: 'blue', trend: 'Legal', to: '/attorneys' },
  { key: 'sosToday', label: 'SOS Today', icon: 'sos', accent: 'red', trend: 'Live', to: '/sos-incidents' },
]

const ACCENTS = {
  brand: {
    ring: 'from-brand/60 to-brand/10',
    icon: 'bg-brand/10 text-brand dark:bg-brand-dark/15 dark:text-brand-dark',
    value: 'text-zinc-900 dark:text-zinc-50',
    trend: 'bg-brand/10 text-brand dark:text-brand-dark',
  },
  green: {
    ring: 'from-emerald-500/60 to-emerald-500/10',
    icon: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
    value: 'text-emerald-600 dark:text-emerald-400',
    trend: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
  },
  purple: {
    ring: 'from-purple-500/60 to-purple-500/10',
    icon: 'bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400',
    value: 'text-zinc-900 dark:text-zinc-50',
    trend: 'bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400',
  },
  blue: {
    ring: 'from-blue-500/60 to-blue-500/10',
    icon: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
    value: 'text-zinc-900 dark:text-zinc-50',
    trend: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
  },
  red: {
    ring: 'from-red-500/60 to-red-500/10',
    icon: 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400',
    value: 'text-red-600 dark:text-red-400',
    trend: 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 animate-pulse',
  },
  amber: {
    ring: 'from-amber-500/60 to-amber-500/10',
    icon: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
    value: 'text-zinc-900 dark:text-zinc-50',
    trend: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
  },
}

function initials(name) {
  if (!name) return '?'
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || '?'
}

function formatCount(value) {
  if (value == null || Number.isNaN(Number(value))) return '0'
  return Number(value).toLocaleString()
}

const MARKER_HEX = {
  red: '#dc2626',
  green: '#16a34a',
  slate: '#64748b',
  blue: '#2563eb',
  purple: '#7c3aed',
}

const MAP_LEGEND = [
  { key: 'sos', label: 'SOS alerts', tone: 'red' },
  { key: 'live', label: 'Drivers — live', tone: 'green' },
  { key: 'last', label: 'Drivers — last known', tone: 'slate' },
  { key: 'attorneys', label: 'Attorneys', tone: 'blue' },
  { key: 'orgs', label: 'Organizations', tone: 'purple' },
]

/* ---------------- small pieces ---------------- */
function StatTile({ stat, onClick }) {
  const a = ACCENTS[stat.accent]
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative flex flex-col overflow-hidden rounded-xl glass-panel p-4 text-left shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-[0_0_15px_rgba(0,229,255,0.15)] hover:border-brand/30"
    >
      <span
        className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${a.ring} opacity-90 transition group-hover:h-1.5`}
      />
      <div className="flex items-center justify-between">
        <span className={`grid h-9 w-9 place-items-center rounded-lg transition group-hover:scale-110 ${a.icon}`}>
          <Icon name={stat.icon} size={16} />
        </span>
        <span className={`rounded-full px-2 py-0.5 text-xs font-bold uppercase tracking-wide ${a.trend}`}>
          {stat.trend}
        </span>
      </div>
      <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-zinc-400">
        {stat.label}
      </p>
      <p className={`mt-0.5 text-xl font-bold tracking-tight ${a.value}`}>{stat.value}</p>
    </button>
  )
}

function IntelligenceMap() {
  const [showLegend, setShowLegend] = useState(true)
  const [viewport, setViewport] = useState(null)
  const handleViewportChange = useCallback((next) => setViewport(next), [])
  const { markers, isClustered, counts } = useMapLocations(viewport)

  const mapStats = [
    {
      key: 'sos',
      label: 'SOS Active',
      value: isClustered ? '0' : counts.sos,
      tone: 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400',
    },
    {
      key: 'live',
      label: isClustered ? 'Locations nearby' : 'Drivers Live',
      value: isClustered ? counts.total : counts.driversLive,
      tone: 'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400',
    },
    {
      key: 'last',
      label: 'Last known',
      value: isClustered ? '0' : counts.driversLast,
      tone: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300',
    },
    {
      key: 'att',
      label: 'Attorneys',
      value: isClustered ? '0' : counts.attorneys,
      tone: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
    },
    {
      key: 'org',
      label: 'Orgs',
      value: isClustered ? '0' : counts.organizations,
      tone: 'bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400',
    },
  ]

  return (
    <div className="relative flex min-h-[560px] flex-col overflow-hidden rounded-2xl glass-panel shadow-xl">
      <span className="absolute inset-x-0 top-0 z-10 h-1 bg-gradient-to-r from-brand via-brand-dark to-brand" />

      <div className="flex shrink-0 flex-wrap items-center justify-between gap-4 border-b border-zinc-100 p-5 pb-4 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand to-brand-dark text-white shadow-md">
            <Icon name="globe" size={20} />
          </span>
          <div>
            <h3 className="flex items-center gap-2 font-bold text-zinc-900 dark:text-zinc-50">
              Live Fleet Map
              <span className="flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-red-600 dark:bg-red-500/10 dark:text-red-400">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-red-500" />
                </span>
                Live
              </span>
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              SOS, drivers, attorneys & organizations in this area
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {mapStats.map((s) => (
            <span
              key={s.key}
              className={`rounded-lg px-2.5 py-1.5 text-center text-xs font-semibold ${s.tone}`}
            >
              <span className="block text-sm font-bold leading-none">{s.value}</span>
              <span className="text-xs font-bold uppercase tracking-wide opacity-80">{s.label}</span>
            </span>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1">
        <GoogleMapView
          className="h-full min-h-[480px] rounded-none border-0"
          fitBounds={false}
          initialFitBounds
          serverClusters={isClustered}
          markers={markers}
          onViewportChange={handleViewportChange}
        >
        {showLegend && (
          <div className="absolute left-4 top-4 rounded-lg bg-white/95 px-3 py-2.5 text-xs shadow-lg backdrop-blur dark:bg-zinc-900/95">
            <p className="font-bold text-zinc-800 dark:text-zinc-100">Live tracking</p>
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-amber-600">
              In this area
            </p>
            <div className="flex flex-col gap-1">
              {MAP_LEGEND.map((l) => (
                <span
                  key={l.key}
                  className="flex items-center gap-1.5 font-medium text-zinc-600 dark:text-zinc-300"
                >
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ background: MARKER_HEX[l.tone] }}
                  />
                  {l.label}
                </span>
              ))}
            </div>
            {/* {error && (
              <p className="mt-2 text-xs text-red-500">Could not load map locations</p>
            )}
            {isLoading && !markers.length && (
              <p className="mt-2 text-xs text-zinc-400">Loading locations…</p>
            )}
            {!isLoading && !error && markers.length === 0 && (
              <p className="mt-2 text-xs text-zinc-400">No locations in view</p>
            )}*/}
          </div>
        )}

        <button
          type="button"
          onClick={() => setShowLegend((v) => !v)}
          title={showLegend ? 'Hide legend' : 'Show legend'}
          className={
            'absolute bottom-4 right-4 grid h-9 w-9 place-items-center rounded-lg shadow-lg transition ' +
            (showLegend
              ? 'bg-zinc-900 text-white'
              : 'bg-white text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300')
          }
        >
          <Icon name="layers" size={16} />
        </button>
      </GoogleMapView>
      </div>
    </div>
  )
}

function ActiveSosAlarms({ alarms, onTrack }) {
  return (
    <div className="relative overflow-hidden rounded-xl glass-panel border-red-500/30 p-5 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
      <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-red-500 to-red-500/20" />
      <div className="flex items-center justify-between gap-2">
        <p className="flex items-center gap-2 font-semibold text-red-600 dark:text-red-400">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
          </span>
          Active SOS Alarms
        </p>
        <Button
          variant="ghost"
          size="sm"
          onClick={onTrack}
        >
          View all
        </Button>
      </div>

      {alarms.length === 0 ? (
        <p className="mt-4 text-sm text-zinc-400">No active SOS alarms.</p>
      ) : (
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {alarms.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={onTrack}
              className="flex flex-col items-start gap-2 rounded-lg border border-zinc-100 p-3 text-left transition hover:-translate-y-0.5 hover:border-red-200 hover:bg-red-50/50 hover:shadow-md dark:border-zinc-800 dark:hover:border-red-500/30 dark:hover:bg-red-500/5"
            >
              <div className="flex w-full items-center gap-2.5">
                {s.userPhoto ? (
                  <img
                    src={s.userPhoto}
                    alt={s.userName || 'Driver'}
                    className="h-9 w-9 shrink-0 rounded-full object-cover ring-2 ring-red-100 dark:ring-red-500/20"
                  />
                ) : (
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-red-100 text-xs font-bold text-red-700 ring-2 ring-red-100 dark:bg-red-500/20 dark:text-red-300 dark:ring-red-500/20">
                    {initials(s.userName)}
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                      {s.userName || 'Unknown driver'}
                    </p>
                    <span className="shrink-0 text-xs text-zinc-400">{s.timeAgo}</span>
                  </div>
                  <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                    {s.detail || s.status}
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">
                Track GPS
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function EnforcementAlerts({ alerts = [] }) {
  return (
    <div className="rounded-xl glass-panel p-5 shadow-sm">
      <p className="flex items-center gap-2 font-semibold text-zinc-900 dark:text-zinc-50">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand/10 text-brand dark:bg-brand-dark/15 dark:text-brand-dark">
          <Icon name="pin" size={15} />
        </span>
        Enforcement Alerts
      </p>
      {alerts.length === 0 ? (
        <p className="mt-4 text-sm text-zinc-400">No enforcement alerts right now.</p>
      ) : (
        <div className="mt-3 flex flex-col divide-y divide-zinc-100 dark:divide-zinc-800">
          {alerts.map((a) => (
            <div key={a.id ?? a.title} className="py-2.5 transition hover:pl-1">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                  {a.title}
                </p>
                <span className="shrink-0 text-xs text-zinc-400">
                  {a.time ?? a.timeAgo ?? ''}
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {a.detail}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function LiveIntelligenceFeed({ items = [] }) {
  const [tagFilter, setTagFilter] = useState('all')

  const tags = useMemo(() => {
    const set = new Set(
      items.map((n) => n.tag).filter((t) => typeof t === 'string' && t.trim()),
    )
    return ['all', ...set]
  }, [items])

  const visible =
    tagFilter === 'all' ? items : items.filter((n) => n.tag === tagFilter)

  return (
    <div className="rounded-xl glass-panel p-5 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <p className="flex items-center gap-2 font-semibold text-zinc-900 dark:text-zinc-50">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
            <Icon name="broadcast" size={15} />
          </span>
          Live Intelligence Feed
        </p>
      </div>
      <p className="mt-1 text-sm text-zinc-400">
        Detention &amp; enforcement intelligence from the API
      </p>

      {tags.length > 1 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {tags.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTagFilter(t)}
              className={
                'rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wide transition ' +
                (tagFilter === t
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                  : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700')
              }
            >
              {t === 'all' ? 'All' : t}
            </button>
          ))}
        </div>
      )}

      <div className="mt-3 flex max-h-72 flex-col divide-y divide-zinc-100 overflow-y-auto dark:divide-zinc-800">
        {visible.map((n, idx) => (
          <div key={n.id ?? n.head ?? n.title ?? idx} className="py-2.5 transition hover:pl-1">
            {(n.lbl || n.tag) && (
              <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs font-bold uppercase tracking-wide text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                {n.lbl || n.tag}
              </span>
            )}
            <p className="mt-1.5 text-base leading-snug text-zinc-800 dark:text-zinc-100">
              {n.head || n.title}
            </p>
            <div className="mt-1 flex justify-between text-xs text-zinc-400">
              <span>{n.src || n.source || ''}</span>
              <span>{n.time || n.timeAgo || ''}</span>
            </div>
          </div>
        ))}

        {visible.length === 0 && (
          <p className="py-6 text-center text-xs text-zinc-400">
            No feed items available.
          </p>
        )}
      </div>
    </div>
  )
}

/* ---------------- main ---------------- */
export default function SuperAdminDashboard() {
  const navigate = useNavigate()

  const { data: dashboard, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: async () => {
      const res = await dashboardService.getStats()
      return res.data?.data ?? res.data ?? null
    },
  })

  const stats = useMemo(() => {
    const values = dashboard?.stats ?? {}
    return STAT_META.map((meta) => ({
      ...meta,
      value: statsLoading && values[meta.key] == null ? '…' : formatCount(values[meta.key]),
    }))
  }, [dashboard?.stats, statsLoading])

  const activeSosAlarms = dashboard?.activeSosAlarms ?? []
  const enforcementAlerts = dashboard?.enforcementAlerts ?? []
  const newsFeed = dashboard?.newsFeed ?? []

  return (
    <div className="flex flex-col gap-5">
      {/* stat tiles */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map((s) => (
          <StatTile key={s.key} stat={s} onClick={() => navigate(s.to)} />
        ))}
      </div>

      <IntelligenceMap />
      <ActiveSosAlarms
        alarms={activeSosAlarms}
        onTrack={() => navigate('/sos-incidents')}
      />

      <div className="grid gap-5 lg:grid-cols-2">
        <EnforcementAlerts alerts={enforcementAlerts} />
        <LiveIntelligenceFeed items={newsFeed} />
      </div>
    </div>
  )
}
