import React, { useState, useEffect } from 'react';
import type { OPDBMachine } from '../types';
import { getRecommendations } from '../supabaseUtils';
import { formatMachineDetails } from '../services/opdbService';

export const Discover: React.FC = () => {
  const [recommendations, setRecommendations] = useState<OPDBMachine[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedMachine, setExpandedMachine] = useState<string | null>(null);

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    setLoading(true);
    try {
      const recs = await getRecommendations();
      setRecommendations(recs);
    } catch (error) {
      console.error('Error loading recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="font-mono animate-pulse" style={{ color: 'var(--neon-cyan)' }}>
          GENERATING RECOMMENDATIONS...
        </p>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="max-w-[600px] mx-auto">
        <div className="card-synthwave rounded-lg p-6 shadow-lg text-center">
          <h2 className="text-2xl font-bold mb-4" style={{ 
            color: 'var(--neon-cyan)',
            textShadow: '0 0 10px var(--neon-cyan)'
          }}>No Recommendations Yet</h2>
          <p style={{ color: 'var(--neon-purple)' }}>
            Play more games to get personalized machine recommendations based on your preferences!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[800px] mx-auto space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold" style={{ 
          color: 'var(--neon-cyan)',
          textShadow: '0 0 10px var(--neon-cyan), 0 0 20px var(--neon-cyan)'
        }}>Discover Machines</h2>
        <button
          onClick={loadRecommendations}
          className="px-4 py-2 rounded-lg font-semibold text-sm button-primary"
        >
          🔄 Refresh
        </button>
      </div>

      <div className="card-synthwave rounded-lg p-4">
        <p className="text-sm" style={{ color: 'var(--neon-purple)' }}>
          Based on your play history, we think you'll enjoy these machines:
        </p>
      </div>

      <div className="space-y-3">
        {recommendations.map((machine, index) => (
          <div key={machine.opdb_id} className="card-synthwave rounded-lg p-4 shadow-lg">
            <div 
              className="cursor-pointer"
              onClick={() => setExpandedMachine(
                expandedMachine === machine.opdb_id ? null : machine.opdb_id
              )}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm" style={{ color: 'var(--neon-purple)' }}>
                      #{index + 1}
                    </span>
                    <h3 className="text-lg font-semibold" style={{ color: 'var(--neon-cyan)' }}>
                      {machine.name}
                    </h3>
                  </div>
                  {formatMachineDetails(machine) && (
                    <p className="text-sm mt-1" style={{ color: 'var(--neon-purple)', opacity: 0.9 }}>
                      {formatMachineDetails(machine)}
                    </p>
                  )}
                </div>
                <svg 
                  className={`w-5 h-5 transition-transform ${expandedMachine === machine.opdb_id ? 'rotate-180' : ''}`}
                  style={{ color: 'var(--neon-cyan)' }}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {/* Why recommended */}
              <div className="flex flex-wrap gap-2 mt-2">
                {machine.designer && machine.designer.length > 0 && (
                  <span className="px-2 py-1 text-xs rounded border" style={{
                    background: 'rgba(0, 255, 255, 0.1)',
                    borderColor: 'var(--neon-cyan)',
                    color: 'var(--neon-cyan)',
                  }}>
                    Designer: {machine.designer[0]}
                  </span>
                )}
                {machine.manufacturer && (
                  <span className="px-2 py-1 text-xs rounded border" style={{
                    background: 'rgba(139, 0, 255, 0.1)',
                    borderColor: 'var(--neon-purple)',
                    color: 'var(--neon-purple)',
                  }}>
                    {machine.manufacturer}
                  </span>
                )}
                {machine.theme && machine.theme.length > 0 && (
                  <span className="px-2 py-1 text-xs rounded border" style={{
                    background: 'rgba(255, 215, 0, 0.1)',
                    borderColor: 'var(--neon-yellow)',
                    color: 'var(--neon-yellow)',
                  }}>
                    {machine.theme[0]}
                  </span>
                )}
              </div>
            </div>

            {/* Expanded details */}
            {expandedMachine === machine.opdb_id && (
              <div className="mt-4 pt-4 border-t-2" style={{ borderColor: 'rgba(139, 0, 255, 0.3)' }}>
                <div className="space-y-3 text-sm">
                  {machine.description && (
                    <div>
                      <span className="font-semibold" style={{ color: 'var(--neon-cyan)' }}>Description: </span>
                      <span style={{ color: 'var(--neon-purple)' }}>{machine.description}</span>
                    </div>
                  )}
                  
                  {machine.features && machine.features.length > 0 && (
                    <div>
                      <span className="font-semibold" style={{ color: 'var(--neon-cyan)' }}>Features: </span>
                      <span style={{ color: 'var(--neon-purple)' }}>{machine.features.join(', ')}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {machine.gameplay_complexity !== undefined && (
                      <div className="stat-card rounded p-2">
                        <div className="text-xs" style={{ color: 'var(--neon-purple)' }}>Gameplay</div>
                        <div className="font-bold" style={{ color: 'var(--neon-cyan)' }}>
                          {machine.gameplay_complexity}/10
                        </div>
                      </div>
                    )}
                    {machine.rule_complexity !== undefined && (
                      <div className="stat-card rounded p-2">
                        <div className="text-xs" style={{ color: 'var(--neon-purple)' }}>Rules</div>
                        <div className="font-bold" style={{ color: 'var(--neon-cyan)' }}>
                          {machine.rule_complexity}/10
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};