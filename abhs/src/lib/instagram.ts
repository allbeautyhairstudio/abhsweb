/**
 * Instagram API integration — fetches posts from the Instagram Graph API.
 * Requires INSTAGRAM_ACCESS_TOKEN in .env.local.
 *
 * Token auto-refresh:
 *   Long-lived tokens expire every 60 days. This module auto-refreshes
 *   the token every 50 days and stores the refreshed token in
 *   data/instagram-token.json. Falls back to .env.local if no stored token.
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

export interface InstagramPost {
  id: string;
  caption?: string;
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  media_url: string;
  thumbnail_url?: string;
  permalink: string;
  timestamp: string;
}

export interface InstagramFeedResult {
  posts: InstagramPost[];
  nextCursor: string | null;
}

interface StoredToken {
  access_token: string;
  refreshed_at: string;
}

const INSTAGRAM_API = 'https://graph.instagram.com/v21.0';
const FIELDS = 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp';
const TOKEN_FILE = join(process.cwd(), 'data', 'instagram-token.json');
const REFRESH_INTERVAL_MS = 50 * 24 * 60 * 60 * 1000; // 50 days

/**
 * Get the best available token — stored file first, then .env.local.
 */
function getToken(): { token: string; needsRefresh: boolean } | null {
  // Try stored token first
  try {
    const raw = readFileSync(TOKEN_FILE, 'utf-8');
    const stored: StoredToken = JSON.parse(raw);
    if (stored.access_token) {
      const age = Date.now() - new Date(stored.refreshed_at).getTime();
      return { token: stored.access_token, needsRefresh: age > REFRESH_INTERVAL_MS };
    }
  } catch {
    // No stored token — fall through
  }

  // Fall back to env var
  const envToken = process.env.INSTAGRAM_ACCESS_TOKEN;
  if (!envToken) return null;

  // Env token always needs refresh (we don't know when it was created)
  return { token: envToken, needsRefresh: true };
}

/**
 * Refresh the Instagram long-lived token and store the new one.
 * Returns the new token on success, or the original token on failure.
 */
async function refreshToken(currentToken: string): Promise<string> {
  try {
    const url = `${INSTAGRAM_API}/refresh_access_token?grant_type=ig_refresh_token&access_token=${currentToken}`;
    const res = await fetch(url);

    if (!res.ok) {
      console.error(`Instagram token refresh failed: ${res.status} ${res.statusText}`);
      return currentToken;
    }

    const data = await res.json();
    const newToken = data.access_token;

    if (!newToken) {
      console.error('Instagram token refresh returned no token');
      return currentToken;
    }

    // Store the refreshed token
    mkdirSync(join(process.cwd(), 'data'), { recursive: true });
    const stored: StoredToken = {
      access_token: newToken,
      refreshed_at: new Date().toISOString(),
    };
    writeFileSync(TOKEN_FILE, JSON.stringify(stored, null, 2));
    console.log('Instagram token refreshed and stored');

    return newToken;
  } catch (err) {
    console.error('Instagram token refresh error:', err);
    return currentToken;
  }
}

/**
 * Fetch recent Instagram posts with pagination support.
 * Auto-refreshes token when needed. Returns empty result if token
 * is missing or API fails (graceful degradation).
 */
export async function getInstagramPosts(
  limit = 12,
  after?: string
): Promise<InstagramFeedResult> {
  const tokenInfo = getToken();
  if (!tokenInfo) return { posts: [], nextCursor: null };

  let { token } = tokenInfo;

  // Auto-refresh if due
  if (tokenInfo.needsRefresh) {
    token = await refreshToken(token);
  }

  try {
    let url = `${INSTAGRAM_API}/me/media?fields=${FIELDS}&limit=${limit}&access_token=${token}`;
    if (after) url += `&after=${after}`;

    const res = await fetch(url, { next: { revalidate: 3600 } });

    if (!res.ok) {
      // If 400, token might be expired — try one refresh
      if (res.status === 400 && !tokenInfo.needsRefresh) {
        console.log('Instagram 400 — attempting token refresh...');
        const refreshed = await refreshToken(token);
        if (refreshed !== token) {
          // Retry with new token
          let retryUrl = `${INSTAGRAM_API}/me/media?fields=${FIELDS}&limit=${limit}&access_token=${refreshed}`;
          if (after) retryUrl += `&after=${after}`;
          const retryRes = await fetch(retryUrl, { next: { revalidate: 3600 } });
          if (retryRes.ok) {
            const data = await retryRes.json();
            return {
              posts: (data.data ?? []) as InstagramPost[],
              nextCursor: data.paging?.cursors?.after ?? null,
            };
          }
        }
      }

      console.error(`Instagram API error: ${res.status} ${res.statusText}`);
      return { posts: [], nextCursor: null };
    }

    const data = await res.json();
    const posts = (data.data ?? []) as InstagramPost[];
    const nextCursor: string | null = data.paging?.cursors?.after ?? null;

    return { posts, nextCursor };
  } catch (err) {
    console.error('Instagram fetch failed:', err);
    return { posts: [], nextCursor: null };
  }
}
