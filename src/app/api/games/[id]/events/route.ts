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
    return NextResponse.json({ success: true, eventId: rows[0] }, { status: 201 });
  } catch (error) {
    console.error('Error recording kill:', error);
    return NextResponse.json({ error: 'Failed to record kill' }, { status: 500 });
  }
}
