import { Link } from 'react-router-dom'
import { getDashboardOverview } from '../api/dashboard'
import { AreaLineChart } from '../components/charts/AreaLineChart'
import { DonutChart } from '../components/charts/DonutChart'
import { Card } from '../components/ui/Card'
import { DataTable } from '../components/ui/DataTable'
import { MetricCard } from '../components/ui/MetricCard'
import { StateBlock } from '../components/ui/StateBlock'
import { useFetchData } from '../hooks/useFetchData'
import { formatDate, formatPercent, formatUsd, monthLabel, variationTone } from '../utils/formatters'

export function Dashboard() {
  const { data, loading, error } = useFetchData(getDashboardOverview)

  if (loading) return <StateBlock title="Cargando dashboard" />
  if (error) return <StateBlock title="No se pudo cargar el dashboard" description={error} />
  if (!data) return <StateBlock title="Sin datos disponibles" />

  const monthlyData = data.costo_mensual.map((item) => ({
    name: monthLabel(item.mes),
    value: item.costo_total_usd,
  }))
  const distribution = data.distribucion_categoria.map((item) => ({
    name: item.categoria,
    value: item.total,
  }))
  const loadedModels = data.kpis.modelos_cargados ?? 0
  const activeModels = data.kpis.modelos_activos ?? 0
  const costHelper = data.kpis.fuente_datos === 'estimaciones' ? 'Basado en estimaciones registradas' : 'Basado en historico'

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Operaciones del anio" value={String(data.kpis.despachos_anio)} helper={costHelper} />
        <MetricCard label="Costo gestionado" value={formatUsd(data.kpis.costo_total_importado_anio_usd)} helper={costHelper} />
        <MetricCard label="Modelos cargados" value={String(loadedModels)} helper={`${activeModels} activos para prediccion`} />
        <MetricCard
          label="Precision del motor"
          value={data.kpis.precision_motor === null ? 'No disponible' : formatPercent(data.kpis.precision_motor)}
          helper="Calculado desde metricas disponibles"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[2fr_1fr]">
        <Card title="Costo importado mensual" subtitle="Total en USD por mes">
          {monthlyData.length > 0 ? <AreaLineChart data={monthlyData} /> : <StateBlock title="Sin costos mensuales" />}
        </Card>
        <Card title="Distribucion por categoria" subtitle="% del costo total historico">
          {distribution.length > 0 ? <DonutChart data={distribution} /> : <StateBlock title="Sin categorias registradas" />}
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card title="Ultimos despachos reconciliados">
          <DataTable
            data={data.ultimos_reconciliados}
            emptyText="No hay operaciones reconciliadas."
            columns={[
              {
                header: 'Producto',
                render: (item) => (
                  <div>
                    <p className="font-semibold">{item.producto}</p>
                    <p className="text-xs text-slate-500">
                      {item.proveedor ?? 'Proveedor no disponible'} · {item.pais_origen ?? 'Origen no disponible'}
                    </p>
                  </div>
                ),
              },
              {
                header: 'Costo real',
                className: 'text-right',
                render: (item) => <span className="font-semibold">{formatUsd(item.costo_real_usd)}</span>,
              },
              {
                header: 'Variacion',
                className: 'text-right',
                render: (item) => (
                  <span className={`font-semibold ${variationTone(item.variacion_porcentaje)}`}>
                    {formatPercent(item.variacion_porcentaje, true)}
                  </span>
                ),
              },
            ]}
          />
        </Card>

        <Card title="Proximos arribos · Pre-liquidacion pendiente">
          <div className="divide-y divide-slate-100">
            {data.proximas_estimaciones.length === 0 ? (
              <StateBlock title="No hay pre-liquidaciones pendientes" />
            ) : (
              data.proximas_estimaciones.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-4 py-4">
                  <div>
                    <p className="font-semibold text-slate-950">{item.producto}</p>
                    <p className="text-sm text-slate-500">
                      Llega: {formatDate(item.fecha_estimada_arribo)} · {item.proveedor}
                    </p>
                  </div>
                  <Link
                    className="rounded-md bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-700"
                    to={`/preliquidacion?id=${item.id}`}
                  >
                    Ver
                  </Link>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
