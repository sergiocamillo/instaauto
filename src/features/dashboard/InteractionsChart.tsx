import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { AnalyticsPoint } from '@/lib/types'
import { formatNumber } from '@/lib/format'

const weekday = (iso: string) =>
  new Date(iso + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'short' })

export function InteractionsChart({ data }: { data: AnalyticsPoint[] }) {
  const chartData = data.map((d) => ({ ...d, day: weekday(d.date) }))

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
        >
          <defs>
            <linearGradient id="fillInteractions" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2f6bff" stopOpacity={0.22} />
              <stop offset="100%" stopColor="#2f6bff" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="fillMessages" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.16} />
              <stop offset="100%" stopColor="#7c3aed" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#e6e8ec"
          />
          <XAxis
            dataKey="day"
            tickLine={false}
            axisLine={false}
            tick={{ fill: '#8b93a7', fontSize: 12 }}
            dy={8}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fill: '#8b93a7', fontSize: 12 }}
            width={44}
          />
          <Tooltip
            cursor={{ stroke: '#bdd0ff', strokeWidth: 1 }}
            contentStyle={{
              borderRadius: 12,
              border: '1px solid #e6e8ec',
              boxShadow: '0 10px 30px -12px rgba(15,23,41,0.25)',
              fontSize: 13,
            }}
            labelStyle={{ color: '#0f1729', fontWeight: 600 }}
            formatter={(value, name) => [
              formatNumber(Number(value)),
              name === 'interactions' ? 'Interações' : 'Mensagens',
            ]}
          />
          <Area
            type="monotone"
            dataKey="interactions"
            stroke="#2f6bff"
            strokeWidth={2.5}
            fill="url(#fillInteractions)"
          />
          <Area
            type="monotone"
            dataKey="messages"
            stroke="#7c3aed"
            strokeWidth={2}
            fill="url(#fillMessages)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
