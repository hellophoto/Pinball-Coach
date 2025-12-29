import React, { useMemo } from 'react';
import { getRandomTip, getTipsForTable, getFallbackTip } from '../data/machineTips';

interface TipModalProps {
  tableName: string;
  onClose: () => void;
  showAllTips?: boolean;
}

export const TipModal: React.FC<TipModalProps> = ({ tableName, onClose, showAllTips = false }) => {
  const machineData = getTipsForTable(tableName);
  const hasTips = machineData !== null;
  
  // For post-game modal, show one random tip (memoized to avoid recalculation)
  // For view tips button, show all tips
  const displayTip = useMemo(
    () => (showAllTips ? null : getRandomTip(tableName)),
    [showAllTips, tableName]
  );
  const allTips = showAllTips && machineData ? machineData.tips : [];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ 
        background: 'rgba(10, 0, 21, 0.85)',
        backdropFilter: 'blur(5px)',
      }}
      onClick={onClose}
    >
      <div 
        className="tip-modal-content max-w-2xl w-full rounded-lg p-6 relative"
        style={{
          background: 'linear-gradient(135deg, rgba(21, 0, 37, 0.98) 0%, rgba(26, 0, 51, 0.98) 100%)',
          border: '3px solid var(--neon-cyan)',
          boxShadow: '0 0 20px var(--neon-cyan), 0 0 40px var(--neon-cyan), inset 0 0 20px rgba(0, 255, 255, 0.1)',
          animation: 'modalSlideIn 0.3s ease-out',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Animated border effect */}
        <div 
          className="absolute inset-0 rounded-lg pointer-events-none"
          style={{
            background: 'linear-gradient(45deg, var(--neon-cyan), var(--neon-magenta), var(--neon-cyan))',
            backgroundSize: '200% 200%',
            animation: 'borderGlow 3s ease infinite',
            opacity: 0.3,
            zIndex: -1,
          }}
        />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-2xl font-bold transition-all duration-300"
          style={{
            color: 'var(--neon-cyan)',
            textShadow: '0 0 10px var(--neon-cyan)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.2) rotate(90deg)';
            e.currentTarget.style.color = 'var(--neon-magenta)';
            e.currentTarget.style.textShadow = '0 0 20px var(--neon-magenta)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
            e.currentTarget.style.color = 'var(--neon-cyan)';
            e.currentTarget.style.textShadow = '0 0 10px var(--neon-cyan)';
          }}
        >
          ×
        </button>

        {/* Table name */}
        <h2 
          className="text-2xl sm:text-3xl font-bold mb-6 pr-8"
          style={{
            color: 'var(--neon-magenta)',
            textShadow: '0 0 10px var(--neon-magenta), 0 0 20px var(--neon-magenta)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          🎯 {tableName}
        </h2>

        {/* Tips content */}
        {hasTips ? (
          <div className="space-y-4">
            {!showAllTips && displayTip && (
              <div 
                className="tip-card rounded-lg p-4"
                style={{
                  background: 'rgba(0, 255, 255, 0.1)',
                  border: '2px solid var(--neon-cyan)',
                  boxShadow: '0 0 15px rgba(0, 255, 255, 0.3)',
                }}
              >
                <p 
                  className="text-base sm:text-lg leading-relaxed"
                  style={{
                    color: 'var(--neon-cyan)',
                  }}
                >
                  💡 {displayTip}
                </p>
              </div>
            )}

            {showAllTips && allTips.map((tip, index) => (
              <div 
                key={index}
                className="tip-card rounded-lg p-4"
                style={{
                  background: 'rgba(0, 255, 255, 0.1)',
                  border: '2px solid var(--neon-cyan)',
                  boxShadow: '0 0 15px rgba(0, 255, 255, 0.3)',
                  animation: `tipFadeIn 0.5s ease-out ${index * 0.1}s both`,
                }}
              >
                <p 
                  className="text-sm sm:text-base leading-relaxed"
                  style={{
                    color: 'var(--neon-cyan)',
                  }}
                >
                  💡 {tip}
                </p>
              </div>
            ))}

            {/* Rule sheet button */}
            <div className="pt-4">
              <a
                href={machineData.ruleSheetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center py-3 px-6 rounded-lg font-bold text-base sm:text-lg transition-all duration-300"
                style={{
                  background: 'rgba(255, 0, 255, 0.2)',
                  border: '2px solid var(--neon-magenta)',
                  color: 'var(--neon-magenta)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  boxShadow: '0 0 10px var(--neon-magenta)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 0, 255, 0.3)';
                  e.currentTarget.style.boxShadow = '0 0 20px var(--neon-magenta), 0 0 40px var(--neon-magenta)';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 0, 255, 0.2)';
                  e.currentTarget.style.boxShadow = '0 0 10px var(--neon-magenta)';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                📖 Read Full Rules
              </a>
            </div>
          </div>
        ) : (
          <div 
            className="rounded-lg p-6 text-center"
            style={{
              background: 'rgba(190, 0, 255, 0.1)',
              border: '2px solid var(--neon-purple)',
              boxShadow: '0 0 15px rgba(190, 0, 255, 0.3)',
            }}
          >
            <p 
              className="text-lg leading-relaxed mb-4"
              style={{
                color: 'var(--neon-purple)',
              }}
            >
              💡 {getFallbackTip()}
            </p>
            <p 
              className="text-sm"
              style={{
                color: 'var(--neon-purple-dim)',
              }}
            >
              Tips for this table will be added soon!
            </p>
          </div>
        )}

        {/* Close button at bottom */}
        <div className="pt-6">
          <button
            onClick={onClose}
            className="w-full py-3 px-6 rounded-lg font-bold text-base transition-all duration-300"
            style={{
              background: 'rgba(0, 255, 255, 0.1)',
              border: '2px solid var(--neon-cyan)',
              color: 'var(--neon-cyan)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(0, 255, 255, 0.2)';
              e.currentTarget.style.boxShadow = '0 0 15px var(--neon-cyan)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(0, 255, 255, 0.1)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
