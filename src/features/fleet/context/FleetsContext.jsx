import { createContext, useContext, useMemo, useState } from 'react'
import { fleetPartners } from '../../../data/mockData.js'

// Shared fleet-partner store so the Company Directory (Fleets) and the
// Partner Onboarding form stay in sync across route changes. In a real app
// this would be backed by an API; here it's in-memory, seeded from mock data.
const FleetsContext = createContext(null)

export function FleetsProvider({ children }) {
  const [partners, setPartners] = useState(fleetPartners)

  const addPartner = (partner) => setPartners((prev) => [partner, ...prev])

  const updatePartner = (id, updates) =>
    setPartners((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    )

  const value = useMemo(
    () => ({ partners, addPartner, updatePartner }),
    [partners]
  )

  return <FleetsContext.Provider value={value}>{children}</FleetsContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useFleets() {
  const ctx = useContext(FleetsContext)
  if (!ctx) throw new Error('useFleets must be used within a FleetsProvider')
  return ctx
}
