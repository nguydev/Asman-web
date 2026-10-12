import api from '../axios.js'

export function unwrapApiData(res) {
  return res?.data?.data ?? res?.data
}

export function apiErrorMessage(err, fallback = 'Something went wrong') {
  const message = err?.response?.data?.message
  if (Array.isArray(message)) return message.join(', ')
  if (typeof message === 'string' && message.trim()) return message
  if (err?.message) return err.message
  return fallback
}

export const driverService = {
  getDrivers: async (params) => {
    const response = await api.get('/drivers', { params })
    return response.data
  },
  getOrganizationDrivers: (orgId) => api.get(`/organizations/${orgId}/drivers`),
  getOrganizationDriver: (orgId, driverId) =>
    api.get(`/organizations/${orgId}/drivers/${driverId}`),
  createOrganizationDriver: (orgId, data) =>
    api.post(`/organizations/${orgId}/drivers`, data),
  updateOrganizationDriver: (orgId, driverId, data) =>
    api.patch(`/organizations/${orgId}/drivers/${driverId}`, data),
  terminateOrganizationDriver: (orgId, driverId) =>
    api.delete(`/organizations/${orgId}/drivers/${driverId}`),
  listDriverVaultDocuments: (orgId, driverId, params) =>
    api.get(`/vault/organizations/${orgId}/drivers/${driverId}`, { params }),
  addDriverVaultDocument: (orgId, driverId, data) =>
    api.post(`/vault/organizations/${orgId}/drivers/${driverId}`, data),
  deleteDriverVaultDocument: (orgId, driverId, documentId) =>
    api.delete(
      `/vault/organizations/${orgId}/drivers/${driverId}/documents/${documentId}`,
    ),
}
