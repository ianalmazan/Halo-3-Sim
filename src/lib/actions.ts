'use server';

import { db } from '@/db';
import { games, gamePlayers, gameEvents, users } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function createGame(mapId: string, gameTypeId: string) {
  const [game] = await db.insert(games).values({
    mapId,
    gameTypeId,
    status: 'setup',
  }).returning();

  revalidatePath('/games');
  return game;
}

export async function addPlayerToGame(gameId: string, userId: string, teamId: string | null) {
  const [gamePlayer] = await db.insert(gamePlayers).values({
    gameId,
    userId,
    teamId,
  }).returning();

  revalidatePath(`/games/${gameId}`);
  return gamePlayer;
}

export async function removePlayerFromGame(gamePlayerId: string, gameId: string) {
  await db.delete(gamePlayers).where(eq(gamePlayers.id, gamePlayerId));
  revalidatePath(`/games/${gameId}`);
}

export async function startGame(gameId: string) {
  const result = await db.execute(sql`SELECT start_game(${gameId})`);
  revalidatePath(`/games/${gameId}`);
  return result;
}

export async function endGame(gameId: string) {
  const result = await db.execute(sql`SELECT end_game(${gameId})`);
  revalidatePath(`/games/${gameId}`);
  revalidatePath('/games');
  revalidatePath('/dashboard');
  revalidatePath('/leaderboard');
  return result;
}

export async function recordKill(
  gameId: string,
  killerId: string,
  victimId: string,
  weaponId: string,
  options: {
    isHeadshot?: boolean;
    isMelee?: boolean;
    isAssassination?: boolean;
    isGrenade?: boolean;
  } = {}
) {
  const { isHeadshot = false, isMelee = false, isAssassination = false, isGrenade = false } = options;

  const result = await db.execute(sql`
    SELECT record_kill(
      ${gameId},
      ${killerId},
      ${victimId},
      ${weaponId},
      ${isHeadshot},
      ${isMelee},
      ${isAssassination},
      ${isGrenade}
    )
  `);

  revalidatePath(`/games/${gameId}`);
  return result;
}

export async function createUser(gamertag: string, email: string, serviceTag: string) {
  const [user] = await db.insert(users).values({
    gamertag,
    email,
    serviceTag: serviceTag.toUpperCase().slice(0, 4),
  }).returning();

  revalidatePath('/players');
  return user;
}
