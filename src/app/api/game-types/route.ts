import { NextResponse } from 'next/server';
import { getAllGameTypes } from '@/lib/queries';

export async function GET() {
  try {
    const gameTypes = await getAllGameTypes();
    return NextResponse.json(gameTypes);
  } catch (error) {
    console.error('Error fetching game types:', error);
    return NextResponse.json({ error: 'Failed to fetch game types' }, { status: 500 });
  }
}
