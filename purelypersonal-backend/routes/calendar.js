import { Router } from 'express';
import { supabase } from '../middleware/auth.js';

const router = Router();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

// POST /api/calendar/connect/google — Google OAuth initiation
router.post('/connect/google', async (req, res) => {
  if (!GOOGLE_CLIENT_ID) {
    return res.status(501).json({ error: 'Google Calendar not configured' });
  }

  const redirectUri = `${process.env.API_BASE_URL}/api/calendar/callback/google`;
  const scope = 'https://www.googleapis.com/auth/calendar.readonly';

  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  authUrl.searchParams.set('client_id', GOOGLE_CLIENT_ID);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', scope);
  authUrl.searchParams.set('access_type', 'offline');
  authUrl.searchParams.set('prompt', 'consent');
  authUrl.searchParams.set('state', req.user.id);

  res.json({ auth_url: authUrl.toString() });
});

// GET /api/calendar/callback/google — OAuth callback
router.get('/callback/google', async (req, res) => {
  const { code, state: userId } = req.query;

  if (!code || !userId) {
    return res.status(400).json({ error: 'Missing code or state' });
  }

  try {
    const redirectUri = `${process.env.API_BASE_URL}/api/calendar/callback/google`;

    // Exchange code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const tokens = await tokenRes.json();
    if (tokens.error) throw new Error(tokens.error_description || tokens.error);

    // Get user email from Google
    const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const userInfo = await userInfoRes.json();

    // Save connection
    await supabase
      .from('calendar_connections')
      .upsert({
        user_id: userId,
        provider: 'google',
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        token_expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
        calendar_email: userInfo.email,
        is_active: true,
        auto_join: true,
      }, { onConflict: 'user_id,provider' });

    // Redirect to frontend settings
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/settings?calendar=connected`);
  } catch (err) {
    console.error('[calendar] Google OAuth error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/calendar/connections — List connections
router.get('/connections', async (req, res) => {
  const { data, error } = await supabase
    .from('calendar_connections')
    .select('id, provider, calendar_email, is_active, auto_join, created_at')
    .eq('user_id', req.user.id);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ connections: data || [] });
});

// PATCH /api/calendar/:id — Toggle auto-join
router.patch('/:id', async (req, res) => {
  const { auto_join, is_active } = req.body;
  const updates = { updated_at: new Date().toISOString() };
  if (auto_join !== undefined) updates.auto_join = auto_join;
  if (is_active !== undefined) updates.is_active = is_active;

  const { data, error } = await supabase
    .from('calendar_connections')
    .update(updates)
    .eq('id', req.params.id)
    .eq('user_id', req.user.id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json({ connection: data });
});

// DELETE /api/calendar/:id — Disconnect
router.delete('/:id', async (req, res) => {
  const { error } = await supabase
    .from('calendar_connections')
    .delete()
    .eq('id', req.params.id)
    .eq('user_id', req.user.id);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

export default router;
