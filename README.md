# Topup Digems — Website Topup Game

Website topup game responsif (PC / tablet / mobile) dengan halaman utama, daftar semua game,
login/registrasi, dan pencatatan histori pembelian.

## Cara Menjalankan

Cukup buka `index.html` di browser, atau jalankan server statis agar semua aset ter-load:

```bash
python -m http.server 8080
# lalu buka http://localhost:8080
```

## Struktur File

```
├── index.html        # Halaman utama (slider, game hot, semua game ringkas)
├── games.html        # Semua game versi lengkap (kartu merah gradasi hitam)
├── payment.html      # ⭐ Halaman pembayaran — satu halaman untuk SEMUA game
├── login.html        # Login / daftar (via username ATAU email)
├── history.html      # Histori pembelian (butuh login)
├── css/style.css     # Seluruh styling
├── js/
│   ├── data.js       # ⭐ KONFIGURASI: nama situs, logo, slide, data game, paket, nomor WA
│   ├── api.js        # Lapisan integrasi API (aktifkan di sini)
│   ├── main.js       # Header, menu, login state, pencarian, modal topup, tombol WA
│   └── home.js / games.js / payment.js / login.js / history.js
└── assets/           # Gambar (logo, slide, gambar game) — ganti dengan gambar sendiri
```

## Kustomisasi

Semua pengaturan utama ada di **`js/data.js`**:

| Yang ingin diubah | Caranya |
|---|---|
| Logo (header & title) | Letakkan gambar di `assets/`, ubah `SITE.logo`. Header/footer memakai `assets/logo-title.png`; favicon tab browser memakai `assets/logo.svg` |
| Gambar slide | Letakkan gambar di `assets/`, ubah `SLIDES[].image` (tambah/hapus slide bebas) |
| Data game & harga | Edit `GAMES` (nama, deskripsi, gambar, kategori hot, daftar paket) |
| Paket tiap game | Setiap game punya **paket khusus** (nama item asli + harga, mis. Star Gems/FC Points/BCC). Tool `node tools/apply-packs.js` mengganti `defaultPacks(...)` generik menjadi paket eksplisit |
| Bundle & Pass | `GAMES[].bundles` = daftar bundle (mis. **Weekly Diamond Pass (WDP)**, Starlight Member, Battle Pass, Welkin Moon). Tampil sebagai section terpisah "Bundle & Pass" di modal & halaman payment dengan badge (Pass/Member/BP/Event). Kartu game di halaman Semua Game juga menampilkan badge **"N Bundle"** (🎫). Transaksi bundle ditandai `bundle: true` dan tampil dengan badge **🎫 Bundle** di Riwayat & dashboard admin. Sudah tersedia di **37 game** populer (MOBA, gacha, strategi) |
| Nomor WhatsApp admin | Ubah `SITE.whatsapp` (format internasional tanpa `+`, mis. `6281234567890`) |
| Judul situs | Ubah `SITE.name` dan tag `<title>` di tiap halaman HTML |

## Server Database Lengkap (server/server.js)

Server Node murni (tanpa dependency, memakai `node:sqlite` bawaan Node ≥ 22) yang menyajikan
website sekaligus REST API — **user, sesi/token, admin, dan transaksi SEMUA tersimpan di
SQLite** (`server/digems.db`), bukan cuma localStorage browser.

```bash
node server/server.js                 # → http://localhost:3000 (website + API)
ADMIN_PASSWORD=ganti-sandi node server/server.js   # ganti password admin (default admin123)
```

### Endpoint Auth (user)

| Method | Endpoint | Body | Respons |
|---|---|---|---|
| POST | `/api/auth/register` | `{ username, email, password }` | `{ ok, token, user, needsVerification }` — password ter-hash (sha256+salt), username & email **unik** (1 email = 1 akun) |
| POST | `/api/auth/login` | `{ identifier, password }` (username ATAU email) | `{ ok, token, user }` — `user.verified` = status verifikasi email |
| POST | `/api/auth/logout` | — (header token) | hapus sesi dari database |
| GET | `/api/auth/me` | — (header token) | `{ ok, user }` — validasi token + status `verified` |
| GET | `/api/auth/verify?token=` | — | **klik link dari email** → email jadi terverifikasi (halaman sukses) |
| POST | `/api/auth/resend` | `{ email }` | kirim ulang link verifikasi (token baru, berlaku 24 jam) |

