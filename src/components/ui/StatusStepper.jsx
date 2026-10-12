import Icon from '../common/Icon.jsx'

const STAGES = ['filed', 'pending', 'decision']
const STAGE_LABELS = { filed: 'Filed', pending: 'Pending', decision: 'Decision' }

export function StatusStepper({ stage, onChange }) {
  const activeIndex = STAGES.indexOf(stage)
  return (
    <div className="flex items-center rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800/50">
      {STAGES.map((s, i) => (
        <div key={s} className="flex flex-1 items-center last:flex-none">
          <button
            type="button"
            onClick={() => onChange(s)}
            className="flex flex-col items-center gap-1.5 focus:outline-none"
          >
            <span
              className={
                'grid h-6 w-6 place-items-center rounded-full border-2 text-xs transition-colors ' +
                (i < activeIndex
                  ? 'border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900'
                  : i === activeIndex
                    ? 'border-zinc-900 bg-white text-zinc-900 dark:border-zinc-100 dark:bg-zinc-900 dark:text-zinc-100'
                    : 'border-zinc-300 bg-white text-zinc-300 dark:border-zinc-600 dark:bg-zinc-900')
              }
            >
              {i < activeIndex && <Icon name="check" size={12} />}
              {i === activeIndex && <span className="h-2 w-2 rounded-full bg-zinc-900 dark:bg-zinc-100" />}
            </span>
            <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
              {STAGE_LABELS[s]}
            </span>
          </button>
          {i < STAGES.length - 1 && (
            <span
              className={
                'mx-2 h-px flex-1 transition-colors ' +
                (i < activeIndex ? 'bg-zinc-900 dark:bg-zinc-100' : 'bg-zinc-300 dark:bg-zinc-600')
              }
            />
          )}
        </div>
      ))}
    </div>
  )
}
