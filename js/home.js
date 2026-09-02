/* ============================================================
   HOME — slider + render kartu game di halaman utama
   ============================================================ */

function cardHTML(game) {
  return (
    '<article class="card">' +
    '  <div class="card-img">' +
    (game.hot ? '<span class="badge-hot">&#128293; HOT</span>' : "") +
    '    <img src="' + game.image + '" alt="' + game.name + '" loading="lazy" onerror="this.onerror=null;this.src=\'assets/game-placeholder.svg\'">' +
    "  </div>" +
    '  <div class="card-body">' +
    "    <h3>" + game.name + "</h3>" +
    "    <p>" + game.desc + "</p>" +
    '    <div class="card-price">Mulai ' + formatRupiah(game.packs[0][1]) + "</div>" +
    '    <div class="card-foot">' +
    '      <a class="btn btn-primary" href="payment.html?game=' + game.slug + '">Topup</a>' +
    "    </div>" +
    "  </div>" +
    "</article>"
  );
}

/* ---------- Hero slider (ganti gambar di SLIDES, js/data.js) ---------- */
function initSlider() {
  const wrap = document.getElementById("heroSlides");
  const dotsWrap = document.getElementById("sliderDots");
  if (!wrap) return;

  SLIDES.forEach((s, i) => {
    const div = document.createElement("div");
    div.className = "slide" + (i === 0 ? " active" : "");
    div.innerHTML =
      '<img src="' + s.image + '" alt="' + s.title + '" onerror="this.onerror=null;this.src=\'assets/game-placeholder.svg\'">' +
      '<div class="slide-text">' +
      "  <h2>" + s.title + "</h2>" +
      "  <p>" + s.subtitle + "</p>" +
      '  <a class="btn btn-white" href="' + s.link + '">Topup Sekarang</a>' +
      "</div>";
    wrap.appendChild(div);

    const dot = document.createElement("button");
    dot.className = i === 0 ? "active" : "";
    dot.setAttribute("aria-label", "Slide " + (i + 1));
    dot.addEventListener("click", () => goTo(i));
    dotsWrap.appendChild(dot);
  });

  let idx = 0;
  let timer = null;

  function goTo(i) {
    idx = (i + SLIDES.length) % SLIDES.length;
    wrap.querySelectorAll(".slide").forEach((s, n) => s.classList.toggle("active", n === idx));
    dotsWrap.querySelectorAll("button").forEach((d, n) => d.classList.toggle("active", n === idx));
    restart();
  }
  function next() { goTo(idx + 1); }
  function prev() { goTo(idx - 1); }
  function restart() {
    clearInterval(timer);
    timer = setInterval(next, 5000);
  }

  document.getElementById("slideNext").addEventListener("click", next);
  document.getElementById("slidePrev").addEventListener("click", prev);
  restart();
}

/* ---------- Render daftar game ---------- */
async function renderHome() {
  const games = await GameService.getGames();

  const hotList = document.getElementById("hotList");
  const allGrid = document.getElementById("allGrid");
  const gameCount = document.getElementById("gameCount");
  if (gameCount) gameCount.textContent = "Tersedia " + games.length + " game pilihan";
  if (hotList) hotList.innerHTML = games.filter((g) => g.hot).map(cardHTML).join("");
  // versi ringkas: hanya 8 game teratas di beranda, sisanya lewat tombol "Lihat Semua Game"
  if (allGrid) allGrid.innerHTML = games.slice(0, 8).map(cardHTML).join("");
}

document.addEventListener("DOMContentLoaded", () => {
  initSlider();
  renderHome();
});
