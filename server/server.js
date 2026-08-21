/* ============================================================
   SERVER DATABASE TOPUP DIGEMS
   ------------------------------------------------------------
   Server HTTP murni Node.js (TANPA dependency npm) yang:
   1. Menyajikan file statis website (index.html, css, js, assets)
   2. Menyediakan REST API lengkap — user, sesi/token, admin,
      dan transaksi SEMUA tersimpan di database SQLite
      (file server/digems.db), bukan cuma localStorage browser.

   JALANKAN:
     node server/server.js          → http://localhost:3000
     (opsional) PORT=8080 node server/server.js
     (opsional) ADMIN_PASSWORD=xxx node server/server.js   # password admin

   Endpoint API (prefix /api):
     --- AUTH (user) ---
     POST /api/auth/register             → daftar akun  { username, email, password }
                                          (kirim link verifikasi email otomatis)
     POST /api/auth/login                → login (username/email) { identifier, password }
     POST /api/auth/logout               → hapus sesi (token di header Authorization)
     GET  /api/auth/me                   → info user dari token
     GET  /api/auth/verify?token=...     → verifikasi email (klik link dari email)
     POST /api/auth/resend               → kirim ulang link verifikasi { email }

     --- TRANSAKSI (token user wajib untuk history & purchase) ---
     POST /api/purchase                  → simpan transaksi baru  { uid, ...purchase }
     GET  /api/history?uid=...           → riwayat satu user (token harus milik uid)
     POST /api/purchase/confirm          → ubah status jadi Sukses { uid, id }
     POST /api/purchase/cancel           → ubah status jadi Dibatalkan { uid, id, reason }
     POST /api/transactions/sync         → kirim batch transaksi dari outbox [{ uid, t }]
                                         (jalur pemulihan offline — tanpa token)

     --- ADMIN (token admin wajib, diverifikasi di server) ---
     POST /api/admin/login               → login admin { password } → token admin
     GET  /api/admin/transactions        → semua transaksi semua akun
     GET  /api/admin/stats               → ringkasan statistik
     POST /api/admin/transactions/confirm → konfirmasi jadi Sukses { id }
     POST /api/admin/transactions/cancel  → batalkan { id, reason }
     GET  /api/admin/supplier/status      → status konfigurasi & polling supplier
     POST /api/admin/supplier/poll        → paksa polling status supplier (cron eksternal)

     --- SUPPLIER (server-side) ---
     Topup dikirim server saat POST /api/purchase (bila SUPPLIER_ENABLED=1)
     Status transaksi dipolling otomatis (setInterval) + bisa dipicu manual

     --- LAINNYA ---
     GET  /api/health                    → status server + jumlah transaksi
   ============================================================ */

const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const vm = require("vm");
const { DatabaseSync } = require("node:sqlite");

// Password admin server (default admin123, bisa diganti lewat env)
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

/* ---------- Email verifikasi (SMTP) ----------
   Agar link verifikasi BENAR-BENAR terkirim ke email, isi kredensial
   SMTP. Untuk Gmail: aktifkan 2-Step Verification lalu buat App Password
   (16 karakter) di https://myaccount.google.com/apppasswords — password
   biasa TIDAK bisa dipakai Gmail untuk SMTP.

     MAIL_USER=digemsmarket@gmail.com MAIL_PASS=xxxx ...

   Bila MAIL_USER/MAIL_PASS kosong, email TIDAK dikirim — link verifikasi
   dicetak di console server & dikembalikan di respons register
   (mode pengembangan). */
const MAIL = {
  host: process.env.MAIL_HOST || "smtp.gmail.com",
  port: Number(process.env.MAIL_PORT || 587),
  secure: process.env.MAIL_SECURE === "1" || Number(process.env.MAIL_PORT || 587) === 465,
  user: process.env.MAIL_USER || "",
  pass: process.env.MAIL_PASS || "",
  from: process.env.MAIL_FROM || process.env.MAIL_USER || "noreply@digems.local",
  fromName: process.env.MAIL_FROM_NAME || "Topup Digems",
};

const PORT = Number(process.env.PORT || 3000);
const ROOT = path.join(__dirname, "..");       // folder project (induk server/)
const DB_PATH = process.env.DB_PATH || path.join(__dirname, "digems.db");

// URL publik website — dipakai untuk membangun link verifikasi di email
const SITE_URL = process.env.SITE_URL || "http://localhost:" + PORT;

/* ---------- Integrasi API supplier (SERVER-SIDE) ----------
   Topup & pengecekan status transaksi kini dijalankan OLEH SERVER
   (bukan browser). Kredensial supplier RAHASIA diisi lewat env, jadi
   apikey TIDAK pernah terkirim ke browser:

     SUPPLIER_ENABLED=1
     SUPPLIER_USERNAME=xxx
     SUPPLIER_APIKEY=xxx
     SUPPLIER_BASE_URL=https://api.digiflazz.com/v1
     SUPPLIER_TESTING=1          (1 = mode uji coba, tidak memotong saldo)
     SUPPLIER_POLL_MS=30000      (interval polling status, default 30 detik)

   Cara kerja:
   - POST /api/purchase → server mencari produk di price-list supplier,
     mengirim topup, lalu menyimpan status + refId + sn di database.
   - Polling otomatis (cron interval setInterval): semua transaksi
     Pending/Menunggu Pembayaran yang punya refId dicek ke supplier;
     Sukses → status otomatis jadi Sukses, Gagal → status Gagal.
   - Admin bisa memicu poll manual / dari cron eksternal lewat
     POST /api/admin/supplier/poll. */
