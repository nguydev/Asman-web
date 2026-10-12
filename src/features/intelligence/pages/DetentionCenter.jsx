import { Link } from 'react-router-dom'
import Icon from '../../../components/common/Icon.jsx'

const NEARBY_DRIVERS = [
  { id: 1, name: 'Marcus Rodriguez', fleet: 'TX-9902-FLEET', eta: '12 Mins', proximity: 85, distance: '2.4 Miles Away' },
  { id: 2, name: 'Sarah Lansing', fleet: 'CA-2311-CORP', eta: '4 Mins', proximity: 95, distance: '0.6 Miles Away' },
  { id: 3, name: 'Harvey Kent', fleet: 'TX-1044-FLEET', eta: 'Standby', proximity: 20, distance: '8.1 Miles Away' },
]

const TOP_ATTORNEYS = [
  { id: 1, name: 'Eleanor Vance', role: 'Senior Litigation Partner', success: 94, cases: 412, photo: '/attorney-eleanor.jpg' },
  { id: 2, name: 'David Chen', role: 'Constitutional Specialist', success: 89, cases: 256, photo: '/attorney-david.jpg' },
  { id: 3, name: 'Julian Rossi', role: 'Asylum Defense Lead', success: 91, cases: 318, photo: '/attorney-julian.jpg' },
]

function initials(name) {
  return name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .toUpperCase()
}

