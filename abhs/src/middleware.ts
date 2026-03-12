import { NextRequest, NextResponse } from 'next/server';

const COOKIE_NAME = 'kar_admin_session';
const SESSION_MAX_AGE = 7 * 24 * 60 * 60;

/**
 * Middleware to protect /admin routes.
 * Verifies the session cookie using HMAC signature.
 * Redirects to /admin/login if not authenticated.
 *
 * Note: We duplicate the token verification here because
 * middleware runs in the Edge Runtime and can't use Node's
 * crypto module directly — we use Web Crypto API instead.
 */
async function verifyTokenEdge(token: string, secret: string): Promise<boolean> {
  const parts = token.split('.');
  if (parts.length !== 2) return false;

  const [timestamp, signature] = parts;
  const now = Math.floor(Date.now() / 1000);
  const created = parseInt(timestamp, 10);

  if (isNaN(created)) return false;
  if (now - created > SESSION_MAX_AGE) return false;

  // HMAC-SHA256 using Web Crypto API (Edge-compatible)
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signatureBytes = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(timestamp)
  );

  const expected = Array.from(new Uint8Array(signatureBytes))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  // Constant-time comparison
  if (signature.length !== expected.length) return false;
  let mismatch = 0;
  for (let i = 0; i < signature.length; i++) {
    mismatch |= signature.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return mismatch === 0;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect /admin routes (not /admin/login or /api/admin/login)
  if (!pathname.startsWith('/admin')) return NextResponse.next();
  if (pathname === '/admin/login') return NextResponse.next();
  if (pathname.startsWith('/api/admin/')) return NextResponse.next();

  const token = request.cookies.get(COOKIE_NAME)?.value;
  const secret = process.env.ADMIN_SECRET;

  if (!token || !secret) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  const valid = await verifyTokenEdge(token, secret);
  if (!valid) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
