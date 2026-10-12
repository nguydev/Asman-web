import api from '../axios'

export const sosService = {
  getIncidents: (params) => api.get('/admin/sos/incidents', { params }),
  getIncident: (id) => api.get(`/admin/sos/incidents/${id}`),
  acknowledgeIncident: (id) =>
    api.patch(`/admin/sos/incidents/${id}/acknowledge`),
  resolveIncident: (id) => api.patch(`/admin/sos/incidents/${id}/resolve`),
  createCase: (id, payload) =>
    api.post(`/admin/sos/incidents/${id}/case`, payload),
}
