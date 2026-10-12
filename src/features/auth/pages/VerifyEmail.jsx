import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { authService } from '../../../api/services/authService.js'
import Icon from '../../../components/common/Icon.jsx'
import toast from 'react-hot-toast'

export default function VerifyEmail() {
  const { user, verifyEmail: verifyEmailAction } = useAuth()
  const navigate = useNavigate()
  
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [error, setError] = useState('')

  // If there's no user or the user is already verified, redirect them away
  if (!user) {
    return <Navigate to="/login" replace />
  }
  if (user.isEmailVerified) {
    return <Navigate to="/" replace />
  }

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return
    
    // If they typed more than 1 character (e.g. autofill sometimes fires change instead of paste)
    if (value.length > 1) {
      const pastedData = value.slice(0, 6).split('')
      const newOtp = [...otp]
      pastedData.forEach((char, i) => {
        if (index + i < 6) newOtp[index + i] = char
      })
      setOtp(newOtp)
      
      // Focus the next empty input or the last one
      const nextIndex = Math.min(index + pastedData.length, 5)
      const nextInput = document.getElementById(`otp-${nextIndex}`)
      if (nextInput) nextInput.focus()
      return
    }

    const newOtp = [...otp]
    newOtp[index] = value.slice(-1) // Take only the last character if somehow multiple
    setOtp(newOtp)

    // Auto-focus next
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`)
      if (nextInput) nextInput.focus()
    }
  }

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        // Move to previous and clear it
        const newOtp = [...otp]
        newOtp[index - 1] = ''
        setOtp(newOtp)
        const prevInput = document.getElementById(`otp-${index - 1}`)
        if (prevInput) prevInput.focus()
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`)
      if (prevInput) {
        prevInput.focus()
        setTimeout(() => prevInput.setSelectionRange(1, 1), 0)
      }
    } else if (e.key === 'ArrowRight' && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`)
      if (nextInput) {
        nextInput.focus()
        setTimeout(() => nextInput.setSelectionRange(1, 1), 0)
      }
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!pastedData) return

    const newOtp = [...otp]
    pastedData.split('').forEach((char, i) => {
      newOtp[i] = char
    })
    setOtp(newOtp)

    // Focus the next empty input or the last one
    const nextIndex = Math.min(pastedData.length, 5)
    const nextInput = document.getElementById(`otp-${nextIndex}`)
    if (nextInput) nextInput.focus()
  }

  const handleVerifySubmit = async (e) => {
    e.preventDefault()
    const finalOtp = otp.join('')
    if (finalOtp.length < 6) {
      setError('Please enter all 6 digits')
      return
    }

    setError('')
    setIsVerifying(true)
    try {
      const res = await verifyEmailAction(user.email, finalOtp, user.name)
      if (res.ok) {
        toast.success('Email verified successfully!')
        navigate('/', { replace: true })
      } else {
        setError(res.error)
      }
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResend = async () => {
    setIsResending(true)
    setError('')
    try {
      await authService.resendEmailVerification({ email: user.email })
      toast.success('Verification code resent!')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend code')
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950 font-sans">
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand text-white shadow-lg shadow-brand/20">
              <Icon name="mail" size={24} />
            </div>
          </div>
          <h2 className="mt-6 text-center text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Verify Your Email
          </h2>
          <p className="mt-2 text-center text-sm text-zinc-600 dark:text-zinc-400">
            We sent a verification code to <span className="font-medium text-zinc-900 dark:text-white">{user.email}</span>
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <form
            onSubmit={handleVerifySubmit}
            className="mx-auto flex w-full max-w-md flex-col justify-center rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 shadow-xl shadow-sky-900/5 dark:shadow-black/50"
          >
            {error && (
              <div className="mb-6 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="flex justify-center gap-2 sm:gap-4">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  id={`otp-${i}`}
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  onPaste={handlePaste}
                  className="h-12 w-10 sm:h-14 sm:w-14 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 text-center text-lg font-bold text-zinc-900 dark:text-white outline-none transition-all focus:border-brand focus:bg-white dark:focus:bg-zinc-900 focus:ring-2 focus:ring-brand/30 sm:text-xl"
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={isVerifying || otp.join('').length < 6}
              className="mt-8 flex w-full items-center justify-center gap-2 rounded-lg bg-brand py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isVerifying ? 'Verifying...' : (
                <>Verify <Icon name="check" size={18} /></>
              )}
            </button>
            
            <p className="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
              Didn't receive the code?{' '}
              <button
                type="button"
                onClick={handleResend}
                disabled={isResending}
                className="font-medium text-brand hover:underline disabled:opacity-50 disabled:no-underline"
              >
                {isResending ? 'Resending...' : 'Resend Code'}
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
