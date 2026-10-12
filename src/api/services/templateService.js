import api from '../axios.js'

export const templateService = {
  list: async (params = {}) => {
    const response = await api.get('/templates', { params })
    return response.data
  },

  get: async (id) => {
    const response = await api.get(`/templates/${id}`)
    return response.data
  },

  create: async (payload) => {
    const response = await api.post('/templates', payload)
    return response.data
  },

  update: async (id, payload) => {
    const response = await api.patch(`/templates/${id}`, payload)
    return response.data
  },

  remove: async (id) => {
    const response = await api.delete(`/templates/${id}`)
    return response.data
  },

  send: async (payload) => {
    const response = await api.post('/templates/send', payload)
    return response.data
  },

  listSends: async (params = {}) => {
    const response = await api.get('/templates/sends', { params })
    return response.data
  },

  getSend: async (id) => {
    const response = await api.get(`/templates/sends/${id}`)
    return response.data
  },
}
