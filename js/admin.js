/* ============================================================
   ADMIN — lihat semua transaksi semua akun & konfirmasi
   Data & otorisasi lewat AdminService (js/api.js):
   - Saat API_CONFIG.enabled = true  → backend (token admin diverifikasi server)
   - Saat nonaktif                   → localStorage (mode demo/offline)
   ============================================================ */

const ADMIN_PASSWORD = "admin123"; // ⭐ fallback demo — saat API aktif, password diverifikasi server

function adminStatusHTML(it) {
  const s = it.status || "";
  if (s === "Sukses") return '<span class="hi-status ok">&#9989; Sukses</span>';
  if (s === "Menunggu Pembayaran") return '<span class="hi-status wait">&#9203; Menunggu</span>';
  if (s === "Pending") return '<span class="hi-status wait">&#9203; Pending</span>';
  if (s === "Dibatalkan") return '<span class="hi-status cancel">&#128683; Dibatalkan</span>';
  return '<span class="hi-status fail">&#10060; ' + s + "</span>";
}

function adminActionsHTML(it) {
  let html = "";
  if (it.status === "Menunggu Pembayaran") {
    html += '<button class="btn btn-sm btn-primary" data-confirm="' + it.id + '">Konfirmasi</button> ';
    html += '<button class="btn btn-sm btn-danger" data-cancel="' + it.id + '">Batalkan</button> ';
  }
  if (it.wa) {
    html += '<a class="btn btn-sm btn-outline" href="' + waNotifyURL(it) + '" target="_blank" rel="noopener">&#128172; WA</a>';
  }
  return html || '<span class="admin-none">-</span>';
}

/* ---------- Panel status supplier ---------- */

function spSet(id, txt) {
  const el = document.getElementById(id);
  if (el) el.textContent = txt;
}

async function renderSupplierPanel() {
  const btn = document.getElementById("supplierPollBtn");
  const st = await AdminService.getSupplierStatus();
  const note = document.getElementById("supplierNote");

  if (!st) {
    spSet("spStatus", "Server tidak terjangkau");
    spSet("spTesting", "-");
    spSet("spPending", "-");
    spSet("spLastPoll", "-");
    if (note) note.textContent = "Jalankan server (node server/server.js) untuk melihat status supplier.";
    if (btn) btn.disabled = true;
    return;
  }

  const statusEl = document.getElementById("spStatus");
  if (statusEl) {
    statusEl.textContent = st.enabled ? "AKTIF" : "Nonaktif";
    statusEl.className = st.enabled ? "sp-ok" : "sp-off";
  }
  spSet("spTesting", st.testing ? "Testing (uji coba)" : "Produksi");
  spSet("spPending", st.pending != null ? String(st.pending) : "-");

  const lp = st.lastPoll;
  if (lp) {
    const t = new Date(lp.at);
    const detail = lp.checked || lp.updated ? " · cek " + lp.checked + ", ubah " + lp.updated : " · tidak ada perubahan";
    spSet("spLastPoll", t.toLocaleString("id-ID") + detail);
  } else {
    spSet("spLastPoll", "Belum pernah");
  }

  if (note) {
    note.textContent = st.enabled
      ? "Polling otomatis server tiap " + (st.pollMs ? Math.round(st.pollMs / 1000) + " detik" : "interval") + " — status transaksi diperbarui tanpa klik admin."
      : "Supplier nonaktif di server. Aktifkan dengan env SUPPLIER_ENABLED=1 + SUPPLIER_USERNAME + SUPPLIER_APIKEY lalu restart.";
  }
  if (btn) btn.disabled = false;
}

/* Tombol Poll Sekarang: paksa server cek semua transaksi pending ke supplier */
async function pollSupplierNow() {
  const btn = document.getElementById("supplierPollBtn");
  if (!btn) return;
  btn.disabled = true;
  btn.innerHTML = "&#128260; Memproses…";

  const res = await AdminService.pollSupplier();
  if (res) {
    const msg = res.skipped
      ? "Supplier nonaktif — polling dilewati."
      : "Poll selesai: " + res.checked + " dicek, " + res.updated + " diperbarui" +
        (res.pending != null ? ", " + res.pending + " masih pending" : "") + ".";
    alert(msg);
  } else {
    alert("Server tidak terjangkau.");
  }

  btn.innerHTML = "&#128260; Poll Sekarang";
  btn.disabled = false;
  renderAdmin(); // refresh daftar transaksi + panel (status mungkin berubah)
}