const SUPPLIER = {
  enabled: process.env.SUPPLIER_ENABLED === "1",
  username: process.env.SUPPLIER_USERNAME || "",
  apikey: process.env.SUPPLIER_APIKEY || "",
  baseUrl: (process.env.SUPPLIER_BASE_URL || "https://api.digiflazz.com/v1").replace(/\/$/, ""),
  testing: process.env.SUPPLIER_TESTING !== "0",
  pollMs: Math.max(5000, Number(process.env.SUPPLIER_POLL_MS || 30000)),
};

/* ---------- Data game (dari js/data.js) ----------
   Server mengevaluasi js/data.js (murni data, tanpa DOM) untuk mendapatkan
   GAMES — dipakai endpoint GET /api/games agar HARGa & produk game
   disajikan server, termasuk harga supplier bila aktif. */
let GAMES_LOCAL = [];
{
  try {
    const src = fs.readFileSync(path.join(ROOT, "js", "data.js"), "utf8");
    const sandbox = {};
    vm.createContext(sandbox);
    vm.runInContext(src, sandbox, { filename: "js/data.js" });
    GAMES_LOCAL = vm.runInContext("typeof GAMES !== 'undefined' ? GAMES : []", sandbox);
  } catch (e) {
    console.error("[SERVER] Gagal memuat js/data.js:", e.message);
  }
}

/* Kata kunci pencocokan slug game (js/data.js) dengan nama produk di price-list supplier. */
const SUPPLIER_GAME_MATCH = {
  ml: ["mobile legends", "mlbb"],
  ff: ["free fire"],
  pubg: ["pubg mobile", "pubgm"],
  genshin: ["genshin impact"],
  valorant: ["valorant", "valo"],
  codm: ["call of duty mobile", "codm"],
  roblox: ["roblox", "robux"],
  coc: ["clash of clans", "clash of clan"],
  hsr: ["honkai star rail", "honkai"],
  aov: ["arena of valor"],
  higgs: ["higgs domino", "higgs"],
  pb: ["point blank", "pointblank"],
};

/* ---------- Database SQLite ---------- */
const db = new DatabaseSync(DB_PATH);
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE,
    email TEXT UNIQUE,
    password TEXT,
    created_at TEXT
  );
  CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    uid TEXT,
    username TEXT,
    slug TEXT,
    game TEXT,
    gameImage TEXT,
    accId TEXT,
    pack TEXT,
    price INTEGER,
    method TEXT,
    wa TEXT,
    status TEXT,
    note TEXT,
    refId TEXT,
    sn TEXT,
    bundle INTEGER DEFAULT 0,
    date TEXT,
    confirmed_at TEXT,
    cancelled_at TEXT
  );
  CREATE INDEX IF NOT EXISTS idx_tx_uid ON transactions(uid);
  CREATE INDEX IF NOT EXISTS idx_tx_status ON transactions(status);
  CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    user_id TEXT,
    role TEXT DEFAULT 'user',
    created_at TEXT
  );
  CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
