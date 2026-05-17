import { apiClient, fileUrl } from './client'
import type { PreliquidationDetail } from './types'

export async function getPreliquidation(id?: string | null) {
  const path = id ? `/preliquidacion/${id}` : '/preliquidacion/ultima'
  const response = await apiClient.get<PreliquidationDetail>(path)
  return response.data
}

export function getPdfUrl(id: number) {
  return fileUrl(`/preliquidacion/exportar/pdf/${id}`)
}

export function getExcelUrl(id: number) {
  return fileUrl(`/preliquidacion/exportar/excel/${id}`)
}
