import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'
import type { DailyBucket } from '../../utils/aggregates'
import { formatRupiah } from '../../utils/format'

const INCOME_COLOR = '#059669'
const EXPENSE_COLOR = '#f43f5e'

/** Sumbu-Y ringkas: 125000 -> "125rb", 1200000 -> "1,2jt" */
function compactAxisRupiah(v: number): string {
  if (v >= 1_000_000)
    return (
      (v / 1_000_000).toFixed(1).replace('.', ',').replace(',0', '') + 'jt'
    )
  if (v >= 1_000) return `${Math.round(v / 1_000)}rb`
  return String(v)
}

export default function TrendChart({ buckets }: { buckets: DailyBucket[] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart
        data={buckets}
        margin={{ top: 4, right: 4, bottom: 0, left: -20 }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 10, fill: '#64748b' }}
          tickLine={false}
          axisLine={false}
          interval={0}
          minTickGap={18}
        />
        <YAxis
          tickFormatter={compactAxisRupiah}
          tick={{ fontSize: 10, fill: '#94a3b8' }}
          tickLine={false}
          axisLine={false}
          width={44}
        />
        <Tooltip
          cursor={{ fill: 'rgba(148,163,184,0.12)' }}
          contentStyle={{
            borderRadius: 12,
            border: '1px solid #e2e8f0',
            fontSize: 12,
            boxShadow: '0 4px 14px rgba(15,23,42,0.08)'
          }}
          formatter={(value) => formatRupiah(Number(value))}
          labelFormatter={(label) => String(label)}
        />
        <Bar
          dataKey="income"
          name="Masuk"
          fill={INCOME_COLOR}
          radius={[3, 3, 0, 0]}
          maxBarSize={16}
        />
        <Bar
          dataKey="expense"
          name="Keluar"
          fill={EXPENSE_COLOR}
          radius={[3, 3, 0, 0]}
          maxBarSize={16}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
