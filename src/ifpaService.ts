import { addGame, getGames } from './utils';

const IFPA_API_BASE = 'https://api.ifpapinball.com/v1';
// Default player ID - can be made configurable in future versions
const DEFAULT_PLAYER_ID = '130319';
const WIN_POSITION_THRESHOLD = 3; // Top 3 positions considered wins

export interface IFPAResult {
  tournament_id: number;
  tournament_name: string;
  event_name: string;
  event_date: string;
  country_name: string;
  country_code: string;
  position: number;
  total_players: number;
  machine_name?: string;
}

export interface IFPASyncResult {
  imported: number;
  skipped: number;
  errors: string[];
}

export const fetchIFPAResults = async (): Promise<IFPAResult[]> => {
  try {
    const response = await fetch(`${IFPA_API_BASE}/player/${DEFAULT_PLAYER_ID}/results`);
    
    if (!response.ok) {
      throw new Error(`IFPA API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // The IFPA API returns results in a specific format
    // Check if we have results array
    if (data && data.results && Array.isArray(data.results)) {
      return data.results;
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching IFPA results:', error);
    throw error;
  }
};

export const syncIFPAGames = async (): Promise<IFPASyncResult> => {
  const result: IFPASyncResult = {
    imported: 0,
    skipped: 0,
    errors: [],
  };

  try {
    const ifpaResults = await fetchIFPAResults();
    const existingGames = getGames();
    
    // Create a set of existing IFPA game identifiers to avoid duplicates
    const existingIFPAGames = new Set(
      existingGames
        .filter(g => g.source === 'ifpa')
        .map(g => `${g.venue}-${g.table}-${g.timestamp}`)
    );

    for (const ifpaResult of ifpaResults) {
      try {
        // Parse date to timestamp
        const eventDate = new Date(ifpaResult.event_date);
        const timestamp = eventDate.getTime();
        
        // Use tournament name as venue, machine name as table (or event name if no machine)
        const venue = ifpaResult.tournament_name || ifpaResult.event_name;
        const table = ifpaResult.machine_name || ifpaResult.event_name;
        
        // Create unique identifier
        const gameIdentifier = `${venue}-${table}-${timestamp}`;
        
        // Skip if already imported
        if (existingIFPAGames.has(gameIdentifier)) {
          result.skipped++;
          continue;
        }

        // Determine result based on position
        // Top positions are considered wins for motivation
        const isWin = ifpaResult.position <= WIN_POSITION_THRESHOLD;
        const gameType = 'competitive';
        const gameResult = isWin ? 'win' : 'loss';
        
        // Add game with IFPA source tag
        addGame({
          venue,
          table,
          myScore: 0, // IFPA doesn't provide scores in results
          opponentScore: 0,
          gameType,
          result: gameResult,
          notes: `IFPA Tournament: ${ifpaResult.tournament_name}\nPosition: ${ifpaResult.position}/${ifpaResult.total_players}\nDate: ${ifpaResult.event_date}`,
          source: 'ifpa',
        });
        
        result.imported++;
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        result.errors.push(`Error importing tournament ${ifpaResult.tournament_name}: ${errorMsg}`);
      }
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    result.errors.push(`Error fetching IFPA data: ${errorMsg}`);
  }

  return result;
};
