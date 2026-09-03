/* ============================================================
   LAPISAN INTEGRASI API
   ------------------------------------------------------------
   Website terhubung ke SERVER DATABASE lokal (server/server.js)
   yang menyimpan SEMUA data (user, token/sesi, admin, transaksi)
   di SQLite. Setelah login, token otomatis disimpan & dikirim
   sebagai header Authorization: Bearer <token>.

   Saat server tidak terjangkau, semua fungsi otomatis jatuh ke
   penyimpanan lokal (localStorage) sehingga website tetap
   berfungsi penuh tanpa server — data transaksi menunggu di
   outbox dan terkirim ke database saat server online.

   Untuk memakai backend lain, ubah baseUrl / enabled:
     baseUrl: "https://api.digems.com/v1"
   ============================================================ */

const API_CONFIG = {
  // true = pakai server database lokal (node server/server.js)
  enabled: true,
  baseUrl: "http://localhost:3000/api",
  endpoints: {
    games: "/games",
    login: "/auth/login",
    register: "/auth/register",
    logout: "/auth/logout",
    me: "/auth/me",
    verify: "/auth/verify",
    resend: "/auth/resend",
    sendCode: "/auth/send-code",
    updatePhoto: "/auth/update-photo",
    updateUsername: "/auth/update-username",
    updatePassword: "/auth/update-password",
    history: "/history",
    purchase: "/purchase",
    cancel: "/purchase/cancel",
    // endpoint admin (backend wajib memverifikasi token admin di server)
    adminLogin: "/admin/login",
    adminTransactions: "/admin/transactions",
    adminStats: "/admin/stats",
    adminConfirm: "/admin/transactions/confirm",
    adminCancel: "/admin/transactions/cancel",
    adminSupplierStatus: "/admin/supplier/status",
    adminSupplierPoll: "/admin/supplier/poll",
  },
};

/* ---------- Sinkronisasi transaksi ke DATABASE server ----------
   Berbeda dari API_CONFIG (yang mengontrol login/admin/dll) — jalur ini
   KHUSUS mengirim hasil transaksi ke database (server/server.js, SQLite).
   Setiap pembelian masuk outbox lokal lalu otomatis dikirim ke server
   database. Bila server mati, transaksi menunggu di outbox dan terkirim
   otomatis saat server online (di-flush saat halaman dimuat + tiap 20 dtk). */
const DB_SYNC = {
  enabled: true,                        // true = kirim transaksi ke database
  baseUrl: "http://localhost:3000/api", // server database (node server/server.js)
};

async function dbSyncRequest(path, body) {
  if (!DB_SYNC.enabled) return null;
  try {
    const res = await fetch(DB_SYNC.baseUrl + path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body || {}),
    });
    return res.ok ? await res.json() : null;
  } catch (err) {
    console.warn("[DB Sync] Server database tidak terjangkau:", err.message);
    return null;
  }
}

/* ---------- Fungsi dasar request API ----------
   Kembalikan null bila server TIDAK terjangkau (fallback lokal).
   Bila server merespons error (401/400/404...), kembalikan body
   { ok:false, error } agar pesan error server dipakai. */
