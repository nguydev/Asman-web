/* global google */
import { useState, useMemo, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { APIProvider, Map as GoogleMap, AdvancedMarker, useMap, ControlPosition, MapControl } from '@vis.gl/react-google-maps'
import Supercluster from 'supercluster'
import { useAuth } from '../features/auth/context/AuthContext.jsx'
import { ROLES } from '../features/auth/utils/roles.js'
import Icon from './common/Icon.jsx'

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
const SINGLE_MARKER_ZOOM = 12
const MAX_FIT_ZOOM = 14
const HOVER_LEAVE_MS = 200

const ROLE_LABELS = {
  DRIVER: 'Driver',
  ATTORNEY: 'Attorney',
  ORGANIZATION: 'Organization',
  SOS: 'SOS alert',
}

const ROLE_BADGE = {
  DRIVER_LIVE: { label: 'Live tracking', className: 'bg-green-500/15 text-green-300' },
  DRIVER_LAST: { label: 'Last known', className: 'bg-zinc-500/20 text-zinc-300' },
  ATTORNEY: { label: 'Attorney', className: 'bg-blue-500/15 text-blue-300' },
  ORGANIZATION: { label: 'Organization', className: 'bg-purple-500/15 text-purple-300' },
  SOS: { label: 'SOS alert', className: 'bg-red-500/15 text-red-300' },
  CLUSTER: { label: 'Group', className: 'bg-teal-500/15 text-teal-300' },
}

const SOS_STATUS_BADGE = {
  active: { label: 'Open', className: 'bg-red-500/15 text-red-300' },
  OPEN: { label: 'Open', className: 'bg-red-500/15 text-red-300' },
  dispatching: { label: 'Acknowledged', className: 'bg-amber-500/15 text-amber-300' },
  ACKNOWLEDGED: { label: 'Acknowledged', className: 'bg-amber-500/15 text-amber-300' },
  resolved: { label: 'Resolved', className: 'bg-green-500/15 text-green-300' },
  RESOLVED: { label: 'Resolved', className: 'bg-green-500/15 text-green-300' },
}

const MARKER_COLORS = {
  red: { background: '#dc2626', borderColor: '#991b1b', glyphColor: '#fecaca' },
  blue: { background: '#2563eb', borderColor: '#1e40af', glyphColor: '#bfdbfe' },
  green: { background: '#16a34a', borderColor: '#166534', glyphColor: '#bbf7d0' },
  brand: { background: '#0f2a3d', borderColor: '#0a1c29', glyphColor: '#9fd7ff' },
  purple: { background: '#7c3aed', borderColor: '#5b21b6', glyphColor: '#ddd6fe' },
  black: { background: '#18181b', borderColor: '#000000', glyphColor: '#a1a1aa' },
  dark: { background: '#18181b', borderColor: '#000000', glyphColor: '#a1a1aa' },
  orange: { background: '#ea580c', borderColor: '#9a3412', glyphColor: '#fed7aa' },
  gold: { background: '#ca8a04', borderColor: '#854d0e', glyphColor: '#fef08a' },
  teal: { background: '#0d9488', borderColor: '#115e59', glyphColor: '#99f6e4' },
  pink: { background: '#db2777', borderColor: '#9d174d', glyphColor: '#fbcfe8' },
  cyan: { background: '#06b6d4', borderColor: '#0e7490', glyphColor: '#cffafe' },
  slate: { background: '#64748b', borderColor: '#334155', glyphColor: '#e2e8f0' },
}

function markerRoleKey(marker) {
  if (!marker) return null
  if (typeof marker.count === 'number' && marker.count > 1) return 'CLUSTER'
  if (marker.role === 'DRIVER') return marker.live ? 'DRIVER_LIVE' : 'DRIVER_LAST'
  return marker.role ?? null
}

function markerRoleLabel(marker) {
  if (!marker) return 'Location'
  const key = markerRoleKey(marker)
  if (key === 'CLUSTER') return `${marker.count} locations nearby`
  return ROLE_BADGE[key]?.label ?? ROLE_LABELS[marker.role] ?? marker.subtitle ?? 'Location'
}

function initialsFromName(name) {
  if (!name) return '?'
  const parts = String(name).trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
}

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
  const diffDay = Math.round(diffHr / 24)
  return `${diffDay}d ago`
}

function formatHeading(heading) {
  if (heading == null || !Number.isFinite(Number(heading))) return null
  const deg = ((Number(heading) % 360) + 360) % 360
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
  const dir = dirs[Math.round(deg / 45) % 8]
  return `${Math.round(deg)}° ${dir}`
}

