import { supabase } from './supabaseClient';
import type { Game, TableStrategy, Settings } from './types';

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
    .single();

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
  location: {
    city: 'Portland',
    state: 'OR',
    radius: 25,
  },
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
    }, { onConflict: 'user_id' });

  if (error) console.error('Error saving settings:', error);
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