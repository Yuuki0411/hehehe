/* ============================================================
   PEMBAYARAN — satu halaman untuk semua game
   ============================================================ */

/* Daftar metode pembayaran (salinan harga placeholder — sesuaikan nomor rekening milikmu) */
const PAY_METHODS = [
  { id: "qris",   label: "QRIS",        icon: "&#128241;", image: "assets/qris.svg", note: "Scan QRIS di bawah ini memakai aplikasi e-wallet / m-banking apa pun (BCA, BNI, Mandiri, BRI, OVO, DANA, GoPay, ShopeePay)." },
  { id: "bca",    label: "Transfer BCA", icon: "&#127974;", account: "1234567890", holder: "Topup Digems", note: "Transfer ke rekening BCA a.n. Topup Digems. Konfirmasi otomatis setelah transfer." },
  { id: "bni",    label: "Transfer BNI", icon: "&#127974;", account: "1234567890", holder: "Topup Digems", note: "Transfer ke rekening BNI a.n. Topup Digems. Konfirmasi otomatis setelah transfer." },
  { id: "mandiri", label: "Transfer Mandiri", icon: "&#127974;", account: "1234567890", holder: "Topup Digems", note: "Transfer ke rekening Mandiri a.n. Topup Digems. Konfirmasi otomatis setelah transfer." },
  { id: "ovo",    label: "OVO",          icon: "&#128176;", account: "0851-6765-3731", holder: "Topup Digems", note: "Bayar lewat OVO ke nomor di bawah ini (Topup Digems)." },
  { id: "dana",   label: "DANA",         icon: "&#128176;", account: "0851-6765-3731", holder: "Topup Digems", note: "Bayar lewat DANA ke nomor di bawah ini (Topup Digems)." },
  { id: "gopay",  label: "GoPay",        icon: "&#128176;", account: "0851-6765-3731", holder: "Topup Digems", note: "Bayar lewat GoPay ke nomor di bawah ini (Topup Digems)." },
  { id: "shopeepay", label: "ShopeePay", icon: "&#128176;", account: "0851-6765-3731", holder: "Topup Digems", note: "Bayar lewat ShopeePay ke nomor di bawah ini (Topup Digems)." },
];

/* Aturan validasi format identitas.
   Tiap fungsi mengembalikan pesan error (string) bila tidak valid, atau "" bila valid. */
const FIELD_RULES = {
  // UID game gacha (Genshin, HSR, ZZZ, WuWa, dll.) harus angka
  uid: (v) => (/^\d+$/.test(v) ? "" : "UID harus berupa angka."),
  // Server ID (ML, HOK) harus angka
  digits: (v, label) => (/^\d+$/.test(v) ? "" : label + " harus berupa angka."),
  // Riot ID harus berisi "#" (contoh: nama#1234)
  riot: (v) => (v.includes("#") ? "" : "Riot ID harus berisi # (contoh: nama#1234)."),
  // Player Tag harus diawali "#" (CoC, Clash Royale)
  tag: (v) => (v.startsWith("#") ? "" : "Player Tag harus diawali # (contoh: #ABC123)."),
};

/* Kolom identitas per game.
   - Tanpa konfigurasi: satu kolom "ID / Username Game".
   - Game tertentu butuh lebih (mis. Mobile Legends: ID + Server ID).
   key      : nama field (disimpan ke transaksi)
   label    : teks yang tampil
   short    : label pendek untuk pratinjau ringkasan
   ph       : placeholder
   opt      : true = kolom opsional (boleh kosong)
   rule     : nama aturan di FIELD_RULES, atau fungsi (v) => pesan | ""
   min      : panjang minimum (angka)
   minMsg   : pesan error khusus untuk panjang minimum */
