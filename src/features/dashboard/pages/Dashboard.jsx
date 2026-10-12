import { useAuth } from '../../../features/auth/context/AuthContext.jsx'
import { ROLES } from '../../../features/auth/utils/roles.js'
import FleetDashboard from '../../fleet/pages/FleetDashboard.jsx';
import SuperAdminDashboard from '../../super-admin/pages/SuperAdminDashboard.jsx';

export default function Dashboard() {
  const { user } = useAuth()

  if (user.role === ROLES.FLEET_OWNER) {
    return <FleetDashboard />
  }

  return <SuperAdminDashboard />
}
