import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import Icon from './common/Icon.jsx'

function driverLabel(alert) {
  const profile = alert?.driver?.user?.profile
  const name =
    (profile?.name && String(profile.name).trim()) ||
    (alert?.triggeredBy?.profile?.name &&
      String(alert.triggeredBy.profile.name).trim()) ||
    (alert?.name && String(alert.name).trim()) ||
    (alert?.driverName && String(alert.driverName).trim()) ||
    alert?.driver?.user?.email ||
    alert?.triggeredBy?.email ||
    null
  return name || 'Unknown driver'
}

function driverAvatar(alert) {
  return (
    alert?.driver?.user?.profile?.avatarUrl ||
    alert?.triggeredBy?.profile?.avatarUrl ||
    alert?.avatar ||
    alert?.avatarUrl ||
    null
  )
}

function alertMessage(alert) {
  return alert?.message || alert?.body || 'Driver needs immediate help.'
}

function alertType(alert) {
  const type = String(alert?.type || 'SOS').toUpperCase()
  return type === 'DETENTION' ? 'Detention' : 'SOS'
}

function coordsLabel(alert) {
  const lat =
    alert?.lat != null
      ? Number(alert.lat)
      : alert?.latitude != null
        ? Number(alert.latitude)
        : null
  const lng =
    alert?.lon != null
      ? Number(alert.lon)
      : alert?.lng != null
        ? Number(alert.lng)
        : alert?.longitude != null
          ? Number(alert.longitude)
          : null
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
  return `${lat.toFixed(5)}, ${lng.toFixed(5)}`
}

function alertKey(alert, index) {
  return alert?.id || `sos-${index}-${alert?.driverId || 'x'}`
}

function LiveDot() {
  return (
    <span className="relative flex h-2 w-2">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
    </span>
  )
}

export default function SosAlertStack({ alerts, onDismiss, onDismissAll }) {
  const navigate = useNavigate()
  const list = Array.isArray(alerts) ? alerts : []
  const total = list.length
  const front = list[0]

  useEffect(() => {
    if (total === 0) return undefined

    const onKeyDown = (e) => {
      if (e.key === 'Escape') onDismiss?.(front)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [total, front, onDismiss])

  const goToIncident = () => {
    onDismiss?.(front)
    const incidentId = front?.id
    const path = incidentId
      ? `/sos-incidents?id=${encodeURIComponent(incidentId)}`
      : '/sos-incidents'
    navigate(path)
  }

  if (total === 0 || !front || typeof document === 'undefined') return null

  const name = driverLabel(front)
  const avatar = driverAvatar(front)
  const message = alertMessage(front)
  const typeLabel = alertType(front)
  const coords = coordsLabel(front)

  return createPortal(
    <div
      className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/60 p-4"
      role="alertdialog"
      aria-modal="true"
      aria-live="assertive"
      aria-labelledby="sos-alert-title"
      aria-describedby="sos-alert-message"
    >
      <div
        key={alertKey(front, 0)}
        className="animate-slide-up relative w-full max-w-md overflow-hidden rounded-2xl border border-red-500/35 bg-zinc-950 shadow-[0_0_48px_rgba(239,68,68,0.28),0_24px_48px_rgba(0,0,0,0.55)]"
      >
        <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-red-500 via-red-400 to-red-600" />
        <span className="pointer-events-none absolute -top-20 left-1/2 h-40 w-56 -translate-x-1/2 rounded-full bg-red-500/20 blur-3xl" />

        <div className="relative flex items-start justify-between gap-3 px-5 pb-3 pt-5">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-red-600 text-white shadow-[0_0_16px_rgba(220,38,38,0.55)]">
              <Icon name="sos" size={16} />
            </span>
            <div>
              <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-red-400">
                <LiveDot />
                Live {typeLabel}
                {total > 1 && (
                  <span className="rounded-full bg-red-500/15 px-1.5 py-0.5 text-[10px] tracking-wide text-red-200">
                    {total} open
                  </span>
                )}
              </p>
              <h2
                id="sos-alert-title"
                className="mt-0.5 text-lg font-bold tracking-tight text-white"
              >
                Immediate response required
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onDismiss?.(front)}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-zinc-500 transition hover:bg-white/5 hover:text-white"
            aria-label="Dismiss SOS alert"
          >
            <Icon name="close" size={16} />
          </button>
        </div>

        <div className="relative mx-5 mb-4 rounded-xl border border-zinc-800 bg-zinc-900/80 p-3.5">
          <div className="flex items-center gap-3">
            {avatar ? (
              <img
                src={avatar}
                alt=""
                className="h-11 w-11 shrink-0 rounded-full object-cover ring-2 ring-red-500/40"
              />
            ) : (
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-red-500/15 text-red-300 ring-2 ring-red-500/25">
                <Icon name="user" size={18} />
              </span>
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-zinc-50">{name}</p>
              <p
                id="sos-alert-message"
                className="mt-0.5 text-sm leading-snug text-zinc-400"
              >
                {message}
              </p>
            </div>
          </div>
          {coords && (
            <p className="mt-3 flex items-center gap-1.5 border-t border-zinc-800 pt-3 font-mono text-[11px] tracking-wide text-zinc-500">
              <Icon name="pin" size={12} className="shrink-0 text-red-400" />
              {coords}
            </p>
          )}
        </div>

        <div className="relative flex items-center justify-end gap-2 border-t border-zinc-800/80 px-5 py-3">
          {total > 1 && (
            <button
              type="button"
              onClick={onDismissAll}
              className="mr-auto rounded-lg px-3 py-2 text-sm font-semibold text-zinc-500 transition hover:bg-white/5 hover:text-zinc-200"
            >
              Dismiss all
            </button>
          )}
          <button
            type="button"
            onClick={() => onDismiss?.(front)}
            className="rounded-lg border border-zinc-700 px-3.5 py-2 text-sm font-semibold text-zinc-300 transition hover:border-zinc-500 hover:bg-zinc-800 hover:text-white"
          >
            Dismiss
          </button>
          <button
            type="button"
            onClick={goToIncident}
            className="rounded-lg bg-red-600 px-3.5 py-2 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(220,38,38,0.4)] transition hover:bg-red-500"
          >
            View incident
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
