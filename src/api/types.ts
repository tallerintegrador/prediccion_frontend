export type MonthlyCost = {
  mes: string
  costo_total_usd: number
}

export type CategoryDistribution = {
  categoria: string
  total: number
}

export type DashboardOverview = {
  resumen: {
    total_despachos: number
    costo_total_acumulado_usd: number
    precision_actual: number | null
  }
  kpis: {
    despachos_anio: number
    costo_total_importado_anio_usd: number
    dias_bloqueo_sap: number | null
    precision_motor: number | null
  }
  costo_mensual: MonthlyCost[]
  distribucion_categoria: CategoryDistribution[]
  ultimos_reconciliados: ReconciledOperation[]
  proximas_estimaciones: UpcomingEstimation[]
}

export type UpcomingEstimation = {
  id: number
  producto: string
  proveedor: string
  pais_origen: string
  fecha_estimada_arribo: string | null
  costo_predicho_usd: number
}

export type ReconciledOperation = {
  id: number
  producto: string
  proveedor?: string
  pais_origen?: string
  incoterm?: string
  costo_predicho_usd: number
  costo_real_usd: number | null
  variacion_usd: number | null
  variacion_porcentaje: number | null
  reconciled_at?: string | null
}

export type HistoricalShipment = {
  id: number
  categoria: string
  producto: string
  pais_origen: string
  proveedor: string
  incoterm: string
  cantidad: number
  tipo_cambio: number
  costo_total_usd: number
  fecha_despacho: string
}

export type PaginatedShipments = {
  items: HistoricalShipment[]
  total: number
  page: number
  page_size: number
}

export type HistoricalFilters = {
  categorias: string[]
  paises: string[]
  proveedores: string[]
  periodos: string[]
}

export type PredictionPayload = {
  categoria: string
  producto: string
  origen: string
  proveedor: string
  incoterm: string
  cantidad: number
  tipo_cambio: number
  fecha_estimada_arribo?: string
}

export type CostBreakdown = {
  flete: number
  seguro: number
  aduana: number
  igv: number
  otros: number
}

export type PredictionModelInfo = {
  id: string
  nombre: string
  archivo: string
  tipo: string
  activo: boolean
  principal: boolean
  cargado: boolean
  error: string | null
  metricas: Record<string, unknown> | null
}

export type PredictionModelResult = {
  modelo_id: string
  modelo_nombre: string
  principal: boolean
  costo_predicho_usd: number | null
  desglose: CostBreakdown | null
  moneda: string
  error: string | null
}

export type PredictionResponse = {
  id: number | null
  modelo_principal: {
    id: string
    nombre: string
  } | null
  costo_predicho_usd: number | null
  desglose: CostBreakdown | null
  moneda: string
  resultados_modelos: PredictionModelResult[]
}

export type PreliquidationDetail = {
  id: number
  numero: string
  estado: string
  producto: string
  categoria: string
  proveedor: string
  pais_origen: string
  incoterm: string
  cantidad: number
  tipo_cambio: number
  fecha_estimada_arribo: string | null
  fecha_emision: string
  costo_predicho_usd: number
  costo_predicho_pen: number
  desglose: Array<{
    componente: string
    estimado_usd: number
    estimado_pen: number
    porcentaje_total: number
  }>
}

export type ReconciliationSummary = {
  kpis: {
    reconciliados_mes: number
    total_reconciliados: number
    variacion_promedio: number | null
    sin_variacion_significativa: number
    variacion_mayor_10: number
  }
  operaciones: ReconciledOperation[]
}

export type MotorSummary = {
  disponible: boolean
  metricas: {
    mae?: number | null
    mape?: number | null
    rmse?: number | null
    r2?: number | null
    precision?: number | null
  }
  precision_por_categoria: unknown[]
  evolucion_precision: unknown[]
  comparacion_baseline: unknown[]
}
