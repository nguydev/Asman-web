import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../features/auth/context/AuthContext.jsx'
import { authService } from '../../../api/services/authService.js'
import { ROLE_LABELS } from '../../../features/auth/utils/roles.js'
import Icon from '../../../components/common/Icon.jsx'
import { formatPhoneInput, isValidPhoneInput, toE164 } from '../../../utils/phone.js'
import toast from 'react-hot-toast'
import { useFileUploader } from '../../../hooks/useFileUploader.js'

const fieldLabel = 'block text-xs font-medium text-zinc-500 dark:text-zinc-400'
const fieldInput =
  'mt-1.5 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-brand focus:ring-2 focus:ring-brand/30 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50'

const CHANNELS = [
  {
    key: 'email',
    icon: 'mail',
    title: 'Email Notifications',
    detail: 'Detailed reports and compliance logs',
    defaultOn: true,
  },
  {
    key: 'push',
    icon: 'phone',
    title: 'Push Alerts',
    detail: 'Real-time logistic corridor updates',
    defaultOn: true,
  },
  {
    key: 'sms',
    icon: 'message',
    title: 'SMS Critical',
    detail: 'Emergency security override alerts only',
    defaultOn: false,
  },
]

function ToggleSwitch({ checked, onChange, accent = false }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={
        'relative h-6 w-11 shrink-0 rounded-full transition-colors ' +
        (checked ? 'bg-zinc-900 dark:bg-zinc-100' : 'bg-zinc-300 dark:bg-zinc-700')
      }
    >
      <span
        className={
          'absolute top-0.5 grid h-5 w-5 place-items-center rounded-full bg-white shadow transition-transform dark:bg-zinc-900 ' +
          (checked ? 'translate-x-5' : 'translate-x-0.5')
        }
      >
        {accent && checked && (
          <span className="grid h-3 w-3 place-items-center rounded-full bg-brand text-white">
            <Icon name="check" size={8} />
          </span>
        )}
      </span>
    </button>
  )
}

function SectionTitle({ icon, children }) {
  return (
    <div className="flex items-center gap-2">
      <Icon name={icon} size={15} className="text-zinc-400" />
      <h2 className="font-bold text-zinc-900 dark:text-zinc-50">{children}</h2>
    </div>
  )
}

function ReadField({ icon, children }) {
  return (
    <span className="flex items-center gap-1.5">
      <Icon name={icon} size={13} />
      {children}
    </span>
  )
}

