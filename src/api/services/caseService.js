import api from '../axios.js'

export const caseService = {
  createCase: async (data) => {
    const response = await api.post('/cases', data)
    return response.data
  },
  
  listCases: async (params) => {
    const response = await api.get('/cases', { params })
    return response.data
  },

  listOrganizationCases: async (orgId, params) => {
    const response = await api.get(`/organizations/${orgId}/cases`, { params })
    return response.data
  },
  
  getCase: async (id) => {
    const response = await api.get(`/cases/${id}`)
    return response.data
  },
  
  getCaseTracker: async (id) => {
    const response = await api.get(`/cases/${id}/tracker`)
    return response.data
  },
  
  changeCaseStatus: async (id, data) => {
    const response = await api.patch(`/cases/${id}/status`, data)
    return response.data
  },

  updateCase: async (id, data) => {
    const response = await api.patch(`/cases/${id}`, data)
    return response.data
  },
  
  getCaseStats: async () => {
    const response = await api.get('/admin/cases/stats')
    return response.data
  }
}
