import { useCallback, useState } from 'react'
import type { PredictionPayload } from '../api/types'

const initialPayload: PredictionPayload = {
  categoria: '',
  producto: '',
  origen: '',
  proveedor: '',
  incoterm: 'CIF',
  cantidad: 1,
  tipo_cambio: 3.78,
  fecha_estimada_arribo: '',
}

export function usePredictionForm() {
  const [payload, setPayload] = useState<PredictionPayload>(initialPayload)

  const updateField = useCallback(<K extends keyof PredictionPayload>(field: K, value: PredictionPayload[K]) => {
    setPayload((current) => ({ ...current, [field]: value }))
  }, [])

  const validate = useCallback(() => {
    if (!payload.categoria || !payload.producto || !payload.origen || !payload.proveedor) {
      return 'Completa categoria, producto, origen y proveedor.'
    }
    if (payload.cantidad <= 0 || payload.tipo_cambio <= 0) {
      return 'Cantidad y tipo de cambio deben ser mayores a cero.'
    }
    return null
  }, [payload])

  return { payload, updateField, validate }
}
