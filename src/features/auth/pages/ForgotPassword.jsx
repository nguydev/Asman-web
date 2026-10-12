import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '../../../api/services/authService.js'
import Icon from '../../../components/common/Icon.jsx'
import toast from 'react-hot-toast'

export default function ForgotPassword() {
  const navigate = useNavigate()
  
  const [step, setStep] = useState(1)
  const [isCodeSent, setIsCodeSent] = useState(false)
  const [resetToken, setResetToken] = useState('')
  
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSendCode = async (e) => {
    if (e) e.preventDefault()
    if (!email) {
      setError('Please enter your email')
      return
    }

    setError('')
    setLoading(true)
    try {
      await authService.forgotPassword({ email: email.trim().toLowerCase() })
      setIsCodeSent(true)
      toast.success('Password reset code sent!')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to request password reset')
    } finally {
      setLoading(false)
    }
  }

  const handleNextStep = async (e) => {
    e.preventDefault()
    const finalOtp = otp.join('')
    if (finalOtp.length < 6) {
      setError('Please enter all 6 digits of the code')
      return
    }
    
    setError('')
    setLoading(true)
    try {
      const res = await authService.verifyPasswordResetOtp({ 
        email: email.trim().toLowerCase(), 
        code: finalOtp 
      })
      
      const extractedToken = res.data?.root?.resetToken || res.data?.data?.resetToken || res.data?.resetToken || res.root?.resetToken || res.resetToken;
      
      if (!extractedToken) {
        throw new Error('Failed to retrieve reset token from server.')
      }
      
      setResetToken(extractedToken)
      setStep(2)
      toast.success('Code verified!')
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Invalid or expired code')
    } finally {
      setLoading(false)
    }
  }

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return
    
    if (value.length > 1) {
      const pastedData = value.slice(0, 6).split('')
      const newOtp = [...otp]
      pastedData.forEach((char, i) => {
        if (index + i < 6) newOtp[index + i] = char
      })
      setOtp(newOtp)
      
      const nextIndex = Math.min(index + pastedData.length, 5)
      const nextInput = document.getElementById(`otp-${nextIndex}`)
      if (nextInput) nextInput.focus()
      return
    }

    const newOtp = [...otp]
    newOtp[index] = value.slice(-1)
    setOtp(newOtp)

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`)
      if (nextInput) nextInput.focus()
    }
  }

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
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

    const nextIndex = Math.min(pastedData.length, 5)
    const nextInput = document.getElementById(`otp-${nextIndex}`)
    if (nextInput) nextInput.focus()
  }

  const handleResetSubmit = async (e) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setError('')
    setLoading(true)
    try {
      await authService.resetPassword({ 
        token: resetToken, 
        password 
      })
      toast.success('Password has been reset successfully!')
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950 font-sans">
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand text-white shadow-lg shadow-brand/20">
              <Icon name="key" size={24} />
            </div>
          </div>
          <h2 className="mt-6 text-center text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
            {step === 1 ? 'Reset your password' : 'Create a new password'}
          </h2>
          <p className="mt-2 text-center text-sm text-zinc-600 dark:text-zinc-400">
            {step === 1 && !isCodeSent && 'Enter your email address to receive a verification code.'}
            {step === 1 && isCodeSent && `We sent a verification code to ${email}`}
            {step === 2 && 'Enter a strong, secure password.'}
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="mx-auto w-full max-w-md rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 shadow-xl shadow-sky-900/5 dark:shadow-black/50">
            {error && (
              <div className="mb-6 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {step === 1 ? (
              <form onSubmit={isCodeSent ? handleNextStep : handleSendCode}>
                <div className="space-y-6">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-zinc-600 dark:text-zinc-400">
                      Email address
                    </label>
                    <div className="mt-1.5">
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isCodeSent}
                        placeholder="you@example.com"
                        autoComplete="email"
                        required
                        className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 px-3.5 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 outline-none transition-all placeholder:text-zinc-400/60 focus:border-brand focus:bg-white dark:focus:bg-zinc-900 focus:ring-2 focus:ring-brand/30 disabled:opacity-60 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {isCodeSent && (
                    <div className="animate-slide-up">
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400">
                          Verification Code
                        </label>
                        <button
                          type="button"
                          onClick={() => handleSendCode()}
                          disabled={loading}
                          className="text-xs font-medium text-brand hover:underline disabled:opacity-50 disabled:no-underline"
                        >
                          Resend Code
                        </button>
                      </div>
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
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || !email || (isCodeSent && otp.join('').length < 6)}
                  className="mt-8 flex w-full items-center justify-center gap-2 rounded-lg bg-brand py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? (isCodeSent ? 'Processing...' : 'Sending Code...') : (
                    isCodeSent ? <>Next Step <Icon name="arrow" size={18} /></> : <>Send Code <Icon name="mail" size={18} /></>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetSubmit} className="animate-slide-up">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400">
                      New Password
                    </label>
                    <div className="relative mt-1.5">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="At least 8 characters"
                        required
                        className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 px-3.5 py-2.5 pr-10 text-sm text-zinc-900 dark:text-zinc-100 outline-none transition-all placeholder:text-zinc-400/60 focus:border-brand focus:bg-white dark:focus:bg-zinc-900 focus:ring-2 focus:ring-brand/30"
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

                  <div>
                    <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400">
                      Confirm New Password
                    </label>
                    <div className="relative mt-1.5">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Must match new password"
                        required
                        className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 px-3.5 py-2.5 pr-10 text-sm text-zinc-900 dark:text-zinc-100 outline-none transition-all placeholder:text-zinc-400/60 focus:border-brand focus:bg-white dark:focus:bg-zinc-900 focus:ring-2 focus:ring-brand/30"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-3 flex items-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                      >
                        <Icon name={showConfirmPassword ? 'eyeOff' : 'eye'} size={18} />
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !password || !confirmPassword}
                  className="mt-8 flex w-full items-center justify-center gap-2 rounded-lg bg-brand py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? 'Resetting Password...' : (
                    <>Reset Password <Icon name="check" size={18} /></>
                  )}
                </button>
                
                <p className="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="font-medium text-brand hover:underline"
                  >
                    Back to email verification
                  </button>
                </p>
              </form>
            )}

            <div className="mt-6 text-center">
              <Link to="/login" className="text-sm font-medium text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300">
                Return to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