const GAME_FIELDS = {
  ml: [
    { key: "accId", label: "ID Game", short: "ID", ph: "Contoh: 123456789", min: 8, minMsg: "ID game minimal 8 karakter." },
    { key: "serverId", label: "Server ID", short: "Server", ph: "Contoh: 1234", rule: "digits", min: 3, minMsg: "Server ID minimal 3 angka." },
  ],
  hok: [
    { key: "accId", label: "ID Game", short: "ID", ph: "Contoh: 123456789", min: 8, minMsg: "ID game minimal 8 karakter." },
    { key: "serverId", label: "Server ID", short: "Server", ph: "Contoh: 1234", rule: "digits", min: 3, minMsg: "Server ID minimal 3 angka." },
  ],
  codm: [
    { key: "accId", label: "ID / Username", short: "ID", ph: "Contoh: 123456789", min: 6, minMsg: "ID / username minimal 6 karakter." },
    { key: "serverId", label: "Server", short: "Server", ph: "Contoh: 1 (opsional)", opt: true, rule: "digits" },
  ],
  genshin: [
    { key: "accId", label: "UID", ph: "Contoh: 812345678", rule: "uid", min: 9, minMsg: "UID minimal 9 digit angka." },
  ],
  hsr: [
    { key: "accId", label: "UID", ph: "Contoh: 812345678", rule: "uid", min: 9, minMsg: "UID minimal 9 digit angka." },
  ],
  zzz: [
    { key: "accId", label: "UID", ph: "Contoh: 812345678", rule: "uid", min: 9, minMsg: "UID minimal 9 digit angka." },
  ],
  "wuthering-waves": [
    { key: "accId", label: "UID", ph: "Contoh: 812345678", rule: "uid", min: 9, minMsg: "UID minimal 9 digit angka." },
  ],
  "tower-of-fantasy": [
    { key: "accId", label: "UID", ph: "Contoh: 812345678", rule: "uid", min: 9, minMsg: "UID minimal 9 digit angka." },
  ],
  "honkai-impact-3rd": [
    { key: "accId", label: "UID", ph: "Contoh: 812345678", rule: "uid", min: 9, minMsg: "UID minimal 9 digit angka." },
  ],
  valorant: [
    { key: "accId", label: "Riot ID", ph: "Contoh: nama#1234", rule: "riot" },
  ],
  "wild-rift": [
    { key: "accId", label: "Riot ID", ph: "Contoh: nama#1234", rule: "riot" },
  ],
  pubg: [
    { key: "accId", label: "ID / Nickname", ph: "Contoh: 1234567890", min: 8, minMsg: "ID / nickname minimal 8 karakter." },
  ],
  ff: [
    { key: "accId", label: "ID / Nickname", ph: "Contoh: 1234567890", min: 8, minMsg: "ID / nickname minimal 8 karakter." },
  ],
  roblox: [
    { key: "accId", label: "Username Roblox", ph: "Contoh: player123" },
  ],
  "clash-royale": [
    { key: "accId", label: "Player Tag", ph: "Contoh: #ABC123", rule: "tag" },
  ],
  coc: [
    { key: "accId", label: "Player Tag", ph: "Contoh: #ABC123", rule: "tag" },
  ],
  "magic-chess-gogo": [
    { key: "accId", label: "ID Game", short: "ID", ph: "Contoh: 123456789", min: 8, minMsg: "ID game minimal 8 karakter." },
    { key: "serverId", label: "Server ID", short: "Server", ph: "Contoh: 1234", rule: "digits", min: 3, minMsg: "Server ID minimal 3 angka." },
  ],
};

const DEFAULT_FIELDS = [{ key: "accId", label: "ID / Username Game", ph: "Masukkan ID / username game kamu" }];

let payCurrent = null;   // game terpilih
let payPack = null;      // paket terpilih
let payMethod = PAY_METHODS[0];
let payValues = {};      // nilai kolom identitas
let payErrors = {};      // pesan error per kolom (key -> pesan)

function currentFields(game) {
  return GAME_FIELDS[game.slug] || DEFAULT_FIELDS;
}

/* Validasi satu kolom. Return pesan error ("" bila valid).
   showEmpty: true = kolom wajib yang kosong ikut dianggap error (untuk submit). */
function validateField(f, value, showEmpty) {
  if (value) {
    if (typeof f.rule === "function") {
      const msg = f.rule(value);
      if (msg) return msg;
    } else if (f.rule && FIELD_RULES[f.rule]) {
      const msg = FIELD_RULES[f.rule](value, f.label);
      if (msg) return msg;
    }
    // panjang minimum
    if (f.min && value.length < f.min) {
      return f.minMsg || (f.label + " minimal " + f.min + " karakter.");
    }
  }
  if (showEmpty && !f.opt && !value) return "Mohon isi " + f.label + ".";
  return "";
}

/* Status semua kolom identitas valid (wajib terisi & format benar) */
function fieldsValid() {
  return currentFields(payCurrent).every((f) => !validateField(f, payValues[f.key] || "", true));
}

/* Aktifkan/nonaktifkan tombol Bayar berdasarkan validitas identitas */
function updatePayButton() {
  const btn = document.getElementById("payBtn");
  if (!btn) return;
  const valid = fieldsValid();
  btn.disabled = !valid;
  btn.classList.toggle("btn-disabled", !valid);
  btn.title = valid ? "" : "Lengkapi identitas game dengan benar terlebih dahulu.";
}

