import api from '../axios.js'

export const dashboardService = {
  getStats: () => api.get('/admin/dashboard/stats'),
  getOrganizationDashboard: (orgId) =>
    api.get(`/organizations/${orgId}/dashboard`),
}
