'use client'

import { useState, useEffect, useCallback } from 'react'

interface CacheEntry<T> {
  data: T
  timestamp: number
  expiry: number
}

class APICache {
  private cache = new Map<string, CacheEntry<any>>()
  private readonly DEFAULT_EXPIRY = 5 * 60 * 1000 // 5 minutes

  set<T>(key: string, data: T, expiry?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiry: expiry || this.DEFAULT_EXPIRY
    })
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    const now = Date.now()
    if (now - entry.timestamp > entry.expiry) {
      this.cache.delete(key)
      return null
    }

    return entry.data
  }

  invalidate(key: string): void {
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }
}

const apiCache = new APICache()

interface UseApiCacheOptions {
  expiry?: number
  revalidateOnFocus?: boolean
  revalidateInterval?: number
}

export function useApiCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: UseApiCacheOptions = {}
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const { expiry, revalidateOnFocus = true, revalidateInterval } = options

  const fetchData = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true)
      setError(null)

      // Check cache first unless force refresh
      if (!forceRefresh) {
        const cachedData = apiCache.get<T>(key)
        if (cachedData) {
          setData(cachedData)
          setLoading(false)
          return cachedData
        }
      }

      // Fetch fresh data
      const freshData = await fetcher()
      apiCache.set(key, freshData, expiry)
      setData(freshData)
      return freshData
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error')
      setError(error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [key, fetcher, expiry])

  const mutate = useCallback((newData: T) => {
    apiCache.set(key, newData, expiry)
    setData(newData)
  }, [key, expiry])

  const invalidate = useCallback(() => {
    apiCache.invalidate(key)
  }, [key])

  // Initial fetch
  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Revalidate on window focus
  useEffect(() => {
    if (!revalidateOnFocus) return

    const handleFocus = () => {
      fetchData()
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [fetchData, revalidateOnFocus])

  // Revalidate on interval
  useEffect(() => {
    if (!revalidateInterval) return

    const interval = setInterval(() => {
      fetchData()
    }, revalidateInterval)

    return () => clearInterval(interval)
  }, [fetchData, revalidateInterval])

  return {
    data,
    loading,
    error,
    mutate,
    invalidate,
    refetch: () => fetchData(true)
  }
}

// Specialized hooks for common API endpoints
export function usePenyediaData() {
  return useApiCache(
    'penyedia',
    async () => {
      const response = await fetch('/api/penyedia')
      if (!response.ok) throw new Error('Failed to fetch penyedia')
      return response.json()
    },
    { expiry: 10 * 60 * 1000 } // 10 minutes cache
  )
}

export function usePenilaianData() {
  return useApiCache(
    'penilaian',
    async () => {
      const response = await fetch('/api/penilaian')
      if (!response.ok) throw new Error('Failed to fetch penilaian')
      return response.json()
    },
    { expiry: 5 * 60 * 1000 } // 5 minutes cache
  )
}

export function usePPKData() {
  return useApiCache(
    'ppk',
    async () => {
      const response = await fetch('/api/ppk')
      if (!response.ok) throw new Error('Failed to fetch PPK')
      return response.json()
    },
    { expiry: 10 * 60 * 1000 } // 10 minutes cache
  )
}

export function useDashboardStats() {
  return useApiCache(
    'dashboard-stats',
    async () => {
      const [penyediaResponse, penilaianResponse, ppkResponse] = await Promise.all([
        fetch('/api/penyedia'),
        fetch('/api/penilaian'),
        fetch('/api/ppk')
      ])

      if (!penyediaResponse.ok || !penilaianResponse.ok || !ppkResponse.ok) {
        throw new Error('Failed to fetch dashboard data')
      }

      const [penyedia, penilaian, ppk] = await Promise.all([
        penyediaResponse.json(),
        penilaianResponse.json(),
        ppkResponse.json()
      ])

      return { penyedia, penilaian, ppk }
    },
    { expiry: 3 * 60 * 1000 } // 3 minutes cache for dashboard
  )
}
