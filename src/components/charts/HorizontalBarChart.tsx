import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from 'recharts'
import { ChartFrame } from './ChartFrame'

type ChartPoint = {
  name: string
  value: number
}

export function HorizontalBarChart({ data }: { data: ChartPoint[] }) {
  return (
    <ChartFrame>
      {({ width, height }) => (
        <BarChart width={width} height={height} data={data} layout="vertical" margin={{ left: 32, right: 8, top: 8, bottom: 0 }}>
          <CartesianGrid stroke="#e2e8f0" horizontal={false} />
          <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
          <YAxis
            dataKey="name"
            type="category"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#64748b', fontSize: 12 }}
          />
          <Tooltip formatter={(value) => [`${Number(value).toLocaleString('es-PE')}%`, 'Valor']} />
          <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} />
        </BarChart>
      )}
    </ChartFrame>
  )
}
