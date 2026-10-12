import api from '../axios.js'
import { unwrapApiData, apiErrorMessage } from './driverService.js'

export { unwrapApiData, apiErrorMessage }

export const fleetService = {
  list: (orgId) => api.get(`/organizations/${orgId}/fleets`),
  get: (orgId, fleetId) => api.get(`/organizations/${orgId}/fleets/${fleetId}`),
  create: (orgId, data) => api.post(`/organizations/${orgId}/fleets`, data),
  update: (orgId, fleetId, data) =>
    api.patch(`/organizations/${orgId}/fleets/${fleetId}`, data),
  remove: (orgId, fleetId) =>
    api.delete(`/organizations/${orgId}/fleets/${fleetId}`),
  assignDriver: (orgId, fleetId, driverId) =>
    api.post(`/organizations/${orgId}/fleets/${fleetId}/drivers`, { driverId }),
  removeDriver: (orgId, fleetId, driverId) =>
    api.delete(`/organizations/${orgId}/fleets/${fleetId}/drivers/${driverId}`),
}
