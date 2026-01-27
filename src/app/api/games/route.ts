import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { games } from '@/db/schema';
import { getRecentGames } from '@/lib/queries';

export async function GET() {
  try {
    const recentGames = await getRecentGames(20);
    return NextResponse.json(recentGames);
  } catch (error) {
    console.error('Error fetching games:', error);
    return NextResponse.json({ error: 'Failed to fetch games' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { mapId, gameTypeId } = await request.json();

    if (!mapId || !gameTypeId) {
      return NextResponse.json(
        { error: 'mapId and gameTypeId are required' },
        { status: 400 }
      );
    }

    const [game] = await db.insert(games).values({
      mapId,
      gameTypeId,
      status: 'setup',
    }).returning();

    return NextResponse.json(game, { status: 201 });
  } catch (error) {
    console.error('Error creating game:', error);
    return NextResponse.json({ error: 'Failed to create game' }, { status: 500 });
  }
}
