import { Router } from 'express';
import crypto from 'crypto';
import { supabase } from '../middleware/auth.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// POST /api/meetings/:id/share — Generate share token (auth required)
router.post('/api/meetings/:id/share', requireAuth, async (req, res) => {
  const userId = req.user.id;

  const shareToken = crypto.randomBytes(16).toString('hex');

  const { data, error } = await supabase
    .from('meetings')
    .update({ share_token: shareToken, is_shared: true })
    .eq('id', req.params.id)
    .eq('user_id', userId)
    .select('share_token')
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json({ share_token: data.share_token });
});

// DELETE /api/meetings/:id/share — Revoke share link (auth required)
router.delete('/api/meetings/:id/share', requireAuth, async (req, res) => {
  const userId = req.user.id;

  const { error } = await supabase
    .from('meetings')
    .update({ share_token: null, is_shared: false })
    .eq('id', req.params.id)
    .eq('user_id', userId);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

// GET /api/shared/:token — Public meeting view (no auth)
router.get('/api/shared/:token', async (req, res) => {
  const { data: meeting, error } = await supabase
    .from('meetings')
    .select('id, title, platform, started_at, ended_at, duration_seconds, participants, video_url, audio_url, transcript_text, summary, action_items, chapters, created_at')
    .eq('share_token', req.params.token)
    .eq('is_shared', true)
    .single();

  if (error || !meeting) return res.status(404).json({ error: 'Shared meeting not found' });

  // Get transcript segments
  const { data: segments } = await supabase
    .from('transcript_segments')
    .select('speaker_name, text, start_time, end_time, sequence_index')
    .eq('meeting_id', meeting.id)
    .eq('is_partial', false)
    .order('sequence_index', { ascending: true });

  res.json({ meeting, segments: segments || [] });
});

export default router;
