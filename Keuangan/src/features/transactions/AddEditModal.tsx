import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Trash2, X } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import { useCategories } from '../categories/useCategories'
import { useAddWallet, useWallets } from '../wallets/useWallets'
import {
  useDeleteTransaction,
  useInsertTransaction,
  useUpdateTransaction
} from './useTransactions'
import { Button } from '../../components/ui/Button'
import { Segmented } from '../../components/ui/Segmented'
import { Spinner } from '../../components/ui/Spinner'
import type { Transaction, TxType } from '../../types/db'
import {
  formatNumberInput,
  parseAmountInput,
  todayKey,
  type DayKey
} from '../../utils/format'
import { friendlyMessage } from '../../utils/errors'
import { useToast } from '../layout/app-contexts'
import { cn } from '../../lib/cn'

interface Props {
  open: boolean
  initial: Transaction | 'new' | null
  onClose: () => void
}

export function AddEditModal({ open, initial, onClose }: Props) {
  const toast = useToast()
  const { session } = useAuth()
  const { data: categories = [] } = useCategories()
  const { data: wallets = [] } = useWallets()
  const addWallet = useAddWallet()

  const insertTx = useInsertTransaction()
  const updateTx = useUpdateTransaction()
  const deleteTx = useDeleteTransaction()

  const [type, setType] = useState<TxType>('expense')
  const [walletId, setWalletId] = useState<string | null>(null)
  const [newWalletName, setNewWalletName] = useState('')
  const [amountRaw, setAmountRaw] = useState('')
  const [categoryId, setCategoryId] = useState<string | null>(null)
  const [dateKey, setDateKey] = useState<DayKey>(todayKey())
  const [note, setNote] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  // Reset form setiap kali sheet dibuka dengan konteks berbeda.
  useEffect(() => {
    if (!open) return
    setError(null)
    setConfirmingDelete(false)
    if (initial && initial !== 'new') {
      setType(initial.type)
      setWalletId(initial.wallet_id)
      setNewWalletName('')
      setAmountRaw(formatNumberInput(Number(initial.amount)))
      setCategoryId(initial.category_id)
      setDateKey(initial.occurred_on)
      setNote(initial.note ?? '')
    } else {
      setType('expense')
      setWalletId(null)
      setNewWalletName('')
      setAmountRaw('')
      setCategoryId(null)
      setDateKey(todayKey())
      setNote('')
    }
  }, [open, initial])

  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    const onEsc = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onEsc)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onEsc)
    }
  }, [open, onClose])

  if (!open) return null

  const isEdit = Boolean(initial && initial !== 'new')
  const busy =
    insertTx.isPending ||
    updateTx.isPending ||
    deleteTx.isPending ||
    addWallet.isPending

  function handleAmount(value: string) {
    const digits = value.replace(/\D/g, '').slice(0, 12)
    setAmountRaw(digits ? formatNumberInput(Number(digits)) : '')
  }

  async function handleAddWallet() {
    const name = newWalletName.trim()
    if (!name || !session?.user.id) return
    setError(null)
    try {
      const wallet = await addWallet.mutateAsync({
        name,
        user_id: session.user.id
      })
      setWalletId(wallet.id)
      setNewWalletName('')
      toast('Sumber dana dibuat')
    } catch (err) {
      setError(friendlyMessage(err))
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (!walletId) {
      setError('Pilih atau buat sumber dana terlebih dahulu.')
      return
    }
    const amount = parseAmountInput(amountRaw)
    if (!(amount > 0)) {
      setError('Masukkan nominal yang valid (lebih dari nol).')
      return
    }
    if (!session?.user.id) {
      setError('Sesi tidak ditemukan. Silakan masuk kembali.')
      return
    }

    const payload = {
      type,
      amount,
      category_id: categoryId,
      wallet_id: walletId,
      occurred_on: dateKey,
      note: note.trim() ? note.trim() : null
    }

    try {
      if (initial && initial !== 'new') {
        await updateTx.mutateAsync({ id: initial.id, ...payload })
        toast('Transaksi diperbarui')
      } else {
        await insertTx.mutateAsync({ ...payload, user_id: session.user.id })
        toast('Transaksi tersimpan')
      }
      onClose()
    } catch (err) {
      setError(friendlyMessage(err))
    }
  }

  async function handleDelete() {
    if (!initial || initial === 'new' || !confirmingDelete) return
    try {
      await deleteTx.mutateAsync(initial.id)
      toast('Transaksi dihapus')
      onClose()
    } catch (err) {
      setError(friendlyMessage(err))
    }
  }

  const relevantCategories = categories.filter((c) => c.type === type)

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center">
      <div
        aria-hidden
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px]"
      />

      <form
        role="dialog"
        aria-modal="true"
        aria-label={isEdit ? 'Ubah transaksi' : 'Tambah transaksi'}
        onSubmit={handleSubmit}
        className="animate-sheet-up relative z-10 max-h-dvh w-full overflow-y-auto rounded-t-2xl bg-white shadow-xl md:max-w-md md:rounded-2xl pb-safe"
      >
        <div className="mx-auto mt-3 h-1 w-10 rounded-full bg-slate-200 md:hidden" />

        <div className="flex items-center justify-between px-5 pt-3">
          <h2 className="text-base font-bold text-slate-900">
            {isEdit ? 'Ubah transaksi' : 'Transaksi baru'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="grid size-8 place-items-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="flex flex-col gap-4 p-5">
          <Segmented<TxType>
            options={[
              { value: 'expense', label: 'Pengeluaran' },
              { value: 'income', label: 'Pemasukan' }
            ]}
            value={type}
            onChange={(v) => {
              setType(v)
              setCategoryId(null)
              setConfirmingDelete(false)
            }}
          />

          {/* Sumber Dana — wajib dipilih sebelum nominal */}
          <div>
            <span className="mb-1 flex items-center justify-between text-sm font-medium text-slate-700">
              Sumber Dana
              <Link
                to="/dompet"
                onClick={onClose}
                className="text-xs font-semibold text-brand-700 hover:underline"
              >
                Kelola
              </Link>
            </span>
            {wallets.length > 0 && (
              <div className="grid max-h-36 grid-cols-2 gap-2 overflow-y-auto sm:grid-cols-3">
                {wallets.map((w) => (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => setWalletId(w.id)}
                    className={cn(
                      'truncate rounded-xl border px-2.5 py-2 text-left text-xs font-medium transition',
                      walletId === w.id
                        ? 'border-brand-500 bg-brand-50 text-brand-800'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    )}
                  >
                    {w.name}
                  </button>
                ))}
              </div>
            )}
            <div className="mt-2 flex gap-2">
              <input
                type="text"
                value={newWalletName}
                maxLength={60}
                placeholder={
                  wallets.length === 0
                    ? 'Buat dulu, cth. Kas'
                    : 'Atau buat dompet baru…'
                }
                onChange={(e) => setNewWalletName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    e.stopPropagation()
                    void handleAddWallet()
                  }
                }}
                className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              />
              <Button
                type="button"
                variant="secondary"
                disabled={!newWalletName.trim() || addWallet.isPending}
                onClick={() => void handleAddWallet()}
                className="px-3!"
              >
                {addWallet.isPending ? (
                  <Spinner className="size-4 border-slate-300 border-t-slate-600" />
                ) : (
                  'Tambah'
                )}
              </Button>
            </div>
          </div>

          {/* Nominal */}
          <label className="block">
            <span className="mb-1 flex items-center justify-between text-sm font-medium text-slate-700">
              Nominal
              {!walletId && (
                <span className="text-xs font-normal text-slate-400">
                  Pilih sumber dana dulu
                </span>
              )}
            </span>
            <span className="relative block">
              <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-lg font-semibold text-slate-400">
                Rp
              </span>
              <input
                inputMode="numeric"
                autoComplete="off"
                placeholder="0"
                disabled={!walletId}
                value={amountRaw}
                onChange={(e) => handleAmount(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white py-3 pr-3 pl-14 text-right text-xl font-bold tracking-tight outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100 disabled:bg-slate-50 disabled:text-slate-300"
              />
            </span>
          </label>

          {/* Kategori */}
          <div>
            <span className="mb-1 flex items-center justify-between text-sm font-medium text-slate-700">
              Kategori
              <Link
                to="/kategori"
                onClick={onClose}
                className="text-xs font-semibold text-brand-700 hover:underline"
              >
                Kelola
              </Link>
            </span>
            {relevantCategories.length === 0 ? (
              <p className="rounded-xl bg-slate-50 px-3 py-2.5 text-xs text-slate-500">
                Belum ada kategori untuk jenis ini —{' '}
                <Link to="/kategori" onClick={onClose} className="font-semibold text-brand-700 underline">
                  buat dulu
                </Link>{' '}
                atau simpan tanpa kategori.
              </p>
            ) : (
              <div className="grid max-h-44 grid-cols-2 gap-2 overflow-y-auto sm:grid-cols-3">
                <button
                  type="button"
                  onClick={() => setCategoryId(null)}
                  className={cn(
                    'truncate rounded-xl border px-2.5 py-2 text-left text-xs font-medium transition',
                    categoryId === null
                      ? 'border-brand-500 bg-brand-50 text-brand-800'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  )}
                >
                  Tanpa kategori
                </button>
                {relevantCategories.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCategoryId(c.id)}
                    className={cn(
                      'truncate rounded-xl border px-2.5 py-2 text-left text-xs font-medium transition',
                      categoryId === c.id
                        ? 'border-brand-500 bg-brand-50 text-brand-800'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    )}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Tanggal</span>
            <input
              type="date"
              required
              value={dateKey}
              max="2100-12-31"
              onChange={(e) => e.target.value && setDateKey(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-base outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">
              Catatan{' '}
              <span className="text-xs font-normal text-slate-400">(opsional)</span>
            </span>
            <textarea
              rows={2}
              maxLength={300}
              placeholder="cth. Makan siang di warteg"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-base outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
          </label>

          {error && (
            <p className="rounded-lg bg-danger-50 px-3 py-2 text-xs font-medium text-danger-600">
              {error}
            </p>
          )}

          <div className="flex items-center gap-2 pt-1">
            {isEdit && (
              <>
                {confirmingDelete ? (
                  <>
                    <Button
                      type="button"
                      variant="danger"
                      className="flex-1"
                      onClick={handleDelete}
                    >
                      Ya, hapus
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setConfirmingDelete(false)}
                    >
                      Batal
                    </Button>
                  </>
                ) : (
                  <Button
                    type="button"
                    variant="ghost"
                    aria-label="Hapus transaksi"
                    disabled={busy}
                    onClick={() => setConfirmingDelete(true)}
                    className="px-3! text-danger-600 hover:bg-danger-50 hover:text-danger-600"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                )}
              </>
            )}

            <span className="flex-1" />

            <Button type="button" variant="secondary" onClick={onClose}>
              Tutup
            </Button>
            <Button type="submit" disabled={busy} className="min-w-28">
              {busy ? <Spinner className="size-4 border-white/40 border-t-white" /> : isEdit ? 'Simpan' : 'Tambahkan'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
