# Halo 3 Game Database Simulation

A Halo 3-style game database simulation app demonstrating PostgreSQL functions, triggers, and views through multiplayer game tracking.

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Database**: PostgreSQL 15+
- **ORM**: Drizzle ORM
- **UI**: Tailwind CSS + shadcn/ui
- **State**: TanStack Query (React Query)
- **Language**: TypeScript

## Features

### Database Features
- **13 Tables**: Users, games, teams, maps, weapons, achievements, and stats
- **8 PostgreSQL Functions**: K/D ratio, win percentage, kill recording, game lifecycle
- **7 Triggers**: Auto-updating stats, team scores, achievements, kill streaks
- **10 Views**: Leaderboards, player profiles, game summaries, kill feeds

### Application Features
- Game setup with map and game type selection
- Team assignment for players
- Kill event recording with weapon selection and modifiers (headshot, melee, etc.)
- Live scoreboard and kill feed
- Player stats dashboard
- Global leaderboard
- Achievement tracking

## Setup

### Prerequisites
- Node.js 18+
- Docker (for PostgreSQL)

### 1. Start the Database

```bash
docker-compose up -d
```

This starts PostgreSQL on port 5432 with:
- Database: `halo3_game_sim`
- User: `halo3`
- Password: `halo3password`

### 2. Install Dependencies

```bash
npm install
```

### 3. Initialize the Database

Run the migration SQL to create tables, functions, triggers, and views:

```bash
# Connect to PostgreSQL and run the migration
docker exec -i halo3-db psql -U halo3 -d halo3_game_sim < src/db/migrations/0000_init.sql
```

### 4. Seed the Database

```bash
npm run db:seed
```

This adds:
- 4 teams (Red, Blue, Green, Orange)
- 10 maps (Valhalla, The Pit, Guardian, etc.)
- 5 game types (Slayer, CTF, Oddball, etc.)
- 21 weapons (Battle Rifle, Sniper, Energy Sword, etc.)
- 27 achievements (Double Kill, Killing Spree, etc.)
- 8 sample players

### 5. Start the Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Usage

1. **Create a Game**: Go to "New Game", select a game type and map
2. **Add Players**: Assign players to Red and Blue teams
3. **Start the Game**: Begin the simulation
4. **Record Events**: Use the kill recorder to log kills with weapons and modifiers
5. **Watch Stats Update**: See scores, kill feed, and player stats update in real-time
6. **End Game**: View the final summary with MVP and achievements

## Database Schema

### Core Tables
- `users` - Player accounts
- `teams` - Red, Blue, Green, Orange
- `maps` - Game maps
- `game_types` - Slayer, CTF, Oddball, KOTH
- `weapons` - All Halo 3 weapons
- `achievements` - Medals and achievements

### Game Tables
- `games` - Match instances
- `game_players` - Players in each game
- `game_team_scores` - Team scores per game
- `game_events` - Kill events

### Stats Tables
- `player_game_stats` - Per-game stats
- `player_lifetime_stats` - Career stats
- `player_weapon_stats` - Weapon-specific stats
- `player_achievements` - Unlocked achievements
- `kill_streaks` - Kill streak tracking

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| GET/POST | `/api/games` | List/create games |
| GET/PATCH | `/api/games/[id]` | Get/update game |
| GET/POST | `/api/games/[id]/events` | Kill events |
| GET | `/api/games/[id]/summary` | Game summary |
| GET/POST | `/api/users` | List/create users |
| GET | `/api/users/[id]/stats` | Player stats |
| GET | `/api/leaderboard` | Global rankings |
| GET | `/api/maps` | All maps |
| GET | `/api/weapons` | All weapons |
| GET | `/api/game-types` | All game types |
| GET | `/api/teams` | All teams |

## Verification

Test the triggers and views:

1. **Kill Recording**: Record a kill and verify `player_game_stats` auto-updates
2. **Team Scores**: Record kills and verify `game_team_scores` increments
3. **Achievements**: Get 5 kills in a row and verify "Killing Spree" is awarded
4. **Lifetime Stats**: End a game and verify `player_lifetime_stats` updates
5. **Views**: Query `vw_player_leaderboard` and verify aggregations

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Database commands
npm run db:generate  # Generate migrations
npm run db:push      # Push schema changes
npm run db:studio    # Open Drizzle Studio
npm run db:seed      # Seed database
```
