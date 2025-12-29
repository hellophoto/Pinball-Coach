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
  opdb_id?: string;
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
    opdbLastUpdated?: number;
  };
  pinballMapLastUpdated?: number;
}

// OPDB types
export interface OPDBMachine {
  opdb_id: string;
  name: string;
  short_name?: string;
  manufacturer?: string;
  year?: number;
  type?: string;
  theme?: string[];
  designer?: string[];
  artist?: string[];
  ipdb_id?: number;
  machine_group_id?: string;
  production_count?: number;
  model_number?: string;
  common_names?: string[];
  description?: string;
  features?: string[];
  notes?: string[];
  toys?: string[];
  rule_complexity?: number;
  gameplay_complexity?: number;
}
