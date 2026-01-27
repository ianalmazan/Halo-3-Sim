import { NextRequest, NextResponse } from 'next/server';
import { getGameById, getGameSummary, getGameAchievements, getGameTeamScores } from '@/lib/queries';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const [game, scoreboard, achievements, teamScores] = await Promise.all([
      getGameById(id),
      getGameSummary(id),
      getGameAchievements(id),
      getGameTeamScores(id),
    ]);

    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    // Find MVP (player with most kills)
    const mvp = scoreboard.length > 0 ? scoreboard[0] : null;

    return NextResponse.json({
      game,
      teamScores,
      scoreboard,
      achievements,
      mvp,
    });
  } catch (error) {
    console.error('Error fetching game summary:', error);
    return NextResponse.json({ error: 'Failed to fetch game summary' }, { status: 500 });
  }
}
