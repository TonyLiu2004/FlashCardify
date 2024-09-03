// WIP 

import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@/utils/supabase/server';
import { getUser } from '@/utils/supabase/queries';

export async function POST(req: Request) {
    try {
        const supabase = createClient();

        const user = await getUser(supabase);
        if (!user) {
            return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
        }
        const data = await req.json();

        const response = data.response;

        const systemPrompt = `
            You are an AI assistant who is tasked with giving suggestions for how to improve user learning.
        `;
        

        const openai = new OpenAI();
        const completion = await openai.chat.completions.create({
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: JSON.stringify(response) },
            ],
            model: "gpt-4o-mini",
            response_format: { type: 'json_object' }
        });

        const content = completion.choices[0]?.message?.content;
        if (!content) {
            throw new Error('No content returned from GPT');
        }

        const suggestion = JSON.parse(content);
        return NextResponse.json({ suggestion });
    } catch (error: unknown) {
        console.error('Error processing request:', (error as Error).message);
        return NextResponse.json({ error: `Error processing request: ${(error as Error).message}` }, { status: 500 });
    }
}
