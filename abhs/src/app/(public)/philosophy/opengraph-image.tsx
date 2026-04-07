import { createOgImage } from '@/lib/og-image';

export const runtime = 'nodejs';
export const contentType = 'image/png';
export const size = { width: 1200, height: 630 };

export default function Image() {
  return createOgImage('My Philosophy', 'Hair that works with your life, not against it');
}
