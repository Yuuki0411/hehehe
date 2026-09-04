# Catatan Keuangan

Aplikasi pencatatan keuangan pribadi (PWA) — bisa di-install ke layar utama
Android & iPhone, dengan sistem login Supabase sehingga data Anda tersedia di
perangkat mana pun. Fitur: transaksi pemasukan/pengeluaran, kategori,
rekap & grafik statistik harian / mingguan / bulanan.

## Setup (±10 menit, sekali saja)

### 1. Buat proyek Supabase

1. Daftar gratis di <https://supabase.com>, klik **New project**.
2. Setelah proyek jadi, buka **SQL Editor → New query**.
3. Salin seluruh isi file [`supabase/schema.sql`](supabase/schema.sql),
   tempel, lalu klik **Run**. Ini membuat tabel + keamanan per-pengguna +
   kategori default otomatis untuk setiap pendaftar baru.

> Opsional: agar bisa langsung masuk tanpa email verifikasi, buka
> **Authentication → Providers → Email**, matikan *Confirm email*.

### 2. Isi kredensial

```bash
cp .env.example .env
```

Lalu isi `.env` dari dashboard Supabase (**Settings → API**):

- `VITE_SUPABASE_URL` → Project URL
- `VITE_SUPABASE_ANON_KEY` → anon public key

### 3. Jalankan

```bash
npm install
npm run dev      # mode pengembangan di http://localhost:5173
npm run build    # build produksi ke folder dist/
npm run preview  # pratinjau hasil build
```

Buka browser, daftar akun baru (masuk ke folder inbox email utk verifikasi bila
aktif), lalu mulai mencatat.

## Install ke HP

Setelah aplikasi tersedia lewat URL (lokal tidak cukup karena PWA butuh HTTPS):

- **Android (Chrome)**: buka URL → menu ⋮ → **Tambahkan ke layar utama**
- **iPhone/iPad (Safari)**: buka URL → tombol Bagikan → **Tambahkan ke Layar Utama**

## Deploy gratis agar bisa diakses dari mana pun

- **Netlify**: push repo ini ke GitHub lalu hubungkan di netlify.com
  (konfigurasi `netlify.toml` sudah disiapkan), atau drag-and-drop folder
  `dist/` setelah `npm run build` ke app.netlify.com/drop.
- Jangan lupa tambahkan `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY`
  pada pengaturan environment variables Netlify.

Juga tambahkan URL domain hasil deploy ke **Authentication → URL Configuration
→ Site URL** di Supabase agar link konfirmasi email mengarah ke sana.

## Integrasi dengan website topup Digems

Pemasukan dari toko topup (folder induk `WEB`) bisa masuk ke sini lewat dua jalur:

### 1. Impor manual (di aplikasi)

Halaman **Transaksi** → tombol ikon unggah di kanan atas → pilih file CSV hasil
**export halaman admin Digems** (`Laporan-Transaksi-Digems-*.csv`). Baris
berstatus **Sukses** menjadi pemasukan (kategori `Topup Game (Digems)` dibuat
otomatis bila belum ada); baris Menunggu/Dibatalkan diabaikan. Ada pratinjau
sebelum disimpan, jadi tidak akan menambah data tanpa persetujuan.

### 2. Sinkronisasi otomatis (dari server Digems)

`server/server.js` di website topup sudah punya pengirim otomatis: setiap
transaksi yang statusnya jadi **Sukses** (konfirmasi admin / auto polling
supplier) langsung dikirim ke Supabase sebagai pemasukan. Aktifkan dengan env
berikut saat menjalankan server Digems:

```bash
KEUANGAN_SUPABASE_URL=https://xxxx.supabase.co \
KEUANGAN_SUPABASE_SERVICE_KEY=eyJ... \   # service_role key — RAHASIA
KEUANGAN_OWNER_USER_ID=<id akun (auth.users.id) pemilik catatan keuangan ini> \
node server/server.js
```

Opsional: `KEUANGAN_CATEGORY_NAME` (default `Topup Game (Digems)`) dan
`KEUANGAN_WALLET_NAME` (default `Kas`, dipakai bila akun belum punya dompet).
Baris identik (catatan + nominal + tanggal sama) dilewati, sehingga impor
manual dan sinkronisasi otomatis tidak menghasilkan catatan dobel.

> Cara ambil `KEUANGAN_OWNER_USER_ID`: dashboard Supabase → **Authentication →
> Users** → klik email akun ini → salin UUID di kolom **User ID**. Jangan
> gunakan anon key sebagai service key, dan jangan commit service key ke git.

## Struktur singkat

```
supabase/schema.sql   skema database (tempel ke SQL Editor)
src/features/         auth, dashboard rekap, transaksi, kategori, profil
src/utils/            format rupiah/tanggal dan agregasi statistik
scripts/generate-icons.mjs   pembuatan ikon PWA dari master.png
```
