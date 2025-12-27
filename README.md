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

### Pinball Map Integration
- **Location-Based Discovery**: Automatically fetch nearby pinball venues based on your city
- **Available Tables View**: See which tables are available at each venue before playing
- **Quick Selection**: Click on available tables to instantly populate your game entry form
- **Smart Caching**: Pinball Map data is cached locally to reduce API calls and improve performance
- **Manual Venue Entry**: Option to add custom venues not listed on Pinball Map
- **Location Settings**: Configure your city, state, and search radius in Settings

### PinScores Integration
- **Percentile Rankings**: Automatically fetch your score's percentile ranking from PinScores.net
- **Visual Percentile Badges**: See percentile rankings displayed on your high scores and game history
- **Background Fetching**: Percentile data is fetched asynchronously so it doesn't slow down game entry
- **Graceful Degradation**: App works perfectly even if PinScores API is unavailable

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

1. Navigate to the "Settings" tab
2. Enter your city and state
3. Set your preferred search radius (in miles)
4. Click "Update Location" to fetch Pinball Map data for your area
5. The app will cache venue data to improve performance

### Adding a Game

1. Click "Add Game" in the navigation
2. Select a venue from the dropdown (includes Pinball Map venues and your custom venues)
   - Or click "New" to add a custom venue
3. If you selected a Pinball Map venue, you'll see available tables at that location
4. Select a table or add a custom one
5. View pre-game strategies if available for the selected table
6. Choose game type (Competitive or Practice)
7. Enter your score (and opponent's score for competitive games)
8. Optionally add notes
9. Click "Save Game"
10. The app will automatically fetch your percentile ranking from PinScores in the background

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
- `pinballMapLastUpdated`: Timestamp of last Pinball Map data refresh

## Design Philosophy

**Mobile-First**: The app is designed mobile-first with responsive breakpoints for tablet (640px+) and desktop (1024px+) experiences.

**Synthwave Aesthetic**: Features a retro 80s cyberpunk theme with:
- Neon cyan, magenta, and purple color scheme
- CRT scanline effects
- Glowing text and borders
- Orbitron font for that retro-future feel
- Smooth hover animations and transitions

**Graceful Degradation**: All API integrations (Pinball Map, PinScores, IFPA) fail gracefully - the app remains fully functional even if external services are unavailable.

**Privacy-First**: All data is stored locally in your browser using localStorage. No server-side storage or tracking.

## API Notes

### Pinball Map API
- Used for discovering venues and available tables in your area
- Data is cached locally to minimize API calls
- Gracefully handles API errors

### PinScores API
- Used for fetching percentile rankings for your scores
- Fetched asynchronously in the background
- Has a 5-second timeout to prevent hanging
- Fails gracefully if unavailable

### IFPA API
- Used for importing tournament results
- Manual sync triggered by user
- Duplicate detection prevents re-importing

## Tags

`pinball` `react` `typescript` `vite` `tailwindcss` `mobile-first` `pwa` `ifpa` `statistics` `game-tracking` `strategy` `tournament` `synthwave` `retro` `pinball-map` `pinscores` `percentile-tracking`