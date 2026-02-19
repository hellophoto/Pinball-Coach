import { addGame, getGames } from './supabaseUtils';
import { getSettings } from './supabaseUtils';

const IFPA_API_BASE = 'https://api.ifpapinball.com/v1';
const WIN_POSITION_THRESHOLD = 3; // Top 3 positions considered wins
const UNKNOWN_SCORE = 0; // IFPA API does not provide individual game scores

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

export const fetchIFPAResults = async (playerId: string): Promise<IFPAResult[]> => {
  try {
    // Use CORS proxy for browser requests
    const corsProxy = 'https://corsproxy.io/?';
    const apiUrl = `${IFPA_API_BASE}/player/${playerId}/results`;
    const response = await fetch(`${corsProxy}${encodeURIComponent(apiUrl)}`);
    
    if (!response.ok) {
      throw new Error(`IFPA API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
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
    // Get player ID from settings
    const settings = await getSettings();
    
    if (!settings.ifpaPlayerId) {
      result.errors.push('IFPA Player ID not set. Please add your player ID in Settings.');
      return result;
    }

    const ifpaResults = await fetchIFPAResults(settings.ifpaPlayerId);
    const existingGames = await getGames();
    
    // Create a set of existing IFPA game identifiers to avoid duplicates
    const existingIFPAGames = new Set(
      existingGames
        .filter(g => g.source === 'ifpa')
        .map(g => `${g.venue}-${g.table}-${g.timestamp}`)
    );

    for (const ifpaResult of ifpaResults) {
      try {
        const eventDate = new Date(ifpaResult.event_date);
        const timestamp = eventDate.getTime();
        
        const venue = ifpaResult.tournament_name || ifpaResult.event_name;
        const table = ifpaResult.machine_name || ifpaResult.event_name;
        
        const gameIdentifier = `${venue}-${table}-${timestamp}`;
        
        if (existingIFPAGames.has(gameIdentifier)) {
          result.skipped++;
          continue;
        }

        const isWin = ifpaResult.position <= WIN_POSITION_THRESHOLD;
        const gameType = 'competitive';
        const gameResult = isWin ? 'win' : 'loss';
        
        await addGame({
          venue,
          table,
          myScore: UNKNOWN_SCORE,
          opponentScore: UNKNOWN_SCORE,
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