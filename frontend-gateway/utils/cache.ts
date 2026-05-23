// API response caching for performance

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

interface CacheStore {
  [key: string]: CacheEntry<any>;
}

const cache: CacheStore = {};

// Set cache entry with TTL (time to live in milliseconds)
export const setCache = <T>(key: string, data: T, ttl: number = 5000) => {
  cache[key] = {
    data,
    timestamp: Date.now(),
    ttl,
  };
};

// Get cache entry if valid
export const getCache = <T>(key: string): T | null => {
  const entry = cache[key];

  if (!entry) return null;

  const age = Date.now() - entry.timestamp;
  if (age > entry.ttl) {
    delete cache[key];
    return null;
  }

  return entry.data as T;
};

// Clear specific cache entry
export const clearCache = (key: string) => {
  delete cache[key];
};

// Clear all cache
export const clearAllCache = () => {
  Object.keys(cache).forEach((key) => delete cache[key]);
};

// Cached API fetch
export const cachedFetch = async <T>(
  url: string,
  ttl: number = 5000,
): Promise<T | null> => {
  const cached = getCache<T>(url);
  if (cached) return cached;

  try {
    const response = await fetch(url);
    if (!response.ok) return null;

    const data = (await response.json()) as T;
    setCache(url, data, ttl);
    return data;
  } catch {
    return null;
  }
};

// Batch requests with caching
export const batchCachedFetch = async <T>(
  urls: string[],
  ttl: number = 5000,
): Promise<(T | null)[]> => {
  return Promise.all(urls.map((url) => cachedFetch<T>(url, ttl)));
};
