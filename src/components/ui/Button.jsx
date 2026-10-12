import Icon from '../common/Icon.jsx'

const VARIANTS = {
  primary: 'bg-brand/10 border border-brand/50 text-brand shadow-[0_0_10px_rgba(0,229,255,0.2)] hover:bg-brand/20 hover:shadow-[0_0_15px_rgba(0,229,255,0.4)] glow-text',
  secondary: 'bg-zinc-800/80 border border-zinc-700/50 text-zinc-100 backdrop-blur-md hover:bg-zinc-700/80 hover:border-zinc-600',
  outline: 'border border-zinc-700 text-zinc-300 hover:border-brand/50 hover:text-brand hover:bg-brand/5',
  ghost: 'text-zinc-400 hover:text-white hover:bg-white/5',
  danger: 'bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 hover:shadow-[0_0_15px_rgba(239,68,68,0.3)]',
}

const SIZES = {
  sm: 'px-3 py-1.5 text-xs font-semibold rounded-lg',
  md: 'px-4 py-2.5 text-sm font-semibold rounded-lg',
  lg: 'px-6 py-3 text-base font-bold rounded-xl',
  icon: 'grid h-9 w-9 place-items-center rounded-lg', // for icon-only buttons
}

export function Button({
  children,
  variant = 'secondary',
  size = 'md',
  icon,
  rightIcon,
  isLoading,
  className = '',
  disabled,
  ...props
}) {
  const baseClasses = 'inline-flex items-center justify-center gap-2 transition-all duration-200 outline-none focus:ring-2 focus:ring-brand/50 disabled:opacity-50 disabled:pointer-events-none'
  const variantClasses = VARIANTS[variant]
  const sizeClasses = SIZES[size]

  return (
    <button
      className={`${baseClasses} ${variantClasses} ${sizeClasses} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        icon && <Icon name={icon} size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />
      )}

      {children && <span>{children}</span>}

      {!isLoading && rightIcon && (
        <Icon name={rightIcon} size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />
      )}
    </button>
  )
}