### Verifikasi Email (kirim link otomatis)

Saat mendaftar, server membuat **token verifikasi** & mengirim **link ke email** pembeli —
ini membuktikan emailnya aktif DAN benar milik pendaftar (satu email hanya bisa dipakai satu
akun). Akun baru berstatus `verified: 0` sampai link diklik; halaman web menampilkan banner
"email belum diverifikasi" + tombol kirim ulang. Pengiriman email memakai **SMTP murni Node
(`server/mailer.js`, net + tls, tanpa dependency)**:

```bash
# Gmail — WAJIB App Password (bukan password biasa):
# 1. Aktifkan 2-Step Verification di akun Gmail
# 2. Buat App Password 16 karakter di https://myaccount.google.com/apppasswords
MAIL_USER=digemsmarket@gmail.com \
MAIL_PASS=xxxxxxxxxxxxxxxx \
node server/server.js
```

| Variabel | Default | Keterangan |
|---|---|---|
| `MAIL_USER` | kosong | email pengirim (mis. `digemsmarket@gmail.com`) — **wajib diisi** agar email terkirim |
| `MAIL_PASS` | kosong | **App Password** (bukan password login Gmail) |
| `MAIL_HOST` / `MAIL_PORT` | `smtp.gmail.com` / `587` | server SMTP; port `465` otomatis TLS langsung |
| `MAIL_FROM` / `MAIL_FROM_NAME` | `MAIL_USER` / `Topup Digems` | nama & alamat pengirim |
| `SITE_URL` | `http://localhost:3000` | URL publik website → dipakai di link verifikasi (di produksi isi domain, mis. `https://digems.com`) |

Tanpa `MAIL_USER`/`MAIL_PASS`, email **tidak dikirim** — link verifikasi dicetak di console
server & dikembalikan di respons register (`devVerifyUrl`) untuk mode pengembangan.

### Endpoint Transaksi

| Method | Endpoint | Keterangan |
|---|---|---|
| GET | `/api/games` | daftar game + harga (bila supplier aktif, harga supplier diterapkan server) |
| POST | `/api/purchase` | simpan transaksi — **wajib token user** (harus milik `uid`); bila supplier aktif, server langsung kirim topup |
| GET | `/api/history?uid=` | riwayat user — **wajib token user** milik `uid` |
| POST | `/api/purchase/confirm` · `/api/purchase/cancel` | ubah status (alur demo lama) |
| POST | `/api/transactions/sync` | terima batch outbox `[{ uid, t }]` — tanpa token (jalur pemulihan offline) |

### Endpoint Admin (token admin diverifikasi server)

| Method | Endpoint | Body | Respons |
|---|---|---|---|
| POST | `/api/admin/login` | `{ password }` | `{ token }` — token admin disimpan di tabel `sessions` (role `admin`) |
| GET | `/api/admin/transactions` | — (header `Authorization: Bearer <token>`) | `{ transactions: [...] }` — semua transaksi semua akun + `_uid` & `_username` |
| GET | `/api/admin/stats` | — | `{ users, unverified, transactions, waiting, revenue }` |
| POST | `/api/admin/transactions/confirm` | `{ id }` | `{ ok: true }` — status jadi Sukses |
| POST | `/api/admin/transactions/cancel` | `{ id, reason }` | `{ ok: true }` — status jadi Dibatalkan |
| GET | `/api/admin/supplier/status` | — | `{ enabled, baseUrl, testing, pollMs, pending }` |
| POST | `/api/admin/supplier/poll` | — | `{ ok, checked, updated, pending }` — paksa polling status supplier (bisa dari cron eksternal) |

Tanpa token admin yang valid, semua endpoint admin menolak dengan `401` — otorisasi dicek
**di server**, bukan di browser.

### Perilaku frontend (`js/api.js`)

- `API_CONFIG.enabled = true` & `baseUrl = http://localhost:3000/api` secara default →
  register/login/admin/riwayat semua lewat server database. Setelah login, token dikirim
  sebagai header `Authorization: Bearer <token>`.
- **Fallback otomatis:** bila server tidak terjangkau, login/register/admin jatuh ke mode
  lokal (`localStorage`) sehingga website tetap berfungsi; transaksi menunggu di outbox
  (`digems_outbox`) dan terkirim otomatis saat server online (di-flush saat halaman dimuat +
  tiap 20 detik).
