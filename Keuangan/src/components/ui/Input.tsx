import type { InputHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string | null
}

export function Input({ label, error, className, id, ...rest }: Props) {
  const inputId = id ?? rest.name ?? label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <label className="block" htmlFor={inputId}>
      {label && (
        <span className="mb-1 block text-sm font-medium text-slate-700">
          {label}
        </span>
      )}
      <input
        id={inputId}
        className={cn(
          'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-base outline-none transition',
          'focus:border-brand-500 focus:ring-2 focus:ring-brand-100',
          error && 'border-danger-500',
          className
        )}
        {...rest}
      />
      {error && <span className="mt-1 block text-xs text-danger-600">{error}</span>}
    </label>
  )
}
