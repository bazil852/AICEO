import { Router } from 'express';
import Stripe from 'stripe';
import { supabase } from '../services/storage.js';

const router = Router();

async function getStripeKey(userId) {
  const { data } = await supabase
    .from('integrations')
    .select('api_key')
    .eq('user_id', userId)
    .eq('provider', 'stripe')
    .eq('is_active', true)
    .single();
  if (!data?.api_key) throw new Error('Stripe not connected. Go to Settings to connect your Stripe account.');
  return data.api_key;
}

// ─── List products ───
router.get('/api/products', async (req, res) => {
  const userId = req.user.id;
  if (userId === 'anonymous') return res.json({ products: [] });

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json({ products: data });
});

// ─── Create product (Stripe + DB) ───
router.post('/api/products', async (req, res) => {
  const userId = req.user.id;
  if (userId === 'anonymous') return res.status(401).json({ error: 'Auth required' });

  const { name, description, type, price, priceMode } = req.body;
  if (!name || !type || !price) return res.status(400).json({ error: 'name, type, and price are required' });

  const priceCents = Math.round(parseFloat(price) * 100);
  if (isNaN(priceCents) || priceCents <= 0) return res.status(400).json({ error: 'Invalid price' });

  try {
    const apiKey = await getStripeKey(userId);
    const stripe = new Stripe(apiKey);

    // 1. Create Stripe product
    const stripeProduct = await stripe.products.create({
      name,
      description: description || undefined,
      metadata: { type, created_by: 'aiceo' },
    });

    // 2. Create Stripe price
    const isMonthly = priceMode === 'Monthly';
    const priceParams = {
      product: stripeProduct.id,
      unit_amount: priceCents,
      currency: 'usd',
    };
    if (isMonthly) {
      priceParams.recurring = { interval: 'month' };
    }
    const stripePrice = await stripe.prices.create(priceParams);

    // 3. Create payment link
    const paymentLink = await stripe.paymentLinks.create({
      line_items: [{ price: stripePrice.id, quantity: 1 }],
    });

    // 4. Save to DB
    const { data, error } = await supabase
      .from('products')
      .insert({
        user_id: userId,
        name,
        description: description || '',
        type,
        price_cents: priceCents,
        price_mode: isMonthly ? 'monthly' : 'one_time',
        photos: [],
        stripe_product_id: stripeProduct.id,
        stripe_price_id: stripePrice.id,
        stripe_payment_link_id: paymentLink.id,
        payment_link_url: paymentLink.url,
      })
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });

    console.log(`[products] Created "${name}" with payment link for user ${userId}`);
    res.json({ product: data });
  } catch (err) {
    console.log(`[products] Create error: ${err.message}`);
    res.status(400).json({ error: err.message });
  }
});

// ─── Update product ───
router.put('/api/products/:id', async (req, res) => {
  const userId = req.user.id;
  if (userId === 'anonymous') return res.status(401).json({ error: 'Auth required' });

  const { name, description, type } = req.body;

  // Fetch existing
  const { data: existing, error: fetchErr } = await supabase
    .from('products')
    .select('*')
    .eq('id', req.params.id)
    .eq('user_id', userId)
    .single();

  if (fetchErr || !existing) return res.status(404).json({ error: 'Product not found' });

  try {
    // Update Stripe product name/description if changed
    if (existing.stripe_product_id && (name || description !== undefined)) {
      const apiKey = await getStripeKey(userId);
      const stripe = new Stripe(apiKey);
      const updates = {};
      if (name) updates.name = name;
      if (description !== undefined) updates.description = description;
      await stripe.products.update(existing.stripe_product_id, updates);
    }

    // Update DB
    const dbUpdates = { updated_at: new Date().toISOString() };
    if (name) dbUpdates.name = name;
    if (description !== undefined) dbUpdates.description = description;
    if (type) dbUpdates.type = type;

    const { data, error } = await supabase
      .from('products')
      .update(dbUpdates)
      .eq('id', req.params.id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    res.json({ product: data });
  } catch (err) {
    console.log(`[products] Update error: ${err.message}`);
    res.status(400).json({ error: err.message });
  }
});

// ─── Delete product ───
router.delete('/api/products/:id', async (req, res) => {
  const userId = req.user.id;
  if (userId === 'anonymous') return res.status(401).json({ error: 'Auth required' });

  const { data: existing } = await supabase
    .from('products')
    .select('stripe_product_id, stripe_payment_link_id')
    .eq('id', req.params.id)
    .eq('user_id', userId)
    .single();

  try {
    if (existing?.stripe_product_id) {
      const apiKey = await getStripeKey(userId);
      const stripe = new Stripe(apiKey);
      // Deactivate payment link
      if (existing.stripe_payment_link_id) {
        await stripe.paymentLinks.update(existing.stripe_payment_link_id, { active: false }).catch(() => {});
      }
      // Archive product
      await stripe.products.update(existing.stripe_product_id, { active: false }).catch(() => {});
    }
  } catch (err) {
    console.log(`[products] Stripe cleanup error: ${err.message}`);
  }

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', req.params.id)
    .eq('user_id', userId);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

// ─── Regenerate payment link ───
router.post('/api/products/:id/payment-link', async (req, res) => {
  const userId = req.user.id;
  if (userId === 'anonymous') return res.status(401).json({ error: 'Auth required' });

  const { data: existing, error: fetchErr } = await supabase
    .from('products')
    .select('*')
    .eq('id', req.params.id)
    .eq('user_id', userId)
    .single();

  if (fetchErr || !existing) return res.status(404).json({ error: 'Product not found' });
  if (!existing.stripe_price_id) return res.status(400).json({ error: 'No Stripe price associated' });

  try {
    const apiKey = await getStripeKey(userId);
    const stripe = new Stripe(apiKey);

    // Deactivate old link
    if (existing.stripe_payment_link_id) {
      await stripe.paymentLinks.update(existing.stripe_payment_link_id, { active: false }).catch(() => {});
    }

    // Create new link
    const paymentLink = await stripe.paymentLinks.create({
      line_items: [{ price: existing.stripe_price_id, quantity: 1 }],
    });

    const { data, error } = await supabase
      .from('products')
      .update({
        stripe_payment_link_id: paymentLink.id,
        payment_link_url: paymentLink.url,
        updated_at: new Date().toISOString(),
      })
      .eq('id', req.params.id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    res.json({ product: data });
  } catch (err) {
    console.log(`[products] Payment link error: ${err.message}`);
    res.status(400).json({ error: err.message });
  }
});

export default router;
