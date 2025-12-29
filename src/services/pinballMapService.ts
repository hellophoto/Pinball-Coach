import type { PinballMapLocation, PinballMapMachine } from '../types';
import { getCache, setCache, clearCache } from '../utils/cache';

const PINBALL_MAP_API_BASE = 'https://pinballmap.com/api/v1';
const CACHE_KEY_PREFIX = 'pinball-coach-pinballmap';

// API Response types
interface PinballMapLocationResponse {
  id: number;
  name: string;
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  lat?: number;
  lon?: number;
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
  searchType?: 'geolocation' | 'region' | 'city';
  searchParams?: {
    lat?: number;
    lon?: number;
    region?: string;
    city?: string;
  };
}

// Region mapping for state abbreviations
const STATE_TO_REGION_MAP: Record<string, string> = {
  'OR': 'portland',
  'WA': 'seattle',
  'CA': 'la',
  'NY': 'nyc',
  'IL': 'chicago',
  'TX': 'austin',
  'CO': 'denver',
  'PA': 'philly',
  'MA': 'boston',
  'GA': 'atlanta',
  'MI': 'detroit',
  'MN': 'minneapolis',
  'AZ': 'phoenix',
  'FL': 'tampa',
  'NC': 'charlotte',
  'OH': 'cleveland',
  'TN': 'nashville',
  'MO': 'stlouis',
};

/**
 * Get region from state abbreviation
 */
export const getRegionFromState = (state: string): string | null => {
  const upperState = state.toUpperCase().trim();
  return STATE_TO_REGION_MAP[upperState] || null;
};

/**
 * Calculate distance between two points using Haversine formula
 * @param lat1 Latitude of point 1
 * @param lon1 Longitude of point 1
 * @param lat2 Latitude of point 2
 * @param lon2 Longitude of point 2
 * @returns Distance in miles
 */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 3959; // Earth's radius in miles
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const toRadians = (degrees: number): number => {
  return (degrees * Math.PI) / 180;
};

/**
 * Get current location from browser geolocation API
 * @returns Promise with latitude and longitude
 */
export const getCurrentLocation = (): Promise<{ lat: number; lon: number }> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
      },
      (error) => {
        let errorMessage = 'Unable to get your location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied. Please enable location permissions in your browser settings.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable. Please check your device settings.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out. Please try again.';
            break;
        }
        reject(new Error(errorMessage));
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  });
};

/**
 * Fetch locations by latitude and longitude
 * @param lat Latitude
 * @param lon Longitude
 * @param maxDistance Maximum distance in miles
 */
export const fetchLocationsByLatLon = async (
  lat: number,
  lon: number,
  maxDistance: number = 25
): Promise<PinballMapLocation[]> => {
  try {
    const params = new URLSearchParams({
      lat: lat.toString(),
      lon: lon.toString(),
      max_distance: maxDistance.toString(),
    });

    const url = `${PINBALL_MAP_API_BASE}/locations/closest_by_lat_lon.json?${params.toString()}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Pinball Map API error: ${response.status} ${response.statusText}`);
    }
    
    const data: { locations?: PinballMapLocationResponse[] } = await response.json();
    
    if (!data.locations || !Array.isArray(data.locations)) {
      return [];
    }
    
    // Transform and calculate distances
    const locations: PinballMapLocation[] = data.locations.map(loc => {
      const machines: PinballMapMachine[] = (loc.location_machine_xrefs || []).map(xref => ({
        id: xref.machine.id,
        name: xref.machine.name,
      }));
      
      const distance = loc.lat && loc.lon 
        ? calculateDistance(lat, lon, loc.lat, loc.lon)
        : undefined;
      
      return {
        id: loc.id,
        name: loc.name,
        street: loc.street || '',
        city: loc.city || '',
        state: loc.state || '',
        zip: loc.zip || '',
        lat: loc.lat,
        lon: loc.lon,
        machines,
        distance,
      };
    });
    
    // Sort by distance
    return locations.sort((a, b) => {
      if (a.distance === undefined) return 1;
      if (b.distance === undefined) return -1;
      return a.distance - b.distance;
    });
  } catch (error) {
    console.error('Error fetching locations by lat/lon:', error);
    throw error;
  }
};

