import type { PinballMapLocation, PinballMapMachine } from '../types';
import { getCache, setCache, clearCache } from '../utils/cache';

const PINBALL_MAP_API_BASE = 'https://pinballmap.com/api/v1';
const CACHE_KEY = 'pinball-coach-pinballmap-cache';

// API Response types
interface PinballMapLocationResponse {
  id: number;
  name: string;
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  location_machine_xrefs?: Array<{
    id: number;
    machine: {
      id: number;
      name: string;
    };
  }>;
}

export interface PinballMapCache {
  locations: PinballMapLocation[];
  timestamp: number;
}

/**
 * Fetch locations from Pinball Map API
 * @param city - City name (e.g., "Portland")
 */
export const fetchPinballMapLocations = async (
  city?: string
  // state and radius parameters reserved for future filtering capabilities
): Promise<PinballMapLocation[]> => {
  try {
    // Build query parameters
    const params = new URLSearchParams();
    
    // Pinball Map API uses 'by_location_name' or 'by_city_id' for location filtering
    // For simplicity, we'll fetch all locations in a region and filter locally
    // In production, you'd want to use proper location IDs
    
    if (city) {
      params.append('by_city_name', city);
    }
    
    const url = `${PINBALL_MAP_API_BASE}/locations.json${params.toString() ? '?' + params.toString() : ''}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Pinball Map API error: ${response.status} ${response.statusText}`);
    }
    
    const data: { locations?: PinballMapLocationResponse[] } = await response.json();
    
    if (!data.locations || !Array.isArray(data.locations)) {
      return [];
    }
    
    // Transform API response to our format
    const locations: PinballMapLocation[] = data.locations.map(loc => {
      const machines: PinballMapMachine[] = (loc.location_machine_xrefs || []).map(xref => ({
        id: xref.machine.id,
        name: xref.machine.name,
      }));
      
      return {
        id: loc.id,
        name: loc.name,
        street: loc.street || '',
        city: loc.city || '',
        state: loc.state || '',
        zip: loc.zip || '',
        machines,
      };
    });
    
    return locations;
  } catch (error) {
    console.error('Error fetching Pinball Map locations:', error);
    throw error;
  }
};

/**
 * Get cached Pinball Map locations or fetch from API
 * @param city - City name for filtering locations
 * @param _state - State (reserved for future use)
 * @param _radius - Search radius (reserved for future use)
 * @param forceRefresh - Force refresh cache
 */
export const getPinballMapLocations = async (
  city?: string,
  _state?: string,
  _radius?: number,
  forceRefresh: boolean = false
): Promise<PinballMapLocation[]> => {
  // Check cache first
  if (!forceRefresh) {
    const cached = getCache<PinballMapCache>(CACHE_KEY);
    if (cached) {
      return cached.locations;
    }
  }
  
  // Fetch from API
  // Note: state and radius are accepted for future use but currently not passed to the API
  const locations = await fetchPinballMapLocations(city);
  
  // Cache the results
  const cacheData: PinballMapCache = {
    locations,
    timestamp: Date.now(),
  };
  setCache(CACHE_KEY, cacheData);
  
  return locations;
};

/**
 * Clear Pinball Map cache
 */
export const clearPinballMapCache = (): void => {
  clearCache(CACHE_KEY);
};

/**
 * Get the timestamp of the last Pinball Map cache update
 */
export const getPinballMapCacheTimestamp = (): number | null => {
  const cached = getCache<PinballMapCache>(CACHE_KEY);
  return cached ? cached.timestamp : null;
};
