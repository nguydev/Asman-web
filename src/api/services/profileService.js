import  api from '../axios'

export const profileService = {
  me: () => api.get('/auth/me'),
}