function SuperAdminSettings() {
  const { user, logout, setUser } = useAuth()
  const navigate = useNavigate()

  const [editingProfile, setEditingProfile] = useState(false)
  const [profile, setProfile] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
  })
  const [draft, setDraft] = useState(profile)
  const [phoneError, setPhoneError] = useState('')
  const [isSavingProfile, setIsSavingProfile] = useState(false)

  const {
    uploadPublicAsset,
    isUploading,
    error: uploadError,
    setError: setUploadError,
  } = useFileUploader()
  const fileInputRef = useRef(null)

  const [showCurrent, setShowCurrent] = useState(false)
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' })
  const [pwError, setPwError] = useState('')
  const [isSavingPassword, setIsSavingPassword] = useState(false)

  // const [twoFactor, setTwoFactor] = useState(true)
  const [globalAlerts, setGlobalAlerts] = useState(true)
  const [channels, setChannels] = useState(
    Object.fromEntries(CHANNELS.map((c) => [c.key, c.defaultOn]))
  )
  const [sessions, setSessions] = useState([])
  const [isLoadingSessions, setIsLoadingSessions] = useState(true)

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await authService.getSessions()
        const data = res.data?.data || res.data || []
        setSessions(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error('Failed to fetch sessions', err)
        toast.error('Failed to load active sessions.')
      } finally {
        setIsLoadingSessions(false)
      }
    }
    fetchSessions()
  }, [])

  const startEdit = () => {
    setDraft(profile)
    setEditingProfile(true)
  }

  const cancelEdit = () => {
    setDraft(profile)
    setEditingProfile(false)
  }

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File is too large (max 10MB)')
      return
    }

    const previousAvatar = user.avatar
    const tempUrl = URL.createObjectURL(file)
    setUser((u) => ({ ...u, avatar: tempUrl }))

    try {
      const { url: publicUrl } = await uploadPublicAsset(file)

      await authService.updateProfile({ avatarUrl: publicUrl })

      setUser((u) => ({ ...u, avatar: publicUrl }))
      URL.revokeObjectURL(tempUrl)

      toast.success('Profile photo updated.')
    } catch (err) {
      console.error(err)
      setUser((u) => ({ ...u, avatar: previousAvatar }))
      URL.revokeObjectURL(tempUrl)

      toast.error(uploadError || err.message || 'Failed to update avatar')
      if (!uploadError) {
        setUploadError(err.message || 'Failed to update avatar')
      }
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const setDraftField = (key) => (e) =>
    setDraft((d) => ({ ...d, [key]: e.target.value }))

  const handlePhoneChange = (e) => {
    const formatted = formatPhoneInput(e.target.value)
    setDraft((d) => ({ ...d, phone: formatted }))
    if (phoneError && isValidPhoneInput(formatted)) {
      setPhoneError('')
    }
  }

  const handlePhoneBlur = () => {
    if (!isValidPhoneInput(draft.phone)) {
      setPhoneError('Invalid phone number')
    }
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()

    if (!isValidPhoneInput(draft.phone)) {
      setPhoneError('Invalid phone number')
      toast.error('Please enter a valid phone number.')
      return
    }

    setIsSavingProfile(true)
    try {
      const phoneToSend = toE164(draft.phone)

      await authService.updateProfile({ name: draft.fullName, phone: phoneToSend })
      setProfile(draft)
      setUser((u) => ({ ...u, name: draft.fullName, phone: phoneToSend }))
      setEditingProfile(false)
      toast.success('Profile updated.')
    } catch (err) {
      console.error(err)
      toast.error('Failed to update profile.')
    } finally {
      setIsSavingProfile(false)
    }
  }

  const handleSavePassword = async (e) => {
    e.preventDefault()
    setPwError('')

    if (!pw.current) {
      setPwError('Enter your current password to continue.')
      return
    }
    if (pw.next.length < 8) {
      setPwError('New password must be at least 8 characters.')
      return
    }
    if (pw.next !== pw.confirm) {
      setPwError('New password and confirmation do not match.')
      return
    }

    setIsSavingPassword(true)
    try {
      await authService.changePassword({
        currentPassword: pw.current,
        newPassword: pw.next,
      })
      setPw({ current: '', next: '', confirm: '' })
      setShowCurrent(false)
      toast.success('Password updated successfully.')
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.message || 'Failed to change password.')
    } finally {
      setIsSavingPassword(false)
    }
  }

  const revokeSession = async (id) => {
    try {
      await authService.revokeSession(id)
      setSessions((prev) => prev.filter((s) => s.id !== id && s._id !== id))
      toast.success('Session revoked successfully.')
    } catch (err) {
      console.error('Failed to revoke session', err)
      toast.error('Failed to revoke session.')
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-1.5 text-sm">
        <span className="text-zinc-400">Workspace</span>
        <Icon name="chevronRight" size={13} className="text-zinc-300" />
        <span className="font-semibold text-zinc-600 dark:text-zinc-300">Account Settings</span>
      </div>


      {/* profile */}
      <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative shrink-0 flex flex-col items-center">
              <div className="relative h-16 w-16 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt="Profile"
                    className={`h-full w-full object-cover transition duration-300 ${isUploading ? 'opacity-50 blur-[2px]' : ''}`}
                  />
                ) : (
                  <Icon name="user" size={28} className="text-zinc-500 dark:text-zinc-400" />
                )}
                {isUploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                    <Icon name="spinner" size={20} className="animate-spin text-brand drop-shadow-md" />
                  </div>
                )}
              </div>
              <button
                type="button"
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 grid h-6 w-6 place-items-center rounded-full border-2 border-white bg-zinc-900 text-white dark:border-zinc-900 transition hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Icon name="edit" size={11} />
              </button>
              <input
                type="file"
                className="hidden"
                ref={fileInputRef}
                accept="image/jpeg, image/png, image/webp"
                onChange={handleAvatarChange}
              />
              {uploadError && (
                <span className="absolute -bottom-5 whitespace-nowrap text-micro text-red-500">
                  {uploadError}
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-base font-bold text-zinc-900 dark:text-zinc-50">
                  {profile.fullName}
                </p>
                <span className="rounded-full bg-brand-soft px-2 py-0.5 text-xs font-semibold text-brand">
                  {ROLE_LABELS[user.role]}
                </span>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-zinc-500 dark:text-zinc-400">
                <ReadField icon="mail">{user?.email}</ReadField>
                <ReadField icon="phone">{profile.phone}</ReadField>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {!editingProfile && (
              <button
                type="button"
                onClick={startEdit}
                className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {editingProfile && (
          <form
            onSubmit={handleSaveProfile}
            className="mt-5 border-t border-zinc-100 pt-5 dark:border-zinc-800"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={fieldLabel}>Full Name</label>
                <input
                  value={draft.fullName}
                  onChange={setDraftField('fullName')}
                  className={fieldInput}
                />
              </div>
              <div>
                <label className={fieldLabel}>Phone Number</label>
                <input
                  type="tel"
                  value={draft.phone}
                  onChange={handlePhoneChange}
                  onBlur={handlePhoneBlur}
                  placeholder="+1 (555) 555-5555"
                  className={`${fieldInput} ${phoneError ? 'border-red-500 focus:border-red-500 focus:ring-red-500/30' : ''}`}
                />
                {phoneError && <p className="mt-1 text-xs text-red-500">{phoneError}</p>}
              </div>
            </div>
            <div className="mt-4 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={cancelEdit}
                className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSavingProfile}
                className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-70"
              >
                Save Changes
              </button>
            </div>
          </form>
        )}
      </div>

      {/* security */}
      <SectionTitle icon="lock">Security Architecture</SectionTitle>
      <form
        onSubmit={handleSavePassword}
        className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
      >
        <h3 className="font-bold text-zinc-900 dark:text-zinc-50">Update Password</h3>
        <p className="mt-1 text-base text-zinc-500 dark:text-zinc-400">
          Ensure your account remains institutional-grade secure by using a complex, rotated
          passphrase.
        </p>

        <div className="mt-4 max-w-sm">
          <label className={fieldLabel}>Current Password</label>
          <div className="relative">
            <input
              type={showCurrent ? 'text' : 'password'}
              value={pw.current}
              onChange={(e) => setPw((p) => ({ ...p, current: e.target.value }))}
              className={fieldInput + ' pr-10'}
            />
            <button
              type="button"
              onClick={() => setShowCurrent((v) => !v)}
              className="absolute inset-y-0 right-2 mt-1.5 flex items-center text-zinc-400 hover:text-zinc-600"
            >
              <Icon name={showCurrent ? 'eyeOff' : 'eye'} size={16} />
            </button>
          </div>
        </div>

        <div className="mt-4 grid max-w-2xl grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={fieldLabel}>New Password</label>
            <input
              type="password"
              value={pw.next}
              onChange={(e) => setPw((p) => ({ ...p, next: e.target.value }))}
              placeholder="Min. 8 characters"
              className={fieldInput}
            />
          </div>
          <div>
            <label className={fieldLabel}>Confirm New Password</label>
            <input
              type="password"
              value={pw.confirm}
              onChange={(e) => setPw((p) => ({ ...p, confirm: e.target.value }))}
              placeholder="Re-enter new passphrase"
              className={fieldInput}
            />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-end gap-3">
          {pwError && (
            <span className="text-xs font-semibold text-red-500">{pwError}</span>
          )}
          <button
            type="submit"
            disabled={isSavingPassword}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-black dark:hover:bg-zinc-200 dark:bg-zinc-100 dark:text-zinc-900 disabled:opacity-70"
          >
            {isSavingPassword ? 'Saving...' : 'Save Password'}
          </button>
        </div>
      </form>

      {/* two-factor authentication */}
      {/*
      <SectionTitle icon="shield">Two-Factor Authentication</SectionTitle>
      <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-soft text-brand">
              <Icon name="shield" size={18} />
            </span>
            <div>
              <p className="font-semibold text-zinc-900 dark:text-zinc-50">
                Authenticator App
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Require a time-based one-time code at sign-in.
              </p>
            </div>
          </div>
          <ToggleSwitch checked={twoFactor} onChange={setTwoFactor} accent />
        </div>

        <div
          className={
            'mt-4 flex items-center gap-2 rounded-lg border px-3 py-2.5 text-xs font-semibold ' +
            (twoFactor
              ? 'border-green-200 bg-green-50 text-green-700 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-400'
              : 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400')
          }
        >
          <Icon name={twoFactor ? 'check' : 'warning'} size={14} />
          {twoFactor
            ? 'Two-factor authentication is active on this account.'
            : 'Your account is not protected by two-factor authentication.'}
        </div>
      </div>
       */}

      {/* notifications */}
      <SectionTitle icon="bell">System Notifications</SectionTitle>
      <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-zinc-900 dark:text-zinc-50">Global Alerts</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Enable or disable all automated platform notifications.
            </p>
          </div>
          <ToggleSwitch checked={globalAlerts} onChange={setGlobalAlerts} accent />
        </div>

        <p className="mt-5 border-t border-zinc-100 pt-5 text-xs font-bold uppercase tracking-wide text-zinc-400 dark:border-zinc-800">
          Delivery Channels
        </p>

        <div className="mt-3 flex flex-col divide-y divide-zinc-100 dark:divide-zinc-800">
          {CHANNELS.map((c) => (
            <div key={c.key} className="flex items-center justify-between gap-3 py-3.5">
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                  <Icon name={c.icon} size={15} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                    {c.title}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">{c.detail}</p>
                </div>
              </div>
              <ToggleSwitch
                checked={globalAlerts && channels[c.key]}
                onChange={(v) => setChannels((prev) => ({ ...prev, [c.key]: v }))}
              />
            </div>
          ))}
        </div>
      </div>

      {/* active sessions */}
      <SectionTitle icon="globe">Active Sessions</SectionTitle>
      <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Devices currently signed in to this account. Revoke any you don&apos;t recognize.
        </p>
        <div className="mt-3 flex flex-col divide-y divide-zinc-100 dark:divide-zinc-800">
          {isLoadingSessions ? (
            <div className="py-8 text-center text-sm text-zinc-500">Loading sessions...</div>
          ) : sessions.length === 0 ? (
            <div className="py-8 text-center text-sm text-zinc-500">No active sessions found.</div>
          ) : (
            sessions.map((s) => (
              <div key={s.id || s._id} className="flex items-center justify-between gap-3 py-3.5">
                <div className="flex items-center gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                    <Icon name={s.icon || 'compass'} size={15} />
                  </span>
                  <div>
                    <p className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                      {s.device || s.userAgent || s.deviceInfo || 'Unknown Device'}
                      {(s.current || s.isCurrent) && (
                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-green-700 dark:bg-green-500/15 dark:text-green-400">
                          This device
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {s.location || s.ipAddress || s.ip || 'Unknown location'} · {s.lastActive || (s.lastAccessedAt ? new Date(s.lastAccessedAt).toLocaleString() : s.createdAt ? new Date(s.createdAt).toLocaleString() : 'Active')}
                    </p>
                  </div>
                </div>
                {!(s.current || s.isCurrent) && (
                  <button
                    type="button"
                    onClick={() => revokeSession(s.id || s._id)}
                    className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-semibold text-zinc-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-red-500/30 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                  >
                    Revoke
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* danger zone */}
      <div className="flex items-center justify-between rounded-xl border border-red-200 bg-white p-5 dark:border-red-500/30 dark:bg-zinc-900">
        <div>
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            Sign out of your account
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            You will need to sign in again to access the console.
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
        >
          <Icon name="logout" size={15} />
          Logout
        </button>
      </div>
    </div>
  )
}

export default SuperAdminSettings
