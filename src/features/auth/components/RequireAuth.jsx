import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { ROUTE_ACCESS } from '../../../features/auth/utils/roles.js'

// Guards a route: redirects to /login if not authenticated, and to the
// dashboard if the current role is not allowed on this route.
export default function RequireAuth({ children }) {
  const { user, isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  let allowed = ROUTE_ACCESS[location.pathname]
  
  // If no exact match, check for dynamic routes by matching prefixes
  if (!allowed) {
    const matchedPrefix = Object.keys(ROUTE_ACCESS)
      .filter((route) => location.pathname.startsWith(route + '/'))
      .sort((a, b) => b.length - a.length)[0] // match longest prefix first
    
    if (matchedPrefix) {
      allowed = ROUTE_ACCESS[matchedPrefix]
    }
  }

  if (allowed && !allowed.includes(user.role)) {
    return <Navigate to="/" replace />
  }

  return children
}