`);

/* Migrasi kolom verifikasi email (aman untuk database lama) */
{
  const cols = db.prepare("PRAGMA table_info(users)").all().map((c) => c.name);
  if (!cols.includes("email_verified")) db.exec("ALTER TABLE users ADD COLUMN email_verified INTEGER DEFAULT 0");
  if (!cols.includes("verify_token")) db.exec("ALTER TABLE users ADD COLUMN verify_token TEXT");
  if (!cols.includes("verify_token_expires")) db.exec("ALTER TABLE users ADD COLUMN verify_token_expires TEXT");
  // akun lama (sebelum fitur verifikasi) langsung dianggap terverifikasi
  db.exec("UPDATE users SET email_verified = 1 WHERE verify_token IS NULL AND email_verified = 0");
}

/* ---------- Helper ---------- */
function readBody(req) {
  return new Promise((resolve) => {
    let data = "";
    req.on("data", (c) => (data += c));
    req.on("end", () => {
      try { resolve(data ? JSON.parse(data) : {}); }
      catch { resolve({}); }
    });
  });
}

function now() {
  return new Date().toISOString();
}

function send(res, status, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  });
  res.end(body);
}

/* ---------- Auth: password & sesi ---------- */

/* Simpan password sebagai "salt:hash" (sha256(salt:password)) */
function hashPassword(password, salt) {
  return crypto.createHash("sha256").update(salt + ":" + password).digest("hex");
}

/* Akun lama yang password-nya plaintext tetap bisa login */
function verifyPassword(user, password) {
  if (!user || !user.password) return false;
  const stored = String(user.password);
  if (stored.includes(":")) {
    const [salt, hash] = stored.split(":");
    return hash === hashPassword(password, salt);
  }
  return stored === password;
}

/* Buat token sesi acak & simpan di database */
function createSession(userId, role) {
  const token = crypto.randomBytes(32).toString("hex");
  db.prepare("INSERT INTO sessions (token, user_id, role, created_at) VALUES (?, ?, ?, ?)")
    .run(token, userId, role || "user", now());
  return token;
}

/* Token verifikasi email (acak, berlaku 24 jam) */
function newVerifyToken(userId) {
  const token = crypto.randomBytes(24).toString("hex");
  const expires = new Date(Date.now() + 24 * 3600 * 1000).toISOString();
  db.prepare("UPDATE users SET verify_token = ?, verify_token_expires = ? WHERE id = ?")
    .run(token, expires, userId);
  return token;
}

/* Kirim email verifikasi. Tanpa kredensial SMTP → cetak link di console
   & kembalikan link untuk mode pengembangan (email tidak terkirim). */
async function sendVerificationEmail(username, email, token) {
  const link = SITE_URL + "/api/auth/verify?token=" + encodeURIComponent(token);
  if (!MAIL.user || !MAIL.pass) {
    console.log("[VERIFIKASI] " + email + " → " + link + "  (MAIL_USER/MAIL_PASS belum diisi, email tidak dikirim)");
    return { sent: false, link };
  }
  try {
    const { sendEmail } = require("./mailer");
    await sendEmail({
      host: MAIL.host,
      port: MAIL.port,
      secure: MAIL.secure,
      user: MAIL.user,
      pass: MAIL.pass,
      from: MAIL.from,
      fromName: MAIL.fromName,
      to: email,
      subject: "Verifikasi Email Kamu — " + MAIL.fromName,
      text:
        "Halo " + username + "!\n\n" +
        "Terima kasih sudah mendaftar di " + MAIL.fromName + ".\n" +
        "Klik link berikut untuk memverifikasi bahwa email ini aktif:\n\n" +
        link + "\n\n" +
        "Link berlaku 24 jam. Bila kamu tidak mendaftar, abaikan email ini.\n",
      html:
        '<div style="max-width:520px;margin:auto;font-family:Arial,Helvetica,sans-serif;background:#fff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden">' +
        '  <div style="background:#2563eb;padding:18px 24px"><b style="color:#fff;font-size:18px">' + MAIL.fromName + '</b></div>' +
        '  <div style="padding:24px">' +
        '    <h2 style="margin:0 0 12px;color:#111827;font-size:20px">Halo ' + username + '! 👋</h2>' +
        '    <p style="color:#374151;line-height:1.6;margin:0 0 20px">Terima kasih sudah mendaftar. Klik tombol di bawah untuk memverifikasi bahwa email ini aktif:</p>' +
        '    <a href="' + link + '" style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:bold">Verifikasi Email</a>' +
        '    <p style="color:#6b7280;font-size:13px;margin:20px 0 0">Bila tombol tidak berfungsi, salin tautan ini: <br>' +
        '      <span style="word-break:break-all">' + link + '</span></p>' +
        '    <p style="color:#9ca3af;font-size:12px;margin:16px 0 0">Link berlaku 24 jam. Bila kamu tidak mendaftar, abaikan email ini.</p>' +
        '  </div>' +
        '</div>',
    });
    return { sent: true, link };
  } catch (e) {
    console.error("[EMAIL] Gagal mengirim verifikasi:", e.message);
    return { sent: false, link, error: e.message };
  }
}

/* Halaman HTML sederhana setelah email berhasil diverifikasi */
function verifySuccessPage(email) {
  return (
    "<!DOCTYPE html><html lang='id'><head><meta charset='UTF-8'>" +
    "<meta name='viewport' content='width=device-width,initial-scale=1'>" +
    "<title>Email Terverifikasi — Topup Digems</title></head>" +
    "<body style='margin:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif'>" +
    "<div style='max-width:420px;margin:80px auto;background:#fff;border-radius:14px;padding:36px;text-align:center;box-shadow:0 6px 24px rgba(0,0,0,.08)'>" +
    "<div style='font-size:52px'>✅</div>" +
    "<h1 style='margin:12px 0;color:#111827;font-size:22px'>Email Terverifikasi!</h1>" +
    "<p style='color:#4b5563;line-height:1.6'>Email <b>" + email + "</b> sudah aktif dan terhubung ke akun kamu. Sekarang kamu bisa login dan topup.</p>" +
    "<a href='" + SITE_URL + "/login.html' style='display:inline-block;background:#2563eb;color:#fff;text-decoration:none;padding:12px 30px;border-radius:8px;font-weight:bold;margin-top:10px'>Masuk Sekarang</a>" +
    "</div></body></html>"
  );
}

/* Ambil sesi dari header Authorization: Bearer <token> */
function authSession(req) {
  const h = req.headers["authorization"] || "";
  if (!h.startsWith("Bearer ")) return null;
  const token = h.slice(7).trim();
  if (!token) return null;
  return db.prepare("SELECT * FROM sessions WHERE token = ?").get(token) || null;
}

/* Sesi admin (role = 'admin') */
function requireAdmin(req) {
  const s = authSession(req);
  return s && s.role === "admin" ? s : null;
}

/* ---------- CRUD transaksi ---------- */
function insertTransaction(uid, t) {
  const id = t.id || "p" + Date.now() + Math.floor(Math.random() * 1000);
  const user = db.prepare("SELECT username FROM users WHERE id = ?").get(uid);
  db.prepare(`
    INSERT INTO transactions
      (id, uid, username, slug, game, gameImage, accId, pack, price, method, wa,
       status, note, refId, sn, bundle, date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, uid, user ? user.username : "", t.slug || "", t.game || "", t.gameImage || "",
    t.accId || "", t.pack || "", Number(t.price || 0), t.method || "", t.wa || "",
    t.status || "Menunggu Pembayaran", t.note || "", t.refId || "", t.sn || "",
    t.bundle ? 1 : 0, t.date || now()
  );
  return id;
}

