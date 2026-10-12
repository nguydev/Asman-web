import { useMemo, useRef, useState, useEffect } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { mapService } from '../api/services/mapService.js'
import { useSocket } from '../context/SocketContext.jsx'

const ROLE_COLOR = {
  DRIVER_LIVE: 'green',
  DRIVER_LAST: 'slate',
  ATTORNEY: 'blue',
  ORGANIZATION: 'purple',
  SOS: 'red',
}

/** Near-global bounds at zoom ≥ 10 so the API returns markers (not clusters) for initial fit. */
export const MAP_BOOTSTRAP_VIEWPORT = {
  north: 85,
  south: -85,
  east: 179.9,
  west: -179.9,
  zoom: 12,
}

/**
 * REST snapshot for the current viewport (initial + pan/zoom).
 * Live driver / SOS updates come from the location socket — no polling.
 *
 * When `viewport` is null, queries a world bootstrap so markers exist
 * before the map camera has focused on real locations.
 */
export function useMapLocations(viewport) {
  const { liveDrivers, liveSosAlerts } = useSocket()
  const [debouncedViewport, setDebouncedViewport] = useState(
    () => viewport ?? MAP_BOOTSTRAP_VIEWPORT,
  )
  const timerRef = useRef(null)

  useEffect(() => {
    if (!viewport) return
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setDebouncedViewport(viewport), 350)
    return () => clearTimeout(timerRef.current)
  }, [viewport])

  const { data, isLoading, isFetching, isPlaceholderData, error } = useQuery({
    queryKey: [
      'map-locations',
      debouncedViewport?.north,
      debouncedViewport?.south,
      debouncedViewport?.east,
      debouncedViewport?.west,
      debouncedViewport?.zoom,
    ],
    queryFn: async () => {
      const res = await mapService.getLocations(debouncedViewport)
      return res.data?.data ?? res.data ?? { clusters: [], markers: [] }
    },
    enabled: Boolean(debouncedViewport),
    staleTime: Infinity,
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })

  const apiMarkers = data?.markers ?? []
  const apiClusters = data?.clusters ?? []
  const zoom = debouncedViewport?.zoom ?? 0
  const useClusters = zoom < 10 && apiClusters.length > 0

  const markers = useMemo(() => {
    if (useClusters) {
      return apiClusters.map((c, i) => ({
        id: `cluster-${c.lat.toFixed(4)}-${c.lng.toFixed(4)}-${i}`,
        lat: c.lat,
        lng: c.lng,
        count: c.count ?? c.drivers ?? 1,
        color: 'green',
      }))
    }

    const byId = new Map()

    for (const m of apiMarkers) {
      const id = m.id ?? m.driverId
      if (!id || m.lat == null || m.lng == null) continue

      const role = m.role ?? 'DRIVER'
      let color = ROLE_COLOR.DRIVER_LAST
      if (role === 'DRIVER') {
        color =
          m.fleetColor ||
          (m.live ? ROLE_COLOR.DRIVER_LIVE : ROLE_COLOR.DRIVER_LAST)
      } else if (role === 'ATTORNEY') {
        color = ROLE_COLOR.ATTORNEY
      } else if (role === 'ORGANIZATION') {
        color = ROLE_COLOR.ORGANIZATION
      } else if (role === 'SOS') {
        color = ROLE_COLOR.SOS
      }

      byId.set(id, {
        id,
        lat: m.lat,
        lng: m.lng,
        color,
        role,
        live: Boolean(m.live),
        name: m.name ?? null,
        avatar: m.avatar ?? null,
        driverId: m.driverId ?? (role === 'DRIVER' ? id : null),
        userId: m.userId ?? null,
        unitNumber: m.unitNumber ?? null,
        fleetId: m.fleetId ?? null,
        fleetName: m.fleetName ?? null,
        fleetColor: m.fleetColor ?? null,
        organizationName: m.organizationName ?? null,
        phone: m.phone ?? null,
        street: m.street ?? null,
        federalCircuit: m.federalCircuit ?? null,
        specialty: m.specialty ?? null,
        specialties: m.specialties ?? null,
        cdl: m.cdl ?? m.cdlNumber ?? null,
        city: m.city ?? null,
        state: m.state ?? null,
        detail: m.detail ?? null,
        status: m.status ?? null,
        heading: m.heading,
        speed: m.speed,
        deviceTs: m.deviceTs ?? null,
        receivedTs: m.receivedTs ?? null,
        createdAt: m.createdAt ?? null,
        pulse: role === 'SOS' || (role === 'DRIVER' && Boolean(m.live)),
      })
    }

    if (liveDrivers?.size) {
      liveDrivers.forEach((live, driverId) => {
        const lng = live.lon ?? live.lng
        if (live.lat == null || lng == null) return

        if (debouncedViewport) {
          const { north, south, east, west } = debouncedViewport
          if (live.lat > north || live.lat < south || lng > east || lng < west) {
            return
          }
        }

        const existing = byId.get(driverId)
        byId.set(driverId, {
          id: driverId,
          lat: live.lat,
          lng,
          color: existing?.fleetColor || ROLE_COLOR.DRIVER_LIVE,
          role: 'DRIVER',
          live: true,
          name: existing?.name ?? null,
          avatar: existing?.avatar ?? null,
          driverId,
          userId: existing?.userId ?? null,
          unitNumber: existing?.unitNumber ?? null,
          fleetId: existing?.fleetId ?? null,
          fleetName: existing?.fleetName ?? null,
          fleetColor: existing?.fleetColor ?? null,
          organizationName: existing?.organizationName ?? null,
          phone: existing?.phone ?? null,
          street: existing?.street ?? null,
          federalCircuit: existing?.federalCircuit ?? null,
          specialty: existing?.specialty ?? null,
          specialties: existing?.specialties ?? null,
          cdl: existing?.cdl ?? null,
          city: existing?.city ?? null,
          state: existing?.state ?? null,
          detail: existing?.detail ?? null,
          status: existing?.status ?? null,
          heading: live.heading ?? existing?.heading,
          speed: live.speed ?? existing?.speed,
          deviceTs: live.deviceTs ?? existing?.deviceTs ?? null,
          receivedTs: live.receivedTs ?? existing?.receivedTs ?? null,
          createdAt: existing?.createdAt ?? null,
          pulse: true,
        })
      })
    }

    if (liveSosAlerts?.size) {
      liveSosAlerts.forEach((alert, alertId) => {
        if (alert.lat == null || alert.lng == null) return

        if (debouncedViewport) {
          const { north, south, east, west } = debouncedViewport
          if (
            alert.lat > north ||
            alert.lat < south ||
            alert.lng > east ||
            alert.lng < west
          ) {
            return
          }
        }

        const existing = byId.get(alertId)
        byId.set(alertId, {
          id: alertId,
          lat: alert.lat,
          lng: alert.lng,
          color: ROLE_COLOR.SOS,
          role: 'SOS',
          live: true,
          name: alert.name ?? existing?.name ?? null,
          avatar: alert.avatar ?? existing?.avatar ?? null,
          driverId: alert.driverId ?? existing?.driverId ?? null,
          userId: alert.userId ?? existing?.userId ?? null,
          unitNumber: alert.unitNumber ?? existing?.unitNumber ?? null,
          fleetId: alert.fleetId ?? existing?.fleetId ?? null,
          fleetName: alert.fleetName ?? existing?.fleetName ?? null,
          fleetColor: existing?.fleetColor ?? null,
          organizationName: existing?.organizationName ?? null,
          phone: existing?.phone ?? null,
          street: existing?.street ?? null,
          cdl: alert.cdl ?? alert.cdlNumber ?? existing?.cdl ?? null,
          city: existing?.city ?? null,
          state: existing?.state ?? null,
          detail: alert.detail ?? existing?.detail ?? null,
          status: alert.status ?? existing?.status ?? 'OPEN',
          deviceTs: existing?.deviceTs ?? null,
          receivedTs: existing?.receivedTs ?? null,
          createdAt: alert.createdAt ?? existing?.createdAt ?? null,
          pulse: true,
        })
      })
    }

    return Array.from(byId.values())
  }, [
    useClusters,
    apiClusters,
    apiMarkers,
    liveDrivers,
    liveSosAlerts,
    debouncedViewport,
  ])

  const counts = useMemo(() => {
    if (useClusters) {
      const total = apiClusters.reduce(
        (sum, c) => sum + (c.count ?? c.drivers ?? 0),
        0,
      )
      return {
        total,
        driversLive: 0,
        driversLast: 0,
        attorneys: 0,
        organizations: 0,
        sos: 0,
      }
    }

    let driversLive = 0
    let driversLast = 0
    let attorneys = 0
    let organizations = 0
    let sos = 0

    for (const m of markers) {
      if (m.role === 'DRIVER') {
        if (m.live) driversLive += 1
        else driversLast += 1
      } else if (m.role === 'ATTORNEY') attorneys += 1
      else if (m.role === 'ORGANIZATION') organizations += 1
      else if (m.role === 'SOS') sos += 1
    }

    return {
      total: markers.length,
      driversLive,
      driversLast,
      attorneys,
      organizations,
      sos,
    }
  }, [useClusters, apiClusters, markers])

  return {
    markers,
    isClustered: useClusters,
    counts,
    driverCount: counts.driversLive + counts.driversLast,
    /** True only on the first load with no data yet — not during background refreshes. */
    isLoading: isLoading && !data,
    isFetching,
    isPlaceholderData,
    error,
  }
}
