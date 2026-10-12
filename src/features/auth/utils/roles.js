// Central definition of roles and what each role is allowed to see.
// Two roles live under "admin": SUPER_ADMIN and FLEET_OWNER.

export const ROLES = {
  SUPER_ADMIN: 'ADMIN',
  FLEET_OWNER: 'USER',
}

export const ROLE_LABELS = {
  [ROLES.SUPER_ADMIN]: 'Super Admin',
  [ROLES.FLEET_OWNER]: 'Fleet Owner',
}

// Navigation items available to each role. `path` maps to a route in App.jsx.
export const NAV_BY_ROLE = {
  [ROLES.SUPER_ADMIN]: [
    { path: '/', label: 'Dashboard', icon: 'grid' },
    { path: '/users', label: 'Users', icon: 'users' },
    { path: '/fleets', label: 'Fleet Companies', icon: 'truck' },
    // Super Admin Drivers page temporarily disabled (kept for later re-enable)
    // { path: '/all-drivers', label: 'Drivers', icon: 'badge' },
    { path: '/attorneys', label: 'Attorneys', icon: 'briefcase' },
    { path: '/templates', label: 'Templates', icon: 'file' },
    { path: '/case-tracker', label: 'Case Tracker', icon: 'clipboard' },
    { path: '/sos-incidents', label: 'SOS Incidents', icon: 'sos' },
    { path: '/subscription', label: 'Subscription', icon: 'shield' },
    { path: '/settings', label: 'Settings', icon: 'cog' },
  ],
  [ROLES.FLEET_OWNER]: [
    { path: '/', label: 'Dashboard', icon: 'grid' },
    { path: '/drivers', label: 'Drivers', icon: 'users' },
    { path: '/vehicles', label: 'Fleets', icon: 'truck' },
    { path: '/my-fleet', label: 'Live Map', icon: 'map' },
    // Attorneys are handled offline by the legal team — fleet managers only
    // see case status, not attorney details (per client Call 2 clarification).
    { path: '/case-status', label: 'Case Status', icon: 'clipboard' },
    { path: '/subscription', label: 'Subscription', icon: 'box' },
    { path: '/settings', label: 'Settings', icon: 'cog' },
  ],
}

// Which roles may open a given route. Used by the route guard.
export const ROUTE_ACCESS = {
  '/': [ROLES.SUPER_ADMIN, ROLES.FLEET_OWNER],
  '/fleets': [ROLES.SUPER_ADMIN],
  '/fleets/onboard': [ROLES.SUPER_ADMIN],
  '/users': [ROLES.SUPER_ADMIN],
  '/settings': [ROLES.SUPER_ADMIN, ROLES.FLEET_OWNER],
  '/my-fleet': [ROLES.FLEET_OWNER],
  '/vehicles': [ROLES.FLEET_OWNER],
  '/drivers': [ROLES.FLEET_OWNER],
  '/drivers/new': [ROLES.FLEET_OWNER],
  '/attorneys': [ROLES.SUPER_ADMIN],
  '/facility/dc-4': [ROLES.FLEET_OWNER],
  '/my-fleet/vehicle/u402': [ROLES.FLEET_OWNER],
  '/my-fleet/vehicle/u119': [ROLES.FLEET_OWNER],
  '/my-fleet/vehicle/u284': [ROLES.FLEET_OWNER],
  '/attorneys/at1': [ROLES.SUPER_ADMIN],
  '/attorneys/at2': [ROLES.SUPER_ADMIN],
  '/attorneys/at3': [ROLES.SUPER_ADMIN],
  '/attorneys/at4': [ROLES.SUPER_ADMIN],
  '/attorneys/at5': [ROLES.SUPER_ADMIN],
  '/attorneys/at6': [ROLES.SUPER_ADMIN],
  '/case-status': [ROLES.FLEET_OWNER],
  '/subscription': [ROLES.SUPER_ADMIN, ROLES.FLEET_OWNER],
  // Super Admin Drivers page temporarily disabled (kept for later re-enable)
  // '/all-drivers': [ROLES.SUPER_ADMIN],
  // '/all-drivers/ad1': [ROLES.SUPER_ADMIN],
  // '/all-drivers/ad2': [ROLES.SUPER_ADMIN],
  // '/all-drivers/ad3': [ROLES.SUPER_ADMIN],
  '/templates': [ROLES.SUPER_ADMIN],
  '/case-tracker': [ROLES.SUPER_ADMIN],
  '/intelligence': [ROLES.SUPER_ADMIN],
  '/hc-tracker': [ROLES.SUPER_ADMIN],
  '/case-tracker/ca1': [ROLES.SUPER_ADMIN],
  '/case-tracker/ca2': [ROLES.SUPER_ADMIN],
  '/case-tracker/ca3': [ROLES.SUPER_ADMIN],
  '/case-tracker/ca4': [ROLES.SUPER_ADMIN],
  '/sos-incidents': [ROLES.SUPER_ADMIN],
  '/subscription/plans': [ROLES.SUPER_ADMIN],
}
