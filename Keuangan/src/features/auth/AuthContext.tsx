import { createContext, useContext, useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import type { ReactNode } from 'react'
import { supabase } from '../../lib/supabase'
import { queryClient } from '../../lib/query'

interface AuthValue {
  session: Session | null
  status: 'loading' | 'authed' | 'anon'
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [status, setStatus] = useState<AuthValue['status']>('loading')

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setStatus(data.session ? 'authed' : 'anon')
    })

    const { data } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
      setStatus(s ? 'authed' : 'anon')
    })
    return () => data.subscription.unsubscribe()
  }, [])

  async function signOut() {
    await supabase.auth.signOut()
    queryClient.clear()
  }

  return (
    <AuthContext.Provider value={{ session, status, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth harus dipakai di dalam AuthProvider')
  return ctx
}

/** Terjemahkan pesan error Supabase ke bahasa Indonesia yang ramah. */
export function authErrorMessage(rawMessage: string | undefined): string {
  const m = (rawMessage ?? '').toLowerCase()
  if (m.includes('invalid login credentials'))
    return 'Username/email atau kata sandi salah.'
  if (m.includes('email not confirmed'))
    return 'Akun belum dikonfirmasi. Cek kotak masuk email Anda.'
  if (m.includes('already registered')) return 'Email ini sudah terdaftar. Coba masuk.'
  if (m.includes('database error saving new user'))
    return 'Username sudah dipakai orang lain. Pilih yang lain.'
  if (m.includes('rate limit') || m.includes('too many requests'))
    return 'Terlalu banyak percobaan. Tunggu beberapa saat lalu coba lagi.'
  if (m.includes('password should be'))
    return 'Kata sandi minimal 6 karakter.'
  if (m.includes('valid email')) return 'Format email tidak valid.'
  if (
    m.includes('fetch failed') ||
    m.includes('networkerror') ||
    m.includes('failed to fetch') ||
    m.includes('failed to send a request to the edge function')
  )
    return 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.'
  return rawMessage || 'Terjadi kesalahan. Coba lagi.'
}
