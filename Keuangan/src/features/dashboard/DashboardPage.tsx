import { Suspense, lazy, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ChevronLeft, ChevronRight, CirclePlus, Wallet } from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader'
import { Segmented } from '../../components/ui/Segmented'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Spinner } from '../../components/ui/Spinner'
import { EmptyState } from '../../components/ui/EmptyState'
import { TxRow } from '../transactions/TxRow'
import { PeriodSummaryCards } from './PeriodSummaryCards'
import { useTxSheetActions } from '../layout/app-contexts'
import { useTransactions } from '../transactions/useTransactions'
import { categoryNameMap, useCategories } from '../categories/useCategories'
import {
  averageDailyExpense,
  biggestExpense,
  dailyBuckets,
  expenseByCategory,
  newestFirst,
  sumTotals,
  type DailyBucket
} from '../../utils/aggregates'
import type { DayKey, PeriodKind } from '../../utils/format'
import {
  formatRupiah,
  formatWeekdayShort,
  parseKey,
  periodRange,
  periodTitle,
  shiftCursor,
  todayKey
} from '../../utils/format'
import { friendlyMessage } from '../../utils/errors'

const LazyTrendChart = lazy(() => import('./TrendChart'))
const LazyCategoryBreakdown = lazy(() => import('./CategoryBreakdown'))

const PERIOD_OPTIONS: Array<{ value: PeriodKind; label: string }> = [
  { value: 'day', label: 'Hari' },
  { value: 'week', label: 'Minggu' },
  { value: 'month', label: 'Bulan' }
]

