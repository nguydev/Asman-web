import api from '../axios'

export const organizationService = {
  getOrganizations: (params) => api.get('/organizations', { params }),
  getOrganization: (id) => api.get(`/organizations/${id}`),
  createOrganization: (data) => api.post('/organizations', data),
  updateOrganization: (id, data) => api.patch(`/organizations/${id}`, data),
  updateStatus: (id, data) => api.patch(`/organizations/${id}/status`, data),
  getStats: () => api.get('/admin/organizations/stats'),
  addVaultDocument: (organizationId, fileObjectId) => api.post(`/admin/vault/documents`, { fileObjectId, targetType: 'ORGANIZATION', targetId: organizationId }),
  deleteVaultDocument: (id) => api.delete(`/admin/vault/documents/${id}`),
}
