/**
 * Instagram API integration — fetches posts from the Instagram Graph API.
 * Requires INSTAGRAM_ACCESS_TOKEN in .env.local.
 *
 * Token setup:
 *   1. Create a Meta Developer app at developers.facebook.com
 *   2. Add "Instagram API with Instagram Login" product
 *   3. Generate a long-lived access token (lasts 60 days)
 *   4. Set INSTAGRAM_ACCESS_TOKEN in .env.local
 *   5. To refresh: GET https://graph.instagram.com/refresh_access_token
 *        ?grant_type=ig_refresh_token&access_token={token}
 */

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

const INSTAGRAM_API = 'https://graph.instagram.com/v21.0';
const FIELDS = 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp';

/**
 * Fetch recent Instagram posts with pagination support.
 * Returns empty result if token is missing or API fails.
 * Uses Next.js fetch caching — revalidates every hour.
 */
export async function getInstagramPosts(
  limit = 12,
  after?: string
): Promise<InstagramFeedResult> {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  if (!token) return { posts: [], nextCursor: null };

  try {
    let url = `${INSTAGRAM_API}/me/media?fields=${FIELDS}&limit=${limit}&access_token=${token}`;
    if (after) url += `&after=${after}`;

    const res = await fetch(url, { next: { revalidate: 3600 } });

    if (!res.ok) {
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
