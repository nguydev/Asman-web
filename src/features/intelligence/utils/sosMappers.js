/** Backend IncidentAlertStatus values */
export const SOS_STATUS = {
  OPEN: 'OPEN',
  ACKNOWLEDGED: 'ACKNOWLEDGED',
  RESOLVED: 'RESOLVED',
}

/** Backend IncidentAlertType values */
export const SOS_TYPE = {
  SOS: 'SOS',
  DETENTION: 'DETENTION',
}

export const STATUS_LABELS = {
  OPEN: 'Open',
  ACKNOWLEDGED: 'Acknowledged',
  RESOLVED: 'Resolved',
}

export const TYPE_LABELS = {
  SOS: 'SOS',
  DETENTION: 'Detention',
}

export const STATUS_STYLES = {
  OPEN: 'bg-red-600 text-white',
  ACKNOWLEDGED: 'bg-amber-500/15 text-amber-700 dark:text-amber-400',
  RESOLVED: 'bg-green-500/15 text-green-600 dark:text-green-400',
}

export const TIME_BADGE_STYLES = {
  OPEN: 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400',
  ACKNOWLEDGED: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
  RESOLVED: 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400',
}

export const QUEUE_ACCENT = {
  OPEN: 'from-red-500 to-red-500/40',
  ACKNOWLEDGED: 'from-amber-500 to-amber-500/40',
  RESOLVED: 'from-green-500 to-green-500/40',
}

export const TIMELINE_DOT = {
  RECEIVED: 'border-red-500',
  ACKNOWLEDGED: 'border-zinc-400 dark:border-zinc-500',
  RESOLVED: 'border-green-500',
}

/** Parse Prisma Decimal / string / number into a finite number. */
export function parseCoordinate(val) {
  if (val == null) return null
  if (typeof val === 'number') return Number.isFinite(val) ? val : null
  if (typeof val === 'string') {
    const n = parseFloat(val)
    return Number.isFinite(n) ? n : null
  }
  // Rare binary Decimal shape from some serializers
  if (val.d && Array.isArray(val.d)) {
    let digits = val.d[0].toString()
    for (let i = 1; i < val.d.length; i++) {
      digits += val.d[i].toString().padStart(7, '0')
    }
    const e = val.e !== undefined ? val.e : 0
    const decimalPos = e + 1
    let resStr = ''
    if (decimalPos <= 0) {
      resStr = '0.' + '0'.repeat(-decimalPos) + digits
    } else if (decimalPos >= digits.length) {
      resStr = digits + '0'.repeat(decimalPos - digits.length)
    } else {
      resStr = digits.slice(0, decimalPos) + '.' + digits.slice(decimalPos)
    }
    const n = parseFloat((val.s === -1 ? '-' : '') + resStr)
    return Number.isFinite(n) ? n : null
  }
  const n = Number(val)
  return Number.isFinite(n) ? n : null
}

function formatClock(iso) {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return ''
  }
}

function formatWhen(iso) {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return ''
  }
}

/**
 * Normalize a raw API incident (with withUiFields) into UI shape.
 */
export function mapSosIncident(inc) {
  if (!inc || typeof inc !== 'object') return null

  const driver = inc.driver
  const profile = driver?.user?.profile
  const name =
    (profile?.name && String(profile.name).trim()) ||
    driver?.user?.email ||
    'Unknown Driver'

  const status = SOS_STATUS[inc.status] ? inc.status : SOS_STATUS.OPEN
  const type = SOS_TYPE[inc.type] ? inc.type : SOS_TYPE.SOS

  const lat = parseCoordinate(inc.lat)
  const lon = parseCoordinate(inc.lon)
  const hasCoords = lat != null && lon != null

  const orgs = Array.isArray(driver?.organizationMembers)
    ? driver.organizationMembers
        .map((m) => m.organization?.name || m.organizationId)
        .filter(Boolean)
    : []

  const attorney = inc.assignedAttorney
    ? {
        assigned: true,
        id: inc.assignedAttorney.id,
        name: inc.assignedAttorney.name || 'Attorney',
        photo: inc.assignedAttorney.avatarUrl || '',
        email: inc.assignedAttorney.email || '',
      }
    : { assigned: false }

  const caseId = inc.caseId || inc.case?.id || null

  const timeline = Array.isArray(inc.timeline)
    ? inc.timeline.map((t) => ({
        type: t.type,
        tone: t.type || 'ACKNOWLEDGED',
        time: formatClock(t.at),
        at: t.at,
        title: t.message,
        detail:
          t.type === 'RECEIVED' && inc.message ? String(inc.message) : '',
      }))
    : []

  const acknowledgedByName =
    inc.acknowledgedBy?.profile?.name ||
    inc.acknowledgedBy?.email ||
    null

  return {
    id: inc.id,
    incidentCode: 'INC-' + String(inc.id).split('-')[0].toUpperCase(),
    status,
    type,
    statusLabel: STATUS_LABELS[status],
    typeLabel: TYPE_LABELS[type],
    name,
    cdl: driver?.cdlNumber || 'N/A',
    photo: profile?.avatarUrl || '',
    driverId: inc.driverId || driver?.id || null,
    message: inc.message || null,
    location: hasCoords
      ? `${lat.toFixed(4)}, ${lon.toFixed(4)}`
      : 'Location unknown',
    coords: hasCoords ? { lat, lng: lon } : null,
    timeAgo: formatClock(inc.createdAt),
    createdAtLabel: formatWhen(inc.createdAt),
    createdAt: inc.createdAt || null,
    acknowledgedAt: inc.acknowledgedAt || null,
    resolvedAt: inc.resolvedAt || null,
    acknowledgedByName,
    organizationNames: orgs,
    organizationIds: Array.isArray(inc.organizationIds)
      ? inc.organizationIds
      : [],
    attorney,
    caseId,
    timeline,
  }
}

/** Extract incident array from a list API response (axios response or body). */
export function extractIncidentList(res) {
  const body = res?.data ?? res
  const payload = body?.data ?? body
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.items)) return payload.items
  return []
}

/** Extract a single incident payload from get-by-id response. */
export function extractIncident(res) {
  const body = res?.data ?? res
  const payload = body?.data ?? body
  if (payload && typeof payload === 'object' && payload.id) return payload
  return null
}

export function extractAttorneyList(res) {
  // attorneyService.getAttorneys returns response.data already
  const payload = res?.data ?? res
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.items)) return payload.items
  return []
}

export function apiErrorMessage(err, fallback = 'Something went wrong') {
  const data = err?.response?.data
  if (!data) return err?.message || fallback
  if (typeof data.message === 'string') return data.message
  if (Array.isArray(data.message)) return data.message.join(', ')
  if (typeof data.error === 'string') return data.error
  return fallback
}

/** Unresolved first (OPEN → ACKNOWLEDGED → RESOLVED), then newest createdAt. */
export function sortIncidentsForQueue(incidents) {
  const rank = {
    [SOS_STATUS.OPEN]: 0,
    [SOS_STATUS.ACKNOWLEDGED]: 1,
    [SOS_STATUS.RESOLVED]: 2,
  }
  return [...incidents].sort((a, b) => {
    const statusDiff = (rank[a.status] ?? 9) - (rank[b.status] ?? 9)
    if (statusDiff !== 0) return statusDiff
    const aTime = Date.parse(a.createdAt || 0) || 0
    const bTime = Date.parse(b.createdAt || 0) || 0
    return bTime - aTime
  })
}