/**
 * Fetch locations by region
 * @param region Region name (e.g., "portland", "seattle")
 */
export const fetchLocationsByRegion = async (
  region: string
): Promise<PinballMapLocation[]> => {
  try {
    const url = `${PINBALL_MAP_API_BASE}/region/${encodeURIComponent(region)}/locations.json`;
    
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
        lat: loc.lat,
        lon: loc.lon,
        machines,
      };
    });
    
    return locations;
  } catch (error) {
    console.error('Error fetching locations by region:', error);
    throw error;
  }
};

/**
 * Fetch locations from Pinball Map API by city name
 * @param city - City name (e.g., "Portland")
 */
export const fetchPinballMapLocations = async (
  city?: string
): Promise<PinballMapLocation[]> => {
  try {
    // Build query parameters
    const params = new URLSearchParams();
    
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
        lat: loc.lat,
        lon: loc.lon,
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
 * Get cached Pinball Map locations or fetch from API with cascading fallback
 * @param city - City name for filtering locations
 * @param state - State for region lookup
 * @param radius - Search radius in miles (for geolocation)
 * @param forceRefresh - Force refresh cache
 * @param useGeolocation - Whether to try geolocation first
 * @param userLat - User's latitude (if already known)
 * @param userLon - User's longitude (if already known)
 * @returns Promise with locations and optional user coordinates
 */
export const getPinballMapLocations = async (
  city?: string,
  state?: string,
  radius: number = 25,
  forceRefresh: boolean = false,
  useGeolocation: boolean = false,
  userLat?: number,
  userLon?: number
): Promise<{
  locations: PinballMapLocation[];
  userCoordinates?: { lat: number; lon: number };
  searchType: 'geolocation' | 'region' | 'city' | 'cached';
  errorMessage?: string;
}> => {
  // Generate cache key based on search parameters
  const cacheKey = generateCacheKey(city, state, radius, useGeolocation, userLat, userLon);
  
  // Check cache first
  if (!forceRefresh) {
    const cached = getCache<PinballMapCache>(cacheKey);
    if (cached) {
      return {
        locations: cached.locations,
        userCoordinates: cached.searchParams?.lat && cached.searchParams?.lon
          ? { lat: cached.searchParams.lat, lon: cached.searchParams.lon }
          : undefined,
        searchType: 'cached',
      };
    }
  }
  
  let locations: PinballMapLocation[] = [];
  let searchType: 'geolocation' | 'region' | 'city' = 'city';
  let coordinates: { lat: number; lon: number } | undefined;
  const errorMessages: string[] = [];
  
  // Strategy 1: Try geolocation (if enabled)
  if (useGeolocation) {
    try {
      // Get coordinates
      if (userLat !== undefined && userLon !== undefined) {
        coordinates = { lat: userLat, lon: userLon };
      } else {
        coordinates = await getCurrentLocation();
      }
      
      // Fetch by coordinates
      locations = await fetchLocationsByLatLon(coordinates.lat, coordinates.lon, radius);
      searchType = 'geolocation';
      
      if (locations.length === 0) {
        errorMessages.push(`No venues found within ${radius} miles of your location. Try increasing your search radius in Settings.`);
      } else {
        // Success! Cache and return
        const cacheData: PinballMapCache = {
          locations,
          timestamp: Date.now(),
          searchType,
          searchParams: { lat: coordinates.lat, lon: coordinates.lon },
        };
        setCache(cacheKey, cacheData);
        
        return { locations, userCoordinates: coordinates, searchType };
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      errorMessages.push(errorMsg);
      console.warn('Geolocation failed, trying fallback methods:', errorMsg);
    }
  }
  
  // Strategy 2: Try region-based search (fallback)
  if (state && locations.length === 0) {
    const region = getRegionFromState(state);
    if (region) {
      try {
        locations = await fetchLocationsByRegion(region);
        searchType = 'region';
        
        if (locations.length === 0) {
          errorMessages.push(`No venues found in the ${region} region.`);
        } else {
          // Success! Cache and return
          const cacheData: PinballMapCache = {
            locations,
            timestamp: Date.now(),
            searchType,
            searchParams: { region },
          };
          setCache(cacheKey, cacheData);
          
          return { 
            locations, 
            userCoordinates: coordinates,
            searchType,
            errorMessage: errorMessages.length > 0 
              ? `Using region fallback. ${errorMessages.join(' ')}` 
              : undefined
          };
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        errorMessages.push(`Region search failed: ${errorMsg}`);
        console.warn('Region search failed, trying city search:', errorMsg);
      }
    }
  }
  
  // Strategy 3: Try city name search (final fallback)
  if (city && locations.length === 0) {
    try {
      locations = await fetchPinballMapLocations(city);
      searchType = 'city';
      
      if (locations.length === 0) {
        errorMessages.push(`No venues found for ${city}${state ? ', ' + state : ''}. Try a nearby larger city or use geolocation.`);
      } else {
        // Success! Cache and return
        const cacheData: PinballMapCache = {
          locations,
          timestamp: Date.now(),
          searchType,
          searchParams: { city },
        };
        setCache(cacheKey, cacheData);
        
        return { 
          locations, 
          userCoordinates: coordinates,
          searchType,
          errorMessage: errorMessages.length > 0 
            ? `Using city fallback. ${errorMessages.join(' ')}` 
            : undefined
        };
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      errorMessages.push(`City search failed: ${errorMsg}`);
      console.error('All search methods failed:', errorMsg);
    }
  }
  
  // If we got here and have no locations, check if we have cached data from previous search
  const fallbackCache = getCache<PinballMapCache>(cacheKey);
  if (fallbackCache && fallbackCache.locations.length > 0) {
    const cacheDate = new Date(fallbackCache.timestamp).toLocaleDateString();
    errorMessages.push(`Using cached data from ${cacheDate}.`);
    return {
      locations: fallbackCache.locations,
      userCoordinates: coordinates,
      searchType: 'cached',
      errorMessage: errorMessages.join(' '),
    };
  }
  
  // No locations found at all
  const finalError = errorMessages.length > 0
    ? errorMessages.join(' ')
    : 'Unable to fetch venues. Please check your location settings or try again later.';
  
  return {
    locations: [],
    userCoordinates: coordinates,
    searchType,
    errorMessage: finalError,
  };
};

/**
 * Generate cache key based on search parameters
 */
const generateCacheKey = (
  city?: string,
  state?: string,
  radius?: number,
  useGeolocation?: boolean,
  lat?: number,
  lon?: number
): string => {
  if (useGeolocation && lat !== undefined && lon !== undefined) {
    // Round to 2 decimal places for cache key (roughly ~1km precision)
    const roundedLat = Math.round(lat * 100) / 100;
    const roundedLon = Math.round(lon * 100) / 100;
    return `${CACHE_KEY_PREFIX}-geo-${roundedLat}-${roundedLon}-${radius}`;
  }
  
  if (state) {
    const region = getRegionFromState(state);
    if (region) {
      return `${CACHE_KEY_PREFIX}-region-${region}`;
    }
  }
  
  if (city) {
    return `${CACHE_KEY_PREFIX}-city-${city.toLowerCase().replace(/\s+/g, '-')}`;
  }
  
  return `${CACHE_KEY_PREFIX}-default`;
};

/**
 * Clear all Pinball Map caches
 */
export const clearPinballMapCache = (): void => {
  // Clear all cache keys that start with our prefix
  try {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(CACHE_KEY_PREFIX)) {
        clearCache(key);
      }
    });
  } catch (error) {
    console.error('Error clearing Pinball Map cache:', error);
  }
};

/**
 * Get the timestamp of the last Pinball Map cache update
 */
export const getPinballMapCacheTimestamp = (): number | null => {
  try {
    const keys = Object.keys(localStorage);
    let latestTimestamp: number | null = null;
    
    keys.forEach(key => {
      if (key.startsWith(CACHE_KEY_PREFIX)) {
        const cached = getCache<PinballMapCache>(key);
        if (cached && (!latestTimestamp || cached.timestamp > latestTimestamp)) {
          latestTimestamp = cached.timestamp;
        }
      }
    });
    
    return latestTimestamp;
  } catch (error) {
    console.error('Error getting cache timestamp:', error);
    return null;
  }
};
