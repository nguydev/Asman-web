import Icon from '../common/Icon.jsx'
import { Button } from './Button.jsx'

export function FilterCard({ children, onClear, hasActiveFilters }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="flex items-center gap-1.5 text-sm font-semibold text-zinc-500 dark:text-zinc-400">
        <Icon name="filter" size={24} />

      </span>

      <div className="flex flex-wrap items-center gap-2">
        {children}
      </div>

      {onClear && hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          className="!text-brand hover:underline hover:!bg-brand/10 dark:!text-brand-dark dark:hover:!bg-brand-dark/10"
          onClick={onClear}
        >
          Clear All
        </Button>
      )}
    </div>
  )
}
