const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const HOST = 'instagram-scraper-api2.p.rapidapi.com';

/**
 * Resolve an Instagram username to profile info.
 */
export async function resolveProfile(username) {
  const handle = username.replace(/^@/, '');
  const data = await igFetch('/v1/info', { username_or_id_or_url: handle });

  const user = data?.data;
  if (!user) throw new Error(`Instagram user not found: ${username}`);

  return {
    userId: user.id,
    username: user.username,
    displayName: user.full_name || user.username,
    avatarUrl: user.profile_pic_url_hd || user.profile_pic_url,
    followerCount: user.follower_count || 0,
  };
}

/**
 * Fetch recent posts/reels from an Instagram user.
 * Returns up to `count` items with engagement stats.
 */
export async function fetchRecentPosts(username, count = 30) {
  const handle = username.replace(/^@/, '');
  const posts = [];
  let paginationToken = null;

  while (posts.length < count) {
    const params = { username_or_id_or_url: handle };
    if (paginationToken) params.pagination_token = paginationToken;

    const data = await igFetch('/v1.2/posts', params);
    const items = data?.data?.items || [];
    if (items.length === 0) break;

    for (const item of items) {
      const isVideo = item.media_type === 2 || item.video_url;
      posts.push({
        videoId: item.code || item.id,
        title: (item.caption?.text || '').slice(0, 120),
        thumbnailUrl: item.thumbnail_url || item.image_versions?.items?.[0]?.url || item.display_url,
        url: `https://www.instagram.com/reel/${item.code}/`,
        publishedAt: item.taken_at ? new Date(item.taken_at * 1000).toISOString() : null,
        views: parseInt(item.play_count || item.view_count || 0),
        likes: parseInt(item.like_count || 0),
        comments: parseInt(item.comment_count || 0),
        durationSeconds: item.video_duration ? Math.round(item.video_duration) : 0,
        isVideo,
      });
    }

    paginationToken = data?.pagination_token;
    if (!paginationToken) break;
  }

  return posts.slice(0, count);
}

/**
 * Calculate outlier metrics for Instagram posts.
 */
export function calculateOutliers(posts, threshold = 2) {
  if (posts.length === 0) return { videos: [], averages: { views: 0, likes: 0, comments: 0 } };

  const avgViews = posts.reduce((s, v) => s + v.views, 0) / posts.length;
  const avgLikes = posts.reduce((s, v) => s + v.likes, 0) / posts.length;
  const avgComments = posts.reduce((s, v) => s + v.comments, 0) / posts.length;

  const enriched = posts.map((v) => {
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

async function igFetch(endpoint, params) {
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
    console.log(`[instagram-api] ${endpoint} failed:`, err.slice(0, 200));
    throw new Error(`Instagram API error: ${res.status}`);
  }

  return res.json();
}
