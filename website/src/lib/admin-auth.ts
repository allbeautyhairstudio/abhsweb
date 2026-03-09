import { createHmac, timingSafeEqual } from 'crypto';

const COOKIE_NAME = 'kar_admin_session';
const SESSION_MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds

function getSecret(): string {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) throw new Error('ADMIN_SECRET env var is required');
  return secret;
}

/**
 * Create a signed session token.
 * Format: timestamp.signature
 */
export function createSessionToken(): string {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const signature = createHmac('sha256', getSecret())
    .update(timestamp)
    .digest('hex');
  return `${timestamp}.${signature}`;
}

/**
 * Verify a session token is valid and not expired.
 */
export function verifySessionToken(token: string): boolean {
  const parts = token.split('.');
  if (parts.length !== 2) return false;

  const [timestamp, signature] = parts;
  const now = Math.floor(Date.now() / 1000);
  const created = parseInt(timestamp, 10);

  if (isNaN(created)) return false;
  if (now - created > SESSION_MAX_AGE) return false;

  const expected = createHmac('sha256', getSecret())
    .update(timestamp)
    .digest('hex');

  try {
    return timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expected, 'hex')
    );
  } catch {
    return false;
  }
}

/**
 * Verify the admin password using timing-safe comparison.
 */
export function verifyPassword(input: string): boolean {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return false;

  const inputBuf = Buffer.from(input);
  const passwordBuf = Buffer.from(password);

  if (inputBuf.length !== passwordBuf.length) return false;
  return timingSafeEqual(inputBuf, passwordBuf);
}

/**
 * Check if a NextRequest has a valid admin session cookie.
 * Use in API routes that bypass middleware (e.g. /api/admin/*).
 */
export function isAuthenticated(request: { cookies: { get: (name: string) => { value: string } | undefined } }): boolean {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) return false;
  return verifySessionToken(token);
}

export { COOKIE_NAME, SESSION_MAX_AGE };
