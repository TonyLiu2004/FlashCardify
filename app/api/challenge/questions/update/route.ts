import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getUser } from '@/utils/supabase/queries';
import { updateQuestionsFields } from '@/utils/supabase/admin';

export async function POST(req: Request) {
  try {
    const supabase = createClient();

    const user = await getUser(supabase);
    if (!user) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const body = await req.json();
    const { id, user_answer, status } = body;
    if (!id || !user_answer || !status) {
      return new NextResponse(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }

    await updateQuestionsFields(id, { user_answer, status });

    return new NextResponse(JSON.stringify({ message: 'Question updated successfully' }), { status: 200 });
  } catch (error: any) {
    console.error('Error processing the request:', error.message);
    return new NextResponse(`Error processing the request: ${error.message}`, { status: 500 });
  }
}
