const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const HOST = 'tiktok-scraper7.p.rapidapi.com';

/**
 * Extract username from a TikTok URL or clean up input.
 */
function extractUsername(input) {
  // Handle TikTok profile URLs like https://www.tiktok.com/@username or https://tiktok.com/@user/video/123
  const urlMatch = input.match(/tiktok\.com\/@([a-zA-Z0-9_.]+)/i);
  if (urlMatch) return urlMatch[1];
  // Strip @ prefix
  return input.replace(/^@/, '').trim();
}

/**
 * Resolve a TikTok username to profile info.
 */
export async function resolveProfile(username) {
  const handle = extractUsername(username);
  const data = await ttFetch('/user/info', { unique_id: handle });

  const user = data?.data?.user;
  const stats = data?.data?.stats;
  if (!user) throw new Error(`TikTok user not found: ${username}`);

  return {
    userId: user.id,
    uniqueId: user.uniqueId,
    displayName: user.nickname,
    avatarUrl: user.avatarLarger || user.avatarMedium || user.avatarThumb,
    followerCount: stats?.followerCount || 0,
  };
}

/**
 * Fetch recent videos from a TikTok user.
 * Returns up to `count` videos with stats.
 */
export async function fetchRecentVideos(username, count = 50) {
  const handle = extractUsername(username);
  const videos = [];
  let cursor = '0';

  while (videos.length < count) {
    const data = await ttFetch('/user/posts', {
      unique_id: handle,
      count: Math.min(30, count - videos.length),
      cursor,
    });

    const items = data?.data?.videos || [];
    if (items.length === 0) break;

    for (const v of items) {
      videos.push({
        videoId: v.video_id || v.id,
        title: v.title || '',
        thumbnailUrl: v.cover || v.origin_cover || v.dynamic_cover,
        url: `https://www.tiktok.com/@${handle}/video/${v.video_id || v.id}`,
        publishedAt: v.create_time ? new Date(v.create_time * 1000).toISOString() : null,
        views: parseInt(v.play_count || v.stats?.playCount || 0),
        likes: parseInt(v.digg_count || v.stats?.diggCount || 0),
        comments: parseInt(v.comment_count || v.stats?.commentCount || 0),
        shares: parseInt(v.share_count || v.stats?.shareCount || 0),
        durationSeconds: v.duration || 0,
      });
    }

    cursor = data?.data?.cursor;
    if (!cursor || !data?.data?.hasMore) break;
  }

  return videos.slice(0, count);
}

/**
 * Calculate outlier metrics for TikTok videos.
 */
export function calculateOutliers(videos, threshold = 2) {
  if (videos.length === 0) return { videos: [], averages: { views: 0, likes: 0, comments: 0 } };

  const avgViews = videos.reduce((s, v) => s + v.views, 0) / videos.length;
  const avgLikes = videos.reduce((s, v) => s + v.likes, 0) / videos.length;
  const avgComments = videos.reduce((s, v) => s + v.comments, 0) / videos.length;

  const enriched = videos.map((v) => {
    const viewsMultiplier = avgViews > 0 ? Math.round((v.views / avgViews) * 10) / 10 : 0;
    const likesMultiplier = avgLikes > 0 ? Math.round((v.likes / avgLikes) * 10) / 10 : 0;
    const commentsMultiplier = avgComments > 0 ? Math.round((v.comments / avgComments) * 10) / 10 : 0;
    const isOutlier = viewsMultiplier >= threshold || likesMultiplier >= threshold || commentsMultiplier >= threshold;

    return { ...v, viewsMultiplier, likesMultiplier, commentsMultiplier, isOutlier };
  });

  return {
    videos: enriched,
    averages: {
      views: Math.round(avgViews),
      likes: Math.round(avgLikes),
      comments: Math.round(avgComments),
    },
  };
}

// ─── Helper ───

async function ttFetch(endpoint, params) {
  if (!RAPIDAPI_KEY) throw new Error('RAPIDAPI_KEY not set');

  const url = new URL(`https://${HOST}${endpoint}`);
  for (const [k, v] of Object.entries(params)) {
    if (v != null) url.searchParams.set(k, String(v));
  }

  const res = await fetch(url.toString(), {
    headers: {
      'x-rapidapi-key': RAPIDAPI_KEY,
      'x-rapidapi-host': HOST,
    },
  });

  if (!res.ok) {
    const err = await res.text();
    console.log(`[tiktok-api] ${endpoint} failed:`, err.slice(0, 200));
    throw new Error(`TikTok API error: ${res.status}`);
  }

  return res.json();
}
