export function friendlyMessage(err: unknown): string {
  const raw =
    typeof err === 'object' && err !== null && 'message' in err
      ? String((err as { message: unknown }).message)
      : String(err ?? '')
  const m = raw.toLowerCase()
  if (m.includes('failed to fetch') || m.includes('networkerror'))
    return 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.'
  if (m.includes('row-level security'))
    return 'Sesi Anda telah berakhir. Silakan keluar lalu masuk kembali.'
  if (m.includes('profiles_username_key'))
    return 'Username sudah dipakai orang lain. Pilih yang lain.'
  if (m.includes('duplicate key'))
    return 'Data dengan nama yang sama sudah ada.'
  if (m.includes('violates check constraint') && m.includes('amount'))
    return 'Nominal harus lebih besar dari nol.'
  if (m.includes('characters long')) return 'Catatan terlalu panjang (maksimal 300 karakter).'
  if (
    m.includes('violates foreign key constraint') &&
    m.includes('transactions_wallet_id_fkey')
  )
    return 'Dompet tidak bisa dihapus karena masih dipakai transaksi. Pindahkan atau hapus dulu transaksinya.'
  if (m.includes('could not find the table') && m.includes('comparison_notes'))
    return 'Fitur memo belum aktif: jalankan isi supabase/migration-1-comparison-notes.sql di SQL Editor Supabase lalu muat ulang halaman.'
  if (m.includes('could not find the table') && m.includes('wallets'))
    return 'Fitur dompet belum aktif: jalankan isi supabase/migration-2-wallets.sql di SQL Editor Supabase lalu muat ulang halaman.'
  return raw || 'Terjadi kesalahan. Coba lagi.'
}