/** Profile destinations available with current routes (role-aware). */
function markerProfileLink(marker, userRole) {
  if (!marker || (typeof marker.count === 'number' && marker.count > 1)) return null
  if (marker.profileLink === false) return null
  if (marker.profileTo) {
    return { to: marker.profileTo, label: marker.profileLabel || 'View profile' }
  }

  if (marker.role === 'DRIVER') {
    const driverId = marker.driverId || marker.id
    if (userRole === ROLES.FLEET_OWNER && driverId) {
      return { to: `/drivers/${driverId}/edit`, label: 'View driver profile' }
    }
    if (userRole === ROLES.SUPER_ADMIN && marker.userId) {
      return { to: `/users?user=${marker.userId}`, label: 'View user profile' }
    }
    return null
  }

  if (marker.role === 'ATTORNEY' && userRole === ROLES.SUPER_ADMIN) {
    return { to: `/attorneys/${marker.id}`, label: 'View attorney profile' }
  }

  if (marker.role === 'ORGANIZATION' && userRole === ROLES.SUPER_ADMIN) {
    return { to: `/fleets/onboard?id=${marker.id}`, label: 'Manage organization' }
  }

  if (marker.role === 'SOS') {
    if (userRole === ROLES.SUPER_ADMIN) {
      return { to: `/sos-incidents?id=${marker.id}`, label: 'Open SOS incident' }
    }
    if (userRole === ROLES.FLEET_OWNER && marker.driverId) {
      return { to: `/drivers/${marker.driverId}/edit`, label: 'View driver profile' }
    }
  }

  return null
}

function hoverBadge(marker, roleKey) {
  if (marker?.role === 'SOS' && marker.status && SOS_STATUS_BADGE[marker.status]) {
    return SOS_STATUS_BADGE[marker.status]
  }
  return ROLE_BADGE[roleKey] ?? ROLE_BADGE.CLUSTER
}

function DetailRow({ label, children }) {
  if (children == null || children === '') return null
  return (
    <div className="grid grid-cols-[72px_1fr] gap-2 text-xs leading-snug">
      <span className="font-medium uppercase tracking-wide text-zinc-500">{label}</span>
      <span className="text-zinc-200">{children}</span>
    </div>
  )
}

function MarkerHoverDetails({ marker, isCluster }) {
  if (isCluster) {
    return (
      <p className="text-xs leading-snug text-zinc-400">
        Zoom in to see individual people and places.
      </p>
    )
  }

  // SOS incident map (and live SOS pins): incident-oriented rows.
  if (marker.role === 'SOS') {
    const place =
      marker.location ||
      [marker.street, marker.city, marker.state].filter(Boolean).join(', ') ||
      (Number.isFinite(Number(marker.lat)) && Number.isFinite(Number(marker.lng))
        ? `${Number(marker.lat).toFixed(4)}, ${Number(marker.lng).toFixed(4)}`
        : null)
    const attorney = marker.attorneyAssigned
      ? marker.attorneyName || 'Assigned'
      : marker.attorneyName
        ? marker.attorneyName
        : marker.incidentCode
          ? 'Awaiting dispatch'
          : null
    const reported =
      marker.timeAgo ||
      formatRelativeTime(marker.createdAt || marker.deviceTs || marker.receivedTs)
    const cdl = marker.cdl || marker.cdlNumber

    return (
      <>
        <DetailRow label="Incident">{marker.incidentCode}</DetailRow>
        <DetailRow label="CDL">{cdl && cdl !== 'N/A' ? cdl : null}</DetailRow>
        <DetailRow label="Unit">{marker.unitNumber}</DetailRow>
        <DetailRow label="Fleet">{marker.fleetName}</DetailRow>
        <DetailRow label="Place">{place}</DetailRow>
        <DetailRow label="Counsel">{attorney}</DetailRow>
        <DetailRow label="Reported">{reported}</DetailRow>
        <DetailRow label="Note">{marker.detail || marker.message}</DetailRow>
      </>
    )
  }

  // Intelligence Hub / detention map markers.
  if (
    marker.kind === 'detention' ||
    marker.kind === 'planned' ||
    marker.kind === 'corp' ||
    marker.kind === 'judge' ||
    marker.kind === 'attorney' ||
    marker.source === 'ffi'
  ) {
    return (
      <>
        <DetailRow label="Type">{marker.typeName || marker.typeCode || marker.kind}</DetailRow>
        <DetailRow label="Detail">{marker.detailCode}</DetailRow>
        <DetailRow label="Operator">{marker.op || marker.owner}</DetailRow>
        <DetailRow label="ICE FO">{marker.iceFieldOffice}</DetailRow>
        <DetailRow label="Firm">{marker.firm}</DetailRow>
        <DetailRow label="Circuit">{marker.circuit || marker.federalCircuit}</DetailRow>
        <DetailRow label="Phone">{marker.phone}</DetailRow>
        <DetailRow label="Place">
          {marker.address ||
            [marker.street, marker.city, marker.state].filter(Boolean).join(', ') ||
            marker.hq ||
            marker.court ||
            null}
        </DetailRow>
        <DetailRow label="Note">{marker.subtitle || marker.typeDescription || marker.detail}</DetailRow>
      </>
    )
  }

  const place =
    [marker.street, marker.city, marker.state].filter(Boolean).join(', ') || null
  const speed =
    marker.speed != null && Number.isFinite(Number(marker.speed))
      ? `${Math.round(Number(marker.speed))}`
      : null
  const heading = formatHeading(marker.heading)
  const movement = [speed, heading].filter(Boolean).join(' · ')
  const updated = formatRelativeTime(
    marker.deviceTs || marker.receivedTs || marker.createdAt,
  )
  const status = marker.status
    ? String(marker.status).replaceAll('_', ' ')
    : null
  const title =
    marker.name || marker.title || marker.unitNumber || markerRoleLabel(marker)
  const specialty = Array.isArray(marker.specialties)
    ? marker.specialties.filter(Boolean)[0]
    : marker.specialty

  return (
    <>
      <DetailRow label="Unit">{marker.unitNumber}</DetailRow>
      <DetailRow label="Fleet">{marker.fleetName || marker.organizationName}</DetailRow>
      <DetailRow label="Circuit">{marker.federalCircuit}</DetailRow>
      <DetailRow label="Focus">{specialty}</DetailRow>
      <DetailRow label="Phone">{marker.phone}</DetailRow>
      <DetailRow label="Place">{place}</DetailRow>
      <DetailRow label="Speed">{movement}</DetailRow>
      <DetailRow label="Status">{status}</DetailRow>
      <DetailRow label="Updated">{updated}</DetailRow>
      <DetailRow label="Note">
        {marker.detail || (marker.subtitle && marker.subtitle !== title ? marker.subtitle : null)}
      </DetailRow>
    </>
  )
}

