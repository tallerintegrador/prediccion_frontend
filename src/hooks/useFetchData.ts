import { useEffect, useState } from 'react'

export function useFetchData<T>(loader: () => Promise<T>, reloadKey = '') {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function load() {
      await Promise.resolve()
      if (!active) return
      setLoading(true)
      setError(null)

      try {
        const value = await loader()
        if (active) setData(value)
      } catch (reason: unknown) {
        const message = reason instanceof Error ? reason.message : 'No se pudo cargar la informacion.'
        if (active) setError(message)
      } finally {
        if (active) setLoading(false)
      }
    }

    void load()

    return () => {
      active = false
    }
  }, [loader, reloadKey])

  return { data, loading, error }
}