- Respons `401` → token yang tidak valid dihapus otomatis.
- Password admin default `admin123` (fallback demo di `js/admin.js` juga `admin123`) — ganti
  lewat env `ADMIN_PASSWORD` saat menjalankan server.
- Untuk memakai backend lain: ubah `API_CONFIG.baseUrl` / `enabled` di `js/api.js` dan
  sesuaikan `API_CONFIG.endpoints` bila perlu.

## Integrasi API Supplier (Server-Side — Topup & Polling Status)

Topup dan pengecekan status transaksi ke **API supplier topup** (contoh: Digiflazz) kini dijalankan
**oleh server** (`server/server.js`), bukan browser — jadi **apikey supplier RAHASIA** tidak pernah
terkirim ke browser.

1. Daftar akun di supplier (mis. digiflazz.com), ambil **username** + **api key**
2. Nyalakan server dengan env kredensial supplier:
```bash
SUPPLIER_ENABLED=1 \
SUPPLIER_USERNAME=xxx \
SUPPLIER_APIKEY=xxx \
SUPPLIER_BASE_URL=https://api.digiflazz.com/v1 \
SUPPLIER_TESTING=1 \
SUPPLIER_POLL_MS=30000 \
node server/server.js
```
   (`SUPPLIER_TESTING=1` = mode uji coba, tidak memotong saldo; `SUPPLIER_POLL_MS` =
   interval polling status, default 30 detik)
3. Sesuaikan `SUPPLIER_GAME_MATCH` di `server/server.js` bila nama produk di supplier
   tidak cocok dengan game di `data.js`

Cara kerjanya (server-side — browser TIDAK memanggil API supplier sama sekali):

- **Harga game dari server**: `GET /api/games` menyajikan daftar game (`js/data.js` dibaca
  server). Bila supplier aktif, server mengambil price-list supplier, mencocokkan produk,
  dan menerapkan harga supplier — paket menjadi `[label, harga supplier, harga lokal]`.
  Browser tinggal menampilkan; **tidak ada apikey di kode klien**.
- **Topup**: saat `POST /api/purchase` diterima, **server** mencari produk di price-list
  supplier, mengirim topup ke endpoint `/transaction` (tanda tangan MD5
  `username + apikey + ref_id`), lalu menyimpan status asli (Sukses / Pending / Gagal),
  `refId`, dan `sn` langsung di database.
