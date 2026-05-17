import { Download, FileSpreadsheet, Send } from 'lucide-react'
import { useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getExcelUrl, getPdfUrl, getPreliquidation } from '../api/preliquidacion'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { DataTable } from '../components/ui/DataTable'
import { StateBlock } from '../components/ui/StateBlock'
import { useFetchData } from '../hooks/useFetchData'
import { formatDate, formatPen, formatUsd, humanizeKey } from '../utils/formatters'

export function Preliquidacion() {
  const [params] = useSearchParams()
  const id = params.get('id')
  const loadPreliquidation = useCallback(() => getPreliquidation(id), [id])
  const { data, loading, error } = useFetchData(loadPreliquidation, id ?? 'ultima')

  if (loading) return <StateBlock title="Cargando pre-liquidacion" />
  if (error) return <StateBlock title="No se pudo cargar la pre-liquidacion" description={error} />
  if (!data) return <StateBlock title="No hay pre-liquidaciones registradas" />

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap justify-end gap-3">
        <a href={getPdfUrl(data.id)} rel="noreferrer" target="_blank">
          <Button variant="secondary">
            <Download size={16} />
            PDF
          </Button>
        </a>
        <a href={getExcelUrl(data.id)} rel="noreferrer" target="_blank">
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

      <Card className="max-w-4xl">
        <div className="border-b border-slate-900 pb-8">
          <div className="flex justify-between gap-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Hortifrut Peru S.A.C.</p>
              <h2 className="mt-2 text-2xl font-bold text-slate-950">Pre-liquidacion estimada de importacion</h2>
              <p className="mt-2 text-sm text-slate-500">Documento generado por Sistema Predictivo de Costos</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-500">N pre-liquidacion</p>
              <p className="mt-1 font-mono text-lg font-bold text-slate-950">{data.numero}</p>
              <p className="mt-4 text-sm text-slate-500">Fecha de emision: {formatDate(data.fecha_emision)}</p>
              <Badge tone="amber" className="mt-3">
                Estado: {data.estado}
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid gap-4 py-7 md:grid-cols-2">
          <p className="text-sm text-slate-600">
            Producto: <strong className="text-slate-950">{data.producto}</strong>
          </p>
          <p className="text-sm text-slate-600">
            Categoria: <strong className="text-slate-950">{data.categoria}</strong>
          </p>
          <p className="text-sm text-slate-600">
            Proveedor: <strong className="text-slate-950">{data.proveedor}</strong>
          </p>
          <p className="text-sm text-slate-600">
            Origen: <strong className="text-slate-950">{data.pais_origen}</strong>
          </p>
          <p className="text-sm text-slate-600">
            Incoterm: <strong className="text-slate-950">{data.incoterm}</strong>
          </p>
          <p className="text-sm text-slate-600">
            Arribo estimado: <strong className="text-slate-950">{formatDate(data.fecha_estimada_arribo)}</strong>
          </p>
        </div>

        <DataTable
          data={data.desglose}
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
            <p className="mt-2 text-xl font-bold">{formatUsd(data.costo_predicho_usd)}</p>
          </div>
          <div className="rounded-md bg-slate-50 p-4">
            <p className="text-xs text-slate-500">Total estimado PEN</p>
            <p className="mt-2 text-xl font-bold">{formatPen(data.costo_predicho_pen)}</p>
          </div>
          <div className="rounded-md bg-slate-50 p-4">
            <p className="text-xs text-slate-500">Tipo de cambio</p>
            <p className="mt-2 text-xl font-bold">{data.tipo_cambio.toFixed(2)}</p>
          </div>
        </div>

        <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
          <strong>Notas para Contabilidad:</strong> Esta pre-liquidacion usa una estimacion predictiva real registrada en FastAPI.
          El gasto definitivo se confirma al reconciliar las facturas reales.
        </div>
      </Card>
    </div>
  )
}