function findTransaction(id) {
  return db.prepare("SELECT * FROM transactions WHERE id = ?").get(id);
}

function updateStatus(id, status, note, col) {
  db.prepare(
    `UPDATE transactions SET status = ?, note = ?, ${col} = ? WHERE id = ?`
  ).run(status, note, now(), id);
}

/* ---------- Supplier: sign, price-list, topup, cek status ---------- */

/* Tanda tangan MD5(username + apikey + keyword) — wajib untuk tiap request ke supplier */
function supplierSign(keyword) {
  return crypto.createHash("md5").update(SUPPLIER.username + SUPPLIER.apikey + keyword).digest("hex");
}

let supplierPriceCache = { t: 0, products: null };
const SUPPLIER_PRICE_TTL = 5 * 60 * 1000; // cache harga 5 menit

/* Ambil daftar harga produk dari supplier (null bila nonaktif/gagal) */
async function supplierFetchPriceList(force) {
  if (!SUPPLIER.enabled || !SUPPLIER.username || !SUPPLIER.apikey) return null;
  if (!force && supplierPriceCache.products && Date.now() - supplierPriceCache.t < SUPPLIER_PRICE_TTL) {
    return supplierPriceCache.products;
  }
  try {
    const res = await fetch(SUPPLIER.baseUrl + "/price-list", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: SUPPLIER.username, sign: supplierSign("pricelist"), type: "price-list" }),
    });
    const json = await res.json().catch(() => ({}));
    const products = (json && Array.isArray(json.data) && json.data) || [];
    supplierPriceCache = { t: Date.now(), products };
    return products;
  } catch (e) {
    console.error("[SUPPLIER] Gagal mengambil price-list:", e.message);
    return null;
  }
}

/* Produk supplier yang cocok dengan sebuah game (slug) */
function matchSupplierProducts(products, slug, gameName) {
  const kws = SUPPLIER_GAME_MATCH[slug] || [String(gameName || "").toLowerCase()];
  return products.filter((p) => {
    const s = ((p.brand || "") + " " + (p.product_name || "")).toLowerCase();
    return kws.some((k) => s.includes(k));
  });
}

/* Cari produk untuk satu paket (angka di label, mis. "86" dari "86 Diamond") */
function findProductForPack(products, slug, gameName, packLabel) {
  const matches = matchSupplierProducts(products, slug, gameName);
  if (!matches.length) return null;
  const tokens = String(packLabel || "").toLowerCase().split(/\s+/).filter((t) => /\d/.test(t));
  for (const p of matches) {
    const name = (p.product_name || "").toLowerCase();
    if (tokens.some((t) => new RegExp("\\b" + t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b").test(name))) return p;
  }
  return matches.reduce((a, b) => (a.price <= b.price ? a : b));
}

/* Terapkan harga supplier ke daftar game (kloning, tidak mengubah GAMES_LOCAL).
   Setiap paket jadi [label, harga supplier, harga lokal] — index 2 dipakai
   halaman payment untuk menampilkan harga jual & margin (khusus admin).
   Paket yang tidak cocok dengan produk supplier dibiarkan apa adanya. */
function applySupplierPrices(games, products) {
  return games.map((g) => {
    const packs = g.packs.map((p) => {
      const prod = findProductForPack(products, g.slug, g.name, p[0]);
      return prod ? [p[0], prod.price, p[1]] : p;
    });
    return { ...g, packs, _supplierPrice: true };
  });
}

/* Kirim topup ke supplier. purchase: { slug, game, accId, pack }.
   Mengembalikan { status, refId, sn, message } atau null bila gagal/nonaktif. */
async function supplierTopup(purchase) {
  if (!SUPPLIER.enabled || !SUPPLIER.username || !SUPPLIER.apikey) return null;
  try {
    const products = await supplierFetchPriceList();
    const prod = findProductForPack(products || [], purchase.slug, purchase.game, purchase.pack);
    if (!prod) {
      return { status: "Gagal", message: "Produk tidak ditemukan di supplier (periksa SUPPLIER_GAME_MATCH)." };
    }
    const refId = "DGS" + Date.now();
    const res = await fetch(SUPPLIER.baseUrl + "/transaction", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: SUPPLIER.username,
        buyer_sku_code: prod.buyer_sku_code,
        customer_no: purchase.accId,
        ref_id: refId,
        sign: supplierSign(refId),
        testing: SUPPLIER.testing,
      }),
    });
    const json = await res.json().catch(() => ({}));
    const d = (json && json.data) || {};
    return {
      status: d.status || "Pending",
      refId: d.ref_id || refId,
      sn: d.sn || "",
      message: d.message || "",
    };
  } catch (e) {
    console.error("[SUPPLIER] Gagal kirim topup:", e.message);
    return null;
  }
}

