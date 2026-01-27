import { db } from '@/db';
import {
  users, teams, maps, gameTypes, weapons, achievements,
  games, gamePlayers, gameTeamScores,
  playerGameStats, playerLifetimeStats, playerWeaponStats, playerAchievements
} from '@/db/schema';
import { eq, desc, sql } from 'drizzle-orm';

// Base data queries
export async function getAllUsers() {
  return db.select().from(users).orderBy(users.gamertag);
}

export async function getAllTeams() {
  return db.select().from(teams);
}

export async function getAllMaps() {
  return db.select().from(maps).orderBy(maps.name);
}

export async function getAllGameTypes() {
  return db.select().from(gameTypes).orderBy(gameTypes.name);
}

export async function getAllWeapons() {
  return db.select().from(weapons).orderBy(weapons.name);
}

export async function getAllAchievements() {
  return db.select().from(achievements).orderBy(achievements.name);
}

// Game queries
export async function getGameById(gameId: string) {
  const result = await db.query.games.findFirst({
    where: eq(games.id, gameId),
    with: {
      map: true,
      gameType: true,
      winningTeam: true,
      players: {
        with: {
          user: true,
          team: true,
        },
      },
      teamScores: true,
      playerStats: true,
    },
  });
  return result;
}

export async function getRecentGames(limit = 10) {
  const result = await db.execute<Record<string, unknown>>(sql`
    SELECT * FROM vw_recent_games LIMIT ${limit}
  `);
  return Array.from(result);
}

export async function getLiveGames() {
  const result = await db.execute<Record<string, unknown>>(sql`
    SELECT * FROM vw_live_games
  `);
  return Array.from(result);
}

export async function getGamePlayers(gameId: string) {
  return db.query.gamePlayers.findMany({
    where: eq(gamePlayers.gameId, gameId),
    with: {
      user: true,
      team: true,
    },
  });
}

export async function getGameTeamScores(gameId: string) {
  return db.select({
    id: gameTeamScores.id,
    gameId: gameTeamScores.gameId,
    teamId: gameTeamScores.teamId,
    score: gameTeamScores.score,
    teamName: teams.name,
    teamColor: teams.color,
  })
  .from(gameTeamScores)
  .innerJoin(teams, eq(gameTeamScores.teamId, teams.id))
  .where(eq(gameTeamScores.gameId, gameId));
}

export async function getGameEvents(gameId: string, limit = 50) {
  const result = await db.execute<Record<string, unknown>>(sql`
    SELECT * FROM vw_kill_feed WHERE game_id = ${gameId} LIMIT ${limit}
  `);
  return Array.from(result);
}

export async function getGamePlayerStats(gameId: string) {
  return db.select({
    id: playerGameStats.id,
    gameId: playerGameStats.gameId,
    userId: playerGameStats.userId,
    kills: playerGameStats.kills,
    deaths: playerGameStats.deaths,
    assists: playerGameStats.assists,
    headshots: playerGameStats.headshots,
    meleeKills: playerGameStats.meleeKills,
    grenadeKills: playerGameStats.grenadeKills,
    gamertag: users.gamertag,
  })
  .from(playerGameStats)
  .innerJoin(users, eq(playerGameStats.userId, users.id))
  .where(eq(playerGameStats.gameId, gameId))
  .orderBy(desc(playerGameStats.kills));
}

// Player queries
export async function getPlayerById(userId: string) {
  return db.query.users.findFirst({
    where: eq(users.id, userId),
  });
}

export async function getPlayerProfile(userId: string) {
  const result = await db.execute<Record<string, unknown>>(sql`
    SELECT * FROM vw_player_profile WHERE id = ${userId}
  `);
  const rows = Array.from(result);
  return rows[0];
}

export async function getPlayerLifetimeStats(userId: string) {
  return db.query.playerLifetimeStats.findFirst({
    where: eq(playerLifetimeStats.userId, userId),
  });
}

export async function getPlayerWeaponStats(userId: string) {
  const result = await db.execute<Record<string, unknown>>(sql`
    SELECT * FROM vw_player_weapon_breakdown WHERE user_id = ${userId}
  `);
  return Array.from(result);
}

export async function getPlayerGameHistory(userId: string, limit = 20) {
  const result = await db.execute<Record<string, unknown>>(sql`
    SELECT * FROM vw_player_game_history WHERE user_id = ${userId} LIMIT ${limit}
  `);
  return Array.from(result);
}

export async function getPlayerAchievements(userId: string) {
  const result = await db.execute<Record<string, unknown>>(sql`
    SELECT * FROM vw_achievement_progress WHERE user_id = ${userId}
  `);
  return Array.from(result);
}

// Leaderboard queries
export async function getLeaderboard(sortBy: 'kills' | 'kd' | 'wins' = 'kills', limit = 50) {
  let orderColumn = 'total_kills';
  if (sortBy === 'kd') orderColumn = 'kd_ratio';
  if (sortBy === 'wins') orderColumn = 'games_won';

  const result = await db.execute<Record<string, unknown>>(sql`
    SELECT * FROM vw_player_leaderboard
    ORDER BY ${sql.raw(orderColumn)} DESC
    LIMIT ${limit}
  `);
  return Array.from(result);
}

// Stats queries
export async function getWeaponStats() {
  const result = await db.execute<Record<string, unknown>>(sql`
    SELECT * FROM vw_weapon_stats
  `);
  return Array.from(result);
}

export async function getMapStats() {
  const result = await db.execute<Record<string, unknown>>(sql`
    SELECT * FROM vw_map_stats
  `);
  return Array.from(result);
}

// Game Summary
export async function getGameSummary(gameId: string) {
  const result = await db.execute<Record<string, unknown>>(sql`
    SELECT * FROM get_game_summary(${gameId})
  `);
  return Array.from(result);
}

export async function getGameAchievements(gameId: string) {
  return db.select({
    id: playerAchievements.id,
    gamertag: users.gamertag,
    achievementName: achievements.name,
    achievementDescription: achievements.description,
    unlockedAt: playerAchievements.unlockedAt,
  })
  .from(playerAchievements)
  .innerJoin(users, eq(playerAchievements.userId, users.id))
  .innerJoin(achievements, eq(playerAchievements.achievementId, achievements.id))
  .where(eq(playerAchievements.gameId, gameId));
}
