import { useEffect, useRef, useState } from 'react'
import Icon from './common/Icon.jsx'
import { Button } from './ui/Button.jsx'
import FileUpload from './ui/FileUpload.jsx'
import { attorneyService } from '../api/services/attorneyService.js'
import { caseService } from '../api/services/caseService.js'
import { driverService } from '../api/services/driverService.js'
import { vaultService } from '../api/services/vaultService.js'
import { getAttorneyCaseStats } from '../features/users/utils/attorneyStats.js'

const fieldLabel = 'block text-xs font-medium text-zinc-500 dark:text-zinc-400'
const fieldInput =
  'mt-1.5 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-brand focus:bg-white dark:focus:bg-zinc-900 focus:ring-2 focus:ring-brand/30 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50'

function unwrap(res) {
  return res?.data?.data ?? res?.data ?? res
}

function attorneyMeta(a) {
  const stats = getAttorneyCaseStats(a)
  const languages = Array.isArray(a.languageProficiencies)
    ? a.languageProficiencies.slice(0, 2).join(', ')
    : ''
  const specialties = Array.isArray(a.specialties)
    ? a.specialties.slice(0, 2).join(', ')
    : ''
  const states = Array.isArray(a.states) ? a.states.slice(0, 2).join(', ') : ''
  const winMeta = stats.hasCases
    ? `${stats.rateLabel} win · ${stats.total.toLocaleString()} cases`
    : null

  return [
    a.email,
    a.phone,
    a.barLicenseNumber ? `Bar ${a.barLicenseNumber}` : null,
    a.federalCircuit,
    states || null,
    Array.isArray(a.courts) && a.courts.length
      ? a.courts.slice(0, 2).join(', ')
      : null,
    languages || null,
    specialties || null,
    winMeta,
    a.yearsOfExperience ? `${a.yearsOfExperience} yrs` : null,
  ].filter(Boolean)
}

function driverMeta(d) {
  const org =
    Array.isArray(d.organizations) && d.organizations[0]
      ? d.organizations[0].name
      : null
  return [
    d.email,
    d.phone,
    d.licensePlate ? `Plate ${d.licensePlate}` : null,
    d.vinNumber ? `VIN ${d.vinNumber}` : null,
    org,
    d.status,
  ].filter(Boolean)
}