async function initPayGame() {
  // game ditentukan dari URL (?game=slug), default game pertama
  // Game diambil dari server (GET /api/games) — saat supplier aktif, server
  // sudah menerapkan harga supplier (paket: [label, harga supplier, harga
  // lokal]); apikey supplier tidak pernah ada di browser.
  const params = new URLSearchParams(window.location.search);
  const wanted = params.get("game");
  const games = (typeof GameService !== "undefined" && GameService.getGames)
    ? await GameService.getGames().catch(() => GAMES)
    : GAMES;
  const game = games.find((g) => g.slug === wanted) || games[0] || GAMES[0];
  setPayGame(game);
}

function setPayGame(game) {
  payCurrent = game;
  payPack = null;
  payValues = {};

  document.getElementById("payGameInfo").innerHTML =
    '<img src="' + game.image + '" alt="' + game.name + '" onerror="this.onerror=null;this.src=\'assets/game-placeholder.svg\'">' +
    "  <div>" +
    "    <h3>" + game.name + "</h3>" +
    "    <p>" + game.desc + "</p>" +
    "  </div>";

  // kolom identitas dinamis sesuai game
  renderFields();

  // render paket
  const wrap = document.getElementById("payPacks");
  wrap.innerHTML = "";
  game.packs.forEach((p) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "pack";
    // p = [label, harga, (opsional) harga lokal]. Bila server mengirim harga
    // supplier (index 2 = harga lokal), harga yang tampil & dibayar tetap
    // HARGA JUAL LOKAL; harga supplier hanya untuk info margin (admin).
    const sell = typeof p[2] === "number" ? p[2] : p[1];
    btn.innerHTML = "<span>" + p[0] + "</span><b>" + formatRupiah(sell) + "</b>";
    btn.addEventListener("click", () => selectPayPack(p, btn));
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
      btn.addEventListener("click", () => selectPayPack([b.name, b.price, "bundle"], btn));
      wrap.appendChild(btn);
    });
  }

  // paket kustom
  const customBtn = document.createElement("button");
  customBtn.type = "button";
  customBtn.className = "pack";
  customBtn.innerHTML = "<span>Paket Kustom</span><b>Isi nominal sendiri</b>";
  customBtn.addEventListener("click", () => {
    document.querySelectorAll("#payPacks .pack").forEach((b) => b.classList.remove("selected"));
    customBtn.classList.add("selected");
    payPack = null;
    document.getElementById("payCustomWrap").style.display = "";
    document.getElementById("payCustom").value = "";
    updateSummary();
  });
  wrap.appendChild(customBtn);
  document.getElementById("payCustomWrap").style.display = "none";
  updateSummary();
}

/* Render kolom identitas dinamis (mis. ML: ID Game + Server ID) */
function renderFields() {
  const wrap = document.getElementById("payFields");
  if (!wrap) return;
  wrap.innerHTML = "";
  currentFields(payCurrent).forEach((f) => {
    const label = document.createElement("label");
    label.className = "field";
    const span = document.createElement("span");
    span.textContent = f.label;
    const input = document.createElement("input");
    input.setAttribute("data-key", f.key);
    input.placeholder = f.ph || "";
    input.value = payValues[f.key] || "";
    input.addEventListener("input", () => {
      payValues[f.key] = input.value.trim();
      payErrors[f.key] = validateField(f, payValues[f.key], false);
      renderFieldError(input, payErrors[f.key]);
      updateSummary();
      updatePayButton();
    });
    label.appendChild(span);
    label.appendChild(input);
    wrap.appendChild(label);
  });
  updatePayButton();
}

/* Tampilkan/sembunyikan pesan error di bawah input */
function renderFieldError(input, msg) {
  const wrap = input.parentElement;
  let err = wrap.querySelector(".field-error");
  if (msg) {
    if (!err) {
      err = document.createElement("small");
      err.className = "field-error";
      wrap.appendChild(err);
    }
    err.textContent = msg;
    input.classList.add("input-error");
  } else {
    if (err) err.remove();
    input.classList.remove("input-error");
  }
}

/* Pratinjau identitas untuk ringkasan, mis. "ID: 123456789 · Server: 4321" */
function identityPreview() {
  const fields = currentFields(payCurrent);
  const parts = fields
    .filter((f) => payValues[f.key])
    .map((f) => (f.short || f.label) + ": " + payValues[f.key]);
  return parts.length ? parts.join(" · ") : "-";
}

