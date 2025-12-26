import type { Game } from './types';

const STORAGE_KEY = 'pinball-coach-games';

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

export const addGame = (game: Omit<Game, 'id' | 'timestamp'>): Game => {
  const games = getGames();
  const newGame: Game = {
    ...game,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
  };
  games.push(newGame);
  saveGames(games);
  return newGame;
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
