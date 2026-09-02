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
    '      <a class="btn btn-primary" href="payment.html?game=' + game.slug + '">Topup Sekarang</a>' +
    "    </div>" +
    "  </div>" +
    "</article>"
  );
}

let filter = "all";
let query = "";

/* Popularitas game berdasarkan jumlah pemain aktif global 2025-2026.
   Slug game diurutkan dari paling banyak pemain → paling sedikit. */
const POPULARITY_ORDER = [
  "ff", "ml", "pubg", "roblox", "genshin",
  "hok", "clash-royale", "codm", "fc-mobile", "valorant",
  "hsr", "coc", "higgs", "garena", "zenless-zone-zero",
  "wuthering-waves", "pokemon-unite", "aov", "pb", "ff-max",
  "pubgm-lite", "stumble-guys", "afk-journey", "once-human",
  "blood-strike", "delta-force", "undawn", "pubg-new-state",
  "honkai-impact-3rd", "asphalt-9", "black-clover-m", "tower-of-fantasy",
  "marvel-rivals", "punishing-gray-raven", "arena-breakout",
  "love-and-deep-space", "love-nikki", "naruto-shippuden",
  "snowbreak", "heaven-burns-red", "path-to-nowhere", "identity-v",
  "lord-mobile", "harry-potter-magic-awakened", "ragnarok-m-eternal-love",
  "lineage-2m", "onmyoji-arena", "crystal-of-atlan", "state-of-survival",
  "zepeto", "webtoon", "magic-chess", "ml-adventure", "nikke",
  "speed-drifters", "lokapala", "football-master-2", "mob-rush",
  "omega-legends", "auto-chess", "alchemy-stars", "project-sekai",
  "super-mecha-champions", "one-punch-man", "modern-combat-5",
  "farlight-84", "sausage-man", "bullet-angel", "super-sus",
  "haikyuu-fly-high", "lumia-saga", "captain-tsubasa-ace",
  "captain-tsubasa-dream-team", "jago", "egg-party", "werewolf",
  "racing-master", "forsaken-world-2", "ants-underground", "colorbang",
  "destiny-m", "moonlight-blade-m", "eos-red", "bleach-mobile-3d",
  "shining-spirit", "life-after-credits", "king-choice",
  "smash-legends", "octopath-traveler", "dragon-nest-m-classic",
  "light-of-them", "dragon-raja-sea", "ace-racer", "tarisland",
  "astra-knight-of-veda", "saint-seiya", "seal-m-sea",
  "metal-slug-awakening", "hyper-front", "ragnarok-monster-world",
  "ragnarok-origins", "au2-mobile", "nba-infinite", "age-of-empires-mobile",
  "ragnarok-idle-adventure", "life-makeover", "dragonheir-silent-god",
  "ghost-story", "ensemble-stars-music", "girls-connect", "t3-arena",
  "chaos-crisis", "mangatoon", "tom-and-jerry-chase", "star-maker",
  "mirren-star-legends", "pixel-gun-3d", "perfect-world-mobile-2",
  "rules-of-survival", "likes", "isekai-feast", "culinary-tour",
  "heroes-evolved", "trails-of-cold-steel", "astral-guardians",
  "ride-out-heroes", "legacy-of-discord", "jade-dynasty",
  "her", "cloud-song", "ys-6-mobile", "wesing", "heroic-uncle-kim",
  "starpass", "lotr-rise-to-war", "hiya", "laplace-m", "mu-origin-3",
  "be-the-king", "pubg-new-state"
];

function getPopularity(slug) {
  var idx = POPULARITY_ORDER.indexOf(slug);
  return idx >= 0 ? idx : 999;
}

function renderGames() {
  const grid = document.getElementById("gameGrid");
  const noResult = document.getElementById("noResult");
  const games = GAMES.filter((g) => {
    const okFilter = filter === "all" || (filter === "hot" ? g.hot : !g.hot);
    const q = query.toLowerCase();
    const okQuery = !q || g.name.toLowerCase().includes(q) || g.desc.toLowerCase().includes(q);
    return okFilter && okQuery;
  }).sort((a, b) => getPopularity(a.slug) - getPopularity(b.slug));

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
