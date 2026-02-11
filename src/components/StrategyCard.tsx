import React, { useState, useEffect } from 'react';
import type { TableStrategy } from '../types';
import { getTableStrategy } from '../supabaseUtils';

interface StrategyCardProps {
  tableName: string;
}

export const StrategyCard: React.FC<StrategyCardProps> = ({ tableName }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [strategy, setStrategy] = useState<TableStrategy | undefined>(undefined);

  useEffect(() => {
    getTableStrategy(tableName).then(setStrategy);
  }, [tableName]);

  if (!strategy) {
    return null;
  }

  return (
    <div className="stat-card rounded-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between text-left hover-glow transition"
      >
        <span className="font-semibold" style={{ color: 'var(--neon-cyan)' }}>📋 View Strategy</span>
        <svg
          className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          style={{ color: 'var(--neon-purple)' }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isExpanded && (
        <div className="px-4 pb-4 space-y-3">
          {strategy.skillShot && (
            <div>
              <div className="font-semibold text-sm mb-1" style={{ 
                color: 'var(--neon-cyan)',
                textShadow: '0 0 10px var(--neon-cyan)'
              }}>Skill Shot</div>
              <div className="text-sm" style={{ color: 'var(--neon-purple)' }}>{strategy.skillShot}</div>
            </div>
          )}
          {strategy.modes && (
            <div>
              <div className="font-semibold text-sm mb-1" style={{ 
                color: 'var(--neon-cyan)',
                textShadow: '0 0 10px var(--neon-cyan)'
              }}>Modes</div>
              <div className="text-sm" style={{ color: 'var(--neon-purple)' }}>{strategy.modes}</div>
            </div>
          )}
          {strategy.multiballs && (
            <div>
              <div className="font-semibold text-sm mb-1" style={{ 
                color: 'var(--neon-cyan)',
                textShadow: '0 0 10px var(--neon-cyan)'
              }}>Multiballs</div>
              <div className="text-sm" style={{ color: 'var(--neon-purple)' }}>{strategy.multiballs}</div>
            </div>
          )}
          {strategy.tips && (
            <div>
              <div className="font-semibold text-sm mb-1" style={{ 
                color: 'var(--neon-cyan)',
                textShadow: '0 0 10px var(--neon-cyan)'
              }}>Tips</div>
              <div className="text-sm" style={{ color: 'var(--neon-purple)' }}>{strategy.tips}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};