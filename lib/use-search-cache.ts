import { useState, useEffect, useRef, useCallback } from 'react';

interface SearchCache {
  [key: string]: {
    data: any[];
    timestamp: number;
  };
}

interface UseSearchCacheOptions {
  cacheTimeout?: number; // in milliseconds
  debounceDelay?: number; // in milliseconds
}

export function useSearchCache(
  searchFunction: (query: string) => Promise<any[]>,
  options: UseSearchCacheOptions = {}
) {
  const { cacheTimeout = 5 * 60 * 1000, debounceDelay = 300 } = options; // 5 minutes default cache
  
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const cacheRef = useRef<SearchCache>({});
  const debounceRef = useRef<NodeJS.Timeout>();
  const abortControllerRef = useRef<AbortController>();

  const search = useCallback(async (query: string) => {
    // Clear previous timeout
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Abort previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    if (!query.trim()) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    // Check cache first
    const cacheKey = query.toLowerCase().trim();
    const cached = cacheRef.current[cacheKey];
    const now = Date.now();

    if (cached && (now - cached.timestamp) < cacheTimeout) {
      setResults(cached.data);
      setIsLoading(false);
      return;
    }

    // Debounce the search
    debounceRef.current = setTimeout(async () => {
      setIsLoading(true);
      setError(null);

      try {
        abortControllerRef.current = new AbortController();
        const data = await searchFunction(query);
        
        // Cache the results
        cacheRef.current[cacheKey] = {
          data,
          timestamp: now
        };

        setResults(data);
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          setError('Gagal mencari data');
          console.error('Search error:', err);
        }
      } finally {
        setIsLoading(false);
      }
    }, debounceDelay);
  }, [searchFunction, cacheTimeout, debounceDelay]);

  const clearCache = useCallback(() => {
    cacheRef.current = {};
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    results,
    isLoading,
    error,
    search,
    clearCache
  };
}
