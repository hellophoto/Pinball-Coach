import React, { useState, useEffect } from 'react';
import { GameForm } from './components/GameForm';
import { Dashboard } from './components/Dashboard';
import { GameHistory } from './components/GameHistory';
import { Settings } from './components/Settings';
import { initializeOPDBSync } from './utils/opdbSync';
import type { GameSession, AppSettings } from './types';

function App() {
  const [games, setGames] = useState<GameSession[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    goalScore: 1000000,
    sessionDuration: 60,
    opdbApiKey: '',
    enableSync: false
  });
  const [activeTab, setActiveTab] = useState<'form' | 'dashboard' | 'history' | 'settings'>('form');

  useEffect(() => {
    const savedGames = localStorage.getItem('pinballGames');
    if (savedGames) {
      setGames(JSON.parse(savedGames));
    }

    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  useEffect(() => {
    if (settings.enableSync && settings.opdbApiKey) {
      initializeOPDBSync(settings.opdbApiKey);
    }
  }, [settings.enableSync, settings.opdbApiKey]);

  const handleGameSubmit = (game: Omit<GameSession, 'id' | 'timestamp'>) => {
    const newGame: GameSession = {
      ...game,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString()
    };
    const updatedGames = [...games, newGame];
    setGames(updatedGames);
    localStorage.setItem('pinballGames', JSON.stringify(updatedGames));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center mb-8">
          <img src="/pinball-coach-logo.jpg" alt="Pinball Coach" className="h-[60px]" />
          <h1 className="text-4xl font-bold text-white ml-4">Pinball Coach</h1>
        </div>
        
        <div className="flex justify-center mb-6 space-x-2">
          <button
            onClick={() => setActiveTab('form')}
            className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
              activeTab === 'form'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Log Game
          </button>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
              activeTab === 'dashboard'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
              activeTab === 'history'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            History
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
              activeTab === 'settings'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Settings
          </button>
        </div>

        <div className="max-w-6xl mx-auto">
          {activeTab === 'form' && (
            <GameForm onSubmit={handleGameSubmit} settings={settings} />
          )}
          {activeTab === 'dashboard' && (
            <Dashboard games={games} settings={settings} />
          )}
          {activeTab === 'history' && (
            <GameHistory games={games} />
          )}
          {activeTab === 'settings' && (
            <Settings settings={settings} onSettingsChange={setSettings} />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
