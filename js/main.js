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
const DEFAULT_AVATAR = "assets/avatar-default.svg";

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
    const photo = session.photo || DEFAULT_AVATAR;
    html +=
      '<div class="user-menu" id="userMenu">' +
      '  <button type="button" class="avatar-btn" id="avatarBtn" aria-label="Menu profil" aria-expanded="false">' +
      '    <img src="' + photo + '" alt="Foto profil" onerror="this.onerror=null;this.src=\'' + DEFAULT_AVATAR + '\'">' +
      '  </button>' +
      '  <div class="user-dropdown" id="userDropdown" hidden>' +
      '    <div class="dd-head">' +
      '      <img src="' + photo + '" alt="" onerror="this.onerror=null;this.src=\'' + DEFAULT_AVATAR + '\'">' +
      '      <div><b>' + escapeHtml(session.username) + '</b><span>' + escapeHtml(session.email) + '</span></div>' +
      '    </div>' +
      '    <button type="button" class="dd-item" id="ddProfile">&#128100; Profil</button>' +
      '    <a class="dd-item" href="history.html">&#128203; Riwayat</a>' +
      '    <button type="button" class="dd-item dd-danger" id="ddLogout">&#128682; Keluar</button>' +
      '  </div>' +
      '</div>';
  } else {
    html += '<a class="btn btn-sm btn-primary" href="login.html">Masuk</a>';
    html += '<a class="btn btn-sm btn-outline" href="login.html?mode=register">Daftar</a>';
  }

  html += '</div>';
  area.innerHTML = html;

  if (session) {
    const btn = document.getElementById("avatarBtn");
    const dd = document.getElementById("userDropdown");

    const openDropdown = (open) => {
      dd.hidden = !open;
      btn.classList.toggle("open", open);
      btn.setAttribute("aria-expanded", open);
    };
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      openDropdown(dd.hidden);
    });
    // tutup dropdown saat klik di luar
    document.addEventListener("click", (e) => {
      if (!dd.hidden && !e.target.closest("#userMenu")) openDropdown(false);
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !dd.hidden) openDropdown(false);
    });

    document.getElementById("ddProfile").addEventListener("click", () => {
      openDropdown(false);
      openProfileModal();
    });
    document.getElementById("ddLogout").addEventListener("click", () => {
      GameService.logout();
      window.location.reload();
    });
  }
}

