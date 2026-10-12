import { useNavigate, useParams } from 'react-router-dom'
import { activeUnits } from '../../../data/mockData.js'
import Icon from '../../../components/common/Icon.jsx'
import GoogleMapView from '../../../components/GoogleMapView.jsx';

// Approximate coordinates for the origin/destination cities used in mock transit data.
const CITY_COORDS = {
  'Dallas, TX': { lat: 32.7767, lng: -96.797 },
  'Phoenix, AZ': { lat: 33.4484, lng: -112.074 },
  'Austin, TX': { lat: 30.2672, lng: -97.7431 },
  'Houston, TX': { lat: 29.7604, lng: -95.3698 },
  'El Paso, TX': { lat: 31.7619, lng: -106.485 },
  'Tucson, AZ': { lat: 32.2226, lng: -110.9747 },
}

export default function VehicleDetail() {
  const { unitId } = useParams()
  const navigate = useNavigate()
  const unit = activeUnits.find((u) => u.id === unitId)

  if (!unit) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Vehicle not found.
        </p>
        <button
          onClick={() => navigate('/my-fleet')}
          className="w-fit text-sm font-semibold text-brand hover:underline dark:text-brand-dark"
        >
          Back to Fleet
        </button>
      </div>
    )
  }

  const { vehicle } = unit

  return (
    <div className="flex flex-col gap-5">
      <button
        onClick={() => navigate('/my-fleet')}
        className="flex w-fit items-center gap-2 text-sm font-semibold text-brand hover:underline dark:text-brand-dark"
      >
        <Icon name="arrowLeft" size={18} />
        Back to Fleet
      </button>

      <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
        {/* driver + metrics */}
        <div className="flex flex-col gap-5">
          <div className="flex flex-col items-center rounded-xl border border-zinc-200 bg-white p-6 text-center dark:border-zinc-800 dark:bg-zinc-900">
            <div className="relative">
              <img
                src={unit.photo}
                alt={unit.driverName}
                className="h-16 w-16 rounded-full object-cover ring-4 ring-brand/15"
              />
              <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-green-500 dark:border-zinc-900" />
            </div>
            <p className="mt-3 font-bold text-zinc-900 dark:text-zinc-50">
              {unit.driverName}
            </p>
            <p className="text-xs text-zinc-400">
              {vehicle.role} · {vehicle.idNumber}
            </p>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <p className="mb-3 text-xs font-bold uppercase tracking-wide text-zinc-400">
              Driving Metrics
            </p>
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-xs uppercase text-zinc-400">
                  Total Miles (MTD)
                </p>
                <p className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                  {vehicle.totalMilesMTD}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase text-zinc-400">
                  On-Time Rate
                </p>
                <p className="text-xl font-bold text-green-600 dark:text-green-400">
                  {vehicle.onTimeRate}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* transit + map */}
        <div className="flex flex-col gap-4">
          <div>
            <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-brand dark:text-brand-dark">
              Transit In Progress
            </span>
            <h1 className="mt-2 text-xl font-bold text-zinc-900 dark:text-zinc-50">
              Vehicle #{unit.unitNumber}
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {vehicle.model}
            </p>
          </div>

          <GoogleMapView
            className="h-64"
            zoom={6}
            markers={[
              CITY_COORDS[unit.origin] && {
                id: 'origin',
                ...CITY_COORDS[unit.origin],
                color: 'brand',
                icon: 'pin',
              },
              CITY_COORDS[unit.destination] && {
                id: 'destination',
                ...CITY_COORDS[unit.destination],
                color: 'red',
                icon: 'flag',
              },
            ].filter(Boolean)}
          >
            <span className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 shadow-md">
              <Icon name="pin" size={14} className="text-brand" />
              Current Location: {vehicle.currentLocation}
            </span>
          </GoogleMapView>

          <div className="grid grid-cols-2 gap-4 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center gap-2.5">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand/10 text-brand dark:text-brand-dark">
                <Icon name="pin" size={15} />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                  Origin
                </p>
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                  {unit.origin}
                </p>
                <p className="text-xs text-zinc-400">{vehicle.originDep}</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-red-500/10 text-red-500">
                <Icon name="flag" size={15} />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                  Destination
                </p>
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                  {unit.destination}
                </p>
                <p className="text-xs text-zinc-400">{vehicle.destinationEta}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
