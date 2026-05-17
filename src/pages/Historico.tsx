import { useCallback, useEffect, useMemo, useState } from 'react'
import { getHistoricalFilters, getShipments, type ShipmentFilters } from '../api/historico'
import type { HistoricalFilters, PaginatedShipments } from '../api/types'
import { VerticalBarChart } from '../components/charts/VerticalBarChart'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { DataTable } from '../components/ui/DataTable'
import { SelectField } from '../components/ui/Field'
import { MetricCard } from '../components/ui/MetricCard'
import { StateBlock } from '../components/ui/StateBlock'
import { formatDate, formatUsd } from '../utils/formatters'
import { groupShipmentsByMonth } from '../utils/chartData'

const emptyFilters: HistoricalFilters = {
  categorias: [],
  paises: [],
  proveedores: [],
  periodos: [],
}

function badgeTone(category: string) {
  if (category.toLowerCase().includes('maquinaria')) return 'indigo'
  if (category.toLowerCase().includes('material')) return 'emerald'
  if (category.toLowerCase().includes('sustrato')) return 'amber'
  return 'slate'
}

export function Historico() {
  const [filters, setFilters] = useState<HistoricalFilters>(emptyFilters)
  const [selected, setSelected] = useState({ categoria: '', pais: '', proveedor: '', periodo: '' })
  const [shipments, setShipments] = useState<PaginatedShipments | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadShipments = useCallback(async (nextSelected = selected) => {
    setLoading(true)
    setError(null)
    const params: ShipmentFilters = { page: 1, page_size: 100 }
    if (nextSelected.categoria) params.categoria = nextSelected.categoria
    if (nextSelected.pais) params.pais_origen = nextSelected.pais
    if (nextSelected.proveedor) params.proveedor = nextSelected.proveedor
    if (nextSelected.periodo) {
      params.fecha_desde = `${nextSelected.periodo}-01-01`
      params.fecha_hasta = `${nextSelected.periodo}-12-31`
    }

    try {
      const data = await getShipments(params)
      setShipments(data)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'No se pudo cargar el historico.')
    } finally {
      setLoading(false)
    }
  }, [selected])

  useEffect(() => {
    let active = true

    async function initialize() {
      try {
        const [filterData, shipmentData] = await Promise.all([
          getHistoricalFilters().catch(() => emptyFilters),
          getShipments({ page: 1, page_size: 100 }),
        ])
        if (!active) return
        setFilters(filterData)
        setShipments(shipmentData)
      } catch (reason) {
        if (!active) return
        setError(reason instanceof Error ? reason.message : 'No se pudo cargar el historico.')
      } finally {
        if (active) setLoading(false)
      }
    }

    void initialize()
    return () => {
      active = false
    }
  }, [])

  const chartData = useMemo(() => groupShipmentsByMonth(shipments?.items ?? []), [shipments])
  const total = shipments?.items.reduce((sum, item) => sum + item.costo_total_usd, 0) ?? 0
  const average = shipments?.items.length ? total / shipments.items.length : null

  if (loading && !shipments) return <StateBlock title="Cargando historial" />
  if (error) return <StateBlock title="No se pudo cargar la consulta historica" description={error} />

  return (
    <div className="space-y-6">
      <Card>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <SelectField
            label="Categoria"
            value={selected.categoria}
            onChange={(event) => setSelected((current) => ({ ...current, categoria: event.target.value }))}
            options={[{ label: 'Todas las categorias', value: '' }, ...filters.categorias.map((value) => ({ label: value, value }))]}
          />
          <SelectField
            label="Pais de origen"
            value={selected.pais}
            onChange={(event) => setSelected((current) => ({ ...current, pais: event.target.value }))}
            options={[{ label: 'Todos', value: '' }, ...filters.paises.map((value) => ({ label: value, value }))]}
          />
          <SelectField
            label="Proveedor"
            value={selected.proveedor}
            onChange={(event) => setSelected((current) => ({ ...current, proveedor: event.target.value }))}
            options={[{ label: 'Todos los proveedores', value: '' }, ...filters.proveedores.map((value) => ({ label: value, value }))]}
          />
          <SelectField
            label="Periodo"
            value={selected.periodo}
            onChange={(event) => setSelected((current) => ({ ...current, periodo: event.target.value }))}
            options={[{ label: 'Todos los periodos', value: '' }, ...filters.periodos.map((value) => ({ label: `Anio ${value}`, value }))]}
          />
          <div className="flex items-end">
            <Button className="w-full" onClick={() => void loadShipments()}>
              Aplicar filtros
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Despachos encontrados" value={String(shipments?.total ?? 0)} />
        <MetricCard label="Costo promedio por despacho" value={formatUsd(average)} />
        <MetricCard label="Costo total acumulado" value={formatUsd(total)} />
      </div>

      <Card title="Evolucion del costo en el tiempo" subtitle="Costo total segun datos filtrados">
        {chartData.length > 0 ? <VerticalBarChart data={chartData} /> : <StateBlock title="Sin datos para graficar" />}
      </Card>

      <Card>
        <DataTable
          data={shipments?.items ?? []}
          columns={[
            { header: 'N despacho', render: (item) => `DSP-${item.id.toString().padStart(6, '0')}` },
            { header: 'Fecha', render: (item) => formatDate(item.fecha_despacho) },
            { header: 'Producto', render: (item) => <span className="font-semibold">{item.producto}</span> },
            {
              header: 'Categoria',
              render: (item) => <Badge tone={badgeTone(item.categoria)}>{item.categoria}</Badge>,
            },
            { header: 'Origen', render: (item) => item.pais_origen },
            { header: 'Incoterm', render: (item) => item.incoterm },
            { header: 'Cantidad', render: (item) => item.cantidad.toLocaleString('es-PE') },
            { header: 'Costo total', className: 'text-right', render: (item) => <strong>{formatUsd(item.costo_total_usd)}</strong> },
          ]}
        />
      </Card>
    </div>
  )
}
