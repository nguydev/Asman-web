import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { ROLES } from '../../../features/auth/utils/roles.js'
import Icon from '../../../components/common/Icon.jsx'
import AuthFooter from '../components/AuthFooter.jsx'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await login(email, password)
      if (res.ok) {
        if (res.user && res.user.isEmailVerified === false) {
          navigate('/verify-email', { replace: true })
        } else {
          // Super admins land on the Intelligence Hub (full-screen); everyone
          // else lands on their dashboard.
          const home = res.user?.role === ROLES.SUPER_ADMIN ? '/intelligence' : '/'
          navigate(home, { replace: true })
        }
      } else {
        setError(res.error)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-linear-to-br from-white via-sky-50/40 to-sky-100/50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 text-zinc-800 dark:text-zinc-100">
      <div className="h-1 w-full bg-brand" />

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center gap-12 px-6 py-10 lg:grid lg:grid-cols-2 lg:items-stretch lg:content-center lg:gap-16">
        {/* Left: pitch */}
        <section>
          <div className="mb-8 flex items-center gap-2 font-bold tracking-tight text-brand">
            <Icon name="shield" size={26} />
            <span className="text-xl text-zinc-900 dark:text-white">ASMAN</span>
          </div>

          <h1 className="text-xl font-bold leading-tight tracking-tight text-zinc-900 dark:text-white sm:text-xl">
            Precision in Enterprise Safety.
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-zinc-500">
            Live route tracking, detention risk alerts, and attorney response for
            every driver on your network, in one view
          </p>

          <div className="relative mt-8 overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-lg shadow-sky-900/5 dark:shadow-black/50">
            <img
              src="/login.png"
              alt="ASMAN enterprise dashboard preview"
              className="h-52 w-full object-cover object-center sm:h-60"
            />
            <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/45 via-black/10 to-transparent" />
          </div>
        </section>

        {/* Right: form */}
        <section className="flex w-full">
          <form
            onSubmit={handleSubmit}
            className="mx-auto flex w-full max-w-md flex-col justify-center rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 shadow-xl shadow-sky-900/5 dark:shadow-black/50"
          >
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Welcome Back</h2>

            <label className="mt-6 block text-sm font-medium text-zinc-600">
              Business Email
              <div className="relative mt-1.5">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your business email"
                  autoComplete="username"
                  required
                  className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 px-3.5 py-2.5 pr-10 text-sm text-zinc-900 dark:text-zinc-100 outline-none placeholder:text-zinc-400/60 dark:placeholder:text-zinc-500/60 focus:border-brand focus:bg-white dark:focus:bg-zinc-900 focus:ring-2 focus:ring-brand/30"
                />
                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-zinc-400">
                  <Icon name="mail" size={18} />
                </span>
              </div>
            </label>

            <div className="mt-4">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="login-password"
                  className="text-sm font-medium text-zinc-600"
                >
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm font-medium text-brand hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative mt-1.5">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 px-3.5 py-2.5 pr-10 text-sm text-zinc-900 dark:text-zinc-100 outline-none placeholder:text-zinc-400/60 dark:placeholder:text-zinc-500/60 focus:border-brand focus:bg-white dark:focus:bg-zinc-900 focus:ring-2 focus:ring-brand/30"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-3 flex items-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                >
                  <Icon name={showPassword ? 'eyeOff' : 'eye'} size={18} />
                </button>
              </div>
            </div>

            <label className="mt-4 flex items-center gap-2 text-sm text-zinc-600">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-4 w-4 rounded border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 accent-brand"
              />
              Remember this device
            </label>

            {error && (
              <div className="mt-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-brand py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing In...' : (
                <>Sign In <Icon name="arrow" size={18} /></>
              )}
            </button>

            <div className="mt-6 text-center text-sm text-zinc-600">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-brand hover:underline">
                Create one
              </Link>
            </div>
          </form>
        </section>
      </main>

      <AuthFooter />
    </div>
  )
}
