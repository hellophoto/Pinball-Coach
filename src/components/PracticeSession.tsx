import React, { useState, useEffect } from 'react';
import type { PracticeSession as PracticeSessionType, PinballMapLocation } from '../types';
import { 
  createPracticeSession, 
  updatePracticeSession, 
  endPracticeSession, 
  getActiveSession 
} from '../supabaseUtils';
import { getPinballMapLocations } from '../services/pinballMapService';
import { getSettings } from '../supabaseUtils';

export const PracticeSession: React.FC = () => {
  const [activeSession, setActiveSession] = useState<PracticeSessionType | null>(null);
  const [venue, setVenue] = useState('');
  const [pinballMapLocations, setPinballMapLocations] = useState<PinballMapLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState<PinballMapLocation | null>(null);
  const [editingGame, setEditingGame] = useState<number | null>(null);
  const [scoreInput, setScoreInput] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [session, settings] = await Promise.all([
        getActiveSession(),
        getSettings(),
      ]);
      
      setActiveSession(session);

      const result = await getPinballMapLocations(
        settings.location.city,
        settings.location.state,
        settings.location.radius,
        false,
        settings.location.useGeolocation,
        settings.location.lastKnownLat,
        settings.location.lastKnownLon
      );
      setPinballMapLocations(result.locations);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (venue) {
      const location = pinballMapLocations.find(loc => loc.name === venue);
      setSelectedLocation(location || null);
    } else {
      setSelectedLocation(null);
    }
  }, [venue, pinballMapLocations]);

  const handleStartSession = async () => {
    if (!venue) {
      alert('Please select a venue');
      return;
    }

    try {
      const session = await createPracticeSession(venue);
      setActiveSession(session);
    } catch (error) {
      console.error('Error starting session:', error);
      alert('Failed to start practice session');
    }
  };

  const handleAddMachine = (machineName: string) => {
    if (!activeSession) return;

    const newGame = {
      table: machineName,
      highScore: 0,
      achievements: {
        skillShot: false,
        multiball: false,
        wizardMode: false,
        jackpot: false,
      },
      notes: '',
    };

    const updatedGames = [...activeSession.games, newGame];
    updatePracticeSession(activeSession.id, updatedGames).then(() => {
      setActiveSession({ ...activeSession, games: updatedGames });
    });
  };

  const handleRemoveMachine = (index: number) => {
    if (!activeSession) return;

    const updatedGames = activeSession.games.filter((_, i) => i !== index);
    updatePracticeSession(activeSession.id, updatedGames).then(() => {
      setActiveSession({ ...activeSession, games: updatedGames });
    });
  };

  const handleUpdateScore = (index: number) => {
    if (!activeSession || !scoreInput) return;

    const score = parseInt(scoreInput.replace(/,/g, ''));
    if (isNaN(score)) return;

    const updatedGames = [...activeSession.games];
    updatedGames[index].highScore = score;
    
    updatePracticeSession(activeSession.id, updatedGames).then(() => {
      setActiveSession({ ...activeSession, games: updatedGames });
      setEditingGame(null);
      setScoreInput('');
    });
  };

  const handleToggleAchievement = (
    index: number, 
    achievement: keyof PracticeSessionType['games'][0]['achievements']
  ) => {
    if (!activeSession) return;

    const updatedGames = [...activeSession.games];
    updatedGames[index].achievements[achievement] = !updatedGames[index].achievements[achievement];
    
    updatePracticeSession(activeSession.id, updatedGames).then(() => {
      setActiveSession({ ...activeSession, games: updatedGames });
    });
  };

  const handleUpdateNotes = (index: number, notes: string) => {
    if (!activeSession) return;

    const updatedGames = [...activeSession.games];
    updatedGames[index].notes = notes;
    
    updatePracticeSession(activeSession.id, updatedGames);
    setActiveSession({ ...activeSession, games: updatedGames });
  };

  const handleEndSession = async () => {
    if (!activeSession) return;

    if (!window.confirm('End this practice session?')) return;

    try {
      await endPracticeSession(activeSession.id);
      setActiveSession(null);
      setVenue('');
      setSelectedLocation(null);
    } catch (error) {
      console.error('Error ending session:', error);
      alert('Failed to end session');
    }
  };

  const formatDuration = (startTime: number) => {
    const minutes = Math.floor((Date.now() - startTime) / 60000);
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="font-mono animate-pulse" style={{ color: 'var(--neon-cyan)' }}>
          LOADING...
        </p>
      </div>
    );
  }

  // No active session - show start screen
  if (!activeSession) {
    return (
      <div className="max-w-[600px] mx-auto">
        <div className="card-synthwave rounded-lg p-6 shadow-lg">
          <h2 className="text-2xl font-bold mb-6" style={{ 
            color: 'var(--neon-cyan)',
            textShadow: '0 0 10px var(--neon-cyan), 0 0 20px var(--neon-cyan)'
          }}>Start Practice Session</h2>

          <div className="space-y-4">
            <div>
              <label className="block mb-2" style={{ color: 'var(--neon-cyan)' }}>
                Venue
              </label>
              <select
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                className="w-full input-synthwave rounded px-4 py-2"
              >
                <option value="">Select venue...</option>
                <option value="Home">🏠 Home</option>
                {pinballMapLocations.map(loc => (
                  <option key={loc.id} value={loc.name}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleStartSession}
              disabled={!venue}
              className="w-full button-primary font-semibold py-3 rounded-lg"
            >
              🎮 Start Session
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active session view
  return (
    <div className="max-w-[800px] mx-auto space-y-4">
      {/* Session Header */}
      <div className="card-synthwave rounded-lg p-6 shadow-lg">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold mb-2" style={{ 
              color: 'var(--neon-cyan)',
              textShadow: '0 0 10px var(--neon-cyan)'
            }}>
              🎮 Active Session
            </h2>
            <p className="text-sm" style={{ color: 'var(--neon-purple)' }}>
              {activeSession.venue} • {formatDuration(activeSession.startTime)}
            </p>
          </div>
          <button
            onClick={handleEndSession}
            className="px-4 py-2 rounded-lg font-semibold border-2 transition"
            style={{
              background: 'rgba(255, 0, 102, 0.2)',
              borderColor: '#ff0066',
              color: '#ff0066',
            }}
          >
            End Session
          </button>
        </div>

        {/* Add Machine Section */}
        {selectedLocation && selectedLocation.machines.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--neon-cyan)' }}>
              📍 Available Machines
            </h3>
            <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
              {selectedLocation.machines
                .filter(m => !activeSession.games.find(g => g.table === m.name))
                .map(machine => (
                  <button
                    key={machine.id}
                    onClick={() => handleAddMachine(machine.name)}
                    className="text-left px-3 py-2 rounded text-sm transition border-2"
                    style={{
                      background: 'rgba(139, 0, 255, 0.1)',
                      borderColor: 'var(--neon-purple)',
                      color: 'var(--neon-purple)',
                    }}
                  >
                    + {machine.name}
                  </button>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Games List */}
      {activeSession.games.length === 0 ? (
        <div className="card-synthwave rounded-lg p-6 text-center">
          <p style={{ color: 'var(--neon-purple)' }}>
            No machines added yet. Select machines from the list above.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {activeSession.games.map((game, index) => (
            <div key={index} className="card-synthwave rounded-lg p-4 shadow-lg">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold" style={{ color: 'var(--neon-cyan)' }}>
                  {game.table}
                </h3>
                <button
                  onClick={() => handleRemoveMachine(index)}
                  className="p-1 transition"
                  style={{ color: 'var(--neon-purple)' }}
                  title="Remove machine"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Score */}
              <div className="mb-3">
                <label className="block text-xs mb-1" style={{ color: 'var(--neon-purple)' }}>
                  High Score
                </label>
                {editingGame === index ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={scoreInput}
                      onChange={(e) => setScoreInput(e.target.value.replace(/[^0-9,]/g, ''))}
                      placeholder="0"
                      className="flex-1 input-synthwave rounded px-3 py-2"
                      autoFocus
                    />
                    <button
                      onClick={() => handleUpdateScore(index)}
                      className="px-4 py-2 rounded font-semibold"
                      style={{
                        background: 'rgba(0, 255, 136, 0.2)',
                        border: '2px solid #00ff88',
                        color: '#00ff88',
                      }}
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setEditingGame(index);
                      setScoreInput(game.highScore > 0 ? game.highScore.toString() : '');
                    }}
                    className="w-full text-left px-3 py-2 rounded border-2 transition"
                    style={{
                      background: 'rgba(255, 215, 0, 0.1)',
                      borderColor: 'var(--neon-yellow)',
                      color: 'var(--neon-yellow)',
                    }}
                  >
                    {game.highScore > 0 ? game.highScore.toLocaleString() : 'Tap to add score'}
                  </button>
                )}
              </div>

              {/* Achievements */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                {Object.entries(game.achievements).map(([key, value]) => (
                  <button
                    key={key}
                    onClick={() => handleToggleAchievement(index, key as keyof typeof game.achievements)}
                    className="px-3 py-2 rounded text-sm border-2 transition"
                    style={{
                      background: value ? 'rgba(0, 255, 136, 0.2)' : 'rgba(139, 0, 255, 0.1)',
                      borderColor: value ? '#00ff88' : 'var(--neon-purple)',
                      color: value ? '#00ff88' : 'var(--neon-purple)',
                    }}
                  >
                    {value ? '✓' : '○'} {key.replace(/([A-Z])/g, ' $1').trim()}
                  </button>
                ))}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs mb-1" style={{ color: 'var(--neon-purple)' }}>
                  Notes
                </label>
                <textarea
                  value={game.notes || ''}
                  onChange={(e) => handleUpdateNotes(index, e.target.value)}
                  rows={2}
                  className="w-full input-synthwave rounded px-3 py-2 text-sm"
                  placeholder="Add notes about this session..."
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};