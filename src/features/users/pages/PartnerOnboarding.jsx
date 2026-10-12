import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom'
import Icon from '../../../components/common/Icon.jsx'
import { Button } from '../../../components/ui/Button.jsx'
import { organizationService } from '../../../api/services/organizationService.js'
import { userService } from '../../../api/services/userService.js'
import { fileService, uploadPublicAsset } from '../../../api/services/fileService.js'
import { normalizeAddress, parseAddress } from '../../../utils/addressUtils.js'

function SectionLabel({ icon, children }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <span className="grid h-6 w-6 place-items-center rounded-full bg-brand/10 text-brand dark:text-brand-dark">
        <Icon name={icon} size={13} />
      </span>
      <span className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
        {children}
      </span>
    </div>
  )
}

const fieldLabel = 'block text-xs font-medium text-zinc-500 dark:text-zinc-400'
const fieldInput =
  'mt-1.5 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-brand focus:bg-white dark:focus:bg-zinc-900 focus:ring-2 focus:ring-brand/30 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50'

export default function PartnerOnboarding() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const editOrg = location.state?.editOrg

  const editId = searchParams.get('id')
  const isEdit = !!editId || !!editOrg

  const parsedAddress = parseAddress(editOrg?.address)

  const [form, setForm] = useState({
    name: editOrg?.name || '',
    email: editOrg?.email || '',
    region: editOrg?.region || '',
    logoUrl: editOrg?.logoUrl || '',
    ownerUserId: editOrg?.createdBy?.id || '',
    ...parsedAddress
  })

  const [logoFile, setLogoFile] = useState(null)
  const [safetyFiles, setSafetyFiles] = useState([])
  const [existingDocs, setExistingDocs] = useState(editOrg?.vaultDocs || [])
  const [docsToDelete, setDocsToDelete] = useState([])
  const [isDragging, setIsDragging] = useState(false)

  const [ownerSearch, setOwnerSearch] = useState('')
  const [ownerResults, setOwnerResults] = useState([])
  const [isSearchingOwner, setIsSearchingOwner] = useState(false)
  const [isOwnerDropdownOpen, setIsOwnerDropdownOpen] = useState(false)
  const [selectedOwner, setSelectedOwner] = useState(editOrg?.createdBy || null)

  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingOrg, setIsLoadingOrg] = useState(!!editId && !editOrg)

  const setField = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  useEffect(() => {
    if (!editId || editOrg) return

    let cancelled = false
    const loadOrg = async () => {
      setIsLoadingOrg(true)
      setError('')
      try {
        const res = await organizationService.getOrganization(editId)
        const org = res.data?.data || res.data
        if (cancelled || !org) return
        const address = parseAddress(org.address)
        setForm({
          name: org.name || '',
          email: org.email || '',
          region: org.region || '',
          logoUrl: org.logoUrl || '',
          ownerUserId: org.createdBy?.id || '',
          ...address,
        })
        setExistingDocs(org.vaultDocs || [])
        setSelectedOwner(org.createdBy || null)
      } catch (err) {
        if (!cancelled) {
          const msg = err.response?.data?.message
          setError(
            (Array.isArray(msg) ? msg[0] : msg) ||
              'Failed to load organization for editing.',
          )
        }
      } finally {
        if (!cancelled) setIsLoadingOrg(false)
      }
    }

    loadOrg()
    return () => {
      cancelled = true
    }
  }, [editId, editOrg])

  useEffect(() => {
    const fetchUsers = async () => {
      setIsSearchingOwner(true)
      try {
        let res
        if (ownerSearch.trim()) {
          res = await userService.searchUsers({ q: ownerSearch.trim(), limit: 10 })
        } else {
          res = await userService.getUsers({ limit: 10 })
        }
        const data = res.data?.data || res.data
        setOwnerResults(data?.items || (Array.isArray(data) ? data : []))
      } catch (err) {
        console.error('Failed to search users:', err)
      } finally {
        setIsSearchingOwner(false)
      }
    }

    const timer = setTimeout(fetchUsers, 300)
    return () => clearTimeout(timer)
  }, [ownerSearch])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      let finalLogoUrl = form.logoUrl;
      let finalDocumentIds = [];

      // Upload Logo if new file selected
      if (logoFile) {
        const { url } = await uploadPublicAsset(logoFile)
        finalLogoUrl = url
      }

      // Upload Safety Files if selected
      if (safetyFiles.length > 0) {
        finalDocumentIds = await Promise.all(
          safetyFiles.map(async (file) => {
            const uploadRes = await fileService.requestUploadUrl({
              filename: file.name,
              contentType: file.type || 'application/octet-stream',
              size: file.size,
              visibility: 'PRIVATE'
            })
            const { file: fileData, upload } = uploadRes.data.data
            await fileService.uploadToStorage(upload.url, file, { 'Content-Type': file.type || 'application/octet-stream' })
            await fileService.completeUpload(fileData.id)
            return fileData.id;
          })
        )
      }

      const payload = {
        name: form.name.trim(),
        email: form.email.trim() || undefined,
        region: form.region || undefined,
        logoUrl: finalLogoUrl,
      }

      if (!isEdit) {
        payload.ownerUserId = selectedOwner ? selectedOwner.id : form.ownerUserId.trim()
        if (!payload.ownerUserId) {
          throw new Error('Please select an owner for this organization.')
        }
      }

      const normalizedAddress = normalizeAddress(form);
      if (normalizedAddress) {
        payload.address = normalizedAddress;
      }

      let savedOrgId = editId || editOrg?.id;
      if (isEdit) {
        await organizationService.updateOrganization(savedOrgId, payload)
      } else {
        const res = await organizationService.createOrganization(payload)
        savedOrgId = res.data?.data?.id || res.data?.id
      }

      if (finalDocumentIds && finalDocumentIds.length > 0 && savedOrgId) {
        await Promise.all(
          finalDocumentIds.map(docId => organizationService.addVaultDocument(savedOrgId, docId))
        )
      }

      if (docsToDelete.length > 0) {
        await Promise.all(
          docsToDelete.map(docId => organizationService.deleteVaultDocument(docId))
        )
      }

      navigate('/fleets')
    } catch (err) {
      let msg = err.response?.data?.message;
      if (Array.isArray(msg)) msg = msg[0];

      if (typeof msg === 'string' && (msg.toLowerCase().includes('contenttype') || msg.toLowerCase().includes('enum'))) {
        setError('One or more of the selected files has an unsupported format.')
      } else {
        setError(msg || err.message || 'Failed to save organization. Check your files and Owner User ID.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-0 sm:p-4 backdrop-blur-sm">
      <div className="relative flex h-full w-full max-w-[100rem] flex-col overflow-hidden rounded-none border-0 border-zinc-200 bg-white shadow-[0_0_50px_rgba(0,0,0,0.3)] dark:border-zinc-800 dark:bg-zinc-900 sm:h-[95vh] sm:w-[95vw] sm:rounded-2xl sm:border">

        {/* Window Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 p-4 px-6">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand shadow-[0_0_10px_rgba(0,229,255,0.2)]">
              <Icon name={isEdit ? 'edit' : 'building'} size={18} />
            </span>
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                {isEdit ? 'Edit Organization' : 'Onboard New Organization'}
              </h2>
              <p className="text-xs text-zinc-500">
                {isEdit
                  ? 'Update organization profile, address, and documents'
                  : 'Create a new partner organization profile'}
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/fleets')}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-zinc-400 transition hover:bg-zinc-200 hover:text-zinc-700 dark:hover:bg-zinc-800"
          >
            <Icon name="close" size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-1 flex-col overflow-hidden"
        >
          <div className="flex-1 overflow-y-auto p-6 lg:p-10">
            {error && (
              <div className="mb-6 rounded-lg bg-red-500/10 p-4 text-sm font-semibold text-red-500">
                {error}
              </div>
            )}

            {isLoadingOrg ? (
              <div className="flex justify-center py-20 text-zinc-500">
                <Icon name="spinner" className="animate-spin text-brand" size={32} />
              </div>
            ) : (
            <>
            <div className="grid gap-6 md:grid-cols-2">
            {/* company details */}
            <div>
              <SectionLabel icon="clipboard">Organization Details</SectionLabel>
              <div className="flex flex-col gap-4">
                <div>
                  <label className={fieldLabel}>Organization Name <span className="text-red-500">*</span></label>
                  <input
                    required
                    value={form.name}
                    onChange={setField('name')}
                    placeholder="e.g. Atlas Logistics Group"
                    className={fieldInput}
                  />
                </div>
                {/* Owner Selection */}
                {!isEdit && (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className={fieldLabel}>Organization Owner <span className="text-red-500">*</span></label>
                      <button
                        type="button"
                        onClick={() => navigate('/users?create=true')}
                        className="text-[10px] font-bold uppercase tracking-wider text-brand hover:underline"
                      >
                        Create New
                      </button>
                    </div>
                    <div className="relative">
                      {selectedOwner ? (
                        <div className="flex items-center justify-between rounded-lg border border-brand/50 bg-brand/5 px-3 py-2">
                          <div className="flex items-center gap-3">
                            <img
                              src={selectedOwner.avatar || selectedOwner.profile?.avatarUrl || `https://ui-avatars.com/api/?name=${selectedOwner.name || selectedOwner.profile?.name || 'User'}&background=random`}
                              alt="avatar"
                              className="h-8 w-8 rounded-full object-cover ring-2 ring-brand/20"
                            />
                            <div>
                              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                                {selectedOwner.name || selectedOwner.profile?.name || 'Unnamed User'}
                              </p>
                              <p className="text-xs text-zinc-500">{selectedOwner.email}</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => { setSelectedOwner(null); setOwnerSearch(''); setForm(f => ({...f, ownerUserId: ''})) }}
                            className="grid h-8 w-8 place-items-center rounded-lg text-zinc-400 hover:bg-white hover:text-red-500 dark:hover:bg-zinc-800"
                          >
                            <Icon name="close" size={16} />
                          </button>
                        </div>
                      ) : (
                        <div className="relative" onFocus={() => setIsOwnerDropdownOpen(true)} onBlur={(e) => {
                          if (!e.currentTarget.contains(e.relatedTarget)) {
                            setIsOwnerDropdownOpen(false)
                          }
                        }}>
                          <input
                            value={ownerSearch}
                            onChange={(e) => setOwnerSearch(e.target.value)}
                            placeholder="Search user by name or email..."
                            className={fieldInput.replace('mt-1.5 ', '')}
                          />
                          {isSearchingOwner && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400">
                              <Icon name="loader" size={16} className="animate-spin" />
                            </div>
                          )}

                          {isOwnerDropdownOpen && (
                            <div className="absolute top-full mt-2 w-full z-10 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-900" tabIndex="-1">
                              {ownerResults.length > 0 ? (
                                <div className="max-h-60 overflow-y-auto p-1">
                                  {ownerResults.map(user => (
                                    <button
                                      key={user.id}
                                      type="button"
                                      onClick={() => {
                                        setSelectedOwner(user)
                                        setOwnerSearch('')
                                        setIsOwnerDropdownOpen(false)
                                        setForm(f => ({ ...f, ownerUserId: user.id }))
                                      }}
                                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800 focus:bg-zinc-50 dark:focus:bg-zinc-800 outline-none"
                                    >
                                      <img
                                        src={user.avatar || user.profile?.avatarUrl || `https://ui-avatars.com/api/?name=${user.name || user.profile?.name || 'User'}&background=random`}
                                        alt="avatar"
                                        className="h-8 w-8 rounded-full object-cover"
                                      />
                                      <div>
                                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{user.name || user.profile?.name || 'Unnamed'}</p>
                                        <p className="text-xs text-zinc-500">{user.email}</p>
                                      </div>
                                    </button>
                                  ))}
                                </div>
                              ) : (
                                <div className="p-4 text-center text-sm text-zinc-500">
                                  {isSearchingOwner ? (
                                    <p>Searching...</p>
                                  ) : (
                                    <>
                                      <p>No users found matching "{ownerSearch}".</p>
                                      <Button
                                        type="button"
                                        variant="secondary"
                                        className="mt-3 w-full"
                                        onClick={() => navigate('/users?create=true')}
                                      >
                                        Create New User
                                      </Button>
                                    </>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
                <div>
                  <label className={fieldLabel}>Business Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={setField('email')}
                    placeholder="ops@company.com"
                    className={fieldInput}
                  />
                </div>
                <div>
                  <label className={fieldLabel}>Region</label>
                  <select
                    value={form.region}
                    onChange={setField('region')}
                    className={fieldInput}
                  >
                    <option value="">Select a region...</option>
                    <option value="North America">North America</option>
                    <option value="South America">South America</option>
                    <option value="Europe">Europe</option>
                    <option value="Asia">Asia</option>
                  </select>
                </div>
                <div>
                  <label className={fieldLabel}>Organization Logo</label>
                  <div className="mt-1.5 flex items-center gap-4 rounded-xl border border-dashed border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800/50 relative overflow-hidden group">
                    {logoFile || form.logoUrl ? (
                      <div className="relative h-16 w-16 shrink-0 rounded-full border-2 border-brand/30 bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
                        <img
                          src={logoFile ? URL.createObjectURL(logoFile) : form.logoUrl}
                          alt="Logo Preview"
                          className="h-full w-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setLogoFile(null)
                            setForm(f => ({ ...f, logoUrl: '' }))
                          }}
                          className="absolute inset-0 bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100 flex items-center justify-center"
                          title="Remove Logo"
                        >
                          <Icon name="close" size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-white text-brand shadow-sm dark:bg-zinc-900 dark:text-brand-dark">
                        <Icon name="image" size={24} />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                        {logoFile ? logoFile.name : (form.logoUrl ? 'Existing Logo' : 'Upload Logo')}
                      </p>
                      <p className="text-xs text-zinc-400">
                        {logoFile || form.logoUrl ? 'Selected' : 'JPG, PNG or SVG. Max 2MB.'}
                      </p>
                    </div>
                    <label className={`cursor-pointer rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-600 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800`}>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) setLogoFile(file)
                          e.target.value = null
                        }}
                      />
                      {logoFile || form.logoUrl ? 'Change Logo' : 'Browse'}
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Address */}
            <div>
              <SectionLabel icon="map">Address Details</SectionLabel>
              <div className="flex flex-col gap-4">
                <div>
                  <label className={fieldLabel}>Street Address</label>
                  <input
                    value={form.line1}
                    onChange={setField('line1')}
                    placeholder="123 Main St"
                    className={fieldInput}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={fieldLabel}>City</label>
                    <input
                      value={form.city}
                      onChange={setField('city')}
                      placeholder="New York"
                      className={fieldInput}
                    />
                  </div>
                  <div>
                    <label className={fieldLabel}>State/Province</label>
                    <input
                      value={form.state}
                      onChange={setField('state')}
                      placeholder="NY"
                      className={fieldInput}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={fieldLabel}>Zip/Postal Code</label>
                    <input
                      value={form.zipCode}
                      onChange={setField('zipCode')}
                      placeholder="10001"
                      className={fieldInput}
                    />
                  </div>
                  <div>
                    <label className={fieldLabel}>Country</label>
                    <input
                      value={form.country}
                      onChange={setField('country')}
                      placeholder="USA"
                      className={fieldInput}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Safety verification (Visual only for now) */}
          <div className="mt-8 border-t border-zinc-100 pt-6 dark:border-zinc-800">
            <SectionLabel icon="shield">Safety Certifications & Files</SectionLabel>
            <label
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault()
                setIsDragging(false)
                if (e.dataTransfer.files?.length) {
                  setSafetyFiles(prev => [...prev, ...Array.from(e.dataTransfer.files)])
                }
              }}
              className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed bg-zinc-50 py-8 text-center transition dark:bg-zinc-800/50 ${isDragging ? 'border-brand bg-brand/5 dark:border-brand-dark' : 'border-zinc-200 hover:bg-zinc-100/50 dark:border-zinc-700 dark:hover:bg-zinc-800/80'}`}
            >
              <input
                type="file"
                accept=".pdf,.zip"
                className="hidden"
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files || [])
                  if (files.length > 0) {
                    setSafetyFiles(prev => [...prev, ...files])
                  }
                  e.target.value = null
                }}
              />
              <span className="grid h-9 w-9 place-items-center rounded-full bg-white text-brand shadow-sm dark:bg-zinc-900 dark:text-brand-dark">
                <Icon name="upload" size={16} />
              </span>
              <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                Upload Operational Documents
              </p>
              <p className="max-w-xs text-xs text-zinc-400">
                Select ISO, DOT, or institutional safety audits here. PDF or ZIP files accepted.
              </p>
              <span className="mt-2 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
                Browse Files
              </span>
            </label>

            {(safetyFiles.length > 0 || existingDocs.length > 0) && (
              <div className="mt-3 flex flex-col gap-1">
                {existingDocs.map((doc, idx) => (
                  <div key={`existing-${idx}`} className="flex items-center justify-between rounded-lg bg-zinc-100 px-3 py-2 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                    <div className="flex items-center gap-2">
                      <Icon name="file" size={14} />
                      {doc.fileObject?.originalName || 'Existing Document'}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setDocsToDelete(prev => [...prev, doc.id]);
                        setExistingDocs(prev => prev.filter(d => d.id !== doc.id));
                      }}
                      className="text-zinc-400 hover:text-red-500"
                    >
                      <Icon name="close" size={14} />
                    </button>
                  </div>
                ))}
                {safetyFiles.map((file, idx) => (
                  <div key={`new-${idx}`} className="flex items-center justify-between rounded-lg bg-zinc-100 px-3 py-2 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                    <div className="flex items-center gap-2">
                      <Icon name="file" size={14} />
                      {file.name}
                    </div>
                    <button
                      type="button"
                      onClick={() => setSafetyFiles(prev => prev.filter((_, i) => i !== idx))}
                      className="text-zinc-400 hover:text-red-500"
                    >
                      <Icon name="close" size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-3 flex items-center gap-2 rounded-lg bg-blue-500/10 px-3 py-2 text-xs font-medium text-blue-700 dark:text-blue-400">
              <Icon name="info" size={14} />
              Files are uploaded securely to the server and will be attached to this organization.
            </div>
          </div>
          </>
            )}
          </div>

          {/* footer */}
          <div className="flex items-center justify-end gap-4 border-t border-zinc-200 bg-zinc-50 px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900/80 lg:px-10">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate('/fleets')}
              disabled={isLoading || isLoadingOrg}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              className="min-w-[140px]"
              disabled={isLoading || isLoadingOrg}
            >
              {isLoading ? 'Processing...' : (isEdit ? 'Save Changes' : 'Create Organization')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
