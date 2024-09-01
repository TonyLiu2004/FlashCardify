import { NextRequest, NextResponse } from 'next/server';

interface RateLimitData {
  count: number;
  lastReset: number;
}

const rateLimitMap = new Map<string, RateLimitData>();

export default function rateLimit(request: NextRequest): NextResponse | null {
  const ip = request.ip ?? request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown';
  const limit = 5; // Limiting requests to 5 per minute per IP
  const windowMs = 60 * 1000; // 1 minute

  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, {
      count: 0,
      lastReset: Date.now(),
    });
  }

  const ipData = rateLimitMap.get(ip)!;

  if (Date.now() - ipData.lastReset > windowMs) {
    ipData.count = 0;
    ipData.lastReset = Date.now();
  }

  if (ipData.count >= limit) {
    return new NextResponse('Too Many Requests', { status: 429 });
  }

  ipData.count += 1;
  rateLimitMap.set(ip, ipData); // Ensure the Map is updated

  return null; // Proceed to the next middleware or handler
}
