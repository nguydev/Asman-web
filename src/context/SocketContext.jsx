import { createContext, useCallback, useContext, useState } from 'react'
import SosAlertStack from '../components/SosAlertToast.jsx'

const SocketContext = createContext(null)

// UI-only replacement for the former real-time socket connection.
export function SocketProvider({ children }) {
  const [sosAlertQueue, setSosAlertQueue] = useState([])
  const dismissSosAlert = useCallback((alert) => {
    setSosAlertQueue((alerts) => alerts.filter((item) => item !== alert))
  }, [])
  const dismissAllSosAlerts = useCallback(() => setSosAlertQueue([]), [])

  return (
    <SocketContext.Provider
      value={{ socket: null, liveDrivers: new Map(), liveSosAlerts: new Map() }}
    >
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
  if (ctx === null) throw new Error('useSocket must be used within a SocketProvider')
  return ctx
}
