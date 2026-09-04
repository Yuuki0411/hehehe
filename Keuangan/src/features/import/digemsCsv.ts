import type { DayKey } from '../../utils/format'

/** Satu baris pemasukan hasil parse CSV export admin Digems. */
export interface DigemsCsvRow {
  occurred_on: DayKey
  amount: number
  note: string
  game: string
  pack: string
  refId: string
}

export interface DigemsCsvResult {
  /** Baris berstatus Sukses yang siap diimpor. */
  rows: DigemsCsvRow[]
  total: number
  /** Jumlah seluruh baris yang berstatus Sukses. */
  revenue: number
  /** Baris data yang dilewati (Menunggu/Dibatalkan/dll). */
  skipped: number
}

/** Parser CSV sederhana: dukung kutip ganda, koma di dalam sel, dan CRLF. */
function splitCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let quoted = false
  const s = text.replace(/^\uFEFF/, '')
  for (let i = 0; i < s.length; i++) {
    const ch = s[i]!
    if (quoted) {
      if (ch === '"') {
        if (s[i + 1] === '"') {
          field += '"'
          i++
        } else quoted = false
      } else field += ch
    } else if (ch === '"') quoted = true
    else if (ch === ',') {
      row.push(field)
      field = ''
    } else if (ch === '\n') {
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else if (ch !== '\r') field += ch
  }
  if (field !== '' || row.length) {
    row.push(field)
    rows.push(row)
  }
  return rows
}

function norm(s: string): string {
  return s.replace(/\uFEFF/g, '').trim()
}

/** "03/09/2026 14:05" -> "2026-09-03" (format Digems: dd/MM/yyyy). */
function dayKeyFromDigems(raw: string): DayKey | null {
  const m = norm(raw).match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/)
  if (!m) return null
  const mm = String(Number(m[2])).padStart(2, '0')
  const dd = String(Number(m[1])).padStart(2, '0')
  return `${m[3]}-${mm}-${dd}`
}

/** Format catatan pemasukan — identik dengan sinkronisasi otomatis di server
 * Digems, supaya jalur impor & auto-sync tidak menghasilkan duplikat. */
export function buildDigemsNote(game: string, pack: string, refId?: string): string {
  const base = `Topup ${(game || 'Game').trim()} — ${(pack || '').trim()}`
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 300)
  const ref = refId && refId !== '-' && refId.trim() ? ` (Ref ${refId.trim()})` : ''
  return base + ref
}

/** Parse teks CSV hasil export halaman admin Digems
 * (Laporan-Transaksi-Digems-*.csv). Baris ringkasan diabaikan otomatis. */
export function parseDigemsCsv(text: string): DigemsCsvResult {
  const table = splitCsv(text)
  let hi = -1
  for (let i = 0; i < table.length; i++) {
    const cells = table[i]!.map(norm)
    if (
      cells.includes('Tanggal') &&
      cells.includes('Harga') &&
      cells.includes('Status')
    ) {
      hi = i
      break
    }
  }
  if (hi === -1) return { rows: [], total: 0, revenue: 0, skipped: 0 }

  const head = table[hi]!.map(norm)
  const ix = (label: string) => head.indexOf(label)
  const iTanggal = ix('Tanggal')
  const iGame = ix('Game')
  const iPack = ix('Paket')
  const iHarga = ix('Harga')
  const iStatus = ix('Status')
  const iRef = ix('Ref ID')

  const rows: DigemsCsvRow[] = []
  let revenue = 0
  let skipped = 0
  for (let r = hi + 1; r < table.length; r++) {
    const cells = table[r]!
    const no = norm(cells[0] ?? '')
    if (!/^\d+$/.test(no)) continue // ringkasan / baris kosong
    const status = norm(cells[iStatus] ?? '')
    if (!status.includes('Sukses')) {
      skipped++
      continue
    }
    const harga = Number((cells[iHarga] ?? '').replace(/\D/g, ''))
    const occurred_on = dayKeyFromDigems(cells[iTanggal] ?? '')
    if (!(harga > 0) || !occurred_on) continue
    const game = norm(cells[iGame] ?? '')
    const pack = norm(cells[iPack] ?? '')
    const refId = iRef >= 0 ? norm(cells[iRef] ?? '') : ''
    rows.push({
      occurred_on,
      amount: harga,
      note: buildDigemsNote(game, pack, refId),
      game,
      pack,
      refId
    })
    revenue += harga
  }
  return { rows, total: rows.length, revenue, skipped }
}
