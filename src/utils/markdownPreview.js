/** Escape HTML, then apply a small set of markdown rules for safe preview. */
export function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

export function markdownToHtml(markdown) {
  const escaped = escapeHtml(markdown)
  const lines = escaped.replaceAll('\r\n', '\n').split('\n')
  const html = []
  let inList = false

  const closeList = () => {
    if (inList) {
      html.push('</ul>')
      inList = false
    }
  }

  const inline = (text) =>
    text
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(
        /`([^`]+)`/g,
        '<code class="rounded bg-zinc-100 px-1 py-0.5 text-[0.85em] dark:bg-zinc-800">$1</code>',
      )
      .replace(
        /\{\{([a-zA-Z0-9_]+)\}\}/g,
        '<span class="rounded bg-amber-50 px-1 py-0.5 font-mono text-[0.85em] text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">{{$1}}</span>',
      )

  for (const raw of lines) {
    const line = raw.trimEnd()
    if (!line.trim()) {
      closeList()
      html.push('<div class="h-3"></div>')
      continue
    }

    if (/^###\s+/.test(line)) {
      closeList()
      html.push(
        `<h3 class="mt-4 text-base font-semibold text-zinc-900 dark:text-zinc-50">${inline(line.replace(/^###\s+/, ''))}</h3>`,
      )
      continue
    }
    if (/^##\s+/.test(line)) {
      closeList()
      html.push(
        `<h2 class="mt-5 text-lg font-bold text-zinc-900 dark:text-zinc-50">${inline(line.replace(/^##\s+/, ''))}</h2>`,
      )
      continue
    }
    if (/^#\s+/.test(line)) {
      closeList()
      html.push(
        `<h1 class="mt-2 text-xl font-bold text-zinc-900 dark:text-zinc-50">${inline(line.replace(/^#\s+/, ''))}</h1>`,
      )
      continue
    }
    if (/^[-*]\s+/.test(line)) {
      if (!inList) {
        html.push('<ul class="my-2 list-disc space-y-1 pl-5 text-sm text-zinc-700 dark:text-zinc-300">')
        inList = true
      }
      html.push(`<li>${inline(line.replace(/^[-*]\s+/, ''))}</li>`)
      continue
    }
    if (/^\d+\.\s+/.test(line)) {
      closeList()
      html.push(
        `<p class="my-1 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">${inline(line)}</p>`,
      )
      continue
    }

    closeList()
    html.push(
      `<p class="my-1 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">${inline(line)}</p>`,
    )
  }

  closeList()
  return html.join('')
}

export function extractCategory(content) {
  const match = String(content ?? '').match(/\*\*Category:\*\*\s*(.+)/i)
  return match?.[1]?.trim() || null
}

export function formatTemplateDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function apiErrorMessage(error, fallback = 'Something went wrong') {
  const message = error?.response?.data?.message
  if (Array.isArray(message)) return message.join(', ')
  if (typeof message === 'string' && message.trim()) return message
  return fallback
}