function MarkerHoverCard({ marker, onKeepOpen, onRequestClose }) {
  const { user } = useAuth()
  if (!marker) return null

  const isCluster = typeof marker.count === 'number' && marker.count > 1
  const roleKey = markerRoleKey(marker)
  const badge = hoverBadge(marker, roleKey)
  const title =
    marker.name ||
    marker.title ||
    marker.unitNumber ||
    (isCluster ? `${marker.count} locations nearby` : markerRoleLabel(marker))
  const profile = markerProfileLink(marker, user?.role)
  const footerHint =
    marker.role === 'SOS' && marker.profileLink === false
      ? 'Click pin to open incident'
      : null

  return (
    <div
      className="pointer-events-auto absolute bottom-[calc(100%+8px)] left-1/2 z-30 w-[260px] -translate-x-1/2 overflow-hidden rounded-xl border border-zinc-700/80 bg-zinc-950/95 shadow-xl backdrop-blur-sm"
      onMouseEnter={onKeepOpen}
      onMouseLeave={onRequestClose}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="flex items-start gap-3 px-3 pt-3 pb-2.5">
        {isCluster ? (
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-teal-500/20 text-sm font-bold text-teal-300">
            {marker.count}
          </span>
        ) : marker.avatar ? (
          <img
            src={marker.avatar}
            alt=""
            className="h-10 w-10 shrink-0 rounded-full object-cover ring-1 ring-zinc-700"
          />
        ) : (
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-zinc-800 text-xs font-bold text-zinc-300 ring-1 ring-zinc-700">
            {initialsFromName(title)}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold leading-snug text-white">{title}</p>
          <span
            className={`mt-1 inline-flex rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${badge.className}`}
          >
            {badge.label}
          </span>
        </div>
      </div>

      <div className="space-y-1.5 border-t border-zinc-800/80 px-3 py-2.5">
        <MarkerHoverDetails marker={marker} isCluster={isCluster} />
      </div>

      {profile && (
        <div className="border-t border-zinc-800/80 px-3 py-2">
          <Link
            to={profile.to}
            className="inline-flex w-full items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-xs font-semibold text-cyan-300 transition hover:bg-zinc-800/80 hover:text-cyan-200"
            onClick={(e) => e.stopPropagation()}
          >
            {profile.label}
            <Icon name="chevronRight" size={14} />
          </Link>
        </div>
      )}

      {!profile && footerHint && (
        <div className="border-t border-zinc-800/80 px-3 py-2">
          <p className="text-[11px] font-medium text-zinc-500">{footerHint}</p>
        </div>
      )}
    </div>
  )
}

function useMarkerHover(onMarkerHover) {
  const [hoveredId, setHoveredId] = useState(null)
  const leaveTimer = useRef(null)

  const clearLeave = () => {
    if (leaveTimer.current) {
      clearTimeout(leaveTimer.current)
      leaveTimer.current = null
    }
  }

  useEffect(() => () => clearLeave(), [])

  const enter = (id) => {
    clearLeave()
    setHoveredId(id)
    onMarkerHover?.(id)
  }

  const leave = () => {
    clearLeave()
    leaveTimer.current = setTimeout(() => {
      setHoveredId(null)
      onMarkerHover?.(null)
    }, HOVER_LEAVE_MS)
  }

  return { hoveredId, enter, leave }
}

function PointSvgMarker({ color, isSelected, pulse }) {
  return (
    <div className={`relative flex items-center justify-center transition-transform ${isSelected ? 'scale-[1.3] -translate-y-2' : 'hover:scale-[1.15] hover:-translate-y-1'}`}>
      <svg width="42" height="46" viewBox="0 0 30 33" fill="none" xmlns="http://www.w3.org/2000/svg" className="overflow-visible">
        {pulse && <path className="origin-center animate-ping opacity-25" style={{ fill: color, animationDuration: '2.5s' }} d="M15.1609 0.122986C23.1467 0.122986 29.6208 6.59742 29.6208 14.5829C29.6206 22.5683 23.1466 29.0419 15.1609 29.0419C7.17526 29.0419 0.701142 22.5683 0.700928 14.5829C0.700928 6.59745 7.17513 0.12304 15.1609 0.122986Z" />}
        <circle className="opacity-33" cx="15.1608" cy="14.5822" r="12.8547" fill={color} />
        <circle className="opacity-33" cx="15.161" cy="14.5823" r="11.0482" fill={color} />
        <path d="M23.0002 14.0241C17.6669 14.0288 12.3336 14.0335 7.00025 14.0381C7.13385 14.3505 7.26746 14.6628 7.40107 14.9751C9.806 20.597 12.2109 26.2189 14.6159 31.8408C14.7495 32.1531 14.8831 32.4655 15.0167 32.7778C15.1497 32.4652 15.2828 32.1527 15.4159 31.8401C17.8109 26.214 20.206 20.5879 22.6011 14.9618C22.7341 14.6492 22.8672 14.3367 23.0002 14.0241Z" fill="white" />
        <circle cx="15.0483" cy="14.4723" r="10" fill="white" />
        <circle cx="15.0483" cy="14.4723" r="8" fill={color} />
      </svg>
    </div>
  )
}

function ClusterSvgMarker({ color, count, isSelected }) {
  return (
    <div className={`relative flex items-center justify-center transition-transform ${isSelected ? 'scale-[1.3] -translate-y-2' : 'hover:scale-[1.15] hover:-translate-y-1'}`}>
      <svg width="58" height="62" viewBox="0 0 32 34" fill="none" xmlns="http://www.w3.org/2000/svg" className="overflow-visible">
        {/* Outer animated glow */}
        <path className="origin-center animate-ping opacity-25" style={{ fill: color, animationDuration: '2.5s' }} d="M15.583 0C24.1891 0 31.166 6.97719 31.166 15.583C31.1658 24.1887 24.189 31.165 15.583 31.165C6.97711 31.1649 0.000170906 24.1886 0 15.583C0 6.97725 6.977 9.19656e-05 15.583 0Z" />
        {/* Inner static glow */}
        <circle className="opacity-33" cx="15.5833" cy="15.5829" r="13.8531" fill={color} />
        {/* Pin body */}
        <path d="M26.8142 11.4037C27.2646 12.6651 27.51 14.0241 27.51 15.4404C27.51 16.8566 27.2646 18.2156 26.8142 19.4771C26.5344 20.2607 26.1753 21.0068 25.7468 21.7055C22.998 26.1873 18.1024 29.243 15.471 33.7947C12.892 29.2466 8.04151 26.1866 5.29359 21.7386C4.85603 21.0303 4.49007 20.2731 4.20581 19.4771C3.75537 18.2156 3.51001 16.8566 3.51001 15.4404C3.51001 14.0241 3.75537 12.6651 4.20581 11.4037C5.41284 8.02359 8.09302 5.34341 11.4731 4.13626C12.7346 3.68573 14.0938 3.44037 15.51 3.44037C16.9263 3.44037 18.2854 3.68573 19.5469 4.13626C22.927 5.34341 25.6072 8.02359 26.8142 11.4037Z" fill={color} />
        {/* Inner white circle */}
        <circle cx="15.51" cy="15.4619" r="10" fill="white" />
        {/* Number text */}
        <text x="15.51" y="19.5" fontSize="12" fontWeight="800" textAnchor="middle" fill={color}>{count}</text>
      </svg>
    </div>
  )
}

function CustomZoomControl() {
  const map = useMap()
  const [zoom, setZoom] = useState(4)
  const MIN_ZOOM = 3
  const MAX_ZOOM = 18

  useEffect(() => {
    if (!map) return
    setZoom(map.getZoom() ?? 4)
    const listener = map.addListener('zoom_changed', () => {
      setZoom(map.getZoom() ?? 4)
    })
    return () => {
      if (typeof google !== 'undefined') {
        google.maps.event.removeListener(listener)
      }
    }
  }, [map])

  if (!map) return null

  // Ensure zoom is clamped for percentage calculation to avoid >100% or <0%
  const clampedZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom))
  const percentage = Math.round(((clampedZoom - MIN_ZOOM) / (MAX_ZOOM - MIN_ZOOM)) * 100)

  return (
    <MapControl position={ControlPosition.RIGHT_BOTTOM}>
      <div className="flex items-center gap-4 bg-zinc-900 py-2.5 px-6 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.5)] border border-zinc-800 mb-3 mr-4 pointer-events-auto">
        <span className="text-sm font-medium text-zinc-300 w-8 text-right select-none">{percentage}%</span>
        <button
          onClick={() => map.setZoom(Math.max(MIN_ZOOM, zoom - 1))}
          className="text-zinc-400 hover:text-white flex items-center justify-center text-xl font-light leading-none transition-colors"
        >
          -
        </button>
        <div className="flex items-center">
          <input
            type="range"
            min={MIN_ZOOM}
            max={MAX_ZOOM}
            step="1"
            value={zoom}
            onChange={(e) => map.setZoom(Number(e.target.value))}
            className="w-24 h-1.5 appearance-none bg-zinc-700 rounded-full outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-400 hover:[&::-webkit-slider-thumb]:bg-cyan-300 [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(34,211,238,0.4)] cursor-pointer transition-all"
          />
        </div>
        <button
          onClick={() => map.setZoom(Math.min(MAX_ZOOM, zoom + 1))}
          className="text-zinc-400 hover:text-white flex items-center justify-center text-xl font-light leading-none transition-colors"
        >
          +
        </button>
      </div>
    </MapControl>
  )
}

