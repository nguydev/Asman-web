// Frontend-only data adapter. It deliberately performs no HTTP, cookie, or
// storage request; it only returns small in-memory shapes required by the UI.
const demoUser = {
  id: 'demo-user',
  email: 'demo@asman.local',
  role: 'ADMIN',
  isEmailVerified: true,
  profile: { name: 'Demo Administrator', avatarUrl: null },
}

const demoOrganization = { id: 'demo-organization', name: 'Demo Organization' }

function valueFor(url, body) {
  if (url === '/auth/login' || url === '/auth/me') return demoUser
  if (url === '/organizations') return [demoOrganization]
  if (url.includes('/dashboard')) return { stats: {}, driverActivity: [], recentSos: [] }
  if (url.includes('/stats')) return { total: 0, active: 0, pending: 0, suspended: 0 }
  if (url === '/files/upload-url') {
    return { file: { id: `local-file-${Date.now()}`, ...body }, upload: { url: '', headers: {} } }
  }
  if (url.includes('/download-url')) {
    return { url: 'data:text/plain,Local%20frontend%20preview', expiresIn: null }
  }
  return body ?? []
}

function respond(url, body) {
  return Promise.resolve({ data: { data: valueFor(url, body) } })
}

const uiData = {
  get: (url) => respond(url),
  post: (url, body) => respond(url, body),
  patch: (url, body) => respond(url, body),
  delete: (url) => respond(url),
}

export default uiData
