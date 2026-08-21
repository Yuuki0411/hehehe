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
  {
    slug: "ml", name: "Mobile Legends", desc: "Topup Diamond Mobile Legends termurah & tercepat.",
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
    slug: "ff", name: "Free Fire", desc: "Isi diamond Free Fire aman, proses otomatis.",
    image: "assets/games/ff.svg", hot: true,
    packs: [["70 Diamond", 10000], ["140 Diamond", 20000], ["355 Diamond", 48500], ["720 Diamond", 96000], ["1450 Diamond", 190000]],
    bundles: [
      { name: "Weekly Membership", price: 14000, tag: "Member", desc: "Diamond harian 7 hari + skin eksklusif" },
      { name: "Monthly Membership", price: 45000, tag: "Member", desc: "Diamond harian 30 hari + hadiah mingguan" },
      { name: "Elite Pass", price: 72000, tag: "Pass", desc: "Rewards eksklusif sepanjang season + skin M4" },
    ],
  },
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
    slug: "genshin", name: "Genshin Impact", desc: "Genesis Crystal Genshin Impact harga promo.",
    image: "assets/games/genshin.svg", hot: true,
    packs: [["60 Crystals", 14000], ["300 Crystals", 68000], ["980 Crystals", 215000], ["1980 Crystals", 425000]],
    bundles: [
      { name: "Blessing of the Welkin Moon", price: 65000, tag: "Pass", desc: "90 Primogem harian selama 30 hari (2.700 total)" },
      { name: "Gnostic Hymn (Battle Pass)", price: 145000, tag: "BP", desc: "Battle Pass premium: Mora, talent & Intertwined Fate" },
    ],
  },
  {
    slug: "valorant", name: "Valorant", desc: "Topup Valorant Points (VP) murah dan legal.",
    image: "assets/games/valorant.svg", hot: true,
    packs: [["475 VP", 54000], ["1000 VP", 110000], ["2050 VP", 220000]],
    bundles: [
      { name: "Battle Pass", price: 110000, tag: "BP", desc: "Rewards eksklusif 50 tier + 1000 VP setara" },
      { name: "Radiant Pass", price: 175000, tag: "Pass", desc: "Battle Pass premium + 10 tier langsung terbuka" },
    ],
  },
  {
    slug: "codm", name: "Call of Duty Mobile", desc: "CP Call of Duty Mobile aman & instant.",
    image: "assets/games/codm.svg", hot: false,
    packs: [["80 CP", 16500], ["420 CP", 85000], ["880 CP", 170000], ["2400 CP", 450000]],
    bundles: [
      { name: "Battle Pass", price: 85000, tag: "BP", desc: "Rewards eksklusif sepanjang season + skin BP" },
      { name: "Battle Pass Bundle", price: 170000, tag: "BP+", desc: "Battle Pass + 12 tier langsung terbuka" },
    ],
  },
  {
    slug: "roblox", name: "Roblox", desc: "Robux Roblox termurah dengan garansi aman.",
    image: "assets/games/roblox.svg", hot: false,
    packs: [["400 Robux", 55000], ["800 Robux", 108000], ["1700 Robux", 225000]],
    bundles: [
      { name: "Premium 450", price: 55000, tag: "Premium", desc: "Robux bulanan + akses item eksklusif" },
      { name: "Premium 1000", price: 108000, tag: "Premium", desc: "Robux bulanan lebih banyak + diskon avatar" },
    ],
  },
  {
    slug: "coc", name: "Clash of Clans", desc: "Topup Gems Clash of Clans mudah & cepat.",
    image: "assets/games/coc.svg", hot: false,
    packs: [["500 Gems", 65000], ["1200 Gems", 145000], ["2500 Gems", 285000]],
    bundles: [
      { name: "Gold Pass", price: 85000, tag: "Pass", desc: "Rewards season: skin Barbarian King + 20% diskon upgrade" },
      { name: "Builder's Apprentice Pass", price: 45000, tag: "Pass", desc: "Upgrade Builder Base lebih cepat sepanjang season" },
    ],
  },
  {
    slug: "hsr", name: "Honkai Star Rail", desc: "Oneiric Shard Honkai Star Rail resmi.",
    image: "assets/games/hsr.svg", hot: false,
    packs: [["60 Shard", 14000], ["300 Shard", 68000], ["980 Shard", 215000]],
    bundles: [
      { name: "Express Supply Pass", price: 65000, tag: "Pass", desc: "90 Stellar Jade harian selama 30 hari" },
      { name: "Nameless Glory (BP)", price: 145000, tag: "BP", desc: "Battle Pass premium + 680 Oneiric Shard" },
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
  {
    slug: "higgs", name: "Higgs Domino", desc: "Koin Higgs Domino aman tanpa ribet.",
    image: "assets/games/higgs.svg", hot: false,
    packs: [["1M Koin", 15000], ["3M Koin", 42000], ["10M Koin", 130000]],
    bundles: [
      { name: "Monthly Pass", price: 25000, tag: "Pass", desc: "Bonus koin harian + event eksklusif" },
    ],
  },
  {
    slug: "pb", name: "Point Blank", desc: "Topup Cash Point Blank terpercaya.",
    image: "assets/games/pb.svg", hot: false,
    packs: [["5.000 Cash", 25000], ["12.000 Cash", 55000], ["25.000 Cash", 105000]],
    bundles: [
      { name: "Battle Pass (Season)", price: 30000, tag: "BP", desc: "Rewards eksklusif sepanjang season" },
    ],
  },

  /* ---------- Game tambahan (dari daftar supplier) ---------- */
  { slug: "farlight-84", name: "Farlight 84", desc: "Topup Farlight 84 termurah, proses cepat & aman.", image: "assets/games/farlight-84.svg", hot: false, packs: [["50 Diamond", 12500], ["125 Diamond", 28000], ["300 Diamond", 65000], ["660 Diamond", 140000], ["1320 Diamond", 275000]] },
  { slug: "ff-max", name: "Free Fire Max", desc: "Topup Free Fire Max murah & proses otomatis.", image: "assets/games/ff-max.svg", hot: false, packs: [["70 Diamond", 10000], ["140 Diamond", 20000], ["355 Diamond", 48500], ["720 Diamond", 96000]], bundles: [
      { name: "Monthly Membership", price: 45000, tag: "Member", desc: "Diamond harian 30 hari + hadiah mingguan" },
    ] },
  { slug: "haikyuu-fly-high", name: "Haikyuu Fly High", desc: "Topup Haikyuu Fly High termurah & terpercaya.", image: "assets/games/haikyuu-fly-high.svg", hot: false, packs: [["60 Star Gems", 16500], ["300 Star Gems", 83700], ["980 Star Gems", 251700], ["1980 Star Gems", 503700], ["3280 Star Gems", 839700]] },
  { slug: "lumia-saga", name: "Lumia Saga", desc: "Topup Lumia Saga murah, aman & instant.", image: "assets/games/lumia-saga.svg", hot: false, packs: [["60 Diamonds", 12000], ["180 Diamonds", 34000], ["330 Diamonds", 60000], ["680 Diamonds", 120000]] },
  { slug: "magic-chess", name: "Magic Chess", desc: "Topup Magic Chess mudah & cepat.", image: "assets/games/magic-chess.svg", hot: false, packs: [["50 Star Coins", 10000], ["120 Star Coins", 22000], ["250 Star Coins", 45000], ["500 Star Coins", 88000]], bundles: [
      { name: "Magic Chess Pass (Season)", price: 25000, tag: "Pass", desc: "Rewards sepanjang season + skin commander" },
    ] },
  { slug: "captain-tsubasa-ace", name: "Captain Tsubasa Ace", desc: "Topup Captain Tsubasa Ace terpercaya.", image: "assets/games/captain-tsubasa-ace.svg", hot: false, packs: [["60 Dreamballs", 13000], ["160 Dreamballs", 33000], ["320 Dreamballs", 65000], ["660 Dreamballs", 130000]] },
  { slug: "nikke", name: "Goddess of Victory: Nikke", desc: "Topup Nikke murah dengan garansi aman.", image: "assets/games/nikke.svg", hot: false, packs: [["60 Gems", 16000], ["120 Gems", 35000], ["320 Gems", 79000], ["720 Gems", 159000], ["1500 Gems", 320000]] },
  { slug: "jago", name: "Jago", desc: "Topup Jago mudah & proses otomatis.", image: "assets/games/jago.svg", hot: false, packs: [["100 Koin", 10000], ["300 Koin", 28000], ["600 Koin", 55000], ["1200 Koin", 108000]] },  {
    slug: "hok", name: "Honor of Kings", desc: "Topup Honor of Kings (HOK) termurah.",
    image: "assets/games/hok.svg", hot: false,
    packs: [["50 Voucher", 9500], ["250 Voucher", 45000], ["500 Voucher", 88000], ["1000 Voucher", 175000]],
    bundles: [
      { name: "Weekly Pass", price: 15000, tag: "Pass", desc: "Voucher harian 7 hari + skin eksklusif" },
      { name: "Battle Pass", price: 95000, tag: "BP", desc: "Rewards eksklusif sepanjang season" },
    ],
  },
  { slug: "egg-party", name: "Egg Party", desc: "Topup Egg Party aman & cepat.", image: "assets/games/egg-party.svg", hot: false, packs: [["60 Gems", 12000], ["150 Gems", 28000], ["330 Gems", 60000], ["700 Gems", 125000]] },
  { slug: "werewolf", name: "Werewolf (Party Game)", desc: "Topup Werewolf Party Game murah.", image: "assets/games/werewolf.svg", hot: false, packs: [["50 Gold", 10000], ["120 Gold", 23000], ["250 Gold", 46000], ["500 Gold", 90000]] },
  { slug: "speed-drifters", name: "Speed Drifters", desc: "Topup Speed Drifters terpercaya.", image: "assets/games/speed-drifters.svg", hot: false, packs: [["60 Diamonds", 10000], ["150 Diamonds", 24000], ["350 Diamonds", 55000], ["700 Diamonds", 108000]] },
  { slug: "ml-adventure", name: "ML Adventure", desc: "Topup ML Adventure mudah & cepat.", image: "assets/games/ml-adventure.svg", hot: false, packs: [["60 Diamonds", 12000], ["180 Diamonds", 34000], ["360 Diamonds", 65000], ["720 Diamonds", 128000]], bundles: [
      { name: "Monthly Pass", price: 30000, tag: "Pass", desc: "Diamond harian 30 hari + hadiah login" },
    ] },
  { slug: "lokapala", name: "Lokapala", desc: "Topup Lokapala game MOBA karya anak bangsa.", image: "assets/games/lokapala.svg", hot: false, packs: [["100 Battle Points", 10000], ["250 Battle Points", 24000], ["500 Battle Points", 47000], ["1000 Battle Points", 92000]], bundles: [
      { name: "Battle Pass (Season)", price: 25000, tag: "BP", desc: "Rewards eksklusif: skin hero + Battle Points" },
    ] },
  { slug: "racing-master", name: "Racing Master", desc: "Topup Racing Master termurah.", image: "assets/games/racing-master.svg", hot: false, packs: [["60 Vouchers", 10000], ["150 Vouchers", 24000], ["350 Vouchers", 55000], ["700 Vouchers", 108000]] },
  { slug: "forsaken-world-2", name: "Forsaken World 2", desc: "Topup Forsaken World 2 aman & cepat.", image: "assets/games/forsaken-world-2.svg", hot: false, packs: [["60 Gems", 13000], ["180 Gems", 37000], ["360 Gems", 72000], ["720 Gems", 140000]] },
  { slug: "football-master-2", name: "Football Master 2", desc: "Topup Football Master 2 terpercaya.", image: "assets/games/football-master-2.svg", hot: false, packs: [["50 Gems", 10000], ["120 Gems", 23000], ["250 Gems", 46000], ["500 Gems", 90000]] },
  { slug: "pokemon-unite", name: "Pokemon Unite", desc: "Topup Pokemon Unite murah & legal.", image: "assets/games/pokemon-unite.svg", hot: false, packs: [["60 Aeos Gems", 14000], ["300 Aeos Gems", 68000], ["800 Aeos Gems", 175000], ["1600 Aeos Gems", 340000]], bundles: [
      { name: "Battle Pass (HoloWear)", price: 85000, tag: "BP", desc: "Skin HoloWear eksklusif + rewards sepanjang season" },
      { name: "Membership", price: 55000, tag: "Member", desc: "Aeos Gems bulanan + diskon item shop" },
    ] },
  { slug: "ants-underground", name: "The Ants: Underground Kingdom", desc: "Topup The Ants Underground Kingdom cepat.", image: "assets/games/ants-underground.svg", hot: false, packs: [["60 Diamonds", 12000], ["150 Diamonds", 28000], ["330 Diamonds", 60000], ["700 Diamonds", 125000]] },
  { slug: "colorbang", name: "Colorbang", desc: "Topup Colorbang murah & mudah.", image: "assets/games/colorbang.svg", hot: false, packs: [["50 Colours", 10000], ["120 Colours", 23000], ["250 Colours", 46000], ["500 Colours", 90000]] },
  { slug: "delta-force", name: "Delta Force", desc: "Topup Delta Force terpercaya.", image: "assets/games/delta-force.svg", hot: false, packs: [["100 Voucher", 16000], ["300 Voucher", 45000], ["500 Voucher", 72000], ["1000 Voucher", 140000]] },
  { slug: "destiny-m", name: "Destiny M", desc: "Topup Destiny M aman & cepat.", image: "assets/games/destiny-m.svg", hot: false, packs: [["60 Diamonds", 12000], ["180 Diamonds", 34000], ["360 Diamonds", 65000], ["720 Diamonds", 128000]] },
  { slug: "moonlight-blade-m", name: "Moonlight Blade M", desc: "Topup Moonlight Blade M terpercaya.", image: "assets/games/moonlight-blade-m.svg", hot: false, packs: [["60 Yuanbao", 12000], ["180 Yuanbao", 34000], ["360 Yuanbao", 65000], ["720 Yuanbao", 128000]] },
  { slug: "ragnarok-m-eternal-love", name: "Ragnarok M: Eternal Love", desc: "Topup Ragnarok M Eternal Love murah.", image: "assets/games/ragnarok-m-eternal-love.svg", hot: false, packs: [["30 BCC", 12000], ["60 BCC", 24000], ["120 BCC", 46000], ["300 BCC", 112000], ["500 BCC", 185000]], bundles: [
      { name: "Weekly Growth Supplies", price: 25000, tag: "Pass", desc: "Zeny + item harian selama 7 hari" },
      { name: "Limited Premium Pack", price: 65000, tag: "Event", desc: "BCC + item premium eksklusif" },
    ] },
  { slug: "mob-rush", name: "Mob Rush", desc: "Topup Mob Rush mudah & cepat.", image: "assets/games/mob-rush.svg", hot: false, packs: [["50 Coins", 10000], ["120 Coins", 23000], ["250 Coins", 46000], ["500 Coins", 90000]] },
  { slug: "omega-legends", name: "Omega Legends", desc: "Topup Omega Legends termurah.", image: "assets/games/omega-legends.svg", hot: false, packs: [["60 Diamonds", 10000], ["150 Diamonds", 24000], ["350 Diamonds", 55000], ["700 Diamonds", 108000]] },
  { slug: "eos-red", name: "EOS Red", desc: "Topup EOS Red aman & cepat.", image: "assets/games/eos-red.svg", hot: false, packs: [["50 Gold", 10000], ["120 Gold", 23000], ["250 Gold", 46000], ["500 Gold", 90000]] },
  { slug: "bleach-mobile-3d", name: "Bleach Mobile 3D", desc: "Topup Bleach Mobile 3D terpercaya.", image: "assets/games/bleach-mobile-3d.svg", hot: false, packs: [["60 Soul Gems", 12000], ["180 Soul Gems", 34000], ["360 Soul Gems", 65000], ["720 Soul Gems", 128000]] },
  { slug: "shining-spirit", name: "Shining Spirit", desc: "Topup Shining Spirit mudah & cepat.", image: "assets/games/shining-spirit.svg", hot: false, packs: [["50 Crystals", 10000], ["120 Crystals", 23000], ["250 Crystals", 46000], ["500 Crystals", 90000]] },
  { slug: "auto-chess", name: "Auto Chess", desc: "Topup Auto Chess murah & aman.", image: "assets/games/auto-chess.svg", hot: false, packs: [["10 Candies", 8000], ["60 Candies", 42000], ["180 Candies", 120000], ["400 Candies", 260000]] },
  { slug: "life-after-credits", name: "Life After Credits", desc: "Topup Life After Credits terpercaya.", image: "assets/games/life-after-credits.svg", hot: false, packs: [["50 Gold", 10000], ["120 Gold", 23000], ["250 Gold", 46000], ["500 Gold", 90000]] },
  { slug: "pubgm-lite", name: "PUBG Mobile Lite", desc: "Topup PUBG Mobile Lite murah & cepat.", image: "assets/games/pubgm-lite.svg", hot: false, packs: [["60 UC", 16500], ["325 UC", 85000], ["660 UC", 168000], ["1800 UC", 445000]] },
  { slug: "alchemy-stars", name: "Alchemy Stars", desc: "Topup Alchemy Stars aman & legal.", image: "assets/games/alchemy-stars.svg", hot: false, packs: [["10 Lumocrystal", 6900], ["26 Lumocrystal", 16500], ["52 Lumocrystal", 32000], ["110 Lumocrystal", 65000], ["220 Lumocrystal", 128000]] },
  { slug: "fc-mobile", name: "FC Mobile", desc: "Topup FC Mobile termurah & terpercaya.", image: "assets/games/fc-mobile.svg", hot: false, packs: [["40 FC Points", 6400], ["100 FC Points", 14500], ["520 FC Points", 71200], ["1070 FC Points", 140000], ["2200 FC Points", 285000]] },
  { slug: "king-choice", name: "King Choice", desc: "Topup King Choice mudah & cepat.", image: "assets/games/king-choice.svg", hot: false, packs: [["50 Gems", 10000], ["120 Gems", 23000], ["250 Gems", 46000], ["500 Gems", 90000]] },
  { slug: "blood-strike", name: "Blood Strike", desc: "Topup Blood Strike aman & cepat.", image: "assets/games/blood-strike.svg", hot: false, packs: [["60 Credits", 12000], ["150 Credits", 28000], ["330 Credits", 60000], ["700 Credits", 125000]] },
  { slug: "project-sekai", name: "Hatsune Miku: Colorful Stage", desc: "Topup Hatsune Miku Colorful Stage murah.", image: "assets/games/project-sekai.svg", hot: false, packs: [["60 Crystals", 15000], ["300 Crystals", 71000], ["980 Crystals", 225000], ["1980 Crystals", 445000]] },
  { slug: "zepeto", name: "Zepeto", desc: "Topup Zepeto mudah & terpercaya.", image: "assets/games/zepeto.svg", hot: false, packs: [["50 ZEM", 10000], ["120 ZEM", 23000], ["250 ZEM", 46000], ["500 ZEM", 90000]] },
  { slug: "super-mecha-champions", name: "Super Mecha Champions", desc: "Topup Super Mecha Champions cepat.", image: "assets/games/super-mecha-champions.svg", hot: false, packs: [["50 Gold", 10000], ["120 Gold", 23000], ["250 Gold", 46000], ["500 Gold", 90000]] },
  { slug: "lord-mobile", name: "Lord Mobile", desc: "Topup Lord Mobile murah & aman.", image: "assets/games/lord-mobile.svg", hot: false, packs: [["67 Diamonds", 9700], ["134 Diamonds", 19500], ["335 Diamonds", 48500], ["670 Diamonds", 95000], ["1999 Diamonds", 285000]] },
  { slug: "one-punch-man", name: "One Punch Man", desc: "Topup One Punch Man terpercaya.", image: "assets/games/one-punch-man.svg", hot: false, packs: [["6 Kupon", 8700], ["13 Kupon", 25000], ["22 Kupon", 42000], ["50 Kupon", 95000], ["100 Kupon", 185000]] },
  { slug: "honkai-impact-3rd", name: "Honkai Impact 3rd", desc: "Topup Honkai Impact 3rd (HI3) murah.", image: "assets/games/honkai-impact-3rd.svg", hot: false, packs: [["60 Crystals", 14000], ["300 Crystals", 68000], ["980 Crystals", 215000], ["1980 Crystals", 425000]], bundles: [
      { name: "Monthly Pass", price: 45000, tag: "Pass", desc: "60 Crystals harian selama 30 hari" },
      { name: "BP Elite", price: 145000, tag: "BP", desc: "Battle Pass premium + hadiah season" },
    ] },
  { slug: "modern-combat-5", name: "Modern Combat 5", desc: "Topup Modern Combat 5 aman & cepat.", image: "assets/games/modern-combat-5.svg", hot: false, packs: [["50 Credits", 10000], ["120 Credits", 23000], ["250 Credits", 46000], ["500 Credits", 90000]] },
  { slug: "asphalt-9", name: "Asphalt 9", desc: "Topup Asphalt 9 termurah & terpercaya.", image: "assets/games/asphalt-9.svg", hot: false, packs: [["40 Tokens", 8000], ["105 Tokens", 20000], ["220 Tokens", 40000], ["450 Tokens", 80000], ["900 Tokens", 155000]], bundles: [
      { name: "Festival Pass", price: 45000, tag: "Pass", desc: "Rewards season: mobil eksklusif + Tokens" },
    ] },
  { slug: "undawn", name: "Undawn", desc: "Topup Undawn murah, proses otomatis.", image: "assets/games/undawn.svg", hot: false, packs: [["60 Diamonds", 13000], ["180 Diamonds", 37000], ["360 Diamonds", 72000], ["720 Diamonds", 140000]] },
  { slug: "revelation-infinite", name: "Revelation Infinite Journey", desc: "Topup Revelation Infinite Journey aman.", image: "assets/games/revelation-infinite.svg", hot: false, packs: [["50 Jade", 10000], ["120 Jade", 23000], ["250 Jade", 46000], ["500 Jade", 90000]] },
  { slug: "garena", name: "Garena", desc: "Topup Garena Shell murah & terpercaya.", image: "assets/games/garena.svg", hot: false, packs: [["50 Shells", 8000], ["100 Shells", 15000], ["200 Shells", 29000], ["500 Shells", 72000]] },
  { slug: "webtoon", name: "Webtoon", desc: "Topup Webtoon Coin mudah & cepat.", image: "assets/games/webtoon.svg", hot: false, packs: [["50 Coins", 12000], ["100 Coins", 24000], ["300 Coins", 70000], ["500 Coins", 115000]] },
  { slug: "wesing", name: "WeSing", desc: "Topup WeSing murah & aman.", image: "assets/games/wesing.svg", hot: false, packs: [["50 Coins", 10000], ["120 Coins", 23000], ["250 Coins", 46000], ["500 Coins", 90000]] },
  { slug: "heroic-uncle-kim", name: "Heroic Uncle Kim", desc: "Topup Heroic Uncle Kim terpercaya.", image: "assets/games/heroic-uncle-kim.svg", hot: false, packs: [["50 Gems", 10000], ["120 Gems", 23000], ["250 Gems", 46000], ["500 Gems", 90000]] },
  { slug: "path-to-nowhere", name: "Path to Nowhere", desc: "Topup Path to Nowhere aman & cepat.", image: "assets/games/path-to-nowhere.svg", hot: false, packs: [["60 Hypercube", 14000], ["300 Hypercube", 68000], ["980 Hypercube", 215000], ["1980 Hypercube", 425000]] },
  { slug: "starpass", name: "Starpass", desc: "Topup Starpass mudah & terpercaya.", image: "assets/games/starpass.svg", hot: false, packs: [["50 Points", 10000], ["120 Points", 23000], ["250 Points", 46000], ["500 Points", 90000]] },
  { slug: "jade-dynasty", name: "Jade Dynasty", desc: "Topup Jade Dynasty murah & cepat.", image: "assets/games/jade-dynasty.svg", hot: false, packs: [["50 Yuanbao", 10000], ["120 Yuanbao", 23000], ["250 Yuanbao", 46000], ["500 Yuanbao", 90000]] },
  { slug: "stumble-guys", name: "Stumble Guys", desc: "Topup Stumble Guys murah & seru.", image: "assets/games/stumble-guys.svg", hot: false, packs: [["25 Gems", 6500], ["100 Gems", 24000], ["250 Gems", 55000], ["500 Gems", 105000]], bundles: [
      { name: "Premium Pass (Season)", price: 45000, tag: "Pass", desc: "Rewards eksklusif: skin, emote & 500 Gems" },
    ] },
  { slug: "sausage-man", name: "Sausage Man", desc: "Topup Sausage Man aman & cepat.", image: "assets/games/sausage-man.svg", hot: false, packs: [["50 Gems", 10000], ["120 Gems", 23000], ["250 Gems", 46000], ["500 Gems", 90000]] },
  { slug: "bullet-angel", name: "Bullet Angel", desc: "Topup Bullet Angel terpercaya.", image: "assets/games/bullet-angel.svg", hot: false, packs: [["50 Diamonds", 10000], ["120 Diamonds", 23000], ["250 Diamonds", 46000], ["500 Diamonds", 90000]] },
  { slug: "super-sus", name: "Super Sus", desc: "Topup Super Sus mudah & cepat.", image: "assets/games/super-sus.svg", hot: false, packs: [["50 Beans", 10000], ["120 Beans", 23000], ["250 Beans", 46000], ["500 Beans", 90000]] },
  { slug: "lineage-2m", name: "Lineage2M", desc: "Topup Lineage2M aman & terpercaya.", image: "assets/games/lineage-2m.svg", hot: false, packs: [["100 Diamonds", 15000], ["300 Diamonds", 42000], ["600 Diamonds", 80000], ["1500 Diamonds", 195000]] },
  { slug: "ys-6-mobile", name: "YS 6 Mobile VNG", desc: "Topup YS 6 Mobile VNG murah & cepat.", image: "assets/games/ys-6-mobile.svg", hot: false, packs: [["50 Diamonds", 10000], ["120 Diamonds", 23000], ["250 Diamonds", 46000], ["500 Diamonds", 90000]] },
  { slug: "cloud-song", name: "Cloud Song", desc: "Topup Cloud Song aman & terpercaya.", image: "assets/games/cloud-song.svg", hot: false, packs: [["50 Crystals", 10000], ["120 Crystals", 23000], ["250 Crystals", 46000], ["500 Crystals", 90000]] },
  { slug: "arena-breakout", name: "Arena Breakout", desc: "Topup Arena Breakout termurah.", image: "assets/games/arena-breakout.svg", hot: false, packs: [["100 A-Coin", 16000], ["300 A-Coin", 45000], ["500 A-Coin", 72000], ["1000 A-Coin", 140000]] },
  { slug: "her", name: "HER", desc: "Topup HER mudah & proses cepat.", image: "assets/games/her.svg", hot: false, packs: [["50 Gems", 10000], ["120 Gems", 23000], ["250 Gems", 46000], ["500 Gems", 90000]] },
  { slug: "zenless-zone-zero", name: "Zenless Zone Zero (ZZZ)", desc: "Topup Zenless Zone Zero murah & aman.", image: "assets/games/zenless-zone-zero.svg", hot: false, packs: [["60 Polychrome", 14000], ["300 Polychrome", 68000], ["980 Polychrome", 215000], ["1980 Polychrome", 425000]], bundles: [
      { name: "Inter-Knot Membership", price: 65000, tag: "Pass", desc: "90 Polychrome harian selama 30 hari" },
      { name: "New Eridu City Fund (BP)", price: 145000, tag: "BP", desc: "Battle Pass premium + 680 Polychrome" },
    ] },
  { slug: "black-clover-m", name: "Black Clover M", desc: "Topup Black Clover M termurah.", image: "assets/games/black-clover-m.svg", hot: false, packs: [["60 Yul", 12000], ["180 Yul", 34000], ["360 Yul", 65000], ["720 Yul", 128000]] },
  { slug: "lotr-rise-to-war", name: "The Lord of the Rings: Rise to War", desc: "Topup LOTR Rise to War aman & cepat.", image: "assets/games/lotr-rise-to-war.svg", hot: false, packs: [["50 Gems", 10000], ["120 Gems", 23000], ["250 Gems", 46000], ["500 Gems", 90000]] },
  { slug: "harry-potter-magic-awakened", name: "Harry Potter: Magic Awakened", desc: "Topup Harry Potter Magic Awakened murah.", image: "assets/games/harry-potter-magic-awakened.svg", hot: false, packs: [["60 Gems", 12000], ["180 Gems", 34000], ["360 Gems", 65000], ["720 Gems", 128000]] },
  { slug: "hiya", name: "Hiya", desc: "Topup Hiya mudah & terpercaya.", image: "assets/games/hiya.svg", hot: false, packs: [["50 Coins", 10000], ["120 Coins", 23000], ["250 Coins", 46000], ["500 Coins", 90000]] },
  { slug: "onmyoji-arena", name: "Onmyoji Arena", desc: "Topup Onmyoji Arena murah & cepat.", image: "assets/games/onmyoji-arena.svg", hot: false, packs: [["50 Jade", 10000], ["120 Jade", 23000], ["250 Jade", 46000], ["500 Jade", 90000]], bundles: [
      { name: "Season Pass", price: 45000, tag: "Pass", desc: "Rewards eksklusif: skin + emote + Jade" },
    ] },
  { slug: "tower-of-fantasy", name: "Tower of Fantasy", desc: "Topup Tower of Fantasy aman & legal.", image: "assets/games/tower-of-fantasy.svg", hot: false, packs: [["60 Tanium", 14000], ["300 Tanium", 68000], ["980 Tanium", 215000], ["1980 Tanium", 425000]] },
  { slug: "laplace-m", name: "Laplace M", desc: "Topup Laplace M terpercaya.", image: "assets/games/laplace-m.svg", hot: false, packs: [["50 Diamonds", 10000], ["120 Diamonds", 23000], ["250 Diamonds", 46000], ["500 Diamonds", 90000]] },
  { slug: "mu-origin-3", name: "Mu Origin 3", desc: "Topup Mu Origin 3 murah & cepat.", image: "assets/games/mu-origin-3.svg", hot: false, packs: [["60 Zeny", 12000], ["180 Zeny", 34000], ["360 Zeny", 65000], ["720 Zeny", 128000]] },
  { slug: "be-the-king", name: "Be the King", desc: "Topup Be the King aman & cepat.", image: "assets/games/be-the-king.svg", hot: false, packs: [["50 Gold", 10000], ["120 Gold", 23000], ["250 Gold", 46000], ["500 Gold", 90000]] },
  { slug: "smash-legends", name: "Smash Legends", desc: "Topup Smash Legends mudah & cepat.", image: "assets/games/smash-legends.svg", hot: false, packs: [["50 Gems", 10000], ["120 Gems", 23000], ["250 Gems", 46000], ["500 Gems", 90000]], bundles: [
      { name: "Season Pass", price: 35000, tag: "Pass", desc: "Rewards eksklusif: skin legend + Gems" },
    ] },
  { slug: "octopath-traveler", name: "Octopath Traveler", desc: "Topup Octopath Traveler terpercaya.", image: "assets/games/octopath-traveler.svg", hot: false, packs: [["50 Rubies", 10000], ["120 Rubies", 23000], ["250 Rubies", 46000], ["500 Rubies", 90000]] },
  { slug: "captain-tsubasa-dream-team", name: "Captain Tsubasa: Dream Team", desc: "Topup Captain Tsubasa Dream Team murah.", image: "assets/games/captain-tsubasa-dream-team.svg", hot: false, packs: [["50 D-Balls", 10000], ["120 D-Balls", 23000], ["250 D-Balls", 46000], ["500 D-Balls", 90000]] },
  { slug: "dragon-nest-m-classic", name: "Dragon Nest M Classic", desc: "Topup Dragon Nest M Classic aman.", image: "assets/games/dragon-nest-m-classic.svg", hot: false, packs: [["50 Diamonds", 10000], ["120 Diamonds", 23000], ["250 Diamonds", 46000], ["500 Diamonds", 90000]] },
  { slug: "identity-v", name: "Identity V", desc: "Topup Identity V mudah & cepat.", image: "assets/games/identity-v.svg", hot: false, packs: [["50 Echoes", 10000], ["120 Echoes", 23000], ["250 Echoes", 46000], ["500 Echoes", 90000]], bundles: [
      { name: "Season Pass (S14+)", price: 45000, tag: "Pass", desc: "Rewards season: skin + emote + Echoes" },
      { name: "Truth Serum Bundle", price: 12000, tag: "Event", desc: "Bundle investigasi: item eksklusif" },
    ] },
  { slug: "heaven-burns-red", name: "Heaven Burns Red", desc: "Topup Heaven Burns Red terpercaya.", image: "assets/games/heaven-burns-red.svg", hot: false, packs: [["60 Quartz", 12000], ["180 Quartz", 34000], ["360 Quartz", 65000], ["720 Quartz", 128000]] },
  { slug: "light-of-them", name: "Light of Them: New Era", desc: "Topup Light of Them New Era murah.", image: "assets/games/light-of-them.svg", hot: false, packs: [["50 Gems", 10000], ["120 Gems", 23000], ["250 Gems", 46000], ["500 Gems", 90000]] },
  { slug: "dragon-raja-sea", name: "Dragon Raja Sea", desc: "Topup Dragon Raja Sea aman & cepat.", image: "assets/games/dragon-raja-sea.svg", hot: false, packs: [["50 Diamonds", 10000], ["120 Diamonds", 23000], ["250 Diamonds", 46000], ["500 Diamonds", 90000]] },
  { slug: "ace-racer", name: "Ace Racer", desc: "Topup Ace Racer murah & terpercaya.", image: "assets/games/ace-racer.svg", hot: false, packs: [["50 Tokens", 10000], ["120 Tokens", 23000], ["250 Tokens", 46000], ["500 Tokens", 90000]] },
  { slug: "tarisland", name: "Tarisland", desc: "Topup Tarisland termurah & aman.", image: "assets/games/tarisland.svg", hot: false, packs: [["60 Crystals", 12000], ["180 Crystals", 34000], ["360 Crystals", 65000], ["720 Crystals", 128000]] },
  { slug: "astra-knight-of-veda", name: "Astra: Knight of Veda", desc: "Topup Astra Knight of Veda cepat.", image: "assets/games/astra-knight-of-veda.svg", hot: false, packs: [["60 Diamonds", 12000], ["180 Diamonds", 34000], ["360 Diamonds", 65000], ["720 Diamonds", 128000]] },
  { slug: "saint-seiya", name: "Saint Seiya", desc: "Topup Saint Seiya murah & terpercaya.", image: "assets/games/saint-seiya.svg", hot: false, packs: [["50 Gems", 10000], ["120 Gems", 23000], ["250 Gems", 46000], ["500 Gems", 90000]] },
  { slug: "seal-m-sea", name: "Seal M Sea", desc: "Topup Seal M Sea aman & cepat.", image: "assets/games/seal-m-sea.svg", hot: false, packs: [["50 Diamonds", 10000], ["120 Diamonds", 23000], ["250 Diamonds", 46000], ["500 Diamonds", 90000]] },
  { slug: "metal-slug-awakening", name: "Metal Slug Awakening", desc: "Topup Metal Slug Awakening mudah.", image: "assets/games/metal-slug-awakening.svg", hot: false, packs: [["50 Diamonds", 10000], ["120 Diamonds", 23000], ["250 Diamonds", 46000], ["500 Diamonds", 90000]] },
  { slug: "punishing-gray-raven", name: "Punishing: Gray Raven (PGR)", desc: "Topup Punishing Gray Raven (PGR) murah.", image: "assets/games/punishing-gray-raven.svg", hot: false, packs: [["60 Rainbow Card", 14000], ["300 Rainbow Card", 68000], ["980 Rainbow Card", 215000], ["1980 Rainbow Card", 425000]] },
  { slug: "hyper-front", name: "Hyper Front", desc: "Topup Hyper Front aman & cepat.", image: "assets/games/hyper-front.svg", hot: false, packs: [["50 Points", 10000], ["120 Points", 23000], ["250 Points", 46000], ["500 Points", 90000]] },
  { slug: "love-and-deep-space", name: "Love and Deep Space", desc: "Topup Love and Deep Space termurah.", image: "assets/games/love-and-deep-space.svg", hot: false, packs: [["60 Diamonds", 15000], ["150 Diamonds", 35000], ["330 Diamonds", 75000], ["700 Diamonds", 155000]] },
  { slug: "ragnarok-monster-world", name: "Ragnarok Monster World", desc: "Topup Ragnarok Monster World murah.", image: "assets/games/ragnarok-monster-world.svg", hot: false, packs: [["50 Zeny", 10000], ["120 Zeny", 23000], ["250 Zeny", 46000], ["500 Zeny", 90000]] },
  { slug: "ragnarok-origins", name: "Ragnarok Origins", desc: "Topup Ragnarok Origins aman & cepat.", image: "assets/games/ragnarok-origins.svg", hot: false, packs: [["50 Zeny", 10000], ["120 Zeny", 23000], ["250 Zeny", 46000], ["500 Zeny", 90000]] },
  { slug: "au2-mobile", name: "AU2 Mobile", desc: "Topup AU2 Mobile mudah & terpercaya.", image: "assets/games/au2-mobile.svg", hot: false, packs: [["50 Cash", 10000], ["120 Cash", 23000], ["250 Cash", 46000], ["500 Cash", 90000]] },
  { slug: "nba-infinite", name: "NBA Infinite", desc: "Topup NBA Infinite murah & cepat.", image: "assets/games/nba-infinite.svg", hot: false, packs: [["50 VC", 10000], ["120 VC", 23000], ["250 VC", 46000], ["500 VC", 90000]] },
  { slug: "age-of-empires-mobile", name: "Age of Empires Mobile", desc: "Topup Age of Empires Mobile aman.", image: "assets/games/age-of-empires-mobile.svg", hot: false, packs: [["50 Gems", 10000], ["120 Gems", 23000], ["250 Gems", 46000], ["500 Gems", 90000]] },
  { slug: "marvel-rivals", name: "Marvel Rivals", desc: "Topup Marvel Rivals termurah & aman.", image: "assets/games/marvel-rivals.svg", hot: false, packs: [["100 Lattice", 16000], ["300 Lattice", 45000], ["500 Lattice", 72000], ["800 Lattice", 115000]] },
  { slug: "ragnarok-idle-adventure", name: "Ragnarok Idle Adventure Plus", desc: "Topup Ragnarok Idle Adventure murah.", image: "assets/games/ragnarok-idle-adventure.svg", hot: false, packs: [["50 Zeny", 10000], ["120 Zeny", 23000], ["250 Zeny", 46000], ["500 Zeny", 90000]] },
  { slug: "clash-royale", name: "Clash Royale", desc: "Topup Clash Royale mudah & cepat.", image: "assets/games/clash-royale.svg", hot: false, packs: [["80 Gems", 16000], ["500 Gems", 95000], ["1200 Gems", 220000], ["2500 Gems", 440000]], bundles: [
      { name: "Season Pass (Diamond Pass)", price: 85000, tag: "Pass", desc: "Rewards season: emote + skin King + 20% bonus" },
    ] },
  { slug: "life-makeover", name: "Life Makeover", desc: "Topup Life Makeover aman & terpercaya.", image: "assets/games/life-makeover.svg", hot: false, packs: [["50 Gems", 10000], ["120 Gems", 23000], ["250 Gems", 46000], ["500 Gems", 90000]] },
  { slug: "dragonheir-silent-god", name: "Dragonheir: Silent God", desc: "Topup Dragonheir Silent God murah.", image: "assets/games/dragonheir-silent-god.svg", hot: false, packs: [["50 Diamonds", 10000], ["120 Diamonds", 23000], ["250 Diamonds", 46000], ["500 Diamonds", 90000]] },
  { slug: "ghost-story", name: "Ghost Story", desc: "Topup Ghost Story mudah & cepat.", image: "assets/games/ghost-story.svg", hot: false, packs: [["50 Gems", 10000], ["120 Gems", 23000], ["250 Gems", 46000], ["500 Gems", 90000]] },
  { slug: "ensemble-stars-music", name: "Ensemble Stars Music", desc: "Topup Ensemble Stars Music terpercaya.", image: "assets/games/ensemble-stars-music.svg", hot: false, packs: [["50 Diamonds", 10000], ["120 Diamonds", 23000], ["250 Diamonds", 46000], ["500 Diamonds", 90000]] },
  { slug: "girls-connect", name: "Girls Connect", desc: "Topup Girls Connect murah & aman.", image: "assets/games/girls-connect.svg", hot: false, packs: [["50 Crystals", 10000], ["120 Crystals", 23000], ["250 Crystals", 46000], ["500 Crystals", 90000]] },
  { slug: "t3-arena", name: "T3 Arena", desc: "Topup T3 Arena mudah & cepat.", image: "assets/games/t3-arena.svg", hot: false, packs: [["50 Gems", 10000], ["120 Gems", 23000], ["250 Gems", 46000], ["500 Gems", 90000]], bundles: [
      { name: "Battle Pass (Season)", price: 35000, tag: "BP", desc: "Rewards eksklusif: skin + Gems" },
    ] },
  { slug: "chaos-crisis", name: "Chaos Crisis", desc: "Topup Chaos Crisis aman & terpercaya.", image: "assets/games/chaos-crisis.svg", hot: false, packs: [["50 Gold", 10000], ["120 Gold", 23000], ["250 Gold", 46000], ["500 Gold", 90000]] },
  { slug: "mangatoon", name: "MangaToon", desc: "Topup MangaToon mudah & cepat.", image: "assets/games/mangatoon.svg", hot: false, packs: [["50 Coins", 10000], ["120 Coins", 23000], ["250 Coins", 46000], ["500 Coins", 90000]] },
  { slug: "tom-and-jerry-chase", name: "Tom and Jerry: Chase", desc: "Topup Tom and Jerry Chase murah.", image: "assets/games/tom-and-jerry-chase.svg", hot: false, packs: [["50 Gems", 10000], ["120 Gems", 23000], ["250 Gems", 46000], ["500 Gems", 90000]] },
  { slug: "star-maker", name: "Star Maker", desc: "Topup Star Maker aman & cepat.", image: "assets/games/star-maker.svg", hot: false, packs: [["50 Coins", 10000], ["120 Coins", 23000], ["250 Coins", 46000], ["500 Coins", 90000]] },
  { slug: "mirren-star-legends", name: "Mirren Star Legends", desc: "Topup Mirren Star Legends terpercaya.", image: "assets/games/mirren-star-legends.svg", hot: false, packs: [["50 Gems", 10000], ["120 Gems", 23000], ["250 Gems", 46000], ["500 Gems", 90000]] },
  { slug: "pixel-gun-3d", name: "Pixel Gun 3D", desc: "Topup Pixel Gun 3D murah & seru.", image: "assets/games/pixel-gun-3d.svg", hot: false, packs: [["20 Gems", 8000], ["50 Gems", 19000], ["100 Gems", 37000], ["250 Gems", 90000]] },
  { slug: "naruto-shippuden", name: "Naruto Shippuden", desc: "Topup Naruto Shippuden mudah & cepat.", image: "assets/games/naruto-shippuden.svg", hot: false, packs: [["50 Coupon", 12000], ["100 Coupon", 22000], ["250 Coupon", 52000], ["500 Coupon", 100000]], bundles: [
      { name: "Ninja Pass (Season)", price: 45000, tag: "Pass", desc: "Rewards login harian + skin eksklusif" },
    ] },
  { slug: "pubg-new-state", name: "PUBG New State Mobile", desc: "Topup PUBG New State Mobile termurah.", image: "assets/games/pubg-new-state.svg", hot: false, packs: [["60 NC", 12000], ["180 NC", 34000], ["360 NC", 65000], ["720 NC", 128000]] },
  { slug: "madtale", name: "Madtale Idle RPG", desc: "Topup Madtale Idle RPG aman & cepat.", image: "assets/games/madtale.svg", hot: false, packs: [["50 Diamonds", 10000], ["120 Diamonds", 23000], ["250 Diamonds", 46000], ["500 Diamonds", 90000]] },
  { slug: "soul-land-new-world", name: "Soul Land New World", desc: "Topup Soul Land New World terpercaya.", image: "assets/games/soul-land-new-world.svg", hot: false, packs: [["50 Diamonds", 10000], ["120 Diamonds", 23000], ["250 Diamonds", 46000], ["500 Diamonds", 90000]] },
  { slug: "snowbreak", name: "Snowbreak: Containment Zone", desc: "Topup Snowbreak murah & aman.", image: "assets/games/snowbreak.svg", hot: false, packs: [["60 Digicash", 14000], ["300 Digicash", 68000], ["980 Digicash", 215000], ["1980 Digicash", 425000]] },
  { slug: "ride-out-heroes", name: "Ride Out Heroes", desc: "Topup Ride Out Heroes mudah & cepat.", image: "assets/games/ride-out-heroes.svg", hot: false, packs: [["50 Gold", 10000], ["120 Gold", 23000], ["250 Gold", 46000], ["500 Gold", 90000]] },
  { slug: "afk-journey", name: "AFK Journey", desc: "Topup AFK Journey termurah & aman.", image: "assets/games/afk-journey.svg", hot: false, packs: [["60 Diamonds", 14000], ["300 Diamonds", 68000], ["980 Diamonds", 215000], ["1980 Diamonds", 425000]], bundles: [
      { name: "Noble Path (BP)", price: 95000, tag: "BP", desc: "Battle Pass premium: skin + Diamonds sepanjang season" },
    ] },
  { slug: "legacy-of-discord", name: "Legacy of Discord: Furious Wings", desc: "Topup Legacy of Discord murah & cepat.", image: "assets/games/legacy-of-discord.svg", hot: false, packs: [["50 Diamonds", 10000], ["120 Diamonds", 23000], ["250 Diamonds", 46000], ["500 Diamonds", 90000]] },
  { slug: "astral-guardians", name: "Astral Guardians", desc: "Topup Astral Guardians aman & terpercaya.", image: "assets/games/astral-guardians.svg", hot: false, packs: [["50 Crystals", 10000], ["120 Crystals", 23000], ["250 Crystals", 46000], ["500 Crystals", 90000]] },
  { slug: "crystal-of-atlan", name: "Crystal of Atlan", desc: "Topup Crystal of Atlan mudah & cepat.", image: "assets/games/crystal-of-atlan.svg", hot: false, packs: [["50 Gems", 10000], ["120 Gems", 23000], ["250 Gems", 46000], ["500 Gems", 90000]] },
  { slug: "trails-of-cold-steel", name: "Trails of Cold Steel NE", desc: "Topup Trails of Cold Steel NE murah.", image: "assets/games/trails-of-cold-steel.svg", hot: false, packs: [["50 Mira", 10000], ["120 Mira", 23000], ["250 Mira", 46000], ["500 Mira", 90000]] },
  { slug: "perfect-world-mobile-2", name: "Perfect World Mobile 2", desc: "Topup Perfect World Mobile 2 aman.", image: "assets/games/perfect-world-mobile-2.svg", hot: false, packs: [["60 Yuanbao", 12000], ["180 Yuanbao", 34000], ["360 Yuanbao", 65000], ["720 Yuanbao", 128000]] },
  { slug: "rules-of-survival", name: "Rules of Survival Mobile", desc: "Topup Rules of Survival mudah & cepat.", image: "assets/games/rules-of-survival.svg", hot: false, packs: [["50 Gold", 10000], ["120 Gold", 23000], ["250 Gold", 46000], ["500 Gold", 90000]] },
  { slug: "once-human", name: "Once Human", desc: "Topup Once Human termurah & terpercaya.", image: "assets/games/once-human.svg", hot: false, packs: [["60 Crystgin", 14000], ["300 Crystgin", 68000], ["980 Crystgin", 215000], ["1980 Crystgin", 425000]] },
  { slug: "love-nikki", name: "Love Nikki", desc: "Topup Love Nikki murah & seru.", image: "assets/games/love-nikki.svg", hot: false, packs: [["50 Diamonds", 10000], ["120 Diamonds", 23000], ["250 Diamonds", 46000], ["500 Diamonds", 90000]], bundles: [
      { name: "Monthly Card", price: 45000, tag: "Member", desc: "Diamonds harian 30 hari + outfit eksklusif" },
    ] },
  { slug: "likes", name: "Likes", desc: "Topup Likes mudah & aman.", image: "assets/games/likes.svg", hot: false, packs: [["50 Coins", 10000], ["120 Coins", 23000], ["250 Coins", 46000], ["500 Coins", 90000]] },
  { slug: "wuthering-waves", name: "Wuthering Waves (WuWa)", desc: "Topup Wuthering Waves (WuWa) murah.", image: "assets/games/wuthering-waves.svg", hot: false, packs: [["60 Lunite", 14000], ["300 Lunite", 68000], ["980 Lunite", 215000], ["1980 Lunite", 425000]], bundles: [
      { name: "Monthly Pass (Lunite Sub)", price: 65000, tag: "Pass", desc: "90 Astrite harian selama 30 hari" },
      { name: "Pioneer Podcast (BP)", price: 145000, tag: "BP", desc: "Battle Pass premium + 680 Lunite" },
    ] },
  { slug: "isekai-feast", name: "Isekai Feast", desc: "Topup Isekai Feast aman & cepat.", image: "assets/games/isekai-feast.svg", hot: false, packs: [["50 Gems", 10000], ["120 Gems", 23000], ["250 Gems", 46000], ["500 Gems", 90000]] },
  { slug: "culinary-tour", name: "Culinary Tour", desc: "Topup Culinary Tour mudah & terpercaya.", image: "assets/games/culinary-tour.svg", hot: false, packs: [["50 Gems", 10000], ["120 Gems", 23000], ["250 Gems", 46000], ["500 Gems", 90000]] },
  { slug: "eternal-city", name: "Eternal City", desc: "Topup Eternal City murah & cepat.", image: "assets/games/eternal-city.svg", hot: false, packs: [["50 Diamonds", 10000], ["120 Diamonds", 23000], ["250 Diamonds", 46000], ["500 Diamonds", 90000]] },
  { slug: "heroes-evolved", name: "Heroes Evolved", desc: "Topup Heroes Evolved aman & cepat.", image: "assets/games/heroes-evolved.svg", hot: false, packs: [["50 Gold", 10000], ["120 Gold", 23000], ["250 Gold", 46000], ["500 Gold", 90000]], bundles: [
      { name: "Season Pass", price: 30000, tag: "Pass", desc: "Rewards eksklusif sepanjang season" },
    ] },
  { slug: "state-of-survival", name: "State of Survival", desc: "Topup State of Survival terpercaya.", image: "assets/games/state-of-survival.svg", hot: false, packs: [["120 Biocaps", 15000], ["300 Biocaps", 36000], ["620 Biocaps", 72000], ["1280 Biocaps", 145000]] },
  { slug: "project-of-entropy", name: "Project of Entropy", desc: "Topup Project of Entropy mudah & cepat.", image: "assets/games/project-of-entropy.svg", hot: false, packs: [["50 Crystals", 10000], ["120 Crystals", 23000], ["250 Crystals", 46000], ["500 Crystals", 90000]] },
  { slug: "world-war-heroes", name: "World War Heroes", desc: "Topup World War Heroes murah & aman.", image: "assets/games/world-war-heroes.svg", hot: false, packs: [["50 Gold", 10000], ["120 Gold", 23000], ["250 Gold", 46000], ["500 Gold", 90000]] },
  { slug: "scroll-of-onmyoji", name: "Scroll of Onmyoji", desc: "Topup Scroll of Onmyoji cepat & aman.", image: "assets/games/scroll-of-onmyoji.svg", hot: false, packs: [["50 Jade", 10000], ["120 Jade", 23000], ["250 Jade", 46000], ["500 Jade", 90000]] },
  { slug: "dbd-mobile", name: "Dead by Daylight Mobile SEA", desc: "Topup Dead by Daylight Mobile murah.", image: "assets/games/dbd-mobile.svg", hot: false, packs: [["60 Cells", 12000], ["180 Cells", 34000], ["360 Cells", 65000], ["720 Cells", 128000]] },
  { slug: "sword-of-justice", name: "Sword of Justice", desc: "Topup Sword of Justice mudah & cepat.", image: "assets/games/sword-of-justice.svg", hot: false, packs: [["50 Diamonds", 10000], ["120 Diamonds", 23000], ["250 Diamonds", 46000], ["500 Diamonds", 90000]] },
  { slug: "paw-tales", name: "Paw Tales: Eternal Bond", desc: "Topup Paw Tales Eternal Bond terpercaya.", image: "assets/games/paw-tales.svg", hot: false, packs: [["50 Diamonds", 10000], ["120 Diamonds", 23000], ["250 Diamonds", 46000], ["500 Diamonds", 90000]] },
  { slug: "aether-gazer", name: "Aether Gazer", desc: "Topup Aether Gazer murah & aman.", image: "assets/games/aether-gazer.svg", hot: false, packs: [["60 Crystals", 14000], ["300 Crystals", 68000], ["980 Crystals", 215000], ["1980 Crystals", 425000]] },
  { slug: "black-desert-mobile", name: "Black Desert Mobile", desc: "Topup Black Desert Mobile termurah.", image: "assets/games/black-desert-mobile.svg", hot: false, packs: [["100 Black Pearls", 15000], ["500 Black Pearls", 70000], ["1000 Black Pearls", 135000], ["2000 Black Pearls", 265000]], bundles: [
      { name: "Monthly Pass", price: 65000, tag: "Pass", desc: "Black Pearls harian + item peningkatan" },
    ] },
  { slug: "dark-continent-mist", name: "Dark Continent Mist", desc: "Topup Dark Continent Mist aman & cepat.", image: "assets/games/dark-continent-mist.svg", hot: false, packs: [["50 Gems", 10000], ["120 Gems", 23000], ["250 Gems", 46000], ["500 Gems", 90000]] },
  { slug: "whiteout-survival", name: "Whiteout Survival: Frost Star", desc: "Topup Whiteout Survival murah & cepat.", image: "assets/games/whiteout-survival.svg", hot: false, packs: [["500 Gems", 15000], ["1500 Gems", 42000], ["3000 Gems", 80000], ["6000 Gems", 155000]], bundles: [
      { name: "Survivor Pass", price: 85000, tag: "Pass", desc: "Rewards season: skin kota + hero + speed up" },
      { name: "Frost Star Pass", price: 45000, tag: "Pass", desc: "Rewards harian 30 hari: Gems + resource" },
    ] },
  { slug: "legend-of-neverland", name: "The Legend of Neverland", desc: "Topup Legend of Neverland terpercaya.", image: "assets/games/legend-of-neverland.svg", hot: false, packs: [["50 Gems", 10000], ["120 Gems", 23000], ["250 Gems", 46000], ["500 Gems", 90000]] },
  { slug: "azur-lane", name: "Azur Lane", desc: "Topup Azur Lane mudah & aman.", image: "assets/games/azur-lane.svg", hot: false, packs: [["60 Gems", 14000], ["180 Gems", 38000], ["330 Gems", 68000], ["680 Gems", 138000]], bundles: [
      { name: "Monthly Pass", price: 45000, tag: "Pass", desc: "Gems harian 30 hari + item perbaikan" },
    ] },
  { slug: "king-of-kings", name: "King of Kings", desc: "Topup King of Kings murah & cepat.", image: "assets/games/king-of-kings.svg", hot: false, packs: [["50 Gold", 10000], ["120 Gold", 23000], ["250 Gold", 46000], ["500 Gold", 90000]] },
  { slug: "melojam", name: "Melojam", desc: "Topup Melojam mudah & terpercaya.", image: "assets/games/melojam.svg", hot: false, packs: [["50 Coins", 10000], ["120 Coins", 23000], ["250 Coins", 46000], ["500 Coins", 90000]] },
  { slug: "dragon-city", name: "Dragon City", desc: "Topup Dragon City murah & seru.", image: "assets/games/dragon-city.svg", hot: false, packs: [["50 Gems", 10000], ["120 Gems", 23000], ["250 Gems", 46000], ["500 Gems", 90000]] },
  { slug: "growtopia", name: "Growtopia Lita", desc: "Topup Growtopia Lita aman & cepat.", image: "assets/games/growtopia.svg", hot: false, packs: [["1 World Lock", 15000], ["5 World Locks", 70000], ["10 World Locks", 135000], ["25 World Locks", 330000]] },
  { slug: "ragnarok-m-classic", name: "Ragnarok M Classic", desc: "Topup Ragnarok M Classic murah.", image: "assets/games/ragnarok-m-classic.svg", hot: false, packs: [["50 Zeny", 10000], ["120 Zeny", 23000], ["250 Zeny", 46000], ["500 Zeny", 90000]] },
  { slug: "airplane-chef", name: "Airplane Chef", desc: "Topup Airplane Chef mudah & cepat.", image: "assets/games/airplane-chef.svg", hot: false, packs: [["50 Gold", 10000], ["120 Gold", 23000], ["250 Gold", 46000], ["500 Gold", 90000]] },
  { slug: "war-robots", name: "War Robots", desc: "Topup War Robots aman & terpercaya.", image: "assets/games/war-robots.svg", hot: false, packs: [["50 Au", 12000], ["100 Au", 23000], ["250 Au", 55000], ["500 Au", 108000]] },
  { slug: "wild-rift", name: "League of Legends: Wild Rift", desc: "Topup Wild Rift (LoL Mobile) termurah.", image: "assets/games/wild-rift.svg", hot: false, packs: [["95 Wild Core", 15000], ["250 Wild Core", 38000], ["500 Wild Core", 75000], ["1100 Wild Core", 160000]], bundles: [
      { name: "Wild Pass (Season)", price: 60000, tag: "Pass", desc: "Rewards eksklusif: skin, pose & Wild Core" },
    ] },
  { slug: "legends-of-runeterra", name: "Legends of Runeterra", desc: "Topup Legends of Runeterra mudah & aman.", image: "assets/games/legends-of-runeterra.svg", hot: false, packs: [["50 Coins", 12000], ["120 Coins", 28000], ["250 Coins", 55000], ["500 Coins", 108000]] },
  { slug: "tft-mobile", name: "Team Fight Tactics Mobile", desc: "Topup TFT Mobile murah & cepat.", image: "assets/games/tft-mobile.svg", hot: false, packs: [["50 Coins", 12000], ["120 Coins", 28000], ["250 Coins", 55000], ["500 Coins", 108000]] },
  { slug: "league-of-legends", name: "League of Legends PC", desc: "Topup League of Legends PC aman.", image: "assets/games/league-of-legends.svg", hot: false, packs: [["100 RP", 15000], ["250 RP", 35000], ["500 RP", 68000], ["1000 RP", 135000]] },
  { slug: "marvel-snap", name: "Marvel Snap", desc: "Topup Marvel Snap mudah & terpercaya.", image: "assets/games/marvel-snap.svg", hot: false, packs: [["100 Gold", 17000], ["250 Gold", 42000], ["500 Gold", 82000], ["1000 Gold", 160000]] },
  { slug: "sky-children-of-the-light", name: "Sky: Children of the Light", desc: "Topup Sky Children of the Light murah.", image: "assets/games/sky-children-of-the-light.svg", hot: false, packs: [["10 Candles", 12000], ["30 Candles", 34000], ["60 Candles", 66000], ["100 Candles", 108000]] },
  { slug: "ragnarok-x", name: "Ragnarok X: Next Generation", desc: "Topup Ragnarok X Next Generation aman.", image: "assets/games/ragnarok-x.svg", hot: false, packs: [["60 Zeny", 12000], ["180 Zeny", 34000], ["360 Zeny", 65000], ["720 Zeny", 128000]] },
  { slug: "king-of-avalon", name: "King of Avalon", desc: "Topup King of Avalon murah & cepat.", image: "assets/games/king-of-avalon.svg", hot: false, packs: [["50 Gems", 10000], ["120 Gems", 23000], ["250 Gems", 46000], ["500 Gems", 90000]] },
  { slug: "watcher-of-realms", name: "Watcher of Realms", desc: "Topup Watcher of Realms mudah & aman.", image: "assets/games/watcher-of-realms.svg", hot: false, packs: [["50 Gems", 10000], ["120 Gems", 23000], ["250 Gems", 46000], ["500 Gems", 90000]] },
  { slug: "guns-of-glory", name: "Guns of Glory", desc: "Topup Guns of Glory terpercaya.", image: "assets/games/guns-of-glory.svg", hot: false, packs: [["50 Gems", 10000], ["120 Gems", 23000], ["250 Gems", 46000], ["500 Gems", 90000]] },
  { slug: "draconia-saga", name: "Draconia Saga", desc: "Topup Draconia Saga murah & cepat.", image: "assets/games/draconia-saga.svg", hot: false, packs: [["50 Diamonds", 10000], ["120 Diamonds", 23000], ["250 Diamonds", 46000], ["500 Diamonds", 90000]] },
  { slug: "rise-of-kingdoms", name: "Rise of Kingdoms", desc: "Topup Rise of Kingdoms aman & terpercaya.", image: "assets/games/rise-of-kingdoms.svg", hot: false, packs: [["320 Gems", 17000], ["800 Gems", 41000], ["1750 Gems", 88000], ["4000 Gems", 195000]] },
];

/* Format angka ke Rupiah */
function formatRupiah(n) {
  return "Rp" + Number(n).toLocaleString("id-ID");
}
