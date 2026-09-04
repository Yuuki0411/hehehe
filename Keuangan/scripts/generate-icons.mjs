/**
 * Membuat seluruh ukuran ikon PWA dari public/icons/master.png.
 * Jalankan: npm run icons  (butuh devDependency `sharp`)
 */
import sharp from 'sharp'
import { mkdirSync } from 'node:fs'

const MASTER = 'public/icons/master.png'
const OUT = 'public/icons'
const BRAND_BG = { r: 5, g: 150, b: 105, alpha: 1 } // #059669

/** Konten maskable harus tetap aman di zona tengah ~80%. */
const TARGETS = [
  { file: 'icon-192.png', size: 192, inset: 0.82 },
  { file: 'icon-512.png', size: 512, inset: 0.82 },
  { file: 'maskable-512.png', size: 512, inset: 0.66 },
  { file: 'apple-touch-icon.png', size: 180, inset: 0.78 }
]

mkdirSync(OUT, { recursive: true })

for (const target of TARGETS) {
  const inner = Math.round(target.size * target.inset)
  const resized = await sharp(MASTER)
    .resize(inner, inner, { fit: 'cover', position: 'centre' })
    .toBuffer()

  await sharp({
    create: {
      width: target.size,
      height: target.size,
      channels: 4,
      background: BRAND_BG
    }
  })
    .composite([{ input: resized, gravity: 'center' }])
    .png()
    .toFile(`${OUT}/${target.file}`)

  console.log(`✔ ${target.file} (${target.size}px)`)
}
