import { CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis } from 'recharts'
import { ChartFrame } from './ChartFrame'

type ChartPoint = {
  name: string
  value: number
}

export function TrendLineChart({ data }: { data: ChartPoint[] }) {
  return (
    <ChartFrame>
      {({ width, height }) => (
        <LineChart width={width} height={height} data={data} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
          <CartesianGrid stroke="#e2e8f0" vertical={false} />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
          <Tooltip formatter={(value) => [`${Number(value).toLocaleString('es-PE')}%`, 'Valor']} />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#10b981"
            strokeWidth={3}
            dot={{ r: 3, fill: '#10b981' }}
          />
        </LineChart>
      )}
    </ChartFrame>
  )
}
