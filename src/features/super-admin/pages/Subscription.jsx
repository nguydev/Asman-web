import { useAuth } from '../../../features/auth/context/AuthContext.jsx'
import { ROLES } from '../../../features/auth/utils/roles.js'
import FleetSubscription from '../../fleet/pages/FleetSubscription.jsx'
import SuperAdminSubscription from './SuperAdminSubscription.jsx'

export default function Subscription() {
  const { user } = useAuth()

  if (user.role === ROLES.SUPER_ADMIN) {
    return <SuperAdminSubscription />
  }

  return <FleetSubscription />
}
