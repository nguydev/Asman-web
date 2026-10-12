import api from '../axios'

export const authService = {
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  registerOrganization: (data) => api.post('/auth/signup/organization', data),
  verifyEmailOtp: (data) => api.post('/auth/email/verify/otp', data),
  resendEmailVerification: (data) => api.post('/auth/email/verify/resend', data),
  updateProfile: (data) => api.patch('/users/me', data),
  changePassword: (data) => api.patch('/auth/password/change', data),
  forgotPassword: (data) => api.post('/auth/password/forgot', data),
  verifyPasswordResetOtp: (data) => api.post('/auth/password/reset/otp', data),
  resetPassword: (data) => api.post('/auth/password/reset', data),
  getSessions: () => api.get('/auth/sessions'),
  revokeSession: (sessionId) => api.delete(`/auth/sessions/${sessionId}`),
}
