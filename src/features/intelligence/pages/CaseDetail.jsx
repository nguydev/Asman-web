import { useState, useRef } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { caseService } from '../../../api/services/caseService.js'
import { vaultService } from '../../../api/services/vaultService.js'
import { useFileUploader } from '../../../hooks/useFileUploader.js'
import Icon from '../../../components/common/Icon.jsx'
import { Button } from '../../../components/ui/Button.jsx'

const LIFECYCLE_STYLES = {
  OPEN: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
  IN_PROGRESS: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  HEARING: 'bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300',
  CLOSED: 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300',
  CANCELLED: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
  REOPENED: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-300',
  ARCHIVED: 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400',
  hearing: 'bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300',
}

const STATUS_LABELS = {
  OPEN: 'Open',
  IN_PROGRESS: 'In Progress',
  HEARING: 'Hearing',
  CLOSED: 'Closed',
  CANCELLED: 'Cancelled',
  REOPENED: 'Reopened',
  ARCHIVED: 'Archived',
}

/** Full start→end lifecycle (order for UI). */
const ALL_STATUSES = [
  'OPEN',
  'IN_PROGRESS',
  'HEARING',
  'CLOSED',
  'CANCELLED',
  'REOPENED',
  'ARCHIVED',
]

const PROGRESS_STEPS = ['OPEN', 'IN_PROGRESS', 'HEARING', 'CLOSED']

const CASE_STATUS_TRANSITIONS = {
  OPEN: ['IN_PROGRESS', 'CANCELLED', 'ARCHIVED'],
  IN_PROGRESS: ['HEARING', 'CLOSED', 'CANCELLED', 'ARCHIVED'],
  HEARING: ['IN_PROGRESS', 'CLOSED', 'CANCELLED'],
  CLOSED: ['REOPENED', 'ARCHIVED'],
  CANCELLED: ['REOPENED', 'ARCHIVED'],
  REOPENED: ['IN_PROGRESS', 'HEARING', 'CLOSED', 'CANCELLED'],
  ARCHIVED: [],
}

function buildProgress(status) {
  const mappedStatus =
    status === 'ARCHIVED'
      ? 'CLOSED'
      : status === 'REOPENED'
        ? 'IN_PROGRESS'
        : status === 'CANCELLED'
          ? null
          : status
  const index = mappedStatus ? PROGRESS_STEPS.indexOf(mappedStatus) : -1
  return PROGRESS_STEPS.map((step, stepIndex) => ({
    status: step,
    completed:
      status === 'ARCHIVED' ||
      status === 'CLOSED' ||
      (index >= 0 && stepIndex < index),
    active:
      status === 'CANCELLED'
        ? false
        : status === 'REOPENED'
          ? step === 'IN_PROGRESS'
          : step === status || (status === 'ARCHIVED' && step === 'CLOSED'),
  }))
}

const DOC_ICON_TONES = {
  pdf: 'bg-red-50 text-red-500 dark:bg-red-500/10',
  zip: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10',
  doc: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10',
}

const fieldLabel = 'mb-1.5 block text-xs font-bold uppercase tracking-wider text-zinc-500'
const fieldInput =
  'w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-brand dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50'

function toDateInput(value) {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return d.toISOString().slice(0, 10)
}

