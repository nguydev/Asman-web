import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import Icon from '../../../components/common/Icon.jsx'
import { Button } from '../../../components/ui/Button.jsx'
import {
  apiErrorMessage,
  driverService,
  unwrapApiData,
} from '../../../api/services/driverService.js'
import { fileService } from '../../../api/services/fileService.js'
import { getCurrentOrganizationId } from '../../../api/services/orgContext.js'

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

async function downloadVaultDocument(doc) {
  const fileId = doc?.fileObjectId || doc?.fileObject?.id
  if (!fileId) throw new Error('No file available to download')

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
}

export default function DriverDocumentsModal({ open, driver, onClose }) {
  const [downloadingId, setDownloadingId] = useState(null)

  const { data: documents = [], isLoading, isError, error } = useQuery({
    queryKey: ['organization-driver-documents', driver?.id],
    enabled: open && !!driver?.id,
    queryFn: async () => {
      const orgId = await getCurrentOrganizationId()
      const res = await driverService.listDriverVaultDocuments(
        orgId,
        driver.id,
        { limit: 50, page: 1 },
      )
      return unwrapList(res)
    },
  })

  if (!open || !driver) return null

  const handleDownload = async (doc) => {
    setDownloadingId(doc.id)
    try {
      await downloadVaultDocument(doc)
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Failed to download document'))
    } finally {
      setDownloadingId(null)
    }
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-start justify-between gap-3 border-b border-zinc-100 p-5 dark:border-zinc-800">
          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
              Driver Documents
            </h2>
            <p className="mt-0.5 text-sm text-zinc-500">
              {driver.name || 'Driver'} · click a file to download
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

        <div className="max-h-[60vh] overflow-y-auto p-5">
          {isLoading ? (
            <p className="py-8 text-center text-sm text-zinc-500">
              Loading documents...
            </p>
          ) : isError ? (
            <p className="py-8 text-center text-sm text-red-500">
              {apiErrorMessage(error, 'Failed to load documents')}
            </p>
          ) : documents.length === 0 ? (
            <div className="flex flex-col items-center py-10 text-center">
              <span className="mb-3 grid h-12 w-12 place-items-center rounded-full bg-zinc-100 text-zinc-400 dark:bg-zinc-800">
                <Icon name="file" size={22} />
              </span>
              <p className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
                No documents yet
              </p>
              <p className="mt-1 text-xs text-zinc-400">
                Attach files from Edit Profile.
              </p>
            </div>
          ) : (
            <ul className="flex flex-col gap-2">
              {documents.map((doc) => {
                const busy = downloadingId === doc.id
                return (
                  <li key={doc.id}>
                    <button
                      type="button"
                      onClick={() => handleDownload(doc)}
                      disabled={busy}
                      className="flex w-full items-center gap-3 rounded-xl border border-zinc-100 px-3 py-3 text-left transition hover:border-brand/30 hover:bg-brand/5 disabled:opacity-60 dark:border-zinc-800 dark:hover:bg-zinc-800/60"
                    >
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-brand/10 text-brand">
                        <Icon
                          name={busy ? 'spinner' : 'file'}
                          size={16}
                          className={busy ? 'animate-spin' : undefined}
                        />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                          {documentLabel(doc)}
                        </p>
                        <p className="text-xs text-zinc-400">
                          {documentDate(doc)}
                          {busy ? ' · Opening...' : ' · Click to download'}
                        </p>
                      </div>
                      <Icon
                        name="arrow"
                        size={14}
                        className="shrink-0 text-zinc-300"
                      />
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        <div className="flex justify-end border-t border-zinc-100 px-5 py-4 dark:border-zinc-800">
          <Button type="button" variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}
