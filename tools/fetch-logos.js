#!/usr/bin/env node
/* fetch-logos.js — Unduh logo SVG game dari sumber publik:
   1. worldvectorlogo CDN (slug tebakan)
   2. Wikimedia Commons API (cari file .svg ber-"logo")
   3. Wikipedia pageimage (PNG/JPG) -> dibungkus jadi file .svg (embed base64)
   File di-overwrite ke assets/games/<slug>.svg bila ketemu; sisanya
   mempertahankan placeholder lama. Jalankan: node tools/fetch-logos.js        */

const fs = require("fs");
const path = require("path");

const UA = { "User-Agent": "TopupDigems-site-builder/1.0 (contact: admin@digems.id)" };

const TARGETS = {
  "ml":                      { wvl: ["mobile-legends", "mobile-legends-bang-bang", "mlbb"], wiki: ["Mobile Legends: Bang Bang"] },
  "hok":                     { wvl: ["honor-of-kings"], wiki: ["Honor of Kings"] },
  "aov":                     { wvl: ["arena-of-valor"], wiki: ["Arena of Valor"] },
  "wild-rift":               { wvl: ["league-of-legends-wild-rift", "wild-rift", "lol-wild-rift"], wiki: ["League of Legends: Wild Rift"] },
  "pokemon-unite":           { wvl: ["pokemon-unite"], wiki: ["Pokémon Unite", "Pokemon Unite"] },
  "tft-mobile":              { wvl: ["teamfight-tactics"], wiki: ["Teamfight Tactics"] },
  "clash-royale":            { wvl: ["clash-royale"], wiki: ["Clash Royale"] },
  "league-of-legends":       { wvl: [], wiki: ["League of Legends"], itunes: ["League of Legends"] },
  "valorant":                { wvl: ["valorant"], wiki: ["Valorant"] },
  "ff":                      { wvl: ["free-fire", "freefire", "garena-free-fire"], wiki: ["Garena Free Fire", "Free Fire (video game)"], itunes: ["Free Fire"] },
  "ff-max":                  { wvl: ["free-fire-max"], wiki: [], itunes: ["Free Fire MAX"] },
  "pubg":                    { wvl: ["pubg-mobile", "pubg"], wiki: ["PUBG Mobile", "PUBG: Battlegrounds"], itunes: ["PUBG MOBILE"] },
  "codm":                    { wvl: ["call-of-duty-mobile", "codm"], wiki: ["Call of Duty: Mobile"] },
  "arena-breakout":          { wvl: ["arena-breakout"], wiki: ["Arena Breakout"], itunes: ["Arena Breakout"] },
  "blood-strike":            { wvl: ["blood-strike"], wiki: ["Blood Strike"], itunes: ["Blood Strike"] },
  "farlight-84":             { wvl: ["farlight-84"], wiki: ["Farlight 84"], itunes: ["Farlight 84"] },
  "delta-force":             { wvl: ["delta-force"], wiki: ["Delta Force (2023 video game)", "Delta Force (video game)"] },
  "marvel-rivals":           { wvl: ["marvel-rivals"], wiki: ["Marvel Rivals"] },
  "once-human":              { wvl: ["once-human"], wiki: ["Once Human (video game)"], itunes: ["Once Human"] },
  "genshin":                 { wvl: ["genshin-impact"], wiki: ["Genshin Impact"] },
  "honkai-impact-3rd":       { wvl: ["honkai-impact-3rd"], wiki: ["Honkai Impact 3rd"] },
  "zenless-zone-zero":       { wvl: ["zenless-zone-zero"], wiki: ["Zenless Zone Zero"] },
  "wuthering-waves":         { wvl: ["wuthering-waves"], wiki: ["Wuthering Waves"] },
  "punishing-gray-raven":    { wvl: ["punishing-gray-raven", "punishing-grey-raven"], wiki: ["Punishing: Gray Raven"], itunes: ["Punishing Gray Raven", "Punishing: Gray Raven"] },
  "tower-of-fantasy":        { wvl: ["tower-of-fantasy"], wiki: ["Tower of Fantasy"], itunes: ["Tower of Fantasy"] },
  "tarisland":               { wvl: ["tarisland"], wiki: ["Tarisland"], itunes: ["Tarisland"] },
  "black-desert-mobile":     { wvl: ["black-desert-mobile"], wiki: ["Black Desert Mobile"], itunes: ["Black Desert Mobile"] },
  "ragnarok-origins":        { wvl: ["ragnarok-origin"], wiki: ["Ragnarok Origin"], itunes: ["Ragnarok Origin"] },
  "ragnarok-x":              { wvl: ["ragnarok-x-next-generation", "ragnarok-x"], wiki: ["Ragnarok X: Next Generation"], itunes: ["Ragnarok X: Next Generation", "Ragnarok X"] },
  "ragnarok-m-eternal-love": { wvl: ["ragnarok-m-eternal-love", "ragnarok-m"], wiki: ["Ragnarok M: Eternal Love"], itunes: ["Ragnarok M Eternal Love"] },
  "nikke":                   { wvl: ["nikke", "goddess-of-victory-nikke"], wiki: ["Goddess of Victory: Nikke", "Nikke (video game)"], itunes: ["Goddess of Victory Nikke", "NIKKE"] },
  "azur-lane":               { wvl: ["azur-lane"], wiki: ["Azur Lane"] },
  "love-and-deep-space":     { wvl: ["love-and-deepspace", "love-and-deep-space"], wiki: ["Love and Deepspace"], itunes: ["Love and Deepspace"] },
  "snowbreak":               { wvl: ["snowbreak-containment-zone", "snowbreak"], wiki: ["Snowbreak: Containment Zone"], itunes: ["Snowbreak Containment Zone", "Snowbreak"] },
  "path-to-nowhere":         { wvl: ["path-to-nowhere"], wiki: ["Path to Nowhere"], itunes: ["Path to Nowhere"] },
  "aether-gazer":            { wvl: ["aether-gazer"], wiki: ["Aether Gazer"], itunes: ["Aether Gazer"] },
  "afk-journey":             { wvl: ["afk-journey"], wiki: ["AFK Journey"], itunes: ["AFK Journey"] },
  "stumble-guys":            { wvl: ["stumble-guys"], wiki: ["Stumble Guys"], itunes: ["Stumble Guys"] },
  "sausage-man":             { wvl: ["sausage-man"], wiki: ["Sausage Man"], itunes: ["Sausage Man"] },
  "identity-v":              { wvl: ["identity-v"], wiki: ["Identity V"], itunes: ["Identity V"] },
  "sky-children-of-the-light": { wvl: ["sky-children-of-the-light"], wiki: ["Sky: Children of the Light"], itunes: ["Sky Children of the Light"] },
  "asphalt-9":               { wvl: ["asphalt-9-legends", "asphalt-9"], wiki: ["Asphalt 9: Legends"], itunes: ["Asphalt 9 Legends"] },
  "fc-mobile":               { wvl: ["ea-sports-fc-mobile", "fc-mobile", "fifa-mobile"], wiki: ["EA Sports FC Mobile"], itunes: ["EA SPORTS FC Mobile"] },
  "marvel-snap":             { wvl: ["marvel-snap"], wiki: ["Marvel Snap"], itunes: ["Marvel Snap"] },
  "metal-slug-awakening":    { wvl: ["metal-slug-awakening"], wiki: ["Metal Slug Awakening"], itunes: ["Metal Slug Awakening"] },
  "rise-of-kingdoms":        { wvl: ["rise-of-kingdoms"], wiki: ["Rise of Kingdoms"], itunes: ["Rise of Kingdoms"] },
  "state-of-survival":       { wvl: ["state-of-survival"], wiki: ["State of Survival"], itunes: ["State of Survival"] },
  "whiteout-survival":       { wvl: ["whiteout-survival"], wiki: ["Whiteout Survival"], itunes: ["Whiteout Survival"] },
  "lord-mobile":             { wvl: ["lords-mobile"], wiki: ["Lords Mobile"] },
  "age-of-empires-mobile":   { wvl: ["age-of-empires-mobile"], wiki: [], itunes: ["Age of Empires Mobile"] },
};

