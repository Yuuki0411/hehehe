import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ChevronLeft,
  ChevronRight,
  CirclePlus,
  Tags,
  Upload,
  Wallet
} from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader'
import { Segmented } from '../../components/ui/Segmented'
import { Spinner } from '../../components/ui/Spinner'
import { EmptyState } from '../../components/ui/EmptyState'
import { Card } from '../../components/ui/Card'
import { TxRow } from './TxRow'
import { useTransactions } from './useTransactions'
import { categoryNameMap, useCategories } from '../categories/useCategories'
import { walletNameMap, useWallets } from '../wallets/useWallets'
import { useTxSheetActions } from '../layout/app-contexts'
import { ImportDigemsModal } from '../import/ImportDigemsModal'
import { cn } from '../../lib/cn'
import type { DayKey, PeriodKind } from '../../utils/format'
import {
  formatRupiah,
  parseKey,
  periodRange,
  periodTitle,
  shiftCursor,
  todayKey
} from '../../utils/format'
import type { Transaction, TxType } from '../../types/db'
import { sumTotals } from '../../utils/aggregates'

type FilterKind = 'all' | TxType

const PERIOD: PeriodKind = 'month'

export function TransactionsPage() {
  const [cursor, setCursor] = useState<DayKey>(todayKey())
  const [filter, setFilter] = useState<FilterKind>('all')
  const [walletFilter, setWalletFilter] = useState<'all' | string>('all')
  const [importOpen, setImportOpen] = useState(false)
  const { openNew, openEdit } = useTxSheetActions()

  const range = periodRange(PERIOD, cursor)
  const { data, isPending } = useTransactions(range.from, range.to)
  const { data: categories } = useCategories()
  const names = categoryNameMap(categories)
  const { data: wallets } = useWallets()
  const walletNames = walletNameMap(wallets)

  const filtered = useMemo(
    () =>
      (data ?? []).filter(
        (t) =>
          (filter === 'all' || t.type === filter) &&
          (walletFilter === 'all' || t.wallet_id === walletFilter)
      ),
    [data, filter, walletFilter]
  )
  const grouped = useMemo(() => groupByDay(filtered), [filtered])
  const totals = useMemo(() => sumTotals(filtered), [filtered])

  return (
    <main className="mx-auto max-w-3xl px-4 pt-6 pb-28 md:pb-12">
      <PageHeader
        title="Transaksi"
        subtitle={periodTitle(PERIOD, range)}
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setImportOpen(true)}
              aria-label="Impor CSV Digems"
              title="Impor pemasukan dari CSV Digems"
              className="grid size-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:text-brand-700"
            >
              <Upload className="size-5" />
            </button>
            <Link
              to="/kategori"
              aria-label="Kelola kategori"
              title="Kelola kategori"
              className="grid size-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:text-brand-700"
            >
              <Tags className="size-5" />
            </Link>
          </div>
        }
      />

      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <div className="flex flex-1 items-center rounded-xl border border-slate-200 bg-white shadow-sm">
            <button
              onClick={() => setCursor((c) => shiftCursor(PERIOD, c, -1))}
              aria-label="Bulan sebelumnya"
              className="grid size-10 place-items-center text-slate-500 transition hover:text-brand-700"
            >
              <ChevronLeft className="size-5" />
            </button>
            <span className="flex-1 truncate text-center text-sm font-bold">
              {periodTitle(PERIOD, range)}
            </span>
            <button
              onClick={() => setCursor((c) => shiftCursor(PERIOD, c, 1))}
              aria-label="Bulan berikutnya"
              className="grid size-10 place-items-center text-slate-500 transition hover:text-brand-700"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>
          <button
            onClick={() => setCursor(todayKey())}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-600 shadow-sm transition hover:text-brand-700"
          >
            Hari ini
          </button>
        </div>

        <Segmented<FilterKind>
          className="w-full max-w-xs"
          options={[
            { value: 'all', label: 'Semua' },
            { value: 'expense', label: 'Keluar' },
            { value: 'income', label: 'Masuk' }
          ]}
          value={filter}
          onChange={setFilter}
        />

        {(wallets?.length ?? 0) > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-0.5">
            <button
              type="button"
              onClick={() => setWalletFilter('all')}
              className={cn(
                'shrink-0 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition',
                walletFilter === 'all'
                  ? 'border-brand-500 bg-brand-50 text-brand-800'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
              )}
            >
              Semua dompet
            </button>
            {wallets!.map((w) => (
              <button
                key={w.id}
                type="button"
                onClick={() => setWalletFilter(w.id)}
                className={cn(
                  'shrink-0 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition',
                  walletFilter === w.id
                    ? 'border-brand-500 bg-brand-50 text-brand-800'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                )}
              >
                {w.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <Card className="mt-4 grid grid-cols-3 divide-x divide-slate-100 p-0!">
        <StatBlock label="Pemasukan" value={totals.income} tone="text-brand-600" />
        <StatBlock label="Pengeluaran" value={totals.expense} tone="text-danger-600" />
        <StatBlock
          label="Selisih"
          value={totals.net}
          tone={totals.net >= 0 ? 'text-slate-900' : 'text-danger-600'}
          signed
        />
      </Card>

      <ImportDigemsModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
      />

      {isPending ? (
        <div className="grid place-items-center py-20">
          <Spinner className="size-7" />
        </div>
      ) : (data ?? []).length === 0 ? (
        <EmptyState
          icon={<Wallet className="size-6" />}
          title="Belum ada catatan bulan ini"
          description="Rekap akan muncul otomatis begitu Anda mencatat pemasukan atau pengeluaran."
          action={
            <button
              onClick={openNew}
              className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
            >
              <CirclePlus className="size-4" /> Catat transaksi
            </button>
          }
        />
      ) : filtered.length === 0 ? (
        <p className="py-10 text-center text-sm text-slate-500">
          Tidak ada transaksi sesuai filter ini di bulan yang dipilih.
        </p>
      ) : (
        <div className="mt-2 space-y-4">
          {grouped.map(([day, txs]) => {
            const dayTotals = sumTotals(txs)
            return (
              <section key={day}>
                <div className="flex items-baseline justify-between px-2 pb-1.5">
                  <h3 className="text-xs font-bold tracking-wide text-slate-500 uppercase">
                    {formatDayHeading(day)}
                  </h3>
                  <span className="text-[11px] font-medium tabular-nums text-slate-400">
                    {daySumLabel(dayTotals)}
                  </span>
                </div>
                <Card className="divide-y divide-slate-100 p-1!">
                  {txs.map((tx) => (
                    <TxRow
                      key={tx.id}
                      tx={tx}
                      categoryName={
                        tx.category_id ? names.get(tx.category_id) : undefined
                      }
                      walletName={walletNames.get(tx.wallet_id)}
                      onClick={openEdit}
                    />
                  ))}
                </Card>
              </section>
            )
          })}
        </div>
      )}
    </main>
  )
}

function StatBlock({
  label,
  value,
  tone,
  signed
}: {
  label: string
  value: number
  tone: string
  signed?: boolean
}) {
  return (
    <div className="px-2 py-3">
      <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
        {label}
      </p>
      <p
        className={cn(
          'mt-0.5 truncate text-sm font-extrabold tabular-nums',
          tone
        )}
      >
        {statValue(value, signed)}
      </p>
    </div>
  )
}

function statValue(value: number, signed?: boolean): string {
  if (signed && value > 0) return '+' + formatRupiah(value)
  if (value < 0) return '-' + formatRupiah(Math.abs(value))
  return formatRupiah(value)
}

function daySumLabel(totals: { income: number; expense: number }): string {
  const parts: string[] = []
  if (totals.income > 0) parts.push('+' + formatRupiah(totals.income))
  if (totals.expense > 0) parts.push('-' + formatRupiah(totals.expense))
  return parts.join(' · ') || '—'
}

function formatDayHeading(day: DayKey): string {
  if (day === todayKey()) return 'Hari ini'
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'short'
  }).format(parseKey(day))
}

function groupByDay(txs: Transaction[]): Array<[DayKey, Transaction[]]> {
  const map = new Map<DayKey, Transaction[]>()
  for (const tx of txs) {
    const arr = map.get(tx.occurred_on)
    if (arr) arr.push(tx)
    else map.set(tx.occurred_on, [tx])
  }
  return [...map.entries()]
}