export function DashboardPage() {
  const [kind, setKind] = useState<PeriodKind>('day')
  // Kursor disimpan per jenis agar kembali ke tab lain tidak lompat periode.
  const [cursors, setCursors] = useState<Record<PeriodKind, DayKey>>({
    day: todayKey(),
    week: todayKey(),
    month: todayKey()
  })

  const { openNew, openEdit } = useTxSheetActions()
  const cursor = cursors[kind]
  const range = useMemo(() => periodRange(kind, cursor), [kind, cursor])

  const {
    data: txs,
    isPending,
    isError,
    error,
    refetch
  } = useTransactions(range.from, range.to)

  const { data: categories } = useCategories()
  const names = categoryNameMap(categories)

  // Konteks tambahan pada tab Hari: rata-rata pengeluaran/hari bulan ini
  // (pembagi dibatasi sampai hari ini agar angka tidak menipis).
  const monthOfSelectedDay = periodRange('month', cursors.day)
  const avgContextRange = useMemo(() => {
    const today = todayKey()
    if (
      today >= monthOfSelectedDay.from &&
      today <= monthOfSelectedDay.to
    ) {
      return { from: monthOfSelectedDay.from, to: today }
    }
    return monthOfSelectedDay
  }, [monthOfSelectedDay])
  const { data: monthTxs } = useTransactions(
    kind === 'day' ? avgContextRange.from : undefined,
    kind === 'day' ? avgContextRange.to : undefined
  )

  const list = txs ?? []
  const totals = useMemo(() => sumTotals(list), [list])
  const buckets = useMemo<DailyBucket[]>(
    () =>
      dailyBuckets(list, range).map((b) => ({
        ...b,
        label: isCompact(range) ? String(parseKey(b.day).getDate()) : formatWeekdayShort(b.day)
      })),
    [list, range]
  )
  const slices = useMemo(
    () =>
      expenseByCategory(list, (id) =>
        id ? (names.get(id) ?? 'Kategori terhapus') : 'Tanpa kategori'
      ),
    [list, names]
  )
  const biggest = useMemo(() => biggestExpense(list), [list])

  const todayRange = periodRange(kind, todayKey())
  const isOnCurrentPeriod = todayRange.from === range.from

  return (
    <main className="mx-auto max-w-3xl px-4 pt-6 pb-28 md:pb-12">
      <PageHeader
        title="Ringkasan"
        subtitle={periodTitle(kind, range)}
      />

      <Segmented<PeriodKind>
        options={PERIOD_OPTIONS}
        value={kind}
        onChange={setKind}
        className="w-full"
      />

      <div className="mt-3 flex items-center gap-2">
        <div className="flex flex-1 items-center rounded-xl border border-slate-200 bg-white shadow-sm">
          <button
            onClick={() => moveCursor(-1)}
            aria-label="Periode sebelumnya"
            className="grid size-10 place-items-center text-slate-500 transition hover:text-brand-700"
          >
            <ChevronLeft className="size-5" />
          </button>
          <span className="flex-1 truncate text-center text-sm font-bold">
            {periodTitle(kind, range)}
          </span>
          <button
            onClick={() => moveCursor(1)}
            aria-label="Periode berikutnya"
            className="grid size-10 place-items-center text-slate-500 transition hover:text-brand-700"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>
        {!isOnCurrentPeriod && (
          <button
            onClick={() =>
              setCursors((c) => ({ ...c, [kind]: todayKey() }))
            }
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-600 shadow-sm transition hover:text-brand-700"
          >
            {kind === 'day' ? 'Hari ini' : kind === 'week' ? 'Pekan ini' : 'Bulan ini'}
          </button>
        )}
      </div>

      {isPending ? (
        <div className="grid place-items-center py-24">
          <Spinner className="size-7" />
        </div>
      ) : isError ? (
        <Card className="mt-4 text-center">
          <p className="text-sm font-medium text-danger-600">
            {friendlyMessage(error)}
          </p>
          <Button variant="secondary" className="mt-3" onClick={() => void refetch()}>
            Coba lagi
          </Button>
        </Card>
      ) : list.length === 0 ? (
        <EmptyState
          icon={<Wallet className="size-6" />}
          title={`Belum ada catatan pada ${periodTitle(kind, range).toLowerCase()}`}
          description="Pindah periode lewat panah ‹ › atau mulai catat transaksi baru."
          action={
            <button
              onClick={openNew}
              className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
            >
              <CirclePlus className="size-4" /> Catat transaksi
            </button>
          }
        />
      ) : (
        <>
          <div className="mt-4">
            <PeriodSummaryCards
              totals={totals}
              subtext={
                kind === 'day' && monthTxs
                  ? {
                      expense: `Rata-rata/hari bulan ini: ${formatRupiah(averageDailyExpense(monthTxs, avgContextRange))}`
                    }
                  : undefined
              }
            />
          </div>

          {biggest && (
            <p className="mt-2 truncate px-1 text-xs text-slate-500">
              Pengeluaran terbesar:{' '}
              <span className="font-bold text-danger-600 tabular-nums">
                -{formatRupiah(Number(biggest.amount))}
              </span>{' '}
              · {biggest.category_id ? (names.get(biggest.category_id) ?? 'Kategori terhapus') : 'Tanpa kategori'}
              {biggest.note ? ` (${biggest.note})` : ''}
            </p>
          )}

          {kind !== 'day' && (
            <Card className="mt-4">
              <h2 className="mb-2 text-xs font-bold tracking-wider text-slate-400 uppercase">
                Pemasukan vs Pengeluaran
              </h2>
              <Suspense fallback={<div className="h-[200px]" aria-hidden />}>
                <LazyTrendChart buckets={buckets} />
              </Suspense>
            </Card>
          )}

          <Card className="mt-4">
            <h2 className="mb-3 text-xs font-bold tracking-wider text-slate-400 uppercase">
              Pengeluaran per Kategori
            </h2>
            <Suspense fallback={<Spinner className="mx-auto my-8 block" />}>
              <LazyCategoryBreakdown
                slices={slices}
                totalExpense={totals.expense}
              />
            </Suspense>
          </Card>

          <section className="mt-6">
            <div className="mb-2 flex items-baseline justify-between px-1">
              <h2 className="text-sm font-bold text-slate-800">Transaksi terbaru</h2>
              <Link
                to="/transaksi"
                className="inline-flex items-center gap-0.5 text-xs font-semibold text-brand-700 hover:underline"
              >
                Lihat semua <ArrowRight className="size-3.5" />
              </Link>
            </div>
            <Card className="divide-y divide-slate-100 p-1!">
              {[...list]
                .sort(newestFirst)
                .slice(0, 12)
                .map((tx) => (
                  <TxRow
                    key={tx.id}
                    tx={tx}
                    categoryName={
                      tx.category_id
                        ? (names.get(tx.category_id) ?? 'Kategori terhapus')
                        : undefined
                    }
                    onClick={openEdit}
                  />
                ))}
            </Card>
          </section>
        </>
      )}
    </main>
  )

  function moveCursor(delta: number) {
    setCursors((c) => ({ ...c, [kind]: shiftCursor(kind, c[kind], delta) }))
  }
}

/** Bulan punya 28–31 hari -> tampilkan angka tanggal saja; pekan pendek
 * cukup dengan nama hari agar mudah dibaca. */
function isCompact(range: { from: string; to: string }): boolean {
  const days =
    Math.round(
      (parseKey(range.to).getTime() - parseKey(range.from).getTime()) /
        86_400_000
    ) + 1
  return days > 10
}
