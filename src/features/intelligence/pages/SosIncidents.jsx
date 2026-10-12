import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import Icon from '../../../components/common/Icon.jsx'
import GoogleMapView from '../../../components/GoogleMapView.jsx'
import { sosService } from '../../../api/services/sosService.js'
import { attorneyService } from '../../../api/services/attorneyService.js'
import { useSocket } from '../../../context/SocketContext.jsx'
import {
  SOS_STATUS,
  SOS_TYPE,
  STATUS_STYLES,
  TIME_BADGE_STYLES,
  QUEUE_ACCENT,
  TIMELINE_DOT,
  mapSosIncident,
  extractIncidentList,
  extractIncident,
  extractAttorneyList,
  apiErrorMessage,
  sortIncidentsForQueue,
} from '../utils/sosMappers.js'

const US_CENTER = { lat: 39.8283, lng: -98.5795 }

const STATUS_FILTERS = [
  { value: '', label: 'All' },
  { value: SOS_STATUS.OPEN, label: 'Open' },
  { value: SOS_STATUS.ACKNOWLEDGED, label: 'Acknowledged' },
  { value: SOS_STATUS.RESOLVED, label: 'Resolved' },
]

const TYPE_FILTERS = [
  { value: '', label: 'All types' },
  { value: SOS_TYPE.SOS, label: 'SOS' },
  { value: SOS_TYPE.DETENTION, label: 'Detention' },
]

function FilterChip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        'rounded-full px-3 py-1 text-xs font-semibold transition ' +
        (active
          ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
          : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700')
      }
    >
      {children}
    </button>
  )
}