async function renderAdmin() {
  // sinkronkan status transaksi dengan supplier (auto-konfirmasi)
  if (typeof GameService.syncSupplierStatus === "function") {
    try { await GameService.syncSupplierStatus(); } catch (e) { console.warn(e); }
  }

  // panel status supplier (tidak memblokir render transaksi)
  renderSupplierPanel();

  const [rows, stats] = await Promise.all([AdminService.getTransactions(), AdminService.getStats()]);

  // statistik
  document.getElementById("aStatUsers").textContent = stats.users;
  document.getElementById("aStatTrans").textContent = stats.transactions;
  document.getElementById("aStatWait").textContent = stats.waiting;
  document.getElementById("aStatTotal").textContent = formatRupiah(stats.revenue);

  document.getElementById("confirmAllBtn").disabled = !stats.waiting;
  document.getElementById("adminHint").textContent = stats.waiting
    ? stats.waiting + " transaksi menunggu konfirmasi. Klik tombol untuk konfirmasi sekaligus."
    : "Tidak ada transaksi yang menunggu konfirmasi.";

  renderWeeklyReport(rows);
  renderPopularGames(rows);

  const list = document.getElementById("adminList");
  if (!rows.length) {
    list.innerHTML = '<div class="empty">&#128203; Belum ada transaksi dari akun mana pun.</div>';
    return;
  }

  list.innerHTML = rows
    .map(
      (it) =>
        '<div class="history-item">' +
        '  <img src="' + (it.gameImage || "assets/logo-noname.svg") + '" alt="' + it.game + '">' +
        '  <div class="hi-info">' +
        "    <h4>" + it.game + (it.bundle ? ' <span class="bundle-badge">&#127915;</span>' : "") + ' <span class="admin-user">@' + (it._username || "tanpa-akun") + "</span></h4>" +
        "    <p>ID Game: <b>" + it.accId + "</b> &middot; Paket: " + it.pack + (it.method ? " &middot; " + it.method : "") + "</p>" +
        (it.wa ? '<div class="hi-note">&#128172; ' + it.wa + "</div>" : "") +
        "  </div>" +
        '  <div class="hi-price">' + formatRupiah(it.price) + "</div>" +
        "  " + adminStatusHTML(it) +
        '  <div class="admin-actions">' + adminActionsHTML(it) + "</div>" +
        '  <div class="hi-date">&#128337; ' + fmtDate(it.date) + "</div>" +
        "</div>"
    )
    .join("");

  // batalkan satu per satu
  list.querySelectorAll("[data-cancel]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.getAttribute("data-cancel");
      const item = rows.find((r) => r.id === id);
      const reason = prompt("Alasan pembatalan (opsional):", "");
      if (reason === null) return;
      if (!confirm("Batalkan transaksi ini? Status akan menjadi Dibatalkan.")) return;
      await AdminService.cancelTransaction(item._uid, id, reason.trim());
      renderAdmin();
    });
  });

  // konfirmasi satu per satu
  list.querySelectorAll("[data-confirm]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.getAttribute("data-confirm");
      const item = rows.find((r) => r.id === id);
      if (!confirm("Konfirmasi pembayaran transaksi ini? Status akan menjadi Sukses.")) return;
      await AdminService.confirmTransaction(item._uid, id);
      renderAdmin();
      if (item && item.wa) {
        if (confirm("Kirim notifikasi WhatsApp ke pembeli (" + item.wa + ")?")) {
          window.open(waNotifyURL(item), "_blank", "noopener");
        }
      }
    });
  });
}

/* ---------- Game Terlaris ---------- */
function renderPopularGames(rows) {
  const list = document.getElementById("popularList");
  const totalEl = document.getElementById("popularTotal");
  if (!list) return;

  if (!rows.length) {
    list.innerHTML = '<div class="empty">Belum ada data transaksi.</div>';
    if (totalEl) totalEl.textContent = "0 game";
    return;
  }

  /* Hitung jumlah transaksi & revenue per game */
  const gameMap = {};
  rows.forEach((it) => {
    const name = it.game || "-";
    if (!gameMap[name]) gameMap[name] = { count: 0, revenue: 0, image: it.gameImage || "" };
    gameMap[name].count++;
    if (it.status === "Sukses") gameMap[name].revenue += Number(it.price || 0);
  });

  /* Sort by count descending */
  const sorted = Object.entries(gameMap)
    .map(([name, d]) => ({ name, count: d.count, revenue: d.revenue, image: d.image }))
    .sort((a, b) => b.count - a.count);

  if (totalEl) totalEl.textContent = sorted.length + " game";

  const medals = ["&#129351;", "&#129352;", "&#129353;"];

  list.innerHTML = sorted
    .map((g, i) => {
      const medal = i < 3 ? medals[i] : (i + 1) + ".";
      return (
        '<div class="history-item" style="align-items:center;">'
        + '<img src="' + (g.image || "assets/logo-noname.svg") + '" alt="' + g.name + '" style="width:32px;height:32px;border-radius:6px;flex-shrink:0;">'
        + '<div class="hi-info" style="flex:1;min-width:0;">'
        + '  <h4 style="margin:0;">' + medal + ' ' + g.name + '</h4>'
        + '  <p style="margin:2px 0 0;font-size:0.85rem;color:var(--text-dim);">'
        + g.count + ' transaksi &middot; ' + formatRupiah(g.revenue)
        + '</p>'
        + '</div>'
        + '</div>'
      );
    })
    .join("");
}

