import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

type ChartPoint = {
  name: string
  value: number
}

export function VerticalBarChart({ data }: { data: ChartPoint[] }) {
  return (
    <div className="h-72 min-w-0">
      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={288}>
        <BarChart data={data} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
          <CartesianGrid stroke="#e2e8f0" vertical={false} />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
          <Tooltip formatter={(value) => [`$ ${Number(value).toLocaleString('en-US')}`, 'Costo']} />
          <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
