import { NextResponse } from 'next/server';
import { upsertQuestionRecord } from '@/utils/supabase/admin';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { questions } = body;
        if (!Array.isArray(questions) || questions.length === 0) {
            return NextResponse.json({ error: 'Invalid questions data' }, { status: 400 });
        }

        // Track errors for individual questions
        const errorMessages: string[] = [];

        await Promise.all(
            questions.map(async (question) => {
                try {
                    await upsertQuestionRecord(question);
                } catch (error: any) {
                    console.error(`Error upserting question ${question.id}:`, error);
                    errorMessages.push(`Error with question ID ${question.id}: ${error.message}`);
                }
            })
        );

        if (errorMessages.length > 0) {
            return NextResponse.json({ error: 'Some questions failed to upsert', details: errorMessages }, { status: 500 });
        }

        return NextResponse.json({ message: 'Questions upserted successfully' }, { status: 200 });
    } catch (err: any) {
        console.error('Error processing the request:', err);
        return NextResponse.json({ error: `An unexpected error occurred: ${err.message}` }, { status: 500 });
    }
}
