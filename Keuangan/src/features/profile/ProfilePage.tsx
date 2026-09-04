import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Check, ChevronRight, LogOut, Pencil, Smartphone, Wallet } from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Spinner } from '../../components/ui/Spinner'
import { useAuth } from '../auth/AuthContext'
import { useProfile, useSetUsername } from './useProfile'
import { friendlyMessage } from '../../utils/errors'

const USERNAME_RE = /^[a-z0-9_]{3,20}$/

export function ProfilePage() {
  const { session, signOut } = useAuth()
  const navigate = useNavigate()
  const [busy, setBusy] = useState(false)

  const userId = session?.user.id
  const email = session?.user.email ?? ''
  const { data: profile, isLoading: profileLoading } = useProfile(userId)
  const setUsername = useSetUsername()

  const username = profile?.username ?? null
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  async function handleSignOut() {
    setBusy(true)
    try {
      await signOut()
      navigate('/login', { replace: true })
    } finally {
      setBusy(false)
    }
  }

  function startEdit() {
    setDraft(username ?? '')
    setFormError(null)
    setEditing(true)
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault()
    setFormError(null)
    const uname = draft.trim().toLowerCase()
    if (!USERNAME_RE.test(uname)) {
      setFormError(
        'Username hanya boleh berisi 3–20 karakter huruf kecil, angka, atau underscore.'
      )
      return
    }
    setUsername.mutate(uname, {
      onSuccess: () => setEditing(false),
      onError: (err) => setFormError(friendlyMessage(err))
    })
  }

  const display = username ?? (email || 'Tanpa identitas')

  return (
    <main className="mx-auto max-w-3xl px-4 pt-6 pb-28 md:pb-12">
      <PageHeader title="Profil" />

      <Card className="flex flex-col items-center py-6">
        <div className="grid size-16 place-items-center rounded-full bg-brand-100 text-xl font-extrabold text-brand-700 uppercase">
          {(display[0] ?? '?').toUpperCase()}
        </div>
        {profileLoading ? (
          <Spinner className="mt-4 size-5" />
        ) : (
          <>
            <p
              className="mt-3 max-w-full truncate px-2 text-sm font-bold text-slate-900"
              title={username ?? email}
            >
              {username ? `@${username}` : email || 'Tanpa identitas'}
            </p>
            {username && (
              <p className="max-w-full truncate px-2 text-xs text-slate-400" title={email}>
                {email}
              </p>
            )}
            <p className="mt-0.5 text-xs text-slate-400">Akun Catatan Keuangan</p>
          </>
        )}

        {!profileLoading && (
          editing ? (
            <form onSubmit={handleSave} className="mt-4 w-full max-w-xs">
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <Input
                    label="Username baru"
                    type="text"
                    name="username"
                    autoComplete="username"
                    required
                    minLength={3}
                    maxLength={20}
                    placeholder="cth. budi_santoso"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value.toLowerCase())}
                  />
                </div>
                <Button type="submit" disabled={setUsername.isPending} className="shrink-0">
                  {setUsername.isPending ? (
                    <Spinner className="size-4" />
                  ) : (
                    <Check className="size-4" />
                  )}
                  Simpan
                </Button>
              </div>
              <p className="mt-1 text-[11px] text-slate-400">
                3–20 karakter: huruf kecil, angka, atau underscore.
              </p>
              {formError && (
                <p className="mt-2 rounded-lg bg-danger-50 px-3 py-2 text-xs font-medium text-danger-600">
                  {formError}
                </p>
              )}
              {username && (
                <button
                  type="button"
                  className="mt-2 text-xs font-semibold text-slate-500 hover:underline"
                  onClick={() => setEditing(false)}
                >
                  Batal
                </button>
              )}
            </form>
          ) : (
            <Button
              variant="secondary"
              className="mt-4"
              onClick={startEdit}
            >
              <Pencil className="size-4" />
              {username ? 'Ubah username' : 'Atur username'}
            </Button>
          )
        )}
      </Card>

      <Link
        to="/dompet"
        className="mt-6 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-brand-200 hover:shadow"
      >
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-700">
          <Wallet className="size-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-bold text-slate-800">
            Sumber Dana
          </span>
          <span className="block text-xs text-slate-500">
            Kelola dompet agar catatan terpisah rapi
          </span>
        </span>
        <ChevronRight className="size-4 shrink-0 text-slate-400" />
      </Link>

      <h2 className="mt-6 mb-2 flex items-center gap-1.5 px-1 text-xs font-bold tracking-wider text-slate-400 uppercase">
        <Smartphone className="size-3.5" /> Pasang ke layar utama
      </h2>
      <Card>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-bold text-slate-700">Android (Chrome)</p>
            <ol className="mt-1 list-decimal space-y-0.5 pl-4 text-xs leading-relaxed text-slate-500">
              <li>Buka aplikasi lewat URL situsnya.</li>
              <li>Ketuk menu ⋮ di pojok kanan atas.</li>
              <li>Pilih “Tambahkan ke layar utama”.</li>
            </ol>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-700">iPhone / iPad (Safari)</p>
            <ol className="mt-1 list-decimal space-y-0.5 pl-4 text-xs leading-relaxed text-slate-500">
              <li>Buka aplikasi lewat URL situsnya.</li>
              <li>Ketuk tombol Bagikan (kotak dengan panah).</li>
              <li>Pilih “Tambahkan ke Layar Utama”.</li>
            </ol>
          </div>
        </div>
        <p className="mt-3 text-[11px] leading-relaxed text-slate-400">
          Mode pasang akan membuka aplikasi tanpa bilah browser, lengkap dengan
          ikon sendiri di home screen.
        </p>
      </Card>

      <Button
        variant="secondary"
        block
        disabled={busy}
        onClick={handleSignOut}
        className="mt-8 border-danger-200 text-danger-600 hover:bg-danger-50"
      >
        {busy ? (
          <Spinner className="size-4 border-danger-200 border-t-danger-600" />
        ) : (
          <LogOut className="size-4" />
        )}
        Keluar dari akun ini
      </Button>

      <p className="mt-6 text-center text-[11px] text-slate-400">
        Data Anda disimpan aman di Supabase dan hanya bisa diakses akun Anda.
      </p>
    </main>
  )
}
