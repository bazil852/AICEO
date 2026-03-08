import { Router } from 'express';
import crypto from 'crypto';
import { supabase } from '../services/storage.js';
import * as fireflies from '../services/integrations/fireflies.js';
import * as fathom from '../services/integrations/fathom.js';
import * as stripeInt from '../services/integrations/stripe-int.js';
import * as whop from '../services/integrations/whop.js';
import * as gohighlevel from '../services/integrations/gohighlevel.js';

const router = Router();

const services = { fireflies, fathom, stripe: stripeInt, whop, gohighlevel };
const VALID_PROVIDERS = Object.keys(services);

// ─── List all user integrations (no keys in response) ───
router.get('/api/integrations', async (req, res) => {
  const userId = req.user.id;
  if (userId === 'anonymous') return res.json({ integrations: [] });

  const { data, error } = await supabase
    .from('integrations')
    .select('id, provider, is_active, metadata, last_synced_at, webhook_url, webhook_secret, created_at, updated_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) return res.status(500).json({ error: error.message });
  res.json({ integrations: data });
});

// ─── Connect an integration ───
router.post('/api/integrations/:provider/connect', async (req, res) => {
  const userId = req.user.id;
  if (userId === 'anonymous') return res.status(401).json({ error: 'Auth required' });

  const { provider } = req.params;
  if (!VALID_PROVIDERS.includes(provider)) {
    return res.status(400).json({ error: `Invalid provider: ${provider}` });
  }

  const { api_key } = req.body;
  if (!api_key) return res.status(400).json({ error: 'api_key is required' });

  const service = services[provider];

  // Validate the API key against the external service
  try {
    console.log(`[integrations] Validating ${provider} API key for user ${userId}...`);
    const validationResult = await service.validate(api_key);

    // Build integration record
    const record = {
      user_id: userId,
      provider,
      api_key,
      is_active: true,
      metadata: validationResult || {},
      updated_at: new Date().toISOString(),
    };

    // For Fireflies, generate webhook URL and secret
    if (provider === 'fireflies') {
      const baseUrl = process.env.API_BASE_URL || (process.env.RAILWAY_PUBLIC_DOMAIN ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}` : 'http://localhost:3001');
      record.webhook_url = `${baseUrl}/api/webhooks/fireflies/${userId}`;
      record.webhook_secret = crypto.randomBytes(16).toString('hex');
    }

    // Upsert to DB
    const { data, error } = await supabase
      .from('integrations')
      .upsert(record, { onConflict: 'user_id,provider' })
      .select('id, provider, is_active, metadata, last_synced_at, webhook_url, webhook_secret, created_at, updated_at')
      .single();

    if (error) return res.status(500).json({ error: error.message });

    console.log(`[integrations] ${provider} connected for user ${userId}`);

    // Trigger initial sync in background
    const integration = { ...data, api_key, user_id: userId };
    if (service.sync) {
      service.sync(integration).then(result => {
        console.log(`[integrations] ${provider} initial sync: ${result.synced}/${result.total}`);
      }).catch(err => {
        console.log(`[integrations] ${provider} initial sync failed: ${err.message}`);
      });
    }

    res.json({ integration: data });
  } catch (err) {
    console.log(`[integrations] ${provider} validation failed: ${err.message}`);
    res.status(400).json({ error: `Validation failed: ${err.message}` });
  }
});

// ─── Disconnect an integration ───
router.delete('/api/integrations/:provider', async (req, res) => {
  const userId = req.user.id;
  if (userId === 'anonymous') return res.status(401).json({ error: 'Auth required' });

  const { provider } = req.params;
  if (!VALID_PROVIDERS.includes(provider)) {
    return res.status(400).json({ error: `Invalid provider: ${provider}` });
  }

  // Delete integration (integration_data cascade-deletes)
  const { error } = await supabase
    .from('integrations')
    .delete()
    .eq('user_id', userId)
    .eq('provider', provider);

  if (error) return res.status(500).json({ error: error.message });

  console.log(`[integrations] ${provider} disconnected for user ${userId}`);
  res.json({ ok: true });
});

// ─── Manual re-sync ───
router.post('/api/integrations/:provider/sync', async (req, res) => {
  const userId = req.user.id;
  if (userId === 'anonymous') return res.status(401).json({ error: 'Auth required' });

  const { provider } = req.params;
  if (!VALID_PROVIDERS.includes(provider)) {
    return res.status(400).json({ error: `Invalid provider: ${provider}` });
  }

  const { data: integration, error: fetchErr } = await supabase
    .from('integrations')
    .select('*')
    .eq('user_id', userId)
    .eq('provider', provider)
    .single();

  if (fetchErr || !integration) return res.status(404).json({ error: 'Integration not found' });

  const service = services[provider];
  if (!service.sync) return res.status(400).json({ error: 'Sync not supported for this provider' });

  try {
    const result = await service.sync({ ...integration, user_id: userId });
    res.json(result);
  } catch (err) {
    console.log(`[integrations] ${provider} sync failed: ${err.message}`);
    res.status(500).json({ error: `Sync failed: ${err.message}` });
  }
});

// ─── Integration context for AI CEO ───
router.get('/api/integration-context', async (req, res) => {
  const userId = req.user.id;
  if (userId === 'anonymous') return res.json({ context: '' });

  const { data, error } = await supabase
    .from('integration_data')
    .select('provider, data_type, title, content, metadata, synced_at')
    .eq('user_id', userId)
    .order('synced_at', { ascending: false })
    .limit(50);

  if (error || !data?.length) return res.json({ context: '' });

  // Group by provider
  const grouped = {};
  for (const row of data) {
    if (!grouped[row.provider]) grouped[row.provider] = [];
    grouped[row.provider].push(row);
  }

  const sections = [];

  if (grouped.fireflies?.length || grouped.fathom?.length) {
    const transcripts = [...(grouped.fireflies || []), ...(grouped.fathom || [])];
    sections.push('## Call Transcripts & Meeting Notes');
    for (const t of transcripts.slice(0, 10)) {
      sections.push(`### ${t.title}`);
      if (t.metadata?.summary) sections.push(`Summary: ${t.metadata.summary}`);
      if (t.content) sections.push(t.content.slice(0, 500));
      sections.push('');
    }
  }

  if (grouped.stripe?.length) {
    sections.push('## Stripe Data');
    const payments = grouped.stripe.filter(d => d.data_type === 'payment');
    const subs = grouped.stripe.filter(d => d.data_type === 'subscription');
    const customers = grouped.stripe.filter(d => d.data_type === 'customer');

    if (payments.length) {
      sections.push(`### Recent Payments (${payments.length})`);
      for (const p of payments.slice(0, 10)) {
        sections.push(`- ${p.title}`);
      }
    }
    if (subs.length) {
      sections.push(`### Active Subscriptions (${subs.length})`);
      for (const s of subs) {
        sections.push(`- ${s.title}`);
      }
    }
    if (customers.length) {
      sections.push(`### Customers (${customers.length})`);
      for (const c of customers.slice(0, 10)) {
        sections.push(`- ${c.title}${c.metadata?.email ? ` (${c.metadata.email})` : ''}`);
      }
    }
    sections.push('');
  }

  if (grouped.whop?.length) {
    sections.push('## Whop Data');
    for (const item of grouped.whop) {
      sections.push(`- [${item.data_type}] ${item.title}`);
    }
    sections.push('');
  }

  if (grouped.gohighlevel?.length) {
    sections.push('## GoHighLevel CRM');
    const contacts = grouped.gohighlevel.filter(d => d.data_type === 'contact');
    const opps = grouped.gohighlevel.filter(d => d.data_type === 'opportunity');
    const pipelines = grouped.gohighlevel.filter(d => d.data_type === 'pipeline');

    if (pipelines.length) {
      sections.push(`### Pipelines (${pipelines.length})`);
      for (const p of pipelines) {
        sections.push(`- ${p.title}`);
      }
    }
    if (opps.length) {
      sections.push(`### Opportunities (${opps.length})`);
      for (const o of opps.slice(0, 10)) {
        sections.push(`- ${o.title}${o.metadata?.monetary_value ? ` ($${o.metadata.monetary_value})` : ''}`);
      }
    }
    if (contacts.length) {
      sections.push(`### Contacts (${contacts.length})`);
      for (const c of contacts.slice(0, 10)) {
        sections.push(`- ${c.title}${c.metadata?.email ? ` (${c.metadata.email})` : ''}`);
      }
    }
    sections.push('');
  }

  res.json({ context: sections.join('\n') });
});

export default router;