function QueueCard({ incident, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        'relative w-full overflow-hidden rounded-lg border p-4 text-left shadow-sm transition ' +
        (active
          ? 'border-zinc-200 bg-brand/5 shadow-md dark:border-zinc-700'
          : 'border-zinc-200 hover:-translate-y-0.5 hover:bg-zinc-50 hover:shadow-md dark:border-zinc-800 dark:hover:bg-zinc-800/60')
      }
    >
      <span
        className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${QUEUE_ACCENT[incident.status] || QUEUE_ACCENT.OPEN}`}
      />

      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-bold text-zinc-900 dark:text-zinc-50">
            {incident.name}
          </p>
          <p className="mt-0.5 text-xs font-medium text-zinc-400">
            {incident.incidentCode} · {incident.typeLabel}
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${TIME_BADGE_STYLES[incident.status] || TIME_BADGE_STYLES.OPEN}`}
        >
          {incident.timeAgo}
        </span>
      </div>

      <p className="mt-2 flex items-center gap-1 text-sm text-zinc-400">
        <Icon name="pin" size={12} />
        <span className="truncate">{incident.location}</span>
      </p>

      {incident.message && (
        <p className="mt-2 line-clamp-2 text-xs text-zinc-500 dark:text-zinc-400">
          {incident.message}
        </p>
      )}

      <div className="mt-3 flex items-center gap-2 border-t border-zinc-100 pt-3 dark:border-zinc-800">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Case
          </p>
          <p className="mt-1 truncate text-sm font-semibold text-zinc-800 dark:text-zinc-100">
            {incident.attorney.assigned
              ? incident.attorney.name
              : incident.caseId
                ? 'Case linked'
                : 'No case'}
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide ${STATUS_STYLES[incident.status] || STATUS_STYLES.OPEN}`}
        >
          {incident.statusLabel}
        </span>
      </div>
    </button>
  )
}

function MapPanel({ incidents, selectedId, onSelect }) {
  const markers = incidents
    .filter((i) => i.coords)
    .map((i) => ({
      id: i.id,
      lat: i.coords.lat,
      lng: i.coords.lng,
      color:
        i.status === SOS_STATUS.RESOLVED
          ? 'green'
          : i.status === SOS_STATUS.ACKNOWLEDGED
            ? 'orange'
            : 'red',
      role: 'SOS',
      // Keep the pulse indicator visible until the incident is closed.
      pulse: i.status !== SOS_STATUS.RESOLVED,
      name: i.name,
      avatar: i.photo || null,
      status: i.status,
      incidentCode: i.incidentCode,
      cdl: i.cdl,
      location: i.location,
      detail: i.message || null,
      timeAgo: i.timeAgo,
      createdAt: i.createdAt || null,
      attorneyAssigned: Boolean(i.attorney?.assigned),
      attorneyName: i.attorney?.assigned ? i.attorney.name : null,
      driverId: i.driverId || null,
      profileLink: false,
    }))

  const openCount = incidents.filter((i) => i.status === SOS_STATUS.OPEN).length
  const ackCount = incidents.filter(
    (i) => i.status === SOS_STATUS.ACKNOWLEDGED,
  ).length
  const mappedCount = markers.length
  const missingCoords = incidents.length - mappedCount

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl ring-1 ring-black/5 dark:border-zinc-800 dark:bg-zinc-900">
      <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-red-500 via-red-600 to-red-500" />

      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 p-5 pb-4">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-red-500 to-red-600 text-white shadow-md">
            <Icon name="sos" size={20} />
          </span>
          <div>
            <h3 className="flex items-center gap-2 font-bold text-zinc-900 dark:text-zinc-50">
              Incident Map
              <span className="flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-red-600 dark:bg-red-500/10 dark:text-red-400">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-red-500" />
                </span>
                Live
              </span>
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {mappedCount > 0
                ? `${mappedCount} pin${mappedCount === 1 ? '' : 's'} with coordinates`
                : 'SOS and detention alerts with coordinates'}
              {missingCoords > 0 ? ` · ${missingCoords} without location` : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-lg bg-red-50 px-2.5 py-1.5 text-center text-xs font-semibold text-red-600 dark:bg-red-500/10 dark:text-red-400">
            <span className="block text-sm font-bold leading-none">{openCount}</span>
            <span className="text-xs font-bold uppercase tracking-wide opacity-80">
              Open
            </span>
          </span>
          <span className="rounded-lg bg-amber-50 px-2.5 py-1.5 text-center text-xs font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
            <span className="block text-sm font-bold leading-none">{ackCount}</span>
            <span className="text-xs font-bold uppercase tracking-wide opacity-80">
              Ack
            </span>
          </span>
        </div>
      </div>

      <GoogleMapView
        className="mx-4 mb-4 min-h-0 flex-1 rounded-xl shadow-inner"
        markers={markers}
        center={US_CENTER}
        zoom={4}
        fitBounds={markers.length > 0}
        clusterMarkers={false}
        selectedId={selectedId}
        onMarkerClick={onSelect}
      />
    </div>
  )
}

function IncidentDetail({
  incident,
  onClose,
  onAcknowledge,
  onResolve,
  onCreateCase,
  actionBusy,
}) {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex shrink-0 items-start justify-between gap-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-zinc-400">
            {incident.incidentCode}
          </p>
          <div className="mt-1 flex flex-wrap gap-1.5">
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-bold uppercase ${STATUS_STYLES[incident.status]}`}
            >
              {incident.statusLabel}
            </span>
            <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-bold uppercase text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
              {incident.typeLabel}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800"
        >
          <Icon name="close" size={15} />
        </button>
      </div>

      <div className="mt-4 flex shrink-0 items-center gap-3">
        {incident.photo ? (
          <img
            src={incident.photo}
            alt={incident.name}
            className="h-12 w-12 shrink-0 rounded-full object-cover"
          />
        ) : (
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-brand/10 text-lg font-bold text-brand dark:text-brand-dark">
            {incident.name.substring(0, 2).toUpperCase()}
          </span>
        )}
        <div className="min-w-0">
          <p className="truncate font-bold text-zinc-900 dark:text-zinc-50">
            {incident.name}
          </p>
          <p className="text-xs text-zinc-400">CDL #{incident.cdl}</p>
          {incident.organizationNames?.length > 0 && (
            <p className="mt-0.5 truncate text-xs text-zinc-500">
              {incident.organizationNames.join(', ')}
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
        {incident.message && (
          <p className="rounded-lg bg-zinc-50 p-3 text-sm text-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-200">
            {incident.message}
          </p>
        )}

        <dl className="grid grid-cols-1 gap-2 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-zinc-400">Location</dt>
            <dd className="text-right font-medium text-zinc-800 dark:text-zinc-100">
              {incident.location}
            </dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-zinc-400">Opened</dt>
            <dd className="text-right font-medium text-zinc-800 dark:text-zinc-100">
              {incident.createdAtLabel || '—'}
            </dd>
          </div>
          {incident.acknowledgedByName && (
            <div className="flex justify-between gap-3">
              <dt className="text-zinc-400">Acknowledged by</dt>
              <dd className="text-right font-medium text-zinc-800 dark:text-zinc-100">
                {incident.acknowledgedByName}
              </dd>
            </div>
          )}
          <div className="flex justify-between gap-3">
            <dt className="text-zinc-400">Case</dt>
            <dd className="text-right font-medium text-zinc-800 dark:text-zinc-100">
              {incident.caseId ? (
                <Link
                  to={`/case-tracker/${incident.caseId}`}
                  className="text-brand underline-offset-2 hover:underline dark:text-brand-dark"
                >
                  View case
                </Link>
              ) : (
                'Not linked'
              )}
            </dd>
          </div>
          {incident.attorney.assigned && (
            <div className="flex justify-between gap-3">
              <dt className="text-zinc-400">Attorney</dt>
              <dd className="text-right font-medium text-zinc-800 dark:text-zinc-100">
                {incident.attorney.name}
              </dd>
            </div>
          )}
        </dl>

        <div className="border-t border-zinc-100 pt-4 dark:border-zinc-800">
          <p className="mb-3 text-xs font-bold uppercase tracking-wide text-zinc-400">
            Timeline
          </p>
          <div className="flex flex-col">
            {incident.timeline.length === 0 ? (
              <p className="text-sm text-zinc-500">No timeline events yet.</p>
            ) : (
              incident.timeline.map((t, i) => (
                <div key={`${t.type}-${t.at}-${i}`} className="flex gap-3 pb-4 last:pb-0">
                  <div className="flex flex-col items-center">
                    <span
                      className={`mt-0.5 h-3.5 w-3.5 shrink-0 rounded-full border-2 bg-white dark:bg-zinc-900 ${TIMELINE_DOT[t.tone] || TIMELINE_DOT.ACKNOWLEDGED}`}
                    />
                    {i < incident.timeline.length - 1 && (
                      <span className="mt-1 w-px flex-1 bg-zinc-200 dark:bg-zinc-700" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                        {t.title}
                      </p>
                      <span className="shrink-0 text-xs text-zinc-400">{t.time}</span>
                    </div>
                    {t.detail && (
                      <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                        {t.detail}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 flex shrink-0 flex-col gap-2 border-t border-zinc-100 pt-4 dark:border-zinc-800">
        {incident.status === SOS_STATUS.OPEN && (
          <button
            type="button"
            disabled={actionBusy}
            onClick={() => onAcknowledge(incident.id)}
            className="w-full rounded-lg bg-amber-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:opacity-50"
          >
            Acknowledge
          </button>
        )}
        {!incident.caseId && incident.status !== SOS_STATUS.RESOLVED && (
          <button
            type="button"
            disabled={actionBusy}
            onClick={() => onCreateCase(incident.id)}
            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
          >
            Create case
          </button>
        )}
        {incident.status !== SOS_STATUS.RESOLVED && (
          <button
            type="button"
            disabled={actionBusy}
            onClick={() => onResolve(incident.id)}
            className="w-full rounded-lg bg-green-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-green-700 disabled:opacity-50"
          >
            Resolve
          </button>
        )}
      </div>
    </div>
  )
}

function CaseModal({ incident, mode, onClose, onConfirm }) {
  const [attorneys, setAttorneys] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({
    attorneyId: '',
    court: '',
    hearingDate: '',
    summary: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const selectedAttorney = useMemo(
    () => attorneys.find((a) => a.id === form.attorneyId) || null,
    [attorneys, form.attorneyId],
  )
  const attorneyCourts = Array.isArray(selectedAttorney?.courts)
    ? selectedAttorney.courts.filter(Boolean)
    : []

  useEffect(() => {
    attorneyService
      .getAttorneys({ limit: 100 })
      .then((res) => setAttorneys(extractAttorneyList(res)))
      .catch((err) => {
        console.error(err)
        toast.error(apiErrorMessage(err, 'Failed to load attorneys'))
      })
      .finally(() => setLoading(false))
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.attorneyId && mode === 'case') {
      toast.error('Select an attorney to create a case.')
      return
    }
    if (form.attorneyId && attorneyCourts.length > 0 && !form.court) {
      toast.error('Select a court for this attorney.')
      return
    }
    if (
      form.attorneyId &&
      form.court &&
      attorneyCourts.length > 0 &&
      !attorneyCourts.includes(form.court)
    ) {
      toast.error('Court must be one of the selected attorney courts.')
      return
    }
    setIsSubmitting(true)
    try {
      await onConfirm({
        assignAttorney: !!form.attorneyId,
        casePayload: form.attorneyId
          ? {
              attorneyId: form.attorneyId,
              court: form.court || undefined,
              hearingDate: form.hearingDate
                ? new Date(form.hearingDate).toISOString()
                : undefined,
              summary: form.summary || undefined,
            }
          : null,
        alsoResolve: mode === 'resolve',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const title =
    mode === 'case' ? 'Create case from incident' : 'Resolve incident'
  const submitLabel =
    mode === 'case'
      ? 'Create case'
      : form.attorneyId
        ? 'Create case & resolve'
        : 'Resolve incident'

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
              {title}
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              {incident.name} · {incident.incidentCode}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800"
          >
            <Icon name="close" size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              {mode === 'case'
                ? 'Assign attorney'
                : 'Assign attorney (optional)'}
            </label>
            <select
              value={form.attorneyId}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  attorneyId: e.target.value,
                  court: '',
                }))
              }
              required={mode === 'case'}
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-brand focus:ring-2 focus:ring-brand/30 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
            >
              <option value="">
                {mode === 'case'
                  ? 'Select attorney…'
                  : 'No attorney (resolve only)'}
              </option>
              {loading ? (
                <option disabled>Loading attorneys…</option>
              ) : (
                attorneys.map((att) => (
                  <option key={att.id} value={att.id}>
                    {[
                      att.name || att.email || 'Unknown Attorney',
                      att.barLicenseNumber ? `Bar ${att.barLicenseNumber}` : null,
                      att.federalCircuit || null,
                      Array.isArray(att.states) && att.states[0]
                        ? att.states[0]
                        : null,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </option>
                ))
              )}
            </select>
            <p className="mt-1 text-xs text-zinc-500">
              Creating a case links an attorney to this incident. Resolve closes
              the alert after optional case creation.
            </p>
          </div>

          {form.attorneyId && (
            <>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                  Court / Jurisdiction
                </label>
                <select
                  value={form.court}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, court: e.target.value }))
                  }
                  required={attorneyCourts.length > 0}
                  disabled={attorneyCourts.length === 0}
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-brand focus:ring-2 focus:ring-brand/30 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
                >
                  <option value="">
                    {attorneyCourts.length === 0
                      ? 'No courts on this attorney'
                      : 'Select a court'}
                  </option>
                  {attorneyCourts.map((court) => (
                    <option key={court} value={court}>
                      {court}
                    </option>
                  ))}
                </select>
                {attorneyCourts.length === 0 && (
                  <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                    This attorney has no courts configured. Add courts on their
                    profile, or continue without a court.
                  </p>
                )}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                  Hearing date
                </label>
                <input
                  type="datetime-local"
                  value={form.hearingDate}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, hearingDate: e.target.value }))
                  }
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-brand focus:ring-2 focus:ring-brand/30 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                  Case summary
                </label>
                <textarea
                  rows={3}
                  value={form.summary}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, summary: e.target.value }))
                  }
                  placeholder="Additional context for the attorney…"
                  className="w-full resize-none rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-brand focus:ring-2 focus:ring-brand/30 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
                />
              </div>
            </>
          )}

          <div className="mt-6 flex gap-3 border-t border-zinc-100 pt-4 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-zinc-200 px-4 py-2.5 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex flex-1 items-center justify-center rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Working…' : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function SosIncidents() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [incidents, setIncidents] = useState([])
  const [selectedId, setSelectedId] = useState(
    () => searchParams.get('id') || null,
  )
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [modal, setModal] = useState(null) // { id, mode: 'resolve' | 'case' }
  const [isLoading, setIsLoading] = useState(true)
  const [listError, setListError] = useState('')
  const [actionBusy, setActionBusy] = useState(false)
  const { socket } = useSocket()
  const deepLinkTried = useRef(new Set())

  const selectIncident = useCallback(
    (id) => {
      setSelectedId(id)
      const next = new URLSearchParams(searchParams)
      if (id) next.set('id', id)
      else next.delete('id')
      setSearchParams(next, { replace: true })
    },
    [searchParams, setSearchParams],
  )

  const fetchIncidents = useCallback(async () => {
    try {
      setListError('')
      const params = { limit: 100, page: 1 }
      if (statusFilter) params.status = statusFilter
      if (typeFilter) params.type = typeFilter

      const res = await sosService.getIncidents(params)
      const raw = extractIncidentList(res)
      const formatted = sortIncidentsForQueue(
        raw.map(mapSosIncident).filter(Boolean),
      )
      setIncidents(formatted)
    } catch (err) {
      console.error('Failed to fetch SOS incidents:', err)
      setListError(apiErrorMessage(err, 'Failed to load incidents'))
      setIncidents([])
    } finally {
      setIsLoading(false)
    }
  }, [statusFilter, typeFilter])

  useEffect(() => {
    setIsLoading(true)
    fetchIncidents()
  }, [fetchIncidents])

  // Deep-link: load incident by id if missing from current filtered list
  useEffect(() => {
    const fromUrl = searchParams.get('id')
    if (!fromUrl) return
    if (fromUrl !== selectedId) setSelectedId(fromUrl)
    if (incidents.some((i) => i.id === fromUrl)) return
    if (deepLinkTried.current.has(fromUrl)) return
    deepLinkTried.current.add(fromUrl)

    let cancelled = false
    ;(async () => {
      try {
        const res = await sosService.getIncident(fromUrl)
        const raw = extractIncident(res)
        const mapped = mapSosIncident(raw)
        if (!mapped || cancelled) return
        setIncidents((prev) => {
          if (prev.some((i) => i.id === mapped.id)) return prev
          return sortIncidentsForQueue([mapped, ...prev])
        })
      } catch (err) {
        if (!cancelled) {
          toast.error(apiErrorMessage(err, 'Incident not found'))
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [searchParams, selectedId, incidents])

  useEffect(() => {
    if (!socket) return

    socket.emit('admin:sos:subscribe', {}, (res) => {
      console.log('Subscribed to admin SOS channel:', res)
    })

    const handleSosAlert = () => {
      fetchIncidents()
    }

    socket.on('sos:alert', handleSosAlert)
    return () => {
      socket.off('sos:alert', handleSosAlert)
    }
  }, [socket, fetchIncidents])

  const handleAcknowledge = async (id) => {
    setActionBusy(true)
    try {
      await sosService.acknowledgeIncident(id)
      toast.success('Incident acknowledged')
      await fetchIncidents()
    } catch (err) {
      console.error(err)
      toast.error(apiErrorMessage(err, 'Failed to acknowledge'))
    } finally {
      setActionBusy(false)
    }
  }

  const openResolve = (id) => setModal({ id, mode: 'resolve' })
  const openCreateCase = (id) => setModal({ id, mode: 'case' })

  const submitModal = async ({ assignAttorney, casePayload, alsoResolve }) => {
    if (!modal?.id) return
    try {
      if (assignAttorney && casePayload) {
        await sosService.createCase(modal.id, casePayload)
        toast.success('Case created and linked')
      }
      if (alsoResolve) {
        await sosService.resolveIncident(modal.id)
        toast.success('Incident resolved')
      }
      setModal(null)
      await fetchIncidents()
    } catch (err) {
      console.error(err)
      toast.error(apiErrorMessage(err, 'Failed to update incident'))
      throw err
    }
  }

  const selected = useMemo(
    () => incidents.find((i) => i.id === selectedId) ?? null,
    [incidents, selectedId],
  )
  const modalIncident = useMemo(
    () => incidents.find((i) => i.id === modal?.id) ?? null,
    [incidents, modal],
  )

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden">
      <div className="flex shrink-0 flex-wrap items-center gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {STATUS_FILTERS.map((f) => (
            <FilterChip
              key={f.value || 'all-status'}
              active={statusFilter === f.value}
              onClick={() => setStatusFilter(f.value)}
            >
              {f.label}
            </FilterChip>
          ))}
        </div>
        <span className="hidden h-4 w-px bg-zinc-200 sm:block dark:bg-zinc-700" />
        <div className="flex flex-wrap items-center gap-1.5">
          {TYPE_FILTERS.map((f) => (
            <FilterChip
              key={f.value || 'all-type'}
              active={typeFilter === f.value}
              onClick={() => setTypeFilter(f.value)}
            >
              {f.label}
            </FilterChip>
          ))}
        </div>
      </div>

      <div
        className={
          'grid min-h-0 flex-1 items-stretch gap-5 ' +
          (selected
            ? 'lg:grid-cols-[300px_minmax(0,1fr)_320px]'
            : 'lg:grid-cols-[300px_minmax(0,1fr)]')
        }
      >
        <div className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="mb-3 shrink-0 border-b border-zinc-100 px-1 pb-3 font-bold text-zinc-900 dark:border-zinc-800 dark:text-zinc-50">
            Incident queue
          </h3>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1">
            {isLoading ? (
              <p className="mt-4 text-center text-sm text-zinc-500">
                Loading incidents…
              </p>
            ) : listError ? (
              <div className="mt-4 space-y-3 px-2 text-center">
                <p className="text-sm text-red-600 dark:text-red-400">
                  {listError}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setIsLoading(true)
                    fetchIncidents()
                  }}
                  className="rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900"
                >
                  Retry
                </button>
              </div>
            ) : incidents.length === 0 ? (
              <p className="mt-4 text-center text-sm text-zinc-500">
                No incidents match these filters.
              </p>
            ) : (
              <div className="flex flex-col gap-3 pb-1">
                {incidents.map((incident) => (
                  <QueueCard
                    key={incident.id}
                    incident={incident}
                    active={selectedId === incident.id}
                    onClick={() =>
                      selectIncident(
                        selectedId === incident.id ? null : incident.id,
                      )
                    }
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex min-h-0 min-w-0 flex-col">
          <MapPanel
            incidents={incidents}
            selectedId={selectedId}
            onSelect={(id) =>
              selectIncident(selectedId === id ? null : id)
            }
          />
        </div>

        {selected && (
          <div className="flex min-h-0 min-w-0 flex-col">
            <IncidentDetail
              incident={selected}
              onClose={() => selectIncident(null)}
              onAcknowledge={handleAcknowledge}
              onResolve={openResolve}
              onCreateCase={openCreateCase}
              actionBusy={actionBusy}
            />
          </div>
        )}
      </div>

      {modalIncident && modal && (
        <CaseModal
          incident={modalIncident}
          mode={modal.mode}
          onClose={() => setModal(null)}
          onConfirm={submitModal}
        />
      )}
    </div>
  )
}
