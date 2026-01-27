import type {
  users,
  teams,
  maps,
  gameTypes,
  weapons,
  achievements,
  games,
  gamePlayers,
  gameTeamScores,
  gameEvents,
  playerGameStats,
  playerLifetimeStats,
  playerWeaponStats,
  playerAchievements,
  killStreaks,
} from '@/db/schema';

// Infer types from schema
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Team = typeof teams.$inferSelect;
export type NewTeam = typeof teams.$inferInsert;

export type GameMap = typeof maps.$inferSelect;
export type NewGameMap = typeof maps.$inferInsert;

export type GameType = typeof gameTypes.$inferSelect;
export type NewGameType = typeof gameTypes.$inferInsert;

export type Weapon = typeof weapons.$inferSelect;
export type NewWeapon = typeof weapons.$inferInsert;

export type Achievement = typeof achievements.$inferSelect;
export type NewAchievement = typeof achievements.$inferInsert;

export type Game = typeof games.$inferSelect;
export type NewGame = typeof games.$inferInsert;

export type GamePlayer = typeof gamePlayers.$inferSelect;
export type NewGamePlayer = typeof gamePlayers.$inferInsert;

export type GameTeamScore = typeof gameTeamScores.$inferSelect;
export type NewGameTeamScore = typeof gameTeamScores.$inferInsert;

export type GameEvent = typeof gameEvents.$inferSelect;
export type NewGameEvent = typeof gameEvents.$inferInsert;

export type PlayerGameStat = typeof playerGameStats.$inferSelect;
export type NewPlayerGameStat = typeof playerGameStats.$inferInsert;

export type PlayerLifetimeStat = typeof playerLifetimeStats.$inferSelect;
export type NewPlayerLifetimeStat = typeof playerLifetimeStats.$inferInsert;

export type PlayerWeaponStat = typeof playerWeaponStats.$inferSelect;
export type NewPlayerWeaponStat = typeof playerWeaponStats.$inferInsert;

export type PlayerAchievement = typeof playerAchievements.$inferSelect;
export type NewPlayerAchievement = typeof playerAchievements.$inferInsert;

export type KillStreak = typeof killStreaks.$inferSelect;
export type NewKillStreak = typeof killStreaks.$inferInsert;

// Extended types for views and API responses
export interface PlayerLeaderboardEntry {
  id: string;
  gamertag: string;
  serviceTag: string;
  totalKills: number;
  totalDeaths: number;
  kdRatio: number;
  totalGames: number;
  gamesWon: number;
  winPercentage: number;
  totalHeadshots: number;
  highestKillStreak: number;
  killsRank: number;
  kdRank: number;
}

export interface RecentGame {
  id: string;
  status: 'setup' | 'in_progress' | 'completed';
  mapName: string;
  gameTypeName: string;
  winningTeamName: string | null;
  winningTeamColor: string | null;
  startedAt: Date | null;
  endedAt: Date | null;
  createdAt: Date;
  playerCount: number;
}

export interface PlayerGameHistory {
  userId: string;
  gamertag: string;
  gameId: string;
  mapName: string;
  gameTypeName: string;
  teamName: string | null;
  teamColor: string | null;
  kills: number;
  deaths: number;
  kdRatio: number;
  headshots: number;
  won: boolean;
  playedAt: Date;
}

export interface WeaponStat {
  id: string;
  name: string;
  category: string;
  damageType: string;
  totalKills: number;
  totalHeadshots: number;
  avgAccuracy: number;
  playersUsing: number;
}

export interface MapStat {
  id: string;
  name: string;
  maxPlayers: number;
  timesPlayed: number;
  completedGames: number;
}

export interface AchievementProgress {
  odometry: string;
  gamertag: string;
  achievementId: string;
  achievementName: string;
  description: string;
  type: 'medal' | 'career' | 'skill';
  iconUrl: string | null;
  unlocked: boolean;
  unlockedAt: Date | null;
}

export interface LiveGame {
  id: string;
  mapName: string;
  gameTypeName: string;
  scoreToWin: number;
  startedAt: Date;
  playerCount: number;
  teamScores: {
    teamId: string;
    teamName: string;
    teamColor: string;
    score: number;
  }[];
}

export interface PlayerProfile {
  id: string;
  gamertag: string;
  serviceTag: string;
  avatarUrl: string | null;
  memberSince: Date;
  totalKills: number;
  totalDeaths: number;
  kdRatio: number;
  totalAssists: number;
  totalHeadshots: number;
  totalGames: number;
  gamesWon: number;
  winPercentage: number;
  totalPlaytimeSeconds: number;
  highestKillStreak: number;
  achievementsUnlocked: number;
  totalAchievements: number;
}

export interface KillFeedEntry {
  id: string;
  gameId: string;
  createdAt: Date;
  killerGamertag: string;
  killerId: string;
  killerTeamName: string | null;
  killerTeamColor: string | null;
  victimGamertag: string;
  victimId: string;
  victimTeamName: string | null;
  victimTeamColor: string | null;
  weaponName: string;
  isHeadshot: boolean;
  isMelee: boolean;
  isAssassination: boolean;
  isGrenade: boolean;
}

export interface PlayerWeaponBreakdown {
  userId: string;
  gamertag: string;
  weaponId: string;
  weaponName: string;
  category: string;
  kills: number;
  headshots: number;
  shotsFired: number;
  shotsHit: number;
  accuracy: number;
  killPercentage: number;
}

// API Request/Response types
export interface CreateGameRequest {
  mapId: string;
  gameTypeId: string;
}

export interface AddPlayerToGameRequest {
  userId: string;
  teamId: string;
}

export interface RecordKillRequest {
  killerId: string;
  victimId: string;
  weaponId: string;
  isHeadshot?: boolean;
  isMelee?: boolean;
  isAssassination?: boolean;
  isGrenade?: boolean;
}

export interface GameWithDetails extends Game {
  map: GameMap;
  gameType: GameType;
  winningTeam: Team | null;
  players: (GamePlayer & {
    user: User;
    team: Team | null;
  })[];
  teamScores: (GameTeamScore & {
    team: Team;
  })[];
  playerStats: (PlayerGameStat & {
    user: User;
  })[];
}

export interface GameSummary {
  game: GameWithDetails;
  scoreboard: {
    gamertag: string;
    teamName: string | null;
    teamColor: string | null;
    kills: number;
    deaths: number;
    kdRatio: number;
    headshots: number;
  }[];
  achievements: {
    gamertag: string;
    achievementName: string;
  }[];
  mvp: {
    gamertag: string;
    kills: number;
  } | null;
}
