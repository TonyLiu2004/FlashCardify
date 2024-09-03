import { NextResponse } from 'next/server';
import { upsertFlashcardRecord, getFlashcards, incrementTotalCardsBatch } from '@/utils/supabase/admin';
import type { TablesInsert } from 'types_db';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body?.flashcards || !Array.isArray(body.flashcards)) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const flashcards: TablesInsert<'flashcards'>[] = body.flashcards;

    // Fetch existing flashcards for the deck and user to determine if new flashcards are being added
    const deckId = flashcards[0]?.deck_id;
    const userId = flashcards[0]?.user_id;

    if (!deckId || !userId) {
      return NextResponse.json({ error: 'Missing deck_id or user_id in flashcards' }, { status: 400 });
    }

    const existingFlashcards = await getFlashcards(deckId, userId);

    let newFlashcardCount = 0;

    for (const flashcard of flashcards) {
      const flashcardExists = existingFlashcards.some(fc => fc.id === flashcard.id);

      if (!flashcardExists) {
        newFlashcardCount += 1;
      }

      await upsertFlashcardRecord(flashcard);
    }

    if (newFlashcardCount > 0) {
    
      await incrementTotalCardsBatch(userId, newFlashcardCount);
    }

    return NextResponse.json({ message: 'Flashcards saved successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Error saving flashcards:', error.message);
    return NextResponse.json({ error: `Error saving flashcards: ${error.message}` }, { status: 500 });
  }
}
