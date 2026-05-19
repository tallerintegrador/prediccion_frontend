import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from 'recharts'
import { ChartFrame } from './ChartFrame'

type ChartPoint = {
  name: string
  value: number
}

export function VerticalBarChart({ data }: { data: ChartPoint[] }) {
  return (
    <ChartFrame>
      {({ width, height }) => (
        <BarChart width={width} height={height} data={data} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
          <CartesianGrid stroke="#e2e8f0" vertical={false} />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
          <Tooltip formatter={(value) => [`$ ${Number(value).toLocaleString('en-US')}`, 'Costo']} />
          <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
        </BarChart>
      )}
    </ChartFrame>
  )
}
