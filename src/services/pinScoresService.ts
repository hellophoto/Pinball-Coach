// PinScores API service
// Note: The exact PinScores API endpoint may need to be updated based on actual API documentation
// This implementation uses a placeholder structure that can be easily updated

const PINSCORES_API_BASE = 'https://pinscores.net/api';

interface PinScoresResponse {
  percentile?: number;
  rank?: number;
  total_scores?: number;
  // Other potential fields from the API
}

/**
 * Fetch percentile ranking from PinScores API
 * @param tableName - The name of the pinball table/machine
 * @param score - The score to look up
 * @returns Percentile (0-100) or null if unavailable
 */
export const fetchPercentile = async (
  tableName: string,
  score: number
): Promise<number | null> => {
  try {
    // Note: This endpoint structure is a placeholder and may need adjustment
    // based on actual PinScores API documentation
    // Common patterns might be:
    // - /api/percentile?machine={tableName}&score={score}
    // - /api/v1/scores/percentile?table={tableName}&score={score}
    
    const params = new URLSearchParams({
      machine: encodeURIComponent(tableName),
      score: score.toString(),
    });
    
    const url = `${PINSCORES_API_BASE}/percentile?${params.toString()}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      // If API returns 404 or other error, return null (graceful degradation)
      console.warn(`PinScores API returned ${response.status} for ${tableName}`);
      return null;
    }
    
    const data: PinScoresResponse = await response.json();
    
    // Extract percentile from response
    // The exact field name may vary based on actual API
    if (typeof data.percentile === 'number') {
      // Ensure percentile is between 0 and 100
      return Math.max(0, Math.min(100, data.percentile));
    }
    
    // Alternative: calculate percentile from rank and total
    if (typeof data.rank === 'number' && typeof data.total_scores === 'number' && data.total_scores > 0) {
      const percentile = ((data.total_scores - data.rank) / data.total_scores) * 100;
      return Math.max(0, Math.min(100, Math.round(percentile * 10) / 10));
    }
    
    return null;
  } catch (error) {
    // Gracefully handle API errors
    console.error('Error fetching percentile from PinScores:', error);
    return null;
  }
};

/**
 * Fetch percentile with timeout to prevent hanging
 */
export const fetchPercentileWithTimeout = async (
  tableName: string,
  score: number,
  timeoutMs: number = 5000
): Promise<number | null> => {
  try {
    const timeoutPromise = new Promise<null>((resolve) => {
      setTimeout(() => resolve(null), timeoutMs);
    });
    
    const fetchPromise = fetchPercentile(tableName, score);
    
    // Race between fetch and timeout
    const result = await Promise.race([fetchPromise, timeoutPromise]);
    return result;
  } catch (error) {
    console.error('Error fetching percentile with timeout:', error);
    return null;
  }
};
