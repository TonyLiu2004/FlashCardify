import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getSubscription } from '@/utils/supabase/queries';

export async function GET(req: Request) {
  try {
    const supabase = createClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ message: 'No user authenticated', subscription: null }, { status: 200 });
    }

    const subscription = await getSubscription(supabase, user.id);

    return NextResponse.json({
      message: subscription ? 'Subscription found' : 'No subscription',
      subscription: subscription ?? null
    }, { status: 200 });
  } catch (error: unknown) {
    console.error('Error fetching subscription:', error);

    let errorMessage = 'Unknown error occurred';
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json({ error: `Error fetching subscription: ${errorMessage}` }, { status: 500 });
  }
}
