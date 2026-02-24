import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import type { Session } from '@supabase/supabase-js';
import Auth from './Auth';
import { GameForm } from './components/GameForm';
import { Dashboard } from './components/Dashboard';
import { GameHistory } from './components/GameHistory';
import { Settings } from './components/Settings';
import { PracticeSession } from './components/PracticeSession';
import { Discover } from './components/Discover';
import './App.css';

type View = 'form' | 'dashboard' | 'history' | 'settings' | 'practice' | 'discover';

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>('dashboard');
  const [refreshKey, setRefreshKey] = useState(0);
  const [editGameId, setEditGameId] = useState<string | undefined>(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="font-mono tracking-widest animate-pulse" style={{ color: 'var(--neon-cyan)' }}>
          LOADING...
        </p>
      </div>
    );
  }

  if (!session) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen" style={{ position: 'relative', zIndex: 1 }}>
      <header className="sticky top-0 z-10 glass-effect" style={{ 
        borderBottom: '2px solid var(--neon-purple)',
        boxShadow: '0 0 20px var(--neon-purple)'
      }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl sm:text-3xl font-bold app-title">🎯 Pinball Coach</h1>
            <div className="flex items-center gap-3">
              <span className="text-purple-400 font-mono text-xs hidden sm:block">
                {session.user.email}
              </span>
              <button
                onClick={handleSignOut}
                className="text-xs font-mono py-1 px-3 rounded border border-purple-800 text-purple-400 hover:border-purple-400 hover:text-purple-300 transition-colors"
              >
                LOGOUT
              </button>
            </div>
          </div>
          <nav className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => { setView('dashboard'); setEditGameId(undefined); }}
            className={`flex-1 w-full py-3 px-4 rounded-lg font-semibold text-sm sm:text-base nav-button ${
              view === 'dashboard' ? 'nav-button-active' : ''
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => { setView('form'); setEditGameId(undefined); }}
            className={`flex-1 w-full py-3 px-4 rounded-lg font-semibold text-sm sm:text-base nav-button ${
              view === 'form' ? 'nav-button-active' : ''
            }`}
          >
            Add Game
          </button>
          <button
            onClick={() => { setView('practice'); setEditGameId(undefined); }}
            className={`flex-1 w-full py-3 px-4 rounded-lg font-semibold text-sm sm:text-base nav-button ${
              view === 'practice' ? 'nav-button-active' : ''
            }`}
          >
            Practice
          </button>
          <button
            onClick={() => { setView('discover'); setEditGameId(undefined); }}
            className={`flex-1 w-full py-3 px-4 rounded-lg font-semibold text-sm sm:text-base nav-button ${
              view === 'discover' ? 'nav-button-active' : ''
            }`}
          >
            Discover
          </button>
          <button
            onClick={() => { setView('history'); setEditGameId(undefined); }}
            className={`flex-1 w-full py-3 px-4 rounded-lg font-semibold text-sm sm:text-base nav-button ${
              view === 'history' ? 'nav-button-active' : ''
            }`}
          >
            History
          </button>
          <button
            onClick={() => { setView('settings'); setEditGameId(undefined); }}
            className={`flex-1 w-full py-3 px-4 rounded-lg font-semibold text-sm sm:text-base nav-button ${
              view === 'settings' ? 'nav-button-active' : ''
            }`}
          >
            Settings
          </button>
        </nav>
        </div>
      </header>

<main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  {view === 'dashboard' && (
    <div key={refreshKey}>
      <Dashboard onSyncComplete={handleIFPASync} />
    </div>
  )}
  {view === 'form' && (
    <GameForm onGameAdded={handleGameAdded} editGameId={editGameId} />
  )}
  {view === 'history' && (
    <div key={refreshKey}>
      <GameHistory onGameDeleted={handleGameDeleted} onEditGame={handleEditGame} />
    </div>
  )}
  {view === 'discover' && <Discover />}
  {view === 'settings' && <Settings />}
  {view === 'practice' && (
    <div>
      <p style={{ color: 'red' }}>PRACTICE VIEW LOADED</p>
      <PracticeSession />
    </div>
  )}
    </main>
    </div>
  );
}

export default App;