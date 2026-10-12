import { useState, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { ROLES } from '../../../features/auth/utils/roles.js'
import Icon from '../../../components/common/Icon.jsx'
import AuthFooter from '../components/AuthFooter.jsx'

export default function Register() {
  const { register, verifyEmail } = useAuth()
  const navigate = useNavigate()

  // Registration Form State
  const [name, setName] = useState('')
  const [organizationName, setOrganizationName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // OTP Form State
  const [isVerifying, setIsVerifying] = useState(false)
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', ''])
  const inputRefs = useRef([])

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return // Only allow digits
    const newOtp = [...otpCode]
    newOtp[index] = value.slice(-1)
    setOtpCode(newOtp)

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (index, e) => {
    // Focus previous input on backspace if current is empty
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!pastedData) return

    const newOtp = [...otpCode]
    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i]
    }
    setOtpCode(newOtp)

    // Focus the next empty input or the last one
    const focusIndex = Math.min(pastedData.length, 5)
    inputRefs.current[focusIndex]?.focus()
  }

  // Common State
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleRegisterSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    setLoading(true)
    try {
      const res = await register({ name, organizationName, email, password })
      if (res.ok) {
        setIsVerifying(true)
      } else {
        setError(res.error)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleVerifySubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const finalOtp = otpCode.join('')
      const res = await verifyEmail(email, finalOtp, name)
      if (res.ok) {
        const home = res.user?.role === ROLES.SUPER_ADMIN ? '/intelligence' : '/'
        navigate(home, { replace: true })
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
          {!isVerifying ? (
            <form
              onSubmit={handleRegisterSubmit}
              className="mx-auto flex w-full max-w-md flex-col justify-center rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 shadow-xl shadow-sky-900/5 dark:shadow-black/50"
            >
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Create Fleet Account</h2>

              <label className="mt-6 block text-sm font-medium text-zinc-600">
                Full Name
                <div className="relative mt-1.5">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    autoComplete="name"
                    required
                    className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 px-3.5 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 outline-none placeholder:text-zinc-400/60 dark:placeholder:text-zinc-500/60 focus:border-brand focus:bg-white dark:focus:bg-zinc-900 focus:ring-2 focus:ring-brand/30"
                  />
                </div>
              </label>

              <label className="mt-4 block text-sm font-medium text-zinc-600">
                Organization Name
                <div className="relative mt-1.5">
                  <input
                    type="text"
                    value={organizationName}
                    onChange={(e) => setOrganizationName(e.target.value)}
                    placeholder="Enter organization name"
                    required
                    className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 px-3.5 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 outline-none placeholder:text-zinc-400/60 dark:placeholder:text-zinc-500/60 focus:border-brand focus:bg-white dark:focus:bg-zinc-900 focus:ring-2 focus:ring-brand/30"
                  />
                </div>
              </label>

              <label className="mt-4 block text-sm font-medium text-zinc-600">
                Business Email
                <div className="relative mt-1.5">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your business email"
                    autoComplete="email"
                    required
                    className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 px-3.5 py-2.5 pr-10 text-sm text-zinc-900 dark:text-zinc-100 outline-none placeholder:text-zinc-400/60 dark:placeholder:text-zinc-500/60 focus:border-brand focus:bg-white dark:focus:bg-zinc-900 focus:ring-2 focus:ring-brand/30"
                  />
                  <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-zinc-400">
                    <Icon name="mail" size={18} />
                  </span>
                </div>
              </label>

              <label className="mt-4 block text-sm font-medium text-zinc-600">
                Password
                <div className="relative mt-1.5">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    autoComplete="new-password"
                    required
                    minLength={8}
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
              </label>

              <label className="mt-4 block text-sm font-medium text-zinc-600">
                Confirm Password
                <div className="relative mt-1.5">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 px-3.5 py-2.5 pr-10 text-sm text-zinc-900 dark:text-zinc-100 outline-none placeholder:text-zinc-400/60 dark:placeholder:text-zinc-500/60 focus:border-brand focus:bg-white dark:focus:bg-zinc-900 focus:ring-2 focus:ring-brand/30"
                  />
                </div>
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
                {loading ? 'Creating Account...' : (
                  <>Create Account <Icon name="arrow" size={18} /></>
                )}
              </button>

              <div className="mt-6 text-center text-sm text-zinc-600">
                Already have an account?{' '}
                <Link to="/login" className="font-semibold text-brand hover:underline">
                  Sign In
                </Link>
              </div>
            </form>
          ) : (
            <form
              onSubmit={handleVerifySubmit}
              className="mx-auto flex w-full max-w-md flex-col justify-center rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 shadow-xl shadow-sky-900/5 dark:shadow-black/50"
            >
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Verify Your Email</h2>
              <p className="mt-2 text-sm text-zinc-600">
                We've sent a verification code to <strong>{email}</strong>.
              </p>

              <div className="mt-6">
                <label className="block text-sm font-medium text-zinc-600 mb-2">
                  Verification Code
                </label>
                <div className="flex gap-2 sm:gap-3 justify-center" onPaste={handlePaste}>
                  {otpCode.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => (inputRefs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className="w-10 h-12 sm:w-12 sm:h-14 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 text-center text-lg font-mono text-zinc-900 dark:text-zinc-100 outline-none focus:border-brand focus:bg-white dark:focus:bg-zinc-900 focus:ring-2 focus:ring-brand/30"
                      required
                    />
                  ))}
                </div>
              </div>

              {error && (
                <div className="mt-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || otpCode.join('').length !== 6}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-brand py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? 'Verifying...' : (
                  <>Verify <Icon name="check" size={18} /></>
                )}
              </button>
            </form>
          )}
        </section>
      </main>

      <AuthFooter />
    </div>
  )
}
