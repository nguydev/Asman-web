import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchDetentionCenters } from '../api/ffiService.js'

/**
 * Live detention centers from Freedom for Immigrants map GraphQL API
 * (https://map.freedomforimmigrants.org/map).
 */
export function useFfiDetentionCenters() {
  const query = useQuery({
    queryKey: ['ffi-detention-centers'],
    queryFn: fetchDetentionCenters,
    staleTime: 5 * 60_000,
    retry: 1,
  })

  const centers = useMemo(() => query.data ?? [], [query.data])

  const counts = useMemo(() => {
    const next = {
      total: centers.length,
      dedicated: 0,
      igsa: 0,
      usms: 0,
      federal: 0,
      other: 0,
    }
    for (const c of centers) {
      if (next[c.bucket] != null) next[c.bucket] += 1
      else next.other += 1
    }
    return next
  }, [centers])

  return {
    centers,
    counts,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
  }
}
