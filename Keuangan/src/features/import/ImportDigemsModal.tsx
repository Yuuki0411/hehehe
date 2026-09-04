import { useEffect, useRef, useState } from 'react'
import { Upload, X } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../auth/AuthContext'
import { useAddCategory, useCategories } from '../categories/useCategories'
import { useAddWallet, useWallets } from '../wallets/useWallets'
import { Button } from '../../components/ui/Button'
import { Spinner } from '../../components/ui/Spinner'
import { useToast } from '../layout/app-contexts'
import { cn } from '../../lib/cn'
import { formatRupiah, formatShortDate } from '../../utils/format'
import { friendlyMessage } from '../../utils/errors'
import { parseDigemsCsv, type DigemsCsvResult } from './digemsCsv'

/** Nama kategori pemasukan untuk penjualan topup — sama dengan yang dipakai
 * sinkronisasi otomatis dari server Digems (server/server.js). */
const CATEGORY_NAME = 'Topup Game (Digems)'

interface Props {
  open: boolean
  onClose: () => void
}

/** Impor CSV export admin Digems → catat pemasukan (hanya status Sukses). */
export function ImportDigemsModal({ open, onClose }: Props) {
  const toast = useToast()
  const qc = useQueryClient()
  const { session } = useAuth()
  const { data: categories = [] } = useCategories()
  const { data: wallets = [] } = useWallets()
  const addWallet = useAddWallet()
  const addCategory = useAddCategory()

  const inputRef = useRef<HTMLInputElement>(null)

  const [fileName, setFileName] = useState('')
  const [result, setResult] = useState<DigemsCsvResult | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [walletId, setWalletId] = useState<string | null>(null)
  const [newWalletName, setNewWalletName] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Reset setiap kali modal dibuka
  useEffect(() => {
    if (!open) return
    setFileName('')
    setResult(null)
    setFileError(null)
    setError(null)
    setWalletId(null)
    setNewWalletName('')
    if (inputRef.current) inputRef.current.value = ''
  }, [open])

  // Pilih dompet pertama secara default setelah data dompet tersedia
  useEffect(() => {
    if (open && wallets.length > 0 && !walletId) setWalletId(wallets[0]!.id)
  }, [open, wallets, walletId])

  // Kunci scroll halaman & tutup dengan Escape (pola sama seperti modal lain)
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

  const existingCategoryId =
    categories.find(
      (c) =>
        c.type === 'income' &&
        c.name.trim().toLowerCase() === CATEGORY_NAME.toLowerCase()
    )?.id ?? null

  async function handleFile(file: File) {
    setFileError(null)
    setResult(null)
    try {
      const res = parseDigemsCsv(await file.text())
      if (!res.total) {
        setFileName(file.name)
        setFileError(
          'Tidak ada transaksi berstatus Sukses di file ini — hanya baris Sukses yang diimpor.'
        )
        return
      }
      setFileName(file.name)
      setResult(res)
    } catch (err) {
      setFileError(friendlyMessage(err))
    }
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

  async function handleSave() {
    if (!session?.user.id) {
      setError('Sesi tidak ditemukan. Silakan masuk kembali.')
      return
    }
    if (!result || !result.total) return
    if (!walletId) {
      setError('Pilih sumber dana terlebih dahulu.')
      return
    }
    setError(null)
    setBusy(true)
    try {
      // Pastikan kategori pemasukan ada (pakai yang sudah ada bila cocok)
      let categoryId = existingCategoryId
      if (!categoryId) {
        const cat = await addCategory.mutateAsync({
          name: CATEGORY_NAME,
          type: 'income',
          user_id: session.user.id
        })
        categoryId = cat.id
      }
      const payloads = result.rows.map((r) => ({
        user_id: session.user.id,
        type: 'income' as const,
        amount: r.amount,
        category_id: categoryId,
        wallet_id: walletId,
        occurred_on: r.occurred_on,
        note: r.note
      }))
      const { error: insertError } = await supabase
        .from('transactions')
        .insert(payloads)
      if (insertError) throw insertError
      toast(`Impor selesai: ${payloads.length} pemasukan ditambahkan`)
      qc.invalidateQueries({ queryKey: ['transactions'] })
      qc.invalidateQueries({ queryKey: ['categories'] })
      onClose()
    } catch (err) {
      setError(friendlyMessage(err))
    } finally {
      setBusy(false)
    }
  }

  const canSave = Boolean(result && result.total > 0 && walletId && !busy)

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center">
      <div
        aria-hidden
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px]"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Impor pemasukan dari Digems"
        className="animate-sheet-up relative z-10 flex max-h-dvh w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-xl md:max-w-lg md:rounded-2xl pb-safe"
      >
        <div className="mx-auto mt-3 h-1 w-10 rounded-full bg-slate-200 md:hidden" />

        <div className="flex items-center justify-between px-5 pt-3">
          <h2 className="text-base font-bold text-slate-900">
            Impor dari Digems
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

        <div className="flex flex-col gap-4 overflow-y-auto p-5">
          {/* Langkah 1: pilih file CSV */}
          <div>
            <span className="mb-1 block text-sm font-medium text-slate-700">
              1. Pilih file CSV dari halaman admin Digems
            </span>
            <input
              ref={inputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) void handleFile(f)
              }}
            />
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className={cn(
                'flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-6 text-sm transition',
                result
                  ? 'border-brand-300 bg-brand-50/60 text-brand-700'
                  : 'border-slate-300 text-slate-500 hover:border-brand-400 hover:text-brand-700'
              )}
            >
              <Upload className="size-5" />
              <span className="font-semibold">
                {fileName || 'Pilih file Laporan-Transaksi-Digems-*.csv'}
              </span>
              {!fileName && (
                <span className="text-xs font-normal text-slate-400">
                  Hanya baris berstatus Sukses yang akan menjadi pemasukan
                </span>
              )}
            </button>
            {fileError && (
              <p className="mt-2 rounded-lg bg-danger-50 px-3 py-2 text-xs font-medium text-danger-600">
                {fileError}
              </p>
            )}
          </div>

          {/* Langkah 2: pratinjau hasil parse */}
          {result && (
            <div>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-medium text-slate-700">
                  2. Pratinjau — {result.total} pemasukan
                </span>
                <span className="font-bold tabular-nums text-brand-600">
                  {formatRupiah(result.revenue)}
                </span>
              </div>
              <div className="max-h-52 divide-y divide-slate-100 overflow-y-auto rounded-xl border border-slate-200">
                {result.rows.map((r, i) => (
                  <div
                    key={`${r.occurred_on}-${i}`}
                    className="flex items-center gap-3 px-3 py-2"
                  >
                    <span className="shrink-0 text-[11px] font-semibold tabular-nums text-slate-400">
                      {formatShortDate(r.occurred_on)}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-xs text-slate-600">
                      {r.note}
                    </span>
                    <span className="shrink-0 text-xs font-bold tabular-nums text-slate-900">
                      +{formatRupiah(r.amount)}
                    </span>
                  </div>
                ))}
              </div>
              {result.skipped > 0 && (
                <p className="mt-1.5 text-[11px] text-slate-400">
                  {result.skipped} baris lain (Menunggu/Dibatalkan) diabaikan.
                </p>
              )}
            </div>
          )}

          {/* Langkah 3: pilih sumber dana */}
          {result && (
            <div>
              <span className="mb-1 block text-sm font-medium text-slate-700">
                3. Sumber dana
              </span>
              {wallets.length > 0 && (
                <div className="grid max-h-32 grid-cols-2 gap-2 overflow-y-auto sm:grid-cols-3">
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
              <p className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
                Kategori:{' '}
                <span className="font-semibold text-slate-600">
                  {existingCategoryId ? CATEGORY_NAME : `“${CATEGORY_NAME}” (akan dibuat)`}
                </span>{' '}
                — pemasukan topup.
              </p>
            </div>
          )}

          {error && (
            <p className="rounded-lg bg-danger-50 px-3 py-2 text-xs font-medium text-danger-600">
              {error}
            </p>
          )}
        </div>

        {/* Footer aksi */}
        <div className="flex items-center gap-2 border-t border-slate-100 px-5 py-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Tutup
          </Button>
          <span className="flex-1" />
          {result && (
            <Button
              type="button"
              disabled={!canSave}
              onClick={() => void handleSave()}
              className="min-w-40"
            >
              {busy ? (
                <Spinner className="size-4 border-white/40 border-t-white" />
              ) : (
                `Impor ${result.total} transaksi`
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
