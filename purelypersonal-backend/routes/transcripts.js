import { Router } from 'express';
import { supabase } from '../middleware/auth.js';

const router = Router();

// GET /api/meetings/:id/transcript — Full transcript segments
router.get('/:id/transcript', async (req, res) => {
  const userId = req.user.id;

  // Verify ownership
  const { data: meeting } = await supabase
    .from('meetings')
    .select('id')
    .eq('id', req.params.id)
    .eq('user_id', userId)
    .single();

  if (!meeting) return res.status(404).json({ error: 'Meeting not found' });

  const { data: segments, error } = await supabase
    .from('transcript_segments')
    .select('*')
    .eq('meeting_id', req.params.id)
    .eq('is_partial', false)
    .order('sequence_index', { ascending: true });

  if (error) return res.status(500).json({ error: error.message });
  res.json({ segments: segments || [] });
});

// GET /api/meetings/:id/transcript/live — SSE for real-time transcript
router.get('/:id/transcript/live', async (req, res) => {
  const userId = req.user.id;

  // Verify ownership
  const { data: meeting } = await supabase
    .from('meetings')
    .select('id, recall_bot_status')
    .eq('id', req.params.id)
    .eq('user_id', userId)
    .single();

  if (!meeting) return res.status(404).json({ error: 'Meeting not found' });

  // Set SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });

  res.write('data: {"type":"connected"}\n\n');

  let lastSeqIndex = parseInt(req.query.after || '0');
  let isActive = true;

  const poll = async () => {
    if (!isActive) return;

    try {
      // Check meeting status
      const { data: currentMeeting } = await supabase
        .from('meetings')
        .select('recall_bot_status')
        .eq('id', req.params.id)
        .single();

      if (['done', 'processed', 'error', 'fatal'].includes(currentMeeting?.recall_bot_status)) {
        res.write(`data: ${JSON.stringify({ type: 'meeting_ended', status: currentMeeting.recall_bot_status })}\n\n`);
        res.end();
        return;
      }

      // Fetch new segments
      const { data: newSegments } = await supabase
        .from('transcript_segments')
        .select('*')
        .eq('meeting_id', req.params.id)
        .gt('sequence_index', lastSeqIndex)
        .order('sequence_index', { ascending: true });

      if (newSegments?.length) {
        for (const seg of newSegments) {
          res.write(`data: ${JSON.stringify({ type: 'segment', segment: seg })}\n\n`);
          lastSeqIndex = Math.max(lastSeqIndex, seg.sequence_index);
        }
      }
    } catch (e) {
      console.error('[sse] Poll error:', e.message);
    }

    if (isActive) setTimeout(poll, 2000);
  };

  poll();

  req.on('close', () => {
    isActive = false;
  });
});

export default router;
