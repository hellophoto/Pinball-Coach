import { supabase } from './supabaseClient';
import type { Game, TableStrategy, Settings, PracticeSession, OPDBMachine } from './types';

// ============================================================
// HELPER: get current user id
// ============================================================
const getUserId = async (): Promise<string> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user?.id) throw new Error('Not authenticated');
  return session.user.id;
};

// ============================================================
// GAMES
// ============================================================
export const getGames = async (): Promise<Game[]> => {
  const userId = await getUserId();
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .eq('user_id', userId)
    .order('timestamp', { ascending: false });

  if (error) {
    console.error('Error loading games:', error);
    return [];
  }

  return (data || []).map(row => ({
    id: row.id,
    venue: row.venue,
    table: row.table_name,
    opdb_id: row.opdb_id,
    myScore: row.my_score,
    opponentScore: row.opponent_score,
    gameType: row.game_type,
    result: row.result,
    notes: row.notes,
    timestamp: new Date(row.timestamp).getTime(),
    source: row.source,
    percentile: row.percentile,
  }));
};

export const addGame = async (game: Omit<Game, 'id' | 'timestamp'>): Promise<Game> => {
  const userId = await getUserId();
  const { data, error } = await supabase
    .from('games')
    .insert({
      user_id: userId,
      venue: game.venue,
      table_name: game.table,
      opdb_id: game.opdb_id,
      my_score: game.myScore,
      opponent_score: game.opponentScore,
      game_type: game.gameType,
      result: game.result,
      notes: game.notes,
      source: game.source || 'manual',
      percentile: game.percentile,
      timestamp: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to save game: ${error.message}`);

  return {
    id: data.id,
    venue: data.venue,
    table: data.table_name,
    opdb_id: data.opdb_id,
    myScore: data.my_score,
    opponentScore: data.opponent_score,
    gameType: data.game_type,
    result: data.result,
    notes: data.notes,
    timestamp: new Date(data.timestamp).getTime(),
    source: data.source,
    percentile: data.percentile,
  };
};

export const updateGame = async (
  id: string,
  updates: Partial<Omit<Game, 'id' | 'timestamp'>>
): Promise<Game | null> => {
  const userId = await getUserId();
  const { data, error } = await supabase
    .from('games')
    .update({
      venue: updates.venue,
      table_name: updates.table,
      opdb_id: updates.opdb_id,
      my_score: updates.myScore,
      opponent_score: updates.opponentScore,
      game_type: updates.gameType,
      result: updates.result,
      notes: updates.notes,
      percentile: updates.percentile,
    })
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating game:', error);
    return null;
  }

  return {
    id: data.id,
    venue: data.venue,
    table: data.table_name,
    opdb_id: data.opdb_id,
    myScore: data.my_score,
    opponentScore: data.opponent_score,
    gameType: data.game_type,
    result: data.result,
    notes: data.notes,
    timestamp: new Date(data.timestamp).getTime(),
    source: data.source,
    percentile: data.percentile,
  };
};

export const getGame = async (id: string): Promise<Game | undefined> => {
  const userId = await getUserId();
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single();

  if (error || !data) return undefined;

  return {
    id: data.id,
    venue: data.venue,
    table: data.table_name,
    opdb_id: data.opdb_id,
    myScore: data.my_score,
    opponentScore: data.opponent_score,
    gameType: data.game_type,
    result: data.result,
    notes: data.notes,
    timestamp: new Date(data.timestamp).getTime(),
    source: data.source,
    percentile: data.percentile,
  };
};

export const deleteGame = async (id: string): Promise<void> => {
  const userId = await getUserId();
  const { error } = await supabase
    .from('games')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) console.error('Error deleting game:', error);
};

export const updateGamePercentile = async (id: string, percentile: number): Promise<void> => {
  const userId = await getUserId();
  const { error } = await supabase
    .from('games')
    .update({ percentile })
    .eq('id', id)
    .eq('user_id', userId);

  if (error) console.error('Error updating percentile:', error);
};

// ============================================================
// STRATEGIES
// ============================================================
export const getTableStrategies = async (): Promise<Record<string, TableStrategy>> => {
  const userId = await getUserId();
  const { data, error } = await supabase
    .from('strategies')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error('Error loading strategies:', error);
    return {};
  }

  return (data || []).reduce((acc, row) => {
    acc[row.table_name] = {
      table: row.table_name,
      skillShot: row.skill_shot,
      modes: row.modes,
      multiballs: row.multiballs,
      tips: row.tips,
    };
    return acc;
  }, {} as Record<string, TableStrategy>);
};

export const getTableStrategy = async (tableName: string): Promise<TableStrategy | undefined> => {
  const userId = await getUserId();
  const { data, error } = await supabase
    .from('strategies')
    .select('*')
    .eq('user_id', userId)
    .eq('table_name', tableName)
    .maybeSingle();

  if (error || !data) return undefined;

  return {
    table: data.table_name,
    skillShot: data.skill_shot,
    modes: data.modes,
    multiballs: data.multiballs,
    tips: data.tips,
  };
};

export const saveTableStrategy = async (strategy: TableStrategy): Promise<void> => {
  const userId = await getUserId();
  const { error } = await supabase
    .from('strategies')
    .upsert({
      user_id: userId,
      table_name: strategy.table,
      skill_shot: strategy.skillShot,
      modes: strategy.modes,
      multiballs: strategy.multiballs,
      tips: strategy.tips,
    }, { onConflict: 'user_id,table_name' });

  if (error) console.error('Error saving strategy:', error);
};

export const deleteTableStrategy = async (tableName: string): Promise<void> => {
  const userId = await getUserId();
  const { error } = await supabase
    .from('strategies')
    .delete()
    .eq('user_id', userId)
    .eq('table_name', tableName);

  if (error) console.error('Error deleting strategy:', error);
};

// ============================================================
// SETTINGS
// ============================================================
const DEFAULT_SETTINGS: Settings = {
  location: { city: 'Portland', state: 'OR', radius: 25 },
  ifpaPlayerId: undefined, // ADD THIS LINE
};

export const getSettings = async (): Promise<Settings> => {
  const userId = await getUserId();
  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error || !data) return DEFAULT_SETTINGS;

  return {
    location: {
      city: data.city || 'Portland',
      state: data.state || 'OR',
      radius: data.radius || 25,
      useGeolocation: data.use_geolocation,
      lastKnownLat: data.last_known_lat,
      lastKnownLon: data.last_known_lon,
      region: data.region,
    },
    pinballMapLastUpdated: data.pinball_map_last_updated
      ? new Date(data.pinball_map_last_updated).getTime()
      : undefined,
    ifpaPlayerId: data.ifpa_player_id, // ADD THIS LINE
  };
};

export const saveSettings = async (settings: Settings): Promise<void> => {
  const userId = await getUserId();
  const { error } = await supabase
    .from('settings')
    .upsert({
      user_id: userId,
      city: settings.location.city,
      state: settings.location.state,
      radius: settings.location.radius,
      use_geolocation: settings.location.useGeolocation,
      last_known_lat: settings.location.lastKnownLat,
      last_known_lon: settings.location.lastKnownLon,
      region: settings.location.region,
      pinball_map_last_updated: settings.pinballMapLastUpdated
        ? new Date(settings.pinballMapLastUpdated).toISOString()
        : null,
      ifpa_player_id: settings.ifpaPlayerId, // ADD THIS LINE
    }, { onConflict: 'user_id' });

  if (error) console.error('Error saving settings:', error);
};
// Practice Sessions
export const createPracticeSession = async (venue: string): Promise<PracticeSession> => {
  const userId = await getUserId();
  const now = new Date().toISOString();
  
  const { data, error } = await supabase
    .from('practice_sessions')
    .insert({
      user_id: userId,
      venue,
      start_time: now,
      status: 'active',
      games: [],
    })
    .select()
    .single();

  if (error || !data) throw new Error('Failed to create practice session');

  return {
    id: data.id,
    venue: data.venue,
    startTime: new Date(data.start_time).getTime(),
    endTime: data.end_time ? new Date(data.end_time).getTime() : undefined,
    status: data.status,
    games: data.games,
  };
};

export const updatePracticeSession = async (
  sessionId: string,
  games: PracticeSession['games']
): Promise<void> => {
  const { error } = await supabase
    .from('practice_sessions')
    .update({ games })
    .eq('id', sessionId);

  if (error) throw new Error('Failed to update practice session');
};

export const endPracticeSession = async (sessionId: string): Promise<void> => {
  const now = new Date().toISOString();
  
  const { error } = await supabase
    .from('practice_sessions')
    .update({
      status: 'completed',
      end_time: now,
    })
    .eq('id', sessionId);

  if (error) throw new Error('Failed to end practice session');
};

export const getActiveSession = async (): Promise<PracticeSession | null> => {
  const userId = await getUserId();
  
  const { data, error } = await supabase
    .from('practice_sessions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('start_time', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;

  return {
    id: data.id,
    venue: data.venue,
    startTime: new Date(data.start_time).getTime(),
    endTime: data.end_time ? new Date(data.end_time).getTime() : undefined,
    status: data.status,
    games: data.games,
  };
};

export const getPracticeSessions = async (): Promise<PracticeSession[]> => {
  const userId = await getUserId();
  
  const { data, error } = await supabase
    .from('practice_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('start_time', { ascending: false });

  if (error || !data) return [];

  return data.map(row => ({
    id: row.id,
    venue: row.venue,
    startTime: new Date(row.start_time).getTime(),
    endTime: row.end_time ? new Date(row.end_time).getTime() : undefined,
    status: row.status,
    games: row.games,
  }));
};
// Recommendation Engine
export const getRecommendations = async (): Promise<OPDBMachine[]> => {
  try {
    const [games, opdbMachines] = await Promise.all([
      getGames(),
      import('./services/opdbService').then(m => m.getOPDBMachines())
    ]);

    if (games.length === 0 || opdbMachines.length === 0) {
      return [];
    }

    // Get user's played tables
    const playedTables = new Set(games.map(g => g.table.toLowerCase()));
    
    // Get OPDB IDs for played games
    const playedOPDBIds = new Set(
      games
        .filter(g => g.opdb_id)
        .map(g => g.opdb_id!)
    );

    // Build user profile from played games
    const userProfile = {
      designers: new Map<string, number>(),
      manufacturers: new Map<string, number>(),
      themes: new Map<string, number>(),
      years: new Map<number, number>(),
      complexitySum: 0,
      complexityCount: 0,
    };

    // Analyze played games
    games.forEach(game => {
      const machine = opdbMachines.find(m => 
        m.name.toLowerCase() === game.table.toLowerCase() ||
        m.opdb_id === game.opdb_id
      );

      if (!machine) return;

      // Track designers
      machine.designer?.forEach(designer => {
        userProfile.designers.set(designer, (userProfile.designers.get(designer) || 0) + 1);
      });

      // Track manufacturers
      if (machine.manufacturer) {
        userProfile.manufacturers.set(
          machine.manufacturer, 
          (userProfile.manufacturers.get(machine.manufacturer) || 0) + 1
        );
      }

      // Track themes
      machine.theme?.forEach(theme => {
        userProfile.themes.set(theme, (userProfile.themes.get(theme) || 0) + 1);
      });

      // Track years
      if (machine.year) {
        userProfile.years.set(machine.year, (userProfile.years.get(machine.year) || 0) + 1);
      }

      // Track complexity
      if (machine.gameplay_complexity || machine.rule_complexity) {
        const avgComplexity = (
          (machine.gameplay_complexity || 0) + 
          (machine.rule_complexity || 0)
        ) / 2;
        userProfile.complexitySum += avgComplexity;
        userProfile.complexityCount++;
      }
    });

    const avgComplexity = userProfile.complexityCount > 0 
      ? userProfile.complexitySum / userProfile.complexityCount 
      : 5;

    // Score each unplayed machine
    const recommendations = opdbMachines
      .filter(machine => {
        // Filter out played machines
        if (playedOPDBIds.has(machine.opdb_id)) return false;
        if (playedTables.has(machine.name.toLowerCase())) return false;
        return true;
      })
      .map(machine => {
        let score = 0;

        // Designer match (highest weight)
        machine.designer?.forEach(designer => {
          const count = userProfile.designers.get(designer) || 0;
          score += count * 10;
        });

        // Manufacturer match
        if (machine.manufacturer) {
          const count = userProfile.manufacturers.get(machine.manufacturer) || 0;
          score += count * 5;
        }

        // Theme match
        machine.theme?.forEach(theme => {
          const count = userProfile.themes.get(theme) || 0;
          score += count * 3;
        });

        // Year proximity (prefer similar eras)
        if (machine.year) {
          const yearScores = Array.from(userProfile.years.entries());
          const avgYear = yearScores.reduce((sum, [year, count]) => sum + year * count, 0) / 
            yearScores.reduce((sum, [, count]) => sum + count, 0);
          
          const yearDiff = Math.abs(machine.year - avgYear);
          score += Math.max(0, 10 - yearDiff / 2); // Closer years = higher score
        }

        // Complexity match
        if (machine.gameplay_complexity || machine.rule_complexity) {
          const machineComplexity = (
            (machine.gameplay_complexity || 0) + 
            (machine.rule_complexity || 0)
          ) / 2;
          const complexityDiff = Math.abs(machineComplexity - avgComplexity);
          score += Math.max(0, 5 - complexityDiff); // Similar complexity = higher score
        }

        return { machine, score };
      })
      .filter(r => r.score > 0) // Only include machines with some match
      .sort((a, b) => b.score - a.score)
      .slice(0, 20) // Top 20 recommendations
      .map(r => r.machine);

    return recommendations;
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return [];
  }
};

// ============================================================
// KEEP these from utils.ts — no migration needed
// ============================================================
export const formatScore = (score: number): string => {
  if (score >= 1_000_000_000) {
    return `${(score / 1_000_000_000).toFixed(3)}B`;
  }
  if (score >= 1_000_000) {
    return `${(score / 1_000_000).toFixed(3)}M`;
  }
  if (score >= 1_000) {
    return `${(score / 1_000).toFixed(1)}K`;
  }
  return score.toLocaleString();
};