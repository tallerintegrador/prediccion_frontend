import { getReconciliationSummary } from '../api/reconciliacion'
import { Card } from '../components/ui/Card'
import { DataTable } from '../components/ui/DataTable'
import { MetricCard } from '../components/ui/MetricCard'
import { StateBlock } from '../components/ui/StateBlock'
import { useFetchData } from '../hooks/useFetchData'
import { formatPercent, formatUsd, statusDot, variationTone } from '../utils/formatters'

export function Reconciliacion() {
  const { data, loading, error } = useFetchData(getReconciliationSummary)

  if (loading) return <StateBlock title="Cargando reconciliacion" />
  if (error) return <StateBlock title="No se pudo cargar reconciliacion" description={error} />
  if (!data) return <StateBlock title="Sin datos disponibles" />

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Reconciliados este mes"
          value={`${data.kpis.reconciliados_mes} / ${data.kpis.total_reconciliados}`}
        />
        <MetricCard label="Variacion promedio" value={formatPercent(data.kpis.variacion_promedio)} accent="success" />
        <MetricCard label="Sin variacion significativa" value={String(data.kpis.sin_variacion_significativa)} />
        <MetricCard label="Variacion > 10%" value={String(data.kpis.variacion_mayor_10)} accent="danger" />
      </div>

      <Card
        title="Operaciones reconciliadas"
        action={
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
            <span className="inline-flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> Variacion &lt; 5%
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-amber-500" /> 5% - 10%
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-rose-500" /> &gt; 10%
            </span>
          </div>
        }
      >
        <DataTable
          data={data.operaciones}
          columns={[
            { header: 'Despacho', render: (item) => `DSP-${item.id.toString().padStart(6, '0')}` },
            { header: 'Producto', render: (item) => <strong>{item.producto}</strong> },
            { header: 'Estimado', className: 'text-right', render: (item) => formatUsd(item.costo_predicho_usd) },
            { header: 'Real', className: 'text-right', render: (item) => formatUsd(item.costo_real_usd) },
            {
              header: 'Variacion USD',
              className: 'text-right',
              render: (item) => <span className={variationTone(item.variacion_porcentaje)}>{formatUsd(item.variacion_usd)}</span>,
            },
            {
              header: 'Variacion %',
              className: 'text-right',
              render: (item) => (
                <span className={`font-bold ${variationTone(item.variacion_porcentaje)}`}>
                  {formatPercent(item.variacion_porcentaje, true)}
                </span>
              ),
            },
            {
              header: 'Estado',
              className: 'text-center',
              render: (item) => <span className={`inline-block h-3 w-3 rounded-full ${statusDot(item.variacion_porcentaje)}`} />,
            },
          ]}
        />
      </Card>

      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-900">
        <strong>Mejora continua:</strong> Cada operacion reconciliada queda disponible como dato real para el ciclo de
        entrenamiento del modelo.
      </div>
    </div>
  )
}
