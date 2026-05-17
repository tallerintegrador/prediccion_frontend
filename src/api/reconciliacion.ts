import { apiClient } from './client'
import type { ReconciliationSummary } from './types'

export async function getReconciliationSummary() {
  const response = await apiClient.get<ReconciliationSummary>('/reconciliacion/resumen')
  return response.data
}
