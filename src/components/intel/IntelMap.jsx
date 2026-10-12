import { useState, useMemo } from 'react'
import GoogleMapView from '../GoogleMapView.jsx'
import {
  DW_FACILITIES,
  DW_CORPS,
  DW_JUDGES,
} from '../../data/detentionWatchData.js'
import { useIntelAttorneys } from '../../hooks/useIntelAttorneys.js'
import { useFfiDetentionCenters } from '../../hooks/useFfiDetentionCenters.js'

const DEFAULT_LAYERS = {
  detention: true,
  planned: true,
  corps: true,
  judges: true,
  attorneys: false,
}

/** Continental US framing for the intelligence map. */
const US_CENTER = { lat: 39.5, lng: -98.35 }
const US_ZOOM = 4

function HoverDetail({ label, children }) {
  if (children == null || children === '') return null
  return (
    <div className="grid grid-cols-[64px_1fr] gap-x-2 gap-y-0.5 text-xs leading-snug">
      <span className="font-semibold uppercase tracking-wide text-zinc-500">{label}</span>
      <span className="text-zinc-700 dark:text-zinc-200">{children}</span>
    </div>
  )
}

export default function IntelMap({
  layers = DEFAULT_LAYERS,
  activeCapacities,
}) {
  const [selectedId, setSelectedId] = useState(null)
  const [hoveredId, setHoveredId] = useState(null)
  const { attorneys } = useIntelAttorneys({ limit: 120 })
  const { centers, isLoading, error } = useFfiDetentionCenters()

  const markers = useMemo(() => {
    const next = []

    if (layers.detention) {
      centers.forEach((f) => {
        if (activeCapacities && activeCapacities[f.bucket] === false) return
        if (f.lat == null || f.lng == null) return
        next.push({
          id: f.id,
          lat: f.lat,
          lng: f.lng,
          color: f.color,
          kind: 'detention',
          source: 'ffi',
          name: f.name,
          title: f.name,
          address: f.address,
          phone: f.phone,
          website: f.website,
          op: f.op,
          owner: f.owner,
          typeName: f.typeName,
          typeCode: f.typeCode,
          detailCode: f.detailCode,
          typeDescription: f.typeDescription,
          iceFieldOffice: f.iceFieldOffice,
          iceFieldOfficeAddress: f.iceFieldOfficeAddress,
          subtitle: [f.typeName || f.typeCode, f.op].filter(Boolean).join(' · '),
        })
      })
    }

    if (layers.planned && (!activeCapacities || activeCapacities.planned)) {
      DW_FACILITIES.filter((f) => f.status === 'planned').forEach((f) => {
        if (f.lat == null || f.lng == null) return
        next.push({
          id: f.id,
          lat: f.lat,
          lng: f.lng,
          color: '#f59e0b',
          kind: 'planned',
          name: f.name,
          title: f.name,
          typeName: 'Planned facility',
          city: f.city,
          state: f.state,
          op: f.op,
          address: [f.city, f.state].filter(Boolean).join(', '),
          subtitle: `PLANNED — ${f.city}, ${f.state}`,
          detail: f.note || null,
        })
      })
    }

    if (layers.corps && (!activeCapacities || activeCapacities.corps)) {
      DW_CORPS.forEach((corp) => {
        if (corp.lat == null || corp.lng == null) return
        next.push({
          id: corp.id,
          lat: corp.lat,
          lng: corp.lng,
          color: '#8b5cf6',
          kind: 'corp',
          name: corp.name,
          title: corp.name,
          typeName: 'Corporate HQ',
          hq: corp.hq,
          address: corp.hq,
          subtitle: `HQ: ${corp.hq} · Profit: ${corp.profit}`,
          detail: corp.desc || null,
        })
      })
    }

    if (layers.judges) {
      DW_JUDGES.forEach((j) => {
        if (j.lat == null || j.lng == null) return
        next.push({
          id: j.id,
          lat: j.lat,
          lng: j.lng,
          color: '#3b82f6',
          kind: 'judge',
          name: j.name,
          title: j.name,
          typeName: 'Immigration Judge',
          court: j.court,
          circuit: j.circuit,
          address: j.court,
          subtitle: `${j.court} · Grant ${j.approve}% / Deny ${j.deny}%`,
          detail: j.note || `Cases: ${j.cases?.toLocaleString?.() || j.cases}`,
        })
      })
    }

    if (layers.attorneys) {
      attorneys.forEach((a) => {
        if (a.lat == null || a.lng == null) return
        next.push({
          id: a.id,
          lat: a.lat,
          lng: a.lng,
          color: '#ec4899',
          kind: 'attorney',
          name: a.name,
          title: a.name,
          typeName: 'HC Attorney',
          firm: a.firm,
          circuit: a.circuit,
          phone: a.phone,
          subtitle: `${a.firm} · ${a.circuit}${a.circuit !== '—' ? ' Circuit' : ''} · ${a.rate}% win · ${a.total} cases`,
          detail: a.specs || null,
          profileTo: `/attorneys/${a.id}`,
          profileLabel: 'View attorney profile',
        })
      })
    }

    return next
  }, [layers, activeCapacities, attorneys, centers])

  const activeMarkerId = hoveredId || selectedId
  const activeMarker = markers.find((m) => m.id === activeMarkerId)

  return (
    <GoogleMapView
      markers={markers}
      center={US_CENTER}
      zoom={US_ZOOM}
      fitBounds={false}
      serverClusters
      selectedId={selectedId}
      onMarkerClick={setSelectedId}
      onMarkerHover={setHoveredId}
      showHoverInfo
      className="h-full w-full"
    >
      {isLoading && (
        <div className="absolute left-4 top-4 z-10 rounded-lg bg-white/95 px-3 py-2 text-xs font-medium text-zinc-600 shadow dark:bg-zinc-900/95 dark:text-zinc-300">
          Loading Freedom for Immigrants facilities…
        </div>
      )}
      {error && !isLoading && (
        <div className="absolute left-4 top-4 z-10 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700 shadow dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-300">
          Could not load FFI detention data
        </div>
      )}

      {activeMarker && (
        <div className="pointer-events-none absolute bottom-4 left-4 z-10 w-[300px] rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 p-4 shadow-xl backdrop-blur-sm">
          {selectedId === activeMarker.id && (
            <button
              type="button"
              onClick={() => setSelectedId(null)}
              className="pointer-events-auto absolute top-2 right-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-white transition-colors"
            >
              ✕
            </button>
          )}
          <div className="pr-5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              {activeMarker.kind === 'detention'
                ? 'Detention facility'
                : activeMarker.kind === 'planned'
                  ? 'Planned site'
                  : activeMarker.kind === 'corp'
                    ? 'Corporation'
                    : activeMarker.kind === 'judge'
                      ? 'Immigration judge'
                      : activeMarker.kind === 'attorney'
                        ? 'Attorney'
                        : 'Location'}
            </p>
            <p className="mt-1 text-sm font-semibold leading-snug text-zinc-900 dark:text-white">
              {activeMarker.title || activeMarker.name}
            </p>
          </div>

          <div className="mt-3 space-y-1.5 border-t border-zinc-100 pt-3 dark:border-zinc-800">
            <HoverDetail label="Type">
              {activeMarker.typeName || activeMarker.typeCode}
              {activeMarker.typeCode && activeMarker.typeName
                ? ` (${activeMarker.typeCode})`
                : null}
            </HoverDetail>
            <HoverDetail label="Detail">{activeMarker.detailCode}</HoverDetail>
            <HoverDetail label="Operator">{activeMarker.op || activeMarker.owner}</HoverDetail>
            <HoverDetail label="ICE FO">{activeMarker.iceFieldOffice}</HoverDetail>
            <HoverDetail label="Firm">{activeMarker.firm}</HoverDetail>
            <HoverDetail label="Circuit">{activeMarker.circuit}</HoverDetail>
            <HoverDetail label="Court">{activeMarker.court}</HoverDetail>
            <HoverDetail label="Phone">{activeMarker.phone}</HoverDetail>
            <HoverDetail label="Place">
              {activeMarker.address || activeMarker.hq}
            </HoverDetail>
            <HoverDetail label="About">
              {activeMarker.typeDescription || activeMarker.detail}
            </HoverDetail>
          </div>

          {activeMarker.website && (
            <a
              href={activeMarker.website}
              target="_blank"
              rel="noopener noreferrer"
              className="pointer-events-auto mt-3 inline-block text-xs font-semibold text-brand hover:underline dark:text-brand-dark"
            >
              Facility website →
            </a>
          )}
          {activeMarker.source === 'ffi' && (
            <p className="mt-2 text-[10px] uppercase tracking-wide text-zinc-400">
              Freedom for Immigrants
            </p>
          )}
        </div>
      )}
    </GoogleMapView>
  )
}