/* ---------- Laporan 7 hari terakhir ---------- */

/* Kunci tanggal lokal YYYY-MM-DD */
function dayKey(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return y + "-" + m + "-" + dd;
}

function renderWeeklyReport(rows) {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push({
      key: dayKey(d),
      label: d.toLocaleDateString("id-ID", { weekday: "short", day: "numeric" }),
      count: 0,
      revenue: 0,
    });
  }
  const byKey = {};
  days.forEach((day) => { byKey[day.key] = day; });
  (rows || []).forEach((r) => {
    const day = byKey[dayKey(new Date(r.date))];
    if (!day) return;
    day.count++;
    if (r.status === "Sukses") day.revenue += Number(r.price || 0);
  });

  const maxRev = Math.max(...days.map((d) => d.revenue), 1);

  // bar chart pendapatan
  const chart = document.getElementById("weekChart");
  chart.innerHTML = days
    .map((d) => {
      const h = d.revenue ? Math.max(6, Math.round((d.revenue / maxRev) * 100)) : 4;
      return (
        '<div class="wk-col">' +
        '  <span class="wk-val">' + (d.revenue ? formatRupiah(d.revenue).replace("Rp", "") : "-") + "</span>" +
        '  <div class="wk-bar" style="height:' + h + '%" title="' + d.label + ": " + d.count + " transaksi, " + formatRupiah(d.revenue) + '"></div>' +
        '  <span class="wk-label">' + d.label + "</span>" +
        "</div>"
      );
    })
    .join("");

  // tabel per hari
  const tbody = document.getElementById("weekTable");
  tbody.innerHTML = days
    .map(
      (d) =>
        "<tr>" +
        "  <td>" + d.label + "</td>" +
        "  <td>" + d.count + "</td>" +
        '  <td class="wk-rupiah">' + (d.revenue ? formatRupiah(d.revenue) : "Rp0") + "</td>" +
        "</tr>"
    )
    .join("");

  // total mingguan
  const total = days.reduce((s, d) => s + d.count, 0);
  const rev = days.reduce((s, d) => s + d.revenue, 0);
  document.getElementById("weekTotal").textContent = total + " transaksi &middot; " + formatRupiah(rev);
}

/* Konfirmasi semua transaksi yang menunggu sekaligus */
async function confirmAll() {
  const rows = await AdminService.getTransactions();
  const pending = rows.filter((r) => r.status === "Menunggu Pembayaran");
  if (!pending.length) return alert("Tidak ada transaksi yang menunggu konfirmasi.");

  if (!confirm("Konfirmasi " + pending.length + " transaksi sekaligus? Semua akan menjadi Sukses.")) return;

  let notified = 0;
  for (const it of pending) {
    await AdminService.confirmTransaction(it._uid, it.id);
  }
  renderAdmin();

  // tawarkan notifikasi WA ke semua pembeli yang punya nomor
  const withWa = pending.filter((it) => it.wa);
  if (withWa.length) {
    if (confirm(withWa.length + " pembeli punya nomor WhatsApp. Kirim notifikasi ke semuanya? (membuka " + withWa.length + " tab wa.me)")) {
      withWa.forEach((it) => window.open(waNotifyURL(it), "_blank", "noopener"));
      notified = withWa.length;
    }
  }
  alert(pending.length + " transaksi dikonfirmasi." + (notified ? "\nNotifikasi WA dikirim ke " + notified + " pembeli." : ""));
}

/* ============================================================
   EKSPOR CSV — format lebih rapi & nyaman dipandang
   - Kolom Harga diformat Rp
   - Tanggal diformat DD/MM/YYYY HH:mm
   - Status ditulis lengkap
   - Ringkasan di bawah: total transaksi, total sukses, total revenue
   - BOM UTF-8 supaya Excel tidak mojibake
   ============================================================ */

