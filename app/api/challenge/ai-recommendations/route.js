import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const systemPrompt = `
            You are a tutor. Your task is to generate concise study recommendations based on the questions a user answered, with a focus on those they got incorrect. Follow these steps:
            1. Provide positive feedback on the questions the user answered correctly, highlighting their strengths.
            2. Offer constructive feedback on the questions the user answered incorrectly, identifying areas for improvement.
            3. Recommend specific websites or resources to help the user strengthen these weak areas.
            4. Summarize your response in a brief paragraph, keeping it supportive and to the point.
            5. Keep your response between 300 - 515 characters. 
            Return your response as a JSON object with a 'suggestion' key containing your recommendation as a string.
        `;

    const openai = new OpenAI();
    const data = await request.json();

    const userContent = JSON.stringify(data.questions);

    const completion = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent }
      ],
      model: 'gpt-4-1106-preview',
      response_format: { type: 'json_object' }
    });

    const suggestions = JSON.parse(completion.choices[0].message.content);
    return NextResponse.json(suggestions);
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: `Error processing request: ${error.message}` },
      { status: 500 }
    );
  }
}
