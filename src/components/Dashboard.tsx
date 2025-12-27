import React, { useState } from 'react';
import { getGames, formatScore } from '../utils';
import { syncIFPAGames } from '../ifpaService';

interface DashboardProps {
  onSyncComplete?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onSyncComplete }) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  
  const games = getGames();
  const competitiveGames = games.filter(g => g.gameType === 'competitive');
  const wins = competitiveGames.filter(g => g.result === 'win').length;
  const losses = competitiveGames.filter(g => g.result === 'loss').length;
  const winRate = competitiveGames.length > 0 
    ? ((wins / competitiveGames.length) * 100).toFixed(1) 
    : '0.0';

  // Stats by table
  const tableStats = games.reduce((acc, game) => {
    if (!acc[game.table]) {
      acc[game.table] = { wins: 0, losses: 0, total: 0, highScore: 0 };
    }
    acc[game.table].total++;
    if (game.result === 'win') acc[game.table].wins++;
    if (game.result === 'loss') acc[game.table].losses++;
    if (game.myScore > acc[game.table].highScore) {
      acc[game.table].highScore = game.myScore;
    }
    return acc;
  }, {} as Record<string, { wins: number; losses: number; total: number; highScore: number }>);

  // Stats by venue
  const venueStats = games.reduce((acc, game) => {
    if (!acc[game.venue]) {
      acc[game.venue] = { wins: 0, losses: 0, total: 0 };
    }
    acc[game.venue].total++;
    if (game.result === 'win') acc[game.venue].wins++;
    if (game.result === 'loss') acc[game.venue].losses++;
    return acc;
  }, {} as Record<string, { wins: number; losses: number; total: number }>);

  // High scores across all games
  const highScores = [...games]
    .sort((a, b) => b.myScore - a.myScore)
    .slice(0, 5);

  const handleIFPASync = async () => {
    setIsSyncing(true);
    setSyncMessage(null);
    
    try {
      const result = await syncIFPAGames();
      
      if (result.errors.length > 0) {
        setSyncMessage(`Sync completed with errors. Imported: ${result.imported}, Skipped: ${result.skipped}. Errors: ${result.errors.join(', ')}`);
      } else if (result.imported === 0) {
        setSyncMessage(`No new games to import. ${result.skipped} games already exist.`);
      } else {
        setSyncMessage(`Successfully imported ${result.imported} games from IFPA!${result.skipped > 0 ? ` (${result.skipped} skipped as duplicates)` : ''}`);
        // Notify parent to refresh
        if (onSyncComplete) {
          onSyncComplete();
        }
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setSyncMessage(`Error syncing IFPA data: ${errorMsg}`);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Dashboard</h2>
        <button
          onClick={handleIFPASync}
          disabled={isSyncing}
          className={`px-4 py-2 rounded-lg font-semibold transition ${
            isSyncing
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-purple-600 hover:bg-purple-700 text-white'
          }`}
        >
          {isSyncing ? '🔄 Syncing...' : '🌐 Sync IFPA'}
        </button>
      </div>

      {/* Sync Message */}
      {syncMessage && (
        <div className={`rounded-lg p-4 ${
          syncMessage.includes('Error') || syncMessage.includes('errors')
            ? 'bg-red-900/30 border border-red-600 text-red-200'
            : 'bg-green-900/30 border border-green-600 text-green-200'
        }`}>
          <p className="text-sm">{syncMessage}</p>
        </div>
      )}

      {/* Overall Stats */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Overall Stats</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-700 rounded p-4">
            <div className="text-gray-400 text-sm">Total Games</div>
            <div className="text-2xl font-bold text-white">{games.length}</div>
          </div>
          <div className="bg-gray-700 rounded p-4">
            <div className="text-gray-400 text-sm">Win Rate</div>
            <div className="text-2xl font-bold text-green-400">{winRate}%</div>
          </div>
          <div className="bg-gray-700 rounded p-4">
            <div className="text-gray-400 text-sm">Wins</div>
            <div className="text-2xl font-bold text-green-400">{wins}</div>
          </div>
          <div className="bg-gray-700 rounded p-4">
            <div className="text-gray-400 text-sm">Losses</div>
            <div className="text-2xl font-bold text-red-400">{losses}</div>
          </div>
        </div>
      </div>

      {/* High Scores */}
      {highScores.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Top High Scores</h3>
          <div className="space-y-2">
            {highScores.map((game, index) => (
              <div key={game.id} className="flex items-center justify-between bg-gray-700 rounded p-3">
                <div className="flex items-center gap-3">
                  <div className="text-gray-400 font-mono w-6">#{index + 1}</div>
                  <div>
                    <div className="text-white font-semibold">{game.table}</div>
                    <div className="text-gray-400 text-sm">{game.venue}</div>
                  </div>
                </div>
                <div className="text-blue-400 font-bold text-lg">
                  {formatScore(game.myScore)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats by Table */}
      {Object.keys(tableStats).length > 0 && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Stats by Table</h3>
          <div className="space-y-2">
            {Object.entries(tableStats)
              .sort(([, a], [, b]) => b.total - a.total)
              .map(([table, stats]) => {
                const tableWinRate = stats.wins + stats.losses > 0
                  ? ((stats.wins / (stats.wins + stats.losses)) * 100).toFixed(0)
                  : '0';
                return (
                  <div key={table} className="bg-gray-700 rounded p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-white font-semibold">{table}</div>
                      <div className="text-blue-400 font-bold">
                        {formatScore(stats.highScore)}
                      </div>
                    </div>
                    <div className="flex gap-4 text-sm">
                      <div className="text-gray-400">
                        {stats.total} games
                      </div>
                      <div className="text-gray-400">
                        {stats.wins}W - {stats.losses}L
                      </div>
                      <div className="text-gray-400">
                        {tableWinRate}% win rate
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Stats by Venue */}
      {Object.keys(venueStats).length > 0 && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Stats by Venue</h3>
          <div className="space-y-2">
            {Object.entries(venueStats)
              .sort(([, a], [, b]) => b.total - a.total)
              .map(([venue, stats]) => {
                const venueWinRate = stats.wins + stats.losses > 0
                  ? ((stats.wins / (stats.wins + stats.losses)) * 100).toFixed(0)
                  : '0';
                return (
                  <div key={venue} className="bg-gray-700 rounded p-4">
                    <div className="text-white font-semibold mb-2">{venue}</div>
                    <div className="flex gap-4 text-sm">
                      <div className="text-gray-400">
                        {stats.total} games
                      </div>
                      <div className="text-gray-400">
                        {stats.wins}W - {stats.losses}L
                      </div>
                      <div className="text-gray-400">
                        {venueWinRate}% win rate
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {games.length === 0 && (
        <div className="bg-gray-800 rounded-lg p-6 text-center">
          <p className="text-gray-400">No games recorded yet. Add your first game to see stats!</p>
        </div>
      )}
    </div>
  );
};
