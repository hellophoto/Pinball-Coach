# Pinball Coach

A lightweight mobile-first web application to help track personal pinball stats and strategies.

## Features

### Core Features
- **Game Entry**: Log games with venue, table, scores, and notes
- **Dashboard**: View win rate, stats by table/venue, and high scores
- **Game History**: Browse all games with the ability to delete entries
- **Data Persistence**: All data stored locally in your browser
- **Mobile-First Design**: Optimized for mobile devices with responsive layout
- **Dark Theme**: Easy on the eyes with gray-900/800 color scheme

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

### Adding a Game

1. Click "Add Game" in the navigation
2. Select or add a venue and table
3. View pre-game strategies if available for the selected table
4. Choose game type (Competitive or Practice)
5. Enter scores
6. Optionally add notes
7. Click "Save Game"

### Managing Table Strategies

1. Navigate to the "Settings" tab
2. Add new tables with custom strategies including:
   - Skill shot recommendations
   - Mode strategy information
   - Multiball tips
   - General gameplay tips
3. Edit or delete existing table strategies
4. Strategies are automatically displayed when entering games for that table

### Syncing IFPA Tournament Results

1. Go to the Dashboard
2. Click "Sync IFPA Results"
3. Tournament games will be automatically imported and tagged with a purple IFPA badge
4. View imported games in the History tab

### Viewing Stats

The Dashboard shows:
- Overall statistics (total games, win rate, wins, losses)
- Top 5 high scores
- Performance by table
- Performance by venue
- IFPA sync button for importing tournament results

### Managing Games

View all games in the History tab. Each game can be deleted with a confirmation prompt. IFPA-imported games are marked with a purple badge.

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

Table strategies store:
- `table`: Pinball table/machine name
- `skillShot`: Skill shot recommendations
- `modes`: Game mode strategies
- `multiballs`: Multiball tips
- `tips`: General gameplay advice

## Tags

`pinball` `react` `typescript` `vite` `tailwindcss` `mobile-first` `pwa` `ifpa` `statistics` `game-tracking` `strategy` `tournament`