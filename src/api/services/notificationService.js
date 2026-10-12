import api from '../axios.js'

export const notificationService = {
  // Returns { items: [], meta: {} } from prismaPaginate
  getNotifications: (params) => api.get('/notifications', { params }),
  getAdminNotifications: (params) => api.get('/admin/notifications', { params }),
  createAdminNotification: (data) => api.post('/admin/notifications', data),
  getOrgNotifications: (orgId, params) => api.get(`/organizations/${orgId}/notifications`, { params }),
  
  markRead: (id) => api.patch(`/notifications/${id}/read`),
  markAdminRead: (id) => api.patch(`/admin/notifications/${id}/read`),
  markOrgRead: (orgId, id) => api.patch(`/organizations/${orgId}/notifications/${id}/read`),
  
  markUnread: (id) => api.patch(`/notifications/${id}/unread`),
  markAdminUnread: (id) => api.patch(`/admin/notifications/${id}/unread`),
  markOrgUnread: (orgId, id) => api.patch(`/organizations/${orgId}/notifications/${id}/unread`),
  
  deleteAll: () => api.delete('/notifications'),
  deleteAllAdmin: () => api.delete('/admin/notifications'),
  deleteAllOrg: (orgId) => api.delete(`/organizations/${orgId}/notifications`),
  
  delete: (id) => api.delete(`/notifications/${id}`),
  deleteAdmin: (id) => api.delete(`/admin/notifications/${id}`),
  deleteOrg: (orgId, id) => api.delete(`/organizations/${orgId}/notifications/${id}`),
  
  getMyOrganizations: () => api.get('/organizations'),
}
