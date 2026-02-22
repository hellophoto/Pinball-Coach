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
  photo?: string; // base64 encoded photo of scoreboard
  photoThumbnail?: string; // compressed thumbnail for display
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
  lat?: number; // NEW - for distance calculation
  lon?: number; // NEW - for distance calculation
  distance?: number; // NEW - calculated distance from user
}

// Settings types
export interface Settings {
  location: {
    city?: string;
    state?: string;
    zipCode?: string;
    radius: number; // miles
    opdbLastUpdated?: number;
    useGeolocation?: boolean;
    lastKnownLat?: number;
    lastKnownLon?: number;
    region?: string;
  };
  pinballMapLastUpdated?: number;
  ifpaPlayerId?: string; // ADD THIS LINE
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

//Practice Sessions
export interface PracticeSession {
  id: string;
  venue: string;
  startTime: number;
  endTime?: number;
  status: 'active' | 'completed';
  games: Array<{
    table: string;
    highScore: number;
    achievements: {
      skillShot: boolean;
      multiball: boolean;
      wizardMode: boolean;
      jackpot: boolean;
    };
    notes?: string;
  }>;
}