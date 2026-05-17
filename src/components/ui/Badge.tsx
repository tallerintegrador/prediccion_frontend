import type { PropsWithChildren } from 'react'

type BadgeProps = PropsWithChildren<{
  tone?: 'indigo' | 'emerald' | 'amber' | 'rose' | 'slate'
  className?: string
}>

const tones = {
  indigo: 'bg-indigo-50 text-indigo-700',
  emerald: 'bg-emerald-50 text-emerald-700',
  amber: 'bg-amber-50 text-amber-700',
  rose: 'bg-rose-50 text-rose-700',
  slate: 'bg-slate-100 text-slate-600',
}

export function Badge({ tone = 'slate', className = '', children }: BadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold ${tones[tone]} ${className}`}>
      {children}
    </span>
  )
}
