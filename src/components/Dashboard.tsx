import React, { useState, useEffect } from 'react';
import type { Game } from '../types';
import { getGames, formatScore } from '../supabaseUtils';
import { syncIFPAGames } from '../ifpaService';

interface DashboardProps {
  onSyncComplete?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onSyncComplete }) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getGames().then(data => {
      setGames(data);
      setLoading(false);
    });
  }, []);

  const competitiveGames = games.filter(g => g.gameType === 'competitive');
  const wins = competitiveGames.filter(g => g.result === 'win').length;
  const losses = competitiveGames.filter(g => g.result === 'loss').length;
  const winRate = competitiveGames.length > 0 
    ? ((wins / competitiveGames.length) * 100).toFixed(1) 
    : '0.0';

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

  const venueStats = games.reduce((acc, game) => {
    if (!acc[game.venue]) {
      acc[game.venue] = { wins: 0, losses: 0, total: 0 };
    }
    acc[game.venue].total++;
    if (game.result === 'win') acc[game.venue].wins++;
    if (game.result === 'loss') acc[game.venue].losses++;
    return acc;
  }, {} as Record<string, { wins: number; losses: number; total: number }>);

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
        if (onSyncComplete) onSyncComplete();
        // Refresh games after sync
        const updated = await getGames();
        setGames(updated);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setSyncMessage(`Error syncing IFPA data: ${errorMsg}`);
    } finally {
      setIsSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="font-mono animate-pulse" style={{ color: 'var(--neon-cyan)' }}>
          LOADING STATS...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold" style={{ 
          color: 'var(--neon-cyan)',
          textShadow: '0 0 10px var(--neon-cyan), 0 0 20px var(--neon-cyan)'
        }}>Dashboard</h2>
        <button
          onClick={handleIFPASync}
          disabled={isSyncing}
          className={`px-4 py-2 rounded-lg font-semibold transition ${
            isSyncing
              ? 'opacity-50 cursor-not-allowed bg-gray-700 border-2 border-gray-600 text-gray-400'
              : 'button-primary'
          }`}
        >
          {isSyncing ? '🔄 Syncing...' : '🌐 Sync IFPA'}
        </button>
      </div>

      {syncMessage && (
        <div className={`rounded-lg p-4 border-2 ${
          syncMessage.includes('Error') || syncMessage.includes('errors')
            ? 'bg-red-900/30 border-red-600'
            : 'bg-green-900/30 border-green-600'
        }`} style={{
          boxShadow: syncMessage.includes('Error') 
            ? '0 0 10px rgba(255, 0, 0, 0.5)' 
            : '0 0 10px rgba(0, 255, 0, 0.5)'
        }}>
          <p className="text-sm" style={{ 
            color: syncMessage.includes('Error') ? '#ff6b6b' : '#51cf66'
          }}>{syncMessage}</p>
        </div>
      )}

      {/* Overall Stats */}
      <div className="card-synthwave rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4" style={{ 
          color: 'var(--neon-magenta)',
          textShadow: '0 0 10px var(--neon-magenta)'
        }}>Overall Stats</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="stat-card rounded p-4">
            <div className="text-sm" style={{ color: 'var(--neon-purple)' }}>Total Games</div>
            <div className="text-2xl font-bold score-animate" style={{ 
              color: 'var(--neon-cyan)',
              textShadow: '0 0 10px var(--neon-cyan)'
            }}>{games.length}</div>
          </div>
          <div className="stat-card rounded p-4">
            <div className="text-sm" style={{ color: 'var(--neon-purple)' }}>Win Rate</div>
            <div className="text-2xl font-bold score-animate" style={{ 
              color: 'var(--neon-yellow)',
              textShadow: '0 0 10px var(--neon-yellow)'
            }}>{winRate}%</div>
          </div>
          <div className="stat-card rounded p-4">
            <div className="text-sm" style={{ color: 'var(--neon-purple)' }}>Wins</div>
            <div className="text-2xl font-bold score-animate" style={{ 
              color: '#00ff88',
              textShadow: '0 0 10px #00ff88'
            }}>{wins}</div>
          </div>
          <div className="stat-card rounded p-4">
            <div className="text-sm" style={{ color: 'var(--neon-purple)' }}>Losses</div>
            <div className="text-2xl font-bold score-animate" style={{ 
              color: '#ff0066',
              textShadow: '0 0 10px #ff0066'
            }}>{losses}</div>
          </div>
        </div>
      </div>

      {/* High Scores */}
      {highScores.length > 0 && (
        <div className="card-synthwave rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4" style={{ 
            color: 'var(--neon-magenta)',
            textShadow: '0 0 10px var(--neon-magenta)'
          }}>Top High Scores</h3>
          <div className="space-y-2">
            {highScores.map((game, index) => (
              <div key={game.id} className="flex items-center justify-between stat-card rounded p-3">
                <div className="flex items-center gap-3">
                  <div className="font-mono w-6" style={{ color: 'var(--neon-purple)' }}>#{index + 1}</div>
                  <div>
                    <div className="font-semibold" style={{ color: 'var(--neon-cyan)' }}>{game.table}</div>
                    <div className="text-sm" style={{ color: 'var(--neon-purple)', opacity: 0.8 }}>{game.venue}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="font-bold text-lg" style={{ 
                    color: 'var(--neon-yellow)',
                    textShadow: '0 0 10px var(--neon-yellow)'
                  }}>
                    {formatScore(game.myScore)}
                  </div>
                  {game.percentile !== undefined && (
                    <div className="rounded px-2 py-1 border-2" style={{
                      background: 'rgba(0, 255, 255, 0.1)',
                      borderColor: 'var(--neon-cyan)',
                      boxShadow: '0 0 10px var(--neon-cyan)'
                    }}>
                     <span className="text-sm" style={{ color: 'var(--neon-cyan)' }}>PinScores Rating:</span>
                      <span className="font-bold text-lg" style={{ 
                        color: 'var(--neon-yellow)',
                        textShadow: '0 0 10px var(--neon-yellow)'
                      }}>{game.percentile?.toFixed(3) || 'N/A'}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats by Table */}
      {Object.keys(tableStats).length > 0 && (
        <div className="card-synthwave rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4" style={{ 
            color: 'var(--neon-magenta)',
            textShadow: '0 0 10px var(--neon-magenta)'
          }}>Stats by Table</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(tableStats)
              .sort(([, a], [, b]) => b.total - a.total)
              .map(([table, stats]) => {
                const tableWinRate = stats.wins + stats.losses > 0
                  ? ((stats.wins / (stats.wins + stats.losses)) * 100).toFixed(0)
                  : '0';
                return (
                  <div key={table} className="stat-card rounded p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-semibold" style={{ color: 'var(--neon-cyan)' }}>{table}</div>
                      <div className="font-bold" style={{ 
                        color: 'var(--neon-yellow)',
                        textShadow: '0 0 10px var(--neon-yellow)'
                      }}>
                        {formatScore(stats.highScore)}
                      </div>
                    </div>
                    <div className="flex gap-4 text-sm" style={{ color: 'var(--neon-purple)' }}>
                      <div>{stats.total} games</div>
                      <div>{stats.wins}W - {stats.losses}L</div>
                      <div>{tableWinRate}% win rate</div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Stats by Venue */}
      {Object.keys(venueStats).length > 0 && (
        <div className="card-synthwave rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4" style={{ 
            color: 'var(--neon-magenta)',
            textShadow: '0 0 10px var(--neon-magenta)'
          }}>Stats by Venue</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(venueStats)
              .sort(([, a], [, b]) => b.total - a.total)
              .map(([venue, stats]) => {
                const venueWinRate = stats.wins + stats.losses > 0
                  ? ((stats.wins / (stats.wins + stats.losses)) * 100).toFixed(0)
                  : '0';
                return (
                  <div key={venue} className="stat-card rounded p-4">
                    <div className="font-semibold mb-2" style={{ color: 'var(--neon-cyan)' }}>{venue}</div>
                    <div className="flex gap-4 text-sm" style={{ color: 'var(--neon-purple)' }}>
                      <div>{stats.total} games</div>
                      <div>{stats.wins}W - {stats.losses}L</div>
                      <div>{venueWinRate}% win rate</div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {games.length === 0 && (
        <div className="card-synthwave rounded-lg p-6 text-center">
          <p style={{ color: 'var(--neon-purple)' }}>No games recorded yet. Add your first game to see stats!</p>
        </div>
      )}
    </div>
  );
};