import { apiClient } from './client'
import type { MotorSummary } from './types'

export async function getMotorSummary() {
  const response = await apiClient.get<MotorSummary>('/motor/resumen')
  return response.data
}
