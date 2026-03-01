import React, { useState, useEffect } from 'react';
import type { TableStrategy, Settings as SettingsType } from '../types';
import { getTableStrategies, saveTableStrategy, deleteTableStrategy, getSettings, saveSettings } from '../supabaseUtils';
import { clearPinballMapCache, getPinballMapCacheTimestamp, getPinballMapLocations, getCurrentLocation, getRegionFromState } from '../services/pinballMapService';

export const Settings: React.FC = () => {
  const [strategies, setStrategies] = useState<Record<string, TableStrategy>>({});
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<TableStrategy>({
    table: '',
    skillShot: '',
    modes: '',
    multiballs: '',
    tips: '',
  });
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Location settings
  const [settings, setSettingsState] = useState<SettingsType>({
    location: { city: 'Portland', state: 'OR', radius: 25 }
  });
  const [isUpdatingLocation, setIsUpdatingLocation] = useState(false);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [locationMessage, setLocationMessage] = useState<string | null>(null);
  const [cacheTimestamp, setCacheTimestamp] = useState<number | null>(getPinballMapCacheTimestamp());
  const [venueCount, setVenueCount] = useState<number | null>(null);

  useEffect(() => {
    Promise.all([
      getTableStrategies(),
      getSettings(),
    ]).then(([strats, setts]) => {
      setStrategies(strats);
      setSettingsState(setts);
      setLoading(false);
    });
    setCacheTimestamp(getPinballMapCacheTimestamp());
  }, []);

  const handleNewStrategy = () => {
    setIsEditing('new');
    setEditForm({ table: '', skillShot: '', modes: '', multiballs: '', tips: '' });
  };

  const handleEditStrategy = (tableName: string) => {
    const strategy = strategies[tableName];
    if (strategy) {
      setIsEditing(tableName);
      setEditForm(strategy);
    }
  };

  const handleSaveStrategy = async () => {
    if (!editForm.table.trim()) {
      setErrorMessage('Table name is required');
      return;
    }
    await saveTableStrategy(editForm);
    const updated = await getTableStrategies();
    setStrategies(updated);
    setIsEditing(null);
    setErrorMessage(null);
    setEditForm({ table: '', skillShot: '', modes: '', multiballs: '', tips: '' });
  };

  const handleDeleteStrategy = async (tableName: string) => {
    await deleteTableStrategy(tableName);
    const updated = await getTableStrategies();
    setStrategies(updated);
    setConfirmDelete(null);
  };

  const handleCancel = () => {
    setIsEditing(null);
    setErrorMessage(null);
    setEditForm({ table: '', skillShot: '', modes: '', multiballs: '', tips: '' });
  };

  const handleUseCurrentLocation = async () => {
    setIsFetchingLocation(true);
    setLocationMessage(null);
    try {
      const coords = await getCurrentLocation();
      const updatedSettings: SettingsType = {
        ...settings,
        location: {
          ...settings.location,
          useGeolocation: true,
          lastKnownLat: coords.lat,
          lastKnownLon: coords.lon,
        },
        pinballMapLastUpdated: Date.now(),
      };
      await saveSettings(updatedSettings);
      setSettingsState(updatedSettings);
      setLocationMessage(`✅ Location found: ${coords.lat.toFixed(4)}, ${coords.lon.toFixed(4)}`);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setLocationMessage(`Error getting location: ${errorMsg}`);
    } finally {
      setIsFetchingLocation(false);
    }
  };

  const handleUpdateLocation = async () => {
    setIsUpdatingLocation(true);
    setLocationMessage(null);
    try {
      const updatedSettings: SettingsType = {
        ...settings,
        pinballMapLastUpdated: Date.now(),
      };
      await saveSettings(updatedSettings);
      setSettingsState(updatedSettings);
      
      const result = await getPinballMapLocations(
        settings.location.city,
        settings.location.state,
        settings.location.radius,
        true,
        settings.location.useGeolocation,
        settings.location.lastKnownLat,
        settings.location.lastKnownLon
      );
      
      setCacheTimestamp(Date.now());
      setVenueCount(result.locations.length);
      
      let message = `✅ Found ${result.locations.length} venue${result.locations.length !== 1 ? 's' : ''}`;
      if (result.searchType === 'geolocation' && result.userCoordinates) {
        message += ` within ${settings.location.radius} miles`;
      } else if (result.searchType === 'region') {
        const region = getRegionFromState(settings.location.state || '');
        message += ` in ${region} region`;
      } else if (result.searchType === 'city') {
        message += ` in ${settings.location.city}`;
      }
      if (result.errorMessage) message += `. Note: ${result.errorMessage}`;
      setLocationMessage(message);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setLocationMessage(`Error updating location: ${errorMsg}`);
    } finally {
      setIsUpdatingLocation(false);
    }
  };

  const handleTestLocation = async () => {
    setIsUpdatingLocation(true);
    setLocationMessage(null);
    try {
      const result = await getPinballMapLocations(
        settings.location.city,
        settings.location.state,
        settings.location.radius,
        true,
        settings.location.useGeolocation,
        settings.location.lastKnownLat,
        settings.location.lastKnownLon
      );
      setVenueCount(result.locations.length);
      let message = `🧪 Test Results: Found ${result.locations.length} venue${result.locations.length !== 1 ? 's' : ''}`;
      if (result.searchType === 'geolocation') message += ` using geolocation`;
      else if (result.searchType === 'region') message += ` using region search`;
      else if (result.searchType === 'city') message += ` using city search`;
      if (result.errorMessage) message += `. ${result.errorMessage}`;
      setLocationMessage(message);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setLocationMessage(`Test failed: ${errorMsg}`);
    } finally {
      setIsUpdatingLocation(false);
    }
  };

  const handleClearCache = () => {
    clearPinballMapCache();
    setCacheTimestamp(null);
    setLocationMessage('Pinball Map cache cleared successfully!');
  };

  const formatLastUpdated = (timestamp: number | null) => {
    if (!timestamp) return 'Never';
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="font-mono animate-pulse" style={{ color: 'var(--neon-cyan)' }}>
          LOADING SETTINGS...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Location Settings Section */}
      <div>
        <h2 className="text-2xl font-bold mb-4" style={{ 
          color: 'var(--neon-cyan)',
          textShadow: '0 0 10px var(--neon-cyan), 0 0 20px var(--neon-cyan)'
        }}>Pinball Map Settings</h2>
        
        {locationMessage && (
          <div className="mb-4 rounded-lg p-4 border-2" style={{
            background: locationMessage.includes('Error') 
              ? 'rgba(255, 0, 102, 0.2)' 
              : 'rgba(0, 255, 136, 0.2)',
            borderColor: locationMessage.includes('Error') ? '#ff0066' : '#00ff88',
            boxShadow: locationMessage.includes('Error')
              ? '0 0 10px rgba(255, 0, 102, 0.5)'
              : '0 0 10px rgba(0, 255, 136, 0.5)'
          }}>
            <p className="text-sm" style={{ 
              color: locationMessage.includes('Error') ? '#ff0066' : '#00ff88' 
            }}>{locationMessage}</p>
          </div>
        )}
        
        <div className="card-synthwave rounded-lg p-6 shadow-lg">
          <h3 className="text-lg font-semibold mb-4" style={{ 
            color: 'var(--neon-magenta)',
            textShadow: '0 0 10px var(--neon-magenta)'
          }}>Location Configuration</h3>
          
          <div className="space-y-4">
            <div className="rounded p-4 border-2" style={{
              background: 'rgba(0, 255, 255, 0.05)',
              borderColor: 'var(--neon-cyan)',
            }}>
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="font-semibold" style={{ color: 'var(--neon-cyan)' }}>
                    📍 Use Geolocation
                  </span>
                  <p className="text-xs mt-1" style={{ color: 'var(--neon-purple)', opacity: 0.8 }}>
                    Automatically find nearby venues using your device's location
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.location.useGeolocation || false}
                  onChange={(e) => setSettingsState({
                    ...settings,
                    location: { ...settings.location, useGeolocation: e.target.checked }
                  })}
                  className="ml-4 w-6 h-6"
                  style={{ accentColor: 'var(--neon-cyan)' }}
                />
              </label>
              
              {settings.location.useGeolocation && (
                <div className="mt-3">
                  <button
                    onClick={handleUseCurrentLocation}
                    disabled={isFetchingLocation}
                    className={`w-full py-2 px-4 rounded font-semibold transition ${
                      isFetchingLocation ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80'
                    }`}
                    style={{
                      background: 'rgba(0, 255, 255, 0.2)',
                      border: '2px solid var(--neon-cyan)',
                      color: 'var(--neon-cyan)',
                    }}
                  >
                    {isFetchingLocation ? '🔄 Getting Location...' : '📍 Use My Current Location'}
                  </button>
                  
                  {settings.location.lastKnownLat !== undefined && settings.location.lastKnownLon !== undefined && (
                    <div className="mt-2 text-xs" style={{ color: 'var(--neon-purple)' }}>
                      Current: {settings.location.lastKnownLat.toFixed(4)}, {settings.location.lastKnownLon.toFixed(4)}
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 text-sm" style={{ color: 'var(--neon-cyan)' }}>City</label>
                <input
                  type="text"
                  value={settings.location.city || ''}
                  onChange={(e) => setSettingsState({
                    ...settings,
                    location: { ...settings.location, city: e.target.value }
                  })}
                  placeholder="Portland"
                  className="w-full input-synthwave rounded px-4 py-2"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm" style={{ color: 'var(--neon-cyan)' }}>State</label>
                <input
                  type="text"
                  value={settings.location.state || ''}
                  onChange={(e) => setSettingsState({
                    ...settings,
                    location: { ...settings.location, state: e.target.value }
                  })}
                  placeholder="OR"
                  className="w-full input-synthwave rounded px-4 py-2"
                />
              </div>
            </div>

            <div>
              <label className="block mb-2 text-sm" style={{ color: 'var(--neon-cyan)' }}>ZIP Code (Optional)</label>
              <input
                type="text"
                value={settings.location.zipCode || ''}
                onChange={(e) => setSettingsState({
                  ...settings,
                  location: { ...settings.location, zipCode: e.target.value }
                })}
                placeholder="97205"
                className="w-full input-synthwave rounded px-4 py-2"
              />
            </div>
            
            {/* IFPA Player ID */}
            <div>
              <label className="block mb-2 text-sm" style={{ color: 'var(--neon-cyan)' }}>
                IFPA Player ID (Optional)
              </label>
              <input
                type="text"
                value={settings.ifpaPlayerId || ''}
                onChange={(e) => setSettingsState({
                  ...settings,
                  ifpaPlayerId: e.target.value
                })}
                placeholder="12345"
                className="w-full input-synthwave rounded px-4 py-2"
              />
              <p className="text-xs mt-1" style={{ color: 'var(--neon-purple)', opacity: 0.7 }}>
                Find your player ID at{' '}
                <a
                  href="https://www.ifpapinball.com/players.php"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                  style={{ color: 'var(--neon-cyan)' }}
                >
                  ifpapinball.com
                </a>
              </p>
            </div>
                {/* League Player ID */}
            <div>
              <label className="block mb-2 text-sm" style={{ color: 'var(--neon-cyan)' }}>
                League Player ID (Optional)
              </label>
              <input
                type="text"
                value={settings.leaguePlayerId || ''}
                onChange={(e) => setSettingsState({
                  ...settings,
                  leaguePlayerId: e.target.value
                })}
                placeholder="Dominique Whittaker"
                className="w-full input-synthwave rounded px-4 py-2"
              />
              <p className="text-xs mt-1" style={{ color: 'var(--neon-purple)', opacity: 0.7 }}>
                Your full name as it appears in the league CSV
              </p>
            </div>
            <div>
              <label className="block mb-2 text-sm" style={{ color: 'var(--neon-cyan)' }}>
                Search Radius (miles)
                {settings.location.useGeolocation && (
                  <span className="ml-2 text-xs" style={{ color: 'var(--neon-purple)' }}>
                    • Used for geolocation search
                  </span>
                )}
              </label>
              <select
                value={settings.location.radius}
                onChange={(e) => setSettingsState({
                  ...settings,
                  location: { ...settings.location, radius: parseInt(e.target.value) }
                })}
                className="w-full input-synthwave rounded px-4 py-2"
              >
                <option value="5">5 miles</option>
                <option value="10">10 miles</option>
                <option value="25">25 miles</option>
                <option value="50">50 miles</option>
                <option value="100">100 miles</option>
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleUpdateLocation}
                disabled={isUpdatingLocation}
                className={`font-semibold py-3 rounded-lg transition ${
                  isUpdatingLocation
                    ? 'opacity-50 cursor-not-allowed bg-gray-700 border-2 border-gray-600 text-gray-400'
                    : 'button-primary'
                }`}
              >
                {isUpdatingLocation ? '🔄 Updating...' : '📍 Update & Fetch'}
              </button>
              <button
                onClick={handleTestLocation}
                disabled={isUpdatingLocation}
                className={`font-semibold py-3 rounded-lg transition ${
                  isUpdatingLocation ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                style={{
                  background: isUpdatingLocation ? 'rgba(100, 100, 100, 0.3)' : 'rgba(139, 0, 255, 0.2)',
                  border: '2px solid var(--neon-purple)',
                  color: 'var(--neon-purple)',
                }}
              >
                {isUpdatingLocation ? '⏳ Testing...' : '🧪 Test Settings'}
              </button>
            </div>
            
            <div className="stat-card rounded p-3 mt-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span style={{ color: 'var(--neon-purple)' }}>Last Updated:</span>
                  <span style={{ color: 'var(--neon-cyan)' }}>{formatLastUpdated(cacheTimestamp)}</span>
                </div>
                {venueCount !== null && (
                  <div className="flex justify-between items-center">
                    <span style={{ color: 'var(--neon-purple)' }}>Venues Found:</span>
                    <span style={{ color: 'var(--neon-cyan)' }}>{venueCount}</span>
                  </div>
                )}
              </div>
              <button
                onClick={handleClearCache}
                className="w-full button-secondary py-2 rounded font-semibold text-sm mt-3"
              >
                🗑️ Clear Cache
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Table Strategies Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold" style={{ 
            color: 'var(--neon-cyan)',
            textShadow: '0 0 10px var(--neon-cyan), 0 0 20px var(--neon-cyan)'
          }}>Table Strategies</h2>
          {!isEditing && (
            <button onClick={handleNewStrategy} className="button-primary px-4 py-2 rounded-lg font-semibold">
              + Add Strategy
            </button>
          )}
        </div>

        {isEditing && (
          <div className="card-synthwave rounded-lg p-6 shadow-lg">
            <h3 className="text-xl font-semibold mb-4" style={{ 
              color: 'var(--neon-magenta)',
              textShadow: '0 0 10px var(--neon-magenta)'
            }}>
              {isEditing === 'new' ? 'Add New Strategy' : 'Edit Strategy'}
            </h3>
            
            {errorMessage && (
              <div className="mb-4 rounded p-3 border-2" style={{
                background: 'rgba(255, 0, 102, 0.2)',
                borderColor: '#ff0066',
                boxShadow: '0 0 10px rgba(255, 0, 102, 0.5)'
              }}>
                <p className="text-sm" style={{ color: '#ff0066' }}>{errorMessage}</p>
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label className="block mb-2" style={{ color: 'var(--neon-cyan)' }}>Table Name</label>
                <input
                  type="text"
                  value={editForm.table}
                  onChange={(e) => setEditForm({ ...editForm, table: e.target.value })}
                  disabled={isEditing !== 'new'}
                  className="w-full input-synthwave rounded px-4 py-2 disabled:opacity-50"
                  placeholder="e.g., Medieval Madness"
                />
              </div>
              <div>
                <label className="block mb-2" style={{ color: 'var(--neon-cyan)' }}>Skill Shot</label>
                <textarea
                  value={editForm.skillShot}
                  onChange={(e) => setEditForm({ ...editForm, skillShot: e.target.value })}
                  rows={2}
                  className="w-full input-synthwave rounded px-4 py-2"
                  placeholder="Describe the skill shot strategy..."
                />
              </div>
              <div>
                <label className="block mb-2" style={{ color: 'var(--neon-cyan)' }}>Modes</label>
                <textarea
                  value={editForm.modes}
                  onChange={(e) => setEditForm({ ...editForm, modes: e.target.value })}
                  rows={3}
                  className="w-full input-synthwave rounded px-4 py-2"
                  placeholder="Describe mode strategy..."
                />
              </div>
              <div>
                <label className="block mb-2" style={{ color: 'var(--neon-cyan)' }}>Multiballs</label>
                <textarea
                  value={editForm.multiballs}
                  onChange={(e) => setEditForm({ ...editForm, multiballs: e.target.value })}
                  rows={2}
                  className="w-full input-synthwave rounded px-4 py-2"
                  placeholder="Describe multiball strategy..."
                />
              </div>
              <div>
                <label className="block mb-2" style={{ color: 'var(--neon-cyan)' }}>Tips</label>
                <textarea
                  value={editForm.tips}
                  onChange={(e) => setEditForm({ ...editForm, tips: e.target.value })}
                  rows={3}
                  className="w-full input-synthwave rounded px-4 py-2"
                  placeholder="General gameplay tips..."
                />
              </div>
              <div className="flex gap-2">
                <button onClick={handleSaveStrategy} className="flex-1 button-primary font-semibold py-2 rounded-lg">
                  Save Strategy
                </button>
                <button onClick={handleCancel} className="flex-1 button-secondary font-semibold py-2 rounded-lg">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {!isEditing && (
          <div className="space-y-3">
            {Object.keys(strategies).length === 0 ? (
              <div className="card-synthwave rounded-lg p-6 text-center">
                <p style={{ color: 'var(--neon-purple)' }}>No strategies yet. Add your first strategy!</p>
              </div>
            ) : (
              Object.entries(strategies)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([tableName, strategy]) => (
                  <div key={tableName} className="card-synthwave rounded-lg p-4 shadow-lg">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-semibold" style={{ color: 'var(--neon-cyan)' }}>{strategy.table}</h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditStrategy(tableName)}
                          className="p-2 hover-glow transition"
                          style={{ color: 'var(--neon-cyan)' }}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setConfirmDelete(tableName)}
                          className="p-2 hover-glow transition"
                          style={{ color: 'var(--neon-purple)' }}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      {strategy.skillShot && (
                        <div>
                          <span className="font-semibold" style={{ color: 'var(--neon-cyan)' }}>Skill Shot: </span>
                          <span style={{ color: 'var(--neon-purple)' }}>{strategy.skillShot}</span>
                        </div>
                      )}
                      {strategy.modes && (
                        <div>
                          <span className="font-semibold" style={{ color: 'var(--neon-cyan)' }}>Modes: </span>
                          <span style={{ color: 'var(--neon-purple)' }}>{strategy.modes}</span>
                        </div>
                      )}
                      {strategy.multiballs && (
                        <div>
                          <span className="font-semibold" style={{ color: 'var(--neon-cyan)' }}>Multiballs: </span>
                          <span style={{ color: 'var(--neon-purple)' }}>{strategy.multiballs}</span>
                        </div>
                      )}
                      {strategy.tips && (
                        <div>
                          <span className="font-semibold" style={{ color: 'var(--neon-cyan)' }}>Tips: </span>
                          <span style={{ color: 'var(--neon-purple)' }}>{strategy.tips}</span>
                        </div>
                      )}
                    </div>

                    {confirmDelete === tableName && (
                      <div className="mt-3 rounded p-3 border-2" style={{
                        background: 'rgba(255, 0, 102, 0.2)',
                        borderColor: '#ff0066',
                        boxShadow: '0 0 10px rgba(255, 0, 102, 0.5)'
                      }}>
                        <p className="text-sm mb-3" style={{ color: '#ff0066' }}>
                          Are you sure you want to delete this strategy?
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDeleteStrategy(tableName)}
                            className="flex-1 py-2 rounded font-semibold border-2 transition"
                            style={{
                              background: 'rgba(255, 0, 102, 0.3)',
                              borderColor: '#ff0066',
                              color: '#ff0066'
                            }}
                          >
                            Delete
                          </button>
                          <button
                            onClick={() => setConfirmDelete(null)}
                            className="flex-1 button-secondary py-2 rounded font-semibold"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};