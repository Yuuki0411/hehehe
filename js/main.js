/* ============================================================
   MAIN — logika bersama semua halaman
   ============================================================ */

/* ---------- Tombol WhatsApp mengambang (kanan bawah) ---------- */
function injectWhatsAppButton() {
  if (document.getElementById("waFloat")) return;
  const btn = document.createElement("a");
  btn.id = "waFloat";
  btn.className = "wa-float";
  btn.href = "https://wa.me/" + SITE.whatsapp + "?text=" + encodeURIComponent(SITE.whatsappMessage);
  btn.target = "_blank";
  btn.rel = "noopener";
  btn.title = "Hubungi Admin";
  btn.innerHTML =
    '<svg viewBox="0 0 32 32" width="30" height="30" fill="#fff"><path d="M16 3C9.4 3 4 8.4 4 15c0 2.1.6 4.2 1.6 6L4 29l8.2-1.6c1.7.9 3.7 1.5 5.8 1.5 6.6 0 12-5.4 12-12S22.6 3 16 3zm0 21.8c-1.8 0-3.5-.5-5-1.4l-.4-.2-4.9 1 1-4.8-.3-.4c-1-1.6-1.5-3.4-1.5-5.3 0-5.4 4.4-9.8 9.8-9.8s9.8 4.4 9.8 9.8-4.4 10.1-9.5 10.1zm5.4-7.3c-.3-.1-1.7-.9-2-1-.3-.1-.5-.1-.7.1-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.5-.6c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5-.1-.1-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.2.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.7-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.1-.3-.2-.6-.3z"/></svg>' +
    '<span class="wa-label">Hubungi Admin</span>';
  document.body.appendChild(btn);
}

/* ---------- Format tanggal (dipakai riwayat & admin) ---------- */
function fmtDate(iso) {
  try {
    return new Date(iso).toLocaleString("id-ID", {
      day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

/* ---------- Notifikasi WhatsApp ke pembeli (dipakai riwayat & admin) ---------- */
function waNotifyURL(item) {
  const msg =
    "Halo! Pembayaran kamu sudah dikonfirmasi ✅\n\n" +
    "Game: " + item.game + "\n" +
    "Paket: " + item.pack + "\n" +
    "Total: " + formatRupiah(item.price) + "\n" +
    "ID Game: " + item.accId + "\n\n" +
    "Terima kasih sudah topup di " + SITE.name + "!";
  return "https://wa.me/" + item.wa + "?text=" + encodeURIComponent(msg);
}

/* ---------- Header: auth area ---------- */
function renderAuthArea() {
  const area = document.getElementById("authArea");
  if (!area) return;
  const session = GameService.getSession();
  const isIndex = /index\.html/i.test(window.location.pathname) || window.location.pathname === '/' || window.location.pathname === '';

  let html = '<div class="header-nav">';

  if (isIndex) {
    html += '<a class="header-link" href="games.html">Semua Game</a>';
  } else {
    html += '<a class="header-link" href="index.html">Beranda</a>';
  }

  if (session) {
    html += '<a class="header-link" href="history.html">Riwayat</a>';
    html += '<button class="user-logout" id="logoutBtn">\u{1F464} ' + escapeHtml(session.username) + ' &times;</button>';
  } else {
    html += '<a class="btn btn-sm btn-primary" href="login.html">Masuk</a>';
    html += '<a class="btn btn-sm btn-outline" href="login.html?mode=register">Daftar</a>';
  }

  html += '</div>';
  area.innerHTML = html;

  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      GameService.logout();
      window.location.reload();
    });
  }
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

/* ---------- Banner email belum terverifikasi ---------- */
function renderVerifyBanner() {
  const session = GameService.getSession();
  const existing = document.getElementById("verifyBanner");
  if (!session || session.verified !== 0) {
    if (existing) existing.remove(); // status berubah → hapus banner lama
    return;
  }
  if (existing) return;

  const b = document.createElement("div");
  b.id = "verifyBanner";
  b.className = "verify-banner";
  b.innerHTML =
    '⚠️ Email <b>' + escapeHtml(session.email) + "</b> belum diverifikasi. " +
    '<button type="button" id="resendVerifyBtn" class="btn btn-sm btn-primary">Kirim ulang link</button>';
  document.body.prepend(b);

  document.getElementById("resendVerifyBtn").addEventListener("click", async () => {
    const r = await GameService.resendVerification(session.email);
    alert(
      r.ok
        ? (r.mailSent
            ? "Link verifikasi dikirim ulang ke " + session.email + " — cek inbox/spam."
            : "Mode pengembangan — buka link di console server: " + (r.devVerifyUrl || ""))
        : (r.error || "Gagal mengirim ulang.")
    );
  });
}

/* ---------- Toggle menu mobile / pad ---------- */
function initNav() {
  const burger = document.getElementById("hamburger");
  const actions = document.getElementById("headerActions");
  if (!burger || !actions) return;
  burger.addEventListener("click", () => {
    const open = actions.classList.toggle("open");
    burger.classList.toggle("active", open);
    burger.setAttribute("aria-expanded", open);
  });
  // tutup menu saat link diklik (mobile)
  actions.addEventListener("click", (e) => {
    if (e.target.tagName === "A" || e.target.tagName === "BUTTON") {
      actions.classList.remove("open");
      burger.classList.remove("active");
    }
  });
}

/* ---------- Pencarian game ---------- */
function initSearch() {
  const input = document.getElementById("searchInput");
  const btn = document.getElementById("searchBtn");
  if (!input) return;
  const go = () => {
    const q = input.value.trim();
    window.location.href = "games.html" + (q ? "?q=" + encodeURIComponent(q) : "");
  };
  if (btn) btn.addEventListener("click", go);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") go();
  });
}

