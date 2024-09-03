import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@/utils/supabase/server';
import { getUser, getSubscription } from '@/utils/supabase/queries';

export async function POST(req: Request) {
    try {
        const supabase = createClient();

        // Get user and subscription details
        const user = await getUser(supabase);
        if (!user) {
            return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
        }

        // const subscription = await getSubscription(supabase);
        const defaultFlashcards = 10;

        // Define the number of flashcards to generate based on subscription
        let numFlashcards = defaultFlashcards;
        // if (subscription && subscription.status === 'active') {
        //     const config = await getFlashcardConfig(subscription.prices.product_id);
        //     if (config) {
        //         numFlashcards = config || defaultFlashcards;
        //     }
        // }

        const data = await req.json();

        const flashcards = data.flashcards;

        const systemPrompt = `
        You are an AI tasked with generating a quiz based on a set of flashcards. Your goal is to create exactly 10 multiple-choice questions. Each question should be clear, focused on a single concept, and approximately equal in difficulty.
        
        Instructions:
        1. Each question must be based on the content provided in the flashcards.
        2. Ensure that each question is relevant, concise, and not repetitive in a way that makes multiple questions trivial or identical.
        3. Provide four answer choices (labeled as choice_a, choice_b, choice_c, choice_d) for each question.
        4. Include the correct answer within the choices.
        5. Ensure that the correct answer is based on the information from the corresponding flashcard.
        6. Distribute the difficulty of questions evenly across the quiz.
        7. If you find it difficult to generate 10 direct questions, create additional questions by slightly expanding the context or application of the flashcard content, ensuring relevance to the topic without being overly repetitive.
        8. Avoid creating multiple questions that test the same simple concept in the same way. Instead, create a new question that challenges the user to think about the concept in a different or slightly broader context.
        9. Return 10 questions in the following strict JSON format, with an array of questions under a 'questions' key:
        
        {
          "questions": [
            {
              "flashcard_id": "<flashcard_id>",
              "question": "<question>",
              "choice_a": "<choice_a>",
              "choice_b": "<choice_b>",
              "choice_c": "<choice_c>",
              "choice_d": "<choice_d>",
              "answer": "<correct_choice>"
            },
            ...
          ]
        }
        
        Return exactly 10 questions. Only return the JSON object in the format specified above. Do not include any other keys such as 'quiz' or variations in structure. The key must be 'questions' and the value must be an array of questions.
        `;
        

        const openai = new OpenAI();
        const completion = await openai.chat.completions.create({
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: JSON.stringify(flashcards) },
            ],
            model: "gpt-4o-mini",
            response_format: { type: 'json_object' }
        });

        const content = completion.choices[0]?.message?.content;
        if (!content) {
            throw new Error('No content returned from GPT');
        }

        const questions = JSON.parse(content);
        return NextResponse.json({ questions });
    } catch (error: unknown) {
        console.error('Error processing request:', (error as Error).message);
        return NextResponse.json({ error: `Error processing request: ${(error as Error).message}` }, { status: 500 });
    }
}
