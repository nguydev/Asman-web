import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import Icon from '../../../components/common/Icon.jsx'
import { Button } from '../../../components/ui/Button.jsx'
import FileUpload from '../../../components/ui/FileUpload.jsx'
import {
  apiErrorMessage,
  driverService,
  unwrapApiData,
} from '../../../api/services/driverService.js'
import { fileService } from '../../../api/services/fileService.js'
import { getCurrentOrganizationId } from '../../../api/services/orgContext.js'

const fieldLabel = 'block text-xs font-medium text-zinc-500 dark:text-zinc-400'
const fieldInput =
  'mt-1.5 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-brand focus:bg-white dark:focus:bg-zinc-900 focus:ring-2 focus:ring-brand/30 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50'

function SectionLabel({ icon = 'user', children }) {
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

function unwrapList(res) {
  const payload = unwrapApiData(res)
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  return []
}

function documentLabel(doc) {
  return (
    doc?.name ||
    doc?.fileObject?.originalName ||
    doc?.fileObject?.filename ||
    'Document'
  )
}

function documentDate(doc) {
  const value = doc?.uploadedAt || doc?.createdAt
  if (!value) return '—'
  return new Date(value).toLocaleString()
}

function PageFrame({ title, subtitle, icon, onClose, footer, children }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm">
      <div className="my-auto w-full max-w-3xl rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-start justify-between gap-4 border-b border-zinc-100 p-6 dark:border-zinc-800">
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand">
              <Icon name={icon} size={18} />
            </span>
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                {title}
              </h2>
              <p className="mt-0.5 text-sm text-zinc-500">{subtitle}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800"
          >
            <Icon name="close" size={18} />
          </button>
        </div>
        {children}
        {footer}
      </div>
    </div>
  )
}

