import Icon from './common/Icon.jsx'

export default function TierCard({ tier, selected, onEdit, shouldEdit }) {
  let cardTone = 'border-zinc-200 dark:border-zinc-800'
  if (selected) cardTone = 'border-2 border-brand ring-2 ring-brand/20'
  else if (tier.current) cardTone = 'border-2 border-red-300 bg-red-50/40 dark:border-red-500/40 dark:bg-red-500/5'

  let buttonTone = 'border border-zinc-200 text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800'
  if (selected) buttonTone = 'bg-brand text-white hover:bg-brand-dark'
  else if (tier.current) buttonTone = 'bg-red-600 text-white hover:bg-red-700'

  const iconClass = tier.iconClass || 'bg-brand/10 text-brand dark:text-brand-dark'
  const iconName = tier.icon || 'shield'

  return (
    <div
      className={'flex flex-col rounded-xl border bg-white p-5 dark:bg-zinc-900 ' + cardTone}
    >
      <div className="flex items-center justify-between">
        <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${iconClass}`}>
          <Icon name={iconName} size={15} />
        </span>
      </div>

      <p className="mt-4 text-base font-bold text-zinc-900 dark:text-zinc-50">{tier.name}</p>

      <div className="mt-4 grid grid-cols-2 gap-3 border-t border-zinc-100 pt-4 dark:border-zinc-800">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Max Drivers
          </p>
          <p className="font-bold text-zinc-900 dark:text-zinc-50">{tier.driverLimit || tier.maxDrivers || 'Unlimited'}</p>
        </div>
        <div className="overflow-hidden">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400 truncate">
            Monthly Price
          </p>
          <p className="font-bold text-zinc-900 dark:text-zinc-50 truncate">
            {typeof tier.price === 'number' ? `$${(tier.price / 100).toFixed(2)}` : 'N/A'}
            <span className="text-xs font-medium text-zinc-400 ml-1">{tier.currency ? tier.currency.toUpperCase() : 'USD'}</span>
          </p>
        </div>
      </div>

      {shouldEdit && <button
        type="button"
        onClick={onEdit}
        className={'mt-auto mt-6 w-full rounded-lg py-2.5 text-sm font-semibold transition ' + buttonTone}
      >
        {selected ? 'Editing…' : 'Edit Tier'}
      </button>}
    </div>
  )
}
