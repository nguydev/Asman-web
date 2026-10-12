import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { attorneyService } from '../api/services/attorneyService.js'
import { attorneyAdmin } from '../data/mockData.js'
import { getAttorneyCaseStats } from '../features/users/utils/attorneyStats.js'

/** Normalize Asman attorney API rows for Intelligence Hub UI. */
export function mapIntelAttorney(a) {
  const stats = getAttorneyCaseStats(a)

  const lat = a.address?.latitude != null ? Number(a.address.latitude) : null
  const lng = a.address?.longitude != null ? Number(a.address.longitude) : null

  return {
    id: a.id,
    name: a.name || 'Unknown attorney',
    firm:
      (Array.isArray(a.specialties) && a.specialties[0]) ||
      a.firm ||
      (Array.isArray(a.courts) && a.courts[0]) ||
      a.email ||
      'Immigration counsel',
    circuit: a.federalCircuit || '—',
    wins: stats.wins,
    lost: stats.lost,
    pending: stats.pending,
    total: stats.total,
    rate: stats.ratePct,
    specs: Array.isArray(a.specialties) ? a.specialties.join(', ') : '',
    avatarUrl: a.avatarUrl || a.photo || null,
    phone: a.phone || null,
    states: Array.isArray(a.states) ? a.states : [],
    lat: Number.isFinite(lat) ? lat : null,
    lng: Number.isFinite(lng) ? lng : null,
    verified: Boolean(a.verified),
    source: stats.source,
  }
}

function apiHasCaseVolume(list) {
  return list.some((a) => getAttorneyCaseStats(a).total > 0)
}

/**
 * Attorneys for Intelligence Hub.
 * Prefers live API; falls back to hardcoded attorneyAdmin when the API
 * has no case-volume data yet (e.g. before Parkealo import).
 */
export function useIntelAttorneys({ limit = 100 } = {}) {
  const query = useQuery({
    queryKey: ['intel-attorneys', limit],
    queryFn: async () => {
      const res = await attorneyService.getAttorneys({
        page: 1,
        limit,
        sortBy: 'remoteTotalCases',
        sortOrder: 'desc',
      })
      return Array.isArray(res?.data) ? res.data : []
    },
    staleTime: 60_000,
  })

  const attorneys = useMemo(() => {
    const apiRows = query.data ?? []
    const source = apiHasCaseVolume(apiRows) ? apiRows : attorneyAdmin
    const mapped = source.map(mapIntelAttorney)
    return [...mapped]
      .sort(
        (a, b) =>
          b.total - a.total || b.rate - a.rate || a.name.localeCompare(b.name),
      )
      .slice(0, limit)
  }, [query.data, limit])

  return {
    attorneys,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    total: attorneys.length,
    usingMock: !apiHasCaseVolume(query.data ?? []),
  }
}
