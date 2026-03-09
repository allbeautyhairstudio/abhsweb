import { NextRequest, NextResponse } from 'next/server';
import { getInstagramPosts } from '@/lib/instagram';

/**
 * Client-side endpoint for loading more Instagram posts.
 * Proxies through our server so the access token stays server-side
 * and connect-src CSP stays 'self'.
 *
 * Security:
 * - Access token never exposed to client
 * - Rate limited (20 requests/IP/hour)
 * - Cursor parameter validated (alphanumeric only)
 * - Cached responses reduce API calls
 */

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  // Skip rate limiting for local development
  if (ip === '127.0.0.1' || ip === '::1' || ip === 'localhost' || ip === '::ffff:127.0.0.1') {
    return false;
  }

  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60 * 60 * 1000 });
    return false;
  }

  if (entry.count >= 20) return true;
  entry.count++;
  return false;
}

export async function GET(request: NextRequest) {
  // Rate limit
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: 'Too many requests.' },
      { status: 429 }
    );
  }

  // Validate cursor — Instagram cursors are alphanumeric/base64-like
  const after = request.nextUrl.searchParams.get('after') ?? undefined;
  if (after && !/^[a-zA-Z0-9=_-]+$/.test(after)) {
    return NextResponse.json(
      { error: 'Invalid cursor.' },
      { status: 400 }
    );
  }

  const result = await getInstagramPosts(12, after);

  return NextResponse.json(result, {
    headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=1800' },
  });
}
