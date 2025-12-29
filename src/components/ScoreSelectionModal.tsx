import React, { useState } from 'react';

interface ScoreSelectionModalProps {
  extractedScores: number[];
  onSelectScore: (score: number) => void;
  onCancel: () => void;
  onRetake: () => void;
  photoPreview: string;
}

export const ScoreSelectionModal: React.FC<ScoreSelectionModalProps> = ({
  extractedScores,
  onSelectScore,
  onCancel,
  onRetake,
  photoPreview
}) => {
  const [selectedPlayerNumber, setSelectedPlayerNumber] = useState<number>(1);

  const handleConfirm = () => {
    // Get the score for the selected player (1-indexed)
    const score = extractedScores[selectedPlayerNumber - 1];
    if (score !== undefined) {
      onSelectScore(score);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ 
        background: 'rgba(10, 0, 21, 0.95)',
        backdropFilter: 'blur(10px)'
      }}
      onClick={(e) => {
        // Close modal when clicking backdrop
        if (e.target === e.currentTarget) {
          onCancel();
        }
      }}
    >
      <div 
        className="w-full max-w-2xl rounded-lg p-6 relative"
        style={{
          background: 'linear-gradient(135deg, rgba(21, 0, 37, 0.95) 0%, rgba(26, 0, 51, 0.95) 100%)',
          border: '2px solid var(--neon-cyan)',
          boxShadow: '0 0 30px var(--neon-cyan), 0 0 60px var(--neon-cyan)',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2" style={{ 
            color: 'var(--neon-cyan)',
            textShadow: '0 0 10px var(--neon-cyan), 0 0 20px var(--neon-cyan)'
          }}>
            📊 Select Your Score
          </h2>
          <p className="text-sm" style={{ color: 'var(--neon-purple)' }}>
            {extractedScores.length > 0 
              ? 'Choose which player number you were and confirm your score'
              : 'No scores detected. Please retake the photo or enter score manually.'}
          </p>
        </div>

        {/* Photo Preview */}
        <div className="mb-6">
          <div 
            className="rounded-lg overflow-hidden border-2"
            style={{
              borderColor: 'var(--neon-purple)',
              boxShadow: '0 0 10px var(--neon-purple)'
            }}
          >
            <img 
              src={photoPreview} 
              alt="Scoreboard preview" 
              className="w-full h-auto max-h-64 object-contain"
              style={{ background: 'rgba(0, 0, 0, 0.5)' }}
            />
          </div>
        </div>

        {extractedScores.length > 0 ? (
          <>
            {/* Player Selection */}
            <div className="mb-6">
              <label className="block mb-3 text-sm font-semibold" style={{ color: 'var(--neon-cyan)' }}>
                Which player were you?
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[1, 2, 3, 4].map((playerNum) => (
                  <button
                    key={playerNum}
                    type="button"
                    onClick={() => setSelectedPlayerNumber(playerNum)}
                    disabled={!extractedScores[playerNum - 1]}
                    className={`py-3 px-4 rounded-lg font-semibold transition-all border-2 ${
                      !extractedScores[playerNum - 1] ? 'opacity-30 cursor-not-allowed' : ''
                    }`}
                    style={{
                      background: selectedPlayerNumber === playerNum 
                        ? 'rgba(0, 255, 255, 0.2)' 
                        : 'rgba(139, 0, 255, 0.1)',
                      borderColor: selectedPlayerNumber === playerNum 
                        ? 'var(--neon-cyan)' 
                        : 'var(--neon-purple)',
                      color: selectedPlayerNumber === playerNum 
                        ? 'var(--neon-cyan)' 
                        : 'var(--neon-purple)',
                      boxShadow: selectedPlayerNumber === playerNum 
                        ? '0 0 15px var(--neon-cyan)' 
                        : 'none'
                    }}
                  >
                    Player {playerNum}
                  </button>
                ))}
              </div>
            </div>

            {/* Extracted Scores Display */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--neon-cyan)' }}>
                Detected Scores:
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[1, 2, 3, 4].map((playerNum) => {
                  const score = extractedScores[playerNum - 1];
                  return (
                    <div
                      key={playerNum}
                      className={`rounded-lg p-3 border-2 ${
                        selectedPlayerNumber === playerNum ? 'score-animate' : ''
                      }`}
                      style={{
                        background: selectedPlayerNumber === playerNum
                          ? 'rgba(0, 255, 255, 0.15)'
                          : 'rgba(10, 0, 21, 0.8)',
                        borderColor: selectedPlayerNumber === playerNum
                          ? 'var(--neon-cyan)'
                          : 'var(--neon-purple)',
                        boxShadow: selectedPlayerNumber === playerNum
                          ? '0 0 15px var(--neon-cyan)'
                          : 'none',
                        opacity: score !== undefined ? 1 : 0.3
                      }}
                    >
                      <div className="text-xs mb-1" style={{ color: 'var(--neon-purple)' }}>
                        P{playerNum}
                      </div>
                      <div 
                        className="font-bold text-lg"
                        style={{ 
                          color: selectedPlayerNumber === playerNum ? 'var(--neon-yellow)' : 'var(--neon-cyan)',
                          textShadow: selectedPlayerNumber === playerNum ? '0 0 10px var(--neon-yellow)' : 'none'
                        }}
                      >
                        {score !== undefined ? score.toLocaleString() : '---'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Selected Score Preview */}
            {extractedScores[selectedPlayerNumber - 1] !== undefined && (
              <div 
                className="mb-6 rounded-lg p-4 border-2"
                style={{
                  background: 'rgba(0, 255, 255, 0.1)',
                  borderColor: 'var(--neon-cyan)',
                  boxShadow: '0 0 15px var(--neon-cyan)'
                }}
              >
                <div className="text-sm mb-1" style={{ color: 'var(--neon-cyan)' }}>
                  Your Score (Player {selectedPlayerNumber}):
                </div>
                <div 
                  className="font-bold text-3xl"
                  style={{ 
                    color: 'var(--neon-yellow)',
                    textShadow: '0 0 15px var(--neon-yellow)'
                  }}
                >
                  {extractedScores[selectedPlayerNumber - 1].toLocaleString()}
                </div>
              </div>
            )}
          </>
        ) : (
          <div 
            className="mb-6 rounded-lg p-6 border-2 text-center"
            style={{
              background: 'rgba(255, 153, 0, 0.1)',
              borderColor: '#ff9900',
              boxShadow: '0 0 10px rgba(255, 153, 0, 0.3)'
            }}
          >
            <div className="text-4xl mb-3">⚠️</div>
            <p className="text-sm" style={{ color: '#ff9900' }}>
              We couldn't detect any scores in this image.
              <br />
              Please try retaking with better lighting and angle.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={onRetake}
            className="flex-1 py-3 px-6 rounded-lg font-semibold transition-all border-2"
            style={{
              background: 'rgba(139, 0, 255, 0.1)',
              borderColor: 'var(--neon-purple)',
              color: 'var(--neon-purple)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(139, 0, 255, 0.2)';
              e.currentTarget.style.boxShadow = '0 0 15px var(--neon-purple)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(139, 0, 255, 0.1)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            📸 Retake Photo
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 px-6 rounded-lg font-semibold transition-all border-2"
            style={{
              background: 'rgba(255, 0, 102, 0.1)',
              borderColor: '#ff0066',
              color: '#ff0066',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 0, 102, 0.2)';
              e.currentTarget.style.boxShadow = '0 0 15px #ff0066';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 0, 102, 0.1)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            ✕ Cancel
          </button>
          {extractedScores.length > 0 && extractedScores[selectedPlayerNumber - 1] !== undefined && (
            <button
              type="button"
              onClick={handleConfirm}
              className="flex-1 py-3 px-6 rounded-lg font-semibold transition-all border-2"
              style={{
                background: 'rgba(0, 255, 255, 0.2)',
                borderColor: 'var(--neon-cyan)',
                color: 'var(--neon-cyan)',
                boxShadow: '0 0 15px var(--neon-cyan)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(0, 255, 255, 0.3)';
                e.currentTarget.style.boxShadow = '0 0 25px var(--neon-cyan), 0 0 50px var(--neon-cyan)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(0, 255, 255, 0.2)';
                e.currentTarget.style.boxShadow = '0 0 15px var(--neon-cyan)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              ✓ Confirm Score
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