function selectPayPack(pack, btn) {
  document.querySelectorAll("#payPacks .pack").forEach((b) => b.classList.remove("selected"));
  btn.classList.add("selected");
  payPack = pack;
  document.getElementById("payCustomWrap").style.display = "none";
  updateSummary();
}

function renderMethods() {
  const wrap = document.getElementById("payMethods");
  wrap.innerHTML = "";
  PAY_METHODS.forEach((m) => {
    const label = document.createElement("label");
    label.className = "pay-method" + (m.id === payMethod.id ? " selected" : "");
    label.innerHTML =
      '<input type="radio" name="payMethod" value="' + m.id + '"' + (m.id === payMethod.id ? " checked" : "") + ">" +
      "  <span class=\"pm-icon\">" + m.icon + "</span>" +
      '  <span class="pm-label">' + m.label + "</span>";
    label.addEventListener("click", () => {
      payMethod = m;
      document.querySelectorAll(".pay-method").forEach((el) => el.classList.toggle("selected", el === label));
      updateMethodDetail();
    });
    wrap.appendChild(label);
  });
  updateMethodDetail();
}

/* Tampilkan detail metode: gambar QR (bila ada), kartu rekening + tombol salin */
function updateMethodDetail() {
  document.getElementById("payNote").textContent = payMethod.note;
  const qrBox = document.getElementById("payQr");
  if (!qrBox) return;

  let html = "";
  if (payMethod.image) {
    html +=
      '<div class="pay-qr-card">' +
      '  <img src="' + payMethod.image + '" alt="QRIS Topup Digems" onerror="this.onerror=null;this.src=\'assets/game-placeholder.svg\'">' +
      '  <p>Scan QRIS di atas untuk menyelesaikan pembayaran.</p>' +
      "</div>";
  }
  if (payMethod.account) {
    html +=
      '<div class="pay-account-card">' +
      '  <div class="pa-row"><span>Nomor Tujuan</span><b id="payAccountNo">' + payMethod.account + "</b></div>" +
      '  <div class="pa-row"><span>Atas Nama</span><b>' + payMethod.holder + "</b></div>" +
      '  <button type="button" class="btn btn-primary btn-block" id="payCopyBtn">&#128203; Salin Nomor Rekening</button>' +
      "</div>";
  }
  qrBox.style.display = html ? "" : "none";
  qrBox.innerHTML = html;

  // aksi salin ke clipboard
  const copyBtn = document.getElementById("payCopyBtn");
  if (copyBtn) {
    copyBtn.addEventListener("click", () => {
      const num = document.getElementById("payAccountNo").textContent;
      const done = () => {
        copyBtn.textContent = "&#9989; Nomor Tersalin!";
        copyBtn.classList.add("copied");
        setTimeout(() => {
          copyBtn.innerHTML = "&#128203; Salin Nomor Rekening";
          copyBtn.classList.remove("copied");
        }, 2000);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(num).then(done).catch(() => fallbackCopy(num, done));
      } else {
        fallbackCopy(num, done);
      }
    });
  }
}

/* Fallback salin untuk browser tanpa navigator.clipboard */
function fallbackCopy(text, done) {
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.style.position = "fixed";
  ta.style.opacity = "0";
  document.body.appendChild(ta);
  ta.select();
  try { document.execCommand("copy"); } catch (e) { /* abaikan */ }
  document.body.removeChild(ta);
  if (done) done();
}

function updateSummary() {
  let price = null;
  let supplierInfo = null;
  if (payPack) {
    // paket dari server dengan harga supplier: [label, harga supplier, harga lokal]
    if (typeof payPack[2] === "number") {
      supplierInfo = { sup: payPack[1], local: payPack[2] };
      price = payPack[2];
    } else {
      price = payPack[1];
    }
  } else {
    const custom = document.getElementById("payCustom");
    if (custom && custom.value) price = Number(custom.value) || null;
  }
  const game = payCurrent;
  if (game) {
    document.getElementById("psImg").src = game.image;
    document.getElementById("psGame").textContent = game.name;
    document.getElementById("psPack").textContent = payPack ? payPack[0] : "Paket Kustom / belum pilih";
  }
  const ident = document.getElementById("psIdent");
  if (ident) ident.textContent = identityPreview();
  document.getElementById("psPrice").textContent = price ? formatRupiah(price) : "-";
  document.getElementById("psTotal").textContent = price ? formatRupiah(price) : "-";

  renderMarginInfo(supplierInfo);
}