/**
 * Prefer the densest geographic pocket of markers so one-off outliers
 * don't zoom the camera to continent scale.
 */
function majorityFocusPoints(markers) {
  const points = markers
    .map((m) => ({
      ...m,
      lat: Number(m.lat),
      lng: Number(m.lng),
    }))
    .filter((m) => Number.isFinite(m.lat) && Number.isFinite(m.lng))

  if (points.length <= 4) return points

  const lats = points.map((p) => p.lat)
  const lngs = points.map((p) => p.lng)
  const latSpan = Math.max(...lats) - Math.min(...lats)
  const lngSpan = Math.max(...lngs) - Math.min(...lngs)
  const span = Math.max(latSpan, lngSpan, 0.01)

  // Coarse grid: ~6–8 cells across the spread (clamped for city vs continent).
  const cell = Math.min(2.5, Math.max(0.08, span / 7))
  const cellKey = (lat, lng) =>
    `${Math.floor(lat / cell)}:${Math.floor(lng / cell)}`

  const buckets = new Map()
  for (const p of points) {
    const key = cellKey(p.lat, p.lng)
    if (!buckets.has(key)) buckets.set(key, [])
    buckets.get(key).push(p)
  }

  const ranked = [...buckets.entries()].sort(
    (a, b) => b[1].length - a[1].length,
  )
  const [bestKey] = ranked[0]
  const [bestI, bestJ] = bestKey.split(':').map(Number)

  const selected = new Set()
  // Densest cell + immediate neighbors (Moore neighborhood).
  for (const [key, group] of ranked) {
    const [i, j] = key.split(':').map(Number)
    if (Math.abs(i - bestI) <= 1 && Math.abs(j - bestJ) <= 1) {
      group.forEach((p) => selected.add(p))
    }
  }

  // Grow with next densest cells until we cover most markers.
  const target = Math.ceil(points.length * 0.65)
  for (const [, group] of ranked) {
    if (selected.size >= target) break
    group.forEach((p) => selected.add(p))
  }

  let focused = [...selected]

  // If density is flat (no real cluster), trim farthest outliers from the median.
  if (focused.length >= points.length * 0.9 && points.length >= 8) {
    focused = trimOutliersByMedian(points)
  }

  return focused.length >= 2 ? focused : points
}

