import type { Transaction } from '../types/db'
import { addDays, type DayKey, type PeriodRange } from './format'

export interface Totals {
  income: number
  expense: number
  /** income - expense */
  net: number
}

export function sumTotals(txs: Transaction[]): Totals {
  let income = 0
  let expense = 0
  for (const t of txs) {
    if (t.type === 'income') income += Number(t.amount)
    else expense += Number(t.amount)
  }
  return { income, expense, net: income - expense }
}

export interface CategorySlice {
  categoryId: string | null
  name: string
  total: number
  /** 0–100 dengan satu desimal */
  sharePercent: number
}

export function expenseByCategory(
  txs: Transaction[],
  categoryNameOf: (id: string | null) => string
): CategorySlice[] {
  const totals = new Map<string | null, number>()
  let grandTotal = 0
  for (const t of txs) {
    if (t.type !== 'expense') continue
    const amount = Number(t.amount)
    grandTotal += amount
    totals.set(t.category_id, (totals.get(t.category_id) ?? 0) + amount)
  }
  return [...totals.entries()]
    .map(([categoryId, total]) => ({
      categoryId,
      name: categoryNameOf(categoryId),
      total,
      sharePercent:
        grandTotal === 0 ? 0 : Math.round((total / grandTotal) * 1000) / 10
    }))
    .sort((a, b) => b.total - a.total)
}

export interface DailyBucket {
  day: DayKey
  label: string
  income: number
  expense: number
}

/** Urutan bar grafik dari `range.from` sampai `range.to` (inklusif),
 * hari tanpa transaksi tetap muncul bernilai 0. */
export function dailyBuckets(txs: Transaction[], range: PeriodRange): DailyBucket[] {
  const byDay = new Map<DayKey, DailyBucket>()
  for (const t of txs) {
    let b = byDay.get(t.occurred_on)
    if (!b) {
      b = { day: t.occurred_on, label: '', income: 0, expense: 0 }
      byDay.set(t.occurred_on, b)
    }
    if (t.type === 'income') b.income += Number(t.amount)
    else b.expense += Number(t.amount)
  }

  const buckets: DailyBucket[] = []
  let cursor = range.from
  while (cursor <= range.to) {
    // Perbandingan string 'YYYY-MM-DD' ekuivalen urutan kronologis.
    buckets.push(byDay.get(cursor) ?? { day: cursor, label: '', income: 0, expense: 0 })
    cursor = addDays(cursor, 1)
  }
  return buckets
}

/** Rata-rata pengeluaran per hari selama `days` pertama data pada rentang
 * (dipakai sebagai "rata-rata/hari bulan ini" di tab Hari). */
export function averageDailyExpense(
  txs: Transaction[],
  range: PeriodRange
): number {
  const { expense } = sumTotals(txs)
  const daysElapsed =
    Math.round(
      (new Date(range.to).getTime() - new Date(range.from).getTime()) /
        86_400_000
    ) + 1
  return daysElapsed > 0 ? expense / daysElapsed : 0
}

export function biggestExpense(txs: Transaction[]): Transaction | null {
  let best: Transaction | null = null
  for (const t of txs) {
    if (t.type !== 'expense') continue
    if (!best || Number(t.amount) > Number(best.amount)) best = t
  }
  return best
}

/** Urut terbaru dulu; hasil konsisten walau tanggal/waktu identik. */
export function newestFirst(a: Transaction, b: Transaction): number {
  if (a.occurred_on !== b.occurred_on) {
    return a.occurred_on < b.occurred_on ? 1 : -1
  }
  if (a.created_at !== b.created_at) {
    return a.created_at < b.created_at ? 1 : -1
  }
  return 0
}

export interface CategoryDeltaRow {
  name: string
  /** Total pengeluaran periode A */
  a: number
  /** Total pengeluaran periode B */
  b: number
  /** a - b (positif = periode A lebih boros) */
  delta: number
}

/** Gabungkan breakdown kategori dua periode menjadi baris selisih,
 * urut dari selisih absolut terbesar. Kategori yang hanya ada di satu
 * sisi tetap muncul dengan sisi lain bernilai 0. */
export function diffByCategory(
  slicesA: CategorySlice[],
  slicesB: CategorySlice[]
): CategoryDeltaRow[] {
  const rows = new Map<string, CategoryDeltaRow>()
  for (const s of slicesA) {
    rows.set(s.name, { name: s.name, a: s.total, b: 0, delta: s.total })
  }
  for (const s of slicesB) {
    const row = rows.get(s.name)
    if (row) {
      row.b = s.total
      row.delta = row.a - s.total
    } else {
      rows.set(s.name, { name: s.name, a: 0, b: s.total, delta: -s.total })
    }
  }
  return [...rows.values()].sort(
    (x, y) =>
      Math.abs(y.delta) - Math.abs(x.delta) || y.a + y.b - (x.a + x.b)
  )
}
