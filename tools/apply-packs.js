/* ============================================================
   TOOLS: apply-packs.js
   ------------------------------------------------------------
   Mengganti packs: defaultPacks(<harga>) pada setiap game di
   js/data.js dengan daftar paket eksplisit yang lebih realistis
   (nama item + harga sesuai pasar topup Indonesia).

   Jalankan:  node tools/apply-packs.js
   ============================================================ */

const fs = require("fs");

/* slug → daftar paket [nama, harga] */
const PACKS = {
  "haikyuu-fly-high": [["60 Star Gems", 16500], ["300 Star Gems", 83700], ["980 Star Gems", 251700], ["1980 Star Gems", 503700], ["3280 Star Gems", 839700]],
  "lumia-saga": [["60 Diamonds", 12000], ["180 Diamonds", 34000], ["330 Diamonds", 60000], ["680 Diamonds", 120000]],
  "magic-chess": [["50 Star Coins", 10000], ["120 Star Coins", 22000], ["250 Star Coins", 45000], ["500 Star Coins", 88000]],
  "captain-tsubasa-ace": [["60 Dreamballs", 13000], ["160 Dreamballs", 33000], ["320 Dreamballs", 65000], ["660 Dreamballs", 130000]],
  "nikke": [["60 Gems", 16000], ["120 Gems", 35000], ["320 Gems", 79000], ["720 Gems", 159000], ["1500 Gems", 320000]],
  "jago": [["100 Koin", 10000], ["300 Koin", 28000], ["600 Koin", 55000], ["1200 Koin", 108000]],
  "egg-party": [["60 Gems", 12000], ["150 Gems", 28000], ["330 Gems", 60000], ["700 Gems", 125000]],
  "werewolf": [["50 Gold", 10000], ["120 Gold", 23000], ["250 Gold", 46000], ["500 Gold", 90000]],
  "speed-drifters": [["60 Diamonds", 10000], ["150 Diamonds", 24000], ["350 Diamonds", 55000], ["700 Diamonds", 108000]],
  "ml-adventure": [["60 Diamonds", 12000], ["180 Diamonds", 34000], ["360 Diamonds", 65000], ["720 Diamonds", 128000]],
  "lokapala": [["100 Battle Points", 10000], ["250 Battle Points", 24000], ["500 Battle Points", 47000], ["1000 Battle Points", 92000]],
  "racing-master": [["60 Vouchers", 10000], ["150 Vouchers", 24000], ["350 Vouchers", 55000], ["700 Vouchers", 108000]],
  "forsaken-world-2": [["60 Gems", 13000], ["180 Gems", 37000], ["360 Gems", 72000], ["720 Gems", 140000]],
  "football-master-2": [["50 Gems", 10000], ["120 Gems", 23000], ["250 Gems", 46000], ["500 Gems", 90000]],
  "ants-underground": [["60 Diamonds", 12000], ["150 Diamonds", 28000], ["330 Diamonds", 60000], ["700 Diamonds", 125000]],
  "colorbang": [["50 Colours", 10000], ["120 Colours", 23000], ["250 Colours", 46000], ["500 Colours", 90000]],
  "destiny-m": [["60 Diamonds", 12000], ["180 Diamonds", 34000], ["360 Diamonds", 65000], ["720 Diamonds", 128000]],
  "moonlight-blade-m": [["60 Yuanbao", 12000], ["180 Yuanbao", 34000], ["360 Yuanbao", 65000], ["720 Yuanbao", 128000]],
  "ragnarok-m-eternal-love": [["30 BCC", 12000], ["60 BCC", 24000], ["120 BCC", 46000], ["300 BCC", 112000], ["500 BCC", 185000]],
  "mob-rush": [["50 Coins", 10000], ["120 Coins", 23000], ["250 Coins", 46000], ["500 Coins", 90000]],
  "omega-legends": [["60 Diamonds", 10000], ["150 Diamonds", 24000], ["350 Diamonds", 55000], ["700 Diamonds", 108000]],
  "eos-red": [["50 Gold", 10000], ["120 Gold", 23000], ["250 Gold", 46000], ["500 Gold", 90000]],
  "bleach-mobile-3d": [["60 Soul Gems", 12000], ["180 Soul Gems", 34000], ["360 Soul Gems", 65000], ["720 Soul Gems", 128000]],
  "shining-spirit": [["50 Crystals", 10000], ["120 Crystals", 23000], ["250 Crystals", 46000], ["500 Crystals", 90000]],
  "auto-chess": [["10 Candies", 8000], ["60 Candies", 42000], ["180 Candies", 120000], ["400 Candies", 260000]],
  "life-after-credits": [["50 Gold", 10000], ["120 Gold", 23000], ["250 Gold", 46000], ["500 Gold", 90000]],
  "pubgm-lite": [["60 UC", 16500], ["325 UC", 85000], ["660 UC", 168000], ["1800 UC", 445000]],
  "alchemy-stars": [["10 Lumocrystal", 6900], ["26 Lumocrystal", 16500], ["52 Lumocrystal", 32000], ["110 Lumocrystal", 65000], ["220 Lumocrystal", 128000]],
  "fc-mobile": [["40 FC Points", 6400], ["100 FC Points", 14500], ["520 FC Points", 71200], ["1070 FC Points", 140000], ["2200 FC Points", 285000]],
  "king-choice": [["50 Gems", 10000], ["120 Gems", 23000], ["250 Gems", 46000], ["500 Gems", 90000]],
  "blood-strike": [["60 Credits", 12000], ["150 Credits", 28000], ["330 Credits", 60000], ["700 Credits", 125000]],
  "project-sekai": [["60 Crystals", 15000], ["300 Crystals", 71000], ["980 Crystals", 225000], ["1980 Crystals", 445000]],
  "zepeto": [["50 ZEM", 10000], ["120 ZEM", 23000], ["250 ZEM", 46000], ["500 ZEM", 90000]],
  "super-mecha-champions": [["50 Gold", 10000], ["120 Gold", 23000], ["250 Gold", 46000], ["500 Gold", 90000]],
  "lord-mobile": [["67 Diamonds", 9700], ["134 Diamonds", 19500], ["335 Diamonds", 48500], ["670 Diamonds", 95000], ["1999 Diamonds", 285000]],
  "one-punch-man": [["6 Kupon", 8700], ["13 Kupon", 25000], ["22 Kupon", 42000], ["50 Kupon", 95000], ["100 Kupon", 185000]],
  "modern-combat-5": [["50 Credits", 10000], ["120 Credits", 23000], ["250 Credits", 46000], ["500 Credits", 90000]],
  "asphalt-9": [["40 Tokens", 8000], ["105 Tokens", 20000], ["220 Tokens", 40000], ["450 Tokens", 80000], ["900 Tokens", 155000]],
  "undawn": [["60 Diamonds", 13000], ["180 Diamonds", 37000], ["360 Diamonds", 72000], ["720 Diamonds", 140000]],
  "revelation-infinite": [["50 Jade", 10000], ["120 Jade", 23000], ["250 Jade", 46000], ["500 Jade", 90000]],
  "garena": [["50 Shells", 8000], ["100 Shells", 15000], ["200 Shells", 29000], ["500 Shells", 72000]],
  "webtoon": [["50 Coins", 12000], ["100 Coins", 24000], ["300 Coins", 70000], ["500 Coins", 115000]],
  "wesing": [["50 Coins", 10000], ["120 Coins", 23000], ["250 Coins", 46000], ["500 Coins", 90000]],
  "heroic-uncle-kim": [["50 Gems", 10000], ["120 Gems", 23000], ["250 Gems", 46000], ["500 Gems", 90000]],
  "path-to-nowhere": [["60 Hypercube", 14000], ["300 Hypercube", 68000], ["980 Hypercube", 215000], ["1980 Hypercube", 425000]],
  "starpass": [["50 Points", 10000], ["120 Points", 23000], ["250 Points", 46000], ["500 Points", 90000]],
  "jade-dynasty": [["50 Yuanbao", 10000], ["120 Yuanbao", 23000], ["250 Yuanbao", 46000], ["500 Yuanbao", 90000]],
  "sausage-man": [["50 Gems", 10000], ["120 Gems", 23000], ["250 Gems", 46000], ["500 Gems", 90000]],
  "bullet-angel": [["50 Diamonds", 10000], ["120 Diamonds", 23000], ["250 Diamonds", 46000], ["500 Diamonds", 90000]],
  "super-sus": [["50 Beans", 10000], ["120 Beans", 23000], ["250 Beans", 46000], ["500 Beans", 90000]],
  "lineage-2m": [["100 Diamonds", 15000], ["300 Diamonds", 42000], ["600 Diamonds", 80000], ["1500 Diamonds", 195000]],
  "ys-6-mobile": [["50 Diamonds", 10000], ["120 Diamonds", 23000], ["250 Diamonds", 46000], ["500 Diamonds", 90000]],
  "cloud-song": [["50 Crystals", 10000], ["120 Crystals", 23000], ["250 Crystals", 46000], ["500 Crystals", 90000]],
  "her": [["50 Gems", 10000], ["120 Gems", 23000], ["250 Gems", 46000], ["500 Gems", 90000]],
  "black-clover-m": [["60 Yul", 12000], ["180 Yul", 34000], ["360 Yul", 65000], ["720 Yul", 128000]],
  "lotr-rise-to-war": [["50 Gems", 10000], ["120 Gems", 23000], ["250 Gems", 46000], ["500 Gems", 90000]],
  "harry-potter-magic-awakened": [["60 Gems", 12000], ["180 Gems", 34000], ["360 Gems", 65000], ["720 Gems", 128000]],
  "hiya": [["50 Coins", 10000], ["120 Coins", 23000], ["250 Coins", 46000], ["500 Coins", 90000]],
  "onmyoji-arena": [["50 Jade", 10000], ["120 Jade", 23000], ["250 Jade", 46000], ["500 Jade", 90000]],
  "laplace-m": [["50 Diamonds", 10000], ["120 Diamonds", 23000], ["250 Diamonds", 46000], ["500 Diamonds", 90000]],
  "mu-origin-3": [["60 Zeny", 12000], ["180 Zeny", 34000], ["360 Zeny", 65000], ["720 Zeny", 128000]],
  "be-the-king": [["50 Gold", 10000], ["120 Gold", 23000], ["250 Gold", 46000], ["500 Gold", 90000]],
  "smash-legends": [["50 Gems", 10000], ["120 Gems", 23000], ["250 Gems", 46000], ["500 Gems", 90000]],
  "octopath-traveler": [["50 Rubies", 10000], ["120 Rubies", 23000], ["250 Rubies", 46000], ["500 Rubies", 90000]],
  "captain-tsubasa-dream-team": [["50 D-Balls", 10000], ["120 D-Balls", 23000], ["250 D-Balls", 46000], ["500 D-Balls", 90000]],
  "dragon-nest-m-classic": [["50 Diamonds", 10000], ["120 Diamonds", 23000], ["250 Diamonds", 46000], ["500 Diamonds", 90000]],
  "identity-v": [["50 Echoes", 10000], ["120 Echoes", 23000], ["250 Echoes", 46000], ["500 Echoes", 90000]],
  "heaven-burns-red": [["60 Quartz", 12000], ["180 Quartz", 34000], ["360 Quartz", 65000], ["720 Quartz", 128000]],
  "light-of-them": [["50 Gems", 10000], ["120 Gems", 23000], ["250 Gems", 46000], ["500 Gems", 90000]],
  "dragon-raja-sea": [["50 Diamonds", 10000], ["120 Diamonds", 23000], ["250 Diamonds", 46000], ["500 Diamonds", 90000]],
  "ace-racer": [["50 Tokens", 10000], ["120 Tokens", 23000], ["250 Tokens", 46000], ["500 Tokens", 90000]],
  "tarisland": [["60 Crystals", 12000], ["180 Crystals", 34000], ["360 Crystals", 65000], ["720 Crystals", 128000]],
  "astra-knight-of-veda": [["60 Diamonds", 12000], ["180 Diamonds", 34000], ["360 Diamonds", 65000], ["720 Diamonds", 128000]],
  "saint-seiya": [["50 Gems", 10000], ["120 Gems", 23000], ["250 Gems", 46000], ["500 Gems", 90000]],
  "seal-m-sea": [["50 Diamonds", 10000], ["120 Diamonds", 23000], ["250 Diamonds", 46000], ["500 Diamonds", 90000]],
  "metal-slug-awakening": [["50 Diamonds", 10000], ["120 Diamonds", 23000], ["250 Diamonds", 46000], ["500 Diamonds", 90000]],
  "hyper-front": [["50 Points", 10000], ["120 Points", 23000], ["250 Points", 46000], ["500 Points", 90000]],
  "love-and-deep-space": [["60 Diamonds", 15000], ["150 Diamonds", 35000], ["330 Diamonds", 75000], ["700 Diamonds", 155000]],
  "ragnarok-monster-world": [["50 Zeny", 10000], ["120 Zeny", 23000], ["250 Zeny", 46000], ["500 Zeny", 90000]],
  "ragnarok-origins": [["50 Zeny", 10000], ["120 Zeny", 23000], ["250 Zeny", 46000], ["500 Zeny", 90000]],
  "au2-mobile": [["50 Cash", 10000], ["120 Cash", 23000], ["250 Cash", 46000], ["500 Cash", 90000]],
  "nba-infinite": [["50 VC", 10000], ["120 VC", 23000], ["250 VC", 46000], ["500 VC", 90000]],
  "age-of-empires-mobile": [["50 Gems", 10000], ["120 Gems", 23000], ["250 Gems", 46000], ["500 Gems", 90000]],
  "ragnarok-idle-adventure": [["50 Zeny", 10000], ["120 Zeny", 23000], ["250 Zeny", 46000], ["500 Zeny", 90000]],
  "life-makeover": [["50 Gems", 10000], ["120 Gems", 23000], ["250 Gems", 46000], ["500 Gems", 90000]],
  "dragonheir-silent-god": [["50 Diamonds", 10000], ["120 Diamonds", 23000], ["250 Diamonds", 46000], ["500 Diamonds", 90000]],
  "ghost-story": [["50 Gems", 10000], ["120 Gems", 23000], ["250 Gems", 46000], ["500 Gems", 90000]],
  "ensemble-stars-music": [["50 Diamonds", 10000], ["120 Diamonds", 23000], ["250 Diamonds", 46000], ["500 Diamonds", 90000]],
  "girls-connect": [["50 Crystals", 10000], ["120 Crystals", 23000], ["250 Crystals", 46000], ["500 Crystals", 90000]],
  "t3-arena": [["50 Gems", 10000], ["120 Gems", 23000], ["250 Gems", 46000], ["500 Gems", 90000]],
  "chaos-crisis": [["50 Gold", 10000], ["120 Gold", 23000], ["250 Gold", 46000], ["500 Gold", 90000]],
  "mangatoon": [["50 Coins", 10000], ["120 Coins", 23000], ["250 Coins", 46000], ["500 Coins", 90000]],
  "tom-and-jerry-chase": [["50 Gems", 10000], ["120 Gems", 23000], ["250 Gems", 46000], ["500 Gems", 90000]],
  "star-maker": [["50 Coins", 10000], ["120 Coins", 23000], ["250 Coins", 46000], ["500 Coins", 90000]],
  "mirren-star-legends": [["50 Gems", 10000], ["120 Gems", 23000], ["250 Gems", 46000], ["500 Gems", 90000]],
  "pixel-gun-3d": [["20 Gems", 8000], ["50 Gems", 19000], ["100 Gems", 37000], ["250 Gems", 90000]],
  "pubg-new-state": [["60 NC", 12000], ["180 NC", 34000], ["360 NC", 65000], ["720 NC", 128000]],
  "madtale": [["50 Diamonds", 10000], ["120 Diamonds", 23000], ["250 Diamonds", 46000], ["500 Diamonds", 90000]],
  "soul-land-new-world": [["50 Diamonds", 10000], ["120 Diamonds", 23000], ["250 Diamonds", 46000], ["500 Diamonds", 90000]],
  "ride-out-heroes": [["50 Gold", 10000], ["120 Gold", 23000], ["250 Gold", 46000], ["500 Gold", 90000]],
  "legacy-of-discord": [["50 Diamonds", 10000], ["120 Diamonds", 23000], ["250 Diamonds", 46000], ["500 Diamonds", 90000]],
  "astral-guardians": [["50 Crystals", 10000], ["120 Crystals", 23000], ["250 Crystals", 46000], ["500 Crystals", 90000]],
  "crystal-of-atlan": [["50 Gems", 10000], ["120 Gems", 23000], ["250 Gems", 46000], ["500 Gems", 90000]],
  "trails-of-cold-steel": [["50 Mira", 10000], ["120 Mira", 23000], ["250 Mira", 46000], ["500 Mira", 90000]],
  "perfect-world-mobile-2": [["60 Yuanbao", 12000], ["180 Yuanbao", 34000], ["360 Yuanbao", 65000], ["720 Yuanbao", 128000]],
  "rules-of-survival": [["50 Gold", 10000], ["120 Gold", 23000], ["250 Gold", 46000], ["500 Gold", 90000]],
  "love-nikki": [["50 Diamonds", 10000], ["120 Diamonds", 23000], ["250 Diamonds", 46000], ["500 Diamonds", 90000]],
  "likes": [["50 Coins", 10000], ["120 Coins", 23000], ["250 Coins", 46000], ["500 Coins", 90000]],
  "isekai-feast": [["50 Gems", 10000], ["120 Gems", 23000], ["250 Gems", 46000], ["500 Gems", 90000]],
  "culinary-tour": [["50 Gems", 10000], ["120 Gems", 23000], ["250 Gems", 46000], ["500 Gems", 90000]],
  "eternal-city": [["50 Diamonds", 10000], ["120 Diamonds", 23000], ["250 Diamonds", 46000], ["500 Diamonds", 90000]],
  "heroes-evolved": [["50 Gold", 10000], ["120 Gold", 23000], ["250 Gold", 46000], ["500 Gold", 90000]],
  "state-of-survival": [["120 Biocaps", 15000], ["300 Biocaps", 36000], ["620 Biocaps", 72000], ["1280 Biocaps", 145000]],
  "project-of-entropy": [["50 Crystals", 10000], ["120 Crystals", 23000], ["250 Crystals", 46000], ["500 Crystals", 90000]],
  "world-war-heroes": [["50 Gold", 10000], ["120 Gold", 23000], ["250 Gold", 46000], ["500 Gold", 90000]],
  "scroll-of-onmyoji": [["50 Jade", 10000], ["120 Jade", 23000], ["250 Jade", 46000], ["500 Jade", 90000]],
  "dbd-mobile": [["60 Cells", 12000], ["180 Cells", 34000], ["360 Cells", 65000], ["720 Cells", 128000]],
  "sword-of-justice": [["50 Diamonds", 10000], ["120 Diamonds", 23000], ["250 Diamonds", 46000], ["500 Diamonds", 90000]],
  "paw-tales": [["50 Diamonds", 10000], ["120 Diamonds", 23000], ["250 Diamonds", 46000], ["500 Diamonds", 90000]],
  "black-desert-mobile": [["100 Black Pearls", 15000], ["500 Black Pearls", 70000], ["1000 Black Pearls", 135000], ["2000 Black Pearls", 265000]],
  "dark-continent-mist": [["50 Gems", 10000], ["120 Gems", 23000], ["250 Gems", 46000], ["500 Gems", 90000]],
  "whiteout-survival": [["500 Gems", 15000], ["1500 Gems", 42000], ["3000 Gems", 80000], ["6000 Gems", 155000]],
  "legend-of-neverland": [["50 Gems", 10000], ["120 Gems", 23000], ["250 Gems", 46000], ["500 Gems", 90000]],
  "azur-lane": [["60 Gems", 14000], ["180 Gems", 38000], ["330 Gems", 68000], ["680 Gems", 138000]],
  "king-of-kings": [["50 Gold", 10000], ["120 Gold", 23000], ["250 Gold", 46000], ["500 Gold", 90000]],
  "melojam": [["50 Coins", 10000], ["120 Coins", 23000], ["250 Coins", 46000], ["500 Coins", 90000]],
  "dragon-city": [["50 Gems", 10000], ["120 Gems", 23000], ["250 Gems", 46000], ["500 Gems", 90000]],
  "growtopia": [["1 World Lock", 15000], ["5 World Locks", 70000], ["10 World Locks", 135000], ["25 World Locks", 330000]],
  "ragnarok-m-classic": [["50 Zeny", 10000], ["120 Zeny", 23000], ["250 Zeny", 46000], ["500 Zeny", 90000]],
  "airplane-chef": [["50 Gold", 10000], ["120 Gold", 23000], ["250 Gold", 46000], ["500 Gold", 90000]],
  "war-robots": [["50 Au", 12000], ["100 Au", 23000], ["250 Au", 55000], ["500 Au", 108000]],
  "legends-of-runeterra": [["50 Coins", 12000], ["120 Coins", 28000], ["250 Coins", 55000], ["500 Coins", 108000]],
  "tft-mobile": [["50 Coins", 12000], ["120 Coins", 28000], ["250 Coins", 55000], ["500 Coins", 108000]],
  "league-of-legends": [["100 RP", 15000], ["250 RP", 35000], ["500 RP", 68000], ["1000 RP", 135000]],
  "marvel-snap": [["100 Gold", 17000], ["250 Gold", 42000], ["500 Gold", 82000], ["1000 Gold", 160000]],
  "sky-children-of-the-light": [["10 Candles", 12000], ["30 Candles", 34000], ["60 Candles", 66000], ["100 Candles", 108000]],
  "ragnarok-x": [["60 Zeny", 12000], ["180 Zeny", 34000], ["360 Zeny", 65000], ["720 Zeny", 128000]],
  "king-of-avalon": [["50 Gems", 10000], ["120 Gems", 23000], ["250 Gems", 46000], ["500 Gems", 90000]],
  "watcher-of-realms": [["50 Gems", 10000], ["120 Gems", 23000], ["250 Gems", 46000], ["500 Gems", 90000]],
  "guns-of-glory": [["50 Gems", 10000], ["120 Gems", 23000], ["250 Gems", 46000], ["500 Gems", 90000]],
  "draconia-saga": [["50 Diamonds", 10000], ["120 Diamonds", 23000], ["250 Diamonds", 46000], ["500 Diamonds", 90000]],
  "rise-of-kingdoms": [["320 Gems", 17000], ["800 Gems", 41000], ["1750 Gems", 88000], ["4000 Gems", 195000]],
};

/* format [[\"nama\", harga], ...] sesuai gaya data.js */
function packsLiteral(packs) {
  return "[" + packs.map((p) => '["' + p[0] + '", ' + p[1] + "]").join(", ") + "]";
}

const path = "js/data.js";
const src = fs.readFileSync(path, "utf8");
const lines = src.split("\n");
let replaced = 0;
let missing = [];

const out = lines.map((line) => {
  if (!line.includes("defaultPacks(")) return line;
  const m = line.match(/slug:\s*"([^"]+)"/);
  if (!m) return line;
  const slug = m[1];
  if (!PACKS[slug]) {
    missing.push(slug);
    return line;
  }
  replaced++;
  return line.replace(/packs:\s*defaultPacks\(\d+\)/, "packs: " + packsLiteral(PACKS[slug]));
});

fs.writeFileSync(path, out.join("\n"));
console.log("Diganti:", replaced, "game");
if (missing.length) console.log("TIDAK ADA di mapping (dibiarkan default):", missing.join(", "));
else console.log("Semua defaultPacks berhasil diganti.");
