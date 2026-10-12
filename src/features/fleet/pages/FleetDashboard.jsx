import { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon from '../../../components/common/Icon.jsx'
import NotificationPopover from '../../../components/layout/NotificationPopover.jsx'
import GoogleMapView from '../../../components/GoogleMapView.jsx'
import { useQuery } from '@tanstack/react-query'
import { useMapLocations } from '../../../hooks/useMapLocations.js'
import { dashboardService } from '../../../api/services/dashboardService.js'
import { getCurrentOrganizationId } from '../../../api/services/orgContext.js'

function DriverActivity({ activity = [], isLoading }) {
  const max = Math.max(1, ...activity.map((d) => d.active ?? 0))

  return (
    <div className="flex h-full flex-col rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand/10 text-brand dark:bg-brand-dark/15 dark:text-brand-dark">
            <Icon name="barChart" size={16} />
          </span>
          <div>
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">
              Driver Activity
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Distinct drivers with location pings · last 7 days
            </p>
          </div>
        </div>
      </div>

      {isLoading && activity.length === 0 ? (
        <p className="mt-8 text-sm text-zinc-400">Loading activity…</p>
      ) : (
        <>
          <div className="mt-8 flex h-52 items-end gap-4 border-b border-zinc-100 pb-0 dark:border-zinc-800">
            {activity.map((d) => {
              const total = d.active ?? 0
              const heavy = total / max > 0.7
              return (
                <div
                  key={d.date ?? d.day}
                  className="flex h-full flex-1 flex-col justify-end"
                >
                  <div
                    className={
                      'w-full rounded-t-lg ' +
                      (heavy ? 'bg-brand/40' : 'bg-brand/12')
                    }
                    style={{
                      height: `${Math.max(total > 0 ? 8 : 2, (total / max) * 100)}%`,
                    }}
                    title={`${d.day}: ${total}`}
                  />
                </div>
              )
            })}
          </div>
          <div className="mt-2 flex gap-4">
            {activity.map((d) => (
              <span
                key={`label-${d.date ?? d.day}`}
                className="flex-1 text-center text-xs text-zinc-400"
              >
                {d.day}
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function FleetRouteAlerts({ alerts = [], isLoading }) {
  const navigate = useNavigate()

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center justify-between gap-2">
        <p className="flex items-center gap-2 font-semibold text-zinc-900 dark:text-zinc-50">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-red-50 text-red-500 dark:bg-red-500/10 dark:text-red-400">
            <Icon name="warning" size={15} />
          </span>
          Active SOS
        </p>
        <button
          type="button"
          onClick={() => navigate('/my-fleet')}
          className="text-xs font-semibold text-brand hover:underline dark:text-brand-dark"
        >
          Open live map
        </button>
      </div>

      {isLoading && alerts.length === 0 ? (
        <p className="mt-4 text-sm text-zinc-400">Loading alerts…</p>
      ) : alerts.length === 0 ? (
        <p className="mt-4 text-sm text-zinc-400">No active SOS alerts.</p>
      ) : (
        <div className="mt-3 flex flex-col divide-y divide-zinc-100 dark:divide-zinc-800">
          {alerts.map((alert) => (
            <button
              key={alert.id}
              type="button"
              onClick={() => navigate('/my-fleet')}
              className="flex w-full items-center justify-between gap-2 py-2.5 text-left transition hover:pl-1"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                  {alert.name || 'SOS alert'}
                </p>
                <p className="truncate text-xs text-zinc-400">
                  {alert.detail || alert.status || 'Open incident'}
                  {alert.timeAgo ? ` · ${alert.timeAgo}` : ''}
                </p>
              </div>
              <span className="flex shrink-0 items-center gap-1.5 text-xs font-bold uppercase text-red-500">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                SOS
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

const ROUTE_LEGEND = [
  { label: 'SOS alerts', dot: 'bg-red-500' },
  { label: 'Drivers — live', dot: 'bg-green-500' },
  { label: 'Drivers — last known', dot: 'bg-slate-500' },
  { label: 'Attorneys', dot: 'bg-blue-500' },
  { label: 'Organizations', dot: 'bg-purple-600' },
]

function RouteIntelligence() {
  const [viewport, setViewport] = useState(null)
  const handleViewportChange = useCallback((next) => setViewport(next), [])
  const { markers, isClustered, counts, isLoading, error } =
    useMapLocations(viewport)

  return (
    <div className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-5 shadow-xl ring-1 ring-black/5 dark:border-zinc-800 dark:bg-zinc-900">
      <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand via-brand-dark to-brand" />

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand to-brand-dark text-white shadow-md">
            <Icon name="compass" size={20} />
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
              Drivers, SOS, attorneys & organizations from the API
              {!isLoading ? ` · ${counts.total} in view` : ''}
            </p>
          </div>
        </div>
      </div>

      <GoogleMapView
        className="mt-4 h-[min(560px,55vh)] rounded-xl shadow-inner"
        fitBounds={false}
        initialFitBounds
        serverClusters={isClustered}
        markers={markers}
        onViewportChange={handleViewportChange}
      >
        <div className="absolute left-4 top-4 rounded-xl bg-white/95 px-4 py-3 text-xs shadow-md backdrop-blur dark:bg-zinc-900/95">
          <p className="font-bold text-zinc-900 dark:text-zinc-50">
            Live tracking
          </p>
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-amber-600">
            In this area
          </p>
          <div className="flex flex-col gap-1.5">
            {ROUTE_LEGEND.map((l) => (
              <span
                key={l.label}
                className="flex items-center gap-1.5 font-medium text-zinc-700 dark:text-zinc-300"
              >
                <span className={`h-2 w-2 shrink-0 rounded-full ${l.dot}`} />
                {l.label}
              </span>
            ))}
          </div>
          {error && (
            <p className="mt-2 text-xs text-red-500">
              Could not load map locations
            </p>
          )}
          {isLoading && !markers.length && (
            <p className="mt-2 text-xs text-zinc-400">Loading locations…</p>
          )}
          {!isLoading && !error && markers.length === 0 && (
            <p className="mt-2 text-xs text-zinc-400">No locations in view</p>
          )}
        </div>
      </GoogleMapView>
    </div>
  )
}

const FLEET_ACCENTS = {
  brand: {
    ring: 'from-brand/60 to-brand/10',
    icon: 'bg-brand/10 text-brand dark:bg-brand-dark/15 dark:text-brand-dark',
    value: 'text-brand dark:text-brand-dark',
    trend: 'bg-brand/10 text-brand dark:text-brand-dark',
  },
  blue: {
    ring: 'from-blue-500/60 to-blue-500/10',
    icon: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
    value: 'text-blue-600 dark:text-blue-400',
    trend: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
  },
  amber: {
    ring: 'from-amber-500/60 to-amber-500/10',
    icon: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
    value: 'text-amber-600 dark:text-amber-400',
    trend: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
  },
  green: {
    ring: 'from-green-500/60 to-green-500/10',
    icon: 'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400',
    value: 'text-green-600 dark:text-green-400',
    trend: 'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400',
  },
  red: {
    ring: 'from-red-500/60 to-red-500/10',
    icon: 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400',
    value: 'text-red-600 dark:text-red-400',
    trend: 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400',
  },
}

function FleetStatTile({ stat }) {
  const a = FLEET_ACCENTS[stat.accent]
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
      <span
        className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${a.ring} opacity-90 transition group-hover:h-1.5`}
      />
      <div className="flex items-center justify-between">
        <span
          className={`grid h-9 w-9 place-items-center rounded-lg transition group-hover:scale-110 ${a.icon}`}
        >
          <Icon name={stat.icon} size={16} />
        </span>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-bold uppercase tracking-wide ${a.trend}`}
        >
          {stat.trend}
        </span>
      </div>
      <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-zinc-400">
        {stat.label}
      </p>
      <p className={`mt-0.5 text-xl font-bold tracking-tight ${a.value}`}>
        {stat.value}
      </p>
    </div>
  )
}

export default function FleetDashboard() {
  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['organization-dashboard'],
    queryFn: async () => {
      const orgId = await getCurrentOrganizationId()
      const res = await dashboardService.getOrganizationDashboard(orgId)
      return res.data?.data ?? res.data ?? null
    },
  })

  const statsValues = dashboard?.stats ?? {}
  const activity = dashboard?.driverActivity ?? []
  const recentSos = dashboard?.recentSos ?? []

  const stats = useMemo(
    () => [
      {
        key: 'drivers',
        label: 'Active Drivers',
        value: isLoading && statsValues.activeDrivers == null ? '…' : (statsValues.activeDrivers ?? 0),
        icon: 'users',
        accent: 'brand',
        trend: 'Live',
      },
      {
        key: 'fleets',
        label: 'Fleets',
        value: isLoading && statsValues.fleets == null ? '…' : (statsValues.fleets ?? 0),
        icon: 'truck',
        accent: 'blue',
        trend: 'Groups',
      },
      {
        key: 'cases',
        label: 'Open Cases',
        value: isLoading && statsValues.openCases == null ? '…' : (statsValues.openCases ?? 0),
        icon: 'clipboard',
        accent: 'amber',
        trend: 'Legal',
      },
      {
        key: 'sos',
        label: 'Open SOS',
        value: isLoading && statsValues.sosOpen == null ? '…' : (statsValues.sosOpen ?? 0),
        icon: 'sos',
        accent: 'red',
        trend: 'Alerts',
      },
    ],
    [isLoading, statsValues],
  )

  return (
    <div className="flex flex-col gap-5">
      <div className="flex justify-end gap-3">
        <NotificationPopover buttonClassName="inline-flex items-center justify-center transition-all duration-200 outline-none focus:ring-2 focus:ring-brand/50 bg-zinc-800/80 border border-zinc-700/50 text-zinc-100 backdrop-blur-md hover:bg-zinc-700/80 hover:border-zinc-600 grid h-9 w-9 place-items-center rounded-lg relative" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <FleetStatTile key={s.key} stat={s} />
        ))}
      </div>

      <div className="grid items-stretch gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <DriverActivity activity={activity} isLoading={isLoading} />
        </div>
        <FleetRouteAlerts alerts={recentSos} isLoading={isLoading} />
      </div>

      <RouteIntelligence />
    </div>
  )
}
