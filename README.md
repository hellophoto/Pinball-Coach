<div align="center">
  <img src="public/pinball-coach-logo.jpg" alt="Pinball Coach Logo" width="400"/>
</div>

# Pinball Coach

A lightweight mobile-first web application to help track personal pinball stats and strategies with a retro synthwave aesthetic.

## Features

### Core Features
- **Game Entry**: Log games with venue, table, scores, and notes
- **Dashboard**: View win rate, stats by table/venue, and high scores
- **Game History**: Browse all games with the ability to delete entries
- **Data Persistence**: All data stored locally in your browser
- **Mobile-First Responsive Design**: Optimized for mobile, tablet, and desktop with proper breakpoints
- **Synthwave Theme**: Retro neon aesthetic with CRT scanlines, glowing borders, and cyberpunk vibes

### Tips & Coaching
- **Post-Game Tips Modal**: After saving a game, receive machine-specific strategy tips and coaching advice
- **Contextual Guidance**: Tips are automatically displayed based on the table you played
- **Strategy Reinforcement**: Learn key strategies and improve your gameplay over time

### Pinball Map Integration
- **Geolocation Support**: Use your device's location to automatically find nearby pinball venues
- **Distance Display**: See how far each venue is from your current location (when using geolocation)
- **Cascading Search Strategy**: Intelligent fallback system tries geolocation → region → city search
- **Region-Based Search**: Search by state/region for broader coverage (e.g., "Portland" for Oregon)
- **Location-Based Discovery**: Fetch nearby pinball venues based on your location or city
- **Available Tables View**: See which tables are available at each venue before playing
- **Quick Selection**: Click on available tables to instantly populate your game entry form
- **Smart Caching**: Pinball Map data is cached locally with separate caches for different search types
- **Manual Venue Entry**: Option to add custom venues not listed on Pinball Map
- **Location Settings**: Configure geolocation, city, state, and search radius in Settings
- **Test Location**: Validate your location settings before adding games


### PinScores Integration
- **Percentile Rankings**: Automatically fetch your score's percentile ranking from PinScores.net
- **Manual Percentile Entry**: Manually enter percentile data with a direct link to pinscores.net for easy lookup
- **Visual Percentile Badges**: See percentile rankings displayed on your high scores and game history
- **Background Fetching**: Percentile data is fetched asynchronously so it doesn't slow down game entry
- **Graceful Degradation**: App works perfectly even if PinScores API is unavailable

### OPDB Integration
- **Open Pinball Database**: Integration with OPDB for comprehensive machine data
- **Machine Search**: Search and select machines from the OPDB database during game entry
- **Automatic Caching**: Machine data is fetched and cached locally for improved performance
- **Machine Metadata**: Track production counts and other machine details
- **Enhanced Game Form**: GameForm includes OPDB-powered machine search and selection

### Strategy Management
- **Pre-game Strategy View**: View table-specific strategies during game entry including:
  - Skill shot recommendations
  - Game mode strategies
  - Multiball tips
  - General gameplay advice
- **Table Management**: Create and manage custom strategies for your favorite tables in the Settings view
- **Strategy Card**: Expandable cards that display automatically when selecting a table

### IFPA Integration
- **Tournament Sync**: Import tournament results from the International Flipper Pinball Association (IFPA) API
- **Auto-Import**: Automatically fetch and import your tournament games with a single click
- **Source Tracking**: IFPA-imported games are tagged with a purple badge to distinguish them from manual entries
- **Duplicate Prevention**: Smart detection prevents importing the same tournament results twice

## Tech Stack

