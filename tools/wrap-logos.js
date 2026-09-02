/*
  wrap-logos.js — bungkus logo transparan menjadi gambar kartu full-bleed 3:2.
  Logo asli disarikan sebagai <svg> bersarang di tengah kanvas 1500x1000
  dengan latar gradien gelap, sehingga tidak "mengambang" / terpotong
  oleh object-fit: cover di .card-img.

  Pemakaian:  node tools/wrap-logos.js            (semua target)
              ONLY=aov,valorant node tools/wrap-logos.js
*/
const fs = require("fs");
const path = require("path");

const GAMES_DIR = path.join(__dirname, "..", "assets", "games");

/* Logo berlatar transparan yang perlu dibungkus */
const TARGETS = [
  "clash-royale",
  "codm",
  "valorant",
  "zenless-zone-zero",
  "pokemon-unite",
  "aov",
  "delta-force",
  "honkai-impact-3rd",
  "lord-mobile",
  "azur-lane",
];

const CANVAS_W = 1500;
const CANVAS_H = 1000; // rasio 3:2, sama dengan .card-img
const LOGO_SCALE = 0.82; // ruang aman untuk cropping di thumbnail kecil (modal/history)

const BG_TOP = "#241419";
const BG_BOTTOM = "#0b0708";

function parseRootTag(svg) {
  const open = svg.match(/<svg\b([^>]*)>/);
  if (!open) throw new Error("root <svg> tidak ditemukan");
  const start = open.index + open[0].length;
  const end = svg.lastIndexOf("</svg>");
  if (end < 0) throw new Error("</svg> tidak ditemukan");
  const inner = svg.slice(start, end).trim();
  const attrs = {};
  for (const m of open[1].matchAll(/([a-zA-Z:_.-]+)\s*=\s*"([^"]*)"/g)) {
    attrs[m[1]] = m[2];
  }
  return { attrs, inner };
}

function parseViewBox(vb) {
  const parts = vb.trim().split(/[\s,]+/).map(Number);
  if (parts.length !== 4 || parts.some((n) => !isFinite(n)) || parts[2] <= 0 || parts[3] <= 0) {
    throw new Error("viewBox tidak valid: " + vb);
  }
  return { w: parts[2], h: parts[3] };
}

function wrap(slug) {
  const file = path.join(GAMES_DIR, slug + ".svg");
  const src = fs.readFileSync(file, "utf8");
  const { attrs, inner } = parseRootTag(src);

  if (!attrs.viewBox) throw new Error("viewBox hilang");
  const { w: vw, h: vh } = parseViewBox(attrs.viewBox);
  const asp = vw / vh;

  let w = CANVAS_W * LOGO_SCALE;
  let h = w / asp;
  if (h > CANVAS_H * LOGO_SCALE) {
    h = CANVAS_H * LOGO_SCALE;
    w = h * asp;
  }
  const x = (CANVAS_W - w) / 2;
  const y = (CANVAS_H - h) / 2;

  const gid = "wrapbg-" + slug;
  const needle = `id="${gid}"`;
  if (inner.includes(needle)) throw new Error("id gradien bentrok dengan konten asli");

  const carry = Object.entries(attrs)
    .filter(([k]) => !["width", "height", "viewBox", "preserveAspectRatio", "xmlns", "xmlns:xlink"].includes(k))
    .map(([k, v]) => ` ${k}="${v}"`)
    .join("");

  const out =
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${CANVAS_W}" height="${CANVAS_H}" viewBox="0 0 ${CANVAS_W} ${CANVAS_H}">\n` +
    `  <defs>\n` +
    `    <linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1">\n` +
    `      <stop offset="0" stop-color="${BG_TOP}"/>\n` +
    `      <stop offset="1" stop-color="${BG_BOTTOM}"/>\n` +
    `    </linearGradient>\n` +
    `  </defs>\n` +
    `  <rect width="${CANVAS_W}" height="${CANVAS_H}" fill="url(#${gid})"/>\n` +
    `  <svg x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" viewBox="${attrs.viewBox}"${carry}>\n` +
    `    ${inner}\n` +
    `  </svg>\n` +
    `</svg>\n`;

  fs.writeFileSync(file, out);
  return `  ${slug}: viewBox ${vw}x${vh} (asp ${asp.toFixed(2)}) -> logo ${w.toFixed(0)}x${h.toFixed(0)} pada kanvas ${CANVAS_W}x${CANVAS_H}`;
}

const only = process.env.ONLY ? process.env.ONLY.split(",").map((s) => s.trim()) : null;
const list = only ? only : TARGETS;
console.log("Membungkus " + list.length + " logo:");
for (const slug of list) {
  if (!TARGETS.includes(slug)) {
    console.log("  LEWATI " + slug + " (bukan target, latar tidak transparan)");
    continue;
  }
  try {
    console.log(wrap(slug));
  } catch (e) {
    console.log("  GAGAL " + slug + ": " + e.message);
    process.exitCode = 1;
  }
}
