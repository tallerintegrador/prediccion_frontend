import { apiClient } from './client'
import type { HistoricalFilters, PaginatedShipments } from './types'

export type ShipmentFilters = {
  page?: number
  page_size?: number
  categoria?: string
  pais_origen?: string
  proveedor?: string
  fecha_desde?: string
  fecha_hasta?: string
}

export async function getHistoricalFilters() {
  const response = await apiClient.get<HistoricalFilters>('/historico/filtros')
  return response.data
}

export async function getShipments(filters: ShipmentFilters) {
  const response = await apiClient.get<PaginatedShipments>('/historico/despachos', {
    params: filters,
  })
  return response.data
}