/* ---------- Modal Profil (foto / username / password) ---------- */
function ensureProfileModal() {
  if (document.getElementById("profileModal")) return;
  const m = document.createElement("div");
  m.id = "profileModal";
  m.className = "modal-overlay";
  m.style.display = "none";
  m.innerHTML =
    '<div class="modal profile-modal">' +
    '  <button class="modal-close" id="profileModalClose" aria-label="Tutup">&times;</button>' +
    '  <div class="modal-head"><h3>&#128100; Profil Saya</h3></div>' +
    // Foto profil
    '  <section class="prof-sec">' +
    '    <h4>Foto Profil</h4>' +
    '    <div class="prof-photo-row">' +
    '      <img id="pfpPreview" alt="Foto profil">' +
    '      <div class="prof-photo-actions">' +
    '        <input type="file" id="pfpFile" accept="image/*" hidden>' +
    '        <button type="button" class="btn btn-sm btn-outline" id="pfpChoose">Pilih Foto</button>' +
    '        <button type="button" class="btn btn-sm btn-primary" id="pfpSave" hidden>Simpan Foto</button>' +
    '        <p class="msg" id="pfpMsg"></p>' +
    '      </div>' +
    '    </div>' +
    '  </section>' +
    '  <hr class="prof-div">' +
    // Ganti username
    '  <section class="prof-sec">' +
    '    <h4>Ganti Username</h4>' +
    '    <p class="prof-info">Perubahan username perlu verifikasi: kode dikirim ke email <b id="puEmail"></b>.</p>' +
    '    <label class="field"><span>Username baru</span><input id="puUsername" placeholder="Username baru" autocomplete="off"></label>' +
    '    <div class="prof-otp">' +
    '      <label class="field otp-input"><span>Kode verifikasi</span><input id="puCode" inputmode="numeric" maxlength="6" placeholder="6 digit" autocomplete="one-time-code"></label>' +
    '      <button type="button" class="btn btn-sm btn-outline otp-btn" id="puSend">Kirim Kode</button>' +
    '    </div>' +
    '    <button type="button" class="btn btn-primary btn-block" id="puSave">Simpan Username</button>' +
    '    <p class="msg" id="puMsg"></p>' +
    '  </section>' +
    '  <hr class="prof-div">' +
    // Ganti password
    '  <section class="prof-sec">' +
    '    <h4>Ganti Password</h4>' +
    '    <p class="prof-info">Perubahan password perlu verifikasi: kode dikirim ke email <b id="ppEmail"></b>.</p>' +
    '    <label class="field"><span>Password saat ini</span><input id="ppCurrent" type="password" placeholder="Password saat ini" autocomplete="current-password"></label>' +
    '    <label class="field"><span>Password baru</span><input id="ppNew" type="password" placeholder="Minimal 6 karakter" autocomplete="new-password"></label>' +
    '    <div class="prof-otp">' +
    '      <label class="field otp-input"><span>Kode verifikasi</span><input id="ppCode" inputmode="numeric" maxlength="6" placeholder="6 digit" autocomplete="one-time-code"></label>' +
    '      <button type="button" class="btn btn-sm btn-outline otp-btn" id="ppSend">Kirim Kode</button>' +
    '    </div>' +
    '    <button type="button" class="btn btn-primary btn-block" id="ppSave">Simpan Password</button>' +
    '    <p class="msg" id="ppMsg"></p>' +
    '  </section>' +
    '</div>';
  document.body.appendChild(m);

  const closeModal = () => {
    m.style.display = "none";
    document.body.style.overflow = "";
  };
  m.addEventListener("click", (e) => {
    if (e.target === m) closeModal();
  });
  document.getElementById("profileModalClose").addEventListener("click", closeModal);

  const session = () => GameService.getSession();
  const setMsg = (id, text, isError) => {
    const el = document.getElementById(id);
    el.textContent = text || "";
    el.className = "msg" + (isError ? " error" : " ok");
  };

  // --- Foto profil ---
  document.getElementById("pfpChoose").addEventListener("click", () => {
    document.getElementById("pfpFile").click();
  });
  document.getElementById("pfpFile").addEventListener("change", (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    cropImageToDataUrl(file, 256, (dataUrl) => {
      if (!dataUrl) return setMsg("pfpMsg", "Gagal membaca gambar.", true);
      document.getElementById("pfpPreview").src = dataUrl;
      document.getElementById("pfpSave").hidden = false;
      setMsg("pfpMsg", "");
    });
  });
  document.getElementById("pfpSave").addEventListener("click", async () => {
    const dataUrl = document.getElementById("pfpPreview").src;
    if (!dataUrl || dataUrl === DEFAULT_AVATAR) return;
    const r = await GameService.updatePhoto(dataUrl);
    if (r.ok) {
      setMsg("pfpMsg", "Foto profil berhasil diubah.", false);
      document.getElementById("pfpSave").hidden = true;
      renderAuthArea();
    } else {
      setMsg("pfpMsg", r.error || "Gagal menyimpan foto.", true);
    }
  });

  // --- Kirim kode verifikasi (username & password) ---
  const wireSend = (btnId, msgId, cb) => {
    document.getElementById(btnId).addEventListener("click", async () => {
      const r = await GameService.sendChangeCode();
      if (!r.ok) return setMsg(msgId, r.error || "Gagal mengirim kode.", true);
      setMsg(msgId, r.mailSent
        ? "Kode verifikasi terkirim ke email kamu — cek inbox/spam."
        : "Mode pengembangan — kode verifikasi kamu: " + r.devCode, false);
      cb && cb();
    });
  };
  wireSend("puSend", "puMsg");
  wireSend("ppSend", "ppMsg");

  // --- Simpan username ---
  document.getElementById("puSave").addEventListener("click", async () => {
    const newUsername = document.getElementById("puUsername").value.trim();
    const code = document.getElementById("puCode").value.trim();
    if (newUsername.length < 3) return setMsg("puMsg", "Username minimal 3 karakter.", true);
    if (!code) return setMsg("puMsg", "Masukkan kode verifikasi (klik Kirim Kode dulu).", true);
    const r = await GameService.updateUsername(newUsername, code);
    if (!r.ok) return setMsg("puMsg", r.error || "Gagal mengganti username.", true);
    setMsg("puMsg", "Username berhasil diganti!", false);
    document.getElementById("puUsername").value = "";
    document.getElementById("puCode").value = "";
    renderAuthArea();
  });

  // --- Simpan password ---
  document.getElementById("ppSave").addEventListener("click", async () => {
    const oldPassword = document.getElementById("ppCurrent").value;
    const newPassword = document.getElementById("ppNew").value;
    const code = document.getElementById("ppCode").value.trim();
    if (!oldPassword) return setMsg("ppMsg", "Masukkan password saat ini.", true);
    if (newPassword.length < 6) return setMsg("ppMsg", "Password baru minimal 6 karakter.", true);
    if (!code) return setMsg("ppMsg", "Masukkan kode verifikasi (klik Kirim Kode dulu).", true);
    const r = await GameService.updatePassword(oldPassword, newPassword, code);
    if (!r.ok) return setMsg("ppMsg", r.error || "Gagal mengganti password.", true);
    setMsg("ppMsg", "Password berhasil diganti!", false);
    document.getElementById("ppCurrent").value = "";
    document.getElementById("ppNew").value = "";
    document.getElementById("ppCode").value = "";
  });
}

function openProfileModal() {
  ensureProfileModal();
  const s = GameService.getSession();
  if (!s) return alert("Silakan login terlebih dahulu.");

  const photo = s.photo || DEFAULT_AVATAR;
  document.getElementById("pfpPreview").src = photo;
  document.getElementById("pfpSave").hidden = true;
  document.getElementById("pfpFile").value = "";
  document.getElementById("puEmail").textContent = s.email;
  document.getElementById("ppEmail").textContent = s.email;
  ["pfpMsg", "puMsg", "ppMsg"].forEach((id) => { document.getElementById(id).textContent = ""; });

  document.getElementById("profileModal").style.display = "flex";
  document.body.style.overflow = "hidden";
}

/* Baca file gambar, potong jadi persegi, perkecil → data URL JPEG. */
function cropImageToDataUrl(file, size, cb) {
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      const side = Math.min(img.width, img.height);
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      canvas.getContext("2d").drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, size, size);
      cb(canvas.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = () => cb(null);
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
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
