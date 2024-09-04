import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@/utils/supabase/server';
import { getUser, getSubscription, getFlashcardConfig } from '@/utils/supabase/queries';

export async function POST(req: Request) {
  try {
    const supabase = createClient();

    const user = await getUser(supabase);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const subscription = await getSubscription(supabase, user.id);
    const defaultFlashcards = 10;

    let numFlashcards = defaultFlashcards;
    if (subscription && subscription.status === 'active') {
      const config = await getFlashcardConfig(subscription.prices.product_id);
      numFlashcards = config ? config : defaultFlashcards;
    }

    const systemPrompt = `
      You are a flashcard creator. Your task is to generate concise and effective flashcards based on the given topic or content. Follow these steps:
      1. Create clear and accurate questions for the front of the flashcard
      2. Provide accurate and informative answers for the back of the flashcard
      3. Ensure that each flashcard focuses on a single concept or piece of information
      4. Use simple language to make the flashcards accessible to a wide range of learners
      5. Include a variety of question types, such as definitions, examples, comparisons, and applications
      6. Avoid overly complex or ambiguous content
      7. When appropriate, use mnemonics or memory aids to help reinforce the information
      8. Tailor the difficulty level of the flashcards to the user's specified preferences
      9. If given a body of text, extract the most important and relevant information for the flashcards
      10. Also create a balanced set of flashcards that covers the topic comprehensively
      11. Only generate ${numFlashcards} flashcards.

      Return in the following JSON format:
      {
        "flashcards": [
          {
            "front": "str",
            "back": "str"
          }
        ]
      }
    `;

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || '',
    });


    const textData = await req.text();

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: textData },
      ],
      temperature: 0.7,
    });

    const flashcardsResponse = completion.choices?.[0]?.message?.content;
    if (!flashcardsResponse) {
      throw new Error('Invalid response from OpenAI');
    }

    const flashcards = JSON.parse(flashcardsResponse);

    return NextResponse.json(flashcards.flashcards);
  } catch (error: any) {
    console.error('Error processing request:', error.message);
    return NextResponse.json(
      { error: `Error processing request: ${error.message}` },
      { status: 500 }
    );
  }
}
