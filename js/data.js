/* ============================================================
   DATA & KONFIGURASI SITUS — Topup Digems
   ------------------------------------------------------------
   Ubah semua data di file ini sesuai kebutuhan:
   - Ganti logo: letakkan gambar di assets/ lalu ubah SITE.logo
   - Ganti gambar slide: letakkan di assets/ lalu ubah SLIDES[].image
   - Ganti gambar game: letakkan di assets/games/ lalu ubah GAMES[].image
   ============================================================ */

const SITE = {
  name: "Topup Digems",
  logo: "assets/logo-noname.svg",   // logo di header (ikon digems, ganti dengan gambar sendiri)
  title: "Topup Digems - Topup Game Termurah & Terpercaya",
  whatsapp: "6285167653731",         // nomor WhatsApp admin (format internasional tanpa +)
  whatsappMessage: "Halo admin Digems, saya mau topup game. Boleh dibantu?",
};

/* ---------- SLIDE / BANNER (ganti dengan self image) ---------- */
const SLIDES = [
  { image: "assets/slide1.svg", title: "Topup Game Murah & Cepat",  subtitle: "Diamond, Gem & UC instan dengan harga terbaik",  link: "games.html" },
  { image: "assets/slide2.svg", title: "Proses Otomatis & Aman",    subtitle: "Saldo masuk hanya dalam hitungan menit",          link: "games.html" },
  { image: "assets/slide3.svg", title: "Promo Spesial Setiap Hari", subtitle: "Jangan lewatkan diskon & cashback menarik",        link: "games.html" },
];

/* ---------- DATA GAME ----------
   hot  : true = masuk kategori Game Hot / Trending
   packs: pilihan paket topup [nama, harga]
   (tambahkan paket custom otomatis di modal) */

/* Bikin daftar paket generik dari harga dasar (bisa diedit per game nanti) */
function defaultPacks(base) {
  return [
    ["Paket Hemat", base],
    ["Paket Reguler", Math.round((base * 1.8) / 1000) * 1000],
    ["Paket Besar", Math.round((base * 3) / 1000) * 1000],
    ["Paket Sultan", Math.round((base * 5) / 1000) * 1000],
  ];
}

