import { NextResponse } from 'next/server';
import { changeDeckPreference } from '@/utils/supabase/admin';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { id, deck_id, user_id, isStarred } = body;

    if (!deck_id || !user_id || typeof isStarred !== 'boolean') {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    await changeDeckPreference(id, deck_id, user_id, isStarred);

    if (isStarred) {
      return NextResponse.json({ message: 'Deck liked successfully' }, { status: 200 });
    } else {
      return NextResponse.json({ message: 'Deck unliked successfully' }, { status: 200 });
    }
  } catch (error: any) {
    console.error('Error processing like/unlike request:', error.message);
    return NextResponse.json({ error: `Error processing request: ${error.message}` }, { status: 500 });
  }
}
