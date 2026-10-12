import Icon from '../../../components/common/Icon.jsx'
import { Button } from '../../../components/ui/Button.jsx'
import { fileService } from '../../../api/services/fileService.js'

function InfoBox({ label, value }) {
  return (
    <div className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-700/50 bg-zinc-50 dark:bg-zinc-800/20">
      <p className="text-xs font-medium text-zinc-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100 break-words">
        {value}
      </p>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div className="mb-6">
      <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-zinc-400">
        {title}
      </h3>
      {children}
    </div>
  )
}

export default function OrganizationDetailModal({ open, onClose, org, onSuspend }) {
  if (!open || !org) return null

  const handleDownload = async (fileObjectId) => {
    try {
      const res = await fileService.getDownloadUrl(fileObjectId)
      const url = res.data?.data?.url || res.data?.url
      if (url) window.open(url, '_blank')
    } catch (err) {
      console.error('Failed to download file', err)
      alert('Failed to download file.')
    }
  }

  const activeDrivers = org._count?.members || org.members?.length || 0
  const subscription = org.subscriptions?.[0]?.plan?.name || 'No Subs'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-0 sm:p-4 backdrop-blur-sm">
      <div className="relative flex h-full w-full max-w-[100rem] flex-col overflow-hidden rounded-none border-0 border-zinc-200 bg-white shadow-[0_0_50px_rgba(0,0,0,0.3)] dark:border-zinc-800 dark:bg-zinc-900 md:flex-row sm:h-[95vh] sm:w-[95vw] sm:rounded-2xl sm:border">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 grid h-8 w-8 place-items-center rounded-lg bg-white/50 dark:bg-zinc-900/50 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 backdrop-blur"
        >
          <Icon name="close" size={18} />
        </button>

        {/* Left Column - Profile */}
        <div className="w-full md:w-80 lg:w-96 bg-zinc-50 dark:bg-zinc-900/50 p-6 lg:p-8 border-r border-zinc-200 dark:border-zinc-800 flex flex-col h-full overflow-y-auto">
          <div className="flex flex-col items-center text-center mt-4">
            <div className="relative">
              {org.logoUrl ? (
                <img
                  src={org.logoUrl}
                  alt={org.name}
                  className="h-24 w-24 rounded-2xl object-cover shadow-[0_0_15px_rgba(0,229,255,0.2)] ring-4 ring-white dark:ring-zinc-800"
                />
              ) : (
                <div className="grid h-24 w-24 place-items-center rounded-2xl bg-brand/10 text-brand shadow-[0_0_15px_rgba(0,229,255,0.2)] ring-4 ring-white dark:ring-zinc-800">
                  <Icon name="building" size={40} />
                </div>
              )}
              <span className={`absolute -bottom-2 -right-2 grid h-7 w-7 place-items-center rounded-full border-4 border-white text-white dark:border-zinc-800 ${org.status === 'SUSPENDED' ? 'bg-red-500' : (org.status === 'ACTIVE' ? 'bg-green-500' : 'bg-amber-500')}`}>
                <Icon name={org.status === 'SUSPENDED' ? 'ban' : 'check'} size={12} />
              </span>
            </div>
            <h2 className="mt-4 text-xl font-bold text-zinc-900 dark:text-zinc-50">
              {org.name}
            </h2>
            <p className="text-xs text-zinc-500 capitalize">
              Organization · {org.status}
            </p>
          </div>

          <div className="mt-8 space-y-4 grow">
            <InfoBox label="Email Address" value={org.email || 'N/A'} />
            <InfoBox label="Region" value={org.region || 'N/A'} />
            <InfoBox label="Address" value={org.address ? `${org.address.line1}, ${org.address.city}, ${org.address.country}` : 'N/A'} />
            <InfoBox label="Created Date" value={new Date(org.createdAt).toLocaleDateString()} />

            {/* Owner Profile Block */}
            {org.createdBy && (
              <div className="mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-800">
                <p className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">Organization Owner</p>
                <div className="flex items-center gap-3">
                  <img
                    src={org.createdBy.profile?.avatarUrl || `https://ui-avatars.com/api/?name=${org.createdBy.profile?.name || 'Owner'}&background=random`}
                    alt={org.createdBy.profile?.name || 'Owner'}
                    className="h-10 w-10 rounded-full object-cover ring-2 ring-zinc-200 dark:ring-zinc-700"
                  />
                  <div>
                    <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50">{org.createdBy.profile?.name || 'Unknown User'}</p>
                    <p className="text-xs text-zinc-500">{org.createdBy.email}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {org.status !== 'SUSPENDED' && (
            <Button
              variant="danger"
              className="mt-6 w-full"
              onClick={() => onSuspend?.(org)}
            >
              Suspend Organization
            </Button>
          )}
        </div>

        {/* Right Column - Details */}
        <div className="flex-1 p-6 lg:p-10 h-full overflow-y-auto">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

            {/* Overview Stats */}
            <div className="xl:col-span-2">
              <Section title="Overview Statistics">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 bg-zinc-50 dark:bg-zinc-800/20">
                    <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400 mb-1">
                      Active Members
                    </p>
                    <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                      {activeDrivers}
                    </p>
                  </div>
                  <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 bg-zinc-50 dark:bg-zinc-800/20">
                    <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400 mb-1">
                      Active Subscription
                    </p>
                    <p className="text-xl font-bold text-brand dark:text-brand-dark">
                      {subscription}
                    </p>
                  </div>
                </div>
              </Section>
            </div>

            {/* Address Details */}
            {org.address ? (
              <div className="xl:col-span-2">
                <Section title="Address Details">
                  <div className="grid grid-cols-2 gap-3">
                    <InfoBox label="Street" value={org.address.street || 'N/A'} />
                    <InfoBox label="City" value={org.address.city || 'N/A'} />
                    <InfoBox label="State/Province" value={org.address.state || 'N/A'} />
                    <InfoBox label="Zip Code" value={org.address.zipCode || 'N/A'} />
                  </div>
                </Section>
              </div>
            ) : (
              <div className="xl:col-span-2">
                <Section title="Address Details">
                  <div className="flex items-center justify-center p-6 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 text-zinc-400 text-sm">
                    No detailed address provided.
                  </div>
                </Section>
              </div>
            )}

            {/* Safety Documents */}
            <div className="xl:col-span-2">
              <Section title="Safety Documents">
                {org.vaultDocs && org.vaultDocs.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {org.vaultDocs.map((doc) => (
                      <div
                        key={doc.id}
                        onClick={() => doc.fileObjectId && handleDownload(doc.fileObjectId)}
                        className="flex items-center gap-3 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/20 cursor-pointer hover:border-brand/50 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-colors group"
                      >
                        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-zinc-200/50 dark:bg-zinc-900/50 text-zinc-400 group-hover:text-brand transition-colors">
                          <Icon name="file" size={20} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-200 truncate group-hover:text-brand transition-colors">
                            {doc.fileObject?.originalName || 'Document'}
                          </p>
                          <p className="text-xs text-zinc-400">
                            {(doc.fileObject?.size ? (doc.fileObject.size / 1024).toFixed(1) + ' KB' : 'Unknown size')}
                          </p>
                        </div>
                        <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity pr-2">
                          <Icon name="download" size={16} className="text-brand" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center p-6 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 text-zinc-400 text-sm">
                    No safety documents uploaded.
                  </div>
                )}
              </Section>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
