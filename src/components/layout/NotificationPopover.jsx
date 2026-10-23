import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { notificationService } from '../../api/services/notificationService.js'
import { useAuth } from '../../features/auth/context/AuthContext.jsx'
import { ROLES } from '../../features/auth/utils/roles.js'
import Icon from '../common/Icon.jsx'

function extractNotificationItems(res) {
  const body = res?.data
  if (!body) return []
  if (Array.isArray(body)) return body
  if (Array.isArray(body.data)) return body.data
  if (Array.isArray(body.items)) return body.items
  if (Array.isArray(body.data?.data)) return body.data.data
  if (Array.isArray(body.data?.items)) return body.data.items
  return []
}

function mapNotification(n) {
  const isRead =
    n.readAt != null || n.isRead === true || n.read === true
  return {
    ...n,
    isRead,
  }
}

export default function NotificationPopover({ buttonClassName }) {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(false)
  const [orgId, setOrgId] = useState(null)
  const popoverRef = useRef(null)
  const navigate = useNavigate()

  const isAdmin = user.role === ROLES.SUPER_ADMIN
  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications],
  )

  const fetchNotifications = useCallback(async (currentOrgId = orgId) => {
    try {
      setLoading(true)
      const params = { limit: 20 }

      let res
      if (isAdmin) {
        res = await notificationService.getAdminNotifications(params)
      } else {
        let targetOrgId = currentOrgId
        if (!targetOrgId) {
          const orgsRes = await notificationService.getMyOrganizations()
          const orgs = orgsRes.data?.data ?? orgsRes.data
          targetOrgId = Array.isArray(orgs)
            ? orgs[0]?.id
            : orgsRes.data?.items?.[0]?.id
          if (targetOrgId) setOrgId(targetOrgId)
        }

        if (targetOrgId) {
          res = await notificationService.getOrgNotifications(
            targetOrgId,
            params,
          )
        } else {
          res = await notificationService.getNotifications(params)
        }
      }

      const items = extractNotificationItems(res).map(mapNotification)
      setNotifications(items)
    } catch (err) {
      console.error('Failed to fetch notifications', err)
    } finally {
      setLoading(false)
    }
  }, [isAdmin, orgId])

  useEffect(() => {
    void fetchNotifications()
    const interval = setInterval(fetchNotifications, 60000)
    return () => clearInterval(interval)
  }, [fetchNotifications])

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      handleMarkRead(notification.id)
    }

    const link = notification.data?.link || notification.data?.url
    if (link) {
      navigate(link)
    }

    setOpen(false)
  }

  const handleMarkRead = async (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    )

    try {
      if (isAdmin) {
        await notificationService.markAdminRead(id)
      } else if (orgId) {
        await notificationService.markOrgRead(orgId, id)
      } else {
        await notificationService.markRead(id)
      }
    } catch (err) {
      console.error('Failed to mark as read', err)
      fetchNotifications()
    }
  }

  const handleDeleteAll = async () => {
    try {
      if (isAdmin) {
        await notificationService.deleteAllAdmin()
      } else if (orgId) {
        await notificationService.deleteAllOrg(orgId)
      } else {
        await notificationService.deleteAll()
      }
      setNotifications([])
      setOpen(false)
    } catch (err) {
      console.error('Failed to clear notifications', err)
    }
  }

  const toggleOpen = (e) => {
    e.preventDefault()
    setOpen((prev) => {
      const next = !prev
      if (next) fetchNotifications()
      return next
    })
  }

  const defaultBtnClass =
    'relative flex-shrink-0 grid h-9 w-9 place-items-center rounded-lg text-zinc-500 transition hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
  const finalBtnClass = buttonClassName || defaultBtnClass

  useEffect(() => {
    if (!open) return

    const handleClickOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setOpen(false)
      }
    }

    const timer = setTimeout(() => {
      document.addEventListener('click', handleClickOutside)
    }, 0)

    return () => {
      clearTimeout(timer)
      document.removeEventListener('click', handleClickOutside)
    }
  }, [open])

  return (
    <div className="relative" ref={popoverRef}>
      <button type="button" onClick={toggleOpen} className={finalBtnClass}>
        <Icon name="bell" size={18} />
        {unreadCount > 0 && (
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-red-500" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-[110%] mt-2 w-[350px] rounded-xl border border-zinc-700 bg-zinc-900 p-4 shadow-[0_0_40px_rgba(0,0,0,0.5)] z-[9999] origin-top-right">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-zinc-100">
              Notifications
            </h3>
            {notifications.length > 0 && (
              <button
                onClick={handleDeleteAll}
                className="text-xs font-medium text-zinc-400 hover:text-white transition-colors"
              >
                Clear all
              </button>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto space-y-3 pr-1 custom-scrollbar">
            {loading && notifications.length === 0 ? (
              <div className="py-6 text-center text-sm text-zinc-500">
                Loading...
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-8 flex flex-col items-center justify-center text-zinc-500">
                <Icon name="bell" size={32} className="mb-3 opacity-20" />
                <p className="text-sm">You have no new notifications.</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`group cursor-pointer relative flex gap-3 rounded-lg p-3 transition-colors ${
                    notification.isRead
                      ? 'bg-zinc-900/30 hover:bg-zinc-800/40'
                      : 'bg-zinc-800/30 hover:bg-zinc-700/40 border-l-2 border-brand'
                  }`}
                >
                  <div
                    className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full ${
                      notification.isRead
                        ? 'bg-zinc-800 text-zinc-400'
                        : 'bg-brand/10 text-brand'
                    }`}
                  >
                    <Icon
                      name={notification.isRead ? 'bell' : 'info'}
                      size={14}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm mb-1 ${
                        notification.isRead
                          ? 'text-zinc-300'
                          : 'text-zinc-100 font-medium'
                      }`}
                    >
                      {notification.title}
                    </p>
                    <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">
                      {notification.body}
                    </p>
                    <p className="text-micro text-zinc-600 mt-2 font-medium tracking-wide">
                      {new Date(notification.createdAt).toLocaleDateString(
                        undefined,
                        {
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                        },
                      )}
                    </p>
                  </div>

                  {!notification.isRead && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleMarkRead(notification.id)
                      }}
                      title="Mark as read"
                      className="opacity-0 group-hover:opacity-100 absolute top-3 right-3 text-brand hover:text-white transition-all"
                    >
                      <Icon name="check" size={16} />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
