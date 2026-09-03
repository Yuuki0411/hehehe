/* ============================================================
   RIWAYAT PEMBELIAN
   ============================================================ */

/* Badge status + aksi konfirmasi admin */
function statusHTML(it) {
  const s = it.status || "";
  if (s === "Sukses") {
    return '<span class="hi-status ok">&#9989; Sukses</span>';
  }
  if (s === "Menunggu Pembayaran") {
    return (
      '<span class="hi-status wait">&#9203; Menunggu Pembayaran</span>' +
      '<button class="btn btn-sm btn-primary" data-confirm="' + it.id + '">Konfirmasi Admin</button>' +
      '<button class="btn btn-sm btn-danger" data-cancel="' + it.id + '">Batalkan</button>'
    );
  }
  if (s === "Dibatalkan") {
    return '<span class="hi-status cancel">&#128683; Dibatalkan</span>';
  }
  if (s === "Pending") {
    return '<span class="hi-status wait">&#9203; Pending</span>';
  }
  return '<span class="hi-status fail">&#10060; ' + s + "</span>";
}

function noteHTML(it) {
  const parts = [];
  if (it.refId) parts.push("Ref: " + it.refId);
  if (it.note) parts.push(it.note);
  if (it.method) parts.push(it.method);
  return parts.length ? '<div class="hi-note">' + parts.join(" &middot; ") + "</div>" : "";
}

/* Filter status aktif (Semua / Menunggu / Sukses / Dibatalkan) */
let historyFilter = "Semua";

function statusGroup(it) {
  const s = it.status || "";
  if (s === "Sukses") return "Sukses";
  if (s === "Menunggu Pembayaran" || s === "Pending") return "Menunggu";
  if (s === "Dibatalkan") return "Dibatalkan";
  return "Lainnya";
}

/* Render baris tab filter + jumlah tiap status */
function renderFilterTabs(items) {
  const el = document.getElementById("historyFilter");
  if (!el) return;
  const groups = ["Semua", "Menunggu", "Sukses", "Dibatalkan"];
  const count = {};
  groups.forEach((g) => (count[g] = 0));
  items.forEach((it) => {
    count[statusGroup(it)] = (count[statusGroup(it)] || 0) + 1;
  });
  el.innerHTML = groups
    .map(
      (g) =>
        '<button class="hfilter-tab' +
        (historyFilter === g ? " active" : "") +
        '" data-filter="' +
        g +
        '">' +
        g +
        ' <span class="hfilter-count">' +
        (g === "Semua" ? items.length : count[g] || 0) +
        "</span></button>"
    )
    .join("");
  el.querySelectorAll(".hfilter-tab").forEach((btn) => {
    btn.addEventListener("click", () => {
      historyFilter = btn.getAttribute("data-filter");
      renderHistory();
    });
  });
}

async function renderHistory() {
  const session = GameService.getSession();
  const list = document.getElementById("historyList");
  const stats = document.getElementById("historyStats");
  const clearBtn = document.getElementById("clearHistory");

  // sinkronkan status dengan supplier (auto-konfirmasi saat supplier Sukses)
  if (typeof GameService.syncSupplierStatus === "function") {
    try { await GameService.syncSupplierStatus(); } catch (e) { console.warn(e); }
  }

  if (!session) {
    stats.style.display = "none";
    if (clearBtn) clearBtn.style.display = "none";
    list.innerHTML =
      '<div class="empty">&#128274; Kamu belum login.<br>Silakan <a href="login.html">login / daftar</a> untuk melihat riwayat pembelian.</div>';
    return;
  }

  const items = await GameService.getHistory(session.uid);

  if (!items.length) {
    stats.style.display = "none";
    if (clearBtn) clearBtn.style.display = "none";
    list.innerHTML =
      '<div class="empty">&#128203; Belum ada transaksi.<br>Yuk <a href="games.html">topup game pertama kamu</a>!</div>';
    return;
  }

  stats.style.display = "";
  if (clearBtn) clearBtn.style.display = "";

  // total hanya dari transaksi yang sudah berhasil (Sukses)
  const total = items.reduce((s, it) => s + (it.status === "Sukses" ? Number(it.price || 0) : 0), 0);
  const waiting = items.filter((it) => it.status === "Menunggu Pembayaran").length;
  document.getElementById("statCount").textContent = items.length;
  document.getElementById("statTotal").textContent = formatRupiah(total);

  // tab filter status
  renderFilterTabs(items);

  // terapkan filter aktif
  const shown =
    historyFilter === "Semua" ? items : items.filter((it) => statusGroup(it) === historyFilter);

  if (!shown.length) {
    list.innerHTML =
      '<div class="empty">&#128269; Tidak ada transaksi dengan status <b>' +
      historyFilter +
      "</b>.</div>";
    return;
  }

  list.innerHTML = shown
    .map(
      (it) =>
        '<div class="history-item">' +
        '  <img src="' + (it.gameImage || "assets/logo-noname.svg") + '" alt="' + it.game + '">' +
        '  <div class="hi-info">' +
        "    <h4>" + it.game + (it.bundle ? ' <span class="bundle-badge">&#127915; Bundle</span>' : "") + "</h4>" +
        "    <p>ID Game: <b>" + it.accId + "</b> &middot; Paket: " + it.pack + "</p>" +
        noteHTML(it) +
        "  </div>" +
        '  <div class="hi-price">' + formatRupiah(it.price) + "</div>" +
        "  " + statusHTML(it) +
        '  <div class="hi-date">&#128337; ' + fmtDate(it.date) + "</div>" +
        "</div>"
    )
    .join("");

  if (waiting) {
    list.insertAdjacentHTML(
      "beforeend",
      '<div class="history-hint">&#128274; Ada <b>' + waiting + "</b> transaksi menunggu konfirmasi pembayaran oleh admin.</div>"
    );
  }

  // tombol batalkan transaksi
  list.querySelectorAll("[data-cancel]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.getAttribute("data-cancel");
      const item = items.find((p) => p.id === id);
      const reason = prompt("Alasan pembatalan (opsional):", "");
      if (reason === null) return; // user batal
      if (!confirm("Batalkan transaksi ini? Status akan menjadi Dibatalkan.")) return;
      await GameService.cancelPurchase(session.uid, id, reason.trim());
      renderHistory();
    });
  });

  // tombol konfirmasi admin
  list.querySelectorAll("[data-confirm]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.getAttribute("data-confirm");
      const item = items.find((p) => p.id === id);
      if (!confirm("Konfirmasi pembayaran transaksi ini? Status akan menjadi Sukses.")) return;
      await GameService.confirmPurchase(session.uid, id);
      renderHistory();
      // notifikasi WhatsApp ke pembeli bila nomornya tersedia
      if (item && item.wa) {
        if (confirm("Kirim notifikasi WhatsApp ke pembeli (" + item.wa + ")?")) {
          window.open(waNotifyURL(item), "_blank", "noopener");
        }
      }
    });
  });

  if (clearBtn) {
    clearBtn.style.display = "";
    clearBtn.addEventListener("click", () => {
      if (confirm("Hapus semua riwayat pembelian?")) {
        GameService.clearHistory(session.uid);
        renderHistory();
      }
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  renderHistory();
  // refresh otomatis tiap 30 detik — status supplier sudah dipolling SERVER
  // (server/server.js), jadi render ulang cukup mengambil dari database.
  setInterval(() => {
    if (GameService.getSession()) renderHistory();
  }, 30000);
});