/* ---------- Modal Topup ---------- */
function ensureModal() {
  if (document.getElementById("topupModal")) return;
  const m = document.createElement("div");
  m.id = "topupModal";
  m.className = "modal-overlay";
  m.style.display = "none";
  m.innerHTML =
    '<div class="modal">' +
    '  <button class="modal-close" id="modalClose" aria-label="Tutup">&times;</button>' +
    '  <div class="modal-head">' +
    '    <img id="modalGameImg" alt="" onerror="this.onerror=null;this.src=\'assets/game-placeholder.svg\'">' +
    '    <div><h3 id="modalGameName"></h3><p id="modalGameDesc"></p></div>' +
    "  </div>" +
    '  <label class="field"><span>ID / Username Game</span><input id="modalAccId" placeholder="Masukkan ID game kamu" required></label>' +
    '  <label class="field"><span>Pilih Paket</span></label>' +
    '  <div class="packs" id="modalPacks"></div>' +
    '  <label class="field custom-field" id="customFieldWrap" style="display:none">' +
    '    <span>Nominal Kustom</span><input id="modalCustom" type="number" min="1000" placeholder="Masukkan nominal (Rp)">' +
    "  </label>" +
    '  <div class="modal-total">Total: <b id="modalTotal">-</b></div>' +
    '  <button class="btn btn-primary btn-block" id="modalBuy">Beli Sekarang</button>' +
    '  <p class="modal-note">Setelah pembelian, transaksi tercatat di halaman Riwayat.</p>' +
    "</div>";
  document.body.appendChild(m);

  m.addEventListener("click", (e) => {
    if (e.target === m) closeTopupModal();
  });
  document.getElementById("modalClose").addEventListener("click", closeTopupModal);
  document.getElementById("modalBuy").addEventListener("click", submitTopup);
}

let currentGame = null;
let selectedPack = null;

