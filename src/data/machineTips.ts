// Machine Tips Data Structure
// Tips and rule sheets for popular competitive pinball machines

export interface MachineTip {
  tips: string[];
  ruleSheetUrl: string;
}

export interface MachineTipsData {
  [tableName: string]: MachineTip;
}

// Version for cache invalidation
export const MACHINE_TIPS_VERSION = '1.0.0';

// Top competitive pinball machines with tips and rule sheets
export const machineTips: MachineTipsData = {
  'Medieval Madness': {
    tips: [
      'Focus on completing castle missions to build towards Battle for the Kingdom',
      'Shoot the left orbit to start Catapult and advance castle destruction',
      'Lock balls in the castle for Royal Madness multiball - huge scoring potential',
      'Complete trolls to light video mode for guaranteed points',
      'Merlin\'s Magic awards random features - can be very valuable',
      'Damsel rescue shots are safe and advance towards Damsel Multiball',
      'Complete all 6 castle missions to reach Battle for the Kingdom final mode',
    ],
    ruleSheetUrl: 'https://www.papa.org/learning-center/rule-sheets/medieval-madness/',
  },
  'Attack from Mars': {
    tips: [
      'Focus on completing all 5 martian modes to reach Rule the Universe wizard mode',
      'Shoot left and right ramps to collect strokes and light Super Jackpots',
      'Lock 3 balls for 5-Saucer Multiball - major scoring opportunity',
      'Big-O-Beam is lit after completing martian modes - huge points',
      'Complete Total Annihilation for massive bonus multiplier',
      'Video mode is safe and awards guaranteed points',
      'Stroke shots (ramps) are key to maximizing multiball scoring',
    ],
    ruleSheetUrl: 'https://www.papa.org/learning-center/rule-sheets/attack-from-mars/',
  },
  'Twilight Zone': {
    tips: [
      'Piano shot starts modes - complete 6 door panels for Lost in the Zone',
      'Lock balls via slot machine for multiball opportunity',
      'Shoot the powerfield to light extra ball and build bonus',
      'Camera awards are random but can be very valuable',
      'Gumball awards random features - sometimes game-changing',
      'Complete door panels in order for maximum strategy',
      'Dead End leads to Lost in the Zone wizard mode',
    ],
    ruleSheetUrl: 'https://www.papa.org/learning-center/rule-sheets/twilight-zone/',
  },
  'The Addams Family': {
    tips: [
      'Spell GREED at ramp to light mansion rooms for Tour the Mansion',
      'Chair shots start modes - complete 6 to light Tour the Mansion',
      'Electric Chair is a risky but rewarding shot',
      'Thing Flips awards ball save and is very valuable',
      'Complete bear kicks to light multiball at the swamp',
      'Mamushka multiball has excellent jackpot potential',
      'Tour the Mansion is the wizard mode - requires all 6 mansion rooms',
    ],
    ruleSheetUrl: 'https://www.papa.org/learning-center/rule-sheets/addams-family/',
  },
  'Monster Bash': {
    tips: [
      'Start monster modes and defeat all 6 monsters for Monsters of Rock',
      'Shoot instruments to collect monsters - each increases value',
      'Multiball via Dracula castle after hitting his targets',
      'Frankenstein lane shots are safe and build toward his mode',
      'Mosh Pit multiball has huge jackpot potential',
      'Complete all monsters to light Monsters of Rock wizard mode',
      'Focus on one monster at a time for efficient progression',
    ],
    ruleSheetUrl: 'https://www.papa.org/learning-center/rule-sheets/monster-bash/',
  },
  'Scared Stiff': {
    tips: [
      'Shoot center ramp to spell SCARED and advance coffin',
      'Complete coffin targets to light Stiff-O-Meter jackpots',
      'Monster\'s Lair multiball has great scoring potential',
      'Boney Beast shots build multipliers',
      'Crate shots award mystery values and features',
      'Spider mode from Tales from the Crypt is very valuable',
      'Leaper King is the final mode - requires coffin completion',
    ],
    ruleSheetUrl: 'https://www.papa.org/learning-center/rule-sheets/scared-stiff/',
  },
  'Indiana Jones: The Pinball Adventure': {
    tips: [
      'Start 12 adventure modes by shooting center ramp',
      'Path of Adventure requires completing specific mode sequences',
      'Quick multiball via idol targets for fast scoring',
      'Jackpots in multiball can be huge if properly built',
      'Video mode is safe and awards guaranteed points',
      'Complete all adventures for final adventure wizard mode',
      'POA (Path of Adventure) multipliers stack nicely',
    ],
    ruleSheetUrl: 'https://www.papa.org/learning-center/rule-sheets/indiana-jones/',
  },
  'Star Trek: The Next Generation': {
    tips: [
      'Complete missions by shooting correct sequence of targets',
      'Final Frontier is the wizard mode - requires all 7 missions',
      'Start multiballs via Borg or Neutral Zone locks',
      'Warp ramp builds multipliers and advances missions',
      'Video mode (artifact) provides safe points',
      'Cannon shot is risky but awards major points when lit',
      'Focus on mission completion for long-term strategy',
    ],
    ruleSheetUrl: 'https://www.papa.org/learning-center/rule-sheets/star-trek-the-next-generation/',
  },
  'The Lord of the Rings': {
    tips: [
      'Follow the fellowship path - complete 9 modes for victory',
      'Two Towers multiball has excellent scoring potential',
      'Ring modes are key to wizard mode progression',
      'Shoot Palantir for bonus multipliers and extra balls',
      'Balrog multiball stacks with other multiballs for huge points',
      'Complete all 9 fellowship modes for wizard mode',
      'Focus on Aragorn or Gandalf paths for maximum efficiency',
    ],
    ruleSheetUrl: 'https://www.papa.org/learning-center/rule-sheets/lord-of-the-rings/',
  },
  'Iron Maiden': {
    tips: [
      'Complete song modes to advance through setlist',
      'Cyborg multiball via ramp shots - build jackpots',
      'Soul Fragments unlock additional features and modes',
      'Number of the Beast mode is extremely valuable',
      'Complete all songs to reach final encore modes',
      'Legacy of the Beast is the ultimate wizard mode',
      'Shoot orbs consistently to build multipliers',
    ],
    ruleSheetUrl: 'https://www.tiltforums.com/t/iron-maiden-rules/5691',
  },
};

// Fallback message for tables not in the mapping
export const getFallbackTip = (): string => {
  return 'Keep playing and learning this machine! Every game is a chance to improve your skills and discover new strategies.';
};

// Get tips for a specific table
export const getTipsForTable = (tableName: string): MachineTip | null => {
  return machineTips[tableName] || null;
};

// Get a random tip for a specific table
export const getRandomTip = (tableName: string): string => {
  const machineData = getTipsForTable(tableName);
  if (!machineData || machineData.tips.length === 0) {
    return getFallbackTip();
  }
  const randomIndex = Math.floor(Math.random() * machineData.tips.length);
  return machineData.tips[randomIndex];
};

// Get all table names that have tips
export const getAvailableTables = (): string[] => {
  return Object.keys(machineTips).sort();
};