function trimOutliersByMedian(points) {
  const median = (values) => {
    const sorted = [...values].sort((a, b) => a - b)
    const mid = Math.floor(sorted.length / 2)
    return sorted.length % 2
      ? sorted[mid]
      : (sorted[mid - 1] + sorted[mid]) / 2
  }

  const medLat = median(points.map((p) => p.lat))
  const medLng = median(points.map((p) => p.lng))
  const ranked = points
    .map((p) => ({
      p,
      d: (p.lat - medLat) ** 2 + (p.lng - medLng) ** 2,
    }))
    .sort((a, b) => a.d - b.d)

  const keep = Math.max(3, Math.ceil(points.length * 0.75))
  return ranked.slice(0, keep).map((row) => row.p)
}

function fitMapToMarkers(map, markers, onSettled) {
  if (!map || !markers.length || typeof google === 'undefined') {
    onSettled?.()
    return
  }

  const points = majorityFocusPoints(markers)
  if (!points.length) {
    onSettled?.()
    return
  }

  if (points.length === 1) {
    map.panTo({ lat: points[0].lat, lng: points[0].lng })
    map.setZoom(SINGLE_MARKER_ZOOM)
    onSettled?.()
    return
  }

  const bounds = new google.maps.LatLngBounds()
  points.forEach((m) => bounds.extend({ lat: m.lat, lng: m.lng }))
  map.fitBounds(bounds, 80)
  // Tight clusters (e.g. one city) can over-zoom; cap after the camera settles.
  google.maps.event.addListenerOnce(map, 'idle', () => {
    const z = map.getZoom()
    if (z != null && z > MAX_FIT_ZOOM) map.setZoom(MAX_FIT_ZOOM)
    onSettled?.()
  })
}

