import { ArrowDownLeft, ArrowUpLeft } from 'lucide-react'
import type { Transaction } from '../../types/db'
import { formatSignedRupiah } from '../../utils/format'
import { cn } from '../../lib/cn'

export function TxRow({
  tx,
  categoryName,
  walletName,
  onClick
}: {
  tx: Transaction
  categoryName?: string
  walletName?: string
  onClick?: (tx: Transaction) => void
}) {
  const isIncome = tx.type === 'income'
  const Icon = isIncome ? ArrowUpLeft : ArrowDownLeft
  return (
    <button
      type="button"
      onClick={onClick ? () => onClick(tx) : undefined}
      className="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left transition hover:bg-slate-100"
    >
      <span
        className={cn(
          'grid size-9 shrink-0 place-items-center rounded-full',
          isIncome ? 'bg-brand-100 text-brand-700' : 'bg-danger-50 text-danger-600'
        )}
      >
        <Icon className="size-4" />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-slate-800">
          {categoryName ?? 'Tanpa kategori'}
        </span>
        <span className="flex min-w-0 items-center gap-1.5">
          {walletName && (
            <span className="max-w-24 shrink-0 truncate rounded-full bg-slate-100 px-1.5 py-px text-[10px] font-medium text-slate-500">
              {walletName}
            </span>
          )}
          {tx.note && (
            <span className="truncate text-xs text-slate-500">{tx.note}</span>
          )}
        </span>
      </span>

      <span
        className={cn(
          'shrink-0 text-sm font-bold tabular-nums',
          isIncome ? 'text-brand-600' : 'text-danger-600'
        )}
      >
        {formatSignedRupiah(Number(tx.amount), true)}
      </span>
    </button>
  )
}
