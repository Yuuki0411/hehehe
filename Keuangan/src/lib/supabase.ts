import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

/**
 * Aplikasi tetap bisa dibangun/jalan sebelum Supabase dikonfigurasi;
 * `isConfigured` dipakai untuk menampilkan panduan setup daripada error.
 */
export const isConfigured = Boolean(url && anonKey)

export const supabase = createClient(
  url ?? 'https://placeholder.supabase.co',
  anonKey ?? 'placeholder-anon-key'
)