const GAMES = [
  /* ---------- MOBA / Strategy / TFT ---------- */
  {
    slug: "ml", name: "Mobile Legends: Bang Bang", desc: "Topup Diamond Mobile Legends termurah & tercepat.",
    image: "assets/games/ml.svg", hot: true,
    packs: [["86 Diamond", 21900], ["172 Diamond", 43800], ["257 Diamond", 65500], ["344 Diamond", 87500], ["429 Diamond", 109500], ["514 Diamond", 131500]],
    bundles: [
      { name: "Weekly Diamond Pass (WDP)", price: 34000, tag: "Pass", desc: "Login 7 hari: 250 Diamond + hadiah eksklusif" },
      { name: "Starlight Member", price: 120000, tag: "Member", desc: "Skin Starlight eksklusif + 500 Diamond + event bulanan" },
      { name: "Monthly Diamond Pass", price: 45000, tag: "Pass", desc: "Login 30 hari: 1.500 Diamond bertahap + hadiah" },
      { name: "MCL Pass", price: 60000, tag: "Event", desc: "Turnamen MCL: pass menonton + hadiah khusus" },
    ],
  },
  {
    slug: "hok", name: "Honor of Kings", desc: "Topup Honor of Kings (HOK) termurah.",
    image: "assets/games/hok.svg", hot: false,
    packs: [["50 Voucher", 9500], ["250 Voucher", 45000], ["500 Voucher", 88000], ["1000 Voucher", 175000]],
    bundles: [
      { name: "Weekly Pass", price: 15000, tag: "Pass", desc: "Voucher harian 7 hari + skin eksklusif" },
      { name: "Battle Pass", price: 95000, tag: "BP", desc: "Rewards eksklusif sepanjang season" },
    ],
  },
  {
    slug: "aov", name: "Arena of Valor", desc: "Topup Voucher Arena of Valor murah.",
    image: "assets/games/aov.svg", hot: false,
    packs: [["110 Voucher", 13000], ["565 Voucher", 65000], ["1130 Voucher", 125000]],
    bundles: [
      { name: "Battle Pass (Season)", price: 35000, tag: "BP", desc: "Rewards eksklusif sepanjang season + skin BP" },
      { name: "Weekly Pass", price: 12000, tag: "Pass", desc: "Voucher harian 7 hari + hadiah login" },
    ],
  },
  { slug: "wild-rift", name: "League of Legends: Wild Rift", desc: "Topup Wild Rift (LoL Mobile) termurah.", image: "assets/games/wild-rift.svg", hot: false, packs: [["95 Wild Core", 15000], ["250 Wild Core", 38000], ["500 Wild Core", 75000], ["1100 Wild Core", 160000]], bundles: [
      { name: "Wild Pass (Season)", price: 60000, tag: "Pass", desc: "Rewards eksklusif: skin, pose & Wild Core" },
    ] },
  { slug: "pokemon-unite", name: "Pokemon Unite", desc: "Topup Pokemon Unite murah & legal.", image: "assets/games/pokemon-unite.svg", hot: false, packs: [["60 Aeos Gems", 14000], ["300 Aeos Gems", 68000], ["800 Aeos Gems", 175000], ["1600 Aeos Gems", 340000]], bundles: [
      { name: "Battle Pass (HoloWear)", price: 85000, tag: "BP", desc: "Skin HoloWear eksklusif + rewards sepanjang season" },
      { name: "Membership", price: 55000, tag: "Member", desc: "Aeos Gems bulanan + diskon item shop" },
    ] },
  { slug: "tft-mobile", name: "Teamfight Tactics Mobile", desc: "Topup TFT Mobile murah & cepat.", image: "assets/games/tft-mobile.svg", hot: false, packs: [["50 Coins", 12000], ["120 Coins", 28000], ["250 Coins", 55000], ["500 Coins", 108000]] },
  { slug: "clash-royale", name: "Clash Royale", desc: "Topup Clash Royale mudah & cepat.", image: "assets/games/clash-royale.svg", hot: false, packs: [["80 Gems", 16000], ["500 Gems", 95000], ["1200 Gems", 220000], ["2500 Gems", 440000]], bundles: [
      { name: "Season Pass (Diamond Pass)", price: 85000, tag: "Pass", desc: "Rewards season: emote + skin King + 20% bonus" },
    ] },
  { slug: "league-of-legends", name: "League of Legends (PC)", desc: "Topup League of Legends PC aman.", image: "assets/games/league-of-legends.svg", hot: false, packs: [["100 RP", 15000], ["250 RP", 35000], ["500 RP", 68000], ["1000 RP", 135000]] },
  {
    slug: "valorant", name: "Valorant (PC)", desc: "Topup Valorant Points (VP) murah dan legal.",
    image: "assets/games/valorant.svg", hot: true,
    packs: [["475 VP", 54000], ["1000 VP", 110000], ["2050 VP", 220000]],
    bundles: [
      { name: "Battle Pass", price: 110000, tag: "BP", desc: "Rewards eksklusif 50 tier + 1000 VP setara" },
      { name: "Radiant Pass", price: 175000, tag: "Pass", desc: "Battle Pass premium + 10 tier langsung terbuka" },
    ],
  },

  /* ---------- Battle Royale / FPS / Shooter ---------- */
  {
    slug: "ff", name: "Free Fire", desc: "Isi diamond Free Fire aman, proses otomatis.",
    image: "assets/games/ff.svg", hot: true,
    packs: [["70 Diamond", 10000], ["140 Diamond", 20000], ["355 Diamond", 48500], ["720 Diamond", 96000], ["1450 Diamond", 190000]],
    bundles: [
      { name: "Weekly Membership", price: 14000, tag: "Member", desc: "Diamond harian 7 hari + skin eksklusif" },
      { name: "Monthly Membership", price: 45000, tag: "Member", desc: "Diamond harian 30 hari + hadiah mingguan" },
      { name: "Elite Pass", price: 72000, tag: "Pass", desc: "Rewards eksklusif sepanjang season + skin M4" },
    ],
  },
  { slug: "ff-max", name: "Free Fire MAX", desc: "Topup Free Fire Max murah & proses otomatis.", image: "assets/games/ff-max.svg", hot: false, packs: [["70 Diamond", 10000], ["140 Diamond", 20000], ["355 Diamond", 48500], ["720 Diamond", 96000]], bundles: [
      { name: "Monthly Membership", price: 45000, tag: "Member", desc: "Diamond harian 30 hari + hadiah mingguan" },
    ] },
  {
    slug: "pubg", name: "PUBG Mobile", desc: "Topup UC PUBG Mobile cepat tanpa ribet.",
    image: "assets/games/pubg.svg", hot: true,
    packs: [["60 UC", 16500], ["325 UC", 85000], ["660 UC", 168000], ["1800 UC", 445000]],
    bundles: [
      { name: "Royale Pass (RP)", price: 95000, tag: "Pass", desc: "Rewards eksklusif sepanjang season + skin RP" },
      { name: "Weekly Diamond Pass", price: 16000, tag: "Pass", desc: "UC bertahap 7 hari + crate gratis" },
    ],
  },
  {
    slug: "codm", name: "Call of Duty: Mobile", desc: "CP Call of Duty Mobile aman & instant.",
    image: "assets/games/codm.svg", hot: false,
    packs: [["80 CP", 16500], ["420 CP", 85000], ["880 CP", 170000], ["2400 CP", 450000]],
    bundles: [
      { name: "Battle Pass", price: 85000, tag: "BP", desc: "Rewards eksklusif sepanjang season + skin BP" },
      { name: "Battle Pass Bundle", price: 170000, tag: "BP+", desc: "Battle Pass + 12 tier langsung terbuka" },
    ],
  },
  { slug: "arena-breakout", name: "Arena Breakout", desc: "Topup Arena Breakout termurah.", image: "assets/games/arena-breakout.svg", hot: false, packs: [["100 A-Coin", 16000], ["300 A-Coin", 45000], ["500 A-Coin", 72000], ["1000 A-Coin", 140000]] },
  { slug: "blood-strike", name: "Blood Strike", desc: "Topup Blood Strike aman & cepat.", image: "assets/games/blood-strike.svg", hot: false, packs: [["60 Credits", 12000], ["150 Credits", 28000], ["330 Credits", 60000], ["700 Credits", 125000]] },
  { slug: "farlight-84", name: "Farlight 84", desc: "Topup Farlight 84 termurah, proses cepat & aman.", image: "assets/games/farlight-84.svg", hot: false, packs: [["50 Diamond", 12500], ["125 Diamond", 28000], ["300 Diamond", 65000], ["660 Diamond", 140000], ["1320 Diamond", 275000]] },
  { slug: "delta-force", name: "Delta Force", desc: "Topup Delta Force terpercaya.", image: "assets/games/delta-force.svg", hot: false, packs: [["100 Voucher", 16000], ["300 Voucher", 45000], ["500 Voucher", 72000], ["1000 Voucher", 140000]] },
  { slug: "marvel-rivals", name: "Marvel Rivals", desc: "Topup Marvel Rivals termurah & aman.", image: "assets/games/marvel-rivals.svg", hot: false, packs: [["100 Lattice", 16000], ["300 Lattice", 45000], ["500 Lattice", 72000], ["800 Lattice", 115000]] },
  { slug: "once-human", name: "Once Human", desc: "Topup Once Human termurah & terpercaya.", image: "assets/games/once-human.svg", hot: false, packs: [["60 Crystgin", 14000], ["300 Crystgin", 68000], ["980 Crystgin", 215000], ["1980 Crystgin", 425000]] },

  /* ---------- RPG / Action / Open World ---------- */
  {
    slug: "genshin", name: "Genshin Impact", desc: "Genesis Crystal Genshin Impact harga promo.",
    image: "assets/games/genshin.svg", hot: true,
    packs: [["60 Crystals", 14000], ["300 Crystals", 68000], ["980 Crystals", 215000], ["1980 Crystals", 425000]],
    bundles: [
      { name: "Blessing of the Welkin Moon", price: 65000, tag: "Pass", desc: "90 Primogem harian selama 30 hari (2.700 total)" },
      { name: "Gnostic Hymn (Battle Pass)", price: 145000, tag: "BP", desc: "Battle Pass premium: Mora, talent & Intertwined Fate" },
    ],
  },
  { slug: "honkai-impact-3rd", name: "Honkai Impact 3rd", desc: "Topup Honkai Impact 3rd (HI3) murah.", image: "assets/games/honkai-impact-3rd.svg", hot: false, packs: [["60 Crystals", 14000], ["300 Crystals", 68000], ["980 Crystals", 215000], ["1980 Crystals", 425000]], bundles: [
      { name: "Monthly Pass", price: 45000, tag: "Pass", desc: "60 Crystals harian selama 30 hari" },
      { name: "BP Elite", price: 145000, tag: "BP", desc: "Battle Pass premium + hadiah season" },
    ] },
  { slug: "zenless-zone-zero", name: "Zenless Zone Zero (ZZZ)", desc: "Topup Zenless Zone Zero murah & aman.", image: "assets/games/zenless-zone-zero.svg", hot: false, packs: [["60 Polychrome", 14000], ["300 Polychrome", 68000], ["980 Polychrome", 215000], ["1980 Polychrome", 425000]], bundles: [
      { name: "Inter-Knot Membership", price: 65000, tag: "Pass", desc: "90 Polychrome harian selama 30 hari" },
      { name: "New Eridu City Fund (BP)", price: 145000, tag: "BP", desc: "Battle Pass premium + 680 Polychrome" },
    ] },
  { slug: "wuthering-waves", name: "Wuthering Waves (WuWa)", desc: "Topup Wuthering Waves (WuWa) murah.", image: "assets/games/wuthering-waves.svg", hot: false, packs: [["60 Lunite", 14000], ["300 Lunite", 68000], ["980 Lunite", 215000], ["1980 Lunite", 425000]], bundles: [
      { name: "Monthly Pass (Lunite Sub)", price: 65000, tag: "Pass", desc: "90 Astrite harian selama 30 hari" },
      { name: "Pioneer Podcast (BP)", price: 145000, tag: "BP", desc: "Battle Pass premium + 680 Lunite" },
    ] },
  { slug: "punishing-gray-raven", name: "Punishing: Gray Raven (PGR)", desc: "Topup Punishing Gray Raven (PGR) murah.", image: "assets/games/punishing-gray-raven.svg", hot: false, packs: [["60 Rainbow Card", 14000], ["300 Rainbow Card", 68000], ["980 Rainbow Card", 215000], ["1980 Rainbow Card", 425000]] },
  { slug: "tower-of-fantasy", name: "Tower of Fantasy", desc: "Topup Tower of Fantasy aman & legal.", image: "assets/games/tower-of-fantasy.svg", hot: false, packs: [["60 Tanium", 14000], ["300 Tanium", 68000], ["980 Tanium", 215000], ["1980 Tanium", 425000]] },
  { slug: "tarisland", name: "Tarisland", desc: "Topup Tarisland termurah & aman.", image: "assets/games/tarisland.svg", hot: false, packs: [["60 Crystals", 12000], ["180 Crystals", 34000], ["360 Crystals", 65000], ["720 Crystals", 128000]] },
  { slug: "black-desert-mobile", name: "Black Desert Mobile", desc: "Topup Black Desert Mobile termurah.", image: "assets/games/black-desert-mobile.svg", hot: false, packs: [["100 Black Pearls", 15000], ["500 Black Pearls", 70000], ["1000 Black Pearls", 135000], ["2000 Black Pearls", 265000]], bundles: [
      { name: "Monthly Pass", price: 65000, tag: "Pass", desc: "Black Pearls harian + item peningkatan" },
    ] },
  { slug: "ragnarok-origins", name: "Ragnarok Origin", desc: "Topup Ragnarok Origin aman & cepat.", image: "assets/games/ragnarok-origins.svg", hot: false, packs: [["50 Zeny", 10000], ["120 Zeny", 23000], ["250 Zeny", 46000], ["500 Zeny", 90000]] },
  { slug: "ragnarok-x", name: "Ragnarok X: Next Generation", desc: "Topup Ragnarok X Next Generation aman.", image: "assets/games/ragnarok-x.svg", hot: false, packs: [["60 Zeny", 12000], ["180 Zeny", 34000], ["360 Zeny", 65000], ["720 Zeny", 128000]] },
  { slug: "ragnarok-m-eternal-love", name: "Ragnarok M: Eternal Love", desc: "Topup Ragnarok M Eternal Love murah.", image: "assets/games/ragnarok-m-eternal-love.svg", hot: false, packs: [["30 BCC", 12000], ["60 BCC", 24000], ["120 BCC", 46000], ["300 BCC", 112000], ["500 BCC", 185000]], bundles: [
      { name: "Weekly Growth Supplies", price: 25000, tag: "Pass", desc: "Zeny + item harian selama 7 hari" },
      { name: "Limited Premium Pack", price: 65000, tag: "Event", desc: "BCC + item premium eksklusif" },
    ] },
  { slug: "nikke", name: "Goddess of Victory: Nikke", desc: "Topup Nikke murah dengan garansi aman.", image: "assets/games/nikke.svg", hot: false, packs: [["60 Gems", 16000], ["120 Gems", 35000], ["320 Gems", 79000], ["720 Gems", 159000], ["1500 Gems", 320000]] },
  { slug: "azur-lane", name: "Azur Lane", desc: "Topup Azur Lane mudah & aman.", image: "assets/games/azur-lane.svg", hot: false, packs: [["60 Gems", 14000], ["180 Gems", 38000], ["330 Gems", 68000], ["680 Gems", 138000]], bundles: [
      { name: "Monthly Pass", price: 45000, tag: "Pass", desc: "Gems harian 30 hari + item perbaikan" },
    ] },
  { slug: "love-and-deep-space", name: "Love and Deepspace", desc: "Topup Love and Deepspace termurah.", image: "assets/games/love-and-deep-space.svg", hot: false, packs: [["60 Diamonds", 15000], ["150 Diamonds", 35000], ["330 Diamonds", 75000], ["700 Diamonds", 155000]] },
  { slug: "snowbreak", name: "Snowbreak: Containment Zone", desc: "Topup Snowbreak murah & aman.", image: "assets/games/snowbreak.svg", hot: false, packs: [["60 Digicash", 14000], ["300 Digicash", 68000], ["980 Digicash", 215000], ["1980 Digicash", 425000]] },
  { slug: "path-to-nowhere", name: "Path to Nowhere", desc: "Topup Path to Nowhere aman & cepat.", image: "assets/games/path-to-nowhere.svg", hot: false, packs: [["60 Hypercube", 14000], ["300 Hypercube", 68000], ["980 Hypercube", 215000], ["1980 Hypercube", 425000]] },
  { slug: "aether-gazer", name: "Aether Gazer", desc: "Topup Aether Gazer murah & aman.", image: "assets/games/aether-gazer.svg", hot: false, packs: [["60 Crystals", 14000], ["300 Crystals", 68000], ["980 Crystals", 215000], ["1980 Crystals", 425000]] },
  { slug: "afk-journey", name: "AFK Journey", desc: "Topup AFK Journey termurah & aman.", image: "assets/games/afk-journey.svg", hot: false, packs: [["60 Diamonds", 14000], ["300 Diamonds", 68000], ["980 Diamonds", 215000], ["1980 Diamonds", 425000]], bundles: [
      { name: "Noble Path (BP)", price: 95000, tag: "BP", desc: "Battle Pass premium: skin + Diamonds sepanjang season" },
    ] },

  /* ---------- Casual / Party / Racing / Sports ---------- */
  { slug: "stumble-guys", name: "Stumble Guys", desc: "Topup Stumble Guys murah & seru.", image: "assets/games/stumble-guys.svg", hot: false, packs: [["25 Gems", 6500], ["100 Gems", 24000], ["250 Gems", 55000], ["500 Gems", 105000]], bundles: [
      { name: "Premium Pass (Season)", price: 45000, tag: "Pass", desc: "Rewards eksklusif: skin, emote & 500 Gems" },
    ] },
  { slug: "sausage-man", name: "Sausage Man", desc: "Topup Sausage Man aman & cepat.", image: "assets/games/sausage-man.svg", hot: false, packs: [["50 Gems", 10000], ["120 Gems", 23000], ["250 Gems", 46000], ["500 Gems", 90000]] },
  { slug: "identity-v", name: "Identity V", desc: "Topup Identity V mudah & cepat.", image: "assets/games/identity-v.svg", hot: false, packs: [["50 Echoes", 10000], ["120 Echoes", 23000], ["250 Echoes", 46000], ["500 Echoes", 90000]], bundles: [
      { name: "Season Pass (S14+)", price: 45000, tag: "Pass", desc: "Rewards season: skin + emote + Echoes" },
      { name: "Truth Serum Bundle", price: 12000, tag: "Event", desc: "Bundle investigasi: item eksklusif" },
    ] },
  { slug: "sky-children-of-the-light", name: "Sky: Children of the Light", desc: "Topup Sky Children of the Light murah.", image: "assets/games/sky-children-of-the-light.svg", hot: false, packs: [["10 Candles", 12000], ["30 Candles", 34000], ["60 Candles", 66000], ["100 Candles", 108000]] },
  { slug: "asphalt-9", name: "Asphalt 9", desc: "Topup Asphalt 9 termurah & terpercaya.", image: "assets/games/asphalt-9.svg", hot: false, packs: [["40 Tokens", 8000], ["105 Tokens", 20000], ["220 Tokens", 40000], ["450 Tokens", 80000], ["900 Tokens", 155000]], bundles: [
      { name: "Festival Pass", price: 45000, tag: "Pass", desc: "Rewards season: mobil eksklusif + Tokens" },
    ] },
  { slug: "fc-mobile", name: "EA Sports FC Mobile", desc: "Topup EA Sports FC Mobile termurah & terpercaya.", image: "assets/games/fc-mobile.svg", hot: false, packs: [["40 FC Points", 6400], ["100 FC Points", 14500], ["520 FC Points", 71200], ["1070 FC Points", 140000], ["2200 FC Points", 285000]] },
  { slug: "marvel-snap", name: "Marvel Snap", desc: "Topup Marvel Snap mudah & terpercaya.", image: "assets/games/marvel-snap.svg", hot: false, packs: [["100 Gold", 17000], ["250 Gold", 42000], ["500 Gold", 82000], ["1000 Gold", 160000]] },
  { slug: "metal-slug-awakening", name: "Metal Slug Awakening", desc: "Topup Metal Slug Awakening mudah.", image: "assets/games/metal-slug-awakening.svg", hot: false, packs: [["50 Diamonds", 10000], ["120 Diamonds", 23000], ["250 Diamonds", 46000], ["500 Diamonds", 90000]] },

  /* ---------- Strategy / War / Survival ---------- */
  { slug: "rise-of-kingdoms", name: "Rise of Kingdoms", desc: "Topup Rise of Kingdoms aman & terpercaya.", image: "assets/games/rise-of-kingdoms.svg", hot: false, packs: [["320 Gems", 17000], ["800 Gems", 41000], ["1750 Gems", 88000], ["4000 Gems", 195000]] },
  { slug: "state-of-survival", name: "State of Survival", desc: "Topup State of Survival terpercaya.", image: "assets/games/state-of-survival.svg", hot: false, packs: [["120 Biocaps", 15000], ["300 Biocaps", 36000], ["620 Biocaps", 72000], ["1280 Biocaps", 145000]] },
  { slug: "whiteout-survival", name: "Whiteout Survival", desc: "Topup Whiteout Survival murah & cepat.", image: "assets/games/whiteout-survival.svg", hot: false, packs: [["500 Gems", 15000], ["1500 Gems", 42000], ["3000 Gems", 80000], ["6000 Gems", 155000]], bundles: [
      { name: "Survivor Pass", price: 85000, tag: "Pass", desc: "Rewards season: skin kota + hero + speed up" },
      { name: "Frost Star Pass", price: 45000, tag: "Pass", desc: "Rewards harian 30 hari: Gems + resource" },
    ] },
  { slug: "lord-mobile", name: "Lords Mobile", desc: "Topup Lords Mobile murah & aman.", image: "assets/games/lord-mobile.svg", hot: false, packs: [["67 Diamonds", 9700], ["134 Diamonds", 19500], ["335 Diamonds", 48500], ["670 Diamonds", 95000], ["1999 Diamonds", 285000]] },
  { slug: "age-of-empires-mobile", name: "Age of Empires Mobile", desc: "Topup Age of Empires Mobile aman.", image: "assets/games/age-of-empires-mobile.svg", hot: false, packs: [["50 Gems", 10000], ["120 Gems", 23000], ["250 Gems", 46000], ["500 Gems", 90000]] },
];

/* Format angka ke Rupiah */
function formatRupiah(n) {
  return "Rp" + Number(n).toLocaleString("id-ID");
}