/* Cek status transaksi di supplier berdasarkan refId (Digiflazz type: status) */
async function supplierCheckStatus(refId) {
  if (!SUPPLIER.enabled || !SUPPLIER.username || !SUPPLIER.apikey || !refId) return null;
  try {
    const res = await fetch(SUPPLIER.baseUrl + "/transaction", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: SUPPLIER.username,
        ref_id: refId,
        sign: supplierSign(refId),
        type: "status",
      }),
    });
    const json = await res.json().catch(() => ({}));
    const d = (json && json.data) || {};
    return { status: d.status || "Pending", sn: d.sn || "", message: d.message || "" };
  } catch (e) {
    console.error("[SUPPLIER] Gagal cek status", refId, ":", e.message);
    return null;
  }
}

/* ---------- Polling status otomatis (cron interval di server) ----------
   Jalankan supplierCheckStatus untuk SEMUA transaksi yang masih
   Pending/Menunggu Pembayaran dan punya refId. Supplier Sukses → status
   otomatis jadi Sukses (tanpa klik admin); Gagal → status Gagal. */
let supplierLastPoll = null; // { at, checked, updated, pending } — hasil polling terakhir

async function pollSupplierStatus() {
  if (!SUPPLIER.enabled || !SUPPLIER.username || !SUPPLIER.apikey) {
    return { ok: true, skipped: true, reason: "SUPPLIER_ENABLED belum diaktifkan" };
  }
  let checked = 0;
  let updated = 0;
  try {
    const rows = db.prepare(
      `SELECT id, refId, note FROM transactions
       WHERE refId IS NOT NULL AND refId != ''
         AND status IN ('Menunggu Pembayaran','Pending')`
    ).all();
    for (const row of rows) {
      const st = await supplierCheckStatus(row.refId);
      if (!st || !st.status || st.status === "Pending") continue;
      checked++;
      if (st.status === "Sukses") {
        const note = row.note
          ? row.note + " · Dikonfirmasi otomatis (supplier)"
          : "Dikonfirmasi otomatis (supplier)";
        db.prepare(
          `UPDATE transactions SET status = 'Sukses', note = ?, sn = ?, confirmed_at = ? WHERE id = ?`
        ).run(note, st.sn || "", now(), row.id);
      } else {
        db.prepare(
          `UPDATE transactions SET status = 'Gagal', note = ?, cancelled_at = ? WHERE id = ?`
        ).run("Gagal di supplier" + (st.message ? ": " + st.message : ""), now(), row.id);
      }
      updated++;
    }
    if (checked || updated) {
      console.log("[SUPPLIER] Poll: " + checked + " transaksi dicek, " + updated + " diperbarui");
    }
    const pending = db.prepare(
      `SELECT COUNT(*) AS n FROM transactions
       WHERE refId IS NOT NULL AND refId != '' AND status IN ('Menunggu Pembayaran','Pending')`
    ).get().n;
    supplierLastPoll = { at: now(), checked, updated, pending };
    return { ok: true, checked, updated, pending };
  } catch (e) {
    console.error("[SUPPLIER] Error polling status:", e.message);
    return { ok: false, error: e.message };
  }
}

