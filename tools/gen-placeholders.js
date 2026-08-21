/* ============================================================
   GENERATOR PLACEHOLDER GAME
   ------------------------------------------------------------
   Membuat placeholder SVG (gradasi + inisial game) untuk setiap
   game di js/data.js yang belum punya file gambar.

   Jalankan:  node tools/gen-placeholders.js
   ============================================================ */
const fs = require("fs");
const path = require("path");

const src = fs.readFileSync(path.join(__dirname, "..", "js", "data.js"), "utf8");
eval(src + "; globalThis.__g = GAMES;");
const GAMES = globalThis.__g;

const outDir = path.join(__dirname, "..", "assets", "games");
fs.mkdirSync(outDir, { recursive: true });

/* Hash slug -> warna unik */
function hueFor(slug) {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) % 360;
  return h;
}
function hsl(h, s, l) {
  return "hsl(" + h + ", " + s + "%, " + l + "%)";
}
/* Inisial game (maks 2 huruf) */
function initials(name) {
  const words = name.replace(/[()]/g, "").split(/\s+/).filter(Boolean);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

let made = 0;
for (const g of GAMES) {
  const file = path.join(outDir, path.basename(g.image));
  if (fs.existsSync(file)) continue;

  const h = hueFor(g.slug);
  const c1 = hsl(h, 55, 42);
  const c2 = hsl((h + 40) % 360, 60, 22);
  const ini = initials(g.name);

  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" width="720" height="480" viewBox="0 0 720 480">\n' +
    '  <defs>\n' +
    '    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">\n' +
    '      <stop offset="0%" stop-color="' + c1 + '"/>\n' +
    '      <stop offset="100%" stop-color="' + c2 + '"/>\n' +
    "    </linearGradient>\n" +
    "  </defs>\n" +
    '  <rect width="720" height="480" fill="url(#bg)"/>\n' +
    '  <circle cx="620" cy="60" r="150" fill="rgba(255,255,255,0.08)"/>\n' +
    '  <circle cx="80" cy="430" r="120" fill="rgba(255,255,255,0.06)"/>\n' +
    '  <text x="360" y="265" font-size="150" font-weight="bold" text-anchor="middle" fill="rgba(255,255,255,0.92)" font-family="Arial, sans-serif">' +
    ini +
    "</text>\n" +
    '  <text x="360" y="330" font-size="26" text-anchor="middle" fill="rgba(255,255,255,0.55)" font-family="Arial, sans-serif">' +
    g.name +
    "</text>\n" +
    "</svg>\n";

  fs.writeFileSync(file, svg);
  made++;
}
console.log("Placeholder dibuat: " + made + " file (total game: " + GAMES.length + ")");
