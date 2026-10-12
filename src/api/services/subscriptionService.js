import api from '../axios'

export const subscriptionService = {
  // Super Admin Stats
  getStats: () => api.get('/admin/subscriptions/stats'),
  
  // Plans (Tiers)
  getPlans: () => api.get('/subscriptions/plans'),
  createPlan: (data) => api.post('/subscriptions/plans', data),
  updatePlan: (id, data) => api.patch(`/subscriptions/plans/${id}`, data),
  
  // Subscribers List (Admin)
  getSubscribers: (params) => api.get('/admin/subscriptions', { params }),
}
