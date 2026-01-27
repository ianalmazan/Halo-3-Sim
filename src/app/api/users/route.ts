import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { getAllUsers } from '@/lib/queries';

export async function GET() {
  try {
    const allUsers = await getAllUsers();
    return NextResponse.json(allUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { gamertag, email, serviceTag } = await request.json();

    if (!gamertag || !email || !serviceTag) {
      return NextResponse.json(
        { error: 'gamertag, email, and serviceTag are required' },
        { status: 400 }
      );
    }

    const [user] = await db.insert(users).values({
      gamertag,
      email,
      serviceTag: serviceTag.toUpperCase().slice(0, 4),
    }).returning();

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
