import { NextResponse } from 'next/server';
import { getPublicDecks } from '@/utils/supabase/admin';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export async function GET(req: Request) {
  try {
    const publicDecks = await getPublicDecks();

    if (!publicDecks || publicDecks.length === 0) {
      return NextResponse.json({ message: 'No public decks found', data: [] }, { status: 200 });
    }

    return NextResponse.json({ message: 'Public decks fetched successfully', data: publicDecks }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching public decks:', error.message);
    return NextResponse.json({ error: `Error fetching public decks: ${error.message}` }, { status: 500 });
  }
}
