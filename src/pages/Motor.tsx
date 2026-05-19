import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { getMotorSummary } from '../api/motor'
import { HorizontalBarChart } from '../components/charts/HorizontalBarChart'
import { TrendLineChart } from '../components/charts/TrendLineChart'
import { Card } from '../components/ui/Card'
import { DataTable } from '../components/ui/DataTable'
import { MetricCard } from '../components/ui/MetricCard'
import { StateBlock } from '../components/ui/StateBlock'
import { useFetchData } from '../hooks/useFetchData'
import { normalizeComparisonRows, normalizeNamedValueRows } from '../utils/chartData'
import { formatPercent, formatUsd, humanizeKey } from '../utils/formatters'

function formatUnknown(value: unknown) {
  if (value === null || value === undefined) return 'No disponible'
  if (typeof value === 'number') return Number.isInteger(value) ? String(value) : value.toFixed(3)
  return String(value)
}

function formatMetricValue(key: string, value: unknown) {
  if (typeof value === 'number' && value <= 1 && /accuracy|f1|precision/.test(key)) {
    return formatPercent(value * 100)
  }

  return formatUnknown(value)
}

function renderModelMetrics(metricas: Record<string, unknown> | null) {
  const entries = Object.entries(metricas ?? {}).filter(([, value]) => value !== null && value !== undefined)
  if (entries.length === 0) return <span className="text-slate-500">No disponible</span>

  return (
    <div className="flex max-w-[360px] flex-wrap gap-1.5">
      {entries.map(([key, value]) => (
        <span key={key} className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-700">
          <span className="font-semibold">{humanizeKey(key)}:</span> {formatMetricValue(key, value)}
        </span>
      ))}
    </div>
  )
}

function sourceLabel(value?: string) {
  if (value === 'metrics.json') return 'metrics.json'
  if (value === 'estimaciones_reconciliadas') return 'Estimaciones reconciliadas'
  if (value === 'artefactos_joblib') return 'Artefactos joblib'
  return 'No disponible'
}

export function Motor() {
  const { data, loading, error } = useFetchData(getMotorSummary)
  const [modelsPage, setModelsPage] = useState(1)

  if (loading) return <StateBlock title="Cargando metricas del motor" />
  if (error) return <StateBlock title="No se pudo cargar el motor" description={error} />
  if (!data) return <StateBlock title="Sin metricas disponibles" />

  const categoryData = normalizeNamedValueRows(data.precision_por_categoria, 'categoria', 'mape')
    .sort((left, right) => right.value - left.value)
    .slice(0, 10)
  const evolutionData = normalizeNamedValueRows(data.evolucion_precision, 'semana', 'precision')
  const comparison = normalizeComparisonRows(data.comparacion_baseline)
  const modelSummary = data.modelos_resumen ?? { total: 0, activos: 0, cargados: 0 }
  const models = data.modelos ?? []
  const modelsPageSize = 10
  const totalModelPages = Math.max(1, Math.ceil(models.length / modelsPageSize))
  const currentModelsPage = Math.min(modelsPage, totalModelPages)
  const visibleModels = models.slice((currentModelsPage - 1) * modelsPageSize, currentModelsPage * modelsPageSize)
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
          data={visibleModels}
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
              className: 'min-w-[320px]',
              render: (item) => renderModelMetrics(item.metricas),
            },
          ]}
        />
        {models.length > modelsPageSize && (
          <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-4 text-sm text-slate-600">
            <span>
              Pagina {currentModelsPage} de {totalModelPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                onClick={() => setModelsPage((page) => Math.max(1, page - 1))}
                disabled={currentModelsPage === 1}
                aria-label="Pagina anterior"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                onClick={() => setModelsPage((page) => Math.min(totalModelPages, page + 1))}
                disabled={currentModelsPage === totalModelPages}
                aria-label="Pagina siguiente"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
