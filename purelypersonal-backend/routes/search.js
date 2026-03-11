import { Router } from 'express';
import { supabase } from '../middleware/auth.js';

const router = Router();

// GET /api/search?q=... — Full-text search across meetings
router.get('/', async (req, res) => {
  const userId = req.user.id;
  const { q, limit = 20 } = req.query;

  if (!q || q.trim().length < 2) {
    return res.status(400).json({ error: 'Search query must be at least 2 characters' });
  }

  // Use PostgreSQL full-text search with ranking
  const { data, error } = await supabase.rpc('search_meetings', {
    search_query: q.trim(),
    user_id_param: userId,
    result_limit: parseInt(limit),
  });

  if (error) {
    // Fallback to ILIKE search if RPC not yet created
    console.log('[search] RPC not available, using ILIKE fallback:', error.message);

    const { data: fallback, error: fbErr } = await supabase
      .from('meetings')
      .select('id, title, platform, recall_bot_status, started_at, duration_seconds, created_at, transcript_text')
      .eq('user_id', userId)
      .or(`title.ilike.%${q}%,transcript_text.ilike.%${q}%`)
      .order('created_at', { ascending: false })
      .limit(parseInt(limit));

    if (fbErr) return res.status(500).json({ error: fbErr.message });

    // Generate basic highlights
    const results = (fallback || []).map(m => {
      let snippet = '';
      if (m.transcript_text) {
        const idx = m.transcript_text.toLowerCase().indexOf(q.toLowerCase());
        if (idx >= 0) {
          const start = Math.max(0, idx - 80);
          const end = Math.min(m.transcript_text.length, idx + q.length + 80);
          snippet = (start > 0 ? '...' : '') + m.transcript_text.slice(start, end) + (end < m.transcript_text.length ? '...' : '');
        }
      }
      const { transcript_text, ...rest } = m;
      return { ...rest, snippet };
    });

    return res.json({ results });
  }

  res.json({ results: data || [] });
});

export default router;