/* ---------- API handler ---------- */
async function handleApi(req, res, url) {
  const p = url.pathname;
  const method = req.method;

  if (method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    });
    return res.end();
  }

  // GET /api/health
  if (method === "GET" && p === "/api/health") {
    const count = db.prepare("SELECT COUNT(*) AS n FROM transactions").get().n;
    return send(res, 200, {
      ok: true,
      name: "Topup Digems DB",
      transactions: count,
      db: DB_PATH,
      supplier: {
        enabled: SUPPLIER.enabled && !!(SUPPLIER.username && SUPPLIER.apikey),
        pollingMs: SUPPLIER.pollMs,
      },
    });
  }

  // GET /api/games — daftar game dengan harga (bila supplier aktif, harga
  // supplier diterapkan server: paket jadi [label, harga supplier, harga
  // lokal]). Browser TIDAK perlu memanggil API supplier.
  if (method === "GET" && p === "/api/games") {
    let games = GAMES_LOCAL;
    if (SUPPLIER.enabled && SUPPLIER.username && SUPPLIER.apikey) {
      const products = await supplierFetchPriceList();
      if (products && products.length) games = applySupplierPrices(GAMES_LOCAL, products);
    }
    return send(res, 200, { ok: true, count: games.length, games });
  }

  // GET /api/auth/me
  if (method === "GET" && p === "/api/auth/me") {
    const s = authSession(req);
    if (!s) return send(res, 401, { ok: false, error: "Sesi tidak valid." });
    const user = db.prepare("SELECT id, username, email, email_verified FROM users WHERE id = ?").get(s.user_id);
    if (!user) return send(res, 401, { ok: false, error: "User tidak ditemukan." });
    return send(res, 200, { ok: true, user: { id: user.id, username: user.username, email: user.email, verified: user.email_verified ? 1 : 0 } });
  }

  // POST /api/auth/register
  if (method === "POST" && p === "/api/auth/register") {
    const b = await readBody(req);
    const username = String(b.username || "").trim();
    const email = String(b.email || "").trim().toLowerCase();
    const password = String(b.password || "");
    if (!username || !email || !password) {
      return send(res, 400, { ok: false, error: "Mohon lengkapi semua data." });
    }
    if (password.length < 6) {
      return send(res, 400, { ok: false, error: "Password minimal 6 karakter." });
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return send(res, 400, { ok: false, error: "Format email tidak valid." });
    }
    if (db.prepare("SELECT id FROM users WHERE username = ?").get(username)) {
      return send(res, 409, { ok: false, error: "Username sudah dipakai." });
    }
    if (db.prepare("SELECT id FROM users WHERE email = ?").get(email)) {
      return send(res, 409, { ok: false, error: "Email sudah terdaftar." });
    }
    const salt = crypto.randomBytes(8).toString("hex");
    const id = "u" + Date.now() + Math.floor(Math.random() * 1000);
    db.prepare("INSERT INTO users (id, username, email, password, email_verified, created_at) VALUES (?, ?, ?, ?, 0, ?)")
      .run(id, username, email, salt + ":" + hashPassword(password, salt), now());
    // buat token verifikasi & kirim link ke email (bukti email aktif & milik pendaftar)
    const verifyToken = newVerifyToken(id);
    const mail = await sendVerificationEmail(username, email, verifyToken);
    const token = createSession(id, "user");
    return send(res, 200, {
      ok: true,
      token,
      user: { id, username, email, verified: 0 },
      needsVerification: true,
      mailSent: mail.sent,
      devVerifyUrl: mail.sent ? undefined : mail.link, // hanya untuk mode pengembangan
    });
  }

  // POST /api/auth/login — username ATAU email
  if (method === "POST" && p === "/api/auth/login") {
    const b = await readBody(req);
    const identifier = String(b.identifier || "").trim();
    const password = String(b.password || "");
    const user = db.prepare("SELECT * FROM users WHERE username = ? OR email = ?").get(identifier, identifier);
    if (!user || !verifyPassword(user, password)) {
      return send(res, 401, { ok: false, error: "Username/email atau password salah." });
    }
    const token = createSession(user.id, "user");
    return send(res, 200, {
      ok: true,
      token,
      user: { id: user.id, username: user.username, email: user.email, verified: user.email_verified ? 1 : 0 },
    });
  }

  // GET /api/auth/verify?token=... — klik link dari email
  if (method === "GET" && p === "/api/auth/verify") {
    const token = url.searchParams.get("token") || "";
    const user = db.prepare("SELECT * FROM users WHERE verify_token = ?").get(token);
    if (!user) {
      res.writeHead(400, { "Content-Type": "text/html; charset=utf-8" });
      return res.end("<body style='font-family:Arial;text-align:center;padding:60px'><h1>⚠️ Link tidak valid</h1><p>Link verifikasi tidak ditemukan atau sudah kedaluwarsa.</p><p><a href='" + SITE_URL + "/login.html'>Kembali ke login</a></p></body>");
    }
    if (new Date(user.verify_token_expires) < new Date()) {
      res.writeHead(400, { "Content-Type": "text/html; charset=utf-8" });
      return res.end("<body style='font-family:Arial;text-align:center;padding:60px'><h1>⏰ Link kedaluwarsa</h1><p>Link verifikasi sudah melewati 24 jam. Silakan kirim ulang dari halaman login.</p><p><a href='" + SITE_URL + "/login.html'>Kembali ke login</a></p></body>");
    }
    db.prepare("UPDATE users SET email_verified = 1, verify_token = NULL, verify_token_expires = NULL WHERE id = ?")
      .run(user.id);
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    return res.end(verifySuccessPage(user.email));
  }

  // POST /api/auth/resend — kirim ulang link verifikasi
  if (method === "POST" && p === "/api/auth/resend") {
    const b = await readBody(req);
    const email = String(b.email || "").trim().toLowerCase();
    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    if (!user) return send(res, 404, { ok: false, error: "Email tidak terdaftar." });
    if (user.email_verified) return send(res, 400, { ok: false, error: "Email ini sudah terverifikasi." });
    const verifyToken = newVerifyToken(user.id);
    const mail = await sendVerificationEmail(user.username, user.email, verifyToken);
    return send(res, 200, { ok: true, mailSent: mail.sent, devVerifyUrl: mail.sent ? undefined : mail.link });
  }

  // POST /api/auth/logout — hapus sesi token dari database
  if (method === "POST" && p === "/api/auth/logout") {
    const h = req.headers["authorization"] || "";
    const token = h.startsWith("Bearer ") ? h.slice(7).trim() : "";
    if (token) db.prepare("DELETE FROM sessions WHERE token = ?").run(token);
    return send(res, 200, { ok: true });
  }

  // GET /api/history?uid= — token harus milik uid tersebut
  if (method === "GET" && p === "/api/history") {
    const uid = url.searchParams.get("uid") || "";
    const s = authSession(req);
    if (!s || s.role !== "user" || s.user_id !== uid) {
      return send(res, 401, { ok: false, error: "Sesi tidak valid untuk akun ini." });
    }
    const rows = db.prepare("SELECT * FROM transactions WHERE uid = ? ORDER BY date DESC").all(uid);
    return send(res, 200, { ok: true, history: rows });
  }

  // POST /api/purchase — token user wajib.
  // Bila SUPPLIER aktif, server MENGIRIM TOPUP ke supplier lalu menyimpan
  // status asli + refId + sn (browser tidak perlu tahu apikey supplier).
  if (method === "POST" && p === "/api/purchase") {
    const body = await readBody(req);
    const uid = body.uid;
    if (!uid) return send(res, 400, { ok: false, error: "uid wajib diisi." });
    const s = authSession(req);
    if (!s || s.role !== "user" || s.user_id !== uid) {
      return send(res, 401, { ok: false, error: "Sesi tidak valid untuk akun ini." });
    }

    let supplier = null;
    if (SUPPLIER.enabled && SUPPLIER.username && SUPPLIER.apikey) {
      const res = await supplierTopup(body);
      if (res) {
        supplier = { status: res.status, refId: res.refId || "", sn: res.sn || "", message: res.message || "" };
        body.status = res.status || body.status || "Menunggu Pembayaran";
        body.refId = res.refId || "";
        body.sn = res.sn || "";
        if (res.message && !body.note) body.note = res.message;
      }
    }

    const id = insertTransaction(uid, body);
    return send(res, 200, { ok: true, id, supplier });
  }

  // POST /api/purchase/confirm
  if (method === "POST" && p === "/api/purchase/confirm") {
    const body = await readBody(req);
    const row = findTransaction(body.id);
    if (!row) return send(res, 404, { ok: false, error: "Transaksi tidak ditemukan." });
    updateStatus(body.id, "Sukses", "Dikonfirmasi admin", "confirmed_at");
    return send(res, 200, { ok: true });
  }

  // POST /api/purchase/cancel
  if (method === "POST" && p === "/api/purchase/cancel") {
    const body = await readBody(req);
    const row = findTransaction(body.id);
    if (!row) return send(res, 404, { ok: false, error: "Transaksi tidak ditemukan." });
    const note = body.reason ? "Dibatalkan: " + body.reason : "Dibatalkan";
    updateStatus(body.id, "Dibatalkan", note, "cancelled_at");
    return send(res, 200, { ok: true });
  }

  // POST /api/transactions/sync — kirim batch dari outbox [{ uid, t }]
  // (jalur pemulihan offline — tidak wajib token agar transaksi yang dibuat
  //  saat server mati tetap bisa dikirim begitu server online)
  if (method === "POST" && p === "/api/transactions/sync") {
    const body = await readBody(req);
    const items = Array.isArray(body.items) ? body.items : [];
    let saved = 0;
    for (const it of items) {
      if (!it || !it.uid || !it.t) continue;
      try { insertTransaction(it.uid, it.t); saved++; } catch (e) { /* lewati duplikat */ }
    }
    return send(res, 200, { ok: true, saved });
  }

  /* ================= ADMIN (token admin wajib) ================= */

  // POST /api/admin/login
  if (method === "POST" && p === "/api/admin/login") {
    const b = await readBody(req);
    if (String(b.password || "") !== ADMIN_PASSWORD) {
      return send(res, 401, { ok: false, error: "Password admin salah." });
    }
    const token = createSession("admin", "admin");
    return send(res, 200, { ok: true, token });
  }

  // GET /api/admin/transactions — semua transaksi semua akun
  if (method === "GET" && p === "/api/admin/transactions") {
    if (!requireAdmin(req)) {
      return send(res, 401, { ok: false, error: "Akses ditolak: token admin diperlukan." });
    }
    const rows = db.prepare(`
      SELECT t.*, t.uid AS _uid,
             COALESCE(u.username, NULLIF(t.username, ''), 'tanpa-akun') AS _username
      FROM transactions t LEFT JOIN users u ON u.id = t.uid
      ORDER BY t.date DESC
    `).all();
    return send(res, 200, { ok: true, transactions: rows });
  }

  // GET /api/admin/stats
  if (method === "GET" && p === "/api/admin/stats") {
    if (!requireAdmin(req)) {
      return send(res, 401, { ok: false, error: "Akses ditolak: token admin diperlukan." });
    }
    const n = (sql) => db.prepare(sql).get().n;
    const users = n("SELECT COUNT(*) AS n FROM users");
    const unverified = n("SELECT COUNT(*) AS n FROM users WHERE email_verified = 0");
    const transactions = n("SELECT COUNT(*) AS n FROM transactions");
    const waiting = n("SELECT COUNT(*) AS n FROM transactions WHERE status IN ('Menunggu Pembayaran','Pending')");
    const revenue = n("SELECT COALESCE(SUM(price),0) AS n FROM transactions WHERE status = 'Sukses'");
    return send(res, 200, { ok: true, users, unverified, transactions, waiting, revenue });
  }

  // POST /api/admin/transactions/confirm
  if (method === "POST" && p === "/api/admin/transactions/confirm") {
    if (!requireAdmin(req)) {
      return send(res, 401, { ok: false, error: "Akses ditolak: token admin diperlukan." });
    }
    const b = await readBody(req);
    if (!findTransaction(b.id)) {
      return send(res, 404, { ok: false, error: "Transaksi tidak ditemukan." });
    }
    updateStatus(b.id, "Sukses", "Dikonfirmasi admin", "confirmed_at");
    return send(res, 200, { ok: true });
  }

  // POST /api/admin/transactions/cancel
  if (method === "POST" && p === "/api/admin/transactions/cancel") {
    if (!requireAdmin(req)) {
      return send(res, 401, { ok: false, error: "Akses ditolak: token admin diperlukan." });
    }
    const b = await readBody(req);
    if (!findTransaction(b.id)) {
      return send(res, 404, { ok: false, error: "Transaksi tidak ditemukan." });
    }
    const note = b.reason ? "Dibatalkan: " + b.reason : "Dibatalkan";
    updateStatus(b.id, "Dibatalkan", note, "cancelled_at");
    return send(res, 200, { ok: true });
  }

  // GET /api/admin/supplier/status — status konfigurasi & polling supplier
  if (method === "GET" && p === "/api/admin/supplier/status") {
    if (!requireAdmin(req)) {
      return send(res, 401, { ok: false, error: "Akses ditolak: token admin diperlukan." });
    }
    const pending = db.prepare(
      `SELECT COUNT(*) AS n FROM transactions
       WHERE refId IS NOT NULL AND refId != '' AND status IN ('Menunggu Pembayaran','Pending')`
    ).get().n;
    return send(res, 200, {
      ok: true,
      enabled: SUPPLIER.enabled && !!(SUPPLIER.username && SUPPLIER.apikey),
      provider: "digiflazz",
      baseUrl: SUPPLIER.baseUrl,
      testing: SUPPLIER.testing,
      pollMs: SUPPLIER.pollMs,
      pending,
      lastPoll: supplierLastPoll,
    });
  }

  // POST /api/admin/supplier/poll — paksa polling status SEKARANG
  // (bisa dipanggil dari cron eksternal, mis. tiap menit).
  if (method === "POST" && p === "/api/admin/supplier/poll") {
    if (!requireAdmin(req)) {
      return send(res, 401, { ok: false, error: "Akses ditolak: token admin diperlukan." });
    }
    const r = await pollSupplierStatus();
    return send(res, 200, { ok: true, ...r });
  }

  return send(res, 404, { ok: false, error: "Endpoint tidak dikenal: " + p });
}

