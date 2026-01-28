import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  boolean,
  timestamp,
  decimal,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const gameStatusEnum = pgEnum('game_status', ['setup', 'in_progress', 'completed']);
export const achievementTypeEnum = pgEnum('achievement_type', ['medal', 'career', 'skill']);

// Core Tables

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  gamertag: varchar('gamertag', { length: 50 }).notNull().unique(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  serviceTag: varchar('service_tag', { length: 4 }).notNull(),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const teams = pgTable('teams', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 50 }).notNull().unique(),
  color: varchar('color', { length: 7 }).notNull(), // Hex color
});

export const maps = pgTable('maps', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  description: text('description'),
  imageUrl: text('image_url'),
  maxPlayers: integer('max_players').notNull().default(16),
});

export const gameTypes = pgTable('game_types', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  description: text('description'),
  isTeamBased: boolean('is_team_based').notNull().default(true),
  scoreToWin: integer('score_to_win').notNull().default(50),
});

export const weapons = pgTable('weapons', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  description: text('description'),
  category: varchar('category', { length: 50 }).notNull(), // primary, secondary, power
  damageType: varchar('damage_type', { length: 50 }).notNull(), // kinetic, plasma, explosive
});

export const achievements = pgTable('achievements', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  description: text('description'),
  type: achievementTypeEnum('type').notNull().default('medal'),
  iconUrl: text('icon_url'),
  requirement: integer('requirement').notNull().default(1), // e.g., 5 kills for killing spree
});

// Game Tables

