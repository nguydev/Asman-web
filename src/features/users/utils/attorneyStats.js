/**
 * Normalize attorney case volume + win rate from remote (Parkealo) and
 * local platform Case rows so hubs, list, profile, and modals stay consistent.
 */
export function getAttorneyCaseStats(attorney) {
  const a = attorney || {}
  const remoteTotal = Number(a.remoteTotalCases) || 0
  const remoteWon = Number(a.remoteWonCases) || 0
  const remoteLost = Number(a.remoteLostCases) || 0
  const remotePending = Number(a.remotePendingCases) || 0
  const platformTotal =
    Number(a.totalCases) || Number(a._count?.cases) || 0
  const platformWins = Number(a.winCases) || 0

  const useRemote = remoteTotal > 0
  const total = useRemote ? remoteTotal : platformTotal
  const wins = useRemote ? remoteWon : platformWins
  const lost = useRemote ? remoteLost : 0
  const pending = useRemote ? remotePending : 0

  let ratePct = 0
  if (useRemote && typeof a.remoteWinRate === 'number') {
    ratePct = Math.round(a.remoteWinRate * 100)
  } else if (a.winRate != null && a.winRate !== '') {
    const n = Number(a.winRate)
    if (Number.isFinite(n)) {
      // Accept either 0–1 fraction or 0–100 percentage.
      ratePct = n > 0 && n <= 1 ? Math.round(n * 100) : Math.round(n)
    }
  } else if (total > 0) {
    ratePct = Math.round((wins / total) * 100)
  }

  ratePct = Math.max(0, Math.min(100, ratePct))

  return {
    total,
    wins,
    lost,
    pending,
    ratePct,
    rateLabel: `${ratePct}%`,
    source: useRemote ? 'remote' : 'platform',
    platformTotal,
    platformWins,
    hasCases: total > 0,
  }
}
