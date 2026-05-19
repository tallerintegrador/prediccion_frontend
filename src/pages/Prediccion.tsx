import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { createPrediction, getPredictionModels } from '../api/prediccion'
import type { PredictionModelInfo, PredictionModelResult, PredictionResponse } from '../api/types'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { DataTable } from '../components/ui/DataTable'
import { Input, SelectField } from '../components/ui/Field'
import { StateBlock } from '../components/ui/StateBlock'
import { usePredictionForm } from '../hooks/usePredictionForm'
import { formatUsd, humanizeKey } from '../utils/formatters'

const polOptions = ['VALENCIA', 'SANTIAGO', 'COLOMBO', 'SAN ANTONIO', 'MIAMI', 'OTRO']
const modalityOptions = ['SEA / FCL', 'SEA / LCL', 'AIR / AIR', 'COURIER']
const incotermFamilyOptions = ['GRUPO_C', 'GRUPO_E', 'GRUPO_F', 'GRUPO_D']

export function Prediccion() {
  const { payload, updateField, validate } = usePredictionForm()
  const [models, setModels] = useState<PredictionModelInfo[]>([])
  const [result, setResult] = useState<PredictionResponse | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getPredictionModels()
      .then((items) => {
        setModels(items)
        const defaultModel = items.find((model) => isCostModel(model) && model.principal) ?? items.find(isCostModel)
        if (defaultModel) {
          updateField('modelo_id', defaultModel.id)
        }
      })
      .catch(() => setModels([]))
  }, [updateField])

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

  function isCostModel(model: PredictionModelInfo) {
    return model.predecible ?? (model.activo && model.cargado && !model.error && model.objetivo.toLowerCase() === 'costo')
  }

  function modelRank(model: PredictionModelInfo) {
    return model.ranking ?? null
  }

  const selectableModels = models.filter(isCostModel)
  const topModels = selectableModels
    .sort((first, second) => {
      const firstRank = modelRank(first)
      const secondRank = modelRank(second)
      if (firstRank !== null || secondRank !== null) {
        return (firstRank ?? 99) - (secondRank ?? 99)
      }
      if (first.principal !== second.principal) {
        return first.principal ? -1 : 1
      }
      return first.nombre.localeCompare(second.nombre)
    })
    .slice(0, 3)

  const modelRows: Array<PredictionModelResult | PredictionModelInfo> = result?.resultados_modelos.length
    ? result.resultados_modelos
    : topModels

  function isPredictionResult(row: PredictionModelResult | PredictionModelInfo): row is PredictionModelResult {
    return 'modelo_id' in row
  }

  function modelId(row: PredictionModelResult | PredictionModelInfo) {
    return isPredictionResult(row) ? row.modelo_id : row.id
  }

  function handleModelSelection(modelId: string) {
    updateField('modelo_id', modelId || undefined)
    setResult(null)
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.35fr]">
      <Card title="Parametros del nuevo despacho" subtitle="Ingresa los datos conocidos antes del arribo de la mercancia">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input
            label="ID despacho"
            value={payload.id_despacho}
            onChange={(event) => updateField('id_despacho', event.target.value)}
          />
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Proveedor servicio"
              value={payload.proveedor_servicio}
              onChange={(event) => updateField('proveedor_servicio', event.target.value)}
            />
            <Input
              label="Proveedor principal"
              value={payload.proveedor_principal}
              onChange={(event) => updateField('proveedor_principal', event.target.value)}
            />
          </div>
          <Input
            label="Agencia de aduana"
            value={payload.agencia_aduana}
            onChange={(event) => updateField('agencia_aduana', event.target.value)}
          />
          <div className="grid gap-4 md:grid-cols-2">
            <SelectField
              label="POL"
              value={payload.pol}
              onChange={(event) => updateField('pol', event.target.value)}
              options={polOptions.map((value) => ({ label: value, value }))}
            />
            <Input
              label="POD"
              value={payload.pod}
              onChange={(event) => updateField('pod', event.target.value)}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <SelectField
              label="Modalidad"
              value={payload.modalidad}
              onChange={(event) => updateField('modalidad', event.target.value)}
              options={modalityOptions.map((value) => ({ label: value, value }))}
            />
            <SelectField
              label="Incoterm familia"
              value={payload.incoterm_familia}
              onChange={(event) => updateField('incoterm_familia', event.target.value)}
              options={incotermFamilyOptions.map((value) => ({ label: value, value }))}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <Input
              label="Contenedores"
              type="number"
              min="0"
              step="1"
              value={payload.contenedores}
              onChange={(event) => updateField('contenedores', Number(event.target.value))}
            />
            <Input
              label="Bultos"
              type="number"
              min="0"
              step="1"
              value={payload.bultos}
              onChange={(event) => updateField('bultos', Number(event.target.value))}
            />
            <Input
              label="Peso (kg)"
              type="number"
              min="0"
              step="0.01"
              value={payload.peso_kg}
              onChange={(event) => updateField('peso_kg', Number(event.target.value))}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Fecha ETA"
              type="date"
              value={payload.fecha_eta ?? ''}
              onChange={(event) => updateField('fecha_eta', event.target.value || undefined)}
            />
            <Input
              label="Proyecto"
              value={payload.proyecto ?? ''}
              onChange={(event) => updateField('proyecto', event.target.value || undefined)}
            />
          </div>
          <SelectField
            label="Modelo para predecir"
            value={payload.modelo_id ?? ''}
            onChange={(event) => handleModelSelection(event.target.value)}
            options={[
              { label: 'Modelo principal automatico', value: '' },
              ...selectableModels.map((model) => ({
                label: `${modelRank(model) ? `Top ${modelRank(model)} - ` : ''}${model.nombre}`,
                value: model.id,
              })),
            ]}
            disabled={selectableModels.length === 0}
          />
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

        <Card title="Comparacion de modelos - Top 3">
          <DataTable
            data={modelRows}
            emptyText="No hay modelos de costo disponibles."
            columns={[
              {
                header: 'Modelo',
                render: (item) => {
                  const nombre = isPredictionResult(item) ? item.modelo_nombre : item.nombre
                  const principal = item.principal
                  const seleccionado = isPredictionResult(item) ? item.seleccionado : item.id === payload.modelo_id
                  return (
                    <div className="space-y-1">
                      <p className="font-semibold">{nombre}</p>
                      <div className="flex flex-wrap gap-1">
                        {principal && <Badge tone="indigo">Principal</Badge>}
                        {seleccionado && <Badge tone="emerald">Elegido</Badge>}
                      </div>
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
              {
                header: 'Accion',
                render: (item) => {
                  const id = modelId(item)
                  const selected = id === payload.modelo_id
                  return (
                    <Button
                      type="button"
                      variant="secondary"
                      className="min-h-8 px-3 text-xs"
                      disabled={selected}
                      onClick={() => handleModelSelection(id)}
                    >
                      {selected ? 'Elegido' : 'Usar'}
                    </Button>
                  )
                },
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