function openTopupModal(game) {
  ensureModal();
  currentGame = game;
  selectedPack = null;

  document.getElementById("modalGameImg").src = game.image;
  document.getElementById("modalGameImg").alt = game.name;
  document.getElementById("modalGameName").textContent = game.name;
  document.getElementById("modalGameDesc").textContent = game.desc;
  document.getElementById("modalAccId").value = "";

  const wrap = document.getElementById("modalPacks");
  wrap.innerHTML = "";
  game.packs.forEach((p) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "pack";
    btn.innerHTML = "<span>" + p[0] + "</span><b>" + formatRupiah(p[1]) + "</b>";
    btn.addEventListener("click", () => selectPack(p, btn));
    wrap.appendChild(btn);
  });

  // bundle / pass (mis. Weekly Diamond Pass, Starlight Member, Battle Pass)
  if (game.bundles && game.bundles.length) {
    const title = document.createElement("div");
    title.className = "packs-label";
    title.innerHTML = "Bundle &amp; Pass";
    wrap.appendChild(title);
    game.bundles.forEach((b) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "pack bundle";
      btn.innerHTML =
        '<span class="bundle-name"><i class="bundle-tag">' + b.tag + "</i>" + b.name + "</span>" +
        "<b>" + formatRupiah(b.price) + "</b>" +
        (b.desc ? '<em class="bundle-desc">' + b.desc + "</em>" : "");
      btn.addEventListener("click", () => selectPack([b.name, b.price, "bundle"], btn));
      wrap.appendChild(btn);
    });
  }

  const customBtn = document.createElement("button");
  customBtn.type = "button";
  customBtn.className = "pack";
  customBtn.innerHTML = "<span>Paket Kustom</span><b>Isi nominal sendiri</b>";
  customBtn.addEventListener("click", () => {
    document.querySelectorAll(".pack").forEach((b) => b.classList.remove("selected"));
    customBtn.classList.add("selected");
    selectedPack = null;
    document.getElementById("customFieldWrap").style.display = "";
    document.getElementById("modalCustom").value = "";
    document.getElementById("modalTotal").textContent = "-";
  });
  wrap.appendChild(customBtn);
  document.getElementById("customFieldWrap").style.display = "none";

  document.getElementById("topupModal").style.display = "flex";
  document.body.style.overflow = "hidden";
}

function selectPack(pack, btn) {
  document.querySelectorAll(".pack").forEach((b) => b.classList.remove("selected"));
  btn.classList.add("selected");
  selectedPack = pack;
  document.getElementById("customFieldWrap").style.display = "none";
  document.getElementById("modalTotal").textContent = formatRupiah(pack[1]);
}

function closeTopupModal() {
  const m = document.getElementById("topupModal");
  if (m) m.style.display = "none";
  document.body.style.overflow = "";
}

async function submitTopup() {
  const accId = document.getElementById("modalAccId").value.trim();
  if (!accId) return alert("Mohon isi ID / username game kamu.");

  let pack = selectedPack;
  if (!pack) {
    const custom = document.getElementById("modalCustom").value;
    if (!custom) return alert("Pilih paket terlebih dahulu.");
    pack = ["Paket Kustom", Number(custom)];
  }

  const session = GameService.getSession();
  if (!session) {
    alert("Silakan login terlebih dahulu untuk melakukan topup.");
    window.location.href = "login.html";
    return;
  }

  await GameService.createPurchase(session.uid, {
    slug: currentGame.slug,
    game: currentGame.name,
    gameImage: currentGame.image,
    accId,
    pack: pack[0],
    price: pack[1],
    bundle: pack[2] === "bundle",
    status: "Menunggu Pembayaran",
  });

  alert("Pembayaran diterima!\n" + currentGame.name + " - " + pack[0] + "\n" + formatRupiah(pack[1]) + "\nStatus: Menunggu Pembayaran. Admin akan mengonfirmasi setelah pembayaran terverifikasi.");
  closeTopupModal();
}

/* ---------- Inisialisasi bersama ---------- */
document.addEventListener("DOMContentLoaded", async () => {
  injectWhatsAppButton();
  renderAuthArea();
  renderVerifyBanner();
  // sinkronkan status verifikasi email dari server (sumber kebenaran)
  try {
    const me = await GameService.me();
    if (me) {
      renderAuthArea();
      renderVerifyBanner();
    }
  } catch (e) { /* offline — biarkan sesi lokal */ }
  initNav();
  initSearch();
  // kirim transaksi yang masih di outbox ke database server
  if (typeof GameService.flushOutbox === "function") {
    GameService.flushOutbox();
    setInterval(() => GameService.flushOutbox(), 20000);
  }
  // tautkan event ke tombol topup dinamis (semua halaman)
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-topup]");
    if (!btn) return;
    const slug = btn.getAttribute("data-topup");
    const game = (window.GAMES || GAMES).find((g) => g.slug === slug);
    if (game) openTopupModal(game);
  });
});
