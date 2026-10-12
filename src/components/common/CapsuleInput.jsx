import { useState } from 'react'
import Icon from './Icon.jsx'

export default function CapsuleInput({ value = [], onChange, placeholder, className }) {
  const [inputValue, setInputValue] = useState('')

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const newItems = inputValue.split(',').map(s => s.trim()).filter(Boolean)
      const uniqueItems = newItems.filter(item => !value.includes(item))
      if (uniqueItems.length > 0) {
        onChange([...value, ...uniqueItems])
      }
      setInputValue('')
    } else if (e.key === 'Backspace' && inputValue === '' && value.length > 0) {
      onChange(value.slice(0, -1))
    }
  }

  const handleRemove = (itemToRemove) => {
    onChange(value.filter(item => item !== itemToRemove))
  }

  return (
    <div className={`flex flex-wrap items-center gap-1.5 rounded-lg border border-zinc-200 bg-zinc-50 p-1.5 text-sm outline-none focus-within:border-brand focus-within:bg-white focus-within:ring-2 focus-within:ring-brand/30 dark:border-zinc-700 dark:bg-zinc-800 dark:focus-within:bg-zinc-900 ${className || ''}`}>
      {value.map((item, index) => (
        <span
          key={index}
          className="flex items-center gap-1 rounded-md bg-zinc-200/70 px-2 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-700/50 dark:text-zinc-200"
        >
          {item}
          <button
            type="button"
            onClick={() => handleRemove(item)}
            className="grid place-items-center text-zinc-500 hover:text-red-500 dark:text-zinc-400 dark:hover:text-red-400"
          >
            <Icon name="close" size={14} />
          </button>
        </span>
      ))}
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={value.length === 0 ? placeholder : ''}
        className="min-w-[120px] flex-1 bg-transparent px-1 py-0.5 text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-zinc-50"
      />
    </div>
  )
}
