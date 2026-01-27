import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { games, gamePlayers } from '@/db/schema';
import { eq, sql, and } from 'drizzle-orm';
import { getGameById, getGameTeamScores, getGamePlayerStats, getGameEvents } from '@/lib/queries';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const game = await getGameById(id);

    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    const [teamScores, playerStats, events] = await Promise.all([
      getGameTeamScores(id),
      getGamePlayerStats(id),
      getGameEvents(id, 20),
    ]);

    return NextResponse.json({
      ...game,
      teamScores,
      playerStats,
      recentEvents: events,
    });
  } catch (error) {
    console.error('Error fetching game:', error);
    return NextResponse.json({ error: 'Failed to fetch game' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { action, userId, teamId } = await request.json();

    if (action === 'start') {
      await db.execute(sql`SELECT start_game(${id})`);
      const game = await getGameById(id);
      return NextResponse.json(game);
    }

    if (action === 'end') {
      await db.execute(sql`SELECT end_game(${id})`);
      const game = await getGameById(id);
      return NextResponse.json(game);
    }

    if (action === 'add_player') {
      if (!userId) {
        return NextResponse.json({ error: 'userId is required' }, { status: 400 });
      }

      await db.insert(gamePlayers).values({
        gameId: id,
        userId,
        teamId: teamId || null,
      });

      const game = await getGameById(id);
      return NextResponse.json(game);
    }

    if (action === 'remove_player') {
      if (!userId) {
        return NextResponse.json({ error: 'userId is required' }, { status: 400 });
      }

      await db.delete(gamePlayers)
        .where(and(eq(gamePlayers.gameId, id), eq(gamePlayers.userId, userId)));

      const game = await getGameById(id);
      return NextResponse.json(game);
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error updating game:', error);
    return NextResponse.json({ error: 'Failed to update game' }, { status: 500 });
  }
}
