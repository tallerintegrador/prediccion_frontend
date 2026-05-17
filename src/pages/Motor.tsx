import { getMotorSummary } from '../api/motor'
import { HorizontalBarChart } from '../components/charts/HorizontalBarChart'
import { TrendLineChart } from '../components/charts/TrendLineChart'
import { Card } from '../components/ui/Card'
import { DataTable } from '../components/ui/DataTable'
import { MetricCard } from '../components/ui/MetricCard'
import { StateBlock } from '../components/ui/StateBlock'
import { useFetchData } from '../hooks/useFetchData'
import { normalizeComparisonRows, normalizeNamedValueRows } from '../utils/chartData'
import { formatPercent, formatUsd } from '../utils/formatters'

function formatUnknown(value: unknown) {
  if (value === null || value === undefined) return 'No disponible'
  if (typeof value === 'number') return Number.isInteger(value) ? String(value) : value.toFixed(3)
  return String(value)
}

export function Motor() {
  const { data, loading, error } = useFetchData(getMotorSummary)

  if (loading) return <StateBlock title="Cargando metricas del motor" />
  if (error) return <StateBlock title="No se pudo cargar el motor" description={error} />
  if (!data) return <StateBlock title="Sin metricas disponibles" />

  const categoryData = normalizeNamedValueRows(data.precision_por_categoria, 'categoria', 'mape')
  const evolutionData = normalizeNamedValueRows(data.evolucion_precision, 'semana', 'precision')
  const comparison = normalizeComparisonRows(data.comparacion_baseline)

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="MAE" value={formatUsd(data.metricas.mae)} helper="Error absoluto medio" />
        <MetricCard label="MAPE" value={formatPercent(data.metricas.mape)} helper="Error porcentual medio" accent="success" />
        <MetricCard label="RMSE" value={formatUsd(data.metricas.rmse)} helper="Raiz del error cuadratico" />
        <MetricCard label="R2" value={data.metricas.r2?.toString() ?? 'No disponible'} helper="Varianza explicada" />
      </div>

      {!data.disponible && (
        <StateBlock
          title="Archivo de metricas no disponible"
          description="El backend no encontro models/metrics.json; no se muestran metricas simuladas."
        />
      )}

      <div className="grid gap-4 xl:grid-cols-2">
        <Card title="Precision por categoria" subtitle="Valores expuestos por el backend">
          {categoryData.length > 0 ? <HorizontalBarChart data={categoryData} /> : <StateBlock title="Sin precision por categoria" />}
        </Card>
        <Card title="Evolucion de la precision" subtitle="Serie temporal del archivo de metricas">
          {evolutionData.length > 0 ? <TrendLineChart data={evolutionData} /> : <StateBlock title="Sin evolucion registrada" />}
        </Card>
      </div>

      <Card title="Comparacion contra linea base estadistica">
        <DataTable
          data={comparison}
          emptyText="No hay comparacion de baseline expuesta por la API."
          columns={[
            { header: 'Metrica', render: (item) => item.metrica },
            { header: 'Baseline', className: 'text-right', render: (item) => formatUnknown(item.baseline) },
            { header: 'Modelo', className: 'text-right', render: (item) => formatUnknown(item.modelo) },
            { header: 'Mejora', className: 'text-right text-emerald-600 font-bold', render: (item) => formatUnknown(item.mejora) },
          ]}
        />
      </Card>
    </div>
  )
}
