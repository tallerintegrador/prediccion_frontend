import axios from 'axios'

type ApiErrorPayload = {
  detail?: string
  message?: string
}

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error)) {
      const payload = error.response?.data as ApiErrorPayload | undefined
      const detail = payload?.detail ?? payload?.message
      if (detail) {
        return Promise.reject(new Error(detail))
      }
    }
    return Promise.reject(error)
  },
)

export function fileUrl(path: string) {
  const baseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api'
  return `${baseUrl}${path}`
}
