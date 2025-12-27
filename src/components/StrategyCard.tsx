import React, { useState } from 'react';
import { getTableStrategy } from '../utils';

interface StrategyCardProps {
  tableName: string;
}

export const StrategyCard: React.FC<StrategyCardProps> = ({ tableName }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const strategy = getTableStrategy(tableName);

  if (!strategy) {
    return null;
  }

  return (
    <div className="bg-gray-700 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-600 transition"
      >
        <span className="text-white font-semibold">📋 View Strategy</span>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
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
              <div className="text-blue-400 font-semibold text-sm mb-1">Skill Shot</div>
              <div className="text-gray-300 text-sm">{strategy.skillShot}</div>
            </div>
          )}
          {strategy.modes && (
            <div>
              <div className="text-blue-400 font-semibold text-sm mb-1">Modes</div>
              <div className="text-gray-300 text-sm">{strategy.modes}</div>
            </div>
          )}
          {strategy.multiballs && (
            <div>
              <div className="text-blue-400 font-semibold text-sm mb-1">Multiballs</div>
              <div className="text-gray-300 text-sm">{strategy.multiballs}</div>
            </div>
          )}
          {strategy.tips && (
            <div>
              <div className="text-blue-400 font-semibold text-sm mb-1">Tips</div>
              <div className="text-gray-300 text-sm">{strategy.tips}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
