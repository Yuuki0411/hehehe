import { useState } from 'react'
import type { FormEvent } from 'react'
import { Check, Pencil, Plus, Trash2, X } from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Spinner } from '../../components/ui/Spinner'
import {
  useAddWallet,
  useDeleteWallet,
  useUpdateWallet,
  useWallets
} from './useWallets'
import { useToast } from '../layout/app-contexts'
import { useAuth } from '../auth/AuthContext'
import { friendlyMessage } from '../../utils/errors'

export function WalletsPage() {
  const toast = useToast()
  const { session } = useAuth()
  const { data: wallets = [], isPending } = useWallets()
  const addWallet = useAddWallet()
  const updateWallet = useUpdateWallet()
  const deleteWallet = useDeleteWallet()

  const [newName, setNewName] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)

  async function handleAdd(e: FormEvent) {
    e.preventDefault()
    setFormError(null)
    const name = newName.trim()
    if (!name || !session?.user.id) return
    try {
      await addWallet.mutateAsync({ name, user_id: session.user.id })
      setNewName('')
      toast('Sumber dana ditambahkan')
    } catch (err) {
      setFormError(friendlyMessage(err))
    }
  }

  function startEdit(walletId: string, current: string) {
    setPendingDeleteId(null)
    setEditingId(walletId)
    setEditingName(current)
  }

  function cancelEdit() {
    setEditingId(null)
    setEditingName('')
  }

  async function commitEdit() {
    if (!editingId) return
    const name = editingName.trim()
    if (!name || name.length > 60) return
    try {
      await updateWallet.mutateAsync({ id: editingId, name })
      setEditingId(null)
      toast('Sumber dana diperbarui')
    } catch (err) {
      toast(friendlyMessage(err))
    }
  }

  async function confirmDelete(walletId: string) {
    try {
      await deleteWallet.mutateAsync(walletId)
      setPendingDeleteId(null)
      toast('Sumber dana dihapus')
    } catch (err) {
      setPendingDeleteId(null)
      toast(friendlyMessage(err))
    }
  }

  if (isPending) {
    return (
      <main className="mx-auto max-w-3xl px-4 pt-6 pb-28 md:pb-12">
        <PageHeader title="Sumber Dana" />
        <div className="grid place-items-center py-20">
          <Spinner className="size-7" />
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-3xl px-4 pt-6 pb-28 md:pb-12">
      <PageHeader
        title="Sumber Dana"
        subtitle={`${wallets.length} dompet terpasang`}
      />

      <Card>
        <form onSubmit={handleAdd} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Input
              label="Nama dompet"
              placeholder="cth. Kas, BCA, GoPay"
              maxLength={60}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
          </div>
          <Button
            type="submit"
            disabled={addWallet.isPending || !newName.trim()}
            className="shrink-0"
          >
            <Plus className="size-4" /> Tambah
          </Button>
        </form>
        {formError && (
          <p className="mt-2 rounded-lg bg-danger-50 px-3 py-2 text-xs font-medium text-danger-600">
            {formError}
          </p>
        )}
      </Card>

      <section className="mt-6">
        <h2 className="mb-2 px-1 text-xs font-bold tracking-wider text-slate-500 uppercase">
          Daftar Dompet
        </h2>
        <Card className="divide-y divide-slate-100 p-1!">
          {wallets.length === 0 && (
            <p className="px-3 py-4 text-sm text-slate-400">Belum ada.</p>
          )}
          {wallets.map((wallet) => {
            const editing = editingId === wallet.id
            const confirming = pendingDeleteId === wallet.id
            return (
              <div key={wallet.id} className="flex flex-wrap items-center gap-2 px-2 py-2">
                {editing ? (
                  <>
                    <input
                      autoFocus
                      value={editingName}
                      maxLength={60}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          void commitEdit()
                        }
                        if (e.key === 'Escape') cancelEdit()
                      }}
                      className="min-w-0 flex-1 rounded-lg border border-brand-300 bg-white px-2 py-1.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                    />
                    <Button
                      variant="primary"
                      disabled={updateWallet.isPending}
                      onClick={() => void commitEdit()}
                      className="px-2.5! py-1.5!"
                      aria-label="Simpan nama dompet"
                    >
                      <Check className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={cancelEdit}
                      className="px-2! py-1.5!"
                      aria-label="Batal mengubah"
                    >
                      <X className="size-4" />
                    </Button>
                  </>
                ) : confirming ? (
                  <>
                    <span className="flex-1 truncate text-sm font-semibold text-danger-600">
                      Hapus "{wallet.name}"?
                    </span>
                    <Button
                      variant="danger"
                      disabled={deleteWallet.isPending}
                      onClick={() => void confirmDelete(wallet.id)}
                      className="px-3! py-1.5! text-xs"
                    >
                      Hapus
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => setPendingDeleteId(null)}
                      className="px-3! py-1.5! text-xs"
                    >
                      Batal
                    </Button>
                  </>
                ) : (
                  <>
                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-800">
                      {wallet.name}
                    </span>
                    <button
                      type="button"
                      aria-label={`Ubah ${wallet.name}`}
                      onClick={() => startEdit(wallet.id, wallet.name)}
                      className="grid size-8 place-items-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-brand-700"
                    >
                      <Pencil className="size-4" />
                    </button>
                    <button
                      type="button"
                      aria-label={`Hapus ${wallet.name}`}
                      onClick={() =>
                        setPendingDeleteId((cur) =>
                          cur === wallet.id ? null : wallet.id
                        )
                      }
                      className="grid size-8 place-items-center rounded-full text-slate-400 transition hover:bg-danger-50 hover:text-danger-600"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </>
                )}
              </div>
            )
          })}
        </Card>
      </section>

      <p className="mt-6 text-xs leading-relaxed text-slate-500">
        Dompet yang masih dipakai transaksi tidak bisa dihapus — pindahkan atau
        hapus dulu transaksinya, agar catatan keuangan tidak menjadi rancu.
      </p>
    </main>
  )
}
