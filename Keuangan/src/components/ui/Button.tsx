import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/cn'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  block?: boolean
  children: ReactNode
}

const styles = {
  primary:
    'bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-700 disabled:bg-brand-300',
  secondary:
    'bg-white text-slate-800 border border-slate-200 hover:bg-slate-50 disabled:text-slate-400',
  danger:
    'bg-danger-600 text-white hover:brightness-110 disabled:opacity-60',
  ghost: 'bg-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
} as const

export function Button({
  variant = 'primary',
  block,
  className,
  children,
  ...rest
}: Props) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold transition',
        'disabled:cursor-not-allowed',
        styles[variant],
        block && 'w-full',
        className
      )}
      {...rest}
    >
      {children}
    </button>
  )
}