- **Polling status otomatis (cron interval)**: server menjalankan `pollSupplierStatus()`
  sekali saat start lalu **tiap `SUPPLIER_POLL_MS`** — semua transaksi berstatus
  Pending/Menunggu Pembayaran yang punya `refId` dicek ke supplier (`type: "status"`);
  bila **Sukses** → status otomatis jadi **Sukses** (catatan "Dikonfirmasi otomatis
  (supplier)"), bila **Gagal** → status **Gagal**. Tanpa keterlibatan browser/admin.
  Browser TIDAK lagi melakukan polling (`GameService.syncSupplierStatus` dinonaktifkan).
- **Cron eksternal / manual**: admin bisa memicu poll sekarang lewat
  `POST /api/admin/supplier/poll` (token admin wajib) — bisa juga dipanggil dari cron
  sistem. Status konfigurasi: `GET /api/admin/supplier/status`.
- **Fallback offline**: bila server database tidak terjangkau, transaksi disimpan lokal
  + outbox dan dikirim ke server begitu online — status menunggu konfirmasi admin
  (topup otomatis hanya terjadi lewat server agar apikey tetap rahasia).
- **Info margin (khusus admin)**: saat supplier aktif, halaman payment menampilkan kotak
  "Info Margin" di ringkasan pesanan — **Harga Supplier vs Harga Jual (lokal)** + selisih
  margin (Rp & %) — agar admin tahu untung/rugi tiap paket. Kotak ini **hanya tampil untuk
  admin** (login admin), pelanggan tidak melihat biaya modal. Harga yang dibayar pelanggan
  tetap harga jual lokal (`data.js`).

> **Keamanan**: `js/supplier.js` (yang dulu menyimpan apikey di browser) sudah dihapus.
> Kredensial supplier HANYA ada di env server (`SUPPLIER_USERNAME`/`SUPPLIER_APIKEY`).

## Pakai Gambar Asli Game

Gambar game tinggal diganti — dua cara:

1. **File lokal**: letakkan gambar asli (JPG/PNG) di `assets/games/` dengan nama yang sama
   (mis. `ml.jpg` menggantikan `ml.svg`), atau
2. **URL internet**: isi `GAMES[].image` dengan URL gambar asli (mis. dari situs resmi game),
   contoh: `image: "https://cdn.example.com/mlbb.jpg"`.

> Bila gambar rusak / URL mati / offline, website otomatis menampilkan placeholder
> (`assets/game-placeholder.svg`) — tidak akan tampil ikon gambar rusak.

## Halaman Pembayaran (payment.html)

Satu halaman pembayaran yang bisa dipakai untuk **semua game**:

- Game ditentukan dari URL: `payment.html?game=ml` (tombol **Topup** di setiap kartu game
otomatis mengarah ke sini). Tidak ada dropdown pilih game di halaman.
- **Kolom identitas menyesuaikan game** (diatur `GAME_FIELDS` di `js/payment.js`),
  dengan **validasi format real-time**:
  - UID (Genshin/HSR/ZZZ/WuWa/ToF/HI3) harus **angka**
  - Server ID (ML/HOK) harus **angka**
  - Riot ID (Valorant/Wild Rift) harus berisi **#**
  - Player Tag (CoC/Clash Royale) harus diawali **#**
  - Kolom invalid ditandai border merah + pesan error; tombol **Bayar Sekarang**
    baru aktif setelah semua kolom wajib valid.
  - **Panjang minimum** ikut divalidasi (properti `min`/`minMsg` di `GAME_FIELDS`):
    UID minimal 9 digit, ID Mobile Legends/HOK minimal 8 karakter,
    Server ID minimal 3 angka, ID/nickname FF & PUBG minimal 8 karakter, dst.
  - Default: satu kolom "ID / Username Game"
  - Mobile Legends & HOK: **ID Game + Server ID**
  - Genshin / HSR / ZZZ / WuWa / ToF / HI3: **UID**
  - Valorant & Wild Rift: **Riot ID** · Roblox: **Username** · CoC / Clash Royale: **Player Tag**
  - Free Fire / PUBG: **ID / Nickname**
- Pengguna memilih **paket** (atau nominal kustom) dan **metode pembayaran**
  (QRIS, Transfer BCA/BNI/Mandiri, OVO, DANA, GoPay, ShopeePay).
- Saat memilih **QRIS**, gambar QR tampil otomatis (ganti `assets/qris.svg`
  dengan QRIS asli milikmu).
- Metode **Transfer Bank & E-Wallet** menampilkan kartu **Nomor Tujuan** (a.n. pemilik)
  dengan tombol **Salin Nomor Rekening** — satu klik langsung tersalin ke clipboard
  (dengan fallback otomatis untuk browser lama).
- Ringkasan pesanan & total tampil di **bawah** form, real-time, lengkap dengan
  **pratinjau identitas** (mis. `ID: 123456789 · Server: 4321`) yang ikut ter-update
  saat mengetik sehingga pengguna bisa mengecek sebelum bayar.
- Belum login? Otomatis diarahkan ke `login.html?next=...` dan kembali lagi ke pembayaran
  setelah login.
- Transaksi tercatat di Riwayat beserta **metode pembayaran** yang dipilih.

Metode pembayaran (label, ikon, dan nomor rekening/instruksi) diatur di `PAY_METHODS`
dan kolom identitas per game di `GAME_FIELDS` — keduanya di bagian atas **`js/payment.js`**.
Sesuaikan nomor rekening & e-wallet milikmu, dan tambahkan kolom identitas bila ada game
yang butuh field khusus.

## Halaman Admin (terserah_admin.html)

Halaman admin untuk melihat & mengelola semua transaksi dari **semua akun**:

- Dilindungi password sederhana (default `admin123`, ubah di `ADMIN_PASSWORD` bagian atas `js/admin.js`)
- **Panel Status Supplier** — status AKTIF/nonaktif, mode testing/produksi, jumlah transaksi pending, dan waktu poll terakhir, plus tombol **Poll Sekarang** (memaksa server cek semua transaksi pending ke supplier; bisa juga dipanggil dari cron)
- Statistik: total akun, total transaksi, menunggu pembayaran, dan pendapatan (hanya transaksi Sukses)
- Tabel semua transaksi lintas akun (username, game, ID, paket, metode, nomor WA, status, tanggal)
- **Konfirmasi per transaksi** — tombol Konfirmasi pada yang menunggu, lalu tawarkan kirim notifikasi WA
- **Konfirmasi Semua** — konfirmasi semua yang menunggu sekaligus, lalu tawarkan kirim WA ke semua pembeli yang punya nomor
- Tombol **WA** di tiap baris untuk membuka notifikasi wa.me kapan saja
- **Ekspor CSV** — unduh semua transaksi ke file `.csv` (Tanggal, User, Game, ID Game, Paket, Harga, Metode, No. WA, Status, Ref ID, Catatan)
  lengkap dengan baris ringkasan **Total Semua** & **Total Sukses** di akhir file. Cocok dibuka di Excel/Google Sheets.
- **Laporan 7 hari terakhir** — bar chart pendapatan harian + tabel transaksi & pendapatan per hari
  (hanya transaksi Sukses yang dihitung sebagai pendapatan) + total mingguan.
- Link **Admin** ada di footer semua halaman; sesi admin disimpan di `sessionStorage` (hilang saat tab ditutup)

> Password admin hanya proteksi tampilan di sisi klien — untuk produksi, pindahkan otorisasi ke backend.

## Alur Status Pembayaran

Setiap transaksi baru masuk dengan status **Menunggu Pembayaran** (badge kuning ⏳):

1. Pengguna selesai bayar di `payment.html` → transaksi tercatat dengan status **Menunggu Pembayaran**
2. Di halaman Riwayat, admin menekan tombol **Konfirmasi Admin** pada transaksi yang menunggu
3. Status berubah menjadi **Sukses** (badge hijau ✅) dengan catatan "Dikonfirmasi admin"
3b. **Batalkan transaksi** — transaksi yang masih menunggu bisa dibatalkan (tombol **Batalkan**
    di Riwayat pengguna & dashboard admin) dengan alasan opsional → status **Dibatalkan** (🚫)
    dan catatan "Dibatalkan: <alasan>"
4. Bila pembeli mengisi **No. WhatsApp** saat pembayaran (opsional), muncul konfirmasi untuk
   **mengirim notifikasi WhatsApp** → membuka `wa.me/<nomor>` dengan pesan otomatis berisi
   game, paket, total, dan ID game. Nomor otomatis dinormalisasi (`08xx` → `628xx`).

Catatan:

- **Filter status** di halaman Riwayat (tab **Semua / Menunggu / Sukses / Dibatalkan**)
  menampilkan jumlah transaksi per status dan menyaring daftar secara instan —
  tombol Konfirmasi/Batalkan tetap berfungsi di dalam tampilan terfilter
- **Total Pengeluaran** di Riwayat hanya menjumlahkan transaksi berstatus **Sukses**
  (yang masih menunggu belum dihitung)
- Bila **API supplier aktif**, status mengikuti respons supplier (Sukses / Pending / Gagal)
  dan tidak perlu konfirmasi manual
- Logika konfirmasi ada di `GameService.confirmPurchase` (`js/api.js`) — pada produksi dengan
  backend, endpoint `/purchase/confirm` dipanggil; saat offline memakai localStorage

## Fitur

- Header putih **sticky** dengan font biru
- Body abu-abu dengan font putih; footer hitam dengan font putih ke abu-abu
- Responsif: di tablet/mobile **search bar** tampil penuh di baris bawah header (tanpa toggle menu)
- **Login/daftar** via username atau email + **histori pembelian** per akun
- **Slide gambar** otomatis (bisa diganti dengan self image)
- **Game Hot/Trending** (versi ringkas, scroll horizontal) & **Semua Game** (versi ringkas) + tombol **Lihat Semua Game**
- Halaman semua game versi lengkap: kartu **merah gradasi hitam**, nama game **biru**, deskripsi **hitam**
- **Search engine** (header + filter di halaman game, mendukung URL `?q=`)
- Tombol **Hubungi Admin** mengambang (kanan bawah) → langsung ke WhatsApp
"# hehehe" 
