import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

type ChartPoint = {
  name: string
  value: number
}

export function AreaLineChart({ data }: { data: ChartPoint[] }) {
  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
          <defs>
            <linearGradient id="areaIndigo" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.24} />
              <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#e2e8f0" vertical={false} />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
          <Tooltip formatter={(value) => [`$ ${Number(value).toLocaleString('en-US')}`, 'Costo']} />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#4338ca"
            strokeWidth={3}
            fill="url(#areaIndigo)"
            dot={{ r: 3, fill: '#4338ca' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
