import React, { useState } from 'react';
import type { Game } from '../types';
import { getGames, deleteGame, formatScore } from '../utils';

interface GameHistoryProps {
  onGameDeleted: () => void;
}

export const GameHistory: React.FC<GameHistoryProps> = ({ onGameDeleted }) => {
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const games = getGames().sort((a, b) => b.timestamp - a.timestamp);

  const handleDelete = (id: string) => {
    deleteGame(id);
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
      return <span className="px-2 py-1 bg-green-600 text-white text-xs rounded">WIN</span>;
    }
    if (game.result === 'loss') {
      return <span className="px-2 py-1 bg-red-600 text-white text-xs rounded">LOSS</span>;
    }
    return <span className="px-2 py-1 bg-gray-600 text-white text-xs rounded">PRACTICE</span>;
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-white">Game History</h2>

      {games.length === 0 ? (
        <div className="bg-gray-800 rounded-lg p-6 text-center">
          <p className="text-gray-400">No games recorded yet. Add your first game!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {games.map(game => (
            <div key={game.id} className="bg-gray-800 rounded-lg p-4 shadow-lg">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold text-white">{game.table}</h3>
                    {getResultBadge(game)}
                    {game.source === 'ifpa' && (
                      <span className="px-2 py-1 bg-purple-600 text-white text-xs rounded">IFPA</span>
                    )}
                  </div>
                  <div className="text-gray-400 text-sm">{game.venue}</div>
                  <div className="text-gray-500 text-xs mt-1">{formatDate(game.timestamp)}</div>
                </div>
                <button
                  onClick={() => setConfirmDelete(game.id)}
                  className="text-gray-400 hover:text-red-400 p-2"
                  title="Delete game"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <div className="text-gray-400 text-xs mb-1">My Score</div>
                  <div className="text-blue-400 font-bold text-xl">
                    {formatScore(game.myScore)}
                  </div>
                </div>
                {game.gameType === 'competitive' && (
                  <div>
                    <div className="text-gray-400 text-xs mb-1">Opponent Score</div>
                    <div className="text-gray-300 font-bold text-xl">
                      {formatScore(game.opponentScore)}
                    </div>
                  </div>
                )}
              </div>

              {game.notes && (
                <div className="bg-gray-700 rounded p-3 mt-3">
                  <div className="text-gray-400 text-xs mb-1">Notes</div>
                  <div className="text-gray-300 text-sm">{game.notes}</div>
                </div>
              )}

              {/* Delete Confirmation */}
              {confirmDelete === game.id && (
                <div className="mt-3 bg-red-900/30 border border-red-600 rounded p-3">
                  <p className="text-white text-sm mb-3">
                    Are you sure you want to delete this game?
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDelete(game.id)}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded font-semibold"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => setConfirmDelete(null)}
                      className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded font-semibold"
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
