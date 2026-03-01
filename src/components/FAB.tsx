import React from 'react';

interface FABProps {
  onClick: () => void;
}

export const FAB: React.FC<FABProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 w-16 h-16 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 z-40"
      style={{
        background: 'linear-gradient(135deg, #8b00ff 0%, #00ffff 100%)',
        border: '3px solid var(--neon-cyan)',
        boxShadow: '0 0 30px var(--neon-cyan), 0 0 60px var(--neon-purple), 0 10px 40px rgba(0,0,0,0.3)',
      }}
      aria-label="Quick add game"
    >
      <svg 
        className="w-8 h-8 mx-auto" 
        fill="none" 
        stroke="white" 
        viewBox="0 0 24 24"
        strokeWidth={3}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
      </svg>
    </button>
  );
};