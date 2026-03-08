import { Router } from 'express';
import crypto from 'crypto';
import Stripe from 'stripe';
import { supabase } from '../services/storage.js';
import * as fireflies from '../services/integrations/fireflies.js';
import * as stripeInt from '../services/integrations/stripe-int.js';
import * as whop from '../services/integrations/whop.js';

const router = Router();

// ─── Fireflies webhook ───
router.post('/api/webhooks/fireflies/:userId', async (req, res) => {
  const { userId } = req.params;

  const { data: integration } = await supabase
    .from('integrations')
    .select('*')
    .eq('user_id', userId)
    .eq('provider', 'fireflies')
    .eq('is_active', true)
    .single();

  if (!integration) return res.status(404).json({ error: 'Integration not found' });

  // Verify HMAC signature
  const signature = req.headers['x-fireflies-signature'] || req.headers['x-webhook-signature'];
  if (integration.webhook_secret && signature) {
    const expected = crypto
      .createHmac('sha256', integration.webhook_secret)
      .update(JSON.stringify(req.body))
      .digest('hex');
    if (signature !== expected) {
      return res.status(401).json({ error: 'Invalid signature' });
    }
  }

  try {
    await fireflies.handleWebhook(req.body, { ...integration, user_id: userId });
    res.json({ ok: true });
  } catch (err) {
    console.log(`[webhook/fireflies] Error: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
});

// ─── Stripe webhook ───
router.post('/api/webhooks/stripe/:userId', async (req, res) => {
  const { userId } = req.params;

  const { data: integration } = await supabase
    .from('integrations')
    .select('*')
    .eq('user_id', userId)
    .eq('provider', 'stripe')
    .eq('is_active', true)
    .single();

  if (!integration) return res.status(404).json({ error: 'Integration not found' });

  // Verify Stripe signature
  const sig = req.headers['stripe-signature'];
  const webhookSecret = integration.webhook_secret;

  let event;
  if (webhookSecret && sig) {
    try {
      const stripe = new Stripe(integration.api_key);
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
      return res.status(400).json({ error: `Webhook signature verification failed: ${err.message}` });
    }
  } else {
    // If no webhook secret configured, parse body directly
    event = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  }

  try {
    await stripeInt.handleWebhook(event, { ...integration, user_id: userId });
    res.json({ received: true });
  } catch (err) {
    console.log(`[webhook/stripe] Error: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
});

// ─── Whop webhook ───
router.post('/api/webhooks/whop/:userId', async (req, res) => {
  const { userId } = req.params;

  const { data: integration } = await supabase
    .from('integrations')
    .select('*')
    .eq('user_id', userId)
    .eq('provider', 'whop')
    .eq('is_active', true)
    .single();

  if (!integration) return res.status(404).json({ error: 'Integration not found' });

  // Verify HMAC signature
  const signature = req.headers['x-whop-signature'] || req.headers['whop-signature'];
  if (integration.webhook_secret && signature) {
    const expected = crypto
      .createHmac('sha256', integration.webhook_secret)
      .update(JSON.stringify(req.body))
      .digest('hex');
    if (signature !== expected) {
      return res.status(401).json({ error: 'Invalid signature' });
    }
  }

  try {
    await whop.handleWebhook(req.body, { ...integration, user_id: userId });
    res.json({ ok: true });
  } catch (err) {
    console.log(`[webhook/whop] Error: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
});

export default router;