function FitBoundsToMarkers({ markers }) {
  const map = useMap()

  // Create a hash of marker IDs so we only re-fit bounds when the actual locations change
  const markerHash = markers.map(m => m.id).join(',')

  useEffect(() => {
    if (!map || markers.length < 1) return
    fitMapToMarkers(map, markers)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, markerHash])

  return null
}

/** One-shot fit when markers first arrive — does not re-fit on later refreshes. */
function FitBoundsOnce({ markers, onComplete }) {
  const map = useMap()
  const doneRef = useRef(false)
  const onCompleteRef = useRef(onComplete)

  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  useEffect(() => {
    if (!map || doneRef.current || markers.length < 1) return
    doneRef.current = true
    fitMapToMarkers(map, markers, () => onCompleteRef.current?.())
  }, [map, markers])

  return null
}

function PanToSelectedMarker({ markers, selectedId }) {
  const map = useMap()
  const lastSelectedRef = useRef(null)

  useEffect(() => {
    if (!map || !selectedId) return
    // Only pan when the selection changes — not when marker positions refresh.
    if (lastSelectedRef.current === selectedId) return
    lastSelectedRef.current = selectedId

    const marker = markers.find((m) => m.id === selectedId)
    if (!marker) return

    map.panTo({ lat: marker.lat, lng: marker.lng })
    if (map.getZoom() < 13) {
      map.setZoom(13)
    }
  }, [map, markers, selectedId])

  return null
}

function ViewportReporter({ onViewportChange, enabled = true }) {
  const map = useMap()

  useEffect(() => {
    if (!map || !onViewportChange || !enabled) return

    let frameId
    const report = () => {
      cancelAnimationFrame(frameId)
      frameId = requestAnimationFrame(() => {
        const b = map.getBounds()
        if (!b) return
        const ne = b.getNorthEast()
        const sw = b.getSouthWest()
        onViewportChange({
          north: ne.lat(),
          south: sw.lat(),
          east: ne.lng(),
          west: sw.lng(),
          zoom: Math.round(map.getZoom() || 6),
        })
      })
    }

    report()
    const listenerZoom = map.addListener('zoom_changed', report)
    const listenerBounds = map.addListener('bounds_changed', report)
    const listenerIdle = map.addListener('idle', report)
    return () => {
      cancelAnimationFrame(frameId)
      if (typeof google !== 'undefined') {
        google.maps.event.removeListener(listenerZoom)
        google.maps.event.removeListener(listenerBounds)
        google.maps.event.removeListener(listenerIdle)
      }
    }
  }, [map, onViewportChange, enabled])

  return null
}

function ServerClusterMarkers({ markers, selectedId, onMarkerClick, onMarkerHover, showHoverInfo }) {
  const map = useMap()
  const { hoveredId, enter, leave } = useMarkerHover(onMarkerHover)

  return (
    <>
      {markers.map((m) => {
        const tone = m.color?.startsWith('#')
          ? m.color
          : (MARKER_COLORS[m.color] ?? MARKER_COLORS.brand).background
        const isSelected = selectedId === m.id
        const isCluster = typeof m.count === 'number' && m.count > 1
        const isHovered = hoveredId === m.id

        return (
          <AdvancedMarker
            key={m.id}
            position={{ lat: m.lat, lng: m.lng }}
            zIndex={isHovered || isSelected ? 20 : isCluster ? 5 : 1}
            onClick={() => {
              if (isCluster && map) {
                map.panTo({ lat: m.lat, lng: m.lng })
                map.setZoom(Math.min(18, (map.getZoom() || 6) + 2))
                return
              }
              onMarkerClick?.(m.id)
            }}
          >
            <span
              className="relative grid place-items-center cursor-pointer"
              onMouseEnter={() => enter(m.id)}
              onMouseLeave={leave}
            >
              {showHoverInfo && isHovered && (
                <MarkerHoverCard
                  marker={m}
                  onKeepOpen={() => enter(m.id)}
                  onRequestClose={leave}
                />
              )}
              {isCluster ? (
                <ClusterSvgMarker color="#009C94" count={m.count} isSelected={isSelected} />
              ) : (
                <PointSvgMarker color={tone} isSelected={isSelected} pulse={Boolean(m.pulse)} />
              )}
            </span>
          </AdvancedMarker>
        )
      })}
    </>
  )
}

