/* ============================================================
   SEMUA GAME — versi lengkap
   Kartu: merah gradasi hitam · nama game biru · deskripsi hitam
   ============================================================ */

function fullCardHTML(game) {
  return (
    '<article class="card full-card">' +
    '  <div class="card-img">' +
    (game.hot ? '<span class="badge-hot">&#128293; HOT</span>' : "") +
    '    <img src="' + game.image + '" alt="' + game.name + '" loading="lazy" onerror="this.onerror=null;this.src=\'assets/game-placeholder.svg\'">' +
    "  </div>" +
    '  <div class="card-body">' +
    "    <h3>" + game.name + "</h3>" +
    "    <p>" + game.desc + "</p>" +
    '    <div class="card-price-row">' +
    '      <div class="card-price">Mulai ' + formatRupiah(game.packs[0][1]) + "</div>" +
    '      <span class="pack-count">' + game.packs.length + ' pilihan paket</span>' +
    (game.bundles && game.bundles.length
      ? '      <span class="bundle-count" title="' + game.bundles.map((b) => b.name).join(" · ") + '">&#127915; ' + game.bundles.length + " Bundle</span>"
      : "") +
    "    </div>" +
    '    <div class="card-foot">' +
    '      <a class="btn btn-white" href="payment.html?game=' + game.slug + '">Topup Sekarang</a>' +
    "    </div>" +
    "  </div>" +
    "</article>"
  );
}

let filter = "all";
let query = "";

function renderGames() {
  const grid = document.getElementById("gameGrid");
  const noResult = document.getElementById("noResult");
  const games = GAMES.filter((g) => {
    const okFilter = filter === "all" || (filter === "hot" ? g.hot : !g.hot);
    const q = query.toLowerCase();
    const okQuery = !q || g.name.toLowerCase().includes(q) || g.desc.toLowerCase().includes(q);
    return okFilter && okQuery;
  });

  grid.innerHTML = games.map(fullCardHTML).join("");
  noResult.style.display = games.length ? "none" : "block";
}

document.addEventListener("DOMContentLoaded", () => {
  // ambil kata kunci dari URL (?q=...) — hasil pencarian header
  const params = new URLSearchParams(window.location.search);
  if (params.get("q")) {
    query = params.get("q");
    const input = document.getElementById("searchInput");
    if (input) input.value = query;
  }

  document.querySelectorAll(".chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      document.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      filter = chip.getAttribute("data-filter");
      renderGames();
    });
  });

  // live filter saat mengetik di pencarian header
  const input = document.getElementById("searchInput");
  if (input) {
    input.addEventListener("input", () => {
      query = input.value.trim();
      renderGames();
    });
  }

  renderGames();
});
