#!/usr/bin/env node
/**
 * png2svg.js — Ubah PNG/JPG/JPEG menjadi SVG (embed base64, tanpa dependensi).
 *
 * Cara pakai:
 *   node tools/png2svg.js path/ke/gambar.png [path/keluaran.svg]
 *
 * Contoh:
 *   node tools/png2svg.js assets/favicon.png assets/favicon.svg
 *   node tools/png2svg.js gambar.jpg            # otomatis jadi gambar.svg
 */
const fs = require("fs");
const path = require("path");

const input = process.argv[2];
if (!input) {
  console.error("Usage: node png2svg.js input.png [output.svg]");
  process.exit(1);
}
if (!fs.existsSync(input)) {
  console.error("File tidak ditemukan:", input);
  process.exit(1);
}

const buf = fs.readFileSync(input);
const ext = path.extname(input).toLowerCase();
let width, height, mime;

if (buf[0] === 0x89 && buf[1] === 0x50) {
  // PNG: lebar/tinggi ada di header IHDR (byte 16-23)
  mime = "image/png";
  width = buf.readUInt32BE(16);
  height = buf.readUInt32BE(20);
} else if (buf[0] === 0xff && buf[1] === 0xd8) {
  // JPEG: cari marker SOF untuk dapat ukuran
  mime = "image/jpeg";
  ({ width, height } = jpegSize(buf));
} else {
  console.error("Format tidak didukung. Pakai file PNG/JPG/JPEG.");
  process.exit(1);
}

function jpegSize(b) {
  let i = 2;
  while (i + 8 < b.length) {
    if (b[i] !== 0xff) { i++; continue; }
    const marker = b[i + 1];
    // Marker tanpa segmen panjang: SOI, RST, EOI, TEM
    if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) { i += 2; continue; }
    const len = b.readUInt16BE(i + 2);
    // SOFn (start of frame): C0-C3, C5-C7, C9-CB, CD-CF
    const isSOF =
      (marker >= 0xc0 && marker <= 0xc3) ||
      (marker >= 0xc5 && marker <= 0xc7) ||
      (marker >= 0xc9 && marker <= 0xcb) ||
      (marker >= 0xcd && marker <= 0xcf);
    if (isSOF) {
      return {
        height: b.readUInt16BE(i + 5),
        width: b.readUInt16BE(i + 7),
      };
    }
    i += 2 + len;
  }
  throw new Error("JPEG tidak valid / ukuran tidak ditemukan");
}

const output = process.argv[3] || input.replace(/\.[^.]+$/, ".svg");
const b64 = buf.toString("base64");

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <image width="${width}" height="${height}" href="data:${mime};base64,${b64}"/>
</svg>
`;

fs.writeFileSync(output, svg);
console.log(`OK: ${input} -> ${output} (${width}x${height}, ${(fs.statSync(output).size / 1024).toFixed(1)} KB)`);
