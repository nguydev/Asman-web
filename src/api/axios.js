import axios from 'axios'

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/${import.meta.env.VITE_API_VERSION}`,
  timeout: 10000,
  withCredentials: true, // For httpOnly cookies
})

let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

// Global error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      // If we are already on the login page, don't intercept 401s (prevent reload loops)
      if (window.location.pathname === '/login' || originalRequest.url?.includes('/auth/login')) {
        return Promise.reject(error)
      }

      // Don't intercept 401s from the refresh endpoint itself
      if (originalRequest.url.includes('/auth/refresh')) {
        localStorage.removeItem('asman.auth.user')
        window.location.href = '/login'
        return Promise.reject(error)
      }

      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject })
        })
          .then(() => {
            return api(originalRequest)
          })
          .catch((err) => {
            return Promise.reject(err)
          })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        await api.post('/auth/refresh', {})
        processQueue(null)
        return api(originalRequest)
      } catch (err) {
        processQueue(err, null)
        localStorage.removeItem('asman.auth.user')
        window.location.href = '/login'
        return Promise.reject(err)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default api
