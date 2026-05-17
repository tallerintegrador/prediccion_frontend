export const usdFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

export const penFormatter = new Intl.NumberFormat('es-PE', {
  style: 'currency',
  currency: 'PEN',
  maximumFractionDigits: 2,
})

export function formatUsd(value?: number | null) {
  return value === null || value === undefined ? 'No disponible' : usdFormatter.format(value)
}

export function formatPen(value?: number | null) {
  return value === null || value === undefined ? 'No disponible' : penFormatter.format(value)
}

export function formatPercent(value?: number | null, signed = false) {
  if (value === null || value === undefined) return 'No disponible'
  const prefix = signed && value > 0 ? '+' : ''
  return `${prefix}${value.toFixed(1)}%`
}

export function formatDate(value?: string | null) {
  if (!value) return 'No disponible'
  const date = new Date(`${value}T00:00:00`)
  return new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}

export function formatLongDate(date = new Date()) {
  return new Intl.DateTimeFormat('es-PE', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

export function monthLabel(value: string) {
  const [year, month] = value.split('-').map(Number)
  if (!year || !month) return value
  return new Intl.DateTimeFormat('es-PE', { month: 'short' }).format(new Date(year, month - 1, 1))
}

export function variationTone(value?: number | null) {
  if (value === null || value === undefined) return 'text-slate-500'
  const absolute = Math.abs(value)
  if (absolute < 5) return 'text-emerald-600'
  if (absolute <= 10) return 'text-amber-600'
  return 'text-rose-600'
}

export function statusDot(value?: number | null) {
  if (value === null || value === undefined) return 'bg-slate-300'
  const absolute = Math.abs(value)
  if (absolute < 5) return 'bg-emerald-500'
  if (absolute <= 10) return 'bg-amber-500'
  return 'bg-rose-500'
}

export function humanizeKey(value: string) {
  return value
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}
