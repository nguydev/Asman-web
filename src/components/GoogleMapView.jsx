import Icon from './common/Icon.jsx'

// Static map canvas for the frontend-only preview. No map provider or location
// service is loaded from the browser.
export default function GoogleMapView({
  markers = [],
  selectedId,
  onMarkerClick,
  className = '',
  children,
}) {
  return (
    <div
      className={`relative flex min-h-[420px] flex-col overflow-hidden rounded-xl border border-zinc-200 bg-map-bg dark:border-zinc-800 dark:bg-zinc-900 ${className}`}
    >
      <div className="flex flex-1 items-center justify-center bg-[radial-gradient(circle_at_center,_rgba(14,165,233,0.14),_transparent_58%)] p-6">
        <div className="max-w-sm text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-brand/10 text-brand dark:text-brand-dark">
            <Icon name="map" size={22} />
          </span>
          <p className="mt-3 text-sm font-semibold text-zinc-800 dark:text-zinc-100">Map preview</p>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            This frontend-only version does not load map or live-location APIs.
          </p>
        </div>
      </div>
      {markers.length > 0 && (
        <div className="absolute inset-x-3 bottom-3 flex max-h-24 flex-wrap gap-2 overflow-auto">
          {markers.slice(0, 12).map((marker) => (
            <button
              key={marker.id}
              type="button"
              onClick={() => onMarkerClick?.(marker)}
              className={`rounded-full border px-2.5 py-1 text-xs font-medium ${selectedId === marker.id ? 'border-brand bg-brand/10 text-brand' : 'border-zinc-200 bg-white/90 text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800/90 dark:text-zinc-300'}`}
            >
              {marker.name || marker.label || marker.role || 'Location'}
            </button>
          ))}
        </div>
      )}
      {children}
    </div>
  )
}
