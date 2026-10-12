import { useEffect, useRef, useState } from 'react'
import Icon from './common/Icon.jsx'

const INITIAL_NOTIFICATIONS = [
  {
    id: 1,
    icon: 'warning',
    tone: 'red',
    title: 'Emergency at West Texas Detention Center',
    text: 'High priority alert requiring immediate attention.',
    time: '2M AGO',
    unread: true,
  },
  {
    id: 2,
    icon: 'clock',
    tone: 'cyan',
    title: 'Unit #402 overspeeding detected',
    text: 'Vehicle exceeded 75mph on I-10 East.',
    time: '15M AGO',
    unread: true,
  },
  {
    id: 3,
    icon: 'briefcase',
    tone: 'gray',
    title: 'New case assignment: Case #2940-A',
    text: 'Legal department has assigned a new risk review.',
    time: '1H AGO',
    unread: true,
  },
  {
    id: 4,
    icon: 'check',
    tone: 'green',
    title: 'Subscription successfully renewed',
    text: 'Your Enterprise Safety plan is active until Oct 2024.',
    time: '3H AGO',
    unread: false,
  },
]

const TONES = {
  red: 'bg-red-500/10 text-red-600 dark:text-red-400',
  cyan: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
  gray: 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400',
  green: 'bg-green-500/10 text-green-600 dark:text-green-400',
}

export default function NotificationsPanel({ open, onClose }) {
  const [tab, setTab] = useState('All')
  const [items, setItems] = useState(INITIAL_NOTIFICATIONS)
  const panelRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const handleClick = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) onClose()
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open, onClose])

  if (!open) return null

  const visible = tab === 'Unread' ? items.filter((n) => n.unread) : items
  const markAllRead = () =>
    setItems((prev) => prev.map((n) => ({ ...n, unread: false })))

  return (
    <div
      ref={panelRef}
      className="absolute right-0 top-full z-50 mt-2 w-[22rem] max-w-[90vw] overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-900"
    >
      <div className="flex items-center justify-between px-4 pt-4">
        <h3 className="font-bold text-zinc-900 dark:text-zinc-50">Notifications</h3>
        <button
          onClick={markAllRead}
          className="text-sm font-semibold text-brand hover:underline dark:text-brand-dark"
        >
          Mark all as read
        </button>
      </div>

      <div className="mt-3 flex gap-4 border-b border-zinc-100 px-4 dark:border-zinc-800">
        {['All', 'Unread'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={
              'border-b-2 pb-2 text-sm font-semibold transition ' +
              (tab === t
                ? 'border-brand text-brand dark:text-brand-dark'
                : 'border-transparent text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300')
            }
          >
            {t}
          </button>
        ))}
      </div>

      <div className="max-h-96 divide-y divide-zinc-100 overflow-y-auto dark:divide-zinc-800">
        {visible.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-zinc-400">
            No notifications
          </p>
        ) : (
          visible.map((n) => (
            <div
              key={n.id}
              className="flex gap-3 px-4 py-3.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
            >
              <span
                className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${TONES[n.tone]}`}
              >
                <Icon name={n.icon} size={16} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold leading-snug text-zinc-900 dark:text-zinc-50">
                    {n.title}
                  </p>
                  <span
                    className={
                      'shrink-0 whitespace-nowrap text-xs font-semibold ' +
                      (n.tone === 'red' ? 'text-red-500' : 'text-zinc-400')
                    }
                  >
                    {n.time}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                  {n.text}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      <button className="w-full border-t border-zinc-100 py-3 text-sm font-medium text-brand hover:bg-zinc-50 dark:border-zinc-800 dark:text-brand-dark dark:hover:bg-zinc-800/60">
        View all notifications
      </button>
    </div>
  )
}
