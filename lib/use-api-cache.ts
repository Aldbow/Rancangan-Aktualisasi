'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

interface CacheEntry<T> {
  data: T
  timestamp: number
  expiry: number
  compressed?: boolean
  size?: number
}

class APICache {
  private cache = new Map<string, CacheEntry<any>>()
  private readonly DEFAULT_EXPIRY = 5 * 60 * 1000 // 5 minutes
  private readonly MAX_CACHE_SIZE = 50 // Maximum number of entries
  private readonly COMPRESSION_THRESHOLD = 1024 // Compress data larger than 1KB

  private compress(data: any): string {
    try {
      return JSON.stringify(data)
    } catch {
      return String(data)
    }
  }

  private decompress(data: string): any {
    try {
      return JSON.parse(data)
    } catch {
      return data
    }
  }

  private getDataSize(data: any): number {
    try {
      return new Blob([JSON.stringify(data)]).size
    } catch {
      return 0
    }
  }

  private evictOldEntries(): void {
    if (this.cache.size <= this.MAX_CACHE_SIZE) return

    const entries = Array.from(this.cache.entries())
    entries.sort(([, a], [, b]) => a.timestamp - b.timestamp)
    
    // Remove oldest entries
    const toRemove = entries.slice(0, this.cache.size - this.MAX_CACHE_SIZE)
    toRemove.forEach(([key]) => this.cache.delete(key))
  }

  set<T>(key: string, data: T, expiry?: number): void {
    const size = this.getDataSize(data)
    const shouldCompress = size > this.COMPRESSION_THRESHOLD
    
    const entry: CacheEntry<T> = {
      data: shouldCompress ? this.compress(data) as T : data,
      timestamp: Date.now(),
      expiry: expiry || this.DEFAULT_EXPIRY,
      compressed: shouldCompress,
      size
    }

    this.cache.set(key, entry)
    this.evictOldEntries()
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    const now = Date.now()
    if (now - entry.timestamp > entry.expiry) {
      this.cache.delete(key)
      return null
    }

    // Update timestamp for LRU behavior
    entry.timestamp = now
    this.cache.set(key, entry)

    return entry.compressed ? this.decompress(entry.data as string) : entry.data
  }

  invalidate(key: string): void {
    this.cache.delete(key)
  }

  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern)
    const keysToDelete = Array.from(this.cache.keys()).filter(key => regex.test(key))
    keysToDelete.forEach(key => this.cache.delete(key))
  }

  clear(): void {
    this.cache.clear()
  }

  getStats() {
    const entries = Array.from(this.cache.values())
    const totalSize = entries.reduce((sum, entry) => sum + (entry.size || 0), 0)
    const compressedEntries = entries.filter(entry => entry.compressed).length
    
    return {
      totalEntries: this.cache.size,
      totalSize,
      compressedEntries,
      compressionRatio: compressedEntries / this.cache.size
    }
  }
}

const apiCache = new APICache()

interface UseApiCacheOptions {
  expiry?: number
  revalidateOnFocus?: boolean
  revalidateInterval?: number
  dedupingInterval?: number
  errorRetryCount?: number
  errorRetryInterval?: number
}

export function useApiCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: UseApiCacheOptions = {}
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const { 
    expiry, 
    revalidateOnFocus = true, 
    revalidateInterval,
    dedupingInterval = 2000,
    errorRetryCount = 3,
    errorRetryInterval = 1000
  } = options

  const fetchingRef = useRef<Promise<T> | null>(null)
  const retryCountRef = useRef(0)
  const mountedRef = useRef(true)

  const fetchData = useCallback(async (forceRefresh = false): Promise<T | null> => {
    // Don't update state if component is unmounted
    if (!mountedRef.current) return null

    try {
      // Only set error to null if we're not already loading to prevent unnecessary re-renders
      if (error) {
        setError(null)
      }

      // Deduping: if already fetching, return the same promise
      if (fetchingRef.current && !forceRefresh) {
        return await fetchingRef.current
      }

      // Check cache first unless force refresh
      if (!forceRefresh) {
        const cachedData = apiCache.get<T>(key)
        if (cachedData) {
          if (mountedRef.current) {
            setData(cachedData)
            setLoading(false)
          }
          return cachedData
        }
      }

      if (mountedRef.current) {
        setLoading(true)
      }

      // Create and store the fetch promise
      const fetchPromise = fetcher()
      fetchingRef.current = fetchPromise

      const freshData = await fetchPromise
      
      // Clear the fetching promise
      fetchingRef.current = null
      retryCountRef.current = 0

      if (mountedRef.current) {
        apiCache.set(key, freshData, expiry)
        setData(freshData)
      }
      return freshData
    } catch (err) {
      fetchingRef.current = null
      const errorObj = err instanceof Error ? err : new Error('Unknown error')
      
      // Retry logic
      if (retryCountRef.current < errorRetryCount && mountedRef.current) {
        retryCountRef.current++
        setTimeout(() => {
          if (mountedRef.current) {
            fetchData(forceRefresh)
          }
        }, errorRetryInterval * retryCountRef.current)
        return null
      }

      if (mountedRef.current) {
        setError(errorObj)
      }
      throw errorObj
    } finally {
      if (mountedRef.current) {
        setLoading(false)
      }
    }
  }, [key, fetcher, expiry, errorRetryCount, errorRetryInterval])

  const mutate = useCallback((newData: T) => {
    if (mountedRef.current) {
      apiCache.set(key, newData, expiry)
      setData(newData)
    }
  }, [key, expiry])

  const invalidate = useCallback(() => {
    apiCache.invalidate(key)
  }, [key])

  // Track component mount status
  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  // Initial fetch - only run once on mount
  useEffect(() => {
    let cancelled = false
    
    const initialFetch = async () => {
      if (!cancelled) {
        await fetchData()
      }
    }
    
    initialFetch()
    
    return () => {
      cancelled = true
    }
  }, [key]) // Only depend on key, not fetchData

  // Revalidate on window focus
  useEffect(() => {
    if (!revalidateOnFocus) return

    const handleFocus = () => {
      // Only revalidate if data is stale
      const cachedData = apiCache.get<T>(key)
      if (!cachedData && mountedRef.current) {
        fetchData()
      }
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [key, revalidateOnFocus, fetchData])

  // Revalidate on interval
  useEffect(() => {
    if (!revalidateInterval) return

    const interval = setInterval(() => {
      if (mountedRef.current) {
        fetchData()
      }
    }, revalidateInterval)

    return () => clearInterval(interval)
  }, [key, revalidateInterval, fetchData])

  return {
    data,
    loading,
    error,
    mutate,
    invalidate,
    refetch: useCallback(() => fetchData(true), [fetchData])
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
    { 
      expiry: 10 * 60 * 1000, // 10 minutes cache
      errorRetryCount: 2
    }
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
    { 
      expiry: 5 * 60 * 1000, // 5 minutes cache
      errorRetryCount: 2
    }
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
    { 
      expiry: 10 * 60 * 1000, // 10 minutes cache
      errorRetryCount: 2
    }
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
    { 
      expiry: 3 * 60 * 1000, // 3 minutes cache for dashboard
      revalidateInterval: 5 * 60 * 1000, // Auto-refresh every 5 minutes
      errorRetryCount: 3
    }
  )
}

// Export cache instance for debugging
export { apiCache }
