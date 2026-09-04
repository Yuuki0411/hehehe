import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { CircleCheck, UserPlus, Wallet } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Card } from '../../components/ui/Card'
import { supabase } from '../../lib/supabase'
import { authErrorMessage } from './AuthContext'

const USERNAME_RE = /^[a-z0-9_]{3,20}$/

export function RegisterPage() {
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    const uname = username.trim().toLowerCase()
    if (!USERNAME_RE.test(uname)) {
      setError(
        'Username hanya boleh berisi 3–20 karakter huruf kecil, angka, atau underscore.'
      )
      return
    }
    if (password !== confirm) {
      setError('Konfirmasi kata sandi tidak sama.')
      return
    }
    setBusy(true)
    try {
      const { data: available, error: checkError } = await supabase.rpc(
        'username_available',
        { p_username: uname }
      )
      if (checkError) {
        setError('Gagal memeriksa username. Coba lagi.')
        return
      }
      if (!available) {
        setError('Username sudah dipakai. Pilih yang lain.')
        return
      }
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: window.location.origin + '/',
          data: { username: uname }
        }
      })
      if (error) {
        setError(authErrorMessage(error.message))
        return
      }
      // Jika konfirmasi email dimatikan di proyek Supabase, pengguna
      // langsung memiliki sesi dan route guard mengantar ke dashboard.
      const { data } = await supabase.auth.getSession()
      if (!data.session) setSuccess(true)
    } finally {
      setBusy(false)
    }
  }

  if (success) {
    return (
      <div className="grid min-h-dvh place-items-center px-4 py-10">
        <Card className="w-full max-w-sm text-center">
          <CircleCheck className="mx-auto size-12 text-brand-600" />
          <h1 className="mt-3 text-lg font-bold">Cek email Anda</h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            Kami mengirim tautan verifikasi ke{' '}
            <span className="font-semibold text-slate-700">{email.trim()}</span>.
            Buka tautan tersebut lalu masuk dengan username{' '}
            <span className="font-semibold text-slate-700">{username.trim()}</span>.
            Beri perhatian juga pada folder spam.
          </p>
          <Link to="/login" className="mt-4 inline-block">
            <Button block>Kembali ke halaman masuk</Button>
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="grid min-h-dvh place-items-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-2">
          <div className="grid size-14 place-items-center rounded-2xl bg-brand-600 text-white shadow-md shadow-brand-200">
            <Wallet className="size-7" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Buat akun baru</h1>
          <p className="text-center text-sm text-slate-500">
            Akun Anda dapat dipakai dari perangkat mana pun
          </p>
        </div>

        <Card className="p-5">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Email"
              type="email"
              name="email"
              autoComplete="email"
              required
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <div>
              <Input
                label="Username"
                type="text"
                name="username"
                autoComplete="username"
                required
                minLength={3}
                maxLength={20}
                placeholder="cth. budi_santoso"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
              />
              <p className="mt-1 text-[11px] text-slate-400">
                3–20 karakter: huruf kecil, angka, atau underscore. Dipakai untuk
                masuk tanpa email.
              </p>
            </div>
            <Input
              label="Kata sandi"
              type="password"
              name="new-password"
              autoComplete="new-password"
              required
              minLength={6}
              placeholder="Minimal 6 karakter"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Input
              label="Ulangi kata sandi"
              type="password"
              name="confirm-password"
              autoComplete="new-password"
              required
              minLength={6}
              placeholder="Ulangi kata sandi"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
            {error && (
              <p className="rounded-lg bg-danger-50 px-3 py-2 text-xs font-medium text-danger-600">
                {error}
              </p>
            )}
            <Button type="submit" block disabled={busy}>
              <UserPlus className="size-4" />
              {busy ? 'Memproses…' : 'Daftar'}
            </Button>
          </form>
        </Card>

        <p className="mt-5 text-center text-sm text-slate-500">
          Sudah punya akun?{' '}
          <Link to="/login" className="font-semibold text-brand-700 hover:underline">
            Masuk
          </Link>
        </p>
      </div>
    </div>
  )
}
