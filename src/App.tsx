import React, { useState } from 'react';
import GameForm from './components/GameForm';
import Dashboard from './components/Dashboard';
import GameHistory from './components/GameHistory';
import Settings from './components/Settings';
import { Game } from './types';

function App() {
  const [games, setGames] = useState<Game[]>(() => {
    const saved = localStorage.getItem('pinballGames');
    return saved ? JSON.parse(saved) : [];
  });

  const [currentView, setCurrentView] = useState<'form' | 'dashboard' | 'history' | 'settings'>('form');

  const addGame = (game: Omit<Game, 'id' | 'date'>) => {
    const newGame: Game = {
      ...game,
      id: Date.now().toString(),
      date: new Date().toISOString(),
    };
    const updatedGames = [...games, newGame];
    setGames(updatedGames);
    localStorage.setItem('pinballGames', JSON.stringify(updatedGames));
  };

  const deleteGame = (id: string) => {
    const updatedGames = games.filter(game => game.id !== id);
    setGames(updatedGames);
    localStorage.setItem('pinballGames', JSON.stringify(updatedGames));
  };

  const clearAllGames = () => {
    setGames([]);
    localStorage.removeItem('pinballGames');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <img 
              src="/pinball-coach-logo.jpg" 
              alt="Pinball Coach Logo" 
              className="h-[60px] rounded-lg shadow-lg"
            />
          </div>
          <h1 className="text-5xl font-bold text-white mb-2">Pinball Coach</h1>
          <p className="text-xl text-blue-200">Track Your Progress, Master Your Game</p>
        </div>

        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setCurrentView('form')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              currentView === 'form'
                ? 'bg-blue-500 text-white shadow-lg scale-105'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            Log Game
          </button>
          <button
            onClick={() => setCurrentView('dashboard')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              currentView === 'dashboard'
                ? 'bg-blue-500 text-white shadow-lg scale-105'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setCurrentView('history')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              currentView === 'history'
                ? 'bg-blue-500 text-white shadow-lg scale-105'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            History
          </button>
          <button
            onClick={() => setCurrentView('settings')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              currentView === 'settings'
                ? 'bg-blue-500 text-white shadow-lg scale-105'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            Settings
          </button>
        </div>

        <div className="max-w-6xl mx-auto">
          {currentView === 'form' && <GameForm onSubmit={addGame} />}
          {currentView === 'dashboard' && <Dashboard games={games} />}
          {currentView === 'history' && <GameHistory games={games} onDelete={deleteGame} />}
          {currentView === 'settings' && <Settings onClearAll={clearAllGames} gamesCount={games.length} />}
        </div>
      </div>
    </div>
  );
}

export default App;
