import { useState } from 'react';
import { GameForm } from './components/GameForm';
import { Dashboard } from './components/Dashboard';
import { GameHistory } from './components/GameHistory';
import { Settings } from './components/Settings';
import './App.css';

type View = 'form' | 'dashboard' | 'history' | 'settings';

function App() {
  const [view, setView] = useState<View>('dashboard');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleGameAdded = () => {
    setRefreshKey(prev => prev + 1);
    setView('dashboard');
  };

  const handleGameDeleted = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleIFPASync = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen" style={{ position: 'relative', zIndex: 1 }}>
      {/* Header */}
      <header className="sticky top-0 z-10 glass-effect" style={{ 
        borderBottom: '2px solid var(--neon-purple)',
        boxShadow: '0 0 20px var(--neon-purple)'
      }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl sm:text-3xl font-bold mb-4 app-title text-center">🎯 Pinball Coach</h1>
          {/* Navigation */}
          <nav className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => setView('dashboard')}
              className={`flex-1 w-full py-2 px-3 sm:px-4 rounded-lg font-semibold text-sm sm:text-base nav-button ${
                view === 'dashboard' ? 'nav-button-active' : ''
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setView('form')}
              className={`flex-1 w-full py-2 px-3 sm:px-4 rounded-lg font-semibold text-sm sm:text-base nav-button ${
                view === 'form' ? 'nav-button-active' : ''
              }`}
            >
              Add Game
            </button>
            <button
              onClick={() => setView('history')}
              className={`flex-1 w-full py-2 px-3 sm:px-4 rounded-lg font-semibold text-sm sm:text-base nav-button ${
                view === 'history' ? 'nav-button-active' : ''
              }`}
            >
              History
            </button>
            <button
              onClick={() => setView('settings')}
              className={`flex-1 w-full py-2 px-3 sm:px-4 rounded-lg font-semibold text-sm sm:text-base nav-button ${
                view === 'settings' ? 'nav-button-active' : ''
              }`}
            >
              Settings
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {view === 'dashboard' && (
          <div key={refreshKey}>
            <Dashboard onSyncComplete={handleIFPASync} />
          </div>
        )}
        {view === 'form' && <GameForm onGameAdded={handleGameAdded} />}
        {view === 'history' && (
          <div key={refreshKey}>
            <GameHistory onGameDeleted={handleGameDeleted} />
          </div>
        )}
        {view === 'settings' && <Settings />}
      </main>
    </div>
  );
}

export default App;

