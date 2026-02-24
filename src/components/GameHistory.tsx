import React, { useState, useEffect } from 'react';
import type { Game } from '../types';
import { getGames, deleteGame, formatScore } from '../supabaseUtils';

interface GameHistoryProps {
  onGameDeleted: () => void;
  onEditGame?: (gameId: string) => void;
}

export const GameHistory: React.FC<GameHistoryProps> = ({ onGameDeleted, onEditGame }) => {
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getGames().then(data => {
      setGames(data.sort((a, b) => b.timestamp - a.timestamp));
      setLoading(false);
    });
  }, []);

  const handleDelete = async (id: string) => {
    await deleteGame(id);
    setGames(prev => prev.filter(g => g.id !== id));
    setConfirmDelete(null);
    onGameDeleted();
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getResultBadge = (game: Game) => {
    if (game.result === 'win') {
      return (
        <span className="px-2 py-1 text-xs rounded border-2" style={{
          background: 'rgba(0, 255, 136, 0.2)',
          borderColor: '#00ff88',
          color: '#00ff88',
          boxShadow: '0 0 10px rgba(0, 255, 136, 0.5)'
        }}>WIN</span>
      );
    }
    if (game.result === 'loss') {
      return (
        <span className="px-2 py-1 text-xs rounded border-2" style={{
          background: 'rgba(255, 0, 102, 0.2)',
          borderColor: '#ff0066',
          color: '#ff0066',
          boxShadow: '0 0 10px rgba(255, 0, 102, 0.5)'
        }}>LOSS</span>
      );
    }
    return (
      <span className="px-2 py-1 text-xs rounded border-2" style={{
        background: 'rgba(139, 0, 255, 0.2)',
        borderColor: 'var(--neon-purple)',
        color: 'var(--neon-purple)',
        boxShadow: '0 0 10px var(--neon-purple)'
      }}>PRACTICE</span>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="font-mono animate-pulse" style={{ color: 'var(--neon-cyan)' }}>
          LOADING GAMES...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold" style={{ 
        color: 'var(--neon-cyan)',
        textShadow: '0 0 10px var(--neon-cyan), 0 0 20px var(--neon-cyan)'
      }}>Game History</h2>

      {games.length === 0 ? (
        <div className="card-synthwave rounded-lg p-6 text-center">
          <p style={{ color: 'var(--neon-purple)' }}>No games recorded yet. Add your first game!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {games.map(game => (
            <div key={game.id} className="card-synthwave rounded-lg p-4 shadow-lg">
              {game.photoThumbnail && (
                <div className="mb-3">
                  <img 
                    src={game.photoThumbnail} 
                    alt="Scoreboard"
                    className="w-full h-32 object-cover rounded-lg border-2"
                    style={{
                      borderColor: 'var(--neon-purple)',
                      boxShadow: '0 0 10px var(--neon-purple)'
                    }}
                  />
                </div>
              )}
              
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold" style={{ color: 'var(--neon-cyan)' }}>
                      {game.table}
                    </h3>
                    {getResultBadge(game)}
                    {game.source === 'ifpa' && (
                      <span className="px-2 py-1 text-xs rounded border-2" style={{
                        background: 'rgba(255, 0, 255, 0.2)',
                        borderColor: 'var(--neon-magenta)',
                        color: 'var(--neon-magenta)',
                        boxShadow: '0 0 10px var(--neon-magenta)'
                      }}>IFPA</span>
                    )}
                  </div>
                  <div className="text-sm" style={{ color: 'var(--neon-purple)' }}>{game.venue}</div>
                  <div className="text-xs mt-1" style={{ color: 'var(--neon-purple)', opacity: 0.7 }}>
                    {formatDate(game.timestamp)}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onEditGame?.(game.id)}
                    className="p-2 transition hover-glow icon-button"
                    style={{ color: 'var(--neon-cyan)' }}
                    title="Edit game"
                    aria-label="Edit game"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setConfirmDelete(game.id)}
                    className="p-2 transition hover-glow icon-button"
                    style={{ color: 'var(--neon-purple)' }}
                    title="Delete game"
                    aria-label="Delete game"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* IFPA games show placement, regular games show scores */}
              {game.source === 'ifpa' ? (
                <div className="rounded p-3 mb-3 border-2" style={{
                  background: 'rgba(255, 0, 255, 0.1)',
                  borderColor: 'var(--neon-magenta)',
                  boxShadow: '0 0 10px var(--neon-magenta)'
                }}>
                  <div className="text-sm font-semibold mb-1" style={{ color: 'var(--neon-magenta)' }}>
                    IFPA Tournament Result
                  </div>
                  {game.notes && (
                    <div className="text-xs" style={{ color: 'var(--neon-purple)' }}>
                      {game.notes.split('\n').slice(1, 3).join(' • ')}
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <div className="text-xs mb-1" style={{ color: 'var(--neon-purple)' }}>My Score</div>
                    <div className="font-bold text-xl" style={{ 
                      color: 'var(--neon-yellow)',
                      textShadow: '0 0 10px var(--neon-yellow)'
                    }}>
                      {formatScore(game.myScore)}
                    </div>
                  </div>
                  {game.gameType === 'competitive' && (
                    <div>
                      <div className="text-xs mb-1" style={{ color: 'var(--neon-purple)' }}>Opponent Score</div>
                      <div className="font-bold text-xl" style={{ color: 'var(--neon-cyan)' }}>
                        {formatScore(game.opponentScore)}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Percentile */}
              {game.percentile !== undefined && game.percentile !== null && (
                <div className="rounded p-3 mt-3 border-2" style={{
                  background: 'rgba(0, 255, 255, 0.1)',
                  borderColor: 'var(--neon-cyan)',
                  boxShadow: '0 0 10px var(--neon-cyan)'
                }}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: 'var(--neon-cyan)' }}>PinScores Rating:</span>
                    <span className="font-bold text-lg" style={{ 
                      color: 'var(--neon-yellow)',
                      textShadow: '0 0 10px var(--neon-yellow)'
                    }}>{game.percentile.toFixed(3)}</span>
                  </div>
                </div>
              )}

              {game.notes && game.source !== 'ifpa' && (
                <div className="stat-card rounded p-3 mt-3">
                  <div className="text-xs mb-1" style={{ color: 'var(--neon-purple)' }}>Notes</div>
                  <div className="text-sm" style={{ color: 'var(--neon-cyan)' }}>{game.notes}</div>
                </div>
              )}

              {confirmDelete === game.id && (
                <div className="mt-3 rounded p-3 border-2" style={{
                  background: 'rgba(255, 0, 102, 0.2)',
                  borderColor: '#ff0066',
                  boxShadow: '0 0 10px rgba(255, 0, 102, 0.5)'
                }}>
                  <p className="text-sm mb-3" style={{ color: '#ff0066' }}>
                    Are you sure you want to delete this game?
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDelete(game.id)}
                      className="flex-1 py-2 rounded font-semibold border-2 transition"
                      style={{
                        background: 'rgba(255, 0, 102, 0.3)',
                        borderColor: '#ff0066',
                        color: '#ff0066'
                      }}
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => setConfirmDelete(null)}
                      className="flex-1 button-secondary py-2 rounded font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};