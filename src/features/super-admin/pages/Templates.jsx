import { useEffect, useMemo, useState } from 'react'
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import toast from 'react-hot-toast'
import Icon from '../../../components/common/Icon.jsx'
import { Button } from '../../../components/ui/Button.jsx'
import { Pagination } from '../../../components/ui/Pagination.jsx'
import { organizationService } from '../../../api/services/organizationService.js'
import { templateService } from '../../../api/services/templateService.js'
import { userService } from '../../../api/services/userService.js'
import {
  apiErrorMessage,
  extractCategory,
  formatTemplateDate,
  markdownToHtml,
} from '../../../utils/markdownPreview.js'

const PAGE_SIZE = 12
const EMPTY_FORM = { title: '', content: '' }

const STATUS_STYLES = {
  QUEUED: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300',
  SENT: 'bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-300',
  FAILED: 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300',
}

function unwrapList(payload) {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.items)) return payload.items
  return []
}

function personLabel(user) {
  return (
    user?.profile?.name ||
    user?.name ||
    user?.email ||
    'Unknown person'
  )
}

function TemplateCard({
  template,
  onPreview,
  onEdit,
  onSend,
  onDelete,
  deleting,
}) {
  const category = extractCategory(template.content)

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
      <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand to-brand-dark" />

      <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand/10 text-brand ring-4 ring-brand/10 transition group-hover:scale-110 dark:text-brand-dark">
        <Icon name="file" size={16} />
      </span>

      <p className="mt-3 line-clamp-2 font-semibold text-zinc-900 dark:text-zinc-50">
        {template.title}
      </p>

      {category ? (
        <span className="mt-1 w-fit rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-semibold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
          {category}
        </span>
      ) : (
        <span className="mt-1 w-fit rounded-full bg-brand/10 px-2 py-0.5 text-xs font-semibold text-brand dark:text-brand-dark">
          Markdown
        </span>
      )}

      <p className="mt-3 flex-1 text-xs text-zinc-400">
        Updated {formatTemplateDate(template.updatedAt)}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          icon="eye"
          className="flex-1"
          onClick={() => onPreview(template)}
        >
          Preview
        </Button>
        <Button
          variant="outline"
          size="sm"
          icon="mail"
          className="flex-1"
          onClick={() => onSend(template)}
        >
          Send
        </Button>
        <Button
          variant="outline"
          size="sm"
          icon="edit"
          className="flex-1"
          onClick={() => onEdit(template)}
        >
          Edit
        </Button>
        <Button
          variant="danger"
          size="icon"
          icon="trash"
          aria-label={`Delete ${template.title}`}
          isLoading={deleting}
          onClick={() => onDelete(template)}
        />
      </div>
    </div>
  )
}

function PreviewPanel({ content }) {
  return (
    <div
      className="min-h-[200px] rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-950/40"
      dangerouslySetInnerHTML={{ __html: markdownToHtml(content) }}
    />
  )
}

function PreviewModal({ template, onClose, onEdit, onSend }) {
  if (!template) return null
  const category = extractCategory(template.content)

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-zinc-900">
        <div className="flex items-start justify-between gap-4 border-b border-zinc-100 p-5 dark:border-zinc-800">
          <div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
              {template.title}
            </h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {category ? `${category} · ` : ''}
              Updated {formatTemplateDate(template.updatedAt)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800"
          >
            <Icon name="close" size={20} />
          </button>
        </div>

        <div className="overflow-y-auto p-5">
          <PreviewPanel content={template.content || ''} />
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-zinc-100 px-5 py-4 dark:border-zinc-800">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button
            variant="outline"
            icon="edit"
            onClick={() => {
              onClose()
              onEdit(template)
            }}
          >
            Edit
          </Button>
          <Button
            variant="primary"
            icon="mail"
            onClick={() => {
              onClose()
              onSend(template)
            }}
          >
            Send email
          </Button>
        </div>
      </div>
    </div>
  )
}

