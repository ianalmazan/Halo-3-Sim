import { NextRequest, NextResponse } from 'next/server';
import { sql } from 'drizzle-orm';
import { db } from '@/db';
import { getGameEvents } from '@/lib/queries';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const events = await getGameEvents(id, 50);
    return NextResponse.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: gameId } = await params;
    const {
      killerId,
      victimId,
      weaponId,
      isHeadshot = false,
      isMelee = false,
      isAssassination = false,
      isGrenade = false,
    } = await request.json();

    if (!killerId || !victimId || !weaponId) {
      return NextResponse.json(
        { error: 'killerId, victimId, and weaponId are required' },
        { status: 400 }
      );
    }

    // Record the kill
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

    const rows = Array.from(result);

    // Check if score limit has been reached and auto-end game
    const gameEnded = await checkAndEndGameIfScoreLimitReached(gameId);

    return NextResponse.json({
      success: true,
      eventId: rows[0],
      gameEnded
    }, { status: 201 });
  } catch (error) {
    console.error('Error recording kill:', error);
    return NextResponse.json({ error: 'Failed to record kill' }, { status: 500 });
  }
}

async function checkAndEndGameIfScoreLimitReached(gameId: string): Promise<boolean> {
  try {
    // Get game info including game type settings
    const gameResult = await db.execute(sql`
      SELECT g.id, g.status, gt.score_to_win, gt.is_team_based
      FROM games g
      JOIN game_types gt ON g.game_type_id = gt.id
      WHERE g.id = ${gameId} AND g.status = 'in_progress'
    `);

    const gameRows = Array.from(gameResult);
    if (gameRows.length === 0) return false;

    const game = gameRows[0] as { id: string; status: string; score_to_win: number; is_team_based: boolean };
    const scoreToWin = game.score_to_win;
    const isTeamBased = game.is_team_based;

    let scoreLimitReached = false;

    if (isTeamBased) {
      // Check team scores
      const teamScoreResult = await db.execute(sql`
        SELECT team_id, score FROM game_team_scores
        WHERE game_id = ${gameId} AND score >= ${scoreToWin}
        LIMIT 1
      `);
      const teamScoreRows = Array.from(teamScoreResult);
      scoreLimitReached = teamScoreRows.length > 0;
    } else {
      // Check individual player scores (FFA mode)
      const playerScoreResult = await db.execute(sql`
        SELECT user_id, kills FROM player_game_stats
        WHERE game_id = ${gameId} AND kills >= ${scoreToWin}
        LIMIT 1
      `);
      const playerScoreRows = Array.from(playerScoreResult);
      scoreLimitReached = playerScoreRows.length > 0;
    }

    if (scoreLimitReached) {
      // End the game using the existing end_game function
      await db.execute(sql`SELECT end_game(${gameId})`);
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error checking score limit:', error);
    return false;
  }
}
