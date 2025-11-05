/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef, useCallback } from 'react';

interface UseCachedApiOptions<T> {
  /** Cache key for localStorage */
  cacheKey: string;
  /** Function to fetch from API if not in cache */
  fetchFn: (...args: any[]) => Promise<T>;
  /** Expiry in ms (e.g. 10min=600000ms). 0 disables expiry. */
  expiry?: number;
  /** If you want debounce, supply the debounce wait (ms). Default 0 (no debounce) */
  debounceMs?: number;
  /** Args for the fetch function (e.g. search param). If changed, invalidates cache. */
  fetchArgs?: any[];
}

export function useCachedApi<T = any>({
  cacheKey,
  fetchFn,
  expiry = 600000, // default: 10 minutes
  debounceMs = 0,
  fetchArgs = [],
}: UseCachedApiOptions<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Use globalThis.setTimeout for browser compatibility (avoid NodeJS type issue)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const argsKey = JSON.stringify(fetchArgs);

  // Helper: read from cache
  const getCache = () => {
    try {
      const item = localStorage.getItem(cacheKey);
      if (!item) return null;
      const { ts, args, value } = JSON.parse(item);
      // Invalidate if fetchArgs have changed (e.g., search param)
      if (JSON.stringify(args) !== argsKey) return null;
      if (expiry > 0 && Date.now() - ts > expiry) return null;
      return value;
    } catch {
      return null;
    }
  };

  // Helper: write to cache
  const setCache = (val: T) => {
    localStorage.setItem(
      cacheKey,
      JSON.stringify({ ts: Date.now(), args: fetchArgs, value: val })
    );
  };

  // Helper: invalidate cache
  const invalidate = useCallback(() => {
    localStorage.removeItem(cacheKey);
    setData(null);
    setLoading(true);
  }, [cacheKey]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const value = await fetchFn(...fetchArgs);
      setData(value);
      setCache(value);
      setLoading(false);
    } catch (e: any) {
      setError(e?.message || 'Failed to fetch');
      setLoading(false);
    }
  }, [fetchFn, argsKey]);

  // Initial+on fetchArgs change: try cache, fetch if none
  useEffect(() => {
    // Debounce logic for search/filter
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setLoading(true);
    const cached = getCache();
    if (cached) {
      setData(cached);
      setLoading(false);
    } else {
      if (debounceMs > 0) {
        debounceRef.current = setTimeout(() => {
          fetchData();
        }, debounceMs);
      } else {
        fetchData();
      }
    }
    // eslint-disable-next-line
  }, [argsKey, cacheKey]);

  /** Manual refresh (ignores cache and refetches) */
  const refresh = useCallback(() => {
    invalidate();
    fetchData();
  }, [invalidate, fetchData]);

  return { data, loading, error, refresh, invalidate };
}
