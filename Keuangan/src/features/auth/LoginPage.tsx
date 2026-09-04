import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LogIn, Wallet } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Card } from '../../components/ui/Card'
import { supabase } from '../../lib/supabase'
import { authErrorMessage } from './AuthContext'

interface LoginResult {
  access_token?: string
  refresh_token?: string
  error?: string
}

export function LoginPage() {
  const navigate = useNavigate()
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setBusy(true)
    try {
      const identifier = login.trim().toLowerCase()

      if (identifier.includes('@')) {
        const { error } = await supabase.auth.signInWithPassword({
          email: identifier,
          password
        })
        if (error) {
          setError(authErrorMessage(error.message))
          return
        }
      } else {
        const { data, error: invokeError } = await supabase.functions.invoke<LoginResult>(
          'login',
          { body: { username: identifier, password } }
        )
        if (invokeError) {
          setError(authErrorMessage(invokeError.message))
          return
        }
        if (!data?.access_token || !data?.refresh_token) {
          setError(data?.error ?? 'Gagal masuk. Coba lagi.')
          return
        }
        const { error: setErr } = await supabase.auth.setSession({
          access_token: data.access_token,
          refresh_token: data.refresh_token
        })
        if (setErr) {
          setError(authErrorMessage(setErr.message))
          return
        }
      }

      navigate('/', { replace: true })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="grid min-h-dvh place-items-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-2">
          <div className="grid size-14 place-items-center rounded-2xl bg-brand-600 text-white shadow-md shadow-brand-200">
            <Wallet className="size-7" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Catatan Keuangan</h1>
          <p className="text-sm text-slate-500">Masuk untuk mengelola keuangan Anda</p>
        </div>

        <Card className="p-5">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Username atau email"
              type="text"
              name="username"
              autoComplete="username"
              required
              placeholder="cth. budi_santoso"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
            />
            <Input
              label="Kata sandi"
              type="password"
              name="password"
              autoComplete="current-password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && (
              <p className="rounded-lg bg-danger-50 px-3 py-2 text-xs font-medium text-danger-600">
                {error}
              </p>
            )}
            <Button type="submit" block disabled={busy}>
              <LogIn className="size-4" />
              {busy ? 'Memproses…' : 'Masuk'}
            </Button>
          </form>
        </Card>

        <p className="mt-5 text-center text-sm text-slate-500">
          Belum punya akun?{' '}
          <Link to="/daftar" className="font-semibold text-brand-700 hover:underline">
            Daftar sekarang
          </Link>
        </p>
      </div>
    </div>
  )
}
