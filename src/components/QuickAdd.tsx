import React, { useState, useEffect } from 'react';
import type { Game, PinballMapLocation } from '../types';
import { addGame, getGames, getSettings } from '../supabaseUtils';
import { getPinballMapLocations } from '../services/pinballMapService';
import { fetchPercentile } from '../services/pinScoresService';

interface QuickAddProps {
  isOpen: boolean;
  onClose: () => void;
  onGameAdded: () => void;
}

export const QuickAdd: React.FC<QuickAddProps> = ({ isOpen, onClose, onGameAdded }) => {
  const [step, setStep] = useState<'venue' | 'machine' | 'score'>('venue');
  const [venues, setVenues] = useState<PinballMapLocation[]>([]);
  const [selectedVenue, setSelectedVenue] = useState<string>('');
  const [selectedMachine, setSelectedMachine] = useState<string>('');
  const [score, setScore] = useState<string>('');
  const [gameType, setGameType] = useState<'competitive' | 'practice'>('competitive');
  const [result, setResult] = useState<'win' | 'loss' | 'practice'>('practice');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadQuickAddData();
    }
  }, [isOpen]);

  const loadQuickAddData = async () => {
    setLoading(true);
    try {
      const [settings, recentGames] = await Promise.all([
        getSettings(),
        getGames()
      ]);

      // Get venues
      const result = await getPinballMapLocations(
        settings.location.city,
        settings.location.state,
        settings.location.radius,
        false,
        settings.location.useGeolocation,
        settings.location.lastKnownLat,
        settings.location.lastKnownLon
      );

      setVenues(result.locations);

      // Smart default: use last venue
      if (recentGames.length > 0) {
        const lastVenue = recentGames[0].venue;
        setSelectedVenue(lastVenue);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error loading quick add data:', error);
      setLoading(false);
    }
  };

  const handleVenueSelect = (venue: string) => {
    setSelectedVenue(venue);
    setStep('machine');
  };

  const handleMachineSelect = (machine: string) => {
    setSelectedMachine(machine);
    setStep('score');
  };

  const handleSubmit = async () => {
    if (!score || !selectedVenue || !selectedMachine) return;

    setSaving(true);
    try {
      const myScore = parseInt(score.replace(/,/g, ''));
      
      // Calculate percentile
      let percentile: number | undefined;
      try {
      percentile = await fetchPercentile(selectedMachine, myScore) ?? undefined;
      } catch (error) {
        console.log('Could not calculate percentile:', error);
      }

      const game: Omit<Game, 'id' | 'timestamp'> = {
        venue: selectedVenue,
        table: selectedMachine,
        myScore,
        opponentScore: 0,
        gameType,
        result: gameType === 'practice' ? 'practice' : result,
        notes: '',
        source: 'manual',
        percentile,
      };

      await addGame(game);
      
      // Reset and close
      setScore('');
      setSelectedVenue('');
      setSelectedMachine('');
      setStep('venue');
      setGameType('competitive');
      setResult('practice');
      setSaving(false);
      onGameAdded();
      onClose();
    } catch (error) {
      console.error('Error adding game:', error);
      setSaving(false);
    }
  };

  const handleBack = () => {
    if (step === 'machine') setStep('venue');
    else if (step === 'score') setStep('machine');
  };

  const handleClose = () => {
    setScore('');
    setSelectedVenue('');
    setSelectedMachine('');
    setStep('venue');
    setGameType('competitive');
    setResult('practice');
    onClose();
  };

  if (!isOpen) return null;

  const currentVenue = venues.find(v => v.name === selectedVenue);
  const availableMachines = currentVenue?.machines || [];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ background: 'rgba(0, 0, 0, 0.8)' }}
      onClick={handleClose}
    >
      <div 
        className="w-full sm:max-w-lg sm:mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div 
          className="rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl"
          style={{
            background: 'linear-gradient(135deg, rgba(139, 0, 255, 0.95) 0%, rgba(0, 255, 255, 0.95) 100%)',
            border: '2px solid var(--neon-cyan)',
            boxShadow: '0 0 30px var(--neon-cyan), 0 0 60px var(--neon-purple)',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            {step !== 'venue' && (
              <button
                onClick={handleBack}
                className="p-2"
                style={{ color: 'white' }}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <h2 className="text-2xl font-bold flex-1 text-center" style={{ color: 'white' }}>
              {step === 'venue' && '📍 Quick Add'}
              {step === 'machine' && '🎮 Select Machine'}
              {step === 'score' && '🎯 Enter Score'}
            </h2>
            <button
              onClick={handleClose}
              className="p-2"
              style={{ color: 'white' }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Progress Indicator */}
          <div className="flex gap-2 mb-6">
            <div className={`flex-1 h-1 rounded ${step === 'venue' ? 'bg-white' : 'bg-white/30'}`} />
            <div className={`flex-1 h-1 rounded ${step === 'machine' ? 'bg-white' : 'bg-white/30'}`} />
            <div className={`flex-1 h-1 rounded ${step === 'score' ? 'bg-white' : 'bg-white/30'}`} />
          </div>

          {/* Content */}
          <div className="max-h-[60vh] overflow-y-auto">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-white animate-pulse">Loading...</p>
              </div>
            ) : (
              <>
                {/* Step 1: Venue Selection */}
                {step === 'venue' && (
                  <div className="space-y-2">
                    <button
                      onClick={() => handleVenueSelect('Home')}
                      className="w-full p-4 rounded-lg text-left font-semibold transition hover:scale-105"
                      style={{
                        background: 'rgba(255, 255, 255, 0.9)',
                        color: '#8b00ff',
                      }}
                    >
                      🏠 Home
                    </button>
                    {venues.map(venue => (
                      <button
                        key={venue.id}
                        onClick={() => handleVenueSelect(venue.name)}
                        className="w-full p-4 rounded-lg text-left transition hover:scale-105"
                        style={{
                          background: 'rgba(255, 255, 255, 0.9)',
                          color: '#8b00ff',
                        }}
                      >
                        <div className="font-semibold">{venue.name}</div>
                        {venue.distance && (
                          <div className="text-sm opacity-70">{venue.distance.toFixed(1)} mi away</div>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {/* Step 2: Machine Selection */}
                {step === 'machine' && (
                  <div className="space-y-2">
                    {availableMachines.length === 0 ? (
                      <div className="text-center py-8 text-white">
                        <p className="mb-4">No machines available for this venue</p>
                        <input
                          type="text"
                          placeholder="Enter machine name..."
                          className="w-full px-4 py-3 rounded-lg"
                          style={{
                            background: 'rgba(255, 255, 255, 0.9)',
                            color: '#8b00ff',
                          }}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                              handleMachineSelect(e.currentTarget.value.trim());
                            }
                          }}
                        />
                      </div>
                    ) : (
                      availableMachines.map(machine => (
                        <button
                          key={machine.id}
                          onClick={() => handleMachineSelect(machine.name)}
                          className="w-full p-4 rounded-lg text-left font-semibold transition hover:scale-105"
                          style={{
                            background: 'rgba(255, 255, 255, 0.9)',
                            color: '#8b00ff',
                          }}
                        >
                          {machine.name}
                        </button>
                      ))
                    )}
                  </div>
                )}

                {/* Step 3: Score Entry */}
                {step === 'score' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-white mb-2 font-semibold">Score</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={score}
                        onChange={(e) => setScore(e.target.value.replace(/[^0-9,]/g, ''))}
                        placeholder="0"
                        className="w-full px-4 py-4 rounded-lg text-2xl text-center font-bold"
                        style={{
                          background: 'rgba(255, 255, 255, 0.9)',
                          color: '#8b00ff',
                        }}
                        autoFocus
                      />
                    </div>

                    <div>
                      <label className="block text-white mb-2 font-semibold">Game Type</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => {
                            setGameType('competitive');
                            setResult('win');
                          }}
                          className={`p-3 rounded-lg font-semibold transition ${
                            gameType === 'competitive' ? 'scale-105' : 'opacity-70'
                          }`}
                          style={{
                            background: gameType === 'competitive' 
                              ? 'rgba(255, 255, 255, 1)' 
                              : 'rgba(255, 255, 255, 0.5)',
                            color: '#8b00ff',
                          }}
                        >
                          🏆 Competitive
                        </button>
                        <button
                          onClick={() => {
                            setGameType('practice');
                            setResult('practice');
                          }}
                          className={`p-3 rounded-lg font-semibold transition ${
                            gameType === 'practice' ? 'scale-105' : 'opacity-70'
                          }`}
                          style={{
                            background: gameType === 'practice' 
                              ? 'rgba(255, 255, 255, 1)' 
                              : 'rgba(255, 255, 255, 0.5)',
                            color: '#8b00ff',
                          }}
                        >
                          🎯 Practice
                        </button>
                      </div>
                    </div>

                    {gameType === 'competitive' && (
                      <div>
                        <label className="block text-white mb-2 font-semibold">Result</label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => setResult('win')}
                            className={`p-3 rounded-lg font-semibold transition ${
                              result === 'win' ? 'scale-105' : 'opacity-70'
                            }`}
                            style={{
                              background: result === 'win' 
                                ? 'rgba(255, 255, 255, 1)' 
                                : 'rgba(255, 255, 255, 0.5)',
                              color: '#00ff88',
                            }}
                          >
                            ✓ Win
                          </button>
                          <button
                            onClick={() => setResult('loss')}
                            className={`p-3 rounded-lg font-semibold transition ${
                              result === 'loss' ? 'scale-105' : 'opacity-70'
                            }`}
                            style={{
                              background: result === 'loss' 
                                ? 'rgba(255, 255, 255, 1)' 
                                : 'rgba(255, 255, 255, 0.5)',
                              color: '#ff0066',
                            }}
                          >
                            ✗ Loss
                          </button>
                        </div>
                      </div>
                    )}

                    <button
                      onClick={handleSubmit}
                      disabled={saving || !score}
                      className="w-full py-4 rounded-lg font-bold text-xl transition disabled:opacity-50"
                      style={{
                        background: 'rgba(255, 255, 255, 1)',
                        color: '#8b00ff',
                      }}
                    >
                      {saving ? '💾 Saving...' : '✓ Save Game'}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};