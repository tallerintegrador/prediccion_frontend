import { apiClient } from './client'
import type { PredictionPayload, PredictionResponse } from './types'

export async function createPrediction(payload: PredictionPayload) {
  const response = await apiClient.post<PredictionResponse>('/prediccion/estimar', payload)
  return response.data
}
