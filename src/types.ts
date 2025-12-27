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
  source?: 'manual' | 'ifpa';
  percentile?: number; // 0-100, from PinScores API
}

export interface TableStrategy {
  table: string;
  skillShot: string;
  modes: string;
  multiballs: string;
  tips: string;
}

// Pinball Map types
export interface PinballMapMachine {
  id: number;
  name: string;
}

export interface PinballMapLocation {
  id: number;
  name: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  machines: PinballMapMachine[];
}

// Settings types
export interface Settings {
  location: {
    city?: string;
    state?: string;
    zipCode?: string;
    radius: number; // miles
  };
  pinballMapLastUpdated?: number;
}
