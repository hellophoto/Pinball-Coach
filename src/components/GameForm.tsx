import React, { useState, useEffect } from 'react';
import type { GameType, PinballMapLocation } from '../types';
import { addGame, getGames, getSettings } from '../utils';
import { StrategyCard } from './StrategyCard';
import { getPinballMapLocations } from '../services/pinballMapService';
import { fetchPercentileWithTimeout } from '../services/pinScoresService';

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
  const [pinballMapLocations, setPinballMapLocations] = useState<PinballMapLocation[]>([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);
  const [isFetchingPercentile, setIsFetchingPercentile] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<PinballMapLocation | null>(null);

  // Get unique venues and tables from existing games
  const games = getGames();
  const existingVenues = Array.from(new Set(games.map(g => g.venue))).sort();
  const existingTables = Array.from(new Set(games.map(g => g.table))).sort();

  // Load Pinball Map locations on mount
  useEffect(() => {
    const loadPinballMapData = async () => {
      setIsLoadingLocations(true);
      try {
        const settings = getSettings();
        const locations = await getPinballMapLocations(
          settings.location.city,
          settings.location.state,
          settings.location.radius
        );
        setPinballMapLocations(locations);
      } catch (error) {
        console.error('Error loading Pinball Map data:', error);
        // Fail silently - app still works without Pinball Map data
      } finally {
        setIsLoadingLocations(false);
      }
    };

    loadPinballMapData();
  }, []);

  // Update selected location when venue changes
  useEffect(() => {
    if (!showCustomVenue && venue) {
      const location = pinballMapLocations.find(loc => loc.name === venue);
      setSelectedLocation(location || null);
    } else {
      setSelectedLocation(null);
    }
  }, [venue, showCustomVenue, pinballMapLocations]);

  // Combine venues from Pinball Map and existing games
  const allVenues = Array.from(
    new Set([
      ...pinballMapLocations.map(loc => loc.name),
      ...existingVenues,
    ])
  ).sort();

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

    // Add game first (without percentile)
    const newGame = addGame({
      venue: finalVenue,
      table: finalTable,
      myScore: myScoreNum,
      opponentScore: opponentScoreNum,
      gameType,
      result,
      notes,
    });

    // Fetch percentile in background
    setIsFetchingPercentile(true);
    fetchPercentileWithTimeout(finalTable, myScoreNum)
      .then(percentile => {
        if (percentile !== null) {
          // Update the game with percentile
          const games = getGames();
          const gameIndex = games.findIndex(g => g.id === newGame.id);
          if (gameIndex !== -1) {
            games[gameIndex].percentile = percentile;
            localStorage.setItem('pinball-coach-games', JSON.stringify(games));
          }
        }
      })
      .catch(error => {
        console.error('Error fetching percentile:', error);
      })
      .finally(() => {
        setIsFetchingPercentile(false);
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
      
      {isFetchingPercentile && (
        <div className="mb-4 bg-blue-900/30 border border-blue-600 rounded p-3">
          <p className="text-blue-200 text-sm">🔄 Fetching percentile ranking from PinScores...</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Venue */}
        <div>
          <label className="block text-gray-300 mb-2">
            Venue
            {isLoadingLocations && <span className="ml-2 text-sm text-gray-400">(Loading Pinball Map data...)</span>}
          </label>
          {!showCustomVenue ? (
            <div className="flex gap-2">
              <select
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                className="flex-1 bg-gray-700 text-white rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select venue...</option>
                {allVenues.map(v => (
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

        {/* Available Tables from Pinball Map */}
        {selectedLocation && selectedLocation.machines.length > 0 && (
          <div className="bg-gray-700 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-400 mb-2">
              📍 Available Tables at {selectedLocation.name}
            </h3>
            <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
              {selectedLocation.machines.map(machine => (
                <button
                  key={machine.id}
                  type="button"
                  onClick={() => {
                    setTable(machine.name);
                    setShowCustomTable(false);
                  }}
                  className={`text-left px-3 py-2 rounded text-sm transition ${
                    table === machine.name
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-600 text-gray-200 hover:bg-gray-500'
                  }`}
                >
                  {machine.name}
                </button>
              ))}
            </div>
          </div>
        )}

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
                {existingTables.map(t => (
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
