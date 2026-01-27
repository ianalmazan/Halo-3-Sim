import { NextRequest, NextResponse } from 'next/server';
import { getPlayerProfile, getPlayerWeaponStats, getPlayerGameHistory, getPlayerAchievements } from '@/lib/queries';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const [profile, weaponStats, gameHistory, achievements] = await Promise.all([
      getPlayerProfile(id),
      getPlayerWeaponStats(id),
      getPlayerGameHistory(id, 10),
      getPlayerAchievements(id),
    ]);

    if (!profile) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }

    return NextResponse.json({
      profile,
      weaponStats,
      gameHistory,
      achievements,
    });
  } catch (error) {
    console.error('Error fetching player stats:', error);
    return NextResponse.json({ error: 'Failed to fetch player stats' }, { status: 500 });
  }
}
