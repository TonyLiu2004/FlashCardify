import { NextResponse } from 'next/server';
import { upsertFlashcardRecord, getFlashcards, deleteFlashcard, incrementTotalCards } from '@/utils/supabase/admin';
import type { TablesInsert } from 'types_db';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body?.flashcard) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const flashcard: TablesInsert<'flashcards'> = body.flashcard;

    const existingFlashcards = await getFlashcards(flashcard.deck_id, flashcard.user_id);
    const flashcardExists = existingFlashcards.some(fc => fc.id === flashcard.id);

    if (!flashcardExists) {
      await incrementTotalCards(flashcard.user_id, true);
    }

    await upsertFlashcardRecord(flashcard);

    return NextResponse.json({ message: 'Flashcard saved successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Error saving flashcard:', error.message);
    return NextResponse.json({ error: `Error saving flashcard: ${error.message}` }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const deckId = searchParams.get('deck_id');
    const userId = searchParams.get('user_id');

    if (!deckId || !userId) {
      return NextResponse.json({ error: 'Missing deck_id or user_id param' }, { status: 400 });
    }

    const flashcards = await getFlashcards(deckId, userId);

    if (!flashcards || flashcards.length === 0) {
      return NextResponse.json({ message: 'No flashcards found', data: [] }, { status: 200 });
    }

    return NextResponse.json({ message: 'Flashcards fetched successfully', data: flashcards }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching flashcards:', error.message);
    return NextResponse.json({ error: `Error fetching flashcards: ${error.message}` }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const flashcardId = searchParams.get('flashcard_id');
    const deckId = searchParams.get('deck_id');
    const userId = searchParams.get('user_id');

    if (!flashcardId || !deckId || !userId) {
      return NextResponse.json({ error: 'Missing flashcard_id, deck_id, or user_id param' }, { status: 400 });
    }

    const flashcards = await getFlashcards(deckId, userId);
    const flashcardExists = flashcards.some(fc => fc.id === flashcardId);

    if (!flashcardExists) {
      return NextResponse.json({ error: 'Flashcard not found' }, { status: 404 });
    }

    await deleteFlashcard(flashcardId, deckId, userId);

    await incrementTotalCards(userId, false);

    return NextResponse.json({ message: 'Flashcard deleted successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Error deleting flashcard:', error.message);
    return NextResponse.json({ error: `Error deleting flashcard: ${error.message}` }, { status: 500 });
  }
}