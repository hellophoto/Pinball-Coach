import React, { useRef, useState } from 'react';

interface PhotoCaptureProps {
  onPhotoCapture: (photoData: string) => void;
  disabled?: boolean;
}

export const PhotoCapture: React.FC<PhotoCaptureProps> = ({ onPhotoCapture, disabled = false }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('Image size must be less than 10MB');
      return;
    }

    setIsProcessing(true);

    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const photoData = e.target?.result as string;
        onPhotoCapture(photoData);
        setIsProcessing(false);
      };
      reader.onerror = () => {
        alert('Error reading image file');
        setIsProcessing(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error processing image:', error);
      alert('Error processing image. Please try again.');
      setIsProcessing(false);
    }

    // Reset input to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        style={{ display: 'none' }}
        disabled={disabled || isProcessing}
      />
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || isProcessing}
        className="w-full py-4 px-6 rounded-lg font-semibold transition-all duration-300 relative overflow-hidden"
        style={{
          background: 'rgba(0, 255, 255, 0.1)',
          border: '2px solid var(--neon-cyan)',
          color: 'var(--neon-cyan)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          boxShadow: '0 0 10px rgba(0, 255, 255, 0.3)',
          cursor: disabled || isProcessing ? 'not-allowed' : 'pointer',
          opacity: disabled || isProcessing ? 0.5 : 1,
        }}
        onMouseEnter={(e) => {
          if (!disabled && !isProcessing) {
            e.currentTarget.style.background = 'rgba(0, 255, 255, 0.2)';
            e.currentTarget.style.boxShadow = '0 0 20px var(--neon-cyan), 0 0 40px var(--neon-cyan)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(0, 255, 255, 0.1)';
          e.currentTarget.style.boxShadow = '0 0 10px rgba(0, 255, 255, 0.3)';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        <div className="flex items-center justify-center gap-3">
          {isProcessing ? (
            <>
              <span className="text-2xl">⏳</span>
              <span>Processing...</span>
            </>
          ) : (
            <>
              <span className="text-2xl neon-pulse">📸</span>
              <span>Capture Score Photo</span>
            </>
          )}
        </div>
        <div className="text-xs mt-2 opacity-70">
          {isProcessing ? 'Loading image...' : 'Camera or upload from gallery'}
        </div>
      </button>
    </div>
  );
};
