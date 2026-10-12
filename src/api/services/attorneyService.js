import api from '../axios'

export const attorneyService = {
  getAttorneys: async (params) => {
    const response = await api.get('/attorneys', { params })
    return response.data
  },
  getAttorney: (id) => api.get(`/attorneys/${id}`),
  createAttorney: (data) => api.post('/attorneys', data),
  importAttorneys: async () => {
    const response = await api.post('/attorneys/import')
    return response.data
  },
  updateAttorney: (id, data) => api.patch(`/attorneys/${id}`, data),
  deleteAttorney: (id) => api.delete(`/attorneys/${id}`),
}
