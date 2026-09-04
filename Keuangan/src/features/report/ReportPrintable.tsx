import { useMemo, useState } from 'react'
import { Printer } from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Spinner } from '../../components/ui/Spinner'
import { Segmented } from '../../components/ui/Segmented'
import { useAuth } from '../auth/AuthContext'
import { useTransactions } from '../transactions/useTransactions'
import { categoryNameMap, useCategories } from '../categories/useCategories'
import { walletNameMap, useWallets } from '../wallets/useWallets'
import {
  expenseByCategory,
  newestFirst,
  sumTotals
} from '../../utils/aggregates'
import {
  formatDateTime,
  formatRupiah,
  formatShortDate,
  periodRange,
  periodTitle,
  shiftCursor,
  todayKey,
  type DayKey,
  type PeriodKind
} from '../../utils/format'
import { friendlyMessage } from '../../utils/errors'

const KIND_OPTIONS: Array<{ value: PeriodKind; label: string }> = [
  { value: 'day', label: 'Hari' },
  { value: 'week', label: 'Minggu' },
  { value: 'month', label: 'Bulan' }
]

/** Laporan siap cetak satu periode; tombol cetak memakai dialog bawaan
 * browser sehingga bisa "Save as PDF" di semua platform. */
export function ReportPrintable() {
  const { session } = useAuth()
  const [kind, setKind] = useState<PeriodKind>('month')
  const [cursor, setCursor] = useState<DayKey>(todayKey())
  const [walletFilter, setWalletFilter] = useState<'all' | string>('all')
  const range = periodRange(kind, cursor)
  const title = periodTitle(kind, range)

  const {
    data: txs,
    isPending,
    isError,
    error,
    refetch
  } = useTransactions(range.from, range.to)

  const { data: categories } = useCategories()
  const names = categoryNameMap(categories)
  const { data: wallets } = useWallets()
  const walletNames = walletNameMap(wallets)

  const list = useMemo(
    () =>
      (txs ?? []).filter(
        (t) => walletFilter === 'all' || t.wallet_id === walletFilter
      ),
    [txs, walletFilter]
  )
  const totals = useMemo(() => sumTotals(list), [list])
  const chronological = useMemo(() => [...list].sort((x, y) => newestFirst(y, x)), [list])
  const slices = useMemo(
    () =>
      expenseByCategory(list, (id) =>
        id ? (names.get(id) ?? 'Kategori terhapus') : 'Tanpa kategori'
      ),
    [list, names]
  )
  const countPerCategory = useMemo(() => {
    const m = new Map<string, number>()
    for (const t of list) {
      if (t.type !== 'expense') continue
      const key = t.category_id ? (names.get(t.category_id) ?? 'Kategori terhapus') : 'Tanpa kategori'
      m.set(key, (m.get(key) ?? 0) + 1)
    }
    return m
  }, [list, names])

  const printedAt = formatDateTime(new Date().toISOString())

  return (
    <div>
      {/* Kontrol (tidak ikut tercetak) */}
      <div className="no-print">
        <PageHeader title="Laporan" subtitle="Untuk dicetak atau disimpan sebagai PDF" />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex flex-1 items-center rounded-xl border border-slate-200 bg-white shadow-sm">
            <button
              onClick={() => setCursor((c) => shiftCursor(kind, c, -1))}
              aria-label="Periode sebelumnya"
              className="grid size-10 place-items-center text-slate-500 transition hover:text-brand-700"
            >
              <span className="text-lg leading-none">‹</span>
            </button>
            <span className="flex-1 truncate text-center text-sm font-bold">{title}</span>
            <button
              onClick={() => setCursor((c) => shiftCursor(kind, c, 1))}
              aria-label="Periode berikutnya"
              className="grid size-10 place-items-center text-slate-500 transition hover:text-brand-700"
            >
              <span className="text-lg leading-none">›</span>
            </button>
          </div>
          <button
            onClick={() => setCursor(todayKey())}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-600 shadow-sm transition hover:text-brand-700"
          >
            Periode berjalan
          </button>
        </div>

        <Segmented<PeriodKind>
          className="mt-3 w-full max-w-xs"
          options={KIND_OPTIONS}
          value={kind}
          onChange={(k) => setKind(k)}
        />

        {(wallets?.length ?? 0) > 1 && (
          <div className="mt-3 flex gap-2 overflow-x-auto pb-0.5">
            <button
              type="button"
              onClick={() => setWalletFilter('all')}
              className={
                'shrink-0 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition ' +
                (walletFilter === 'all'
                  ? 'border-brand-500 bg-brand-50 text-brand-800'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300')
              }
            >
              Semua dompet
            </button>
            {wallets!.map((w) => (
              <button
                key={w.id}
                type="button"
                onClick={() => setWalletFilter(w.id)}
                className={
                  'shrink-0 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition ' +
                  (walletFilter === w.id
                    ? 'border-brand-500 bg-brand-50 text-brand-800'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300')
                }
              >
                {w.name}
              </button>
            ))}
          </div>
        )}

        <div className="mt-4 flex items-center gap-3">
          <Button onClick={() => window.print()}>
            <Printer className="size-4" /> Cetak / Simpan PDF
          </Button>
          <p className="text-[11px] leading-tight text-slate-400">
            Di dialog cetak pilih tujuan
            <br className="sm:hidden" /> “Save as PDF” bila ingin file.
          </p>
        </div>
      </div>

      {/* Isi laporan (area cetak) */}
      <div className="print-sheet mt-4">
        <Card className="p-4 sm:p-6">
          {isPending ? (
            <div className="grid place-items-center py-16">
              <Spinner className="size-7" />
            </div>
          ) : isError ? (
            <div className="py-10 text-center">
              <p className="text-sm font-medium text-danger-600">
                {friendlyMessage(error)}
              </p>
              <Button variant="secondary" className="mt-3" onClick={() => void refetch()}>
                Coba lagi
              </Button>
            </div>
          ) : (
            <>
              <header className="mb-5 flex items-start justify-between gap-4 border-b-2 border-slate-800 pb-3">
                <div>
                  <h1 className="text-base font-extrabold text-slate-900 sm:text-lg">
                    Catatan Keuangan
                  </h1>
                  <p className="text-xs font-semibold text-slate-600">
                    Laporan {kind === 'day' ? 'Harian' : kind === 'week' ? 'Mingguan' : 'Bulanan'} — {title}
                  </p>
                </div>
                <div className="text-right text-[10px] leading-relaxed text-slate-500">
                  <p>Dicetak: {printedAt}</p>
                  <p className="max-w-[220px] truncate">{session?.user.email}</p>
                </div>
              </header>

              <section className="mb-6">
                <h2 className="mb-2 text-xs font-bold tracking-wider text-slate-500 uppercase">
                  Ringkasan
                </h2>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-100 text-left text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                      <th className="px-2 py-1.5">Pemasukan</th>
                      <th className="px-2 py-1.5">Pengeluaran</th>
                      <th className="px-2 py-1.5">Saldo Bersih</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="px-2 py-1.5 font-bold tabular-nums">{formatRupiah(totals.income)}</td>
                      <td className="px-2 py-1.5 font-bold tabular-nums">{formatRupiah(totals.expense)}</td>
                      <td className="px-2 py-1.5 font-bold tabular-nums">{formatRupiah(totals.net)}</td>
                    </tr>
                  </tbody>
                </table>
              </section>

              {slices.length > 0 && (
                <section className="mb-6">
                  <h2 className="mb-2 text-xs font-bold tracking-wider text-slate-500 uppercase">
                    Pengeluaran per Kategori
                  </h2>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-100 text-left text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                        <th className="px-2 py-1.5">Kategori</th>
                        <th className="px-2 py-1.5 text-center">Jumlah</th>
                        <th className="px-2 py-1.5 text-right">Total</th>
                        <th className="px-2 py-1.5 text-right">Porsi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {slices.map((s) => (
                        <tr key={s.name}>
                          <td className="px-2 py-1.5">{s.name}</td>
                          <td className="px-2 py-1.5 text-center tabular-nums">
                            {countPerCategory.get(s.name) ?? 0}×
                          </td>
                          <td className="px-2 py-1.5 text-right tabular-nums">{formatRupiah(s.total)}</td>
                          <td className="px-2 py-1.5 text-right tabular-nums">{s.sharePercent}%</td>
                        </tr>
                      ))}
                      <tr className="border-t-2 border-slate-800 font-bold">
                        <td className="px-2 py-1.5" colSpan={2}>
                          Total Pengeluaran
                        </td>
                        <td className="px-2 py-1.5 text-right tabular-nums">{formatRupiah(totals.expense)}</td>
                        <td className="px-2 py-1.5 text-right tabular-nums">100%</td>
                      </tr>
                    </tbody>
                  </table>
                </section>
              )}

              <section>
                <h2 className="mb-2 text-xs font-bold tracking-wider text-slate-500 uppercase">
                  Daftar Transaksi ({list.length})
                </h2>
                {chronological.length === 0 ? (
                  <p className="py-6 text-center text-sm text-slate-400">
                    Tidak ada transaksi pada periode ini.
                  </p>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-100 text-left text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                        <th className="px-2 py-1.5">Tanggal</th>
                        <th className="px-2 py-1.5">Kategori</th>
                        <th className="px-2 py-1.5">Sumber Dana</th>
                        <th className="px-2 py-1.5">Catatan</th>
                        <th className="px-2 py-1.5 text-right">Masuk</th>
                        <th className="px-2 py-1.5 text-right">Keluar</th>
                      </tr>
                    </thead>
                    <tbody>
                      {chronological.map((t) => (
                        <tr key={t.id}>
                          <td className="px-2 py-1.5 whitespace-nowrap tabular-nums">
                            {formatShortDate(t.occurred_on)}
                          </td>
                          <td className="px-2 py-1.5">
                            {t.category_id
                              ? (names.get(t.category_id) ?? 'Kategori terhapus')
                              : 'Tanpa kategori'}
                          </td>
                          <td className="px-2 py-1.5">
                            {walletNames.get(t.wallet_id) ?? '—'}
                          </td>
                          <td className="max-w-[200px] truncate px-2 py-1.5">{t.note ?? '—'}</td>
                          <td className="px-2 py-1.5 text-right tabular-nums">
                            {t.type === 'income' ? formatRupiah(Number(t.amount)) : ''}
                          </td>
                          <td className="px-2 py-1.5 text-right tabular-nums">
                            {t.type === 'expense' ? formatRupiah(Number(t.amount)) : ''}
                          </td>
                        </tr>
                      ))}
                      <tr className="border-t-2 border-slate-800 font-bold">
                        <td className="px-2 py-1.5" colSpan={4}>
                          TOTAL
                        </td>
                        <td className="px-2 py-1.5 text-right tabular-nums">{formatRupiah(totals.income)}</td>
                        <td className="px-2 py-1.5 text-right tabular-nums">{formatRupiah(totals.expense)}</td>
                      </tr>
                    </tbody>
                  </table>
                )}
              </section>

              <p className="mt-6 text-center text-[9px] text-slate-400">
                Dicetak dari Catatan Keuangan · {window.location.host}
              </p>
            </>
          )}
        </Card>
      </div>
    </div>
  )
}
