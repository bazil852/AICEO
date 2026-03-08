import Stripe from 'stripe';
import { supabase } from '../storage.js';

export async function validate(apiKey) {
  const stripe = new Stripe(apiKey);
  const balance = await stripe.balance.retrieve();
  return { currency: balance.available?.[0]?.currency || 'usd' };
}

export async function sync(integration) {
  const stripe = new Stripe(integration.api_key);
  let synced = 0;

  // Fetch ALL charges using auto-pagination (full history)
  const allCharges = [];
  for await (const charge of stripe.charges.list({ limit: 100 })) {
    allCharges.push(charge);
    if (allCharges.length >= 500) break; // safety cap
  }

  console.log(`[stripe] Fetched ${allCharges.length} charges`);

  for (const charge of allCharges) {
    const { error } = await supabase.from('integration_data').upsert({
      user_id: integration.user_id,
      integration_id: integration.id,
      provider: 'stripe',
      data_type: 'payment',
      external_id: charge.id,
      title: `Payment ${charge.status}: ${(charge.amount / 100).toFixed(2)} ${charge.currency.toUpperCase()}`,
      content: charge.description || '',
      metadata: {
        amount: charge.amount,
        currency: charge.currency,
        status: charge.status,
        customer: charge.customer,
        receipt_email: charge.receipt_email,
        created: charge.created,
      },
      synced_at: new Date().toISOString(),
    }, { onConflict: 'integration_id,external_id', ignoreDuplicates: false });
    if (!error) synced++;
  }

  // Fetch active subscriptions
  const subscriptions = await stripe.subscriptions.list({ limit: 100, status: 'active' });

  for (const sub of subscriptions.data) {
    const planName = sub.items.data[0]?.price?.nickname || sub.items.data[0]?.price?.id || 'Unknown Plan';
    const amount = sub.items.data[0]?.price?.unit_amount || 0;
    const currency = sub.items.data[0]?.price?.currency || 'usd';

    const { error } = await supabase.from('integration_data').upsert({
      user_id: integration.user_id,
      integration_id: integration.id,
      provider: 'stripe',
      data_type: 'subscription',
      external_id: sub.id,
      title: `Subscription: ${planName} — ${(amount / 100).toFixed(2)} ${currency.toUpperCase()}/${sub.items.data[0]?.price?.recurring?.interval || 'month'}`,
      content: '',
      metadata: {
        status: sub.status,
        customer: sub.customer,
        plan: planName,
        amount,
        currency,
        interval: sub.items.data[0]?.price?.recurring?.interval,
        current_period_start: sub.current_period_start,
        current_period_end: sub.current_period_end,
        created: sub.created,
      },
      synced_at: new Date().toISOString(),
    }, { onConflict: 'integration_id,external_id', ignoreDuplicates: false });
    if (!error) synced++;
  }

  // Fetch recent customers
  const customers = await stripe.customers.list({ limit: 50 });

  for (const cust of customers.data) {
    const { error } = await supabase.from('integration_data').upsert({
      user_id: integration.user_id,
      integration_id: integration.id,
      provider: 'stripe',
      data_type: 'customer',
      external_id: cust.id,
      title: cust.name || cust.email || cust.id,
      content: '',
      metadata: {
        email: cust.email,
        name: cust.name,
        phone: cust.phone,
        created: cust.created,
        balance: cust.balance,
        currency: cust.currency,
      },
      synced_at: new Date().toISOString(),
    }, { onConflict: 'integration_id,external_id', ignoreDuplicates: false });
    if (!error) synced++;
  }

  await supabase.from('integrations')
    .update({ last_synced_at: new Date().toISOString() })
    .eq('id', integration.id);

  return { synced, total: charges.data.length + subscriptions.data.length + customers.data.length };
}

export async function handleWebhook(event, integration) {
  const stripe = new Stripe(integration.api_key);

  if (event.type === 'charge.succeeded' || event.type === 'charge.failed') {
    const charge = event.data.object;
    await supabase.from('integration_data').upsert({
      user_id: integration.user_id,
      integration_id: integration.id,
      provider: 'stripe',
      data_type: 'payment',
      external_id: charge.id,
      title: `Payment ${charge.status}: ${(charge.amount / 100).toFixed(2)} ${charge.currency.toUpperCase()}`,
      content: charge.description || '',
      metadata: {
        amount: charge.amount,
        currency: charge.currency,
        status: charge.status,
        customer: charge.customer,
        receipt_email: charge.receipt_email,
        created: charge.created,
      },
      synced_at: new Date().toISOString(),
    }, { onConflict: 'integration_id,external_id', ignoreDuplicates: false });
  }

  if (event.type.startsWith('customer.subscription.')) {
    const sub = event.data.object;
    const planName = sub.items?.data?.[0]?.price?.nickname || 'Unknown Plan';
    const amount = sub.items?.data?.[0]?.price?.unit_amount || 0;
    const currency = sub.items?.data?.[0]?.price?.currency || 'usd';

    await supabase.from('integration_data').upsert({
      user_id: integration.user_id,
      integration_id: integration.id,
      provider: 'stripe',
      data_type: 'subscription',
      external_id: sub.id,
      title: `Subscription: ${planName} — ${(amount / 100).toFixed(2)} ${currency.toUpperCase()}`,
      content: '',
      metadata: {
        status: sub.status,
        customer: sub.customer,
        plan: planName,
        amount,
        currency,
        created: sub.created,
      },
      synced_at: new Date().toISOString(),
    }, { onConflict: 'integration_id,external_id', ignoreDuplicates: false });
  }
}
