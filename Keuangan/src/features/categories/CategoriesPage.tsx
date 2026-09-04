import { useState } from 'react'
import type { FormEvent } from 'react'
import { Check, Pencil, Plus, Trash2, X } from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Segmented } from '../../components/ui/Segmented'
import { Spinner } from '../../components/ui/Spinner'
import {
  useAddCategory,
  useCategories,
  useDeleteCategory,
  useUpdateCategory
} from './useCategories'
import { useToast } from '../layout/app-contexts'
import { useAuth } from '../auth/AuthContext'
import { friendlyMessage } from '../../utils/errors'
import { cn } from '../../lib/cn'
import type { Category, TxType } from '../../types/db'

export function CategoriesPage() {
  const toast = useToast()
  const { session } = useAuth()
  const { data: categories = [], isPending } = useCategories()
  const addCat = useAddCategory()
  const updateCat = useUpdateCategory()
  const deleteCat = useDeleteCategory()

  const [newName, setNewName] = useState('')
  const [newType, setNewType] = useState<TxType>('expense')
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
      await addCat.mutateAsync({ name, type: newType, user_id: session.user.id })
      setNewName('')
      toast('Kategori ditambahkan')
    } catch (err) {
      setFormError(friendlyMessage(err))
    }
  }

  function startEdit(cat: Category) {
    setPendingDeleteId(null)
    setEditingId(cat.id)
    setEditingName(cat.name)
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
      await updateCat.mutateAsync({ id: editingId, name })
      setEditingId(null)
      toast('Kategori diperbarui')
    } catch (err) {
      toast(friendlyMessage(err))
    }
  }

  async function confirmDelete(id: string) {
    try {
      await deleteCat.mutateAsync(id)
      setPendingDeleteId(null)
      toast('Kategori dihapus')
    } catch (err) {
      toast(friendlyMessage(err))
    }
  }

  const sections: Array<{
    label: string
    type: TxType
    tone: string
    dotClass: string
  }> = [
    {
      label: 'Pengeluaran',
      type: 'expense',
      tone: 'text-danger-600',
      dotClass: 'bg-danger-50 border-danger-200'
    },
    {
      label: 'Pemasukan',
      type: 'income',
      tone: 'text-brand-600',
      dotClass: 'bg-brand-50 border-brand-200'
    }
  ]

  if (isPending) {
    return (
      <main className="mx-auto max-w-3xl px-4 pt-6 pb-28 md:pb-12">
        <PageHeader title="Kategori" />
        <div className="grid place-items-center py-20">
          <Spinner className="size-7" />
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-3xl px-4 pt-6 pb-28 md:pb-12">
      <PageHeader
        title="Kategori"
        subtitle={`${categories.length} kategori terpasang`}
      />

      <Card>
        <form onSubmit={handleAdd} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="sm:w-64">
            <Input
              label="Nama kategori"
              placeholder="cth. Donasi & Sedekah"
              maxLength={60}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
          </div>
          <div className="sm:w-56">
            <span className="mb-1 block text-sm font-medium text-slate-700">
              Jenis
            </span>
            <Segmented<TxType>
              options={[
                { value: 'expense', label: 'Pengeluaran' },
                { value: 'income', label: 'Pemasukan' }
              ]}
              value={newType}
              onChange={setNewType}
            />
          </div>
          <Button
            type="submit"
            disabled={addCat.isPending || !newName.trim()}
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

      {sections.map((section) => {
        const items = categories.filter((c) => c.type === section.type)
        return (
          <section key={section.type} className="mt-6">
            <h2
              className={cn(
                'mb-2 flex items-baseline gap-2 px-1 text-xs font-bold tracking-wider uppercase',
                section.tone
              )}
            >
              {section.label}
              <span className="font-medium text-slate-400">{items.length}</span>
            </h2>
            <Card className="divide-y divide-slate-100 p-1!">
              {items.length === 0 && (
                <p className="px-3 py-4 text-sm text-slate-400">Belum ada.</p>
              )}
              {items.map((cat) => {
                const editing = editingId === cat.id
                const confirming = pendingDeleteId === cat.id
                return (
                  <div
                    key={cat.id}
                    className="flex flex-wrap items-center gap-2 px-2 py-2"
                  >
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
                          disabled={updateCat.isPending}
                          onClick={() => void commitEdit()}
                          className="px-2.5! py-1.5!"
                          aria-label="Simpan nama kategori"
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
                          Hapus "{cat.name}"?
                        </span>
                        <Button
                          variant="danger"
                          disabled={deleteCat.isPending}
                          onClick={() => void confirmDelete(cat.id)}
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
                        <span
                          className={cn(
                            'size-2.5 shrink-0 rounded-full border',
                            section.dotClass
                          )}
                        />
                        <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-800">
                          {cat.name}
                        </span>
                        <button
                          type="button"
                          aria-label={`Ubah ${cat.name}`}
                          onClick={() => startEdit(cat)}
                          className="grid size-8 place-items-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-brand-700"
                        >
                          <Pencil className="size-4" />
                        </button>
                        <button
                          type="button"
                          aria-label={`Hapus ${cat.name}`}
                          onClick={() =>
                            setPendingDeleteId((cur) =>
                              cur === cat.id ? null : cat.id
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
        )
      })}

      <p className="mt-6 text-xs leading-relaxed text-slate-500">
        Menghapus kategori tidak menghapus transaksinya — catatan lama hanya akan
        tampil sebagai "Tanpa kategori".
      </p>
    </main>
  )
}