async function apiRequest(path, method = "GET", body = null) {
  if (!API_CONFIG.enabled) return null;

  const headers = { "Content-Type": "application/json" };
  const token = localStorage.getItem("digems_token");
  if (token) headers["Authorization"] = "Bearer " + token;

  try {
    const res = await fetch(API_CONFIG.baseUrl + path, {
      method,
      headers,
      body: body ? JSON.stringify(body) : null,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      if (res.status === 401) localStorage.removeItem("digems_token");
      return typeof data.error === "string" ? data : { ok: false, error: "API error: " + res.status };
    }
    return data;
  } catch (err) {
    console.warn("[API] Gagal terhubung ke backend:", err.message);
    return null; // server tidak terjangkau → caller pakai fallback lokal
  }
}

/* ---------- Request API admin (token admin terpisah) ---------- */
async function apiAdminRequest(path, method = "GET", body = null) {
  if (!API_CONFIG.enabled) return null;

  const headers = { "Content-Type": "application/json" };
  const token = localStorage.getItem("digems_admin_token");
  if (token) headers["Authorization"] = "Bearer " + token;

  try {
    const res = await fetch(API_CONFIG.baseUrl + path, {
      method,
      headers,
      body: body ? JSON.stringify(body) : null,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      if (res.status === 401) {
        // token admin tidak valid / kedaluwarsa → logout otomatis
        localStorage.removeItem("digems_admin_token");
        sessionStorage.removeItem("digems_admin");
      }
      return typeof data.error === "string" ? data : { ok: false, error: "API admin error: " + res.status };
    }
    return data;
  } catch (err) {
    console.warn("[API Admin] Gagal terhubung ke backend:", err.message);
    return null; // server tidak terjangkau → caller pakai fallback lokal
  }
}

/* ---------- Penyimpanan lokal (fallback) ---------- */
const LocalStore = {
  _usersKey: "digems_users",
  _sessionKey: "digems_session",
  _historyKey: "digems_history",
  _outboxKey: "digems_outbox",

  getOutbox() {
    return JSON.parse(localStorage.getItem(this._outboxKey) || "[]");
  },
  saveOutbox(items) {
    localStorage.setItem(this._outboxKey, JSON.stringify(items));
  },
  pushOutbox(uid, t) {
    const items = this.getOutbox();
    items.push({ uid, t });
    this.saveOutbox(items);
  },

  getUsers() {
    return JSON.parse(localStorage.getItem(this._usersKey) || "[]");
  },
  saveUsers(users) {
    localStorage.setItem(this._usersKey, JSON.stringify(users));
  },
  getSession() {
    return JSON.parse(localStorage.getItem(this._sessionKey) || "null");
  },
  setSession(session) {
    localStorage.setItem(this._sessionKey, JSON.stringify(session));
  },
  clearSession() {
    localStorage.removeItem(this._sessionKey);
  },
  getHistory() {
    return JSON.parse(localStorage.getItem(this._historyKey) || "{}");
  },
  saveHistory(map) {
    localStorage.setItem(this._historyKey, JSON.stringify(map));
  },
};

/* ---------- Service terpadu (pakai API bila aktif) ---------- */
const GameService = {
  /* Ambil daftar game.
     Server menyajikan GET /api/games — bila supplier aktif, harga supplier
     sudah diterapkan DI SERVER (apikey tidak pernah ada di browser).
     Prioritas: API backend → harga lokal (fallback offline). */
  async getGames() {
    const data = await apiRequest(API_CONFIG.endpoints.games);
    if (data && data.games) return data.games;
    return GAMES;
  },

  /* Login via username ATAU email.
     Prioritas: server database → pesan error server dipakai.
     Bila server TIDAK terjangkau → fallback akun lokal. */
  async login(identifier, password) {
    const data = await apiRequest(API_CONFIG.endpoints.login, "POST", { identifier, password });
    if (data) {
      if (data.token) {
        localStorage.setItem("digems_token", data.token);
        LocalStore.setSession({
          uid: data.user.id,
          username: data.user.username,
          email: data.user.email,
          verified: data.user.verified ? 1 : 0,
          photo: data.user.photo || "",
        });
        return { ok: true, user: data.user, error: "", needsVerification: !data.user.verified };
      }
      if (data.ok === false) return { ok: false, user: null, error: data.error || "Login gagal." };
    }

    // Fallback lokal (server tidak terjangkau)
    const user = LocalStore.getUsers().find(
      (u) => (u.username === identifier || u.email === identifier) && u.password === password
    );
    if (!user) return { ok: false, user: null, error: "Username/email atau password salah." };
    LocalStore.setSession({ uid: user.id, username: user.username, email: user.email, verified: 1 });
    return { ok: true, user, error: "" };
  },

  /* Registrasi akun baru — user & sesi disimpan di database server.
     Server membuat token verifikasi & mengirim LINK VERIFIKASI ke email
     (bukti email aktif & milik pendaftar). */
  async register(username, email, password) {
    const data = await apiRequest(API_CONFIG.endpoints.register, "POST", { username, email, password });
    if (data) {
      if (data.token) {
        localStorage.setItem("digems_token", data.token);
        LocalStore.setSession({
          uid: data.user.id,
          username: data.user.username,
          email: data.user.email,
          verified: data.user.verified ? 1 : 0,
          photo: data.user.photo || "",
        });
        return {
          ok: true,
          user: data.user,
          error: "",
          needsVerification: !!data.needsVerification,
          mailSent: !!data.mailSent,
          devVerifyUrl: data.devVerifyUrl || "",
        };
      }
      if (data.ok === false) return { ok: false, user: null, error: data.error || "Registrasi gagal." };
    }

    // Fallback lokal (server tidak terjangkau)
    const users = LocalStore.getUsers();
    if (users.some((u) => u.username === username)) return { ok: false, error: "Username sudah dipakai." };
    if (users.some((u) => u.email === email)) return { ok: false, error: "Email sudah terdaftar." };
    const user = { id: "u" + Date.now(), username, email, password };
    users.push(user);
    LocalStore.saveUsers(users);
    LocalStore.setSession({ uid: user.id, username: user.username, email: user.email, verified: 1 });
    return { ok: true, user, error: "" };
  },

  /* Kirim ulang link verifikasi email */
  async resendVerification(email) {
    const data = await apiRequest(API_CONFIG.endpoints.resend, "POST", { email });
    if (data && data.ok) {
      return { ok: true, mailSent: !!data.mailSent, devVerifyUrl: data.devVerifyUrl || "" };
    }
    if (data && data.ok === false) return { ok: false, error: data.error || "Gagal mengirim ulang." };
    return { ok: false, error: "Server tidak terjangkau." };
  },

  getSession() {
    return LocalStore.getSession();
  },

  /* Ambil data user dari server (token aktif) & perbarui status
     verifikasi email di sesi lokal. Return null bila offline. */
  async me() {
    const data = await apiRequest(API_CONFIG.endpoints.me);
    if (data && data.ok && data.user) {
      const s = LocalStore.getSession();
      if (s) {
        LocalStore.setSession({ ...s, verified: data.user.verified ? 1 : 0, photo: data.user.photo || "" });
      }
      return data.user;
    }
    return null;
  },

  logout() {
    // hapus sesi di server (fire-and-forget) lalu bersihkan lokal
    if (API_CONFIG.enabled) apiRequest(API_CONFIG.endpoints.logout, "POST", {});
    LocalStore.clearSession();
    localStorage.removeItem("digems_token");
  },

  /* Kirim kode verifikasi (OTP 6 digit) ke email user untuk perubahan
     username / password. Tanpa SMTP → kode dikembalikan (mode pengembangan). */
  async sendChangeCode() {
    const data = await apiRequest(API_CONFIG.endpoints.sendCode, "POST", {});
    if (data) {
      if (data.ok) return { ok: true, mailSent: !!data.mailSent, devCode: data.devCode || "" };
      return { ok: false, error: data.error || "Gagal mengirim kode." };
    }
    // Fallback lokal (server tidak terjangkau)
    const session = LocalStore.getSession();
    if (!session) return { ok: false, error: "Sesi tidak valid." };
    const users = LocalStore.getUsers();
    const u = users.find((x) => x.id === session.uid);
    if (!u) return { ok: false, error: "User tidak ditemukan." };
    const code = String(Math.floor(100000 + Math.random() * 900000));
    u.otp = code;
    u.otpExpires = Date.now() + 10 * 60 * 1000;
    LocalStore.saveUsers(users);
    return { ok: true, mailSent: false, devCode: code };
  },

  /* Ganti foto profil (data URL). Tidak butuh verifikasi email. */
  async updatePhoto(photo) {
    const data = await apiRequest(API_CONFIG.endpoints.updatePhoto, "POST", { photo });
    if (data) {
      if (data.ok) {
        const s = LocalStore.getSession();
        if (s) LocalStore.setSession({ ...s, photo: data.user.photo || "" });
        return { ok: true, user: data.user };
      }
      return { ok: false, error: data.error || "Gagal menyimpan foto." };
    }
    // Fallback lokal
    const s = LocalStore.getSession();
    if (!s) return { ok: false, error: "Sesi tidak valid." };
    const users = LocalStore.getUsers();
    const u = users.find((x) => x.id === s.uid);
    if (u) { u.photo = photo; LocalStore.saveUsers(users); }
    LocalStore.setSession({ ...s, photo });
    return { ok: true };
  },

  /* Ganti username — wajib kode verifikasi email. */
  async updateUsername(newUsername, code) {
    const data = await apiRequest(API_CONFIG.endpoints.updateUsername, "POST", { newUsername, code });
    if (data) {
      if (data.ok) {
        const s = LocalStore.getSession();
        if (s) LocalStore.setSession({ ...s, username: data.user.username });
        return { ok: true, user: data.user };
      }
      return { ok: false, error: data.error || "Gagal mengganti username." };
    }
    // Fallback lokal
    const s = LocalStore.getSession();
    if (!s) return { ok: false, error: "Sesi tidak valid." };
    const users = LocalStore.getUsers();
    const u = users.find((x) => x.id === s.uid);
    if (!u) return { ok: false, error: "User tidak ditemukan." };
    if (!u.otp || u.otp !== code) return { ok: false, error: "Kode verifikasi salah." };
    if (Date.now() > (u.otpExpires || 0)) return { ok: false, error: "Kode verifikasi kedaluwarsa. Kirim ulang kode." };
    if (users.some((x) => x.username === newUsername && x.id !== s.uid)) return { ok: false, error: "Username sudah dipakai." };
    u.username = newUsername;
    u.otp = null;
    LocalStore.saveUsers(users);
    LocalStore.setSession({ ...s, username: newUsername });
    return { ok: true };
  },

  /* Ganti password — wajib password lama + kode verifikasi email. */
  async updatePassword(oldPassword, newPassword, code) {
    const data = await apiRequest(API_CONFIG.endpoints.updatePassword, "POST", { oldPassword, newPassword, code });
    if (data) {
      if (data.ok) return { ok: true };
      return { ok: false, error: data.error || "Gagal mengganti password." };
    }
    // Fallback lokal
    const s = LocalStore.getSession();
    if (!s) return { ok: false, error: "Sesi tidak valid." };
    const users = LocalStore.getUsers();
    const u = users.find((x) => x.id === s.uid);
    if (!u) return { ok: false, error: "User tidak ditemukan." };
    if (u.password !== oldPassword) return { ok: false, error: "Password saat ini salah." };
    if (!u.otp || u.otp !== code) return { ok: false, error: "Kode verifikasi salah." };
    if (Date.now() > (u.otpExpires || 0)) return { ok: false, error: "Kode verifikasi kedaluwarsa. Kirim ulang kode." };
    u.password = newPassword;
    u.otp = null;
    LocalStore.saveUsers(users);
    return { ok: true };
  },

  /* Histori pembelian user yang sedang login */
  async getHistory(uid) {
    const data = await apiRequest(API_CONFIG.endpoints.history + "?uid=" + uid);
    if (data && data.history) return data.history;
    return LocalStore.getHistory()[uid] || [];
  },

  /* Simpan transaksi pembelian.
     Server yang mengirim topup ke supplier (POST /api/purchase) dan
     menyimpan status/refId — browser tidak memegang apikey supplier.
     Bila server tidak terjangkau, transaksi disimpan lokal + outbox dan
     dikirim ke server saat online (status menunggu konfirmasi admin). */
  async createPurchase(uid, purchase) {
    const data = await apiRequest(API_CONFIG.endpoints.purchase, "POST", { uid, ...purchase });
    if (data && data.ok) return true;

    const id = "p" + Date.now() + Math.floor(Math.random() * 1000);
    const tx = { id, date: new Date().toISOString(), ...purchase };
    const map = LocalStore.getHistory();
    if (!map[uid]) map[uid] = [];
    map[uid].unshift(tx);
    LocalStore.saveHistory(map);

    // kirim ke database server (outbox → auto-flush). Transaksi tetap
    // tersimpan lokal walau server mati; akan terkirim saat server online.
    LocalStore.pushOutbox(uid, tx);
    GameService.flushOutbox();
    return true;
  },

  /* Status transaksi supplier kini dipolling OTOMATIS OLEH SERVER
     (cron interval di server/server.js → pollSupplierStatus), bukan dari
     browser. Riwayat selalu diambil dari database server, jadi status
     terbaru (Sukses/Gagal dari supplier) otomatis tampil saat halaman
     dimuat/direfresh. Fungsi ini dipertahankan agar pemanggil lama
     (history.js / admin.js) tetap berjalan — tidak melakukan apa-apa. */
  async syncSupplierStatus() {
    return 0;
  },

  /* Kirim semua transaksi yang masih di outbox (belum masuk database)
     ke server database. Dipanggil otomatis setelah createPurchase, saat
     halaman dimuat, dan tiap 20 detik — transaksi PASTI masuk database
     bila server aktif. */
  async flushOutbox() {
    const items = LocalStore.getOutbox();
    if (!items.length) return 0;
    const data = await dbSyncRequest("/transactions/sync", { items });
    if (data && data.ok) {
      // hanya buang yang sudah berhasil disimpan server
      const savedCount = data.saved || items.length;
      const rest = items.slice(savedCount);
      LocalStore.saveOutbox(rest);
      return savedCount;
    }
    return 0;
  },

  /* Konfirmasi admin: ubah status transaksi menjadi Sukses */
  async confirmPurchase(uid, id) {
    const data = await apiRequest(API_CONFIG.endpoints.purchase + "/confirm", "POST", { uid, id });
    if (data && data.ok) return true;

    const map = LocalStore.getHistory();
    const item = (map[uid] || []).find((p) => p.id === id);
    if (!item) return false;
    item.status = "Sukses";
    item.note = "Dikonfirmasi admin";
    item.confirmedAt = new Date().toISOString();
    LocalStore.saveHistory(map);
    return true;
  },

  /* Batalkan transaksi yang masih menunggu: status Dibatalkan + alasan */
  async cancelPurchase(uid, id, reason) {
    const data = await apiRequest(API_CONFIG.endpoints.cancel, "POST", { uid, id, reason });
    if (data && data.ok) return true;

    const map = LocalStore.getHistory();
    const item = (map[uid] || []).find((p) => p.id === id);
    if (!item) return false;
    item.status = "Dibatalkan";
    item.note = reason ? "Dibatalkan: " + reason : "Dibatalkan";
    item.cancelledAt = new Date().toISOString();
    LocalStore.saveHistory(map);
    return true;
  },

  clearHistory(uid) {
    const map = LocalStore.getHistory();
    delete map[uid];
    LocalStore.saveHistory(map);
  },
};

/* ---------- Admin: otorisasi & data transaksi ----------
   Saat API_CONFIG.enabled = true, login admin diverifikasi oleh SERVER
   (token admin disimpan, semua data transaksi & konfirmasi lewat backend).
   Saat nonaktif, memakai localStorage — hanya untuk mode demo/offline.
   Password fallback demo diambil dari ADMIN_PASSWORD di js/admin.js. */
const AdminService = {
  /* Login admin. Server memverifikasi password & menyimpan token admin
     di database (tabel sessions, role='admin'). Bila server tidak
     terjangkau, pakai fallback demo lokal (ADMIN_PASSWORD). */
  async login(password) {
    if (API_CONFIG.enabled) {
      const data = await apiAdminRequest(API_CONFIG.endpoints.adminLogin, "POST", { password });
      if (data) {
        if (data.token) {
          localStorage.setItem("digems_admin_token", data.token);
          sessionStorage.setItem("digems_admin", "1");
          return { ok: true };
        }
        if (data.ok === false) return { ok: false, error: data.error || "Password admin salah." };
      }
      // data === null → server tidak terjangkau → coba fallback demo
    }

    const expected = typeof ADMIN_PASSWORD !== "undefined" ? ADMIN_PASSWORD : "admin123";
    if (password === expected) {
      sessionStorage.setItem("digems_admin", "1");
      return { ok: true };
    }
    return { ok: false, error: "Password admin salah." };
  },

  isLoggedIn() {
    if (API_CONFIG.enabled) {
      return !!localStorage.getItem("digems_admin_token") || sessionStorage.getItem("digems_admin") === "1";
    }
    return sessionStorage.getItem("digems_admin") === "1";
  },

  logout() {
    localStorage.removeItem("digems_admin_token");
    sessionStorage.removeItem("digems_admin");
  },

  /* Semua transaksi semua akun — dari database server (token admin
     diverifikasi server). Bila server tidak terjangkau, tampilkan
     transaksi lokal (demo/offline). */
  async getTransactions() {
    if (API_CONFIG.enabled) {
      const data = await apiAdminRequest(API_CONFIG.endpoints.adminTransactions);
      if (data && Array.isArray(data.transactions)) return data.transactions;
      if (data && data.ok === false) return [];
    }
    return collectAllTransactions();
  },

  /* Statistik ringkas — dari database server, atau dihitung lokal saat offline */
  async getStats() {
    if (API_CONFIG.enabled) {
      const data = await apiAdminRequest(API_CONFIG.endpoints.adminStats);
      if (data && data.ok) {
        return {
          users: Number(data.users || 0),
          transactions: Number(data.transactions || 0),
          waiting: Number(data.waiting || 0),
          revenue: Number(data.revenue || 0),
        };
      }
      if (data && data.ok === false) return { users: 0, transactions: 0, waiting: 0, revenue: 0 };
    }

    const rows = collectAllTransactions();
    return {
      users: LocalStore.getUsers().length,
      transactions: rows.length,
      waiting: rows.filter((r) => r.status === "Menunggu Pembayaran").length,
      revenue: rows.reduce((s, r) => s + (r.status === "Sukses" ? Number(r.price || 0) : 0), 0),
    };
  },

  /* Status konfigurasi supplier (aktif/testing/pending/last poll) — dari server.
     Mengembalikan null bila server tidak terjangkau. */
  async getSupplierStatus() {
    if (API_CONFIG.enabled) {
      const data = await apiAdminRequest(API_CONFIG.endpoints.adminSupplierStatus);
      if (data && data.ok) return data;
    }
    return null;
  },

  /* Paksa polling status supplier SEKARANG (server mengecek semua transaksi
     pending ke supplier lalu memperbarui database). */
  async pollSupplier() {
    if (API_CONFIG.enabled) {
      const data = await apiAdminRequest(API_CONFIG.endpoints.adminSupplierPoll, "POST", {});
      if (data && data.ok) return data;
    }
    return null;
  },

  /* Konfirmasi satu transaksi di database (token admin diverifikasi server) */
  async confirmTransaction(uid, id) {
    if (API_CONFIG.enabled) {
      const data = await apiAdminRequest(API_CONFIG.endpoints.adminConfirm, "POST", { uid, id });
      if (data && data.ok) return true;
      if (data && data.ok === false) return false;
      return GameService.confirmPurchase(uid, id); // server mati → lokal
    }
    return GameService.confirmPurchase(uid, id);
  },

  /* Batalkan satu transaksi di database */
  async cancelTransaction(uid, id, reason) {
    if (API_CONFIG.enabled) {
      const data = await apiAdminRequest(API_CONFIG.endpoints.adminCancel, "POST", { uid, id, reason });
      if (data && data.ok) return true;
      if (data && data.ok === false) return false;
      return GameService.cancelPurchase(uid, id, reason); // server mati → lokal
    }
    return GameService.cancelPurchase(uid, id, reason);
  },
};

/* Gabungkan transaksi semua akun + username (fallback demo) */
function collectAllTransactions() {
  const users = LocalStore.getUsers();
  const userMap = {};
  users.forEach((u) => { userMap[u.id] = u; });

  const histMap = LocalStore.getHistory();
  const rows = [];
  Object.keys(histMap).forEach((uid) => {
    (histMap[uid] || []).forEach((it) => {
      rows.push({
        ...it,
        _uid: uid,
        _username: userMap[uid] ? userMap[uid].username : "(akun dihapus)",
      });
    });
  });
  rows.sort((a, b) => new Date(b.date) - new Date(a.date));
  return rows;
}
