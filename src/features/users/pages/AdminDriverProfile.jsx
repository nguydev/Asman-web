import { Link, useNavigate, useParams } from 'react-router-dom'
import { adminDrivers } from '../../../data/mockData.js'
import Icon from '../../../components/common/Icon.jsx'

export default function AdminDriverProfile() {
  const { driverId } = useParams()
  const navigate = useNavigate()
  const driver = adminDrivers.find((d) => d.id === driverId)

  if (!driver) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Driver not found.
        </p>
        <button
          onClick={() => navigate('/all-drivers')}
          className="w-fit text-sm font-semibold text-brand hover:underline dark:text-brand-dark"
        >
          Back to Driver List
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-2 text-sm">
        <Link
          to="/all-drivers"
          className="flex items-center gap-1.5 font-semibold text-zinc-500 hover:text-brand dark:text-zinc-400 dark:hover:text-brand-dark"
        >
          <Icon name="arrowLeft" size={16} />
          Back to Driver List
        </Link>
        <span className="text-zinc-300">|</span>
        <span className="font-semibold text-zinc-900 dark:text-zinc-50">
          Driver Profile: #{driver.cdlNumber}
        </span>
      </div>

      {/* header */}
      <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-wrap items-start gap-4">
          <img
            src={driver.photo}
            alt={driver.name}
            className="h-24 w-24 rounded-xl object-cover"
          />
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                {driver.name}
              </h1>
              <span
                className={
                  'rounded-full px-2.5 py-0.5 text-xs font-bold uppercase ' +
                  (driver.status === 'active'
                    ? 'bg-green-500/15 text-green-600 dark:text-green-400'
                    : 'bg-red-500/15 text-red-600 dark:text-red-400')
                }
              >
                {driver.status === 'active' ? 'Active Now' : 'Alert'}
              </span>
            </div>
            <p className="mt-2 flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400">
              <Icon name="truck" size={15} className="text-brand dark:text-brand-dark" />
              Route: <span className="font-semibold text-zinc-800 dark:text-zinc-100">{driver.routeFull}</span>
            </p>

            <div className="mt-4 flex gap-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                  Experience
                </p>
                <p className="font-bold text-zinc-900 dark:text-zinc-50">
                  {driver.experience}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                  License Expiration
                </p>
                <p className="font-bold text-zinc-900 dark:text-zinc-50">
                  {driver.licenseExpiration}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        {/* personnel information */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="font-bold text-zinc-900 dark:text-zinc-50">
            Personnel Information
          </h3>

          <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-zinc-400">
            CDL Number
          </p>
          <p className="mt-1 flex items-center gap-2">
            <span className="font-bold text-zinc-900 dark:text-zinc-50">
              {driver.cdlNumber}
            </span>
            <span className="rounded-full bg-brand/10 px-2 py-0.5 text-xs font-semibold text-brand dark:text-brand-dark">
              {driver.cdlClass}
            </span>
          </p>

          <div className="mt-4 border-t border-zinc-100 pt-4 dark:border-zinc-800">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
              Emergency Contact
            </p>
            <p className="mt-1 font-bold text-zinc-900 dark:text-zinc-50">
              {driver.emergencyContact.name} ({driver.emergencyContact.relation})
            </p>
            <a
              href={`tel:${driver.emergencyContact.phone}`}
              className="text-sm font-semibold text-brand hover:underline dark:text-brand-dark"
            >
              {driver.emergencyContact.phone}
            </a>
          </div>
        </div>

        {/* identity vault */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="font-bold text-zinc-900 dark:text-zinc-50">
            Identity Vault
          </h3>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {driver.documents.map((doc) => (
              <div key={doc.id} className="flex flex-col items-center gap-1.5">
                <div className="relative h-20 w-full overflow-hidden rounded-lg bg-gradient-to-br from-zinc-700 to-zinc-900">
                  <div className="absolute inset-0 grid place-items-center text-zinc-500">
                    <Icon name="file" size={22} />
                  </div>
                  {doc.verified && (
                    <span className="absolute right-1.5 top-1.5 grid h-5 w-5 place-items-center rounded-full bg-green-500 text-white">
                      <Icon name="check" size={11} />
                    </span>
                  )}
                </div>
                <p className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
                  {doc.label}
                </p>
              </div>
            ))}
            <label className="flex h-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-zinc-200 text-zinc-400 transition hover:border-brand/40 hover:text-brand dark:border-zinc-700">
              <input type="file" className="hidden" />
              <Icon name="image" size={18} />
              <span className="text-xs font-semibold">Add New</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}
