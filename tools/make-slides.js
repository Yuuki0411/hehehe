#!/usr/bin/env node
/**
 * make-slides.js — Buat banner slide (1600x600) yang menampilkan logo asli digems.
 * Membaca data URI dari assets/digems.svg & assets/logo-noname.svg,
 * lalu menulis slide1.svg / slide2.svg / slide3.svg dengan gaya banner yang konsisten.
 *
 * Jalankan dari root proyek:  node tools/make-slides.js
 */
const fs = require("fs");

function dataUriOf(file) {
  const svg = fs.readFileSync(file, "utf8");
  const m = svg.match(/href="(data:image\/[^"]+)"/);
  if (!m) throw new Error("data URI tidak ditemukan di " + file);
  return m[1];
}

const digems = dataUriOf("assets/digems.svg");
const noname = dataUriOf("assets/logo-noname.svg");

// Bingkai "tile" logo: kotak hitam membulat dengan cincin tipis
function logoTile(href, x, y, size) {
  return (
    `<rect x="${x - 14}" y="${y - 14}" width="${size + 28}" height="${size + 28}" rx="36" fill="#0b0b0f" opacity="0.92"/>` +
    `<rect x="${x - 14}" y="${y - 14}" width="${size + 28}" height="${size + 28}" rx="36" fill="none" stroke="#ffffff" stroke-width="3" opacity="0.25"/>` +
    `<image x="${x}" y="${y}" width="${size}" height="${size}" href="${href}" preserveAspectRatio="xMidYMid slice"/>`
  );
}

const slides = [
  {
    file: "assets/slide1.svg",
    // Biru utama — ikon digems di kanan
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="600" viewBox="0 0 1600 600">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0d47a1"/>
      <stop offset="1" stop-color="#1e56c8"/>
    </linearGradient>
  </defs>
  <rect width="1600" height="600" fill="url(#g)"/>
  <circle cx="1350" cy="150" r="220" fill="#ffffff" opacity="0.08"/>
  <circle cx="200" cy="480" r="260" fill="#ffffff" opacity="0.06"/>
  <circle cx="150" cy="150" r="14" fill="#ffffff" opacity="0.35"/>
  <circle cx="190" cy="150" r="8" fill="#ffffff" opacity="0.25"/>
  <rect x="70" y="420" width="340" height="26" rx="13" fill="#ffffff" opacity="0.18"/>
  ${logoTile(digems, 1160, 110, 380)}
</svg>
`,
  },
  {
    file: "assets/slide2.svg",
    // Biru gelap — logo noname di kanan + kartu check
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="600" viewBox="0 0 1600 600">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#1565c0"/>
      <stop offset="1" stop-color="#0a2f66"/>
    </linearGradient>
  </defs>
  <rect width="1600" height="600" fill="url(#g)"/>
  <circle cx="300" cy="140" r="200" fill="#ffffff" opacity="0.07"/>
  <path d="M0 480 L400 300 L700 460 L1100 260 L1600 420 L1600 600 L0 600Z" fill="#ffffff" opacity="0.06"/>
  <rect x="80" y="430" width="420" height="26" rx="13" fill="#ffffff" opacity="0.18"/>
  ${logoTile(noname, 1160, 110, 380)}
</svg>
`,
  },
  {
    file: "assets/slide3.svg",
    // Merah-ungu promo — ikon digems di kanan + "%"
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="600" viewBox="0 0 1600 600">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#e53935"/>
      <stop offset="1" stop-color="#7b1fa2"/>
    </linearGradient>
  </defs>
  <rect width="1600" height="600" fill="url(#g)"/>
  <path d="M0 480 L400 300 L700 460 L1100 260 L1600 420 L1600 600 L0 600Z" fill="#ffffff" opacity="0.08"/>
  <circle cx="1350" cy="400" r="180" fill="#ffffff" opacity="0.1"/>
  <text x="300" y="330" font-size="130" text-anchor="middle" fill="#ffffff" opacity="0.9" font-family="Arial, sans-serif">%</text>
  <rect x="70" y="430" width="380" height="26" rx="13" fill="#ffffff" opacity="0.18"/>
  ${logoTile(digems, 1160, 110, 380)}
</svg>
`,
  },
];

for (const s of slides) {
  fs.writeFileSync(s.file, s.svg);
  console.log("OK:", s.file, "-", (fs.statSync(s.file).size / 1024).toFixed(1), "KB");
}
