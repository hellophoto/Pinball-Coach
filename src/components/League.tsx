import React, { useState, useEffect } from 'react';
import type { LeagueStats } from '../types';
import { getLeagueStats, importLeagueCSV, getSettings } from '../supabaseUtils';
import { formatScore } from '../supabaseUtils';

export const League: React.FC = () => {
  const [stats, setStats] = useState<LeagueStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<string | null>(null);

  useEffect(() => {
    loadLeagueStats();
  }, []);

  const loadLeagueStats = async () => {
    setLoading(true);
    try {
      const data = await getLeagueStats();
      setStats(data);
      if (data.length > 0 && !selectedSeason) {
        setSelectedSeason(data[0].season);
      }
    } catch (error) {
      console.error('Error loading league stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setImportMessage(null);

    try {
      const settings = await getSettings();
      
      if (!settings.leaguePlayerId) {
        setImportMessage('League Player ID not set. Please add it in Settings.');
        setImporting(false);
        return;
      }

      const text = await file.text();
      await importLeagueCSV(text, settings.leaguePlayerId);
      await loadLeagueStats();
      setImportMessage('✅ League data imported successfully!');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setImportMessage(`Error importing league data: ${errorMsg}`);
    } finally {
      setImporting(false);
    }
  };

  const currentStats = stats.find(s => s.season === selectedSeason);

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="font-mono animate-pulse" style={{ color: 'var(--neon-cyan)' }}>
          LOADING LEAGUE STATS...
        </p>
      </div>
    );
  }

  if (stats.length === 0) {
    return (
      <div className="max-w-[600px] mx-auto">
        <div className="card-synthwave rounded-lg p-6 shadow-lg">
          <h2 className="text-2xl font-bold mb-4" style={{ 
            color: 'var(--neon-cyan)',
            textShadow: '0 0 10px var(--neon-cyan)'
          }}>League Stats</h2>
          
          {importMessage && (
            <div className="mb-4 rounded p-3 border-2" style={{
              background: importMessage.includes('Error') 
                ? 'rgba(255, 0, 102, 0.2)' 
                : 'rgba(0, 255, 136, 0.2)',
              borderColor: importMessage.includes('Error') ? '#ff0066' : '#00ff88',
            }}>
              <p className="text-sm" style={{ 
                color: importMessage.includes('Error') ? '#ff0066' : '#00ff88' 
              }}>{importMessage}</p>
            </div>
          )}
          
          <p className="mb-4" style={{ color: 'var(--neon-purple)' }}>
            No league data yet. Make sure your League Player ID is set in Settings, then upload your league CSV.
          </p>
          
          <label className="w-full button-primary font-semibold py-3 rounded-lg cursor-pointer block text-center">
            {importing ? '⏳ Importing...' : '📤 Upload League CSV'}
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              disabled={importing}
              className="hidden"
            />
          </label>
        </div>
      </div>
    );
  }

  const winRate = currentStats && (currentStats.wins + currentStats.losses) > 0
    ? ((currentStats.wins / (currentStats.wins + currentStats.losses)) * 100).toFixed(1)
    : '0.0';

  // Get strongest and weakest machines
  const sortedMachines = currentStats?.machineStats
    ? [...currentStats.machineStats].sort((a, b) => b.winRate - a.winRate)
    : [];
  const strongestMachines = sortedMachines.slice(0, 5);
  const weakestMachines = sortedMachines.slice(-5).reverse();

  return (
    <div className="max-w-[800px] mx-auto space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold" style={{ 
          color: 'var(--neon-cyan)',
          textShadow: '0 0 10px var(--neon-cyan), 0 0 20px var(--neon-cyan)'
        }}>League Stats</h2>
        <label className="px-4 py-2 rounded-lg font-semibold cursor-pointer button-primary">
          {importing ? '⏳ Importing...' : '📤 Upload CSV'}
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            disabled={importing}
            className="hidden"
          />
        </label>
      </div>

      {importMessage && (
        <div className="rounded p-3 border-2" style={{
          background: importMessage.includes('Error') 
            ? 'rgba(255, 0, 102, 0.2)' 
            : 'rgba(0, 255, 136, 0.2)',
          borderColor: importMessage.includes('Error') ? '#ff0066' : '#00ff88',
        }}>
          <p className="text-sm" style={{ 
            color: importMessage.includes('Error') ? '#ff0066' : '#00ff88' 
          }}>{importMessage}</p>
        </div>
      )}

      {/* Season Selector */}
      {stats.length > 1 && (
        <div className="card-synthwave rounded-lg p-4">
          <label className="block mb-2 text-sm" style={{ color: 'var(--neon-cyan)' }}>
            Season
          </label>
          <select
            value={selectedSeason || ''}
            onChange={(e) => setSelectedSeason(e.target.value)}
            className="w-full input-synthwave rounded px-4 py-2"
          >
            {stats.map(s => (
              <option key={s.season} value={s.season}>{s.season}</option>
            ))}
          </select>
        </div>
      )}

      {/* Season Stats */}
      {currentStats && (
        <>
          <div className="card-synthwave rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4" style={{ 
              color: 'var(--neon-magenta)',
              textShadow: '0 0 10px var(--neon-magenta)'
            }}>{currentStats.season} Season</h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="stat-card rounded p-4">
                <div className="text-sm" style={{ color: 'var(--neon-purple)' }}>Win Rate</div>
                <div className="text-2xl font-bold score-animate" style={{ 
                  color: 'var(--neon-yellow)',
                  textShadow: '0 0 10px var(--neon-yellow)'
                }}>{winRate}%</div>
              </div>
              <div className="stat-card rounded p-4">
                <div className="text-sm" style={{ color: 'var(--neon-purple)' }}>Wins</div>
                <div className="text-2xl font-bold score-animate" style={{ 
                  color: '#00ff88',
                  textShadow: '0 0 10px #00ff88'
                }}>{currentStats.wins}</div>
              </div>
              <div className="stat-card rounded p-4">
                <div className="text-sm" style={{ color: 'var(--neon-purple)' }}>Losses</div>
                <div className="text-2xl font-bold score-animate" style={{ 
                  color: '#ff0066',
                  textShadow: '0 0 10px #ff0066'
                }}>{currentStats.losses}</div>
              </div>
              <div className="stat-card rounded p-4">
                <div className="text-sm" style={{ color: 'var(--neon-purple)' }}>Points</div>
                <div className="text-2xl font-bold score-animate" style={{ 
                  color: 'var(--neon-cyan)',
                  textShadow: '0 0 10px var(--neon-cyan)'
                }}>{currentStats.points}</div>
              </div>
            </div>
          </div>

          {/* Strongest Machines */}
          {strongestMachines.length > 0 && (
            <div className="card-synthwave rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4" style={{ 
                color: 'var(--neon-magenta)',
                textShadow: '0 0 10px var(--neon-magenta)'
              }}>💪 Strongest Machines</h3>
              <div className="space-y-2">
                {strongestMachines.map((machine, index) => (
                  <div key={machine.machine} className="stat-card rounded p-3">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm" style={{ color: 'var(--neon-purple)' }}>
                          #{index + 1}
                        </span>
                        <span className="font-semibold" style={{ color: 'var(--neon-cyan)' }}>
                          {machine.machine}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm" style={{ color: 'var(--neon-purple)' }}>
                          {machine.wins}W - {machine.losses}L
                        </span>
                        <span className="font-bold" style={{ 
                          color: '#00ff88',
                          textShadow: '0 0 10px #00ff88'
                        }}>
                          {(machine.winRate * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between text-xs" style={{ color: 'var(--neon-purple)' }}>
                      <span>Your Avg: {formatScore(machine.avgScore || 0)}</span>
                      {currentStats.leagueAverages.find(a => a.machine === machine.machine) && (
                        <span>
                          League Avg: {formatScore(
                            currentStats.leagueAverages.find(a => a.machine === machine.machine)?.avgScore || 0
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Weakest Machines */}
          {weakestMachines.length > 0 && (
            <div className="card-synthwave rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4" style={{ 
                color: 'var(--neon-magenta)',
                textShadow: '0 0 10px var(--neon-magenta)'
              }}>📚 Practice These Machines</h3>
              <div className="space-y-2">
                {weakestMachines.map((machine, index) => (
                  <div key={machine.machine} className="stat-card rounded p-3">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm" style={{ color: 'var(--neon-purple)' }}>
                          #{index + 1}
                        </span>
                        <span className="font-semibold" style={{ color: 'var(--neon-cyan)' }}>
                          {machine.machine}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm" style={{ color: 'var(--neon-purple)' }}>
                          {machine.wins}W - {machine.losses}L
                        </span>
                        <span className="font-bold" style={{ 
                          color: '#ff0066',
                          textShadow: '0 0 10px #ff0066'
                        }}>
                          {(machine.winRate * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between text-xs" style={{ color: 'var(--neon-purple)' }}>
                      <span>Your Avg: {formatScore(machine.avgScore || 0)}</span>
                      {currentStats.leagueAverages.find(a => a.machine === machine.machine) && (
                        <span>
                          League Avg: {formatScore(
                            currentStats.leagueAverages.find(a => a.machine === machine.machine)?.avgScore || 0
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};