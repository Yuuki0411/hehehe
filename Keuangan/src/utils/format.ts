/** Kunci tanggal 'YYYY-MM-DD' — dipakai agar grup hari/minggu/bulan bebas
 * dari pergeseran timezone (tidak pernah di-serialize ke UTC). */
export type DayKey = string

const rupiahFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0
})

export function formatRupiah(n: number): string {
  return rupiahFormatter.format(n)
}

export function formatSignedRupiah(n: number, forcePlus = false): string {
  const sign = n < 0 ? '-' : n > 0 && forcePlus ? '+' : ''
  return sign + rupiahFormatter.format(Math.abs(n))
}

/** Tampilan input nominal: 12500 -> "12.500" */
export function formatNumberInput(n: number): string {
  return new Intl.NumberFormat('id-ID').format(n)
}

/** "12.500" / "12500" -> 12500 ; bukan angka -> NaN */
export function parseAmountInput(raw: string): number {
  const digits = raw.replace(/\D/g, '')
  return digits ? Number(digits) : NaN
}

export function keyOf(d: Date): DayKey {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function todayKey(): DayKey {
  return keyOf(new Date())
}

export function parseKey(k: DayKey): Date {
  const [y, m, d] = k.split('-').map(Number)
  return new Date(y!, m! - 1, d!)
}

export function addDays(k: DayKey, days: number): DayKey {
  const d = parseKey(k)
  d.setDate(d.getDate() + days)
  return keyOf(d)
}

function mondayOf(k: DayKey): DayKey {
  const d = parseKey(k)
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7)) // Senin = awal pekan
  return keyOf(d)
}

function firstOfMonth(k: DayKey): DayKey {
  return k.slice(0, 8) + '01'
}

export type PeriodKind = 'day' | 'week' | 'month'

export interface PeriodRange {
  from: DayKey
  to: DayKey
}

export function periodRange(kind: PeriodKind, cursor: DayKey): PeriodRange {
  if (kind === 'day') return { from: cursor, to: cursor }
  if (kind === 'week') {
    const from = mondayOf(cursor)
    return { from, to: addDays(from, 6) }
  }
  const from = firstOfMonth(cursor)
  const [y, m] = from.split('-').map(Number)
  const lastDay = new Date(y!, m!, 0).getDate()
  const mm = String(m!).padStart(2, '0')
  const dd = String(lastDay).padStart(2, '0')
  return { from, to: `${y}-${mm}-${dd}` }
}

/**
 * Geser periode aktif. Hasil otomatis dinormalisasi:
 * minggu -> Senin pekan tujuan; bulan -> tanggal 1 bulan tujuan.
 */
export function shiftCursor(
  kind: PeriodKind,
  cursor: DayKey,
  delta: number
): DayKey {
  if (kind === 'day') return addDays(cursor, delta)
  if (kind === 'week') return mondayOf(addDays(cursor, delta * 7))
  // Bulan digeser manual agar tidak overflow (31 Mar +1 bln harus 30 Apr).
  const [y, m] = cursor.split('-').map(Number)
  const totalMonthIndex = y! * 12 + (m! - 1) + delta
  const ny = Math.floor(totalMonthIndex / 12)
  const nm = ((totalMonthIndex % 12) + 12) % 12
  return `${ny}-${String(nm + 1).padStart(2, '0')}-01`
}

// ----------------------------- Label tanggal ------------------------------

const fmtWeekdayLongDate = new Intl.DateTimeFormat('id-ID', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric'
})
const fmtDayShort = new Intl.DateTimeFormat('id-ID', {
  day: 'numeric',
  month: 'short'
})
const fmtDayWeekdayShort = new Intl.DateTimeFormat('id-ID', {
  weekday: 'short'
})
const fmtMonthLongYear = new Intl.DateTimeFormat('id-ID', {
  month: 'long',
  year: 'numeric'
})

export function formatFullDate(k: DayKey): string {
  return fmtWeekdayLongDate.format(parseKey(k))
}

/** "27 Agu" */
export function formatShortDate(k: DayKey): string {
  return fmtDayShort.format(parseKey(k))
}

/** "Sen" untuk sumbu grafik & header daftar */
export function formatWeekdayShort(k: DayKey): string {
  return fmtDayWeekdayShort.format(parseKey(k))
}

/** Relatif terhadap hari ini: "Hari ini", "Kemarin", atau "27 Agu". */
export function formatRelativeDate(k: DayKey): string {
  if (k === todayKey()) return 'Hari ini'
  if (k === addDays(todayKey(), -1)) return 'Kemarin'
  return formatFullDate(k)
}

const fmtFullDateTime = new Intl.DateTimeFormat('id-ID', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
})

/** "27 Agu 2026 14.05" — stempel waktu memo. */
export function formatDateTime(iso: string): string {
  return fmtFullDateTime.format(new Date(iso))
}

/** Judul periode: hari = "Rabu, 26 Agustus 2026", pekan = "24 – 30 Agu 2026",
 * bulan = "Agustus 2026". */
export function periodTitle(kind: PeriodKind, range: PeriodRange): string {
  if (kind === 'day') return formatFullDate(range.from)
  if (kind === 'month') return fmtMonthLongYear.format(parseKey(range.from))
  const a = parseKey(range.from)
  const b = parseKey(range.to)
  const sameMonth =
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()
  const endYear = ` ${b.getFullYear()}`
  if (sameMonth) {
    return `${a.getDate()} – ${b.getDate()} ${new Intl.DateTimeFormat('id-ID', { month: 'short' }).format(b)}${endYear}`
  }
  return `${formatShortDate(range.from)} – ${formatShortDate(range.to)}${endYear}`
}