const outDir = path.join(__dirname, "..", "assets", "games");

async function get(url) {
  const res = await fetch(url, { headers: { ...UA }, signal: AbortSignal.timeout(20000), redirect: "follow" });
  const buf = Buffer.from(await res.arrayBuffer());
  return { status: res.status, buf, finalUrl: res.url };
}

function isSvg(buf) {
  const head = buf.toString("utf8", 0, Math.min(buf.length, 512)).trim();
  return /^<\?xml|^<svg|^\s*<[\s\S]*<svg/i.test(head) && buf.toString("utf8").includes("<svg");
}

function pngSize(buf) {
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}
function jpegSize(b) {
  let i = 2;
  while (i + 8 < b.length) {
    if (b[i] !== 0xff) { i++; continue; }
    const m = b[i + 1];
    if (m === 0xd8 || m === 0x01 || (m >= 0xd0 && m <= 0xd7)) { i += 2; continue; }
    const len = b.readUInt16BE(i + 2);
    if ((m >= 0xc0 && m <= 0xc3) || (m >= 0xc5 && m <= 0xc7) || (m >= 0xc9 && m <= 0xcb) || (m >= 0xcd && m <= 0xcf))
      return { width: b.readUInt16BE(i + 7), height: b.readUInt16BE(i + 5) };
    i += 2 + len;
  }
  throw new Error("jpeg size not found");
}
function rasterToSvg(buf) {
  const isPng = buf[0] === 0x89 && buf[1] === 0x50;
  const mime = isPng ? "image/png" : "image/jpeg";
  const { width, height } = isPng ? pngSize(buf) : jpegSize(buf);
  if (!width || width > 4000) throw new Error("dim aneh");
  const b64 = buf.toString("base64");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><image width="${width}" height="${height}" href="data:${mime};base64,${b64}"/></svg>`;
}

/* ---------- sumber 1: worldvectorlogo CDN ---------- */
async function tryWvl(slugs) {
  for (const s of slugs) {
    try {
      const r = await get(`https://cdn.worldvectorlogo.com/logos/${s}.svg`);
      if (r.status === 200 && r.buf.length < 5_000_000 && isSvg(r.buf)) return { kind: "vector", url: r.finalUrl, svg: r.buf };
    } catch {}
  }
  return null;
}

