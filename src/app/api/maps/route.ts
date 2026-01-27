import { NextResponse } from 'next/server';
import { getAllMaps } from '@/lib/queries';

export async function GET() {
  try {
    const maps = await getAllMaps();
    return NextResponse.json(maps);
  } catch (error) {
    console.error('Error fetching maps:', error);
    return NextResponse.json({ error: 'Failed to fetch maps' }, { status: 500 });
  }
}
