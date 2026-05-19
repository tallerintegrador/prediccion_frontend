import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { getHistoricalFilters } from '../api/historico'
import { createPrediction, getPredictionModels } from '../api/prediccion'
import type { HistoricalFilters, PredictionModelInfo, PredictionModelResult, PredictionResponse } from '../api/types'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { DataTable } from '../components/ui/DataTable'
import { Input, SelectField } from '../components/ui/Field'
import { StateBlock } from '../components/ui/StateBlock'
import { usePredictionForm } from '../hooks/usePredictionForm'
import { formatUsd, humanizeKey } from '../utils/formatters'

const emptyFilters: HistoricalFilters = {
  categorias: [],
  paises: [],
  proveedores: [],
  periodos: [],
}

export function Prediccion() {
  const { payload, updateField, validate } = usePredictionForm()
  const [filters, setFilters] = useState<HistoricalFilters>(emptyFilters)
  const [models, setModels] = useState<PredictionModelInfo[]>([])
  const [result, setResult] = useState<PredictionResponse | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getHistoricalFilters()
      .then((data) => {
        setFilters(data)
        if (data.categorias[0]) updateField('categoria', data.categorias[0])
        if (data.paises[0]) updateField('origen', data.paises[0])
        if (data.proveedores[0]) updateField('proveedor', data.proveedores[0])
      })
      .catch(() => setFilters(emptyFilters))
  }, [updateField])

  useEffect(() => {
    getPredictionModels()
      .then(setModels)
      .catch(() => setModels([]))
  }, [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const validation = validate()
    if (validation) {
      setError(validation)
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      const prediction = await createPrediction(payload)
      setResult(prediction)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'No se pudo generar la prediccion.')
    } finally {
      setSubmitting(false)
    }
  }

  const breakdown = result?.desglose
    ? Object.entries(result.desglose).map(([key, value]) => ({
        componente: humanizeKey(key),
        monto: value,
        porcentaje: result.costo_predicho_usd ? (value / result.costo_predicho_usd) * 100 : 0,
      }))
    : []

  const modelRows: Array<PredictionModelResult | PredictionModelInfo> = result?.resultados_modelos.length
    ? result.resultados_modelos
    : models

  function isPredictionResult(row: PredictionModelResult | PredictionModelInfo): row is PredictionModelResult {
    return 'modelo_id' in row
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.35fr]">
      <Card title="Parametros del nuevo despacho" subtitle="Ingresa los datos conocidos antes del arribo de la mercancia">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <SelectField
            label="Categoria del producto"
            value={payload.categoria}
            onChange={(event) => updateField('categoria', event.target.value)}
            options={filters.categorias.map((value) => ({ label: value, value }))}
          />
          <Input label="Producto" value={payload.producto} onChange={(event) => updateField('producto', event.target.value)} />
          <div className="grid gap-4 md:grid-cols-2">
            <SelectField
              label="Pais de origen"
              value={payload.origen}
              onChange={(event) => updateField('origen', event.target.value)}
              options={filters.paises.map((value) => ({ label: value, value }))}
            />
            <SelectField
              label="Proveedor"
              value={payload.proveedor}
              onChange={(event) => updateField('proveedor', event.target.value)}
              options={filters.proveedores.map((value) => ({ label: value, value }))}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <SelectField
              label="Incoterm"
              value={payload.incoterm}
              onChange={(event) => updateField('incoterm', event.target.value)}
              options={['CIF', 'FOB', 'DAP', 'EXW'].map((value) => ({ label: value, value }))}
            />
            <Input
              label="Cantidad"
              type="number"
              min="0"
              step="0.01"
              value={payload.cantidad}
              onChange={(event) => updateField('cantidad', Number(event.target.value))}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Tipo de cambio (USD/PEN)"
              type="number"
              min="0"
              step="0.01"
              value={payload.tipo_cambio}
              onChange={(event) => updateField('tipo_cambio', Number(event.target.value))}
            />
            <Input
              label="Fecha estimada de arribo"
              type="date"
              value={payload.fecha_estimada_arribo}
              onChange={(event) => updateField('fecha_estimada_arribo', event.target.value)}
            />
          </div>
          {error && <p className="rounded-md bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">{error}</p>}
          <Button className="w-full" disabled={submitting}>
            {submitting ? 'Prediciendo...' : 'Predecir costo'}
          </Button>
        </form>
      </Card>

      <div className="space-y-6">
        <section className="rounded-lg bg-indigo-700 p-6 text-white shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-indigo-200">Prediccion del motor</p>
              <p className="mt-2 text-4xl font-bold">{formatUsd(result?.costo_predicho_usd)}</p>
              <p className="mt-2 text-sm text-indigo-100">
                {result?.modelo_principal ? `Modelo principal: ${result.modelo_principal.nombre}` : 'Sin modelo principal disponible'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold uppercase tracking-wide text-indigo-200">Modelos evaluados</p>
              <p className="mt-2 text-xl font-bold">{result?.resultados_modelos.length ?? models.filter((model) => model.activo).length}</p>
            </div>
          </div>
          <div className="mt-6 rounded-md bg-white/10 p-4">
            <p className="text-sm font-semibold">Estado de registro</p>
            <p className="mt-2 text-sm text-indigo-100">
              {result?.id
                ? 'La estimacion principal fue registrada para pre-liquidacion.'
                : 'Ejecuta una prediccion con un modelo principal valido para registrar la estimacion.'}
            </p>
          </div>
          {result?.id && (
            <Link
              className="mt-4 inline-flex rounded-md bg-white px-4 py-2 text-sm font-semibold text-indigo-700"
              to={`/preliquidacion?id=${result.id}`}
            >
              Ver pre-liquidacion
            </Link>
          )}
        </section>

        <Card title="Comparacion de modelos">
          <DataTable
            data={modelRows}
            emptyText="No hay modelos registrados."
            columns={[
              {
                header: 'Modelo',
                render: (item) => {
                  const nombre = isPredictionResult(item) ? item.modelo_nombre : item.nombre
                  const principal = item.principal
                  return (
                    <div className="space-y-1">
                      <p className="font-semibold">{nombre}</p>
                      {principal && <Badge tone="indigo">Principal</Badge>}
                    </div>
                  )
                },
              },
              {
                header: 'Estado',
                render: (item) => {
                  const error = item.error
                  const loaded = isPredictionResult(item) ? !error && item.costo_predicho_usd !== null : item.cargado
                  return <Badge tone={loaded ? 'emerald' : error ? 'rose' : 'amber'}>{loaded ? 'OK' : error ? 'Error' : 'Pendiente'}</Badge>
                },
              },
              {
                header: 'Uso',
                render: (item) => (isPredictionResult(item) ? 'Costo' : humanizeKey(item.objetivo)),
              },
              {
                header: 'Prediccion',
                className: 'text-right',
                render: (item) => (isPredictionResult(item) ? formatUsd(item.costo_predicho_usd) : 'No ejecutado'),
              },
              {
                header: 'Detalle',
                render: (item) => (
                  <span className="block max-w-[360px] whitespace-normal text-sm text-slate-600">
                    {item.error ?? (isPredictionResult(item) ? 'Prediccion generada correctamente.' : item.descripcion ?? item.archivo)}
                  </span>
                ),
              },
            ]}
          />
        </Card>

        <Card title="Desglose del costo predicho">
          {breakdown.length === 0 ? (
            <StateBlock title="Ejecuta una prediccion para ver el desglose" />
          ) : (
            <div className="divide-y divide-slate-100">
              {breakdown.map((item) => (
                <div key={item.componente} className="flex items-center justify-between py-4">
                  <span className="font-medium text-slate-700">{item.componente}</span>
                  <span className="font-bold text-slate-950">
                    {formatUsd(item.monto)} <span className="ml-2 text-sm font-normal text-slate-500">{item.porcentaje.toFixed(1)}%</span>
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
