import { useState } from 'react'
import { Button } from './Button.jsx'

function normalizeOption(opt) {
  if (opt && typeof opt === 'object') {
    return {
      value: opt.value,
      label: opt.label ?? String(opt.value),
    }
  }
  return { value: opt, label: String(opt) }
}

export function FilterSelect({ label, value, options, onChange }) {
  const [open, setOpen] = useState(false)
  const normalized = (options || []).map(normalizeOption)
  const selected = normalized.find((opt) => opt.value === value)

  return (
    <div className="relative">
      <Button
        variant="outline"
        className="bg-white shadow-sm hover:bg-zinc-50 dark:bg-zinc-900 dark:hover:bg-zinc-800"
        rightIcon="chevronDown"
        onClick={() => setOpen(!open)}
      >
        {selected?.label || label}
      </Button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full z-20 mt-1 max-h-64 w-44 overflow-y-auto rounded-lg border border-zinc-200 bg-white shadow-xl dark:border-zinc-700 dark:bg-zinc-800">
            <button
              type="button"
              onClick={() => {
                onChange('')
                setOpen(false)
              }}
              className="w-full px-4 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-700"
            >
              All
            </button>
            {normalized.map((opt) => (
              <button
                type="button"
                key={opt.value}
                onClick={() => {
                  onChange(opt.value)
                  setOpen(false)
                }}
                className="w-full px-4 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-700"
              >
                {opt.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
