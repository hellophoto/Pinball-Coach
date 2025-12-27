import { useState } from 'react';
import { GameForm } from './components/GameForm';
import { Dashboard } from './components/Dashboard';
import { GameHistory } from './components/GameHistory';

type View = 'form' | 'dashboard' | 'history';

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

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 shadow-lg sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-3xl font-bold text-white mb-4">🎯 Pinball Coach</h1>
          {/* Navigation */}
          <nav className="flex gap-2">
            <button
              onClick={() => setView('dashboard')}
              className={`flex-1 py-2 px-4 rounded-lg font-semibold transition ${
                view === 'dashboard'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setView('form')}
              className={`flex-1 py-2 px-4 rounded-lg font-semibold transition ${
                view === 'form'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Add Game
            </button>
            <button
              onClick={() => setView('history')}
              className={`flex-1 py-2 px-4 rounded-lg font-semibold transition ${
                view === 'history'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              History
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {view === 'dashboard' && (
          <div key={refreshKey}>
            <Dashboard />
          </div>
        )}
        {view === 'form' && <GameForm onGameAdded={handleGameAdded} />}
        {view === 'history' && (
          <div key={refreshKey}>
            <GameHistory onGameDeleted={handleGameDeleted} />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;