function ClusteredMarkers({ markers, selectedId, onMarkerClick, onMarkerHover, showHoverInfo }) {
  const map = useMap()
  const [zoom, setZoom] = useState(6)
  const [bounds, setBounds] = useState(null)
  const { hoveredId, enter, leave } = useMarkerHover(onMarkerHover)

  const markersById = useMemo(() => {
    const mapById = new Map()
    for (const m of markers) mapById.set(m.id, m)
    return mapById
  }, [markers])

  useEffect(() => {
    if (!map) return
    let timeoutId
    const updateMapState = () => {
      // Use requestAnimationFrame to throttle bounds updates during continuous pan
      cancelAnimationFrame(timeoutId)
      timeoutId = requestAnimationFrame(() => {
        setZoom(map.getZoom() || 6)
        const b = map.getBounds()
        if (b) {
          setBounds([
            b.getSouthWest().lng(),
            b.getSouthWest().lat(),
            b.getNorthEast().lng(),
            b.getNorthEast().lat()
          ])
        }
      })
    }
    updateMapState()
    const listenerZoom = map.addListener('zoom_changed', updateMapState)
    const listenerBounds = map.addListener('bounds_changed', updateMapState)
    const listenerIdle = map.addListener('idle', updateMapState)
    return () => {
      cancelAnimationFrame(timeoutId)
      if (typeof google !== 'undefined') {
        google.maps.event.removeListener(listenerZoom)
        google.maps.event.removeListener(listenerBounds)
        google.maps.event.removeListener(listenerIdle)
      }
    }
  }, [map])

  const { sosMarkers, clusterableMarkers } = useMemo(() => {
    const sos = []
    const rest = []
    for (const m of markers) {
      if (m.role === 'SOS') sos.push(m)
      else rest.push(m)
    }
    return { sosMarkers: sos, clusterableMarkers: rest }
  }, [markers])

  const points = useMemo(() => {
    const usedCoords = new Set()
    return clusterableMarkers.map((m) => {
      let lat = m.lat
      let lng = m.lng

      // Jitter overlapping markers so they don't hide each other at max zoom
      let key = `${lat},${lng}`
      let spiral = 0
      while (usedCoords.has(key)) {
        spiral += 1
        // Increase offset slightly to prevent overlapping at max zoom
        lat += 0.0003 * Math.cos(spiral)
        lng += 0.0003 * Math.sin(spiral)
        key = `${lat},${lng}`
      }
      usedCoords.add(key)

      return {
        type: 'Feature',
        properties: {
          cluster: false,
          markerId: m.id,
          tone: m.color?.startsWith('#') ? m.color : (MARKER_COLORS[m.color] ?? MARKER_COLORS.brand).background,
          pulse: Boolean(m.pulse)
        },
        geometry: { type: 'Point', coordinates: [lng, lat] }
      }
    })
  }, [clusterableMarkers])

  const supercluster = useMemo(() => {
    const sc = new Supercluster({
      radius: 120, // Moderate radius for grouping
      maxZoom: 15, // Keep clustering until deep zoom to prevent visual overlap
      map: (props) => ({ tone: props.tone })
    })
    sc.load(points)
    return sc
  }, [points])

  const clusters = useMemo(() => {
    if (!bounds || !supercluster) return points
    // Fallback to empty array if supercluster throws during rapid panning
    try {
      return supercluster.getClusters(bounds, zoom)
    } catch {
      return []
    }
  }, [bounds, zoom, supercluster, points])

  return (
    <>
      {clusters.map((cluster) => {
        const [lng, lat] = cluster.geometry.coordinates
        const { cluster: isCluster, point_count: pointCount, markerId, tone, pulse } = cluster.properties

        if (isCluster) {
          const clusterMarker = { id: `cluster-${cluster.id}`, count: pointCount }
          const isHovered = hoveredId === clusterMarker.id
          return (
            <AdvancedMarker
              key={`cluster-${cluster.id}`}
              position={{ lat, lng }}
              zIndex={isHovered ? 20 : 5}
              onClick={() => {
                const expansionZoom = supercluster.getClusterExpansionZoom(cluster.id)
                map.setZoom(expansionZoom)
                map.panTo({ lat, lng })
              }}
            >
              <span
                className="relative grid place-items-center cursor-pointer hover:scale-110 transition-transform"
                onMouseEnter={() => enter(clusterMarker.id)}
                onMouseLeave={leave}
              >
                {showHoverInfo && isHovered && (
                  <MarkerHoverCard
                    marker={clusterMarker}
                    onKeepOpen={() => enter(clusterMarker.id)}
                    onRequestClose={leave}
                  />
                )}
                <ClusterSvgMarker color="#009C94" count={pointCount} isSelected={false} />
              </span>
            </AdvancedMarker>
          )
        }

        const isSelected = selectedId === markerId
        const isHovered = hoveredId === markerId
        const source = markersById.get(markerId)
        return (
          <AdvancedMarker
            key={markerId}
            position={{ lat, lng }}
            zIndex={isHovered || isSelected ? 20 : 1}
            onClick={() => onMarkerClick?.(markerId)}
          >
            <span
              className="relative grid place-items-center cursor-pointer"
              onMouseEnter={() => enter(markerId)}
              onMouseLeave={leave}
            >
              {showHoverInfo && isHovered && source && (
                <MarkerHoverCard
                  marker={source}
                  onKeepOpen={() => enter(markerId)}
                  onRequestClose={leave}
                />
              )}
              <PointSvgMarker color={tone} isSelected={isSelected} pulse={pulse} />
            </span>
          </AdvancedMarker>
        )
      })}

      {sosMarkers.map((m) => {
        const tone = m.color?.startsWith('#')
          ? m.color
          : (MARKER_COLORS[m.color] ?? MARKER_COLORS.red).background
        const isSelected = selectedId === m.id
        const isHovered = hoveredId === m.id
        return (
          <AdvancedMarker
            key={`sos-${m.id}`}
            position={{ lat: Number(m.lat), lng: Number(m.lng) }}
            zIndex={isHovered || isSelected ? 30 : 15}
            onClick={() => onMarkerClick?.(m.id)}
          >
            <span
              className="relative grid place-items-center cursor-pointer"
              onMouseEnter={() => enter(m.id)}
              onMouseLeave={leave}
            >
              {showHoverInfo && isHovered && (
                <MarkerHoverCard
                  marker={m}
                  onKeepOpen={() => enter(m.id)}
                  onRequestClose={leave}
                />
              )}
              <PointSvgMarker
                color={tone}
                isSelected={isSelected}
                pulse={m.pulse !== false}
              />
            </span>
          </AdvancedMarker>
        )
      })}
    </>
  )
}