/* ---------- sumber 1b: worldvectorlogo search-page scrape ---------- */
async function tryWvlScrape(term) {
  try {
    const r = await get(`https://worldvectorlogo.com/search/${encodeURIComponent(term.toLowerCase())}`);
    if (r.status !== 200) return null;
    const html = r.buf.toString("utf8");
    const slugs = [...new Set([...html.matchAll(/\/logo\/([a-z0-9\-_]+)/gi)].map((m) => m[1]))].slice(0, 8);
    return await tryWvl(slugs);
  } catch {
    return null;
  }
}

/* ---------- sumber 2: file gambar di halaman artikel Wikipedia ---------- */
/* Mengambil FILE ASLI (mis. .svg non-bebas yang di-host en.wikipedia), bukan thumbnail. */
const BAD_FILE = /commons-logo|wikimedia|wiki(pedia)?_?letter|padlock|question_book|ambox|red_pencil|folder_icon|text_document|disambig|edit(-|_)?(clear|lock)|crystal_(clear|qwerty)|symbol_(wait|question)/i;

/* file di artikel Wikipedia pertama dipercaya penuh; artikel kedua (fallback)
   WAJIB memuat kata kunci nama game agar tidak tertukar game lain */
async function tryWikiFiles(articleTitle, requireKw = null) {
  const kwWords = (requireKw || "").toLowerCase().split(/\s+/).filter((w) => w.length >= 4);
  try {
    const api = `https://en.wikipedia.org/w/api.php?action=query&prop=images&imlimit=60&format=json&formatversion=2&redirects=1&titles=${encodeURIComponent(articleTitle)}`;
    const r = await get(api);
    if (r.status !== 200) return null;
    const page = JSON.parse(r.buf).query?.pages?.[0];
    /* ketat: nama file HARUS menyebut logo/icon/wordmark — menolak screenshot/cover/poster/gameplay */
    const candidates = (page?.images || []).map((i) => i.title).filter(
      (t) => BAD_FILE.test(t) === false &&
        /\.(svg|png|jpe?g)$/i.test(t) &&
        /(logo|wordmark|\bicon\b)/i.test(t) &&
        !(kwWords.length && !kwWords.some((w) => t.toLowerCase().includes(w))) &&
        !/(screenshot|gameplay|cover|poster|key\s*art|box\s*art|banner)/i.test(t)
    );
    if (!candidates.length) return null;
    const infos = [];
    for (let i = 0; i < Math.min(candidates.length, 30); i += 25) {
      const chunk = candidates.slice(i, i + 25);
      const ir = await get(`https://en.wikipedia.org/w/api.php?action=query&prop=imageinfo&iiprop=url|size&format=json&formatversion=2&titles=${encodeURIComponent(chunk.join("|"))}`);
      if (ir.status !== 200) continue;
      for (const p of JSON.parse(ir.buf).query?.pages || []) {
        const ii = p.imageinfo?.[0];
        if (ii?.url) infos.push({ title: p.title, url: ii.url });
      }
    }
    const extRank = (u) => (/\.svg$/i.test(u) ? 2 : /\.(png)$/i.test(u) ? 1 : 0);
    const kw = articleTitle.toLowerCase().split(/[:\(]/)[0].trim();
    infos.sort((a, b) => {
      const s = (o) => (/(logo|wordmark|title|icon)/i.test(o.title) ? 4 : /\u00ae|\bt[\u00e9l]le\b|emblem|coverart|guidebook/i.test(o.title) ? 0 : 1) + extRank(o.url);
      return s(b) - s(a);
    }).sort((a, b) => (b.title.toLowerCase().includes(kw) ? 1 : 0) - (a.title.toLowerCase().includes(kw) ? 1 : 0));
    for (const f of infos.slice(0, 6)) {
      try {
        const dl = await get(f.url);
        if (dl.status !== 200 || dl.buf.length < 500) continue;
        if (extRank(f.url) === 2) {
          if (dl.buf.length < 3_000_000 && isSvg(dl.buf)) return { kind: "vector", url: f.url, svg: dl.buf };
        } else if ((dl.buf[0] === 0x89 && dl.buf[1] === 0x50) || (dl.buf[0] === 0xff && dl.buf[1] === 0xd8)) {
          if (dl.buf.length < 4_000_000) return { kind: "embed", url: f.url, svg: Buffer.from(rasterToSvg(dl.buf)) };
        }
      } catch {}
    }
  } catch {}
  return null;
}

/* ---------- sumber 3: Wikimedia Commons pencarian file svg ---------- */
async function tryCommons(terms) {
  for (const term of terms) {
    try {
      const q = `${term} logo filetype:drawing`;
      const api = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srnamespace=6&srlimit=10&format=json&formatversion=2&srsearch=${encodeURIComponent(q)}`;
      const r = await get(api);
      if (r.status !== 200) continue;
      const hits = JSON.parse(r.buf).query?.search || [];
      const firstWord = term.toLowerCase().split(/[:\(]/)[0].trim();
      const scored = hits.filter((h) =>
        /\.svg$/i.test(h.title) &&
        h.title.toLowerCase().includes(firstWord.split(/\s+/)[0]) &&
        /logo|icon|symbol|wordmark/i.test(h.title)
      ).map((h) => {
        const t = h.title.toLowerCase();
        let score = h.wordcount;
        if (/logo|icon|wordmark|symbol/.test(t)) score += 100000;
        if (t.includes(firstWord)) score += 50000;
        if (/hub|page|template|banner|screenshot/.test(t)) score -= 80000;
        return { ...h, score };
      }).sort((a, b) => b.score - a.score);
      for (const hit of scored) {
        try {
          const info = await get(`https://commons.wikimedia.org/w/api.php?action=query&prop=imageinfo&iiprop=url|size&format=json&formatversion=2&titles=${encodeURIComponent(hit.title)}`);
          const page = JSON.parse(info.buf).query?.pages?.[0];
          const url = page?.imageinfo?.[0]?.url;
          if (!url || !/\.svg$/i.test(url)) continue;
          const dl = await get(url);
          if (dl.status === 200 && dl.buf.length < 3_000_000 && isSvg(dl.buf)) return { kind: "vector", url, svg: dl.buf };
        } catch {}
      }
    } catch {}
  }
  return null;
}

