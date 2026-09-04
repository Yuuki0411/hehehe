import { useContext, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { ArrowLeftRight, ChevronLeft, ChevronRight, StickyNote, Trash2 } from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Spinner } from '../../components/ui/Spinner'
import { EmptyState } from '../../components/ui/EmptyState'
import { Segmented } from '../../components/ui/Segmented'
import { ToastContext } from '../layout/app-contexts'
import { useAuth } from '../auth/AuthContext'
import { useTransactions } from '../transactions/useTransactions'
import { categoryNameMap, useCategories } from '../categories/useCategories'
import {
  diffByCategory,
  expenseByCategory,
  sumTotals
} from '../../utils/aggregates'
import {
  formatDateTime,
  formatRupiah,
  periodRange,
  periodTitle,
  shiftCursor,
  todayKey,
  type DayKey,
  type PeriodKind
} from '../../utils/format'
import { friendlyMessage } from '../../utils/errors'
import {
  notesForPair,
  useAddComparisonNote,
  useComparisonNotes,
  useDeleteComparisonNote
} from './useComparisonNotes'
import { cn } from '../../lib/cn'

interface Picker {
  kind: PeriodKind
  cursor: DayKey
}

export function ComparePage() {
  const { session } = useAuth()
  const today = todayKey()

  // Default langsung berguna: bulan ini vs bulan lalu.
  const [a, setA] = useState<Picker>({ kind: 'month', cursor: today })
  const [b, setB] = useState<Picker>({
    kind: 'month',
    cursor: shiftCursor('month', today, -1)
  })

  const rangeA = periodRange(a.kind, a.cursor)
  const rangeB = periodRange(b.kind, b.cursor)

  const {
    data: txsA,
    isPending: pendingA,
    isError: errA,
    error: errorA,
    refetch: refetchA
  } = useTransactions(rangeA.from, rangeA.to)
  const {
    data: txsB,
    isPending: pendingB,
    isError: errB,
    error: errorB,
    refetch: refetchB
  } = useTransactions(rangeB.from, rangeB.to)

  const { data: categories } = useCategories()
  const names = categoryNameMap(categories)

  const totalsA = useMemo(() => sumTotals(txsA ?? []), [txsA])
  const totalsB = useMemo(() => sumTotals(txsB ?? []), [txsB])
  const slicesA = useMemo(
    () =>
      expenseByCategory(txsA ?? [], (id) =>
        id ? (names.get(id) ?? 'Kategori terhapus') : 'Tanpa kategori'
      ),
    [txsA, names]
  )
  const slicesB = useMemo(
    () =>
      expenseByCategory(txsB ?? [], (id) =>
        id ? (names.get(id) ?? 'Kategori terhapus') : 'Tanpa kategori'
      ),
    [txsB, names]
  )
  const deltaRows = useMemo(() => diffByCategory(slicesA, slicesB), [slicesA, slicesB])

  const titleA = periodTitle(a.kind, rangeA)
  const titleB = periodTitle(b.kind, rangeB)

  return (
    <div>
      <PageHeader
        title="Bandingkan Periode"
        subtitle="Selisih = Periode A − Periode B"
        actions={<ArrowLeftRight className="hidden size-5 text-slate-300 sm:block" />}
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <PeriodPicker
          chip="A"
          chipClass="bg-brand-600"
          picker={a}
          title={titleA}
          onChange={setA}
        />
        <PeriodPicker
          chip="B"
          chipClass="bg-slate-500"
          picker={b}
          title={titleB}
          onChange={setB}
        />
      </div>

      {pendingA || pendingB ? (
        <div className="grid place-items-center py-16">
          <Spinner className="size-7" />
        </div>
      ) : errA || errB ? (
        <Card className="mt-4 text-center">
          <p className="text-sm font-medium text-danger-600">
            {friendlyMessage((errorA ?? errorB) as Error)}
          </p>
          <Button
            variant="secondary"
            className="mt-3"
            onClick={() => {
              void refetchA()
              void refetchB()
            }}
          >
            Coba lagi
          </Button>
        </Card>
      ) : (
        <>
          {/* Tabel ringkasan selisih */}
          <Card className="mt-4 overflow-x-auto p-0!">
            <table className="w-full min-w-[520px] text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                  <th className="px-3 py-2.5">Keterangan</th>
                  <th className="px-3 py-2.5 text-right">{titleA}</th>
                  <th className="px-3 py-2.5 text-right">{titleB}</th>
                  <th className="px-3 py-2.5 text-right">Selisih (A−B)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <DeltaRow label="Pemasukan" a={totalsA.income} b={totalsB.income} />
                <DeltaRow label="Pengeluaran" a={totalsA.expense} b={totalsB.expense} highlight />
                <DeltaRow
                  label="Saldo Bersih"
                  a={totalsA.net}
                  b={totalsB.net}
                  bold
                />
              </tbody>
            </table>
          </Card>
          <p className="mt-1.5 px-1 text-[11px] text-slate-400">
            Merah = nilainya lebih besar di Periode A; hijau = lebih besar di Periode B.
          </p>

          {/* Selisih per kategori */}
          <Card className="mt-4 overflow-x-auto p-0!">
            <p className="border-b border-slate-200 bg-slate-50 px-3 py-2.5 text-[11px] font-bold tracking-wider text-slate-500 uppercase">
              Pengeluaran per Kategori
            </p>
            {deltaRows.length === 0 ? (
              <p className="px-3 py-6 text-center text-sm text-slate-400">
                Belum ada pengeluaran di kedua periode.
              </p>
            ) : (
              <table className="w-full min-w-[520px] text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                    <th className="px-3 py-2.5">Kategori</th>
                    <th className="px-3 py-2.5 text-right">A</th>
                    <th className="px-3 py-2.5 text-right">B</th>
                    <th className="px-3 py-2.5 text-right">Selisih</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {deltaRows.map((row) => (
                    <DeltaRow key={row.name} label={row.name} a={row.a} b={row.b} />
                  ))}
                </tbody>
              </table>
            )}
          </Card>

          <MemoSection
            kind={a.kind}
            aFrom={rangeA.from}
            aTo={rangeA.to}
            bFrom={rangeB.from}
            bTo={rangeB.to}
            titleA={titleA}
            titleB={titleB}
            userId={session?.user.id ?? null}
          />
        </>
      )}
    </div>
  )
}

