import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'
import type { CategorySlice } from '../../utils/aggregates'
import { formatRupiah } from '../../utils/format'

const PALETTE = [
  '#059669',
  '#f43f5e',
  '#3b82f6',
  '#f59e0b',
  '#8b5cf6',
  '#14b8a6',
  '#6366f1',
  '#ec4899'
]
const OTHERS = '#94a3b8'

const TOP_N = 5

interface ChartItem {
  name: string
  value: number
  color: string
}

/** Sumbu legenda & donut; kategori ke-6+ digabung jadi "Lainnya". */
function buildItems(slices: CategorySlice[]): ChartItem[] {
  const top = slices.slice(0, TOP_N)
  const rest = slices.slice(TOP_N)
  const items: ChartItem[] = top.map((s, i) => ({
    name: s.name,
    value: s.total,
    color: PALETTE[i % PALETTE.length]
  }))
  if (rest.length > 0) {
    items.push({
      name: 'Lainnya',
      value: rest.reduce((acc, s) => acc + s.total, 0),
      color: OTHERS
    })
  }
  return items
}

export default function CategoryBreakdown({
  slices,
  totalExpense
}: {
  slices: CategorySlice[]
  totalExpense: number
}) {
  const items = buildItems(slices)

  if (!items.length || totalExpense === 0) {
    return (
      <p className="py-6 text-center text-sm text-slate-400">
        Belum ada pengeluaran pada periode ini.
      </p>
    )
  }

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-2">
      <div className="relative w-full max-w-[220px] shrink-0">
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Pie
              data={items}
              dataKey="value"
              nameKey="name"
              innerRadius={56}
              outerRadius={82}
              paddingAngle={2}
              strokeWidth={0}
            >
              {items.map((item) => (
                <Cell key={item.name} fill={item.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
            Total keluar
          </span>
          <span className="max-w-full truncate px-2 text-sm font-extrabold text-slate-900 tabular-nums">
            {formatRupiah(totalExpense)}
          </span>
        </div>
      </div>

      <ul className="w-full min-w-0 space-y-1.5">
        {items.map((item) => {
          const pct =
            totalExpense > 0 ? Math.round((item.value / totalExpense) * 1000) / 10 : 0
          return (
            <li key={item.name} className="flex items-center gap-2 text-xs">
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="min-w-0 flex-1 truncate font-medium text-slate-600">
                {item.name}
              </span>
              <span className="shrink-0 tabular-nums text-slate-500">{pct}%</span>
              <span className="w-24 shrink-0 text-right font-bold text-slate-800 tabular-nums">
                {formatRupiah(item.value)}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