export const games = pgTable('games', {
  id: uuid('id').defaultRandom().primaryKey(),
  mapId: uuid('map_id').references(() => maps.id).notNull(),
  gameTypeId: uuid('game_type_id').references(() => gameTypes.id).notNull(),
  status: gameStatusEnum('status').notNull().default('setup'),
  startedAt: timestamp('started_at'),
  endedAt: timestamp('ended_at'),
  winningTeamId: uuid('winning_team_id').references(() => teams.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const gamePlayers = pgTable('game_players', {
  id: uuid('id').defaultRandom().primaryKey(),
  gameId: uuid('game_id').references(() => games.id).notNull(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  teamId: uuid('team_id').references(() => teams.id),
  joinedAt: timestamp('joined_at').defaultNow().notNull(),
});

export const gameTeamScores = pgTable('game_team_scores', {
  id: uuid('id').defaultRandom().primaryKey(),
  gameId: uuid('game_id').references(() => games.id).notNull(),
  teamId: uuid('team_id').references(() => teams.id).notNull(),
  score: integer('score').notNull().default(0),
});

export const gameEvents = pgTable('game_events', {
  id: uuid('id').defaultRandom().primaryKey(),
  gameId: uuid('game_id').references(() => games.id).notNull(),
  killerId: uuid('killer_id').references(() => users.id).notNull(),
  victimId: uuid('victim_id').references(() => users.id).notNull(),
  weaponId: uuid('weapon_id').references(() => weapons.id).notNull(),
  isHeadshot: boolean('is_headshot').notNull().default(false),
  isMelee: boolean('is_melee').notNull().default(false),
  isAssassination: boolean('is_assassination').notNull().default(false),
  isGrenade: boolean('is_grenade').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Stats Tables

export const playerGameStats = pgTable('player_game_stats', {
  id: uuid('id').defaultRandom().primaryKey(),
  gameId: uuid('game_id').references(() => games.id).notNull(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  kills: integer('kills').notNull().default(0),
  deaths: integer('deaths').notNull().default(0),
  assists: integer('assists').notNull().default(0),
  headshots: integer('headshots').notNull().default(0),
  meleeKills: integer('melee_kills').notNull().default(0),
  grenadeKills: integer('grenade_kills').notNull().default(0),
});

export const playerLifetimeStats = pgTable('player_lifetime_stats', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull().unique(),
  totalKills: integer('total_kills').notNull().default(0),
  totalDeaths: integer('total_deaths').notNull().default(0),
  totalAssists: integer('total_assists').notNull().default(0),
  totalHeadshots: integer('total_headshots').notNull().default(0),
  totalGames: integer('total_games').notNull().default(0),
  gamesWon: integer('games_won').notNull().default(0),
  totalPlaytimeSeconds: integer('total_playtime_seconds').notNull().default(0),
  highestKillStreak: integer('highest_kill_streak').notNull().default(0),
});

export const playerWeaponStats = pgTable('player_weapon_stats', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  weaponId: uuid('weapon_id').references(() => weapons.id).notNull(),
  kills: integer('kills').notNull().default(0),
  headshots: integer('headshots').notNull().default(0),
  shotsFired: integer('shots_fired').notNull().default(0),
  shotsHit: integer('shots_hit').notNull().default(0),
});

export const playerAchievements = pgTable('player_achievements', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  achievementId: uuid('achievement_id').references(() => achievements.id).notNull(),
  gameId: uuid('game_id').references(() => games.id),
  unlockedAt: timestamp('unlocked_at').defaultNow().notNull(),
});

export const killStreaks = pgTable('kill_streaks', {
  id: uuid('id').defaultRandom().primaryKey(),
  gameId: uuid('game_id').references(() => games.id).notNull(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  streakCount: integer('streak_count').notNull().default(0),
  isActive: boolean('is_active').notNull().default(true),
  startedAt: timestamp('started_at').defaultNow().notNull(),
  endedAt: timestamp('ended_at'),
});

// Relations

export const usersRelations = relations(users, ({ many, one }) => ({
  gamePlayers: many(gamePlayers),
  playerGameStats: many(playerGameStats),
  lifetimeStats: one(playerLifetimeStats),
  weaponStats: many(playerWeaponStats),
  achievements: many(playerAchievements),
  killsAsKiller: many(gameEvents, { relationName: 'killer' }),
  killsAsVictim: many(gameEvents, { relationName: 'victim' }),
}));

export const gamesRelations = relations(games, ({ one, many }) => ({
  map: one(maps, { fields: [games.mapId], references: [maps.id] }),
  gameType: one(gameTypes, { fields: [games.gameTypeId], references: [gameTypes.id] }),
  winningTeam: one(teams, { fields: [games.winningTeamId], references: [teams.id] }),
  players: many(gamePlayers),
  events: many(gameEvents),
  teamScores: many(gameTeamScores),
  playerStats: many(playerGameStats),
}));

export const gamePlayersRelations = relations(gamePlayers, ({ one }) => ({
  game: one(games, { fields: [gamePlayers.gameId], references: [games.id] }),
  user: one(users, { fields: [gamePlayers.userId], references: [users.id] }),
  team: one(teams, { fields: [gamePlayers.teamId], references: [teams.id] }),
}));

export const gameEventsRelations = relations(gameEvents, ({ one }) => ({
  game: one(games, { fields: [gameEvents.gameId], references: [games.id] }),
  killer: one(users, { fields: [gameEvents.killerId], references: [users.id], relationName: 'killer' }),
  victim: one(users, { fields: [gameEvents.victimId], references: [users.id], relationName: 'victim' }),
  weapon: one(weapons, { fields: [gameEvents.weaponId], references: [weapons.id] }),
}));

export const playerWeaponStatsRelations = relations(playerWeaponStats, ({ one }) => ({
  user: one(users, { fields: [playerWeaponStats.userId], references: [users.id] }),
  weapon: one(weapons, { fields: [playerWeaponStats.weaponId], references: [weapons.id] }),
}));

export const playerAchievementsRelations = relations(playerAchievements, ({ one }) => ({
  user: one(users, { fields: [playerAchievements.userId], references: [users.id] }),
  achievement: one(achievements, { fields: [playerAchievements.achievementId], references: [achievements.id] }),
  game: one(games, { fields: [playerAchievements.gameId], references: [games.id] }),
}));

export const gameTeamScoresRelations = relations(gameTeamScores, ({ one }) => ({
  game: one(games, { fields: [gameTeamScores.gameId], references: [games.id] }),
  team: one(teams, { fields: [gameTeamScores.teamId], references: [teams.id] }),
}));

export const playerGameStatsRelations = relations(playerGameStats, ({ one }) => ({
  game: one(games, { fields: [playerGameStats.gameId], references: [games.id] }),
  user: one(users, { fields: [playerGameStats.userId], references: [users.id] }),
}));

export const playerLifetimeStatsRelations = relations(playerLifetimeStats, ({ one }) => ({
  user: one(users, { fields: [playerLifetimeStats.userId], references: [users.id] }),
}));

export const killStreaksRelations = relations(killStreaks, ({ one }) => ({
  game: one(games, { fields: [killStreaks.gameId], references: [games.id] }),
  user: one(users, { fields: [killStreaks.userId], references: [users.id] }),
}));