function mapVaultDoc(doc) {
  const file = doc.fileObject || {}
  const name =
    doc.name || file.originalName || file.filename || file.key || 'Document'
  const ext = String(name).split('.').pop()?.toLowerCase() || 'pdf'
  const sizeBytes = file.sizeBytes ?? file.size
  return {
    id: doc.id,
    name,
    type: ['pdf', 'zip', 'doc', 'docx'].includes(ext) ? ext.replace('docx', 'doc') : 'pdf',
    date: doc.uploadedAt || doc.createdAt
      ? new Date(doc.uploadedAt || doc.createdAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      : '—',
    size:
      typeof sizeBytes === 'number'
        ? `${(sizeBytes / 1024).toFixed(1)} KB`
        : '—',
  }
}

function ModalShell({ title, description, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">{title}</h2>
            {description ? (
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">{description}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-lg text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <Icon name="close" size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export default function CaseDetail() {
  const { caseId } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { uploadFile, isUploading } = useFileUploader()
  const [uploadError, setUploadError] = useState('')

  const { data: c, isLoading } = useQuery({
    queryKey: ['caseTracker', caseId],
    queryFn: async () => {
      const res = await caseService.getCaseTracker(caseId)
      return res?.data ?? res
    },
    enabled: !!caseId,
  })

  const driverProfile = c?.driver?.user?.profile
  const driverName = driverProfile?.name || 'Unknown Driver'
  const driverPhoto = driverProfile?.avatarUrl || null

  const attorneyProfile = c?.attorney
  const attorneyName = attorneyProfile?.name || 'Unknown Attorney'
  const attorneyPhoto = attorneyProfile?.avatarUrl || null
  const attorneyCourts = Array.isArray(attorneyProfile?.courts)
    ? attorneyProfile.courts.filter(Boolean)
    : []
  const allowedTransitions = Array.isArray(c?.allowedTransitions)
    ? c.allowedTransitions
    : CASE_STATUS_TRANSITIONS[c?.status] || []
  const progressSteps =
    Array.isArray(c?.progress) && c.progress.length > 0
      ? c.progress
      : buildProgress(c?.status)

  const [statusModalOpen, setStatusModalOpen] = useState(false)
  const [pendingStatus, setPendingStatus] = useState('')
  const [pendingOutcome, setPendingOutcome] = useState('WIN')
  const [statusSummary, setStatusSummary] = useState('')
  const [statusError, setStatusError] = useState('')

  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editCourt, setEditCourt] = useState('')
  const [editHearingDate, setEditHearingDate] = useState('')
  const [editSummary, setEditSummary] = useState('')
  const [editError, setEditError] = useState('')

  const fileInputRef = useRef(null)
  const docs = (c?.documents || []).map(mapVaultDoc)

  const openEditModal = () => {
    setEditCourt(c?.court || '')
    setEditHearingDate(toDateInput(c?.hearingDate))
    setEditSummary(c?.summary || '')
    setEditError('')
    setEditModalOpen(true)
  }

  const openStatusModal = () => {
    setPendingStatus('')
    setPendingOutcome(c?.outcome === 'LOSE' ? 'LOSE' : 'WIN')
    setStatusSummary('')
    setStatusError('')
    setStatusModalOpen(true)
  }

  const handleUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file || !caseId) return
    setUploadError('')
    try {
      const uploaded = await uploadFile(file, 'PRIVATE')
      await vaultService.addCaseDocument(caseId, uploaded.id)
      queryClient.invalidateQueries({ queryKey: ['caseTracker', caseId] })
    } catch (err) {
      console.error('Failed to upload case document', err)
      setUploadError(
        err?.response?.data?.message || err?.message || 'Upload failed',
      )
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleRemoveDoc = async (id) => {
    if (!window.confirm('Remove this document from the case?')) return
    try {
      await vaultService.deleteDocument(id)
      queryClient.invalidateQueries({ queryKey: ['caseTracker', caseId] })
    } catch (err) {
      console.error('Failed to remove document', err)
      alert(err?.response?.data?.message || 'Failed to remove document')
    }
  }

  const statusMutation = useMutation({
    mutationFn: (data) => caseService.changeCaseStatus(caseId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['caseTracker', caseId] })
      queryClient.invalidateQueries({ queryKey: ['cases'] })
      queryClient.invalidateQueries({ queryKey: ['caseStats'] })
      setStatusModalOpen(false)
    },
    onError: (err) => {
      const message = err?.response?.data?.message || err?.message || 'Failed to update status'
      setStatusError(Array.isArray(message) ? message.join(', ') : message)
    },
  })

  const editMutation = useMutation({
    mutationFn: (data) => caseService.updateCase(caseId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['caseTracker', caseId] })
      queryClient.invalidateQueries({ queryKey: ['cases'] })
      setEditModalOpen(false)
    },
    onError: (err) => {
      const message = err?.response?.data?.message || err?.message || 'Failed to update case'
      setEditError(Array.isArray(message) ? message.join(', ') : message)
    },
  })

  const saveStatus = () => {
    setStatusError('')
    if (!pendingStatus) {
      setStatusError('Select a new status.')
      return
    }
    if (pendingStatus === 'CLOSED' && !pendingOutcome) {
      setStatusError('Outcome is required when closing a case.')
      return
    }
    statusMutation.mutate({
      status: pendingStatus,
      reason: statusSummary.trim() || undefined,
      outcome: pendingStatus === 'CLOSED' ? pendingOutcome : undefined,
    })
  }

  const saveEdit = () => {
    setEditError('')
    editMutation.mutate({
      court: editCourt.trim() || null,
      hearingDate: editHearingDate
        ? new Date(`${editHearingDate}T12:00:00.000Z`).toISOString()
        : null,
      summary: editSummary.trim() || null,
    })
  }

  if (isLoading) {
    return <div className="p-8 text-center text-zinc-500">Loading case details...</div>
  }

  if (!c) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Case not found.</p>
        <Button variant="ghost" onClick={() => navigate('/case-tracker')}>
          Back to Case Tracker
        </Button>
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-1.5 text-sm">
          <Link
            to="/case-tracker"
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
          >
            Case Tracker
          </Link>
          <Icon name="chevronRight" size={14} className="text-zinc-300" />
          <span className="font-semibold text-brand dark:text-brand-dark">#{c.id}</span>
        </div>

        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <span
              className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide ${LIFECYCLE_STYLES[c.status] || LIFECYCLE_STYLES.ARCHIVED}`}
            >
              {STATUS_LABELS[c.status] || c.status}
              {c.status === 'CLOSED' && c.outcome ? ` · ${c.outcome}` : ''}
            </span>
            <h1 className="mt-2 text-xl font-bold text-zinc-900 dark:text-zinc-50">
              Case #{c.id.substring(0, 8)}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" icon="edit" onClick={openEditModal}>
              Edit Case
            </Button>
          </div>
        </div>

        {progressSteps.length > 0 ? (
          <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-400">
              Case lifecycle
            </p>
            <div className="flex flex-wrap gap-2">
              {progressSteps.map((step) => (
                <span
                  key={step.status}
                  className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                    step.active
                      ? LIFECYCLE_STYLES[step.status]
                      : step.completed
                        ? 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300'
                        : 'bg-zinc-50 text-zinc-400 dark:bg-zinc-950 dark:text-zinc-500'
                  }`}
                >
                  {STATUS_LABELS[step.status] || step.status}
                </span>
              ))}
              {c.status === 'CANCELLED' ||
              c.status === 'REOPENED' ||
              c.status === 'ARCHIVED' ? (
                <span
                  className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${LIFECYCLE_STYLES[c.status]}`}
                >
                  {STATUS_LABELS[c.status]}
                </span>
              ) : null}
            </div>
            <div className="mt-3 flex flex-wrap gap-2 border-t border-zinc-100 pt-3 dark:border-zinc-800">
              {ALL_STATUSES.map((status) => (
                <span
                  key={`all-${status}`}
                  className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                    status === c.status
                      ? LIFECYCLE_STYLES[status]
                      : 'bg-zinc-50 text-zinc-400 dark:bg-zinc-950 dark:text-zinc-500'
                  }`}
                >
                  {STATUS_LABELS[status]}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        <div className="grid gap-5 lg:grid-cols-3">
          <div className="flex flex-col gap-5 lg:col-span-2">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
                <h3 className="flex items-center justify-between font-bold text-zinc-900 dark:text-zinc-50">
                  Driver Assigned
                  <Icon name="truck" size={16} className="text-zinc-400" />
                </h3>
                {c.driver ? (
                  <Link
                    to="/drivers"
                    className="mt-3 flex items-center gap-3 rounded-lg transition hover:bg-zinc-50 dark:hover:bg-zinc-800"
                  >
                    {driverPhoto ? (
                      <img
                        src={driverPhoto}
                        alt={driverName}
                        className="h-12 w-12 shrink-0 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-zinc-200 text-lg font-bold text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">
                        {driverName.charAt(0)}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-zinc-900 dark:text-zinc-50">
                        {driverName}
                      </p>
                      <p className="text-xs text-zinc-400">
                        Plate: {c.driver.licensePlate || 'N/A'}
                      </p>
                      <p className="text-xs text-zinc-400">
                        VIN: {c.driver.vinNumber || 'N/A'}
                      </p>
                    </div>
                  </Link>
                ) : (
                  <p className="mt-3 text-sm text-zinc-400">No driver linked to this case.</p>
                )}
              </div>

              <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
                <h3 className="flex items-center justify-between font-bold text-zinc-900 dark:text-zinc-50">
                  Lead Attorney
                  <Icon name="briefcase" size={16} className="text-zinc-400" />
                </h3>
                <p className="mt-0.5 text-xs text-zinc-400">
                  Handled offline by counsel · internal reference
                </p>
                <div className="mt-3 flex items-center gap-3">
                  {attorneyPhoto ? (
                    <img
                      src={attorneyPhoto}
                      alt={attorneyName}
                      className="h-12 w-12 shrink-0 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-zinc-200 text-lg font-bold text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">
                      {attorneyName.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-zinc-900 dark:text-zinc-50">
                      {attorneyName}
                    </p>
                    <p className="text-xs text-zinc-400">
                      Bar License: {c.attorney?.barLicenseNumber || 'N/A'}
                    </p>
                    <a
                      href={attorneyProfile?.phone ? `tel:${attorneyProfile.phone}` : undefined}
                      className="text-xs font-semibold text-brand hover:underline dark:text-brand-dark"
                    >
                      Direct: {attorneyProfile?.phone || 'N/A'}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
              <h3 className="flex items-center gap-2 font-bold text-zinc-900 dark:text-zinc-50">
                <Icon name="info" size={16} className="text-zinc-400" />
                Case Overview
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                {c.summary || 'No summary available.'}
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800">
                  <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                    Court / Jurisdiction
                  </p>
                  <p className="mt-1 text-base font-semibold text-zinc-900 dark:text-zinc-50">
                    {c.court || 'N/A'}
                  </p>
                </div>
                <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800">
                  <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                    Hearing Date
                  </p>
                  <p className="mt-1 text-base font-semibold text-zinc-900 dark:text-zinc-50">
                    {c.hearingDate
                      ? new Date(c.hearingDate).toLocaleDateString()
                      : 'Unassigned'}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="font-bold text-zinc-900 dark:text-zinc-50">Document Vault</h3>
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-semibold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                    {docs.length} FILES
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    {isUploading ? 'Uploading...' : 'Upload Document'}
                  </Button>
                  <input
                    type="file"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleUpload}
                  />
                </div>
              </div>

              {uploadError && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{uploadError}</p>
              )}

              <div className="mt-4 flex max-h-72 flex-col gap-2 overflow-y-auto">
                {docs.length === 0 ? (
                  <p className="text-sm text-zinc-400">No documents uploaded yet.</p>
                ) : (
                  docs.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between gap-3 rounded-lg border border-zinc-100 p-2.5 dark:border-zinc-800"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span
                          className={`grid h-8 w-8 shrink-0 place-items-center rounded-md ${DOC_ICON_TONES[doc.type] || DOC_ICON_TONES.pdf}`}
                        >
                          <Icon name="file" size={14} />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                            {doc.name}
                          </p>
                          <p className="text-xs text-zinc-400">
                            {doc.date} · {doc.size}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        icon="trash"
                        onClick={() => handleRemoveDoc(doc.id)}
                        className="text-zinc-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10"
                      />
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-5 lg:col-span-1">
            <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-2 font-bold text-zinc-900 dark:text-zinc-50">
                  <Icon name="clock" size={16} className="text-zinc-400" />
                  Case History
                </h3>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={openStatusModal}
                  disabled={allowedTransitions.length === 0}
                >
                  Update Status
                </Button>
              </div>
              <div className="mt-6 flex flex-col gap-5">
                {(c.timeline || []).map((t, index) => {
                  const label = t.type === 'HEARING' ? 'hearing' : t.toStatus
                  return (
                    <div key={t.id || index} className="flex gap-3">
                      <div className="mt-0.5 flex flex-col items-center">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${LIFECYCLE_STYLES[label] || LIFECYCLE_STYLES.ARCHIVED}`}
                        >
                          {label === 'hearing'
                            ? 'Hearing'
                            : STATUS_LABELS[label] || label}
                        </span>
                        {index !== c.timeline.length - 1 && (
                          <div className="mt-1 h-full w-px bg-zinc-200 dark:bg-zinc-800" />
                        )}
                      </div>
                      <div className="flex-1 pb-2">
                        <p className="text-xs font-semibold text-zinc-400">
                          {new Date(t.at).toLocaleString()}
                        </p>
                        <p className="mt-1 whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300">
                          {t.type === 'HEARING'
                            ? `Hearing scheduled${t.court ? ` at ${t.court}` : ''}`
                            : t.reason || `Status updated to ${STATUS_LABELS[t.toStatus] || t.toStatus}`}
                        </p>
                      </div>
                    </div>
                  )
                })}
                {!(c.timeline && c.timeline.length > 0) && (
                  <p className="text-sm text-zinc-400">No updates recorded.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {editModalOpen && (
        <ModalShell
          title="Edit Case"
          description="Update court, hearing date, and case overview."
          onClose={() => setEditModalOpen(false)}
        >
          <div className="mt-5 space-y-4">
            {editError ? (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
                {editError}
              </p>
            ) : null}
            <div>
              <label className={fieldLabel}>Court / Jurisdiction</label>
              <select
                value={editCourt}
                onChange={(e) => setEditCourt(e.target.value)}
                disabled={attorneyCourts.length === 0}
                className={fieldInput}
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
            </div>
            <div>
              <label className={fieldLabel}>Hearing Date</label>
              <input
                type="date"
                value={editHearingDate}
                onChange={(e) => setEditHearingDate(e.target.value)}
                className={fieldInput}
              />
            </div>
            <div>
              <label className={fieldLabel}>Case Overview</label>
              <textarea
                value={editSummary}
                onChange={(e) => setEditSummary(e.target.value)}
                rows={4}
                className={fieldInput + ' resize-none'}
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setEditModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={saveEdit}
              isLoading={editMutation.isPending}
              disabled={editMutation.isPending}
            >
              Save Changes
            </Button>
          </div>
        </ModalShell>
      )}

      {statusModalOpen && (
        <ModalShell
          title="Update Case Status"
          description={`Current status: ${STATUS_LABELS[c.status] || c.status}. Choose an allowed next status.`}
          onClose={() => setStatusModalOpen(false)}
        >
          <div className="mt-5 space-y-4">
            {statusError ? (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
                {statusError}
              </p>
            ) : null}
            <div>
              <label className={fieldLabel}>New Status</label>
              <select
                value={pendingStatus}
                onChange={(e) => setPendingStatus(e.target.value)}
                className={fieldInput + ' font-semibold'}
              >
                <option value="">Select next status</option>
                {ALL_STATUSES.filter((status) => status !== c.status).map(
                  (status) => {
                    const allowed = allowedTransitions.includes(status)
                    return (
                      <option key={status} value={status} disabled={!allowed}>
                        {STATUS_LABELS[status] || status}
                        {allowed ? '' : ' — not available from current'}
                      </option>
                    )
                  },
                )}
              </select>
              <p className="mt-1.5 text-xs text-zinc-400">
                Full flow: Open → In Progress → Hearing → Closed → Archived
                (plus Cancelled / Reopened).
              </p>
            </div>
            {pendingStatus === 'CLOSED' ? (
              <div>
                <label className={fieldLabel}>Outcome</label>
                <select
                  value={pendingOutcome}
                  onChange={(e) => setPendingOutcome(e.target.value)}
                  className={fieldInput + ' font-semibold'}
                >
                  <option value="WIN">Win</option>
                  <option value="LOSE">Lose</option>
                </select>
              </div>
            ) : null}
            <div>
              <label className={fieldLabel}>Summary Note</label>
              <textarea
                value={statusSummary}
                onChange={(e) => setStatusSummary(e.target.value)}
                rows={4}
                placeholder="e.g. Judge requested additional documents for review..."
                className={fieldInput + ' resize-none'}
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setStatusModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={saveStatus}
              isLoading={statusMutation.isPending}
              disabled={statusMutation.isPending || !pendingStatus}
            >
              Save Update
            </Button>
          </div>
        </ModalShell>
      )}
    </>
  )
}