// ------------------------------- Sub-bagian -------------------------------

function PeriodPicker({
  chip,
  chipClass,
  picker,
  title,
  onChange
}: {
  chip: string
  chipClass: string
  picker: Picker
  title: string
  onChange: (p: Picker) => void
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="mb-2 flex items-center gap-2">
        <span
          className={cn(
            'grid size-6 place-items-center rounded-md text-[11px] font-extrabold text-white',
            chipClass
          )}
        >
          {chip}
        </span>
        <Segmented<PeriodKind>
          className="flex-1"
          options={[
            { value: 'day', label: 'Hari' },
            { value: 'week', label: 'Minggu' },
            { value: 'month', label: 'Bulan' }
          ]}
          value={picker.kind}
          onChange={(kind) => onChange({ kind, cursor: picker.cursor })}
        />
      </div>
      <div className="flex items-center">
        <button
          onClick={() =>
            onChange({
              ...picker,
              cursor: shiftCursor(picker.kind, picker.cursor, -1)
            })
          }
          aria-label="Periode sebelumnya"
          className="grid size-9 place-items-center text-slate-500 transition hover:text-brand-700"
        >
          <ChevronLeft className="size-5" />
        </button>
        <span className="flex-1 truncate text-center text-xs font-bold">{title}</span>
        <button
          onClick={() =>
            onChange({
              ...picker,
              cursor: shiftCursor(picker.kind, picker.cursor, 1)
            })
          }
          aria-label="Periode berikutnya"
          className="grid size-9 place-items-center text-slate-500 transition hover:text-brand-700"
        >
          <ChevronRight className="size-5" />
        </button>
      </div>
    </div>
  )
}

function DeltaRow({
  label,
  a,
  b,
  highlight,
  bold
}: {
  label: string
  a: number
  b: number
  highlight?: boolean
  bold?: boolean
}) {
  const delta = a - b
  return (
    <tr className={cn(bold && 'bg-slate-50/60 font-bold')}>
      <td className="px-3 py-2.5 font-medium text-slate-700">{label}</td>
      <td className="px-3 py-2.5 text-right tabular-nums">{formatRupiah(a)}</td>
      <td className="px-3 py-2.5 text-right tabular-nums">{formatRupiah(b)}</td>
      <td
        className={cn(
          'px-3 py-2.5 text-right font-semibold tabular-nums',
          highlight && delta > 0 && 'text-danger-600',
          highlight && delta < 0 && 'text-brand-600'
        )}
      >
        {delta > 0 ? '+' : ''}
        {formatRupiah(delta)}
      </td>
    </tr>
  )
}

