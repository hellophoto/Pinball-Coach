import React, { useState, useEffect } from 'react';
import type { GameType, PinballMapLocation } from '../types';
import { addGame, getGames, getSettings, saveGames } from '../utils';
import { StrategyCard } from './StrategyCard';
import { getPinballMapLocations } from '../services/pinballMapService';
import { fetchPercentileWithTimeout } from '../services/pinScoresService';
import { TipModal } from './TipModal';

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
  const [showTipModal, setShowTipModal] = useState(false);
  const [tipModalTable, setTipModalTable] = useState('');
  const [showAllTips, setShowAllTips] = useState(false);
  const [manualPercentile, setManualPercentile] = useState('');
  const [showPinscoresLink, setShowPinscoresLink] = useState(false);

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

    // Use manual percentile if provided
    const manualPercentileNum = manualPercentile ? parseFloat(manualPercentile) : undefined;
    const initialPercentile = manualPercentileNum !== undefined && !isNaN(manualPercentileNum) 
      ? Math.max(0, Math.min(100, manualPercentileNum))
      : undefined;

    // Add game with manual percentile if provided
    const newGame = addGame({
      venue: finalVenue,
      table: finalTable,
      myScore: myScoreNum,
      opponentScore: opponentScoreNum,
      gameType,
      result,
      notes,
      percentile: initialPercentile,
    });

    // Only fetch percentile automatically if not manually provided
    if (initialPercentile === undefined) {
      setIsFetchingPercentile(true);
      fetchPercentileWithTimeout(finalTable, myScoreNum)
        .then(percentile => {
          if (percentile !== null) {
            // Update the game with percentile using the existing utility
            const allGames = getGames();
            const gameIndex = allGames.findIndex(g => g.id === newGame.id);
            if (gameIndex !== -1) {
              allGames[gameIndex].percentile = percentile;
              saveGames(allGames);
            }
          }
        })
        .catch(error => {
          console.error('Error fetching percentile:', error);
        })
        .finally(() => {
          setIsFetchingPercentile(false);
        });
    }

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
    setManualPercentile('');
    setShowPinscoresLink(false);
    
    // Show tip modal with the table that was just played
    setTipModalTable(finalTable);
    setShowAllTips(false);
    setShowTipModal(true);
  };

  return (
    <div className="max-w-[600px] mx-auto">
      <div className="card-synthwave rounded-lg p-6 shadow-lg">
      <h2 className="text-2xl font-bold mb-6" style={{ 
        color: 'var(--neon-cyan)',
        textShadow: '0 0 10px var(--neon-cyan), 0 0 20px var(--neon-cyan)'
      }}>Add New Game</h2>
      
      {isFetchingPercentile && (
        <div className="mb-4 rounded p-3 border-2" style={{
          background: 'rgba(0, 255, 255, 0.1)',
          borderColor: 'var(--neon-cyan)',
          boxShadow: '0 0 10px var(--neon-cyan)'
        }}>
          <p className="text-sm" style={{ color: 'var(--neon-cyan)' }}>
            🔄 Fetching percentile ranking from PinScores...
          </p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Venue */}
        <div>
          <label className="block mb-2" style={{ color: 'var(--neon-cyan)' }}>
            Venue
            {isLoadingLocations && <span className="ml-2 text-sm" style={{ color: 'var(--neon-purple)' }}>
              (Loading Pinball Map data...)
            </span>}
          </label>
          {!showCustomVenue ? (
            <div className="flex gap-2">
              <select
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                className="flex-1 input-synthwave rounded px-4 py-2"
              >
                <option value="">Select venue...</option>
                {allVenues.map(v => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setShowCustomVenue(true)}
                className="px-4 py-2 button-secondary rounded"
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
                className="flex-1 input-synthwave rounded px-4 py-2"
              />
              <button
                type="button"
                onClick={() => setShowCustomVenue(false)}
                className="px-4 py-2 button-secondary rounded"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Available Tables from Pinball Map */}
        {selectedLocation && selectedLocation.machines.length > 0 && (
          <div className="stat-card rounded-lg p-4">
            <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--neon-cyan)' }}>
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
                  className={`text-left px-3 py-2 rounded text-sm transition border-2 ${
                    table === machine.name
                      ? 'border-cyan-400'
                      : 'border-purple-600'
                  }`}
                  style={{
                    background: table === machine.name 
                      ? 'rgba(0, 255, 255, 0.2)' 
                      : 'rgba(139, 0, 255, 0.1)',
                    color: table === machine.name 
                      ? 'var(--neon-cyan)' 
                      : 'var(--neon-purple)',
                    boxShadow: table === machine.name 
                      ? '0 0 10px var(--neon-cyan)' 
                      : 'none'
                  }}
                >
                  {machine.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Table */}
        <div>
          <label className="block mb-2" style={{ color: 'var(--neon-cyan)' }}>Table</label>
          {!showCustomTable ? (
            <div className="flex gap-2">
              <select
                value={table}
                onChange={(e) => setTable(e.target.value)}
                className="flex-1 input-synthwave rounded px-4 py-2"
              >
                <option value="">Select table...</option>
                {existingTables.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setShowCustomTable(true)}
                className="px-4 py-2 button-secondary rounded"
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
                className="flex-1 input-synthwave rounded px-4 py-2"
              />
              <button
                type="button"
                onClick={() => setShowCustomTable(false)}
                className="px-4 py-2 button-secondary rounded"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* View Tips Button */}
        {(table || customTable) && (
          <div>
            <button
              type="button"
              onClick={() => {
                setTipModalTable(showCustomTable ? customTable : table);
                setShowAllTips(true);
                setShowTipModal(true);
              }}
              className="w-full py-3 px-4 rounded-lg font-semibold transition-all duration-300"
              style={{
                background: 'rgba(0, 255, 255, 0.1)',
                border: '2px solid var(--neon-cyan)',
                color: 'var(--neon-cyan)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                boxShadow: '0 0 10px rgba(0, 255, 255, 0.3)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(0, 255, 255, 0.2)';
                e.currentTarget.style.boxShadow = '0 0 20px var(--neon-cyan)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(0, 255, 255, 0.1)';
                e.currentTarget.style.boxShadow = '0 0 10px rgba(0, 255, 255, 0.3)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              💡 View Tips for {showCustomTable ? customTable : table}
            </button>
          </div>
        )}

        {/* Strategy Card */}
        {(table || customTable) && (
          <StrategyCard tableName={showCustomTable ? customTable : table} />
        )}

        {/* Game Type */}
        <div>
          <label className="block mb-2" style={{ color: 'var(--neon-cyan)' }}>Game Type</label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="competitive"
                checked={gameType === 'competitive'}
                onChange={(e) => setGameType(e.target.value as GameType)}
                className="mr-2"
              />
              <span style={{ color: 'var(--neon-cyan)' }}>Competitive</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="practice"
                checked={gameType === 'practice'}
                onChange={(e) => setGameType(e.target.value as GameType)}
                className="mr-2"
              />
              <span style={{ color: 'var(--neon-cyan)' }}>Practice</span>
            </label>
          </div>
        </div>

        {/* Scores */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-2" style={{ color: 'var(--neon-cyan)' }}>My Score</label>
            <input
              type="number"
              value={myScore}
              onChange={(e) => setMyScore(e.target.value)}
              placeholder="0"
              className="w-full input-synthwave rounded px-4 py-2"
            />
          </div>
          {gameType === 'competitive' && (
            <div>
              <label className="block mb-2" style={{ color: 'var(--neon-cyan)' }}>Opponent Score</label>
              <input
                type="number"
                value={opponentScore}
                onChange={(e) => setOpponentScore(e.target.value)}
                placeholder="0"
                className="w-full input-synthwave rounded px-4 py-2"
              />
            </div>
          )}
        </div>

        {/* Notes */}
        <div>
          <label className="block mb-2" style={{ color: 'var(--neon-cyan)' }}>Notes (optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any notes about the game..."
            rows={3}
            className="w-full input-synthwave rounded px-4 py-2"
          />
        </div>

        {/* PinScores Percentile Section */}
        {(table || customTable) && myScore && (
          <div className="rounded-lg p-4 border-2" style={{
            background: 'rgba(0, 255, 255, 0.05)',
            borderColor: 'var(--neon-cyan)',
            boxShadow: '0 0 10px rgba(0, 255, 255, 0.3)'
          }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold" style={{ color: 'var(--neon-cyan)' }}>
                📊 PinScores Percentile
              </h3>
              <button
                type="button"
                onClick={() => setShowPinscoresLink(!showPinscoresLink)}
                className="text-xs px-3 py-1 rounded border-2 transition"
                style={{
                  background: 'rgba(0, 255, 255, 0.1)',
                  borderColor: 'var(--neon-cyan)',
                  color: 'var(--neon-cyan)',
                }}
              >
                {showPinscoresLink ? 'Hide' : 'Show'} Link
              </button>
            </div>
            
            {showPinscoresLink && (
              <div className="mb-3 p-3 rounded" style={{
                background: 'rgba(139, 0, 255, 0.1)',
                borderLeft: '3px solid var(--neon-purple)'
              }}>
                <p className="text-xs mb-2" style={{ color: 'var(--neon-purple)' }}>
                  Check your score's percentile ranking on PinScores:
                </p>
                <a
                  href={`https://pinscores.net/?search=${encodeURIComponent(showCustomTable ? customTable : table)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold underline break-all hover:opacity-80 transition"
                  style={{ color: 'var(--neon-cyan)' }}
                >
                  https://pinscores.net/?search={encodeURIComponent(showCustomTable ? customTable : table)}
                </a>
                <p className="text-xs mt-2" style={{ color: 'var(--neon-purple)', opacity: 0.8 }}>
                  1. Click the link to open PinScores
                  <br />2. Find your machine and enter your score
                  <br />3. Copy the percentile value below
                </p>
              </div>
            )}

            <div>
              <label className="block mb-2 text-sm" style={{ color: 'var(--neon-cyan)' }}>
                Percentile (0-100, optional)
              </label>
              <input
                type="number"
                value={manualPercentile}
                onChange={(e) => setManualPercentile(e.target.value)}
                placeholder="e.g., 85.5"
                min="0"
                max="100"
                step="0.1"
                className="w-full input-synthwave rounded px-4 py-2"
              />
              <p className="text-xs mt-1" style={{ color: 'var(--neon-purple)', opacity: 0.7 }}>
                Leave empty to try automatic fetch (may not work if PinScores API is unavailable)
              </p>
            </div>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          className="w-full button-primary font-semibold py-3 rounded-lg"
        >
          Save Game
        </button>
      </form>
    </div>

    {/* Tip Modal */}
    {showTipModal && (
      <TipModal
        tableName={tipModalTable}
        onClose={() => {
          setShowTipModal(false);
          // If this is post-game modal (not showAllTips), navigate to dashboard
          if (!showAllTips) {
            onGameAdded();
          }
        }}
        showAllTips={showAllTips}
      />
    )}
    </div>
  );
};
