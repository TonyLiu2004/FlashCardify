import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getProducts } from '@/utils/supabase/queries';

export async function GET(req: Request) {
  try {
    const supabase = createClient();
    
    const products = await getProducts(supabase);

    if (!products || products.length === 0) {
      return NextResponse.json({ message: 'No products found' }, { status: 404 });
    }

    return NextResponse.json(products, { status: 200 });
  } catch (error: unknown) {
    console.error('Error fetching products:', error);

    let errorMessage = 'Unknown error occurred';
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json({ error: `Error fetching products: ${errorMessage}` }, { status: 500 });
  }
}
