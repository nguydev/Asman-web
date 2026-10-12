import { useNavigate } from 'react-router-dom'
import { adminDrivers } from '../../../data/mockData.js'
import Icon from '../../../components/common/Icon.jsx'

const STATUS_STYLES = {
  active: 'bg-green-500/15 text-green-600 dark:text-green-400',
  alert: 'bg-red-500/15 text-red-600 dark:text-red-400',
}
const STATUS_LABELS = { active: 'Active', alert: 'Alert' }

export default function AllDrivers() {
  const navigate = useNavigate()
  const alertCount = adminDrivers.filter((d) => d.status === 'alert').length

  return (
    <div className="flex flex-col gap-5">
      {/* stat tiles */}
      <div className="grid gap-4 sm:grid-cols-2 sm:max-w-lg">
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Critical Alerts</p>
          <p className="mt-1 flex items-baseline gap-2">
            <span className="text-xl font-bold text-red-500">
              {String(alertCount).padStart(2, '0')}
            </span>
            <span className="text-xs text-zinc-400">Active Now</span>
          </p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Active Routes</p>
          <p className="mt-1 flex items-baseline gap-2">
            <span className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
              412
            </span>
            <span className="text-xs text-zinc-400">In Transit</span>
          </p>
        </div>
      </div>

      {/* table */}
      <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="px-5 pt-4">
          <h3 className="font-bold text-zinc-900 dark:text-zinc-50">
            Active Drivers
          </h3>
        </div>

        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-160 border-collapse text-sm">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-800/60">
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-400">
                  Driver Name
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-400">
                  CDL Number
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-400">
                  Current Location
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-400">
                  Status
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-400">
                  Route
                </th>
              </tr>
            </thead>
            <tbody>
              {adminDrivers.map((d) => (
                <tr
                  key={d.id}
                  onClick={() => navigate(`/all-drivers/${d.id}`)}
                  className="cursor-pointer border-t border-zinc-100 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/60"
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={d.photo}
                        alt={d.name}
                        className="h-9 w-9 shrink-0 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-semibold text-zinc-900 dark:text-zinc-50">
                          {d.name}
                        </p>
                        <p className="text-xs text-zinc-400">
                          Fleet ID: {d.fleetIdCode}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-zinc-600 dark:text-zinc-300">
                    {d.cdlNumber}
                  </td>
                  <td className="px-5 py-3">
                    {d.status === 'alert' ? (
                      <span className="flex items-center gap-1.5 text-red-500">
                        <Icon name="warning" size={14} />
                        {d.alertNote}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-300">
                        <Icon name="pin" size={14} className="text-brand dark:text-brand-dark" />
                        {d.location}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase ${STATUS_STYLES[d.status]}`}
                    >
                      {STATUS_LABELS[d.status]}
                    </span>
                  </td>
                  <td className="px-5 py-3 font-medium text-zinc-900 dark:text-zinc-50">
                    {d.route}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
