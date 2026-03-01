import type { LeagueStats } from './types';

interface CSVRow {
  Season: string;
  Stage: string;
  Week: string;
  HomeTeam: string;
  AwayTeam: string;
  Round: string;
  Format: string;
  Venue: string;
  Machine: string;
  HomePlr1: string;
  HomePlr2: string;
  AwayPlr1: string;
  AwayPlr2: string;
  Winner: string;
  HomeScore1: string;
  HomeScore2: string;
  AwayScore1: string;
  AwayScore2: string;
}

interface PlayerMatch {
  season: string;
  week: number;
  venue: string;
  machine: string;
  opponent: string;
  myScore: number;
  opponentScore: number;
  result: 'win' | 'loss';
  format: 'Singles' | 'Doubles';
}

export function parseLeagueCSV(csvText: string, playerName: string): LeagueStats {
  const lines = csvText.split('\n');
  const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
  
  const matches: PlayerMatch[] = [];
  const machineStats = new Map<string, { wins: number; losses: number; totalScore: number; games: number }>();
  const leagueAverages = new Map<string, { totalScore: number; games: number }>();
  
  let wins = 0;
  let losses = 0;
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Parse CSV line (handle quoted fields)
    const fields: string[] = [];
    let currentField = '';
    let inQuotes = false;
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        fields.push(currentField.trim());
        currentField = '';
      } else {
        currentField += char;
      }
    }
    fields.push(currentField.trim());
    
    const row: Partial<CSVRow> = {};
    headers.forEach((header, idx) => {
      row[header as keyof CSVRow] = fields[idx] || '';
    });
    
    const csvRow = row as CSVRow;
    
    // Check if player is in this match
    const isHomePlr1 = csvRow.HomePlr1 === playerName;
    const isHomePlr2 = csvRow.HomePlr2 === playerName;
    const isAwayPlr1 = csvRow.AwayPlr1 === playerName;
    const isAwayPlr2 = csvRow.AwayPlr2 === playerName;
    
    if (!isHomePlr1 && !isHomePlr2 && !isAwayPlr1 && !isAwayPlr2) {
      // Not our player, but track for league averages
      const machine = csvRow.Machine;
      if (!leagueAverages.has(machine)) {
        leagueAverages.set(machine, { totalScore: 0, games: 0 });
      }
      const avg = leagueAverages.get(machine)!;
      
      if (csvRow.HomeScore1) {
        avg.totalScore += parseInt(csvRow.HomeScore1.replace(/"/g, '')) || 0;
        avg.games++;
      }
      if (csvRow.HomeScore2) {
        avg.totalScore += parseInt(csvRow.HomeScore2.replace(/"/g, '')) || 0;
        avg.games++;
      }
      if (csvRow.AwayScore1) {
        avg.totalScore += parseInt(csvRow.AwayScore1.replace(/"/g, '')) || 0;
        avg.games++;
      }
      if (csvRow.AwayScore2) {
        avg.totalScore += parseInt(csvRow.AwayScore2.replace(/"/g, '')) || 0;
        avg.games++;
      }
      
      continue;
    }
    
    // Player is in this match - determine their score and opponent
    let myScore = 0;
    let opponentScore = 0;
    let opponent = '';
    let didWin = false;
    
    if (isHomePlr1) {
      myScore = parseInt(csvRow.HomeScore1.replace(/"/g, '')) || 0;
      if (csvRow.Format === 'Singles') {
        opponentScore = parseInt(csvRow.AwayScore1.replace(/"/g, '')) || 0;
        opponent = csvRow.AwayPlr1;
      } else {
        // Doubles - compare team totals
        const awayTotal = (parseInt(csvRow.AwayScore1.replace(/"/g, '')) || 0) + (parseInt(csvRow.AwayScore2.replace(/"/g, '')) || 0);
        opponentScore = awayTotal;
        opponent = `${csvRow.AwayPlr1} & ${csvRow.AwayPlr2}`;
      }
      didWin = csvRow.Winner === 'H';
    } else if (isHomePlr2) {
      myScore = parseInt(csvRow.HomeScore2.replace(/"/g, '')) || 0;
      const awayTotal = (parseInt(csvRow.AwayScore1.replace(/"/g, '')) || 0) + (parseInt(csvRow.AwayScore2.replace(/"/g, '')) || 0);
      opponentScore = awayTotal;
      opponent = `${csvRow.AwayPlr1} & ${csvRow.AwayPlr2}`;
      didWin = csvRow.Winner === 'H';
    } else if (isAwayPlr1) {
      myScore = parseInt(csvRow.AwayScore1.replace(/"/g, '')) || 0;
      if (csvRow.Format === 'Singles') {
        opponentScore = parseInt(csvRow.HomeScore1.replace(/"/g, '')) || 0;
        opponent = csvRow.HomePlr1;
      } else {
        const homeTotal = (parseInt(csvRow.HomeScore1.replace(/"/g, '')) || 0) + (parseInt(csvRow.HomeScore2.replace(/"/g, '')) || 0);
        opponentScore = homeTotal;
        opponent = `${csvRow.HomePlr1} & ${csvRow.HomePlr2}`;
      }
      didWin = csvRow.Winner === 'A';
    } else if (isAwayPlr2) {
      myScore = parseInt(csvRow.AwayScore2.replace(/"/g, '')) || 0;
      const homeTotal = (parseInt(csvRow.HomeScore1.replace(/"/g, '')) || 0) + (parseInt(csvRow.HomeScore2.replace(/"/g, '')) || 0);
      opponentScore = homeTotal;
      opponent = `${csvRow.HomePlr1} & ${csvRow.HomePlr2}`;
      didWin = csvRow.Winner === 'A';
    }
    
    // Track match
    matches.push({
      season: csvRow.Season,
      week: parseInt(csvRow.Week) || 0,
      venue: csvRow.Venue,
      machine: csvRow.Machine,
      opponent,
      myScore,
      opponentScore,
      result: didWin ? 'win' : 'loss',
      format: csvRow.Format as 'Singles' | 'Doubles',
    });
    
    // Update win/loss
    if (didWin) wins++;
    else losses++;
    
    // Track machine stats
    const machine = csvRow.Machine;
    if (!machineStats.has(machine)) {
      machineStats.set(machine, { wins: 0, losses: 0, totalScore: 0, games: 0 });
    }
    const stats = machineStats.get(machine)!;
    if (didWin) stats.wins++;
    else stats.losses++;
    stats.totalScore += myScore;
    stats.games++;
    
    // Add to league averages
    if (!leagueAverages.has(machine)) {
      leagueAverages.set(machine, { totalScore: 0, games: 0 });
    }
    leagueAverages.get(machine)!.totalScore += myScore;
    leagueAverages.get(machine)!.games++;
  }
  
  // Calculate final stats
  const machineStatsArray = Array.from(machineStats.entries()).map(([machine, stats]) => ({
    machine,
    wins: stats.wins,
    losses: stats.losses,
    winRate: stats.wins / (stats.wins + stats.losses),
    avgScore: stats.totalScore / stats.games,
  }));
  
  const leagueAveragesArray = Array.from(leagueAverages.entries()).map(([machine, stats]) => ({
    machine,
    avgScore: stats.totalScore / stats.games,
    gamesPlayed: stats.games,
  }));
  
  // Get season name from first match
  const season = matches.length > 0 ? matches[0].season : 'Unknown';
  
  return {
    playerId: '', // Will be set by caller
    season,
    wins,
    losses,
    points: wins * 2, // Assuming 2 points per win
    machineStats: machineStatsArray,
    leagueAverages: leagueAveragesArray,
    lastSynced: Date.now(),
  };
}