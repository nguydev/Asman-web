import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon from '../../../components/common/Icon.jsx'
import { Button } from '../../../components/ui/Button.jsx'
import GoogleMapView from '../../../components/GoogleMapView.jsx'
import { useMapLocations } from '../../../hooks/useMapLocations.js'

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'live', label: 'Live' },
  { key: 'last', label: 'Last known' },
  { key: 'sos', label: 'SOS' },
]

const LEGEND = [
  { label: 'SOS', className: 'bg-red-500' },
  { label: 'Live driver', className: 'bg-green-500' },
  { label: 'Last known', className: 'bg-slate-500' },
  { label: 'Attorney', className: 'bg-blue-500' },
  { label: 'Organization', className: 'bg-purple-600' },
]

function formatRelativeTime(value) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  const diffSec = Math.round((Date.now() - date.getTime()) / 1000)
  if (diffSec < 10) return 'just now'
  if (diffSec < 60) return `${diffSec}s ago`
  const diffMin = Math.round(diffSec / 60)
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHr = Math.round(diffMin / 60)
  if (diffHr < 24) return `${diffHr}h ago`
  return `${Math.round(diffHr / 24)}d ago`
}

function formatSpeed(speed) {
  if (speed == null || !Number.isFinite(Number(speed))) return null
  return `${Math.round(Number(speed))} mph`
}

function formatHeading(heading) {
  if (heading == null || !Number.isFinite(Number(heading))) return null
  const deg = ((Number(heading) % 360) + 360) % 360
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
  return `${Math.round(deg)}° ${dirs[Math.round(deg / 45) % 8]}`
}

function markerStatus(marker) {
  if (marker.role === 'SOS') return { key: 'sos', label: 'SOS', tone: 'text-red-500' }
  if (marker.role === 'DRIVER' && marker.live) {
    return { key: 'live', label: 'Live', tone: 'text-green-600 dark:text-green-400' }
  }
  if (marker.role === 'DRIVER') {
    return { key: 'last', label: 'Last known', tone: 'text-slate-500' }
  }
  if (marker.role === 'ATTORNEY') {
    return { key: 'attorney', label: 'Attorney', tone: 'text-blue-600' }
  }
  if (marker.role === 'ORGANIZATION') {
    return { key: 'org', label: 'Organization', tone: 'text-purple-600' }
  }
  return { key: 'other', label: marker.role || 'Location', tone: 'text-zinc-500' }
}

function pinColor(marker) {
  if (typeof marker.color === 'string' && marker.color.startsWith('#')) {
    return marker.color
  }
  if (marker.role === 'SOS') return '#dc2626'
  if (marker.role === 'DRIVER' && marker.live) return '#16a34a'
  if (marker.role === 'DRIVER') return '#64748b'
  if (marker.role === 'ATTORNEY') return '#2563eb'
  if (marker.role === 'ORGANIZATION') return '#7c3aed'
  return '#0f2a3d'
}

function DriverAvatar({ name, avatar, size = 'md' }) {
  const sizeClass = size === 'lg' ? 'h-16 w-16 text-xl' : 'h-10 w-10 text-sm'
  const initial = (name || '?').charAt(0).toUpperCase()
  if (avatar) {
    return (
      <img
        src={avatar}
        alt={name || 'Marker'}
        className={`${sizeClass} rounded-full object-cover ring-2 ring-brand/15`}
      />
    )
  }
  return (
    <div
      className={`${sizeClass} flex items-center justify-center rounded-full bg-zinc-200 font-bold text-zinc-600 dark:bg-zinc-700 dark:text-zinc-200`}
    >
      {initial}
    </div>
  )
}

