import { useCallback, useState } from 'react'
import type { PredictionPayload } from '../api/types'

const initialPayload: PredictionPayload = {
  id_despacho: 'DEMO-AIR-001',
  proveedor_servicio: 'AIRSEALOG',
  proveedor_principal: 'DUNAVANT',
  agencia_aduana: 'AVM ADUANERA',
  pol: 'SANTIAGO',
  pod: 'CALLAO',
  modalidad: 'AIR / AIR',
  incoterm_familia: 'GRUPO_E',
  contenedores: 0,
  bultos: 12,
  peso_kg: 480,
  fecha_eta: '2026-10-03',
  proyecto: 'PROJ-2026-007',
}

export function usePredictionForm() {
  const [payload, setPayload] = useState<PredictionPayload>(initialPayload)

  const updateField = useCallback(<K extends keyof PredictionPayload>(field: K, value: PredictionPayload[K]) => {
    setPayload((current) => ({ ...current, [field]: value }))
  }, [])

  const validate = useCallback(() => {
    if (
      !payload.id_despacho ||
      !payload.proveedor_servicio ||
      !payload.proveedor_principal ||
      !payload.agencia_aduana ||
      !payload.pol ||
      !payload.pod ||
      !payload.modalidad ||
      !payload.incoterm_familia
    ) {
      return 'Completa los datos principales del despacho.'
    }
    if (payload.contenedores < 0 || payload.bultos < 0 || payload.peso_kg <= 0) {
      return 'Contenedores y bultos no pueden ser negativos; el peso debe ser mayor a cero.'
    }
    return null
  }, [payload])

  return { payload, updateField, validate }
}
