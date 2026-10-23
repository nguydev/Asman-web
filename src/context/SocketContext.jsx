import { createContext, useCallback, useContext, useEffect, useState, useRef } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from '../features/auth/context/AuthContext'
import { ROLES } from '../features/auth/utils/roles.js'
import SosAlertStack from '../components/SosAlertToast.jsx'

const SocketContext = createContext(null)

function sosCoords(alert) {
  const lat = alert?.lat != null ? Number(alert.lat) : null
  const lng =
    alert?.lon != null
      ? Number(alert.lon)
      : alert?.lng != null
        ? Number(alert.lng)
        : null
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
  return { lat, lng }
}

function sosAlertId(alert) {
  return alert?.id || null
}

export function SocketProvider({ children }) {
  const { isAuthenticated, user } = useAuth()
  const [socket, setSocket] = useState(null)
  const [liveDrivers, setLiveDrivers] = useState(new Map())
  const [liveSosAlerts, setLiveSosAlerts] = useState(new Map())
  const [sosAlertQueue, setSosAlertQueue] = useState([])
  const lastDeviceTsByDriver = useRef(new Map())

  const dismissSosAlert = useCallback((alert) => {
    const id = sosAlertId(alert)
    setSosAlertQueue((prev) => {
      if (!id) {
        const idx = prev.findIndex((item) => item === alert)
        if (idx >= 0) return prev.filter((_, i) => i !== idx)
        return prev.slice(1)
      }
      return prev.filter((item) => sosAlertId(item) !== id)
    })
  }, [])

  const dismissAllSosAlerts = useCallback(() => {
    setSosAlertQueue([])
  }, [])

  useEffect(() => {
    if (!isAuthenticated) {
      setSocket((currentSocket) => {
        currentSocket?.disconnect()
        return null
      })
      setLiveDrivers(new Map())
      setLiveSosAlerts(new Map())
      setSosAlertQueue([])
      return
    }

    const newSocket = io('/location', {
      transports: ['websocket'],
      withCredentials: true,
    })

    newSocket.on('connect', () => {
      console.log('Location socket connected')

      newSocket.emit('map:subscribe', (ack) => {
        console.log('Map socket subscribed:', ack)
      })

      if (user?.role === ROLES.SUPER_ADMIN) {
        newSocket.emit('admin:sos:subscribe', {}, (ack) => {
          console.log('Admin SOS subscribed:', ack)
        })
      }

      if (user?.organizationId) {
        newSocket.emit('dashboard:subscribe', { organizationId: user.organizationId }, (ack) => {
          console.log('Location socket subscribed:', ack)
        })
      }
    })

    newSocket.on('connect_error', (error) => {
      console.error('Location socket connection error:', error)
    })

    newSocket.on('location:update', (point) => {
      const nextTs = Date.parse(point.deviceTs)
      const prevTs = lastDeviceTsByDriver.current.get(point.driverId) || 0

      if (nextTs < prevTs) return
      lastDeviceTsByDriver.current.set(point.driverId, nextTs)

      setLiveDrivers((prev) => {
        const nextMap = new Map(prev)
        nextMap.set(point.driverId, point)
        return nextMap
      })
    })

    newSocket.on('sos:alert', (alert) => {
      console.log('SOS Alert received', alert)
      setSosAlertQueue((prev) => {
        const id = sosAlertId(alert)
        if (id && prev.some((item) => sosAlertId(item) === id)) {
          return prev.map((item) => (sosAlertId(item) === id ? alert : item))
        }
        return [alert, ...prev]
      })

      const coords = sosCoords(alert)
      if (!coords || !alert?.id) return

      setLiveSosAlerts((prev) => {
        const next = new Map(prev)
        const profile = alert.driver?.user?.profile
        next.set(alert.id, {
          id: alert.id,
          driverId: alert.driverId,
          lat: coords.lat,
          lng: coords.lng,
          status: alert.status ?? 'OPEN',
          detail: alert.message ?? null,
          name:
            profile?.name ||
            alert.triggeredBy?.profile?.name ||
            alert.name ||
            alert.driver?.user?.email ||
            null,
          avatar:
            profile?.avatarUrl ||
            alert.triggeredBy?.profile?.avatarUrl ||
            alert.avatarUrl ||
            null,
          createdAt: alert.createdAt ?? new Date().toISOString(),
        })
        return next
      })
    })

    setSocket(newSocket)

    return () => {
      newSocket.disconnect()
    }
  }, [isAuthenticated, user?.organizationId, user?.role])

  return (
    <SocketContext.Provider value={{ socket, liveDrivers, liveSosAlerts }}>
      {children}
      <SosAlertStack
        alerts={sosAlertQueue}
        onDismiss={dismissSosAlert}
        onDismissAll={dismissAllSosAlerts}
      />
    </SocketContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSocket() {
  const ctx = useContext(SocketContext)
  if (ctx === null) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return ctx
}
