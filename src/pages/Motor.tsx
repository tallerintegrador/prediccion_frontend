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

function sourceLabel(value?: string) {
  if (value === 'metrics.json') return 'metrics.json'
  if (value === 'estimaciones_reconciliadas') return 'Estimaciones reconciliadas'
  if (value === 'artefactos_joblib') return 'Artefactos joblib'
  return 'No disponible'
}

export function Motor() {
  const { data, loading, error } = useFetchData(getMotorSummary)

  if (loading) return <StateBlock title="Cargando metricas del motor" />
  if (error) return <StateBlock title="No se pudo cargar el motor" description={error} />
  if (!data) return <StateBlock title="Sin metricas disponibles" />

  const categoryData = normalizeNamedValueRows(data.precision_por_categoria, 'categoria', 'mape')
  const evolutionData = normalizeNamedValueRows(data.evolucion_precision, 'semana', 'precision')
  const comparison = normalizeComparisonRows(data.comparacion_baseline)
  const modelSummary = data.modelos_resumen ?? { total: 0, activos: 0, cargados: 0 }
  const hasCostMetrics = [data.metricas.mae, data.metricas.mape, data.metricas.rmse, data.metricas.r2].some(
    (value) => value !== null && value !== undefined,
  )

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Precision disponible" value={formatPercent(data.metricas.precision)} helper={sourceLabel(data.fuente_metricas)} />
        <MetricCard label="Accuracy" value={formatPercent(data.metricas.accuracy)} helper="Clasificador de riesgo" accent="success" />
        <MetricCard label="F1 macro" value={formatPercent(data.metricas.f1_macro)} helper="Validacion del clasificador" />
        <MetricCard label="Modelos cargados" value={`${modelSummary.cargados}/${modelSummary.total}`} helper={`${modelSummary.activos} activos`} />
      </div>

      {!data.disponible && (
        <StateBlock
          title="Archivo de metricas no disponible"
          description="El backend no encontro models/metrics.json; no se muestran metricas simuladas."
        />
      )}

      {hasCostMetrics && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="MAE" value={formatUsd(data.metricas.mae)} helper="Error absoluto medio" />
          <MetricCard label="MAPE" value={formatPercent(data.metricas.mape)} helper="Error porcentual medio" accent="success" />
          <MetricCard label="RMSE" value={formatUsd(data.metricas.rmse)} helper="Raiz del error cuadratico" />
          <MetricCard label="R2" value={data.metricas.r2?.toString() ?? 'No disponible'} helper="Varianza explicada" />
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-2">
        <Card title="Precision por categoria" subtitle="Valores disponibles del motor">
          {categoryData.length > 0 ? <HorizontalBarChart data={categoryData} /> : <StateBlock title="Sin precision registrada" />}
        </Card>
        <Card title="Evolucion de la precision" subtitle="Serie disponible del motor">
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

      <Card title="Modelos registrados">
        <DataTable
          data={data.modelos ?? []}
          emptyText="No hay modelos cargados por la API."
          columns={[
            {
              header: 'Modelo',
              render: (item) => (
                <div>
                  <p className="font-semibold">{item.nombre}</p>
                  <p className="text-xs text-slate-500">{item.archivo}</p>
                </div>
              ),
            },
            { header: 'Objetivo', render: (item) => item.objetivo },
            { header: 'Tipo', render: (item) => item.tipo },
            { header: 'Estado', render: (item) => (item.cargado ? 'Cargado' : 'No cargado') },
            {
              header: 'Metricas',
              className: 'text-right',
              render: (item) => formatUnknown(item.metricas?.conceptos ?? item.metricas?.cuantil),
            },
          ]}
        />
      </Card>
    </div>
  )
}
