import { useState, useEffect } from 'react';
import { GameForm } from './components/GameForm';
import { Dashboard } from './components/Dashboard';
import { GameHistory } from './components/GameHistory';
import { Settings } from './components/Settings';
import { initializeOPDBSync } from './utils/opdbSync';
import './App.css';

type View = 'form' | 'dashboard' | 'history' | 'settings';

function App() {
  const [view, setView] = useState<View>('dashboard');
  const [refreshKey, setRefreshKey] = useState(0);
  const [editGameId, setEditGameId] = useState<string | undefined>(undefined);

  // Initialize OPDB sync on mount
  useEffect(() => {
    const cleanup = initializeOPDBSync();
    return cleanup;
  }, []);

  const handleGameAdded = () => {
    setRefreshKey(prev => prev + 1);
    setEditGameId(undefined);
    setView('dashboard');
  };

  const handleGameDeleted = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleIFPASync = () => {
    setRefreshKey(prev => prev + 1);
  };
  
  const handleEditGame = (gameId: string) => {
    setEditGameId(gameId);
    setView('form');
  };

  return (
    <div className="min-h-screen" style={{ position: 'relative', zIndex: 1 }}>
      {/* Header */}
      <header className="sticky top-0 z-10 glass-effect max-h-20" style={{ 
        borderBottom: '2px solid var(--neon-purple)',
        boxShadow: '0 0 20px var(--neon-purple)'
      }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-center gap-3">
            <img 
              src="/pinball-coach-logo.jpg" 
              alt="Pinball Coach" 
              className="max-h-8 xs:max-h-10 md:max-h-12 w-auto object-contain" 
            />
          </div>
          {/* Navigation */}
          <nav className="flex flex-col sm:flex-row gap-2 mt-3">
            <button
              onClick={() => {
                setView('dashboard');
                setEditGameId(undefined);
              }}
              className={`flex-1 w-full py-2 px-3 sm:px-4 rounded-lg font-semibold text-sm sm:text-base nav-button ${
                view === 'dashboard' ? 'nav-button-active' : ''
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => {
                setView('form');
                setEditGameId(undefined);
              }}
              className={`flex-1 w-full py-2 px-3 sm:px-4 rounded-lg font-semibold text-sm sm:text-base nav-button ${
                view === 'form' ? 'nav-button-active' : ''
              }`}
            >
              Add Game
            </button>
            <button
              onClick={() => {
                setView('history');
                setEditGameId(undefined);
              }}
              className={`flex-1 w-full py-2 px-3 sm:px-4 rounded-lg font-semibold text-sm sm:text-base nav-button ${
                view === 'history' ? 'nav-button-active' : ''
              }`}
            >
              History
            </button>
            <button
              onClick={() => {
                setView('settings');
                setEditGameId(undefined);
              }}
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
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {view === 'dashboard' && (
          <div key={refreshKey}>
            <Dashboard onSyncComplete={handleIFPASync} />
          </div>
        )}
        {view === 'form' && <GameForm onGameAdded={handleGameAdded} editGameId={editGameId} />}
        {view === 'history' && (
          <div key={refreshKey}>
            <GameHistory onGameDeleted={handleGameDeleted} onEditGame={handleEditGame} />
          </div>
        )}
        {view === 'settings' && <Settings />}
      </main>
    </div>
  );
}

export default App;
