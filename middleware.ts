import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/utils/supabase/middleware';
import rateLimit from '@/utils/rateLimit';

export async function middleware(request: NextRequest) {
  // Apply rate limiting only to specific routes
  if (request.nextUrl.pathname === '/api/generate') {
    const rateLimitedResponse = rateLimit(request);
    if (rateLimitedResponse) {
      return rateLimitedResponse; // If rate limiting triggered, return response early
    }
  }
  
  // Then update session
  return await updateSession(request);
}

export const config = {
  matcher: [
    '/api/generate', // Apply middleware only to this specific route
  ],
};
