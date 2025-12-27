export type GameType = 'competitive' | 'practice';
export type GameResult = 'win' | 'loss' | 'practice';

export interface Game {
  id: string;
  venue: string;
  table: string;
  myScore: number;
  opponentScore: number;
  gameType: GameType;
  result: GameResult;
  notes: string;
  timestamp: number;
}
