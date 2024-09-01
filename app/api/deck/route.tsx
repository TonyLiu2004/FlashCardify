import { NextResponse } from 'next/server';
import { upsertDeckRecord, getDecks, deleteDeck } from '@/utils/supabase/admin';
import type { TablesInsert } from 'types_db';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body || !body.deck) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const deck: TablesInsert<'decks'> = body.deck;

    await upsertDeckRecord(deck);

    return NextResponse.json({ message: 'Deck saved successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Error saving Deck:', error.message);
    return NextResponse.json({ error: `Error saving Deck: ${error.message}` }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('user_id');

    if (!userId) {
      return NextResponse.json({ error: 'Missing user_id param' }, { status: 400 });
    }

    const decks = await getDecks(userId);

    if (!decks || decks.length === 0) {
      return NextResponse.json({ message: 'No decks found', data: [] }, { status: 200 });
    }

    return NextResponse.json({ message: 'Decks fetched successfully', data: decks }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching decks:', error.message);
    return NextResponse.json({ error: `Error fetching decks: ${error.message}` }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const deckId = searchParams.get('deck_id');
    const userId = searchParams.get('user_id');

    if (!deckId || !userId) {
      return NextResponse.json({ error: 'Missing deck_id or user_id param' }, { status: 400 });
    }

    await deleteDeck(deckId, userId);

    return NextResponse.json({ message: 'Deck deleted successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Error deleting deck:', error.message);
    return NextResponse.json({ error: `Error deleting deck: ${error.message}` }, { status: 500 });
  }
}
