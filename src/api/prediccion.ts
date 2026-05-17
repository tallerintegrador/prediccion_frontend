import { apiClient } from './client'
import type { PredictionModelInfo, PredictionPayload, PredictionResponse } from './types'

export async function createPrediction(payload: PredictionPayload) {
  const response = await apiClient.post<PredictionResponse>('/prediccion/estimar', payload)
  return response.data
}

export async function getPredictionModels() {
  const response = await apiClient.get<PredictionModelInfo[]>('/prediccion/modelos')
  return response.data
}
