import Icon from '../../../components/common/Icon.jsx'
import { Button } from '../../../components/ui/Button.jsx'
import { useState } from 'react'
import { formatPhoneInput, isValidPhoneInput } from '../../../utils/phone.js'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  apiErrorMessage,
  driverService,
  unwrapApiData,
} from '../../../api/services/driverService.js'
import {
  fleetService,
  unwrapApiData as unwrapFleets,
} from '../../../api/services/fleetService.js'
import { getCurrentOrganizationId } from '../../../api/services/orgContext.js'

const PASSWORD_CHARS =
  'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%'

function generateTemporaryPassword(length = 12) {
  const bytes = new Uint32Array(length)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (n) => PASSWORD_CHARS[n % PASSWORD_CHARS.length]).join(
    '',
  )
}

function SectionLabel({ icon = 'user', children }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <span className="grid h-6 w-6 place-items-center rounded-full bg-brand/10 text-brand dark:text-brand-dark">
        <Icon name={icon} size={13} />
      </span>
      <span className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
        {children}
      </span>
    </div>
  )
}

const fieldLabel = 'block text-xs font-medium text-zinc-500 dark:text-zinc-400'
const fieldInput =
  'mt-1.5 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-brand focus:bg-white dark:focus:bg-zinc-900 focus:ring-2 focus:ring-brand/30 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50'

export default function CreateDriverPage() {
  const navigate = useNavigate()
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [fleetId, setFleetId] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const { data: fleets = [] } = useQuery({
    queryKey: ['organization-fleets-options'],
    queryFn: async () => {
      const orgId = await getCurrentOrganizationId()
      const res = await fleetService.list(orgId)
      const data = unwrapFleets(res)
      return Array.isArray(data) ? data : []
    },
  })

  const { mutate: createDriver, isPending } = useMutation({
    mutationFn: async (data) => {
      const orgId = await getCurrentOrganizationId()
      return driverService.createOrganizationDriver(orgId, data)
    },
    onSuccess: (res) => {
      const driver = unwrapApiData(res)
      toast.success('Driver registered')
      if (driver?.id) {
        navigate(`/drivers/${driver.id}/edit`, { replace: true })
      } else {
        navigate('/drivers')
      }
    },
    onError: (err) => {
      setError(apiErrorMessage(err, 'Failed to create driver'))
    },
  })

  const handlePhoneChange = (e) => {
    setPhone(formatPhoneInput(e.target.value))
    if (error) setError('')
  }

  const handleGeneratePassword = () => {
    const next = generateTemporaryPassword()
    setPassword(next)
    setShowPassword(true)
    if (error) setError('')
    toast.success('Temporary password generated')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!isValidPhoneInput(phone)) {
      setError('Please enter a valid phone number.')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    const formData = new FormData(e.target)
    createDriver({
      name: String(formData.get('name') || '').trim(),
      email: String(formData.get('email') || '').trim().toLowerCase(),
      password,
      vinNumber: String(formData.get('vinNumber') || '').trim(),
      licensePlate: String(formData.get('licensePlate') || '').trim(),
      ...(fleetId ? { fleetId } : {}),
    })
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-black/50 p-4 py-8 backdrop-blur-sm sm:items-center sm:py-10">
      <form
        onSubmit={handleSubmit}
        className="my-auto w-full max-w-3xl rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900"
      >
        <div className="flex items-start justify-between gap-4 border-b border-zinc-100 p-6 dark:border-zinc-800">
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand">
              <Icon name="userPlus" size={18} />
            </span>
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                New Driver Registration
              </h2>
              <p className="mt-0.5 text-sm text-zinc-500">
                Create the account first. Add immigration documents on the next
                step.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate('/drivers')}
            className="grid h-8 w-8 place-items-center rounded-lg text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800"
          >
            <Icon name="close" size={18} />
          </button>
        </div>

        <div className="space-y-8 p-6">
          {error && (
            <div className="rounded-lg bg-red-500/10 px-3 py-2 text-sm font-medium text-red-500">
              {error}
            </div>
          )}

          <section>
            <SectionLabel icon="user">Personal Information</SectionLabel>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={fieldLabel}>Full Name</label>
                <input
                  name="name"
                  required
                  placeholder="e.g. Johnathan Smith"
                  className={fieldInput}
                />
              </div>
              <div>
                <label className={fieldLabel}>Contact Email</label>
                <input
                  name="email"
                  required
                  type="email"
                  placeholder="driver@asman.io"
                  className={fieldInput}
                />
              </div>
              <div>
                <label className={fieldLabel}>Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder="+1 (555) 000-0000"
                  className={fieldInput}
                />
              </div>
              <div>
                <label className={fieldLabel}>Temporary Password</label>
                <div className="relative mt-1.5">
                  <input
                    name="password"
                    required
                    type={showPassword ? 'text' : 'password'}
                    minLength={8}
                    autoComplete="new-password"
                    placeholder="Min. 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`${fieldInput} mt-0 pr-20`}
                  />
                  <div className="absolute inset-y-0 right-1.5 flex items-center gap-0.5">
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      title={showPassword ? 'Hide password' : 'Show password'}
                      className="grid h-8 w-8 place-items-center rounded-md text-zinc-400 transition hover:bg-zinc-200/70 hover:text-zinc-700 dark:hover:bg-zinc-700 dark:hover:text-zinc-100"
                    >
                      <Icon name={showPassword ? 'eyeOff' : 'eye'} size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={handleGeneratePassword}
                      title="Generate random password"
                      className="grid h-8 w-8 place-items-center rounded-md text-zinc-400 transition hover:bg-brand/10 hover:text-brand"
                    >
                      <Icon name="sync" size={15} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="border-t border-zinc-100 pt-6 dark:border-zinc-800">
            <SectionLabel icon="badge">Professional Credentials</SectionLabel>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={fieldLabel}>VIN Number</label>
                <input
                  name="vinNumber"
                  required
                  placeholder="1HGBH41JXMN109186"
                  className={fieldInput}
                />
              </div>
              <div>
                <label className={fieldLabel}>License Plate</label>
                <input
                  name="licensePlate"
                  required
                  placeholder="e.g. ABC-1234"
                  className={fieldInput}
                />
              </div>
              <div className="sm:col-span-2">
                <label className={fieldLabel}>Fleet (optional)</label>
                <select
                  value={fleetId}
                  onChange={(e) => setFleetId(e.target.value)}
                  className={fieldInput}
                >
                  <option value="">No fleet assignment</option>
                  {fleets.map((fleet) => (
                    <option key={fleet.id} value={fleet.id}>
                      {fleet.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-zinc-100 px-6 py-4 dark:border-zinc-800">
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate('/drivers')}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            icon="userPlus"
            disabled={isPending}
          >
            {isPending ? 'Registering...' : 'Register Driver'}
          </Button>
        </div>
      </form>
    </div>
  )
}
