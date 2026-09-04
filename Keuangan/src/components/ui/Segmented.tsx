import { cn } from '../../lib/cn'

interface Option<T extends string> {
  value: T
  label: string
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  className
}: {
  options: Option<T>[]
  value: T
  onChange: (v: T) => void
  className?: string
}) {
  return (
    <div
      role="tablist"
      className={cn(
        'grid grid-flow-col rounded-xl bg-slate-200/70 p-1 text-sm font-medium',
        className
      )}
    >
      {options.map((o) => {
        const active = o.value === value
        return (
          <button
            key={o.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.value)}
            className={cn(
              'rounded-lg px-3 py-1.5 transition',
              active
                ? 'bg-white text-brand-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            )}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}