function EditorModal({ mode, initial, onClose, onSave, isPending }) {
  const [form, setForm] = useState(() => ({
    title: initial.title ?? '',
    content: initial.content ?? '',
  }))
  const [tab, setTab] = useState('write')

  const canSave =
    form.title.trim().length > 0 &&
    form.content.trim().length > 0 &&
    !isPending

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!canSave) return
    onSave({
      title: form.title.trim(),
      content: form.content.trim(),
    })
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-zinc-900">
        <div className="flex items-start justify-between gap-4 border-b border-zinc-100 p-5 dark:border-zinc-800">
          <div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
              {mode === 'create' ? 'Add template' : 'Edit template'}
            </h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Write in Markdown. Use {'{{placeholders}}'} for fields filled later.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="rounded-lg p-2 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800"
          >
            <Icon name="close" size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="space-y-4 overflow-y-auto p-5">
            <div>
              <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                Title
              </label>
              <input
                type="text"
                required
                maxLength={200}
                value={form.title}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, title: e.target.value }))
                }
                className="mt-1.5 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/30 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
              />
            </div>

            <div>
              <div className="flex items-center justify-between gap-3">
                <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                  Content
                </label>
                <div className="inline-flex rounded-lg border border-zinc-200 p-0.5 dark:border-zinc-700">
                  {[
                    { id: 'write', label: 'Write', icon: 'edit' },
                    { id: 'preview', label: 'Preview', icon: 'eye' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setTab(item.id)}
                      className={
                        'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition ' +
                        (tab === item.id
                          ? 'bg-brand text-white'
                          : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800')
                      }
                    >
                      <Icon name={item.icon} size={12} />
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {tab === 'write' ? (
                <textarea
                  required
                  rows={16}
                  value={form.content}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, content: e.target.value }))
                  }
                  className="mt-1.5 w-full resize-y rounded-lg border border-zinc-200 bg-white px-3 py-2 font-mono text-sm leading-relaxed outline-none focus:border-brand focus:ring-2 focus:ring-brand/30 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
                />
              ) : (
                <div className="mt-1.5">
                  {form.content.trim() ? (
                    <PreviewPanel content={form.content} />
                  ) : (
                    <div className="rounded-xl border border-dashed border-zinc-200 p-10 text-center text-sm text-zinc-400 dark:border-zinc-700">
                      Nothing to preview yet.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-zinc-100 px-5 py-4 dark:border-zinc-800">
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              icon="save"
              isLoading={isPending}
              disabled={!canSave}
            >
              {mode === 'create' ? 'Create template' : 'Save changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

function DeleteConfirmModal({ template, onClose, onConfirm, isPending }) {
  if (!template) return null
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-red-500/10 text-red-500">
            <Icon name="warning" size={18} />
          </span>
          <div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
              Delete template?
            </h3>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              “{template.title}” will be permanently removed.
            </p>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Keep it
          </Button>
          <Button variant="danger" icon="trash" isLoading={isPending} onClick={onConfirm}>
            Delete
          </Button>
        </div>
      </div>
    </div>
  )
}

function SendEmailModal({
  initialTemplate,
  templates,
  onClose,
  onSent,
}) {
  const [recipientType, setRecipientType] = useState('USER')
  const [recipientQuery, setRecipientQuery] = useState('')
  const [recipientResults, setRecipientResults] = useState([])
  const [recipientSearching, setRecipientSearching] = useState(false)
  const [selectedRecipient, setSelectedRecipient] = useState(null)
  const [templateId, setTemplateId] = useState(initialTemplate?.id || '')
  const [subject, setSubject] = useState(initialTemplate?.title || '')
  const [content, setContent] = useState(initialTemplate?.content || '')
  const [bodyTab, setBodyTab] = useState('write')
  const [isSending, setIsSending] = useState(false)

  const applyTemplate = (id) => {
    setTemplateId(id)
    const selected = templates.find((t) => t.id === id)
    if (!selected) return
    setSubject(selected.title)
    setContent(selected.content)
  }

  useEffect(() => {
    let cancelled = false
    const timer = setTimeout(async () => {
      const q = recipientQuery.trim()
      setRecipientSearching(true)
      try {
        if (recipientType === 'USER') {
          const res = q
            ? await userService.searchUsers({ q, limit: 10 })
            : await userService.getUsers({ limit: 10 })
          const data = unwrapList(res.data?.data ?? res.data)
          if (!cancelled) setRecipientResults(data)
        } else {
          const res = await organizationService.getOrganizations({
            limit: 20,
            ...(q ? { search: q } : {}),
          })
          const data = unwrapList(res.data?.data ?? res.data)
          const filtered = q
            ? data.filter(
                (org) =>
                  org.name?.toLowerCase().includes(q.toLowerCase()) ||
                  org.email?.toLowerCase().includes(q.toLowerCase()),
              )
            : data
          if (!cancelled) setRecipientResults(filtered.slice(0, 10))
        }
      } catch {
        if (!cancelled) setRecipientResults([])
      } finally {
        if (!cancelled) setRecipientSearching(false)
      }
    }, 300)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [recipientQuery, recipientType])

  const canSend =
    !!templateId &&
    !!selectedRecipient &&
    subject.trim().length > 0 &&
    content.trim().length > 0 &&
    !isSending

  const handleSend = async (e) => {
    e.preventDefault()
    if (!canSend) return
    setIsSending(true)
    try {
      const payload = {
        templateId,
        recipientType,
        subject: subject.trim(),
        content: content.trim(),
      }
      if (recipientType === 'USER') payload.userId = selectedRecipient.id
      else payload.organizationId = selectedRecipient.id

      await templateService.send(payload)
      toast.success('Email queued for delivery.')
      onSent?.()
      onClose()
    } catch (error) {
      toast.error(apiErrorMessage(error, 'Could not send email.'))
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="flex max-h-[94vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-zinc-900">
        <div className="flex items-start justify-between gap-4 border-b border-zinc-100 p-5 dark:border-zinc-800">
          <div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
              Send email
            </h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Choose a person or organization contact email, start from a template,
              then edit before sending.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSending}
            className="rounded-lg p-2 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800"
          >
            <Icon name="close" size={20} />
          </button>
        </div>

        <form onSubmit={handleSend} className="flex min-h-0 flex-1 flex-col">
          <div className="space-y-5 overflow-y-auto p-5">
            <div className="inline-flex rounded-lg border border-zinc-200 p-0.5 dark:border-zinc-700">
              {[
                { id: 'USER', label: 'Person', icon: 'user' },
                { id: 'ORGANIZATION', label: 'Organization', icon: 'building' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setRecipientType(item.id)
                    setSelectedRecipient(null)
                    setRecipientQuery('')
                    setRecipientResults([])
                  }}
                  className={
                    'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition ' +
                    (recipientType === item.id
                      ? 'bg-brand text-white'
                      : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800')
                  }
                >
                  <Icon name={item.icon} size={12} />
                  {item.label}
                </button>
              ))}
            </div>

            <div>
              <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                Recipient
              </label>
              {selectedRecipient ? (
                <div className="mt-1.5 flex items-center justify-between rounded-lg border border-brand/30 bg-brand/5 px-3 py-2">
                  <div>
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                      {recipientType === 'USER'
                        ? personLabel(selectedRecipient)
                        : selectedRecipient.name}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {selectedRecipient.email || 'No email on file'}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedRecipient(null)}
                  >
                    Change
                  </Button>
                </div>
              ) : (
                <div className="relative mt-1.5">
                  <Icon
                    name="search"
                    size={14}
                    className="pointer-events-none absolute left-3 top-3 text-zinc-400"
                  />
                  <input
                    value={recipientQuery}
                    onChange={(e) => setRecipientQuery(e.target.value)}
                    placeholder={
                      recipientType === 'USER'
                        ? 'Search people by name or email…'
                        : 'Search organizations…'
                    }
                    className="w-full rounded-lg border border-zinc-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/30 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
                  />
                  <div className="mt-2 max-h-48 overflow-y-auto rounded-lg border border-zinc-200 dark:border-zinc-700">
                    {recipientSearching ? (
                      <p className="px-3 py-3 text-sm text-zinc-400">Searching…</p>
                    ) : recipientResults.length === 0 ? (
                      <p className="px-3 py-3 text-sm text-zinc-400">No matches</p>
                    ) : (
                      recipientResults.map((row) => {
                        const email = row.email
                        const label =
                          recipientType === 'USER' ? personLabel(row) : row.name
                        return (
                          <button
                            key={row.id}
                            type="button"
                            disabled={!email}
                            onClick={() => setSelectedRecipient(row)}
                            className="flex w-full items-start justify-between gap-3 border-b border-zinc-100 px-3 py-2 text-left last:border-0 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:hover:bg-zinc-800/60"
                          >
                            <span>
                              <span className="block text-sm font-medium text-zinc-900 dark:text-zinc-50">
                                {label}
                              </span>
                              <span className="block text-xs text-zinc-500">
                                {email || 'No email — cannot send'}
                              </span>
                            </span>
                          </button>
                        )
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                Template
              </label>
              <select
                required
                value={templateId}
                onChange={(e) => applyTemplate(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/30 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
              >
                <option value="">Select a template…</option>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                Subject
              </label>
              <input
                required
                maxLength={300}
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/30 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
              />
            </div>

            <div>
              <div className="flex items-center justify-between gap-3">
                <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                  Body
                </label>
                <div className="inline-flex rounded-lg border border-zinc-200 p-0.5 dark:border-zinc-700">
                  {[
                    { id: 'write', label: 'Write', icon: 'edit' },
                    { id: 'preview', label: 'Preview', icon: 'eye' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setBodyTab(item.id)}
                      className={
                        'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition ' +
                        (bodyTab === item.id
                          ? 'bg-brand text-white'
                          : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800')
                      }
                    >
                      <Icon name={item.icon} size={12} />
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
              {bodyTab === 'write' ? (
                <textarea
                  required
                  rows={12}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="mt-1.5 w-full resize-y rounded-lg border border-zinc-200 bg-white px-3 py-2 font-mono text-sm leading-relaxed outline-none focus:border-brand focus:ring-2 focus:ring-brand/30 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
                />
              ) : (
                <div className="mt-1.5">
                  <PreviewPanel content={content} />
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-zinc-100 px-5 py-4 dark:border-zinc-800">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSending}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              icon="send"
              isLoading={isSending}
              disabled={!canSend}
            >
              Send email
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

function DispatchPreviewModal({ dispatch, onClose }) {
  if (!dispatch) return null
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-zinc-900">
        <div className="flex items-start justify-between gap-4 border-b border-zinc-100 p-5 dark:border-zinc-800">
          <div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
              {dispatch.subject}
            </h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              To {dispatch.toEmail} · {dispatch.recipientType} ·{' '}
              <span
                className={
                  'rounded-full px-2 py-0.5 text-xs font-semibold ' +
                  (STATUS_STYLES[dispatch.status] || STATUS_STYLES.QUEUED)
                }
              >
                {dispatch.status}
              </span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800"
          >
            <Icon name="close" size={20} />
          </button>
        </div>
        <div className="overflow-y-auto p-5">
          <PreviewPanel content={dispatch.bodyMarkdown || ''} />
          {dispatch.error && (
            <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-300">
              {dispatch.error}
            </p>
          )}
        </div>
        <div className="flex justify-end border-t border-zinc-100 px-5 py-4 dark:border-zinc-800">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}

function SentHistory({ searchQuery }) {
  const [page, setPage] = useState(1)
  const [preview, setPreview] = useState(null)

  const { data, isLoading, isFetching, isPlaceholderData, isError } = useQuery({
    queryKey: ['template-sends', page, searchQuery],
    queryFn: () => {
      const params = { page, limit: PAGE_SIZE }
      if (searchQuery) params.search = searchQuery
      return templateService.listSends(params)
    },
    placeholderData: keepPreviousData,
  })

  const rows = Array.isArray(data?.data) ? data.data : []
  const totalRecords = data?.pagination?.total || 0
  const totalPages = data?.pagination?.totalPages || 1

  if (isError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
        Couldn’t load send history.
      </div>
    )
  }

  if (isLoading && rows.length === 0) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-16 animate-pulse rounded-xl border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900"
          />
        ))}
      </div>
    )
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-200 bg-white px-6 py-16 text-center dark:border-zinc-700 dark:bg-zinc-900">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-brand/10 text-brand">
          <Icon name="mail" size={20} />
        </span>
        <h3 className="mt-4 text-base font-semibold text-zinc-900 dark:text-zinc-50">
          No emails sent yet
        </h3>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Sends from the Library tab will show up here.
        </p>
      </div>
    )
  }

  return (
    <>
      <div
        className={
          'overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 ' +
          (isFetching && isPlaceholderData ? 'opacity-60' : '')
        }
      >
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {rows.map((row) => (
            <button
              key={row.id}
              type="button"
              onClick={() => setPreview(row)}
              className="flex w-full flex-col gap-2 px-4 py-3 text-left transition hover:bg-zinc-50 dark:hover:bg-zinc-800/50 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="truncate font-semibold text-zinc-900 dark:text-zinc-50">
                  {row.subject}
                </p>
                <p className="mt-0.5 truncate text-sm text-zinc-500">
                  To {row.toEmail}
                  {row.recipientType === 'ORGANIZATION' &&
                  row.recipientOrganization?.name
                    ? ` · ${row.recipientOrganization.name}`
                    : ''}
                  {row.recipientType === 'USER' &&
                  row.recipientUser?.profile?.name
                    ? ` · ${row.recipientUser.profile.name}`
                    : ''}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span
                  className={
                    'rounded-full px-2 py-0.5 text-xs font-semibold ' +
                    (STATUS_STYLES[row.status] || STATUS_STYLES.QUEUED)
                  }
                >
                  {row.status}
                </span>
                <span className="text-xs text-zinc-400">
                  {formatTemplateDate(row.sentAt || row.createdAt)}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        totalItems={totalRecords}
        itemsPerPage={PAGE_SIZE}
        onPageChange={setPage}
      />

      {preview && (
        <DispatchPreviewModal dispatch={preview} onClose={() => setPreview(null)} />
      )}
    </>
  )
}

export default function Templates() {
  const queryClient = useQueryClient()
  const [tab, setTab] = useState('library')
  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [preview, setPreview] = useState(null)
  const [editor, setEditor] = useState(null)
  const [pendingDelete, setPendingDelete] = useState(null)
  const [sendState, setSendState] = useState(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput.trim())
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  const { data: listResult, isLoading, isFetching, isPlaceholderData, isError } =
    useQuery({
      queryKey: ['templates', page, searchQuery],
      queryFn: () => {
        const params = { page, limit: PAGE_SIZE }
        if (searchQuery) params.search = searchQuery
        return templateService.list(params)
      },
      placeholderData: keepPreviousData,
      enabled: tab === 'library',
    })

  const { data: allTemplatesResult } = useQuery({
    queryKey: ['templates-all-for-send'],
    queryFn: () => templateService.list({ page: 1, limit: 100 }),
  })

  const templates = Array.isArray(listResult?.data) ? listResult.data : []
  const allTemplates = Array.isArray(allTemplatesResult?.data)
    ? allTemplatesResult.data
    : templates
  const totalRecords = listResult?.pagination?.total || 0
  const totalPages = listResult?.pagination?.totalPages || 1
  const showInitialLoading = tab === 'library' && isLoading && templates.length === 0
  const isRefreshing =
    tab === 'library' && isFetching && (isPlaceholderData || templates.length > 0)

  const saveMutation = useMutation({
    mutationFn: async ({ mode, id, payload }) => {
      if (mode === 'create') return templateService.create(payload)
      return templateService.update(id, payload)
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['templates'] })
      queryClient.invalidateQueries({ queryKey: ['templates-all-for-send'] })
      setEditor(null)
      toast.success(
        variables.mode === 'create' ? 'Template created.' : 'Template updated.',
      )
    },
    onError: (error) => {
      toast.error(apiErrorMessage(error, 'Could not save template.'))
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => templateService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] })
      queryClient.invalidateQueries({ queryKey: ['templates-all-for-send'] })
      setPendingDelete(null)
      toast.success('Template deleted.')
    },
    onError: (error) => {
      toast.error(apiErrorMessage(error, 'Could not delete template.'))
    },
  })

  const editorInitial = useMemo(() => {
    if (!editor || editor === 'new') return EMPTY_FORM
    return {
      title: editor.title ?? '',
      content: editor.content ?? '',
    }
  }, [editor])

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="inline-flex rounded-lg border border-zinc-200 p-0.5 dark:border-zinc-700">
            {[
              { id: 'library', label: 'Library', icon: 'file' },
              { id: 'sent', label: 'Sent', icon: 'mail' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={
                  'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition ' +
                  (tab === item.id
                    ? 'bg-brand text-white'
                    : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800')
                }
              >
                <Icon name={item.icon} size={12} />
                {item.label}
              </button>
            ))}
          </div>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            {tab === 'library'
              ? 'Reusable Markdown letters. Preview, edit, or email a person / organization.'
              : 'Delivery history for template emails (queued, sent, or failed).'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Icon
              name="search"
              size={14}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
            />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={
                tab === 'library' ? 'Search templates...' : 'Search sent emails...'
              }
              className="w-56 rounded-lg border border-zinc-200 bg-white py-2 pl-9 pr-3 text-sm text-zinc-900 outline-none focus:border-brand focus:ring-2 focus:ring-brand/30 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
            />
          </div>
          {tab === 'library' && (
            <>
              <Button variant="outline" icon="mail" onClick={() => setSendState({})}>
                Send email
              </Button>
              <Button variant="primary" icon="plus" onClick={() => setEditor('new')}>
                New template
              </Button>
            </>
          )}
        </div>
      </div>

      {tab === 'sent' ? (
        <SentHistory key={searchQuery || 'all'} searchQuery={searchQuery} />
      ) : (
        <>
          {isError && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
              Couldn’t load templates. Check your connection and try refreshing.
            </div>
          )}

          {showInitialLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-[190px] animate-pulse rounded-xl border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900"
                />
              ))}
            </div>
          ) : templates.length === 0 ? (
            <div className="rounded-xl border border-dashed border-zinc-200 bg-white px-6 py-16 text-center dark:border-zinc-700 dark:bg-zinc-900">
              <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-brand/10 text-brand">
                <Icon name="file" size={20} />
              </span>
              <h3 className="mt-4 text-base font-semibold text-zinc-900 dark:text-zinc-50">
                {searchQuery ? 'No matches' : 'No templates yet'}
              </h3>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                {searchQuery
                  ? `Nothing matched “${searchQuery}”.`
                  : 'Create your first letter template to get started.'}
              </p>
              {!searchQuery && (
                <div className="mt-5">
                  <Button variant="primary" icon="plus" onClick={() => setEditor('new')}>
                    Add template
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div
              className={
                'grid gap-4 sm:grid-cols-2 lg:grid-cols-3 transition-opacity duration-150 ' +
                (isRefreshing ? 'opacity-60' : 'opacity-100')
              }
            >
              {templates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onPreview={setPreview}
                  onEdit={setEditor}
                  onSend={(tpl) => setSendState({ template: tpl })}
                  onDelete={setPendingDelete}
                  deleting={
                    deleteMutation.isPending && pendingDelete?.id === template.id
                  }
                />
              ))}

              <button
                type="button"
                onClick={() => setEditor('new')}
                className="flex min-h-[190px] flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-zinc-200 text-zinc-400 transition hover:border-brand/40 hover:text-brand dark:border-zinc-700 dark:hover:text-brand-dark"
              >
                <Icon name="plus" size={20} />
                <span className="text-sm font-semibold">Add New Template</span>
              </button>
            </div>
          )}

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={totalRecords}
            itemsPerPage={PAGE_SIZE}
            onPageChange={setPage}
          />
        </>
      )}

      {preview && (
        <PreviewModal
          template={preview}
          onClose={() => setPreview(null)}
          onEdit={setEditor}
          onSend={(tpl) => setSendState({ template: tpl })}
        />
      )}

      {editor && (
        <EditorModal
          key={editor === 'new' ? 'new' : editor.id}
          mode={editor === 'new' ? 'create' : 'edit'}
          initial={editorInitial}
          isPending={saveMutation.isPending}
          onClose={() => setEditor(null)}
          onSave={(payload) =>
            saveMutation.mutate({
              mode: editor === 'new' ? 'create' : 'edit',
              id: editor === 'new' ? undefined : editor.id,
              payload,
            })
          }
        />
      )}

      {pendingDelete && (
        <DeleteConfirmModal
          template={pendingDelete}
          isPending={deleteMutation.isPending}
          onClose={() => setPendingDelete(null)}
          onConfirm={() => deleteMutation.mutate(pendingDelete.id)}
        />
      )}

      {sendState && (
        <SendEmailModal
          key={sendState.template?.id || 'blank'}
          initialTemplate={sendState.template}
          templates={allTemplates}
          onClose={() => setSendState(null)}
          onSent={() => {
            queryClient.invalidateQueries({ queryKey: ['template-sends'] })
            setTab('sent')
          }}
        />
      )}
    </div>
  )
}
