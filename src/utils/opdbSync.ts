import { getOPDBMachines } from '../services/opdbService';
import { getCache, setCache } from './cache';

const LAST_CHECK_KEY = 'opdb-last-check';
const CHECK_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Check if 24 hours have passed since last update and fetch if needed
 */
export const checkAndUpdateOPDB = async (): Promise<void> => {
  try {
    const lastCheck = getCache<number>(LAST_CHECK_KEY);
    const now = Date.now();
    
    // If never checked or 24 hours have passed, fetch new data
    if (!lastCheck || (now - lastCheck) >= CHECK_INTERVAL_MS) {
      console.log('OPDB: Fetching updated data...');
      await getOPDBMachines(true); // Force refresh
      setCache(LAST_CHECK_KEY, now);
      console.log('OPDB: Data updated successfully');
    } else {
      console.log('OPDB: Using cached data');
    }
  } catch (error) {
    console.error('OPDB: Error updating data:', error);
    // Fail silently - app should continue to work
  }
};

/**
 * Initialize OPDB sync on app start and set up daily interval
 * @returns A cleanup function to clear the interval
 */
export const initializeOPDBSync = (): (() => void) => {
  // Initial check on startup (no await - let it run in background)
  checkAndUpdateOPDB().catch(err => {
    console.error('OPDB: Initial sync failed:', err);
  });
  
  // Set up daily interval
  const intervalId = setInterval(() => {
    checkAndUpdateOPDB();
  }, CHECK_INTERVAL_MS);
  
  // Return cleanup function
  return () => {
    clearInterval(intervalId);
  };
};