/* ---------- sumber 4: ikon aplikasi resmi via iTunes Search API ---------- */
async function tryItunes(terms) {
  for (const term of terms) {
    for (const country of ["us", "id"]) {
      try {
        const api = `https://itunes.apple.com/search?media=software&entity=software&limit=8&country=${country}&term=${encodeURIComponent(term)}`;
        const r = await get(api);
        if (r.status !== 200) continue;
        const results = JSON.parse(r.buf).results || [];
        const kw = term.toLowerCase().split(/\s+/).filter((w) => w.length >= 3);
        if (!kw.length) continue;
        const pick = results.find((x) => typeof x.trackName === "string" && kw.every((w) => x.trackName.toLowerCase().includes(w)));
        let art = pick && (pick.artworkUrl512 || pick.artworkUrl100 || "").replace("100x100", "512x512");
        if (!art) continue;
        const dl = await get(art);
        if ((dl.buf[0] === 0x89 && dl.buf[1] === 0x50) || (dl.buf[0] === 0xff && dl.buf[1] === 0xd8)) {
          if (dl.buf.length < 4_000_000) return { kind: "icon", url: art, svg: Buffer.from(rasterToSvg(dl.buf)) };
        }
      } catch {}
    }
  }
  return null;
}

/* ---------- sumber 5: en.wikipedia lead image (raster->svg wrapper) ---------- */
async function tryWikiThumb(article) {
  for (const title of article) {
    try {
      const api = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=pageimages&pithumbsize=600&format=json&formatversion=2`;
      const r = await get(api);
      if (r.status !== 200) continue;
      const thumb = JSON.parse(r.buf).query?.pages?.[0]?.thumbnail?.source;
      if (!thumb) continue;
      /* jika thumbnail adalah render dari file .svg, ambil file aslinya (vektor asli).
         Struktur: .../wikipedia/<repo>/thumb/<h>/<hh>/<Nama.svg>/<N>px-<Nama>.<ext> */
      const t2 = thumb.split("?")[0];
      const ti = t2.indexOf("/thumb/");
      if (ti !== -1) {
        const segs = t2.slice(ti + 7).split("/");
        if (segs.length >= 4 && /\.svg$/i.test(segs[2])) {
          const base = t2.slice(0, ti);
          const orig = `${base}/${segs[0]}/${segs[1]}/${segs[2]}`;
          try {
            const dl2 = await get(orig);
            if (dl2.status === 200 && dl2.buf.length < 3_000_000 && isSvg(dl2.buf)) return { kind: "vector", url: orig, svg: dl2.buf };
          } catch {}
        }
      }
      const dl = await get(thumb);
      if (dl.status !== 200) continue;
      /* tolak thumbnail raster yang jelas bukan logo (mis. "..._Gameplay.jpg") */
      const lastSeg = decodeURIComponent(t2.split("/").pop());
      if (!/\.(svg|png)$/i.test(t2) && !/(logo|icon|wordmark|title|symbol)/i.test(lastSeg)) continue;
      const isPng = dl.buf[0] === 0x89 && dl.buf[1] === 0x50;
      const isJpg = dl.buf[0] === 0xff && dl.buf[1] === 0xd8;
      if ((!isPng && !isJpg) || dl.buf.length > 4_000_000) continue;
      return { kind: "embed", url: thumb, svg: Buffer.from(rasterToSvg(dl.buf)) };
    } catch {}
  }
  return null;
}

(async () => {
  const ONLY = (process.env.ONLY || "").split(",").map((s) => s.trim()).filter(Boolean);
  fs.mkdirSync(outDir, { recursive: true });
  const summary = [];
  for (const [slug, t] of Object.entries(TARGETS)) {
    if (ONLY.length && !ONLY.includes(slug)) continue;
    const file = path.join(outDir, slug + ".svg");
    if (t.aliasOf) continue; // diputuskan setelah pass utama
    let res = null;
    const base = (t.wiki?.[0] || t.itunes?.[0] || "").replace(/\s*\(.*$/, "").trim();
    if (t.wvl?.length) res = await tryWvl(t.wvl);
    if (!res && base) res = await tryWvlScrape(base);
    if (!res && t.wiki?.length) {
      for (let a = 0; a < t.wiki.slice(0, 2).length; a++) {
        const art = t.wiki[a];
        res = await tryWikiFiles(art, a === 0 ? null : base);
        if (res) break;
      }
    }
    if (!res && t.wiki?.length) res = await tryCommons(t.wiki);
    if (!res && t.wiki?.length) res = await tryWikiThumb(t.wiki);
    if (!res) res = await tryItunes(t.itunes || [base]);
    if (res) {
      fs.writeFileSync(file, res.svg);
      console.log(`[${slug}] ${res.kind.toUpperCase()} <- ${res.url} (${(res.svg.length / 1024).toFixed(1)} KB)`);
      summary.push([slug, res.kind]);
    } else {
      console.log(`[${slug}] TIDAK KETEMU -> placeholder dipertahankan`);
      summary.push([slug, "none"]);
    }
    await new Promise((r) => setTimeout(r, 350)); // sopan ke API Wikimedia
  }

  /* alias: pakai logo induk kalau ada & sendiri gagal (mis. Free Fire MAX) */
  for (const [slug, t] of Object.entries(TARGETS)) {
    if (!t.aliasOf) continue;
    const srcFile = path.join(outDir, t.aliasOf + ".svg");
    const srcKind = (summary.find(([s]) => s === t.aliasOf) || [])[1];
    if (srcKind && srcKind !== "none" && fs.existsSync(srcFile)) {
      fs.copyFileSync(path.join(outDir, t.aliasOf + ".svg"), path.join(outDir, slug + ".svg"));
      console.log(`[${slug}] COPY dari ${t.aliasOf}`);
      summary.push([slug, "copy"]);
    } else {
      console.log(`[${slug}] alias gagal`);
      summary.push([slug, "none"]);
    }
  }

  const ok = summary.filter(([, k]) => k !== "none").length;
  console.log(`\nRingkasan: ${ok}/${summary.length} game dapat logo non-placeholder.`);
  console.log(summary.map(([s, k]) => `${s}:${k}`).join(" "));
})();
