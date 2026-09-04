import type { ReactNode } from 'react'
import { TrendingDown, TrendingUp, Scale } from 'lucide-react'
import type { Totals } from '../../utils/aggregates'
import { formatRupiah } from '../../utils/format'
import { cn } from '../../lib/cn'

export function PeriodSummaryCards({
  totals,
  subtext
}: {
  totals: Totals
  /** Teks kecil opsional di bawah kartu tertentu (mis. rata-rata harian). */
  subtext?: { expense?: string }
}) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <MiniStat
        icon={<TrendingUp className="size-4" />}
        tone="bg-brand-50 text-brand-700"
        label="Masuk"
        value={formatRupiah(totals.income)}
        valueClass="text-brand-700"
      />
      <div className="relative">
        <MiniStat
          icon={<TrendingDown className="size-4" />}
          tone="bg-danger-50 text-danger-600"
          label="Keluar"
          value={formatRupiah(totals.expense)}
          valueClass="text-danger-600"
          title={subtext?.expense}
        />
      </div>
      <MiniStat
        icon={<Scale className="size-4" />}
        tone="bg-slate-100 text-slate-500"
        label="Selisih"
        value={
          (totals.net > 0 ? '+' : totals.net < 0 ? '-' : '') +
            formatRupiah(Math.abs(totals.net))
        }
        valueClass={cn(
          totals.net >= 0 ? 'text-slate-900' : 'text-danger-600'
        )}
      />
    </div>
  )
}

function MiniStat({
  icon,
  tone,
  label,
  value,
  valueClass,
  title
}: {
  icon: ReactNode
  tone: string
  label: string
  value: string
  valueClass: string
  title?: string
}) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm">
      <span
        className={cn(
          'grid size-7 place-items-center rounded-lg',
          tone
        )}
      >
        {icon}
      </span>
      <p className="mt-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
        {label}
      </p>
      <p
        className={cn(
          'truncate text-sm font-extrabold tabular-nums sm:text-base',
          valueClass
        )}
      >
        {value}
      </p>
      {title && (
        <p className="mt-0.5 truncate text-[10px] text-slate-400">{title}</p>
      )}
    </div>
  )
}