export default function GoogleMapView({
  markers = [],
  center,
  zoom = 6,
  fitBounds = true,
  /**
   * One-shot fit to the first non-empty marker set. Defers viewport reporting
   * until after the fit so live maps can bootstrap without racing an empty camera.
   */
  initialFitBounds = false,
  /** When true, skip client Supercluster and render API cluster/count markers as-is. */
  serverClusters = false,
  /**
   * Client-side Supercluster. Set false on SOS incident map so red pulse pins
   * are not merged into green clusters at continental zoom.
   */
  clusterMarkers = true,
  selectedId,
  onMarkerClick,
  onMarkerHover,
  /** Pin tooltip on hover (name, role, unit, place, etc.). Disable for custom overlays. */
  showHoverInfo = true,
  onViewportChange,
  className = '',
  children,
}) {
  const hasCustomSizing = /(?:^|\s)(?:h-|min-h-)\S/.test(className)
  const sizeClasses = hasCustomSizing ? '' : 'h-full min-h-[420px]'
  const [viewportReady, setViewportReady] = useState(!initialFitBounds)

  // If initial fit never gets markers (empty fleet), unlock viewport after a short wait.
  useEffect(() => {
    if (!initialFitBounds || viewportReady) return
    const timer = setTimeout(() => setViewportReady(true), 2500)
    return () => clearTimeout(timer)
  }, [initialFitBounds, viewportReady])

  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <div
        className={`grid place-items-center rounded-xl border border-zinc-200 bg-map-bg p-6 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 ${sizeClasses} ${className}`}
      >
        Missing VITE_GOOGLE_MAPS_API_KEY — add it to .env.local to enable the live map.
      </div>
    )
  }

  const fallbackCenter =
    center ?? (markers[0] ? { lat: markers[0].lat, lng: markers[0].lng } : { lat: 20, lng: 0 })

  const renderIndividualPins = serverClusters || !clusterMarkers

  return (
    <div className={`relative overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 ${sizeClasses} ${className}`}>
      <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
        <GoogleMap
          mapId="asman-live-map"
          defaultCenter={fallbackCenter}
          defaultZoom={zoom}
          gestureHandling="greedy"
          disableDefaultUI
          colorScheme="DARK"
          style={{ width: '100%', height: '100%' }}
        >
          <CustomZoomControl />
          <ViewportReporter
            onViewportChange={onViewportChange}
            enabled={viewportReady}
          />
          {fitBounds && <FitBoundsToMarkers markers={markers} />}
          {initialFitBounds && !viewportReady && (
            <FitBoundsOnce
              markers={markers}
              onComplete={() => setViewportReady(true)}
            />
          )}
          <PanToSelectedMarker markers={markers} selectedId={selectedId} />
          {renderIndividualPins ? (
            <ServerClusterMarkers
              markers={markers}
              selectedId={selectedId}
              onMarkerClick={onMarkerClick}
              onMarkerHover={onMarkerHover}
              showHoverInfo={showHoverInfo}
            />
          ) : (
            <ClusteredMarkers
              markers={markers}
              selectedId={selectedId}
              onMarkerClick={onMarkerClick}
              onMarkerHover={onMarkerHover}
              showHoverInfo={showHoverInfo}
            />
          )}
        </GoogleMap>
      </APIProvider>
      {children}
    </div>
  )
}
