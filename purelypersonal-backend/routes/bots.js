import { Router } from 'express';
import { supabase } from '../middleware/auth.js';
import { getBot } from '../services/recall.js';

const router = Router();

// GET /api/bots/active — List active bots for user
router.get('/active', async (req, res) => {
  const userId = req.user.id;

  const activeStatuses = ['creating', 'ready', 'joining_call', 'in_waiting_room', 'in_call_not_recording', 'in_call_recording'];

  const { data, error } = await supabase
    .from('meetings')
    .select('id, title, meeting_url, platform, recall_bot_status, bot_name, started_at, created_at')
    .eq('user_id', userId)
    .in('recall_bot_status', activeStatuses)
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json({ bots: data || [] });
});

// GET /api/bots/:meetingId/status — Poll bot status
router.get('/:meetingId/status', async (req, res) => {
  const userId = req.user.id;

  const { data: meeting } = await supabase
    .from('meetings')
    .select('recall_bot_id, recall_bot_status')
    .eq('id', req.params.meetingId)
    .eq('user_id', userId)
    .single();

  if (!meeting) return res.status(404).json({ error: 'Meeting not found' });

  // Optionally fetch fresh status
  let liveStatus = meeting.recall_bot_status;
  if (meeting.recall_bot_id && !['done', 'processed', 'error', 'fatal'].includes(meeting.recall_bot_status)) {
    try {
      const bot = await getBot(meeting.recall_bot_id);
      liveStatus = bot.status?.code || meeting.recall_bot_status;

      // Update if changed
      if (liveStatus !== meeting.recall_bot_status) {
        await supabase
          .from('meetings')
          .update({ recall_bot_status: liveStatus })
          .eq('id', req.params.meetingId);
      }
    } catch (e) {
      // Fall back to stored status
    }
  }

  res.json({ status: liveStatus });
});

export default router;
