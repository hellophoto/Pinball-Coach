import React, { useState, useEffect } from 'react';
import type { GameType, PinballMapLocation, OPDBMachine } from '../types';
import { addGame, getGames, getSettings, saveGames, updateGame, getGame } from '../utils';
import { StrategyCard } from './StrategyCard';
import { getPinballMapLocations } from '../services/pinballMapService';
import { fetchPercentileWithTimeout } from '../services/pinScoresService';
import { getOPDBMachines, searchMachinesByName, formatMachineDetails } from '../services/opdbService';
import { TipModal } from './TipModal';
import { PhotoCapture } from './PhotoCapture';
import { ScoreSelectionModal } from './ScoreSelectionModal';
import { extractScoresFromImage, preparePhotoForStorage } from '../services/ocrService';

// Animation duration constant (matches CSS animation in index.css)
const MACHINE_SELECT_ANIMATION_DURATION = 800; // milliseconds

interface GameFormProps {
  onGameAdded: () => void;
  editGameId?: string; // Optional: ID of game to edit
}

export const GameForm: React.FC<GameFormProps> = ({ onGameAdded, editGameId }) => {
  const [venue, setVenue] = useState('');
  const [table, setTable] = useState('');
  const [myScore, setMyScore] = useState('');
  const [opponentScore, setOpponentScore] = useState('');
  const [gameType, setGameType] = useState<GameType>('competitive');
  const [notes, setNotes] = useState('');
  const [customVenue, setCustomVenue] = useState('');
  const [customTable, setCustomTable] = useState('');
  const [showCustomVenue, setShowCustomVenue] = useState(false);
  const [showCustomTable, setShowCustomTable] = useState(false);
  const [pinballMapLocations, setPinballMapLocations] = useState<PinballMapLocation[]>([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);
  const [isFetchingPercentile, setIsFetchingPercentile] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<PinballMapLocation | null>(null);
  const [showTipModal, setShowTipModal] = useState(false);
  const [tipModalTable, setTipModalTable] = useState('');
  const [showAllTips, setShowAllTips] = useState(false);
  const [manualPercentile, setManualPercentile] = useState('');
  const [showPinscoresLink, setShowPinscoresLink] = useState(false);
  const [opdbMachines, setOpdbMachines] = useState<OPDBMachine[]>([]);
  const [opdbLoading, setOpdbLoading] = useState(false);
  const [opdbSearchResults, setOpdbSearchResults] = useState<OPDBMachine[]>([]);
  const [selectedOPDBId, setSelectedOPDBId] = useState<string | undefined>();
  const [locationErrorMessage, setLocationErrorMessage] = useState<string | null>(null);
  const [showAvailableMachines, setShowAvailableMachines] = useState(true);
  const [animatingMachineId, setAnimatingMachineId] = useState<number | null>(null);
  
  // Photo capture states
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [photoThumbnail, setPhotoThumbnail] = useState<string | null>(null);
  const [showScoreSelectionModal, setShowScoreSelectionModal] = useState(false);
  const [extractedScores, setExtractedScores] = useState<number[]>([]);
  const [isProcessingOCR, setIsProcessingOCR] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [enablePhotoStorage, setEnablePhotoStorage] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);

  // Get unique venues and tables from existing games
  const games = getGames();
  const existingVenues = Array.from(new Set(games.map(g => g.venue))).sort();
  const existingTables = Array.from(new Set(games.map(g => g.table))).sort();
  
  // Load existing game data if editing
  useEffect(() => {
    if (editGameId) {
      const game = getGame(editGameId);
      if (game) {
        setIsEditMode(true);
        setVenue(game.venue);
        setTable(game.table);
        setMyScore(game.myScore.toString());
        setOpponentScore(game.opponentScore.toString());
        setGameType(game.gameType);
        setNotes(game.notes);
        setSelectedOPDBId(game.opdb_id);
        if (game.percentile !== undefined) {
          setManualPercentile(game.percentile.toString());
        }
        if (game.photo) {
          setCapturedPhoto(game.photo);
        }
        if (game.photoThumbnail) {
          setPhotoThumbnail(game.photoThumbnail);
        }
      }
    }
  }, [editGameId]);
  
  // Include selected location machines in the table dropdown
  const availableTables = React.useMemo(() => {
    const machineNames = selectedLocation?.machines.map(m => m.name) || [];
    const allTables = [...new Set([...existingTables, ...machineNames])];
    return allTables.sort();
  }, [existingTables, selectedLocation]);

  // Load Pinball Map locations on mount
  useEffect(() => {
    const loadPinballMapData = async () => {
      setIsLoadingLocations(true);
      setLocationErrorMessage(null);
      try {
        const settings = getSettings();
        const result = await getPinballMapLocations(
          settings.location.city,
          settings.location.state,
          settings.location.radius,
          false, // don't force refresh
          settings.location.useGeolocation,
          settings.location.lastKnownLat,
          settings.location.lastKnownLon
        );
        setPinballMapLocations(result.locations);
        
        if (result.locations.length === 0 && result.errorMessage) {
          setLocationErrorMessage(result.errorMessage);
        } else if (result.errorMessage) {
          // Show informational message but don't treat as error
          console.log('Location info:', result.errorMessage);
        }
      } catch (error) {
        console.error('Error loading Pinball Map data:', error);
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        setLocationErrorMessage(`Unable to load venues: ${errorMsg}. Please check your location settings.`);
      } finally {
        setIsLoadingLocations(false);
      }
    };

    loadPinballMapData();
  }, []);

  // Load OPDB data on mount
  useEffect(() => {
    const loadOPDBData = async () => {
      setOpdbLoading(true);
      try {
        const machines = await getOPDBMachines();
        setOpdbMachines(machines);
      } catch (error) {
        console.error('Error loading OPDB data:', error);
        // Fail silently - app still works without OPDB data
      } finally {
        setOpdbLoading(false);
      }
    };

    loadOPDBData();
  }, []);

  // Update selected location when venue changes
  useEffect(() => {
    if (!showCustomVenue && venue) {
      const location = pinballMapLocations.find(loc => loc.name === venue);
      setSelectedLocation(location || null);
      // Show available machines list when a new venue is selected
      if (location && location.machines.length > 0) {
        setShowAvailableMachines(true);
      }
    } else {
      setSelectedLocation(null);
    }
  }, [venue, showCustomVenue, pinballMapLocations]);

  // Cleanup animation timeout on unmount
  useEffect(() => {
    let animationTimeout: number | null = null;
    
    if (animatingMachineId !== null) {
      animationTimeout = setTimeout(() => {
        setAnimatingMachineId(null);
      }, MACHINE_SELECT_ANIMATION_DURATION);
    }
    
    return () => {
      if (animationTimeout) {
        clearTimeout(animationTimeout);
      }
    };
  }, [animatingMachineId]);

  // Helper function to validate and normalize percentile value
  const validatePercentile = (value: string): number | undefined => {
    if (!value) return undefined;
    const num = parseFloat(value);
    if (isNaN(num)) return undefined;
    return Math.max(0, Math.min(100, num));
  };

  // Refresh location data
  const handleRefreshLocations = async () => {
    setIsLoadingLocations(true);
    setLocationErrorMessage(null);
    try {
      const settings = getSettings();
      const result = await getPinballMapLocations(
        settings.location.city,
        settings.location.state,
        settings.location.radius,
        true, // force refresh
        settings.location.useGeolocation,
        settings.location.lastKnownLat,
        settings.location.lastKnownLon
      );
      setPinballMapLocations(result.locations);
      
      if (result.locations.length === 0 && result.errorMessage) {
        setLocationErrorMessage(result.errorMessage);
      }
    } catch (error) {
      console.error('Error refreshing Pinball Map data:', error);
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setLocationErrorMessage(`Unable to refresh venues: ${errorMsg}`);
    } finally {
      setIsLoadingLocations(false);
    }
  };

  // Format venue name with distance
  const formatVenueName = (location: PinballMapLocation): string => {
    if (location.distance !== undefined) {
      return `${location.name} (${location.distance.toFixed(1)} mi)`;
    }
    return location.name;
  };

  // Handle table search for OPDB
  const handleTableSearch = (searchTerm: string) => {
    setCustomTable(searchTerm);
    
    // Only search if we have at least 2 characters
    if (searchTerm.length >= 2 && opdbMachines.length > 0) {
      const results = searchMachinesByName(opdbMachines, searchTerm);
      // Limit to 10 results
      setOpdbSearchResults(results.slice(0, 10));
    } else {
      setOpdbSearchResults([]);
    }
  };

  // Handle selecting a machine from OPDB search results
  const handleSelectOPDBMachine = (machine: OPDBMachine) => {
    setCustomTable(machine.name);
    setSelectedOPDBId(machine.opdb_id);
    setOpdbSearchResults([]);
  };

  // Photo capture handlers
  const handlePhotoCapture = async (photoData: string) => {
    setIsProcessingOCR(true);
    setOcrProgress(0);

    try {
      // Extract scores from the image
      const scores = await extractScoresFromImage(photoData, (progress) => {
        setOcrProgress(progress);
      });

      // Store the captured photo
      setCapturedPhoto(photoData);
      setExtractedScores(scores);
      
      // Show the score selection modal
      setShowScoreSelectionModal(true);
    } catch (error) {
      console.error('Error processing photo:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Failed to extract scores from the photo: ${errorMessage}. Please try again with better lighting and a clear view of the scoreboard, or enter scores manually.`);
      setCapturedPhoto(null);
    } finally {
      setIsProcessingOCR(false);
      setOcrProgress(0);
    }
  };

  const handleScoreSelection = async (selectedScore: number) => {
    // Set the score in the form
    setMyScore(selectedScore.toString());
    
    // Prepare photo for storage if enabled
    if (enablePhotoStorage && capturedPhoto) {
      try {
        const { photo, thumbnail } = await preparePhotoForStorage(capturedPhoto);
        setCapturedPhoto(photo);
        setPhotoThumbnail(thumbnail);
      } catch (error) {
        console.error('Error preparing photo for storage:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        alert(`Failed to compress photo: ${errorMessage}. The photo will not be saved with this game.`);
        // Continue without photo storage
        setCapturedPhoto(null);
        setPhotoThumbnail(null);
      }
    } else {
      setCapturedPhoto(null);
      setPhotoThumbnail(null);
    }
    
    // Close the modal
    setShowScoreSelectionModal(false);
  };

  const handleRetakePhoto = () => {
    setCapturedPhoto(null);
    setExtractedScores([]);
    setShowScoreSelectionModal(false);
  };

  const handleCancelPhotoCapture = () => {
    setCapturedPhoto(null);
    setExtractedScores([]);
    setShowScoreSelectionModal(false);
  };

  const handleRemovePhoto = () => {
    setCapturedPhoto(null);
    setPhotoThumbnail(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const finalVenue = showCustomVenue ? customVenue : venue;
    const finalTable = showCustomTable ? customTable : table;
    
    if (!finalVenue || !finalTable || !myScore) {
      alert('Please fill in venue, table, and your score');
      return;
    }

    const myScoreNum = parseInt(myScore);
    const opponentScoreNum = opponentScore ? parseInt(opponentScore) : 0;
    
    let result: 'win' | 'loss' | 'practice';
    if (gameType === 'practice') {
      result = 'practice';
    } else {
      result = myScoreNum > opponentScoreNum ? 'win' : 'loss';
    }

    // Use manual percentile if provided
    const initialPercentile = validatePercentile(manualPercentile);

    const gameData = {
      venue: finalVenue,
      table: finalTable,
      myScore: myScoreNum,
      opponentScore: opponentScoreNum,
      gameType,
      result,
      notes,
      percentile: initialPercentile,
      opdb_id: selectedOPDBId,
      photo: enablePhotoStorage ? capturedPhoto || undefined : undefined,
      photoThumbnail: enablePhotoStorage ? photoThumbnail || undefined : undefined,
    };

    let savedGame;
    
    if (isEditMode && editGameId) {
      // Update existing game
      savedGame = updateGame(editGameId, gameData);
      if (!savedGame) {
        alert('Failed to update game');
        return;
      }
    } else {
      // Add new game
      savedGame = addGame(gameData);
    }

    // Only fetch percentile automatically if not manually provided and not editing
    if (initialPercentile === undefined && !isEditMode) {
      setIsFetchingPercentile(true);
      fetchPercentileWithTimeout(finalTable, myScoreNum)
        .then(percentile => {
          if (percentile !== null) {
            // Update the game with percentile using the existing utility
            const allGames = getGames();
            const gameIndex = allGames.findIndex(g => g.id === savedGame.id);
            if (gameIndex !== -1) {
              allGames[gameIndex].percentile = percentile;
              saveGames(allGames);
            }
          }
        })
        .catch(error => {
          console.error('Error fetching percentile:', error);
        })
        .finally(() => {
          setIsFetchingPercentile(false);
        });
    }

    // Reset form
    setVenue('');
    setTable('');
    setMyScore('');
    setOpponentScore('');
    setGameType('competitive');
    setNotes('');
    setCustomVenue('');
    setCustomTable('');
    setShowCustomVenue(false);
    setShowCustomTable(false);
    setManualPercentile('');
    setShowPinscoresLink(false);
    setSelectedOPDBId(undefined);
    setOpdbSearchResults([]);
    setCapturedPhoto(null);
    setPhotoThumbnail(null);
    setIsEditMode(false);
    
    // Show tip modal with the table that was just played (only for new games)
    if (!editGameId) {
      setTipModalTable(finalTable);
      setShowAllTips(false);
      setShowTipModal(true);
    } else {
      // If editing, just go back to previous view
      onGameAdded();
    }
  };

  return (
    <div className="max-w-[600px] mx-auto">
      <div className="card-synthwave rounded-lg p-6 shadow-lg">
      <h2 className="text-2xl font-bold mb-6" style={{ 
        color: 'var(--neon-cyan)',
        textShadow: '0 0 10px var(--neon-cyan), 0 0 20px var(--neon-cyan)'
      }}>{isEditMode ? 'Edit Game' : 'Add New Game'}</h2>
      
      {/* OCR Processing Indicator */}
      {isProcessingOCR && (
        <div className="mb-4 rounded p-4 border-2" style={{
          background: 'rgba(0, 255, 255, 0.1)',
          borderColor: 'var(--neon-cyan)',
          boxShadow: '0 0 10px var(--neon-cyan)'
        }}>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">🔍</span>
            <span className="font-semibold" style={{ color: 'var(--neon-cyan)' }}>
              Processing Photo...
            </span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden border border-cyan-500">
            <div 
              className="h-full transition-all duration-300"
              style={{ 
                width: `${ocrProgress}%`,
                background: 'linear-gradient(90deg, var(--neon-cyan), var(--neon-purple))',
                boxShadow: '0 0 10px var(--neon-cyan)'
              }}
            />
          </div>
          <p className="text-xs mt-2" style={{ color: 'var(--neon-purple)' }}>
            {ocrProgress}% - Extracting scores from image...
          </p>
        </div>
      )}
      
      {isFetchingPercentile && (
        <div className="mb-4 rounded p-3 border-2" style={{
          background: 'rgba(0, 255, 255, 0.1)',
          borderColor: 'var(--neon-cyan)',
          boxShadow: '0 0 10px var(--neon-cyan)'
        }}>
          <p className="text-sm" style={{ color: 'var(--neon-cyan)' }}>
            🔄 Fetching percentile ranking from PinScores...
          </p>
        </div>
      )}
      
      {/* Location Error/Info Message */}
      {locationErrorMessage && (
        <div className="mb-4 rounded p-3 border-2" style={{
          background: 'rgba(255, 153, 0, 0.1)',
          borderColor: '#ff9900',
          boxShadow: '0 0 10px rgba(255, 153, 0, 0.3)'
        }}>
          <p className="text-sm" style={{ color: '#ff9900' }}>
            ⚠️ {locationErrorMessage}
          </p>
          <button
            type="button"
            onClick={() => window.location.hash = '#/settings'}
            className="mt-2 text-xs underline"
            style={{ color: 'var(--neon-cyan)' }}
          >
            Update location settings →
          </button>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Photo Capture Section */}
        {!isEditMode && (
          <div>
            <PhotoCapture 
              onPhotoCapture={handlePhotoCapture}
              disabled={isProcessingOCR}
            />
            
            {/* Photo Storage Toggle */}
            <div className="mt-3 flex items-center justify-between">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={enablePhotoStorage}
                  onChange={(e) => setEnablePhotoStorage(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm" style={{ color: 'var(--neon-purple)' }}>
                  Save photo with game (recommended)
                </span>
              </label>
            </div>
          </div>
        )}
        
        {/* Photo Thumbnail Display */}
        {(photoThumbnail || capturedPhoto) && (
          <div className="rounded-lg p-4 border-2" style={{
            background: 'rgba(0, 255, 255, 0.05)',
            borderColor: 'var(--neon-cyan)',
            boxShadow: '0 0 10px var(--neon-cyan)'
          }}>
            <div className="flex items-start gap-3">
              <img 
                src={photoThumbnail || capturedPhoto || ''}
                alt="Scoreboard" 
                className="w-24 h-24 object-cover rounded border-2"
                style={{
                  borderColor: 'var(--neon-purple)',
                  boxShadow: '0 0 10px var(--neon-purple)'
                }}
              />
              <div className="flex-1">
                <div className="text-sm font-semibold mb-1" style={{ color: 'var(--neon-cyan)' }}>
                  📸 Photo Attached
                </div>
                <p className="text-xs mb-2" style={{ color: 'var(--neon-purple)' }}>
                  Your scoreboard photo will be saved with this game
                </p>
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="text-xs px-3 py-1 rounded border transition"
                  style={{
                    borderColor: '#ff0066',
                    color: '#ff0066',
                    background: 'rgba(255, 0, 102, 0.1)'
                  }}
                >
                  Remove Photo
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Venue */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label style={{ color: 'var(--neon-cyan)' }}>
              Venue
              {isLoadingLocations && <span className="ml-2 text-sm" style={{ color: 'var(--neon-purple)' }}>
                (Loading nearby venues...)
              </span>}
            </label>
            <button
              type="button"
              onClick={handleRefreshLocations}
              disabled={isLoadingLocations}
              className="text-xs px-2 py-1 rounded transition"
              style={{
                background: 'rgba(0, 255, 255, 0.1)',
                border: '1px solid var(--neon-cyan)',
                color: 'var(--neon-cyan)',
              }}
              title="Refresh venue list"
            >
              {isLoadingLocations ? '⏳' : '🔄'}
            </button>
          </div>
          {!showCustomVenue ? (
            <div className="flex gap-2">
              <select
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                className="flex-1 input-synthwave rounded px-4 py-2"
              >
                <option value="">
                  {pinballMapLocations.length === 0 
                    ? 'No venues found - Update settings or add custom venue' 
                    : 'Select venue...'}
                </option>
                {pinballMapLocations.map(loc => (
                  <option key={`pm-${loc.id}`} value={loc.name}>
                    {formatVenueName(loc)}
                  </option>
                ))}
                {existingVenues.filter(v => !pinballMapLocations.find(loc => loc.name === v)).map(v => (
                  <option key={`ex-${v}`} value={v}>{v}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setShowCustomVenue(true)}
                className="px-4 py-2 button-secondary rounded"
              >
                New
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                value={customVenue}
                onChange={(e) => setCustomVenue(e.target.value)}
                placeholder="Enter new venue..."
                className="flex-1 input-synthwave rounded px-4 py-2"
              />
              <button
                type="button"
                onClick={() => setShowCustomVenue(false)}
                className="px-4 py-2 button-secondary rounded"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Available Tables from Pinball Map */}
        {selectedLocation && selectedLocation.machines.length > 0 && showAvailableMachines && (
          <div className="stat-card rounded-lg p-4">
            <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--neon-cyan)' }}>
              📍 Available Tables at {selectedLocation.name}
            </h3>
            <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
              {selectedLocation.machines.map(machine => (
                <button
                  key={machine.id}
                  type="button"
                  onClick={() => {
                    setTable(machine.name);
                    setShowCustomTable(false);
                    // Hide the available machines list
                    setShowAvailableMachines(false);
                    // Trigger selection animation (cleanup handled by useEffect)
                    setAnimatingMachineId(machine.id);
                  }}
                  className={`text-left px-3 py-2 rounded text-sm transition border-2 machine-button-hover ${
                    table === machine.name
                      ? 'border-cyan-400'
                      : 'border-purple-600'
                  } ${animatingMachineId === machine.id ? 'machine-select-glow' : ''}`}
                  style={{
                    background: table === machine.name 
                      ? 'rgba(0, 255, 255, 0.2)' 
                      : 'rgba(139, 0, 255, 0.1)',
                    color: table === machine.name 
                      ? 'var(--neon-cyan)' 
                      : 'var(--neon-purple)',
                    boxShadow: table === machine.name 
                      ? '0 0 10px var(--neon-cyan)' 
                      : 'none',
                    cursor: 'pointer'
                  }}
                >
                  {machine.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Table */}
        <div>
          <label className="block mb-2" style={{ color: 'var(--neon-cyan)' }}>
            Table
            {opdbLoading && <span className="ml-2 text-sm" style={{ color: 'var(--neon-purple)' }}>
              (Loading OPDB data...)
            </span>}
          </label>
          {!showCustomTable ? (
            <div className="flex gap-2">
              <select
                value={table}
                onChange={(e) => setTable(e.target.value)}
                className="flex-1 input-synthwave rounded px-4 py-2"
              >
                <option value="">Select table...</option>
                {availableTables.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setShowCustomTable(true)}
                className="px-4 py-2 button-secondary rounded"
              >
                New
              </button>
            </div>
          ) : (
            <div className="relative">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customTable}
                  onChange={(e) => handleTableSearch(e.target.value)}
                  placeholder="Enter new table or search OPDB..."
                  className="flex-1 input-synthwave rounded px-4 py-2"
                />
                <button
                  type="button"
                  onClick={() => {
                    setShowCustomTable(false);
                    setOpdbSearchResults([]);
                  }}
                  className="px-4 py-2 button-secondary rounded"
                >
                  Cancel
                </button>
              </div>
              
              {/* OPDB Search Results Dropdown */}
              {opdbSearchResults.length > 0 && (
                <div 
                  className="absolute z-10 w-full mt-2 rounded-lg overflow-hidden"
                  style={{
                    background: 'rgba(16, 0, 32, 0.95)',
                    border: '2px solid var(--neon-cyan)',
                    boxShadow: '0 0 20px var(--neon-cyan)',
                    maxHeight: '400px',
                    overflowY: 'auto'
                  }}
                >
                  {opdbSearchResults.map((machine) => (
                    <button
                      key={machine.opdb_id}
                      type="button"
                      onClick={() => handleSelectOPDBMachine(machine)}
                      className="w-full text-left px-4 py-3 transition-all border-b"
                      style={{
                        borderColor: 'rgba(139, 0, 255, 0.3)',
                        background: 'transparent'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(0, 255, 255, 0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <div style={{ 
                        color: 'var(--neon-cyan)',
                        fontWeight: 'bold',
                        marginBottom: '4px'
                      }}>
                        {machine.name}
                      </div>
                      {formatMachineDetails(machine) && (
                        <div style={{ 
                          color: 'var(--neon-purple)',
                          fontSize: '0.875rem',
                          opacity: 0.9
                        }}>
                          {formatMachineDetails(machine)}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* View Tips Button */}
        {(table || customTable) && (
          <div>
            <button
              type="button"
              onClick={() => {
                setTipModalTable(showCustomTable ? customTable : table);
                setShowAllTips(true);
                setShowTipModal(true);
              }}
              className="w-full py-3 px-4 rounded-lg font-semibold transition-all duration-300"
              style={{
                background: 'rgba(0, 255, 255, 0.1)',
                border: '2px solid var(--neon-cyan)',
                color: 'var(--neon-cyan)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                boxShadow: '0 0 10px rgba(0, 255, 255, 0.3)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(0, 255, 255, 0.2)';
                e.currentTarget.style.boxShadow = '0 0 20px var(--neon-cyan)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(0, 255, 255, 0.1)';
                e.currentTarget.style.boxShadow = '0 0 10px rgba(0, 255, 255, 0.3)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              💡 View Tips for {showCustomTable ? customTable : table}
            </button>
          </div>
        )}

        {/* Strategy Card */}
        {(table || customTable) && (
          <StrategyCard tableName={showCustomTable ? customTable : table} />
        )}

        {/* Game Type */}
        <div>
          <label className="block mb-2" style={{ color: 'var(--neon-cyan)' }}>Game Type</label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="competitive"
                checked={gameType === 'competitive'}
                onChange={(e) => setGameType(e.target.value as GameType)}
                className="mr-2"
              />
              <span style={{ color: 'var(--neon-cyan)' }}>Competitive</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="practice"
                checked={gameType === 'practice'}
                onChange={(e) => setGameType(e.target.value as GameType)}
                className="mr-2"
              />
              <span style={{ color: 'var(--neon-cyan)' }}>Practice</span>
            </label>
          </div>
        </div>

        {/* Scores */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-2" style={{ color: 'var(--neon-cyan)' }}>My Score</label>
            <input
              type="number"
              value={myScore}
              onChange={(e) => setMyScore(e.target.value)}
              placeholder="0"
              className="w-full input-synthwave rounded px-4 py-2"
            />
          </div>
          {gameType === 'competitive' && (
            <div>
              <label className="block mb-2" style={{ color: 'var(--neon-cyan)' }}>Opponent Score</label>
              <input
                type="number"
                value={opponentScore}
                onChange={(e) => setOpponentScore(e.target.value)}
                placeholder="0"
                className="w-full input-synthwave rounded px-4 py-2"
              />
            </div>
          )}
        </div>

        {/* Notes */}
        <div>
          <label className="block mb-2" style={{ color: 'var(--neon-cyan)' }}>Notes (optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any notes about the game..."
            rows={3}
            className="w-full input-synthwave rounded px-4 py-2"
          />
        </div>

        {/* PinScores Percentile Section */}
        {(table || customTable) && myScore && (
          <div className="rounded-lg p-4 border-2" style={{
            background: 'rgba(0, 255, 255, 0.05)',
            borderColor: 'var(--neon-cyan)',
            boxShadow: '0 0 10px rgba(0, 255, 255, 0.3)'
          }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold" style={{ color: 'var(--neon-cyan)' }}>
                📊 PinScores Percentile
              </h3>
              <button
                type="button"
                onClick={() => setShowPinscoresLink(!showPinscoresLink)}
                className="text-xs px-3 py-1 rounded border-2 transition"
                style={{
                  background: 'rgba(0, 255, 255, 0.1)',
                  borderColor: 'var(--neon-cyan)',
                  color: 'var(--neon-cyan)',
                }}
              >
                {showPinscoresLink ? 'Hide' : 'Show'} Link
              </button>
            </div>
            
            {showPinscoresLink && (() => {
              const pinscoresUrl = `https://pinscores.net/?search=${encodeURIComponent(showCustomTable ? customTable : table)}`;
              return (
                <div className="mb-3 p-3 rounded" style={{
                  background: 'rgba(139, 0, 255, 0.1)',
                  borderLeft: '3px solid var(--neon-purple)'
                }}>
                  <p className="text-xs mb-2" style={{ color: 'var(--neon-purple)' }}>
                    Check your score's percentile ranking on PinScores:
                  </p>
                  <a
                    href={pinscoresUrl}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="text-xs font-semibold underline break-all hover:opacity-80 transition"
                    style={{ color: 'var(--neon-cyan)' }}
                  >
                    {pinscoresUrl}
                  </a>
                  <p className="text-xs mt-2" style={{ color: 'var(--neon-purple)', opacity: 0.8 }}>
                    1. Click the link to open PinScores
                    <br />2. Find your machine and enter your score
                    <br />3. Copy the percentile value below
                  </p>
                </div>
              );
            })()}

            <div>
              <label className="block mb-2 text-sm" style={{ color: 'var(--neon-cyan)' }}>
                Percentile (0-100, optional)
              </label>
              <input
                type="number"
                value={manualPercentile}
                onChange={(e) => setManualPercentile(e.target.value)}
                placeholder="e.g., 85.5"
                min="0"
                max="100"
                step="0.1"
                className="w-full input-synthwave rounded px-4 py-2"
              />
              <p className="text-xs mt-1" style={{ color: 'var(--neon-purple)', opacity: 0.7 }}>
                Leave empty to try automatic fetch (may not work if PinScores API is unavailable)
              </p>
            </div>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          className="w-full button-primary font-semibold py-3 rounded-lg"
        >
          Save Game
        </button>
      </form>
    </div>

    {/* Tip Modal */}
    {showTipModal && (
      <TipModal
        tableName={tipModalTable}
        onClose={() => {
          setShowTipModal(false);
          // If this is post-game modal (not showAllTips), navigate to dashboard
          if (!showAllTips) {
            onGameAdded();
          }
        }}
        showAllTips={showAllTips}
      />
    )}
    
    {/* Score Selection Modal */}
    {showScoreSelectionModal && capturedPhoto && (
      <ScoreSelectionModal
        extractedScores={extractedScores}
        onSelectScore={handleScoreSelection}
        onCancel={handleCancelPhotoCapture}
        onRetake={handleRetakePhoto}
        photoPreview={capturedPhoto}
      />
    )}
    </div>
  );
};
