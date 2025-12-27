import React, { useState } from 'react';
import type { GameType } from '../types';
import { addGame, getGames } from '../utils';
import { StrategyCard } from './StrategyCard';

interface GameFormProps {
  onGameAdded: () => void;
}

export const GameForm: React.FC<GameFormProps> = ({ onGameAdded }) => {
  const [venue, setVenue] = useState('');
  const [table, setTable] = useState('');
  const [myScore, setMyScore] = useState('');
  const [opponentScore, setOpponentScore] = useState('');
  const [gameType, setGameType] = useState<GameType>('competitive');
  const [notes, setNotes] = useState('');
  const [customVenue, setCustomVenue] = useState('');
  const [customTable, setCustomTable] = useState('');
  const [showCustomVenue, setShowCustomVenue] = useState(false);
  const [showCustomTable, setShowCustomTable] = useState(false);

  // Get unique venues and tables from existing games
  const games = getGames();
  const venues = Array.from(new Set(games.map(g => g.venue))).sort();
  const tables = Array.from(new Set(games.map(g => g.table))).sort();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const finalVenue = showCustomVenue ? customVenue : venue;
    const finalTable = showCustomTable ? customTable : table;
    
    if (!finalVenue || !finalTable || !myScore) {
      alert('Please fill in venue, table, and your score');
      return;
    }

    const myScoreNum = parseInt(myScore);
    const opponentScoreNum = opponentScore ? parseInt(opponentScore) : 0;
    
    let result: 'win' | 'loss' | 'practice';
    if (gameType === 'practice') {
      result = 'practice';
    } else {
      result = myScoreNum > opponentScoreNum ? 'win' : 'loss';
    }

    addGame({
      venue: finalVenue,
      table: finalTable,
      myScore: myScoreNum,
      opponentScore: opponentScoreNum,
      gameType,
      result,
      notes,
    });

    // Reset form
    setVenue('');
    setTable('');
    setMyScore('');
    setOpponentScore('');
    setGameType('competitive');
    setNotes('');
    setCustomVenue('');
    setCustomTable('');
    setShowCustomVenue(false);
    setShowCustomTable(false);
    
    onGameAdded();
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
      <h2 className="text-2xl font-bold text-white mb-6">Add New Game</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Venue */}
        <div>
          <label className="block text-gray-300 mb-2">Venue</label>
          {!showCustomVenue ? (
            <div className="flex gap-2">
              <select
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                className="flex-1 bg-gray-700 text-white rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select venue...</option>
                {venues.map(v => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setShowCustomVenue(true)}
                className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
              >
                New
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                value={customVenue}
                onChange={(e) => setCustomVenue(e.target.value)}
                placeholder="Enter new venue..."
                className="flex-1 bg-gray-700 text-white rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowCustomVenue(false)}
                className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Table */}
        <div>
          <label className="block text-gray-300 mb-2">Table</label>
          {!showCustomTable ? (
            <div className="flex gap-2">
              <select
                value={table}
                onChange={(e) => setTable(e.target.value)}
                className="flex-1 bg-gray-700 text-white rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select table...</option>
                {tables.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setShowCustomTable(true)}
                className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
              >
                New
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                value={customTable}
                onChange={(e) => setCustomTable(e.target.value)}
                placeholder="Enter new table..."
                className="flex-1 bg-gray-700 text-white rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowCustomTable(false)}
                className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Strategy Card */}
        {(table || customTable) && (
          <StrategyCard tableName={showCustomTable ? customTable : table} />
        )}

        {/* Game Type */}
        <div>
          <label className="block text-gray-300 mb-2">Game Type</label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="competitive"
                checked={gameType === 'competitive'}
                onChange={(e) => setGameType(e.target.value as GameType)}
                className="mr-2"
              />
              <span className="text-white">Competitive</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="practice"
                checked={gameType === 'practice'}
                onChange={(e) => setGameType(e.target.value as GameType)}
                className="mr-2"
              />
              <span className="text-white">Practice</span>
            </label>
          </div>
        </div>

        {/* Scores */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-300 mb-2">My Score</label>
            <input
              type="number"
              value={myScore}
              onChange={(e) => setMyScore(e.target.value)}
              placeholder="0"
              className="w-full bg-gray-700 text-white rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {gameType === 'competitive' && (
            <div>
              <label className="block text-gray-300 mb-2">Opponent Score</label>
              <input
                type="number"
                value={opponentScore}
                onChange={(e) => setOpponentScore(e.target.value)}
                placeholder="0"
                className="w-full bg-gray-700 text-white rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
        </div>

        {/* Notes */}
        <div>
          <label className="block text-gray-300 mb-2">Notes (optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any notes about the game..."
            rows={3}
            className="w-full bg-gray-700 text-white rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition"
        >
          Save Game
        </button>
      </form>
    </div>
  );
};