export default function DetentionCenter() {
  return (
    <div className="flex flex-col gap-5">
      {/* breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm">
        <Link
          to="/"
          className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
        >
          Dashboard
        </Link>
        <Icon name="chevronRight" size={14} className="text-zinc-300" />
        <span className="font-semibold text-brand dark:text-brand-dark">
          Detention Center
        </span>
      </div>

      {/* header */}
      <div>

        <div className="mt-2 flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400">
            <Icon name="pin" size={15} />
            1250 Montana Ave, El Paso, TX 79902
          </span>
          <span className="flex items-center gap-1.5 rounded-full bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-600 dark:text-green-400">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
            Operational · High Security
          </span>
        </div>
      </div>

      {/* map + status */}
      <div className="grid gap-5 lg:grid-cols-3">
        {/* perimeter map */}
        <div className="relative h-72 overflow-hidden rounded-xl border border-zinc-200 lg:col-span-2 dark:border-zinc-800">
          <img
            src="/destination%20img.png"
            alt="West Texas Detention Facility perimeter map"
            className="absolute inset-0 h-full w-full object-cover"
          />

          {/* driver dots */}
          <span className="absolute left-[38%] top-[38%] h-2.5 w-2.5 rounded-full bg-brand ring-4 ring-brand/30" />
          <span className="absolute left-[55%] top-[32%] h-2.5 w-2.5 rounded-full bg-brand ring-4 ring-brand/30" />
          <span className="absolute left-[48%] top-[58%] h-2.5 w-2.5 rounded-full bg-brand ring-4 ring-brand/30" />
          <span className="absolute left-[30%] top-[68%] h-2.5 w-2.5 rounded-full bg-brand ring-4 ring-brand/30" />

          <span className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 shadow-md">
            <Icon name="broadcast" size={14} className="text-brand" />
            Real-time Perimeter View
          </span>

          <div className="absolute bottom-4 left-4 flex gap-3">
            <div className="rounded-lg bg-white px-3 py-2 shadow-md">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                Queue Depth
              </p>
              <p className="text-sm font-bold text-zinc-900">14 Trucks</p>
            </div>
            <div className="rounded-lg bg-white px-3 py-2 shadow-md">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                Wait Time
              </p>
              <p className="text-sm font-bold text-zinc-900">1h 12m</p>
            </div>
          </div>
        </div>

        {/* facility status */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="mb-4 font-semibold text-zinc-900 dark:text-zinc-50">
            Facility Status
          </h3>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-500 dark:text-zinc-400">
                Active Cases
              </span>
              <span className="font-bold text-zinc-900 dark:text-zinc-50">122</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-500 dark:text-zinc-400">
                Incident Rate
              </span>
              <span className="font-bold text-green-600 dark:text-green-400">
                0.02%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-500 dark:text-zinc-400">
                Legal Clearance
              </span>
              <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-bold text-brand dark:text-brand-dark">
                FAST-TRACK
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* nearby drivers */}
      <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">
          Nearby Drivers
        </h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          12 Fleet members currently within 10-mile radius
        </p>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[480px] table-fixed border-collapse text-sm">
            <colgroup>
              <col className="w-[44%]" />
              <col className="w-[16%]" />
              <col className="w-[40%]" />
            </colgroup>
            <thead>
              <tr>
                <th className="pb-2 text-left text-xs font-semibold uppercase tracking-wide text-zinc-400">
                  Driver Identity
                </th>
                <th className="pb-2 text-left text-xs font-semibold uppercase tracking-wide text-zinc-400">
                  Current ETA
                </th>
                <th className="pb-2 text-left text-xs font-semibold uppercase tracking-wide text-zinc-400">
                  Proximity
                </th>
              </tr>
            </thead>
            <tbody>
              {NEARBY_DRIVERS.map((d) => (
                <tr
                  key={d.id}
                  className="border-t border-zinc-100 dark:border-zinc-800"
                >
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand/10 text-xs font-bold text-brand dark:text-brand-dark">
                        {initials(d.name)}
                      </span>
                      <div>
                        <p className="font-semibold text-zinc-900 dark:text-zinc-50">
                          {d.name}
                        </p>
                        <p className="text-xs text-zinc-400">{d.fleet}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 text-zinc-700 dark:text-zinc-200">
                    {d.eta}
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                        <div
                          className={
                            'h-full rounded-full ' +
                            (d.proximity >= 50 ? 'bg-brand' : 'bg-zinc-300')
                          }
                          style={{ width: `${d.proximity}%` }}
                        />
                      </div>
                      <span className="whitespace-nowrap text-xs text-zinc-400">
                        {d.distance}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* top attorneys */}
      <div>
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">
          Top Attorneys
        </h3>
        <p className="mb-4 text-xs text-zinc-500 dark:text-zinc-400">
          Primary legal counsel with highest success rates in West Texas region
        </p>

        <div className="grid items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TOP_ATTORNEYS.map((a) => (
            <div
              key={a.id}
              className="flex h-full flex-col items-center rounded-xl border border-zinc-200 bg-white p-5 text-center dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="relative">
                <img
                  src={a.photo}
                  alt={a.name}
                  className="h-20 w-20 rounded-full object-cover ring-4 ring-brand/20"
                />
                <span className="absolute -bottom-0.5 -right-0.5 grid h-6 w-6 place-items-center rounded-full border-2 border-white bg-green-500 text-white dark:border-zinc-900">
                  <Icon name="check" size={11} />
                </span>
              </div>
              <p className="mt-3 font-semibold text-zinc-900 dark:text-zinc-50">
                {a.name}
              </p>
              <p className="text-xs font-medium text-brand dark:text-brand-dark">
                {a.role}
              </p>

              <div className="mt-4 grid w-full flex-1 grid-cols-2 gap-2 border-t border-zinc-100 pt-3 dark:border-zinc-800">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                    Success Rate
                  </p>
                  <p className="font-bold text-zinc-900 dark:text-zinc-50">
                    {a.success}%
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                    Cases Won
                  </p>
                  <p className="font-bold text-zinc-900 dark:text-zinc-50">
                    {a.cases}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex w-full gap-2">
                <button className="flex-1 rounded-lg bg-indigo-100 py-2 text-sm font-semibold text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300">
                  Profile
                </button>
                <button className="flex-1 rounded-lg bg-brand py-2 text-sm font-semibold text-white transition hover:brightness-110">
                  Contact
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