export default function EditDriverPage() {
  const { driverId } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '',
    vinNumber: '',
    licensePlate: '',
  })
  const [docName, setDocName] = useState('')

  const {
    data,
    isLoading,
    isError,
    error: loadError,
  } = useQuery({
    queryKey: ['organization-driver', driverId],
    enabled: !!driverId,
    queryFn: async () => {
      const orgId = await getCurrentOrganizationId()
      const [driverRes, docsRes] = await Promise.all([
        driverService.getOrganizationDriver(orgId, driverId),
        driverService.listDriverVaultDocuments(orgId, driverId, {
          limit: 50,
          page: 1,
        }),
      ])
      return {
        orgId,
        driver: unwrapApiData(driverRes),
        documents: unwrapList(docsRes),
      }
    },
  })

  useEffect(() => {
    if (!data?.driver) return
    setForm({
      name: data.driver.user?.profile?.name || '',
      vinNumber: data.driver.vinNumber || '',
      licensePlate: data.driver.licensePlate || '',
    })
  }, [data])

  const invalidateDriver = () => {
    queryClient.invalidateQueries({ queryKey: ['organization-driver', driverId] })
    queryClient.invalidateQueries({ queryKey: ['organization-drivers'] })
  }

  const { mutate: saveProfile, isPending } = useMutation({
    mutationFn: async () => {
      const orgId = data?.orgId || (await getCurrentOrganizationId())
      await driverService.updateOrganizationDriver(orgId, driverId, {
        name: form.name.trim(),
        vinNumber: form.vinNumber.trim(),
        licensePlate: form.licensePlate.trim(),
      })
    },
    onSuccess: () => {
      toast.success('Driver profile updated')
      invalidateDriver()
    },
    onError: (err) => {
      setError(apiErrorMessage(err, 'Failed to update driver'))
    },
  })

  const { mutate: removeDocument, isPending: isRemoving } = useMutation({
    mutationFn: async (documentId) => {
      const orgId = data?.orgId || (await getCurrentOrganizationId())
      await driverService.deleteDriverVaultDocument(orgId, driverId, documentId)
    },
    onSuccess: () => {
      toast.success('Document removed')
      invalidateDriver()
    },
    onError: (err) => {
      toast.error(apiErrorMessage(err, 'Failed to remove document'))
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    if (!form.name.trim() || !form.vinNumber.trim() || !form.licensePlate.trim()) {
      setError('Name, VIN, and license plate are required.')
      return
    }
    saveProfile()
  }

  const handleUploadComplete = async (file) => {
    if (!file?.id) return
    try {
      const orgId = data?.orgId || (await getCurrentOrganizationId())
      await driverService.addDriverVaultDocument(orgId, driverId, {
        fileObjectId: file.id,
        name:
          docName.trim() ||
          file.originalName ||
          file.filename ||
          'Document',
      })
      setDocName('')
      toast.success('Document attached')
      invalidateDriver()
    } catch (err) {
      toast.error(apiErrorMessage(err, 'File uploaded but failed to attach'))
    }
  }

  const handleDownload = async (doc) => {
    const fileId = doc?.fileObjectId || doc?.fileObject?.id
    if (!fileId) {
      toast.error('No file available to download')
      return
    }
    try {
      const res = await fileService.getDownloadUrl(fileId)
      const payload = unwrapApiData(res)
      const url =
        (typeof payload === 'string' && payload) ||
        payload?.url ||
        payload?.data?.url ||
        payload?.downloadUrl
      if (typeof url !== 'string' || !url) {
        throw new Error('Download URL missing')
      }
      window.open(url, '_blank', 'noopener,noreferrer')
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Failed to get download URL'))
    }
  }

  const close = () => navigate('/drivers')
  const documents = data?.documents || []

  if (isLoading) {
    return (
      <PageFrame
        title="Edit Driver"
        subtitle="Loading driver profile..."
        icon="edit"
        onClose={close}
      >
        <div className="p-10 text-center text-zinc-500">Loading driver...</div>
      </PageFrame>
    )
  }

  if (isError || !data?.driver) {
    return (
      <PageFrame
        title="Edit Driver"
        subtitle="Unable to load this driver"
        icon="edit"
        onClose={close}
      >
        <div className="p-10 text-center text-red-500">
          {apiErrorMessage(loadError, 'Failed to load driver.')}
        </div>
      </PageFrame>
    )
  }

  return (
    <PageFrame
      title="Edit Driver"
      subtitle="Update profile details and manage vault documents."
      icon="edit"
      onClose={close}
      footer={
        <div className="flex items-center justify-end gap-3 border-t border-zinc-100 px-6 py-4 dark:border-zinc-800">
          <Button
            type="button"
            variant="ghost"
            onClick={close}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            form="edit-driver-form"
            variant="primary"
            type="submit"
            icon="check"
            disabled={isPending}
            isLoading={isPending}
          >
            Save Profile
          </Button>
        </div>
      }
    >
      <div className="max-h-[75vh] space-y-8 overflow-y-auto p-6">
        <form id="edit-driver-form" onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-500/10 px-3 py-2 text-sm font-medium text-red-500">
              {error}
            </div>
          )}

          <section>
            <SectionLabel icon="user">Profile</SectionLabel>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={fieldLabel}>Full Name</label>
                <input
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  required
                  className={fieldInput}
                />
              </div>
              <div>
                <label className={fieldLabel}>Email</label>
                <input
                  value={data.driver.user?.email || ''}
                  disabled
                  className={`${fieldInput} opacity-70`}
                />
              </div>
              <div>
                <label className={fieldLabel}>VIN Number</label>
                <input
                  value={form.vinNumber}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, vinNumber: e.target.value }))
                  }
                  required
                  className={fieldInput}
                />
              </div>
              <div>
                <label className={fieldLabel}>License Plate</label>
                <input
                  value={form.licensePlate}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, licensePlate: e.target.value }))
                  }
                  required
                  className={fieldInput}
                />
              </div>
            </div>
          </section>
        </form>

        <section className="border-t border-zinc-100 pt-6 dark:border-zinc-800">
          <SectionLabel icon="file">Vault Documents</SectionLabel>
          <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
            Upload files with the shared uploader. Each file is linked to this
            driver’s vault after upload completes.
          </p>

          <div className="mb-4">
            <label className={fieldLabel}>Document name (optional)</label>
            <input
              value={docName}
              onChange={(e) => setDocName(e.target.value)}
              placeholder="Defaults to original filename"
              className={fieldInput}
            />
          </div>

          <FileUpload
            label="Upload document"
            hint="PDF, PNG, or other supported files (max 50MB)"
            visibility="PRIVATE"
            onUploadComplete={handleUploadComplete}
          />

          <div className="mt-5 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
              Attached ({documents.length})
            </p>
            {documents.length === 0 ? (
              <p className="text-sm text-zinc-400">No documents attached yet.</p>
            ) : (
              documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-zinc-100 p-2.5 dark:border-zinc-800"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                      {documentLabel(doc)}
                    </p>
                    <p className="text-xs text-zinc-400">{documentDate(doc)}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownload(doc)}
                    >
                      Download
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      icon="trash"
                      disabled={isRemoving}
                      onClick={() => {
                        if (
                          window.confirm(
                            'Remove this document from the driver vault?',
                          )
                        ) {
                          removeDocument(doc.id)
                        }
                      }}
                      className="text-zinc-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10"
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </PageFrame>
  )
}
