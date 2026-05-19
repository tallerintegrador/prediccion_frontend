import { apiClient, fileUrl } from './client'
import type { PaginatedPreliquidations, PreliquidationDetail } from './types'

export async function getPreliquidation(id?: string | null) {
  const path = id ? `/preliquidacion/${id}` : '/preliquidacion/ultima'
  const response = await apiClient.get<PreliquidationDetail>(path)
  return response.data
}

export async function getPreliquidationHistory(page = 1, pageSize = 5) {
  const response = await apiClient.get<PaginatedPreliquidations>('/preliquidacion/historial', {
    params: { page, page_size: pageSize },
  })
  return response.data
}

export function getPdfUrl(id: number) {
  return fileUrl(`/preliquidacion/exportar/pdf/${id}`)
}

export function getExcelUrl(id: number) {
  return fileUrl(`/preliquidacion/exportar/excel/${id}`)
}