/* Escape nilai CSV (koma, kutip, baris baru) */
function csvCell(v) {
  const s = String(v == null ? "" : v);
  return /[,\"\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}

/* Format tanggal untuk CSV: DD/MM/YYYY HH:mm */
function csvFmtDate(isoStr) {
  if (!isoStr) return "";
  const d = new Date(isoStr);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return dd + "/" + mm + "/" + yyyy + " " + hh + ":" + mi;
}

/* Format harga: 5000 → "Rp5.000" */
function csvFmtHarga(val) {
  const n = Number(val || 0);
  return "Rp" + n.toLocaleString("id-ID");
}

/* Status yang sudah dibaca */
function csvStatus(it) {
  const s = it.status || "";
  if (s === "Sukses") return "✅ Sukses";
  if (s === "Menunggu Pembayaran") return "⏳ Menunggu Pembayaran";
  if (s === "Pending") return "⏳ Pending";
  if (s === "Dibatalkan") return "❌ Dibatalkan";
  return s || "-";
}

/* Ekspor CSV */
async function exportCSV() {
  const rows = await AdminService.getTransactions();
  if (!rows.length) return alert("Belum ada transaksi untuk diekspor.");

  /* ---------- Header ---------- */
  const header = [
    "No",
    "Tanggal",
    "Username",
    "Game",
    "ID Game",
    "Paket",
    "Harga",
    "Metode Bayar",
    "No. WhatsApp",
    "Status",
    "Ref ID",
    "Catatan",
  ];

  const lines = [header.join(",")];

  /* ---------- Data rows ---------- */
  rows.forEach((it, idx) => {
    lines.push(
      [
        idx + 1,
        csvFmtDate(it.date),
        it._username || "tanpa-akun",
        it.game,
        it.accId,
        it.pack,
        csvFmtHarga(it.price),
        it.method || "-",
        it.wa || "-",
        csvStatus(it),
        it.refId || "-",
        it.note || "-",
      ].map(csvCell).join(",")
    );
  });

  /* ---------- Ringkasan ---------- */
  const totalAll = rows.length;
  const totalSukses = rows.filter((r) => r.status === "Sukses").length;
  const totalMenunggu = rows.filter((r) => r.status === "Menunggu Pembayaran" || r.status === "Pending").length;
  const totalDibatalkan = rows.filter((r) => r.status === "Dibatalkan").length;
  const revenue = rows
    .filter((r) => r.status === "Sukses")
    .reduce((s, r) => s + Number(r.price || 0), 0);

  lines.push(""); // baris kosong pemisah
  lines.push(",,,===== RINGKASAN =====,,");
  lines.push(",,,Total Transaksi," + csvCell(totalAll) + ",");
  lines.push(",,,Total Sukses," + csvCell(totalSukses) + ",");
  lines.push(",,,Total Menunggu," + csvCell(totalMenunggu) + ",");
  lines.push(",,,Total Dibatalkan," + csvCell(totalDibatalkan) + ",");
  lines.push(",,,Total Pendapatan (Sukses)," + csvCell(csvFmtHarga(revenue)) + ",");
  lines.push(",,,Dicetak pada," + csvCell(csvFmtDate(new Date().toISOString())) + ",");

  /* ---------- Download ---------- */
  const blob = new Blob(["\ufeff" + lines.join("\r\n")], { type: "text/csv;charset=utf-8;" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "Laporan-Transaksi-Digems-" + new Date().toISOString().slice(0, 10) + ".csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(a.href);
}

/* ---------- Login admin (via AdminService) ---------- */
function showAdmin(ok) {
  document.getElementById("adminGate").style.display = ok ? "none" : "";
  document.getElementById("adminPanel").style.display = ok ? "" : "none";
  if (ok) renderAdmin();
}

document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById("adminLoginBtn");
  const passInput = document.getElementById("adminPass");
  const errBox = document.getElementById("adminError");

  if (AdminService.isLoggedIn()) {
    showAdmin(true);
  } else {
    showAdmin(false);
    const attempt = async () => {
      const res = await AdminService.login(passInput.value);
      if (res.ok) {
        errBox.style.display = "none";
        showAdmin(true);
      } else {
        errBox.textContent = res.error || "Password admin salah.";
        errBox.style.display = "block";
        passInput.value = "";
        passInput.focus();
      }
    };
    loginBtn.addEventListener("click", attempt);
    passInput.addEventListener("keydown", (e) => { if (e.key === "Enter") attempt(); });
  }

  document.getElementById("confirmAllBtn").addEventListener("click", confirmAll);
  document.getElementById("exportCsvBtn").addEventListener("click", exportCSV);
  document.getElementById("supplierPollBtn").addEventListener("click", pollSupplierNow);

  // refresh otomatis tiap 30 detik — status supplier sudah dipolling SERVER
  // (server/server.js), jadi render ulang cukup mengambil dari database.
  setInterval(() => {
    if (AdminService.isLoggedIn()) renderAdmin();
  }, 30000);
});
