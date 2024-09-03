import { NextResponse } from 'next/server';
import { getFeatureDeck } from '@/utils/supabase/admin';

// May not need this. -- Remove at BUILD 
// export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('user_id')
    try{
        if(!userId) {
            return NextResponse.json({ message: "No userId submitted ", data: []}, {status: 400});
        }
        const featureDeck = await getFeatureDeck(userId);
        if (!featureDeck) {
            NextResponse.json({ message: 'No feature decks found', data: [] }, { status: 200 });
        }
        return NextResponse.json({ message: 'Feature deck fetched successfully', data: featureDeck }, { status: 200 });
    }
    catch (err){
        console.error("GET feature deck failed:", err);
        throw err;
    }
}