/* Ringkasan margin khusus ADMIN: harga supplier vs harga jual (lokal).
   Hanya tampil saat pengunjung login sebagai admin & paket punya harga
   supplier (dikirim server: [label, harga supplier, harga lokal]) —
   pelanggan biasa tidak melihat biaya modal. */
function renderMarginInfo(info) {
  const box = document.getElementById("psMarginBox");
  if (!box) return;
  const isAdmin = typeof AdminService !== "undefined" && AdminService.isLoggedIn();
  if (!isAdmin || !info) {
    box.style.display = "none";
    return;
  }
  document.getElementById("psSup").textContent = formatRupiah(info.sup);
  document.getElementById("psLocal").textContent = formatRupiah(info.local);
  const margin = info.local - info.sup;
  const pct = info.local > 0 ? Math.round((margin / info.local) * 100) : 0;
  const mEl = document.getElementById("psMargin");
  const sign = margin < 0 ? "-" : margin > 0 ? "+" : "";
  mEl.textContent = sign + formatRupiah(Math.abs(margin)) + " (" + pct + "%)";
  mEl.className = margin >= 0 ? "margin-pos" : "margin-neg";
  box.style.display = "";
}

async function submitPay() {
  if (!payCurrent) return alert("Pilih game terlebih dahulu.");

  // validasi kolom identitas (format + wajib terisi)
  const fields = currentFields(payCurrent);
  payErrors = {};
  let firstInvalid = null;
  fields.forEach((f) => {
    const msg = validateField(f, payValues[f.key] || "", true);
    if (msg) {
      payErrors[f.key] = msg;
      const input = document.querySelector('#payFields input[data-key="' + f.key + '"]');
      if (input && !firstInvalid) firstInvalid = input;
    }
  });
  if (Object.keys(payErrors).length) {
    // tampilkan semua error di form
    document.querySelectorAll("#payFields input").forEach((input) => {
      const key = input.getAttribute("data-key");
      renderFieldError(input, payErrors[key] || "");
    });
    if (firstInvalid) firstInvalid.focus();
    return alert("Periksa kembali kolom identitas game: " + Object.values(payErrors).join(" "));
  }
  // gabungkan identitas (mis. "123456789 · Server 1234")
  const accId = fields
    .filter((f) => payValues[f.key])
    .map((f) => payValues[f.key])
    .join(" · ");

  let pack = payPack;
  if (!pack) {
    const custom = document.getElementById("payCustom").value;
    if (!custom) return alert("Pilih paket terlebih dahulu.");
    pack = ["Paket Kustom", Number(custom)];
  }

  // harga yang dibayar = harga jual lokal (index 2) bila ada, selain itu harga paket
  const sellPrice = typeof pack[2] === "number" ? pack[2] : pack[1];

  // nomor WhatsApp pembeli (opsional, untuk notifikasi saat dikonfirmasi admin)
  const waRaw = document.getElementById("payWa").value.trim();
  let wa = "";
  if (waRaw) {
    wa = waRaw.replace(/\D/g, "");           // buang semua non-angka
    if (wa.startsWith("0")) wa = "62" + wa.slice(1); // 08xx -> 628xx
    if (wa.length < 9) return alert("Nomor WhatsApp tidak valid. Gunakan format internasional, mis. 6285167653731.");
  }

  const session = GameService.getSession();
  if (!session) {
    const next = encodeURIComponent("payment.html?game=" + payCurrent.slug);
    alert("Silakan login terlebih dahulu untuk melanjutkan pembayaran.");
    window.location.href = "login.html?next=" + next;
    return;
  }

  document.getElementById("payBtn").disabled = true;
  document.getElementById("payBtn").textContent = "Memproses...";

  await GameService.createPurchase(session.uid, {
    slug: payCurrent.slug,
    game: payCurrent.name,
    gameImage: payCurrent.image,
    accId,
    pack: pack[0],
    price: sellPrice,
    bundle: pack[2] === "bundle",
    method: payMethod.label,
    wa,
    status: "Menunggu Pembayaran",
  });

  alert(
    "Pembayaran diterima!\n\n" +
    payCurrent.name + " - " + pack[0] + "\n" +
    formatRupiah(sellPrice) + " via " + payMethod.label + "\n" +
    "ID Game: " + accId + "\n\n" +
    "Status: Menunggu Pembayaran.\nAdmin akan mengonfirmasi setelah pembayaran terverifikasi — cek Riwayat."
  );
  window.location.href = "history.html";
}

document.addEventListener("DOMContentLoaded", () => {
  initPayGame();
  renderMethods();
  document.getElementById("payBtn").addEventListener("click", submitPay);
});
