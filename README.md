# Pinball Coach

A lightweight mobile-first web application to help track personal pinball stats and strategies.

## Features

- **Game Entry**: Log games with venue, table, scores, and notes
- **Dashboard**: View win rate, stats by table/venue, and high scores
- **Game History**: Browse all games with the ability to delete entries
- **Data Persistence**: All data stored locally in your browser
- **Mobile-First Design**: Optimized for mobile devices with responsive layout
- **Dark Theme**: Easy on the eyes with gray-900/800 color scheme

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
3. Choose game type (Competitive or Practice)
4. Enter scores
5. Optionally add notes
6. Click "Save Game"

### Viewing Stats

The Dashboard shows:
- Overall statistics (total games, win rate, wins, losses)
- Top 5 high scores
- Performance by table
- Performance by venue

### Managing Games

View all games in the History tab. Each game can be deleted with a confirmation prompt.

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
