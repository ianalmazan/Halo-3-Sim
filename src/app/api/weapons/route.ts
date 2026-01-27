import { NextResponse } from 'next/server';
import { getAllWeapons } from '@/lib/queries';

export async function GET() {
  try {
    const weapons = await getAllWeapons();
    return NextResponse.json(weapons);
  } catch (error) {
    console.error('Error fetching weapons:', error);
    return NextResponse.json({ error: 'Failed to fetch weapons' }, { status: 500 });
  }
}
