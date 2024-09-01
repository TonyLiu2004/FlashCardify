import { NextResponse } from 'next/server';
import { upsertQuestionRecord, getQuestions } from '@/utils/supabase/admin';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const challenge_id = searchParams.get('challenge_id');

        if (!challenge_id) {
            return NextResponse.json({ error: 'Missing challenge_id or deck_id' }, { status: 400 });
        }

        const questions = await getQuestions(challenge_id);

        return NextResponse.json({ questions }, { status: 200 });
    } catch (err) {
        console.error('Error processing the request:', err);
        return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            id,
            challenge_id,
            question_number,
            flashcard_id,
            question,
            choice_a,
            choice_b,
            choice_c,
            choice_d,
            answer,
            user_answer,
            status,
            shuffle_index,
            created_at,
        } = body;

        if (!id || !challenge_id || !question || !choice_a || !choice_b || !choice_c || !choice_d || !answer) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const questionData = {
            id,
            challenge_id,
            question_number: question_number || null,
            flashcard_id: flashcard_id || null,
            question,
            choice_a,
            choice_b,
            choice_c,
            choice_d,
            answer,
            user_answer: user_answer || null,
            status: status || 'not completed',
            shuffle_index: shuffle_index || null,
            created_at: created_at || new Date().toISOString(),
        };

        await upsertQuestionRecord(questionData);

        return NextResponse.json({ message: 'Question upserted successfully' }, { status: 200 });
    } catch (err) {
        console.error('Error processing the request:', err);
        return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
    }
}

