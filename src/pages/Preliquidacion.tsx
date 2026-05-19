import { ChevronLeft, ChevronRight, Download, FileSpreadsheet, Send } from 'lucide-react'
import { useCallback, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getExcelUrl, getPdfUrl, getPreliquidation, getPreliquidationHistory } from '../api/preliquidacion'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { DataTable } from '../components/ui/DataTable'
import { StateBlock } from '../components/ui/StateBlock'
import { useFetchData } from '../hooks/useFetchData'
import { formatDate, formatPen, formatUsd, humanizeKey } from '../utils/formatters'

const HISTORY_PAGE_SIZE = 5

export function Preliquidacion() {
  const [params, setParams] = useSearchParams()
  const [historyPage, setHistoryPage] = useState(1)
  const id = params.get('id')
  const loadPreliquidationView = useCallback(async () => {
    const [historial, detalle] = await Promise.all([
      getPreliquidationHistory(historyPage, HISTORY_PAGE_SIZE),
      getPreliquidation(id),
    ])
    return { historial, detalle }
  }, [historyPage, id])
  const { data, loading, error } = useFetchData(loadPreliquidationView, `${id ?? 'ultima'}-${historyPage}`)
  const detalle = data?.detalle
  const historial = data?.historial.items ?? []
  const totalHistory = data?.historial.total ?? 0
  const totalHistoryPages = Math.max(1, Math.ceil(totalHistory / HISTORY_PAGE_SIZE))
  const startHistoryItem = totalHistory === 0 ? 0 : (historyPage - 1) * HISTORY_PAGE_SIZE + 1
  const endHistoryItem = Math.min(historyPage * HISTORY_PAGE_SIZE, totalHistory)

  const selectPreliquidation = useCallback(
    (nextId: number) => {
      setParams({ id: String(nextId) })
    },
    [setParams],
  )

  if (loading) return <StateBlock title="Cargando pre-liquidacion" />
  if (error) return <StateBlock title="No se pudo cargar la pre-liquidacion" description={error} />
  if (!detalle) return <StateBlock title="No hay pre-liquidaciones registradas" />

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap justify-end gap-3">
        <a href={getPdfUrl(detalle.id)} rel="noreferrer" target="_blank">
          <Button variant="secondary">
            <Download size={16} />
            PDF
          </Button>
        </a>
        <a href={getExcelUrl(detalle.id)} rel="noreferrer" target="_blank">
          <Button variant="secondary">
            <FileSpreadsheet size={16} />
            Excel
          </Button>
        </a>
        <Button disabled variant="success">
          <Send size={16} />
          Enviar a Contabilidad
        </Button>
      </div>

      <div className="grid gap-5 xl:grid-cols-[320px_minmax(0,1fr)]">
        <Card title="Historial" subtitle="Estimaciones predictivas registradas" className="h-fit xl:sticky xl:top-5">
          <div className="space-y-2">
            {historial.length === 0 ? (
              <StateBlock title="Sin historial disponible" />
            ) : (
              historial.map((item) => {
                const selected = item.id === detalle.id

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => selectPreliquidation(item.id)}
                    className={`w-full rounded-md border p-3 text-left transition ${
                      selected
                        ? 'border-indigo-300 bg-indigo-50 shadow-sm'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-mono text-xs font-semibold text-slate-500">{item.numero}</p>
                        <p className="mt-1 text-sm font-semibold text-slate-950">{item.producto}</p>
                      </div>
                      <Badge tone={selected ? 'indigo' : 'slate'}>{item.estado}</Badge>
                    </div>
                    <p className="mt-2 line-clamp-1 text-sm text-slate-600">{item.proveedor}</p>
                    <div className="mt-3 flex items-center justify-between gap-3 text-xs text-slate-500">
                      <span>{formatDate(item.fecha_emision)}</span>
                      <strong className="text-sm text-slate-950">{formatUsd(item.costo_predicho_usd)}</strong>
                    </div>
                  </button>
                )
              })
            )}
          </div>

          <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
            <Button
              aria-label="Pagina anterior del historial"
              className="h-9 min-h-9 px-3"
              disabled={historyPage <= 1}
              onClick={() => setHistoryPage((current) => Math.max(1, current - 1))}
              variant="secondary"
            >
              <ChevronLeft size={16} />
            </Button>
            <div className="text-center text-xs text-slate-500">
              <p className="font-semibold text-slate-700">
                Pagina {historyPage} de {totalHistoryPages}
              </p>
              <p>
                {startHistoryItem}-{endHistoryItem} de {totalHistory}
              </p>
            </div>
            <Button
              aria-label="Pagina siguiente del historial"
              className="h-9 min-h-9 px-3"
              disabled={historyPage >= totalHistoryPages}
              onClick={() => setHistoryPage((current) => Math.min(totalHistoryPages, current + 1))}
              variant="secondary"
            >
              <ChevronRight size={16} />
            </Button>
          </div>
        </Card>

        <Card className="min-w-0">
          <div className="border-b border-slate-900 pb-8">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:gap-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Hortifrut Peru S.A.C.</p>
                <h2 className="mt-2 text-2xl font-bold text-slate-950">Pre-liquidacion estimada de importacion</h2>
                <p className="mt-2 text-sm text-slate-500">Documento generado por Sistema Predictivo de Costos</p>
              </div>
              <div className="md:text-right">
                <p className="text-sm text-slate-500">N pre-liquidacion</p>
                <p className="mt-1 font-mono text-lg font-bold text-slate-950">{detalle.numero}</p>
                <p className="mt-4 text-sm text-slate-500">Fecha de emision: {formatDate(detalle.fecha_emision)}</p>
                <Badge tone="amber" className="mt-3">
                  Estado: {detalle.estado}
                </Badge>
              </div>
            </div>
          </div>

          <div className="grid gap-4 py-7 md:grid-cols-2">
            <p className="text-sm text-slate-600">
              Producto: <strong className="text-slate-950">{detalle.producto}</strong>
            </p>
            <p className="text-sm text-slate-600">
              Categoria: <strong className="text-slate-950">{detalle.categoria}</strong>
            </p>
            <p className="text-sm text-slate-600">
              Proveedor: <strong className="text-slate-950">{detalle.proveedor}</strong>
            </p>
            <p className="text-sm text-slate-600">
              Origen: <strong className="text-slate-950">{detalle.pais_origen}</strong>
            </p>
            <p className="text-sm text-slate-600">
              Incoterm: <strong className="text-slate-950">{detalle.incoterm}</strong>
            </p>
            <p className="text-sm text-slate-600">
              Arribo estimado: <strong className="text-slate-950">{formatDate(detalle.fecha_estimada_arribo)}</strong>
            </p>
          </div>

          <DataTable
            data={detalle.desglose}
            columns={[
              { header: 'Componente', render: (item) => humanizeKey(item.componente) },
              { header: 'Estimado USD', className: 'text-right', render: (item) => formatUsd(item.estimado_usd) },
              { header: 'Estimado PEN', className: 'text-right', render: (item) => formatPen(item.estimado_pen) },
              { header: '% del total', className: 'text-right', render: (item) => `${item.porcentaje_total.toFixed(1)}%` },
            ]}
          />

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-md bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Total estimado USD</p>
              <p className="mt-2 text-xl font-bold">{formatUsd(detalle.costo_predicho_usd)}</p>
            </div>
            <div className="rounded-md bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Total estimado PEN</p>
              <p className="mt-2 text-xl font-bold">{formatPen(detalle.costo_predicho_pen)}</p>
            </div>
            <div className="rounded-md bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Tipo de cambio</p>
              <p className="mt-2 text-xl font-bold">{detalle.tipo_cambio.toFixed(2)}</p>
            </div>
          </div>

          <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
            <strong>Notas para Contabilidad:</strong> Esta pre-liquidacion usa una estimacion predictiva real registrada en FastAPI.
            El gasto definitivo se confirma al reconciliar las facturas reales.
          </div>
        </Card>
      </div>
    </div>
  )
}
