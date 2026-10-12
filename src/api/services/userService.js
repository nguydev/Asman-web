import api from '../axios'

export const userService = {
  getStats: () => api.get('/admin/users/stats'),
  getUsers: (params) => api.get('/admin/users', { params }),
  searchUsers: (params) => api.get('/admin/users/search', { params }),
  getUser: (id) => api.get(`/admin/users/${id}`),
  updateStatus: (id, data) => api.patch(`/admin/users/${id}/status`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  restoreUser: (id) => api.patch(`/admin/users/${id}/restore`),
}
