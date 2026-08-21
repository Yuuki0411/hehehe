/* ============================================================
   LOGIN / DAFTAR
   ============================================================ */

function setMode(mode) {
  const isLogin = mode === "login";
  document.getElementById("tabLogin").classList.toggle("active", isLogin);
  document.getElementById("tabRegister").classList.toggle("active", !isLogin);
  document.getElementById("formLogin").style.display = isLogin ? "block" : "none";
  document.getElementById("formRegister").style.display = isLogin ? "none" : "block";
  document.getElementById("authInfo").innerHTML = isLogin
    ? 'Belum punya akun? <a href="#" id="linkToRegister">Daftar di sini</a>'
    : 'Sudah punya akun? <a href="#" id="linkToLogin">Masuk di sini</a>';
  bindSwitchLinks();
}

function bindSwitchLinks() {
  const lr = document.getElementById("linkToRegister");
  const ll = document.getElementById("linkToLogin");
  if (lr) lr.addEventListener("click", (e) => { e.preventDefault(); setMode("register"); });
  if (ll) ll.addEventListener("click", (e) => { e.preventDefault(); setMode("login"); });
}

function showError(msg) {
  const box = document.getElementById("authError");
  box.textContent = msg;
  box.style.display = msg ? "block" : "none";
  const ok = document.getElementById("authSuccess");
  if (ok) ok.style.display = "none";
}

function showSuccess(html) {
  const box = document.getElementById("authSuccess");
  box.innerHTML = html;
  box.style.display = "block";
  const err = document.getElementById("authError");
  err.style.display = "none";
}

document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const initial = params.get("mode") === "register" ? "register" : "login";
  setMode(initial);

  document.getElementById("tabLogin").addEventListener("click", () => setMode("login"));
  document.getElementById("tabRegister").addEventListener("click", () => setMode("register"));

  // Halaman tujuan setelah login (default: riwayat). Dipakai untuk kembali ke halaman payment.
  const next = params.get("next") || "history.html";

  // Jika sudah login, langsung arahkan ke tujuan
  if (GameService.getSession()) {
    window.location.href = next;
    return;
  }

  document.getElementById("formLogin").addEventListener("submit", async (e) => {
    e.preventDefault();
    showError("");
    const identifier = document.getElementById("loginIdentifier").value.trim();
    const password = document.getElementById("loginPassword").value;
    if (!identifier || !password) return showError("Mohon isi username/email dan password.");

    const res = await GameService.login(identifier, password);
    if (res.ok) {
      window.location.href = next;
    } else {
      showError(res.error);
    }
  });

  document.getElementById("formRegister").addEventListener("submit", async (e) => {
    e.preventDefault();
    showError("");
    const username = document.getElementById("regUsername").value.trim();
    const email = document.getElementById("regEmail").value.trim();
    const password = document.getElementById("regPassword").value;

    if (!username || !email || !password) return showError("Mohon lengkapi semua data.");
    if (password.length < 6) return showError("Password minimal 6 karakter.");
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return showError("Format email tidak valid.");

    const res = await GameService.register(username, email, password);
    if (res.ok) {
      if (res.needsVerification) {
        // akun dibuat — wajib verifikasi email lewat link yang dikirim
        const link = res.devVerifyUrl
          ? "<br><small>(mode pengembangan — server belum dikonfigurasi email, buka link ini: <code>" + res.devVerifyUrl + "</code>)</small>"
          : "";
        showSuccess(
          "✅ Akun dibuat! Link verifikasi dikirim ke <b>" + escapeHtml(email) + "</b>." +
            "<br>Cek <b>inbox / spam</b> lalu klik link untuk mengaktifkan email kamu." +
            link +
            "<br><button type=\"button\" id=\"resendLinkBtn\" class=\"btn btn-sm btn-primary\" style=\"margin-top:10px\">Kirim ulang link</button>" +
            " <a class=\"btn btn-sm btn-outline\" href=\"history.html\" style=\"margin-top:10px\">Lanjut tanpa verifikasi</a>"
        );
        document.getElementById("resendLinkBtn").addEventListener("click", async () => {
          const r = await GameService.resendVerification(email);
          showSuccess(
            r.ok
              ? (r.mailSent
                  ? "📬 Link verifikasi dikirim ulang ke <b>" + escapeHtml(email) + "</b> — cek inbox/spam."
                  : "🔗 Mode pengembangan — buka link ini: <code>" + r.devVerifyUrl + "</code>")
              : "⚠️ " + r.error
          );
        });
      } else {
        window.location.href = next;
      }
    } else {
      showError(res.error);
    }
  });
});
