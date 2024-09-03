import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getUser } from '@/utils/supabase/queries';
import { upsertLoginStreak } from '@/utils/supabase/admin';
export const revalidate = 0;

export async function GET(req: Request) {
  try {
    const supabase = createClient();

    const user = await getUser(supabase);
    if (user) {
      upsertLoginStreak(user.id).catch(error => {
        console.error('Error updating login streak:', error.message);
      });
    }
    return new NextResponse(JSON.stringify(user), { status: 200 });
  } catch (error: any) {
    console.error('Error fetching user:', error.message);
    return new NextResponse(`Error fetching user: ${error.message}`, { status: 500 });
  }
}
