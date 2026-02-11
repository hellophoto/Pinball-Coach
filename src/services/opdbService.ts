import { getCache, setCache, CACHE_EXPIRATION_MS } from '../utils/cache';
import type { OPDBMachine } from '../types';

const OPDB_URL = 'https://mp-data.sfo3.cdn.digitaloceanspaces.com/latest-opdb.json';
const CACHE_KEY = 'pinball-coach-opdb-cache';

/**
 * Fetch fresh OPDB data from the API
 */
export const fetchOPDBData = async (): Promise<OPDBMachine[]> => {
  try {
    const response = await fetch(OPDB_URL);
    
    if (!response.ok) {
      throw new Error(`OPDB API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Handle different JSON structures
    let machines: OPDBMachine[] = [];
    
    if (Array.isArray(data)) {
      // Data is an array of machines
      machines = data;
    } else if (data.machines && Array.isArray(data.machines)) {
      // Data has a machines property
      machines = data.machines;
    } else if (typeof data === 'object') {
      // Data is an object with IDs as keys
      machines = Object.values(data);
    }
    
    return machines;
  } catch (error) {
    console.error('Error fetching OPDB data:', error);
    throw error;
  }
};

/**
 * Get OPDB machines with caching
 * @param forceRefresh - Force refresh cache
 */
export const getOPDBMachines = async (forceRefresh: boolean = false): Promise<OPDBMachine[]> => {
  // Check cache first
  if (!forceRefresh) {
    const cached = getCache<OPDBMachine[]>(CACHE_KEY, CACHE_EXPIRATION_MS);
    if (cached) {
      return cached;
    }
  }
  
  // Fetch from API
  const machines = await fetchOPDBData();
  
  // Cache the results
  setCache(CACHE_KEY, machines);
  
  return machines;
};

/**
 * Search machines by name (fuzzy search)
 * @param machines - Array of OPDB machines
 * @param searchTerm - Search term
 */
export const searchMachinesByName = (machines: OPDBMachine[], searchTerm: string): OPDBMachine[] => {
  if (!searchTerm || searchTerm.length < 2) {
    return [];
  }
  
  const term = searchTerm.toLowerCase().trim();
  
  return machines.filter(machine => {
    // Search in name
    if (machine.name.toLowerCase().includes(term)) {
      return true;
    }
    
    // Search in short_name
    if (machine.short_name && machine.short_name.toLowerCase().includes(term)) {
      return true;
    }
    
    // Search in common_names
    if (machine.common_names && machine.common_names.length > 0) {
      return machine.common_names.some(name => name.toLowerCase().includes(term));
    }
    
    return false;
  });
};

/**
 * Get machine by exact name or ID match
 * @param machines - Array of OPDB machines
 * @param nameOrId - Machine name or OPDB ID
 */
export const getMachineByNameOrId = (machines: OPDBMachine[], nameOrId: string): OPDBMachine | null => {
  if (!nameOrId) {
    return null;
  }
  
  const term = nameOrId.trim();
  
  // Try exact match by opdb_id
  let machine = machines.find(m => m.opdb_id === term);
  if (machine) {
    return machine;
  }
  
  // Try exact match by name (case insensitive)
  const lowerTerm = term.toLowerCase();
  machine = machines.find(m => m.name.toLowerCase() === lowerTerm);
  if (machine) {
    return machine;
  }
  
  // Try exact match by short_name
  machine = machines.find(m => m.short_name && m.short_name.toLowerCase() === lowerTerm);
  if (machine) {
    return machine;
  }
  
  // Try exact match in common_names
  machine = machines.find(m => 
    m.common_names && m.common_names.some(name => name.toLowerCase() === lowerTerm)
  );
  
  return machine || null;
};

/**
 * Get unique manufacturers list
 * @param machines - Array of OPDB machines
 */
export const getManufacturers = (machines: OPDBMachine[]): string[] => {
  const manufacturers = new Set<string>();
  
  machines.forEach(machine => {
    if (machine.manufacturer) {
      manufacturers.add(machine.manufacturer);
    }
  });
  
  return Array.from(manufacturers).sort();
};

/**
 * Filter machines by manufacturer
 * @param machines - Array of OPDB machines
 * @param manufacturer - Manufacturer name
 */
export const filterByManufacturer = (machines: OPDBMachine[], manufacturer: string): OPDBMachine[] => {
  if (!manufacturer) {
    return machines;
  }
  
  return machines.filter(m => m.manufacturer === manufacturer);
};

/**
 * Filter machines by year range
 * @param machines - Array of OPDB machines
 * @param startYear - Start year (optional)
 * @param endYear - End year (optional)
 */
export const filterByYearRange = (
  machines: OPDBMachine[],
  startYear?: number,
  endYear?: number
): OPDBMachine[] => {
  return machines.filter(machine => {
    if (!machine.year) {
      return false;
    }
    
    if (startYear && machine.year < startYear) {
      return false;
    }
    
    if (endYear && machine.year > endYear) {
      return false;
    }
    
    return true;
  });
};

/**
 * Format machine details for display
 * @param machine - OPDB machine
 */
export const formatMachineDetails = (machine: OPDBMachine): string => {
  const parts: string[] = [];
  
  if (machine.manufacturer) {
    parts.push(machine.manufacturer);
  }
  
  if (machine.year) {
    parts.push(machine.year.toString());
  }
  
  if (machine.designer && machine.designer.length > 0) {
    parts.push(`Designer: ${machine.designer.join(', ')}`);
  }
  
  if (machine.production_count != null) {
    parts.push(`${machine.production_count.toLocaleString()} units`);
  }
  
  return parts.join(' • ');
};
