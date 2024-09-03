import { NextResponse } from 'next/server';
import { upsertChallengeRecord } from '@/utils/supabase/admin';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, deck_id, user_id, times_taken, overall_correct, overall_incorrect, overall_accuracy, status } = body;

    if (!id || !deck_id || !user_id) {
      return NextResponse.json({ error: 'Missing id, user_id, or deck_id' }, { status: 400 });
    }

    const data = await upsertChallengeRecord(
      id,
      deck_id,
      user_id,
      times_taken || 0,
      overall_correct || 0,
      overall_incorrect || 0,
      overall_accuracy || 0.0,
      status || 'started'
    );

    return NextResponse.json({ data }, { status: 200 });
  } catch (err) {
    console.error('Error processing the request:', err);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
