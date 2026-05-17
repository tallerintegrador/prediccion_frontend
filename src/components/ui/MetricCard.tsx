type MetricCardProps = {
  label: string
  value: string
  helper?: string
  accent?: 'default' | 'success' | 'warning' | 'danger'
}

const accents = {
  default: 'text-slate-950',
  success: 'text-emerald-600',
  warning: 'text-amber-600',
  danger: 'text-rose-600',
}

export function MetricCard({ label, value, helper, accent = 'default' }: MetricCardProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`mt-2 text-3xl font-bold ${accents[accent]}`}>{value}</p>
      {helper && <p className="mt-2 text-sm text-slate-500">{helper}</p>}
    </div>
  )
}
