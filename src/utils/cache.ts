export interface CacheData<T> {
  data: T;
  timestamp: number;
}

export const CACHE_EXPIRATION_MS = 24 * 60 * 60 * 1000; // 24 hours

export const setCache = <T>(key: string, data: T): void => {
  try {
    const cacheData: CacheData<T> = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(key, JSON.stringify(cacheData));
  } catch (error) {
    console.error(`Error setting cache for ${key}:`, error);
  }
};

export const getCache = <T>(key: string, expirationMs: number = CACHE_EXPIRATION_MS): T | null => {
  try {
    const cached = localStorage.getItem(key);
    if (!cached) return null;

    const cacheData: CacheData<T> = JSON.parse(cached);
    const now = Date.now();

    // Check if cache is expired
    if (now - cacheData.timestamp > expirationMs) {
      localStorage.removeItem(key);
      return null;
    }

    return cacheData.data;
  } catch (error) {
    console.error(`Error getting cache for ${key}:`, error);
    return null;
  }
};

export const clearCache = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error clearing cache for ${key}:`, error);
  }
};
