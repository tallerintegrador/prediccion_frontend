import { apiClient } from './client'
import type { DashboardOverview } from './types'

export async function getDashboardOverview() {
  const response = await apiClient.get<DashboardOverview>('/dashboard/overview')
  return response.data
}
