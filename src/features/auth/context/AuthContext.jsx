import { createContext, useContext, useEffect, useState } from 'react'
import { authService } from '../../../api/services/authService.js'
import { profileService } from '../../../api/services/profileService.js'

const STORAGE_KEY = 'asman.auth.user'


const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })

  useEffect(() => {
    if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    else localStorage.removeItem(STORAGE_KEY)
  }, [user])

  const login = async (email, password) => {
    try {
      const response = await authService.login({ email: email.trim().toLowerCase(), password })

      const resData = response.data
      const safeUser = resData.data

      setUser(safeUser)
      return { ok: true, user: safeUser }
    } catch (err) {
      console.error('Login failed:', err)
      let errorMsg = err.response?.data?.message || err.response?.data?.error || 'Something went wrong!'
      return { ok: false, error: errorMsg }
    }
  }

  const register = async (data) => {
    try {
      await authService.registerOrganization(data)
      // The backend delivers auth cookies upon registration
      // But user object might not be in response, let's fetch it or just return ok
      return { ok: true }
    } catch (err) {
      console.error('Registration failed:', err)
      return { ok: false, error: err.response?.data?.message || 'Registration failed' }
    }
  }

  const verifyEmail = async (email, code, name = '') => {
    try {
      await authService.verifyEmailOtp({ email, code })
      // If we are already logged in (user exists in context), just mark it verified
      if (user) {
        const fullUser = { ...user, isEmailVerified: true }
        setUser(fullUser)
        return { ok: true, user: fullUser }
      }

      // If we are coming from registration, we might not be fully logged in on the frontend yet,
      // but we have cookies. We can use authService.me() to get the role.
      const meRes = await profileService.me()
      const userData = meRes.data?.data || meRes.data
      const fullUser = { ...userData, email, name, isEmailVerified: true }
      setUser(fullUser)
      return { ok: true, user: fullUser }
    } catch (err) {
      console.error('Verification failed:', err)
      return { ok: false, error: err.response?.data?.message || 'Verification failed' }
    }
  }

  const logout = async () => {
    try {
      await authService.logout()
    } catch (err) {
      console.error('Logout failed:', err)
    } finally {
      setUser(null)
    }
  }

  const value = { user, setUser, login, register, verifyEmail, logout, isAuthenticated: !!user }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>')
  return ctx
}

export { }
