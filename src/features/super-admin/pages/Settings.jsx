import { useAuth } from '../../../features/auth/context/AuthContext.jsx'
import { ROLES } from '../../../features/auth/utils/roles.js'
import FleetSettings from '../../fleet/pages/FleetSettings.jsx'
import SuperAdminSettings from './SuperAdminSettings.jsx'

export default function Settings() {
  const { user } = useAuth()

  if (user?.role === ROLES.SUPER_ADMIN) {
    return <SuperAdminSettings />
  }

  return <FleetSettings />
}