- React 19 + TypeScript
- Vite 7
- Tailwind CSS v4
- localStorage for data persistence
- Pinball Map API for venue/table discovery
- PinScores API for percentile rankings
- IFPA API for tournament data
- OPDB API for machine database

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:5173/`

### Build

```bash
npm run build
```

The production build will be created in the `dist` directory.

## Usage

### Configuring Your Location

#### Option 1: Geolocation (Recommended)
1. Navigate to the "Settings" tab
2. Enable "Use Geolocation" toggle
3. Click "📍 Use My Current Location" to get your coordinates
4. Set your preferred search radius (5-100 miles)
5. Click "Update & Fetch" to find nearby venues
6. The app will show venues sorted by distance from your location

#### Option 2: City/State
1. Navigate to the "Settings" tab
2. Enter your city and state (e.g., "Portland" and "OR")
3. Set your preferred search radius
4. Click "Update & Fetch" to search for venues
5. The app uses a smart fallback: region search → city search

#### Testing Your Settings
- Use the "🧪 Test Settings" button to validate your configuration
- See how many venues are found without updating the cache
- Check for any error messages or fallback behaviors

**Privacy Note**: Your location data is only stored locally in your browser. It's never sent to external servers except when querying the Pinball Map API to find nearby venues.

### Adding a Game

1. Click "Add Game" in the navigation
2. Select a venue from the dropdown
   - Venues from geolocation show distance in miles (e.g., "Joe's Arcade (2.3 mi)")
   - Use the 🔄 refresh button to update the venue list
   - Or click "New" to add a custom venue
3. If you selected a Pinball Map venue, you'll see available tables at that location
4. Select a table from OPDB search or add a custom one
5. View pre-game strategies if available for the selected table
6. Choose game type (Competitive or Practice)
7. Enter your score (and opponent's score for competitive games)
8. Optionally add notes or manually enter a percentile ranking (with link to pinscores.net)
9. Click "Save Game"
10. The app will automatically fetch your percentile ranking from PinScores in the background
11. A post-game tip modal will appear with machine-specific coaching advice

### Managing Table Strategies

1. Navigate to the "Settings" tab
2. Scroll to the "Table Strategies" section
3. Click "Add New Strategy"
4. Enter table-specific information:
   - Skill shot recommendations
   - Mode strategy information
   - Multiball tips
   - General gameplay tips
5. Edit or delete existing table strategies as needed
6. Strategies are automatically displayed when entering games for that table

### Syncing IFPA Tournament Results

1. Go to the Dashboard
2. Click "Sync IFPA Results"
3. Tournament games will be automatically imported and tagged with a purple IFPA badge
4. View imported games in the History tab

### Viewing Stats

The Dashboard shows:
- Overall statistics (total games, win rate, wins, losses)
- Top 5 high scores with percentile rankings
- Performance by table (including high scores per table)
- Performance by venue
- IFPA sync button for importing tournament results

### Managing Cache

In the Settings tab, you can:
- View when Pinball Map data was last refreshed
- Force refresh Pinball Map data
- Clear cached Pinball Map data to free up storage

### Managing Games

View all games in the History tab. Each game displays:
- Venue and table information
- Your score and opponent's score (for competitive games)
- Percentile ranking (if available from PinScores)
- Game result badge (WIN/LOSS/PRACTICE)
- Source badge (IFPA-imported games are marked)
- Notes and timestamp
- Delete option with confirmation prompt

## Data Model

Each game stores:
- `venue`: Location where the game was played
- `table`: Pinball table/machine name
- `opdb_id`: Open Pinball Database machine identifier
- `myScore`: Your score
- `opponentScore`: Opponent's score (for competitive games)
- `gameType`: Either "competitive" or "practice"
- `result`: Automatically calculated as "win", "loss", or "practice"
- `notes`: Optional notes about the game
- `timestamp`: When the game was recorded
- `source`: Origin of the game data ("manual" or "ifpa")
- `percentile`: Score percentile ranking from PinScores (0-100)

Table strategies store:
- `table`: Pinball table/machine name
- `skillShot`: Skill shot recommendations
- `modes`: Game mode strategies
- `multiballs`: Multiball tips
- `tips`: General gameplay advice

Settings store:
- `location.city`: City for Pinball Map venue search
- `location.state`: State for Pinball Map venue search
- `location.radius`: Search radius in miles
- `location.useGeolocation`: Whether to use device geolocation
- `location.lastKnownLat`: Last known latitude (when using geolocation)
- `location.lastKnownLon`: Last known longitude (when using geolocation)
- `location.region`: Pinball Map region (e.g., "portland", "seattle")
- `pinballMapLastUpdated`: Timestamp of last Pinball Map data refresh

## Troubleshooting

### Venue Dropdown is Empty

If you're not seeing any venues in the dropdown:

1. **Check Location Settings**
   - Go to Settings → Pinball Map Settings
   - Click "🧪 Test Settings" to see what's happening
   - Look for error messages that explain the issue

2. **Try Geolocation**
   - Enable "Use Geolocation" in Settings
   - Click "Use My Current Location"
   - Allow location permissions when prompted
   - Click "Update & Fetch"

3. **Try a Larger City**
   - Some smaller cities may not be in Pinball Map
   - Try entering a nearby larger city (e.g., "Portland" instead of "Beaverton")
   - Your state will map to a region for broader results

4. **Increase Search Radius**
   - Try increasing radius to 50 or 100 miles
   - Especially helpful in rural areas

5. **Check Your State**
   - State abbreviations are mapped to Pinball Map regions
   - Supported states: OR, WA, CA, NY, IL, TX, CO, PA, MA, GA, MI, MN, AZ, FL, NC, OH, TN, MO
   - If your state isn't listed, the app will fall back to city search

6. **Add Custom Venues**
   - You can always click "New" to add venues manually
   - Custom venues are saved and will appear in future games

### Geolocation Not Working

**"Location permission denied"**
- Allow location permissions in your browser settings
- On mobile: Check device location services are enabled
- Try refreshing the page and allowing permissions again

**"Location unavailable"**
- Make sure GPS/location services are enabled on your device
- Try moving to a location with better GPS reception
- Consider using city/state search as a fallback

**"No venues found within X miles"**
- Increase your search radius in Settings
- Some areas have fewer pinball locations
- Try using city/state search instead

### Venues Not Updating

1. Click the 🔄 refresh button next to the venue dropdown
2. Or go to Settings and click "Update & Fetch"
3. Try clearing the cache: Settings → "Clear Cache"

### API Errors

If you see "Pinball Map API unavailable":
- The app will use cached data if available
- Check your internet connection
- Try again later - the API may be temporarily down
- The app works offline with previously cached venue data

## Design Philosophy

**Mobile-First**: The app is designed mobile-first with responsive breakpoints for tablet (640px+) and desktop (1024px+) experiences.

**Synthwave Aesthetic**: Features a retro 80s cyberpunk theme with:
- Neon cyan, magenta, and purple color scheme
- CRT scanline effects
- Glowing text and borders
- Orbitron font for that retro-future feel
- Smooth hover animations and transitions

**Graceful Degradation**: All API integrations (Pinball Map, PinScores, IFPA, OPDB) fail gracefully - the app remains fully functional even if external services are unavailable.

**Privacy-First**: All data is stored locally in your browser using localStorage. No server-side storage or tracking.

## API Notes

### Pinball Map API
The app uses a cascading search strategy to find venues:

1. **Primary: Geolocation Search** (if enabled)
   - Endpoint: `/api/v1/locations/closest_by_lat_lon.json`
   - Parameters: `lat`, `lon`, `max_distance` (in miles)
   - Returns venues sorted by distance from your location
   - Most accurate for finding nearby venues

2. **Fallback 1: Region Search**
   - Endpoint: `/api/v1/region/{region}/locations.json`
   - Maps state abbreviations to regions (e.g., OR → portland)
   - Provides broader coverage when geolocation unavailable

3. **Fallback 2: City Name Search**
   - Endpoint: `/api/v1/locations.json?by_city_name={city}`
   - Searches by exact city name
   - Final fallback option

**Caching Strategy:**
- Each search type has its own cache key
- Geolocation caches by coordinates (rounded to ~1km precision)
- Region/city searches cache separately
- Cache expires after 24 hours
- Manual refresh available in Settings
- Gracefully handles API errors

### PinScores API
- Used for fetching percentile rankings for your scores
- Fetched asynchronously in the background
- Has a 5-second timeout to prevent hanging
- Fails gracefully if unavailable
- Manual entry option with direct link to pinscores.net

### IFPA API
- Used for importing tournament results
- Manual sync triggered by user
- Duplicate detection prevents re-importing

### OPDB API
- Used for machine database and metadata
- Provides comprehensive machine information
- Data is cached locally for performance
- Enhances game entry with searchable machine database

## Tags

`pinball` `react` `typescript` `vite` `tailwindcss` `mobile-first` `pwa` `ifpa` `statistics` `game-tracking` `strategy` `tournament` `synthwave` `retro` `pinball-map` `pinscores` `percentile-tracking` `opdb` `coaching` `tips`