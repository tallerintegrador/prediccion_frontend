import { Cell, Pie, PieChart, Tooltip } from 'recharts'
import { ChartFrame } from './ChartFrame'

type DonutPoint = {
  name: string
  value: number
}

const colors = ['#10b981', '#8b5cf6', '#f59e0b', '#3b82f6', '#ef4444', '#64748b']

export function DonutChart({ data }: { data: DonutPoint[] }) {
  return (
    <div className="min-w-0">
      <ChartFrame>
        {({ width, height }) => (
          <PieChart width={width} height={height}>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={68} outerRadius={104} paddingAngle={1}>
            {data.map((entry, index) => (
              <Cell key={entry.name} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [`$ ${Number(value).toLocaleString('en-US')}`, 'Total']} />
          </PieChart>
        )}
      </ChartFrame>
      <div className="mt-1 flex flex-wrap justify-center gap-3">
        {data.map((entry, index) => (
          <span key={entry.name} className="inline-flex items-center gap-2 text-xs text-slate-600">
            <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: colors[index % colors.length] }} />
            {entry.name}
          </span>
        ))}
      </div>
    </div>
  )
}
