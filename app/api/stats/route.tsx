import { NextResponse } from 'next/server';
import { getUserStats } from '@/utils/supabase/admin';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('user_id');

    if (!userId) {
      return NextResponse.json({ error: 'Missing user_id param' }, { status: 400 });
    }

    const userStats = await getUserStats(userId);

    if (!userStats) {
      return NextResponse.json({ error: 'No stats found for the user' }, { status: 404 });
    }

    return NextResponse.json({ message: 'User stats fetched successfully', data: userStats }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching user stats:', error.message);
    return NextResponse.json({ error: `Error fetching user stats: ${error.message}` }, { status: 500 });
  }
}