function MarkerListPanel({
  markers,
  tab,
  setTab,
  selectedId,
  setSelectedId,
  counts,
  isLoading,
  error,
}) {
  const filtered = useMemo(() => {
    return markers.filter((m) => {
      if (typeof m.count === 'number' && m.count > 1) return false
      if (tab === 'live') return m.role === 'DRIVER' && m.live
      if (tab === 'last') return m.role === 'DRIVER' && !m.live
      if (tab === 'sos') return m.role === 'SOS'
      return true
    })
  }, [markers, tab])

  const liveCount = counts.driversLive + counts.sos

  return (
    <div className="flex h-full min-h-0 flex-col rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center justify-between gap-2 border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
        <div>
          <h3 className="font-bold text-zinc-900 dark:text-zinc-50">
            Locations
          </h3>
          <p className="text-xs text-zinc-500">
            {isLoading ? 'Loading…' : `${counts.total} nearby`}
          </p>
        </div>
        <span className="rounded-full bg-green-500/10 px-2.5 py-1 text-xs font-bold text-green-600 dark:text-green-400">
          {liveCount} LIVE
        </span>
      </div>

      <div className="flex gap-1 border-b border-zinc-100 p-2 dark:border-zinc-800">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={
              'flex-1 rounded-md py-1.5 text-xs font-semibold transition ' +
              (tab === t.key
                ? 'bg-btn-bg text-btn-text'
                : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-800 dark:hover:bg-zinc-800 dark:hover:text-zinc-300')
            }
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {error ? (
          <p className="px-4 py-8 text-center text-sm text-red-500">
            Could not load locations
          </p>
        ) : isLoading && markers.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-zinc-500">
            Loading locations…
          </p>
        ) : filtered.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-zinc-500">
            No locations match this filter
          </p>
        ) : (
          <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {filtered.map((marker) => {
              const status = markerStatus(marker)
              const active = selectedId === marker.id
              const title =
                marker.name ||
                marker.unitNumber ||
                (marker.role === 'SOS' ? 'SOS alert' : 'Unknown')
              const subtitle = [
                marker.unitNumber && marker.name ? marker.unitNumber : null,
                marker.fleetName,
                formatRelativeTime(
                  marker.deviceTs || marker.receivedTs || marker.createdAt,
                ),
              ]
                .filter(Boolean)
                .join(' · ')

              return (
                <li key={marker.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(marker.id)}
                    className={
                      'flex w-full items-center gap-3 px-4 py-3 text-left transition ' +
                      (active
                        ? 'bg-brand/5'
                        : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/60')
                    }
                  >
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full ring-2 ring-white dark:ring-zinc-900"
                      style={{ backgroundColor: pinColor(marker) }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate font-semibold text-zinc-900 dark:text-zinc-50">
                          {title}
                        </p>
                        <span
                          className={`shrink-0 text-[10px] font-bold uppercase ${status.tone}`}
                        >
                          {status.label}
                        </span>
                      </div>
                      <p className="truncate text-xs text-zinc-500">
                        {subtitle || marker.role}
                      </p>
                    </div>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}

function MapPanel({
  markers,
  isClustered,
  selectedId,
  onSelect,
  onViewportChange,
  isLoading,
  error,
  counts,
}) {
  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <GoogleMapView
        className="h-full min-h-0 flex-1 rounded-none border-0"
        fitBounds={false}
        initialFitBounds
        serverClusters={isClustered}
        markers={markers}
        selectedId={selectedId}
        onMarkerClick={onSelect}
        onViewportChange={onViewportChange}
      >
        <div className="absolute left-4 top-4 rounded-xl bg-white/95 px-3 py-2.5 text-xs shadow-md backdrop-blur dark:bg-zinc-900/95">
          <p className="flex items-center gap-1.5 font-bold text-zinc-900 dark:text-zinc-50">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-500" />
            </span>
            Live map
          </p>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-zinc-500">
            {counts.total} nearby
          </p>
          <div className="flex flex-col gap-1">
            {LEGEND.map((l) => (
              <span
                key={l.label}
                className="flex items-center gap-1.5 font-medium text-zinc-600 dark:text-zinc-300"
              >
                <span className={`h-2 w-2 shrink-0 rounded-full ${l.className}`} />
                {l.label}
              </span>
            ))}
          </div>
          {error && (
            <p className="mt-2 text-xs text-red-500">Could not load locations</p>
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

function DetailPanel({ marker }) {
  const navigate = useNavigate()

  if (!marker || (typeof marker.count === 'number' && marker.count > 1)) {
    return (
      <div className="grid h-full min-h-0 place-items-center rounded-xl border border-zinc-200 bg-white p-6 text-center text-sm text-zinc-400 dark:border-zinc-800 dark:bg-zinc-900">
        Select a location to view details
      </div>
    )
  }

  const status = markerStatus(marker)
  const updated = formatRelativeTime(
    marker.deviceTs || marker.receivedTs || marker.createdAt,
  )
  const speed = formatSpeed(marker.speed)
  const heading = formatHeading(marker.heading)
  const driverId = marker.driverId || (marker.role === 'DRIVER' ? marker.id : null)
  const title =
    marker.name ||
    marker.unitNumber ||
    (marker.role === 'SOS' ? 'SOS alert' : 'Location')

  return (
    <div className="flex h-full min-h-0 flex-col rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex flex-col items-center text-center">
        <div className="relative">
          <DriverAvatar name={marker.name} avatar={marker.avatar} size="lg" />
          <span
            className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white dark:border-zinc-900"
            style={{ backgroundColor: pinColor(marker) }}
          />
        </div>
        <p className="mt-3 font-bold text-zinc-900 dark:text-zinc-50">{title}</p>
        <p className={`mt-1 text-xs font-bold uppercase ${status.tone}`}>
          {status.label}
        </p>
        {marker.fleetName && (
          <p className="mt-1 flex items-center gap-1.5 text-xs text-zinc-500">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: pinColor(marker) }}
            />
            {marker.fleetName}
          </p>
        )}
      </div>

      <div className="mt-5 space-y-3 border-t border-zinc-100 pt-4 dark:border-zinc-800">
        <DetailRow label="Plate" value={marker.unitNumber} />
        <DetailRow label="Fleet" value={marker.fleetName} />
        <DetailRow label="Speed" value={speed} />
        <DetailRow label="Heading" value={heading} />
        <DetailRow
          label="Place"
          value={[marker.city, marker.state].filter(Boolean).join(', ') || null}
        />
        <DetailRow label="Updated" value={updated} />
        <DetailRow label="Note" value={marker.detail || marker.status} />
        <DetailRow
          label="Coords"
          value={
            Number.isFinite(marker.lat) && Number.isFinite(marker.lng)
              ? `${marker.lat.toFixed(5)}, ${marker.lng.toFixed(5)}`
              : null
          }
        />
      </div>

      <div className="mt-auto space-y-2 pt-5">
        {driverId && (
          <Button
            variant="primary"
            className="w-full"
            icon="user"
            onClick={() => navigate(`/drivers/${driverId}/edit`)}
          >
            View driver
          </Button>
        )}
        {marker.role === 'SOS' && (
          <Button
            variant="danger"
            className="w-full"
            icon="sos"
            onClick={() => navigate('/case-status')}
          >
            Open case status
          </Button>
        )}
      </div>
    </div>
  )
}

function DetailRow({ label, value }) {
  if (value == null || value === '') return null
  return (
    <div className="flex items-start justify-between gap-3 text-sm">
      <span className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
        {label}
      </span>
      <span className="max-w-[60%] text-right font-medium text-zinc-800 dark:text-zinc-100">
        {value}
      </span>
    </div>
  )
}

export default function MyFleet() {
  const [tab, setTab] = useState('all')
  const [selectedId, setSelectedId] = useState(null)
  const [viewport, setViewport] = useState(null)
  const handleViewportChange = useCallback((next) => setViewport(next), [])

  const { markers, isClustered, counts, isLoading, error } =
    useMapLocations(viewport)

  const selectableMarkers = useMemo(
    () => markers.filter((m) => !(typeof m.count === 'number' && m.count > 1)),
    [markers],
  )

  useEffect(() => {
    if (selectedId) return
    if (selectableMarkers.length > 0) {
      setSelectedId(selectableMarkers[0].id)
    }
  }, [selectableMarkers, selectedId])

  const selected =
    selectableMarkers.find((m) => m.id === selectedId) ?? null

  return (
    <div className="grid min-h-0 flex-1 items-stretch gap-5 lg:h-[calc(100dvh-9rem)] lg:grid-cols-[280px_minmax(0,1fr)_280px]">
      <MarkerListPanel
        markers={selectableMarkers}
        tab={tab}
        setTab={setTab}
        selectedId={selectedId}
        setSelectedId={setSelectedId}
        counts={counts}
        isLoading={isLoading}
        error={error}
      />
      <MapPanel
        markers={markers}
        isClustered={isClustered}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onViewportChange={handleViewportChange}
        isLoading={isLoading}
        error={error}
        counts={counts}
      />
      <DetailPanel marker={selected} />
    </div>
  )
}
