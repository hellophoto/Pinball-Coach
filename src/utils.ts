import type { Game, TableStrategy, Settings } from './types';

const STORAGE_KEY = 'pinball-coach-games';
const STRATEGIES_KEY = 'pinball-coach-table-strategies';
const SETTINGS_KEY = 'pinball-coach-settings';

// Default settings
const DEFAULT_SETTINGS: Settings = {
  location: {
    city: 'Portland',
    state: 'OR',
    radius: 25,
  },
};

export const getGames = (): Game[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading games:', error);
    return [];
  }
};

export const saveGames = (games: Game[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(games));
  } catch (error) {
    console.error('Error saving games:', error);
  }
};

const generateId = (): string => {
  // Use crypto.randomUUID() if available, otherwise fall back to a simple implementation
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback: generate a random ID
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
};

export const addGame = (game: Omit<Game, 'id' | 'timestamp'>): Game => {
  const games = getGames();
  const newGame: Game = {
    ...game,
    id: generateId(),
    timestamp: Date.now(),
  };
  games.push(newGame);
  saveGames(games);
  return newGame;
};

export const updateGame = (id: string, updates: Partial<Omit<Game, 'id' | 'timestamp'>>): Game | null => {
  const games = getGames();
  const gameIndex = games.findIndex(game => game.id === id);
  
  if (gameIndex === -1) {
    return null;
  }
  
  const updatedGame = {
    ...games[gameIndex],
    ...updates
  };
  
  games[gameIndex] = updatedGame;
  saveGames(games);
  return updatedGame;
};

export const getGame = (id: string): Game | undefined => {
  const games = getGames();
  return games.find(game => game.id === id);
};

export const deleteGame = (id: string): void => {
  const games = getGames();
  const filteredGames = games.filter(game => game.id !== id);
  saveGames(filteredGames);
};

export const formatScore = (score: number): string => {
  if (score >= 1_000_000) {
    return `${(score / 1_000_000).toFixed(1)}M`;
  }
  if (score >= 1_000) {
    return `${(score / 1_000).toFixed(1)}K`;
  }
  return score.toString();
};

// Table Strategies
export const getTableStrategies = (): Record<string, TableStrategy> => {
  try {
    const data = localStorage.getItem(STRATEGIES_KEY);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Error loading table strategies:', error);
    return {};
  }
};

export const saveTableStrategies = (strategies: Record<string, TableStrategy>): void => {
  try {
    localStorage.setItem(STRATEGIES_KEY, JSON.stringify(strategies));
  } catch (error) {
    console.error('Error saving table strategies:', error);
  }
};

export const getTableStrategy = (tableName: string): TableStrategy | undefined => {
  const strategies = getTableStrategies();
  return strategies[tableName];
};

export const saveTableStrategy = (strategy: TableStrategy): void => {
  const strategies = getTableStrategies();
  strategies[strategy.table] = strategy;
  saveTableStrategies(strategies);
};

export const deleteTableStrategy = (tableName: string): void => {
  const strategies = getTableStrategies();
  delete strategies[tableName];
  saveTableStrategies(strategies);
};

// Settings Management
export const getSettings = (): Settings => {
  try {
    const data = localStorage.getItem(SETTINGS_KEY);
    if (data) {
      return JSON.parse(data);
    }
    return DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Error loading settings:', error);
    return DEFAULT_SETTINGS;
  }
};

export const saveSettings = (settings: Settings): void => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving settings:', error);
  }
};