function SearchPicker({
  label,
  required,
  placeholder,
  query,
  onQueryChange,
  results,
  searching,
  selected,
  onSelect,
  onClear,
  renderResult,
  renderSelected,
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)

  useEffect(() => {
    const onClick = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  return (
    <div ref={rootRef} className="relative">
      <label className={fieldLabel}>
        {label}
        {required ? <span className="text-red-500"> *</span> : null}
      </label>
      {selected ? (
        <div className="mt-1.5 flex items-center justify-between gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800">
          <div className="min-w-0">{renderSelected(selected)}</div>
          <button
            type="button"
            onClick={() => {
              onClear()
              setOpen(false)
            }}
            className="shrink-0 text-xs font-semibold text-zinc-500 hover:text-red-600"
          >
            Change
          </button>
        </div>
      ) : (
        <>
          <div className="relative">
            <input
              value={query}
              onChange={(e) => {
                onQueryChange(e.target.value)
                setOpen(true)
              }}
              onFocus={() => setOpen(true)}
              placeholder={placeholder}
              className={fieldInput + ' pr-8'}
              autoComplete="off"
            />
            <Icon
              name={searching ? 'spinner' : 'search'}
              size={14}
              className={
                'pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 ' +
                (searching ? 'animate-spin' : '')
              }
            />
          </div>
          {open && (query.trim() || results.length > 0 || searching) && (
            <div className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-zinc-200 bg-white shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
              {searching && results.length === 0 ? (
                <p className="px-3 py-2 text-sm text-zinc-500">Searching...</p>
              ) : results.length === 0 ? (
                <p className="px-3 py-2 text-sm text-zinc-500">No matches</p>
              ) : (
                results.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onSelect(item)
                      setOpen(false)
                    }}
                    className="flex w-full items-start gap-2 px-3 py-2 text-left text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800"
                  >
                    {renderResult(item)}
                  </button>
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default function InitiateCaseModal({ open, onClose, onCreated }) {
  if (!open) return null
  return <InitiateCaseModalContent onClose={onClose} onCreated={onCreated} />
}

function InitiateCaseModalContent({ onClose, onCreated }) {
  const [step, setStep] = useState('details')
  const [createdCase, setCreatedCase] = useState(null)
  const [uploadedDocs, setUploadedDocs] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const [court, setCourt] = useState('')
  const [hearingDate, setHearingDate] = useState('')
  const [summary, setSummary] = useState('')

  const [attorneyQuery, setAttorneyQuery] = useState('')
  const [attorneyResults, setAttorneyResults] = useState([])
  const [attorneySearching, setAttorneySearching] = useState(false)
  const [selectedAttorney, setSelectedAttorney] = useState(null)

  const [driverQuery, setDriverQuery] = useState('')
  const [driverResults, setDriverResults] = useState([])
  const [driverSearching, setDriverSearching] = useState(false)
  const [selectedDriver, setSelectedDriver] = useState(null)

  const attorneyCourts = Array.isArray(selectedAttorney?.courts)
    ? selectedAttorney.courts.filter(Boolean)
    : []

  const selectAttorney = (attorney) => {
    setSelectedAttorney(attorney)
    const courts = Array.isArray(attorney?.courts)
      ? attorney.courts.filter(Boolean)
      : []
    setCourt(courts.length === 1 ? courts[0] : courts.includes(court) ? court : '')
  }

  const clearAttorney = () => {
    setSelectedAttorney(null)
    setCourt('')
  }

  useEffect(() => {
    let cancelled = false
    const timer = setTimeout(async () => {
      const q = attorneyQuery.trim()
      setAttorneySearching(true)
      try {
        const res = await attorneyService.getAttorneys({
          search: q || undefined,
          limit: 10,
          page: 1,
        })
        if (!cancelled) {
          setAttorneyResults(Array.isArray(res?.data) ? res.data : [])
        }
      } catch (err) {
        console.error('Attorney search failed', err)
        if (!cancelled) setAttorneyResults([])
      } finally {
        if (!cancelled) setAttorneySearching(false)
      }
    }, 300)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [attorneyQuery])

  useEffect(() => {
    let cancelled = false
    const timer = setTimeout(async () => {
      const q = driverQuery.trim()
      setDriverSearching(true)
      try {
        const res = await driverService.getDrivers({
          search: q || undefined,
          limit: 10,
          page: 1,
        })
        if (!cancelled) {
          setDriverResults(Array.isArray(res?.data) ? res.data : [])
        }
      } catch (err) {
        console.error('Driver search failed', err)
        if (!cancelled) setDriverResults([])
      } finally {
        if (!cancelled) setDriverSearching(false)
      }
    }, 300)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [driverQuery])

  const finish = () => {
    onCreated?.(createdCase)
    onClose()
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setError('')
    if (!selectedAttorney?.id) {
      setError('Please select a lead attorney.')
      return
    }
    if (!selectedDriver?.id) {
      setError('Please select a driver.')
      return
    }

    try {
      setIsLoading(true)
      const payload = {
        attorneyId: selectedAttorney.id,
        driverId: selectedDriver.id,
        court: court.trim() || undefined,
        hearingDate: hearingDate
          ? new Date(`${hearingDate}T12:00:00.000Z`).toISOString()
          : undefined,
        summary: summary.trim() || undefined,
      }

      const res = await caseService.createCase(payload)
      const created = unwrap(res)
      setCreatedCase(created)
      setStep('documents')
      onCreated?.(created)
    } catch (err) {
      console.error('Failed to create case', err)
      const message = err?.response?.data?.message || err?.message || 'Failed to create case'
      setError(Array.isArray(message) ? message.join(', ') : message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUploadComplete = async (file) => {
    if (!createdCase?.id || !file?.id) return
    try {
      const res = await vaultService.addCaseDocument(createdCase.id, file.id)
      const doc = unwrap(res)
      setUploadedDocs((prev) => [
        {
          id: doc?.id || file.id,
          name: file.originalName || file.filename || file.name || 'Document',
        },
        ...prev,
      ])
    } catch (err) {
      console.error('Failed to attach document', err)
      const message =
        err?.response?.data?.message || 'File uploaded but failed to attach to case'
      setError(Array.isArray(message) ? message.join(', ') : message)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4 backdrop-blur-sm">
      <div className="my-auto w-full max-w-lg rounded-2xl bg-white shadow-2xl dark:bg-zinc-900">
        <div className="flex items-start justify-between border-b border-zinc-100 p-6 pb-4 dark:border-zinc-800">
          <div>
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
              {step === 'details' ? 'Add Case' : 'Attach Documents'}
            </h2>
            <p className="mt-1 text-base text-zinc-500 dark:text-zinc-400">
              {step === 'details'
                ? 'Create the case first, then upload supporting documents.'
                : `Case #${createdCase?.id?.substring(0, 8) || ''} created. Upload documents now or skip.`}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800"
          >
            <Icon name="close" size={18} />
          </button>
        </div>

        {step === 'details' ? (
          <form onSubmit={handleCreate}>
            <div className="max-h-[70vh] space-y-4 overflow-y-auto p-6">
              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
                  {error}
                </div>
              )}

              <SearchPicker
                label="Lead Attorney"
                required
                placeholder="Search attorney by name, email, phone, bar #..."
                query={attorneyQuery}
                onQueryChange={setAttorneyQuery}
                results={attorneyResults}
                searching={attorneySearching}
                selected={selectedAttorney}
                onSelect={selectAttorney}
                onClear={clearAttorney}
                renderSelected={(a) => (
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                      {a.name}
                      {a.verified ? (
                        <span className="ml-2 rounded-full bg-green-50 px-1.5 py-0.5 text-[10px] font-semibold text-green-700 dark:bg-green-500/10 dark:text-green-300">
                          Verified
                        </span>
                      ) : null}
                    </p>
                    <p className="truncate text-xs text-zinc-500">
                      {attorneyMeta(a).slice(0, 4).join(' · ') || 'Selected attorney'}
                    </p>
                  </div>
                )}
                renderResult={(a) => (
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-zinc-900 dark:text-zinc-50">
                      {a.name}
                      {a.verified ? (
                        <span className="ml-2 rounded-full bg-green-50 px-1.5 py-0.5 text-[10px] font-semibold text-green-700 dark:bg-green-500/10 dark:text-green-300">
                          Verified
                        </span>
                      ) : null}
                    </p>
                    <p className="truncate text-xs text-zinc-500">
                      {attorneyMeta(a).slice(0, 5).join(' · ')}
                    </p>
                  </div>
                )}
              />

              <SearchPicker
                label="Driver Assignment"
                required
                placeholder="Search driver by name, email, phone, plate, VIN..."
                query={driverQuery}
                onQueryChange={setDriverQuery}
                results={driverResults}
                searching={driverSearching}
                selected={selectedDriver}
                onSelect={setSelectedDriver}
                onClear={() => setSelectedDriver(null)}
                renderSelected={(d) => (
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                      {d.name || 'Driver'}
                    </p>
                    <p className="truncate text-xs text-zinc-500">
                      {driverMeta(d).slice(0, 4).join(' · ') || 'Selected driver'}
                    </p>
                  </div>
                )}
                renderResult={(d) => (
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-zinc-900 dark:text-zinc-50">
                      {d.name || 'Unnamed driver'}
                    </p>
                    <p className="truncate text-xs text-zinc-500">
                      {driverMeta(d).slice(0, 5).join(' · ')}
                    </p>
                  </div>
                )}
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={fieldLabel}>Court / Jurisdiction</label>
                  <select
                    value={court}
                    onChange={(e) => setCourt(e.target.value)}
                    disabled={!selectedAttorney || attorneyCourts.length === 0}
                    className={fieldInput}
                  >
                    <option value="">
                      {!selectedAttorney
                        ? 'Select an attorney first'
                        : attorneyCourts.length === 0
                          ? 'No courts on this attorney'
                          : 'Select a court'}
                    </option>
                    {attorneyCourts.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={fieldLabel}>Hearing Date</label>
                  <input
                    type="date"
                    value={hearingDate}
                    onChange={(e) => setHearingDate(e.target.value)}
                    className={fieldInput}
                  />
                </div>
              </div>

              <div>
                <label className={fieldLabel}>Case Overview</label>
                <textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  rows={3}
                  placeholder="Provide a brief summary of the case objectives and constraints..."
                  className={fieldInput + ' resize-none'}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-zinc-100 p-6 pt-4 dark:border-zinc-800">
              <Button variant="ghost" onClick={onClose} type="button" disabled={isLoading}>
                Cancel
              </Button>
              <Button
                variant="primary"
                type="submit"
                isLoading={isLoading}
                disabled={!selectedAttorney?.id || !selectedDriver?.id}
                rightIcon="arrow"
              >
                Create Case
              </Button>
            </div>
          </form>
        ) : (
          <>
            <div className="max-h-[70vh] space-y-4 overflow-y-auto p-6">
              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
                  {error}
                </div>
              )}

              <FileUpload
                label="Upload Supporting Documents"
                hint="Drag and drop or click to upload (max 50MB). Files attach to this case after upload."
                visibility="PRIVATE"
                onUploadComplete={handleUploadComplete}
              />

              {uploadedDocs.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                    Attached ({uploadedDocs.length})
                  </p>
                  {uploadedDocs.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center gap-2 rounded-lg border border-zinc-100 px-3 py-2 text-sm dark:border-zinc-800"
                    >
                      <Icon name="file" size={14} className="text-zinc-400" />
                      <span className="truncate text-zinc-800 dark:text-zinc-200">{doc.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-zinc-100 p-6 pt-4 dark:border-zinc-800">
              <Button variant="ghost" type="button" onClick={finish}>
                Skip for now
              </Button>
              <Button variant="primary" type="button" onClick={finish}>
                Done
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
