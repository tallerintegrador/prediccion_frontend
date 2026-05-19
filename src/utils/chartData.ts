import type { HistoricalShipment } from '../api/types'
import { monthLabel } from './formatters'

type LooseRecord = Record<string, unknown>

export function groupShipmentsByMonth(items: HistoricalShipment[]) {
  const totals = new Map<string, number>()
  for (const item of items) {
    const key = item.fecha_despacho.slice(0, 7)
    totals.set(key, (totals.get(key) ?? 0) + item.costo_total_usd)
  }
  return Array.from(totals.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([month, total]) => ({ name: monthLabel(month), value: Math.round(total) }))
}

export function normalizeNamedValueRows(rows: unknown[], preferredName: string, preferredValue: string) {
  return rows
    .filter((row): row is LooseRecord => typeof row === 'object' && row !== null)
    .map((row) => {
      const name = row[preferredName] ?? row.categoria ?? row.componente ?? row.metricica ?? row.metrica ?? row.name ?? row.semana
      const value = row[preferredValue] ?? row.mape ?? row.precision ?? row.valor ?? row.value
      return {
        name: String(name ?? 'Sin etiqueta'),
        value: Number(value ?? 0),
      }
    })
    .filter((row) => Number.isFinite(row.value))
}

export function normalizeComparisonRows(rows: unknown[]) {
  return rows
    .filter((row): row is LooseRecord => typeof row === 'object' && row !== null)
    .map((row) => ({
      metrica: String(row.metrica ?? row.metric ?? row.name ?? 'Sin etiqueta'),
      baseline: row.baseline ?? row.promedio ?? row.baseline_promedio ?? null,
      modelo: row.random_forest ?? row.modelo ?? row.model ?? row.valor_modelo ?? null,
      mejora: row.mejora ?? row.improvement ?? null,
    }))
}
