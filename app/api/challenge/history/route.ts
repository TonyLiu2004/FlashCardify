import { NextResponse } from 'next/server';
import { getChallengeHistory, insertChallengeHistoryRecord } from '@/utils/supabase/admin';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const user_id = searchParams.get('user_id');

        if (!user_id) {
            return NextResponse.json({ error: 'Missing user_id' }, { status: 400 });
        }

        const data = await getChallengeHistory(user_id);

        if (!data || data.length === 0) {
            return NextResponse.json({ message: 'No challenge history found for this user.' }, { status: 404 });
        }

        return NextResponse.json({ data }, { status: 200 });
    } catch (err) {
        console.error('Error processing the request:', err);
        return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { challenge_id, accuracy, incorrect, correct, ai_suggestion, time_taken, attempt_number } = body;

        if (!challenge_id || accuracy === undefined || incorrect === undefined || correct === undefined || !attempt_number) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const data = await insertChallengeHistoryRecord(
            challenge_id,
            accuracy,
            incorrect,
            correct,
            ai_suggestion || '',
            time_taken || 0,
            attempt_number
        );

        return NextResponse.json({ data }, { status: 200 });
    } catch (err) {
        console.error('Error processing the request:', err);
        return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
    }
}
