import { NextRequest, NextResponse } from 'next/server';
import { getLeaderboard } from '@/lib/queries';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sortBy = searchParams.get('sortBy') as 'kills' | 'kd' | 'wins' || 'kills';
    const limit = parseInt(searchParams.get('limit') || '50');

    const leaderboard = await getLeaderboard(sortBy, limit);
    return NextResponse.json(leaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
  }
}