/* ---------- File statis ---------- */
const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".json": "application/json; charset=utf-8",
  ".webp": "image/webp",
};

function serveStatic(req, res, url) {
  let p = decodeURIComponent(url.pathname);
  if (p === "/") p = "/index.html";
  // cegah path traversal
  const filePath = path.normalize(path.join(ROOT, p));
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403); return res.end("Forbidden");
  }
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      return res.end("404 - File tidak ditemukan: " + p);
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
    res.end(data);
  });
}

/* ---------- Server ---------- */
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://" + req.headers.host);
  if (url.pathname.startsWith("/api/")) {
    try { await handleApi(req, res, url); }
    catch (e) { send(res, 500, { ok: false, error: String(e && e.message || e) }); }
  } else {
    serveStatic(req, res, url);
  }
});

server.listen(PORT, () => {
  console.log("==============================================");
  console.log("  Topup Digems Server Database");
  console.log("  Website   : http://localhost:" + PORT);
  console.log("  Health    : http://localhost:" + PORT + "/api/health");
  console.log("  Admin     : http://localhost:" + PORT + "/terserah_admin.html");
  console.log("  Password admin: " + ADMIN_PASSWORD);
  console.log("  Email     : " + (MAIL.user ? MAIL.user + " (SMTP " + MAIL.host + ")" : "BELUM dikonfigurasi — link verifikasi dicetak di console"));
  console.log("  Database  : " + DB_PATH);
  if (SUPPLIER.enabled && SUPPLIER.username && SUPPLIER.apikey) {
    console.log("  Supplier  : AKTIF (" + SUPPLIER.baseUrl + ", testing=" + SUPPLIER.testing + ")");
    console.log("  Polling   : cek status tiap " + SUPPLIER.pollMs + " ms");
  } else {
    console.log("  Supplier  : nonaktif (set SUPPLIER_ENABLED=1 + SUPPLIER_USERNAME + SUPPLIER_APIKEY)");
  }
  console.log("==============================================");

  // Polling status supplier otomatis (cron interval) — jalankan sekali
  // saat start, lalu tiap SUPPLIER.pollMs. Status transaksi di database
  // diperbarui tanpa keterlibatan browser/admin.
  if (SUPPLIER.enabled && SUPPLIER.username && SUPPLIER.apikey) {
    pollSupplierStatus();
    setInterval(pollSupplierStatus, SUPPLIER.pollMs);
  }
});