function MemoSection({
  kind,
  aFrom,
  aTo,
  bFrom,
  bTo,
  titleA,
  titleB,
  userId
}: {
  kind: PeriodKind
  aFrom: DayKey
  aTo: DayKey
  bFrom: DayKey
  bTo: DayKey
  titleA: string
  titleB: string
  userId: string | null
}) {
  const toast = useToastLocal()
  const { data: notes, isPending } = useComparisonNotes()
  const addNote = useAddComparisonNote()
  const deleteNote = useDeleteComparisonNote()

  const [text, setText] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [showAll, setShowAll] = useState(false)

  const current = notesForPair(notes, kind, aFrom, aTo, bFrom, bTo)
  const visible = showAll ? (notes ?? []) : current

  async function handleSave(e: FormEvent) {
    e.preventDefault()
    setError(null)
    const note = text.trim()
    if (!note) return
    if (!userId) {
      setError('Sesi tidak ditemukan. Silakan masuk kembali.')
      return
    }
    try {
      await addNote.mutateAsync({
        period_kind: kind,
        period_a_from: aFrom,
        period_a_to: aTo,
        period_b_from: bFrom,
        period_b_to: bTo,
        note,
        user_id: userId
      })
      setText('')
      toast('Memo tersimpan')
    } catch (err) {
      setError(friendlyMessage(err))
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteNote.mutateAsync(id)
      toast('Memo dihapus')
    } catch (err) {
      toast(friendlyMessage(err))
    }
  }

  return (
    <section className="mt-6">
      <div className="mb-2 flex items-baseline justify-between px-1">
        <h2 className="flex items-center gap-1.5 text-sm font-bold text-slate-800">
          <StickyNote className="size-4 text-brand-600" /> Memo
        </h2>
        <span className="text-xs text-slate-400">
          {current.length} memo untuk perbandingan ini
        </span>
      </div>

      <Card>
        <form onSubmit={handleSave} className="flex flex-col gap-2">
          <label className="text-xs font-medium text-slate-500" htmlFor="memo-input">
            Catatan untuk {titleA} vs {titleB}
          </label>
          <textarea
            id="memo-input"
            rows={2}
            maxLength={500}
            placeholder="cth. Lonjakan belanja karena persediaan bulanan & bayar seragam anak"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
          {error && (
            <p className="rounded-lg bg-danger-50 px-3 py-2 text-xs font-medium text-danger-600">
              {error}
            </p>
          )}
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400">{text.length}/500</span>
            <Button type="submit" disabled={addNote.isPending || !text.trim()}>
              {addNote.isPending ? 'Menyimpan…' : 'Simpan memo'}
            </Button>
          </div>
        </form>
      </Card>

      {isPending ? (
        <div className="grid place-items-center py-8">
          <Spinner className="size-6" />
        </div>
      ) : visible.length === 0 ? (
        <EmptyState
          icon={<StickyNote className="size-5" />}
          title="Belum ada memo"
          description="Tulis memo agar alasan selisih periode ini tidak lupa dan tidak tertukar dengan perbandingan lain."
        />
      ) : (
        <div className="mt-3 space-y-2">
          {visible.map((n) => {
            const label = `${periodTitle(n.period_kind, {
              from: n.period_a_from,
              to: n.period_a_to
            })}  vs  ${periodTitle(n.period_kind, {
              from: n.period_b_from,
              to: n.period_b_to
            })}`
            return (
              <Card key={n.id} className="p-3!">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[11px] font-bold tracking-wide text-slate-500 uppercase">
                    {label}
                  </p>
                  <button
                    type="button"
                    aria-label="Hapus memo"
                    disabled={deleteNote.isPending}
                    onClick={() => void handleDelete(n.id)}
                    className="grid size-7 shrink-0 place-items-center rounded-full text-slate-300 transition hover:bg-danger-50 hover:text-danger-600"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
                <p className="mt-1 text-sm leading-relaxed whitespace-pre-wrap text-slate-700">
                  {n.note}
                </p>
                <p className="mt-1.5 text-[10px] text-slate-400">
                  {formatDateTime(n.created_at)}
                </p>
              </Card>
            )
          })}
        </div>
      )}

      {(notes?.length ?? 0) > 0 && (
        <button
          type="button"
          onClick={() => setShowAll((v) => !v)}
          className="mt-3 text-xs font-semibold text-brand-700 hover:underline"
        >
          {showAll
            ? 'Tampilkan hanya perbandingan ini'
            : `Tampilkan semua memo (${notes!.length})`}
        </button>
      )}
    </section>
  )
}

/** Toast dari shell; hook kecil agar pemakaian konsisten. */
function useToastLocal() {
  return useContext(ToastContext)
}
