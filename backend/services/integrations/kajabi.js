import { supabase } from '../storage.js';

const KAJABI_API = 'https://kajabi.com/api/v1';

async function kajabiRequest(path, apiKey, params = {}) {
  const url = new URL(`${KAJABI_API}${path}`);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }
  const res = await fetch(url.toString(), {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Accept': 'application/json',
    },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Kajabi API error (${res.status}): ${body}`);
  }
  return res.json();
}

export async function validate(apiKey) {
  // Verify credentials by fetching site info
  const data = await kajabiRequest('/site', apiKey);
  return { name: data.name || data.title || 'Kajabi Site', id: data.id };
}

export async function sync(integration) {
  const apiKey = integration.api_key;
  let synced = 0;

  // ── Fetch offers (products/courses) ──
  try {
    const offersData = await kajabiRequest('/offers', apiKey, { per_page: 100 });
    const offers = offersData.offers || offersData.data || offersData || [];
    const offerList = Array.isArray(offers) ? offers : [];

    for (const offer of offerList) {
      const priceCents = Math.round(parseFloat(offer.price || offer.amount || 0) * 100);
      const { error } = await supabase.from('integration_data').upsert({
        user_id: integration.user_id,
        integration_id: integration.id,
        provider: 'kajabi',
        data_type: 'product',
        external_id: String(offer.id),
        title: offer.title || offer.name || 'Untitled Offer',
        content: offer.description || '',
        metadata: {
          id: offer.id,
          price: priceCents,
          offer_type: offer.offer_type || offer.payment_type || 'one_time',
          status: offer.status || 'active',
          checkout_url: offer.checkout_url || null,
          created_at: offer.created_at,
        },
        synced_at: new Date().toISOString(),
      }, { onConflict: 'integration_id,external_id', ignoreDuplicates: false });
      if (!error) synced++;
    }
  } catch (err) {
    console.log(`[kajabi] Offers sync error: ${err.message}`);
  }

  // ── Fetch transactions/sales ──
  try {
    const txData = await kajabiRequest('/transactions', apiKey, { per_page: 100 });
    const transactions = txData.transactions || txData.data || txData || [];
    const txList = Array.isArray(transactions) ? transactions : [];

    for (const tx of txList) {
      const amountCents = Math.round(parseFloat(tx.amount || tx.total || 0) * 100);
      const { error } = await supabase.from('integration_data').upsert({
        user_id: integration.user_id,
        integration_id: integration.id,
        provider: 'kajabi',
        data_type: 'payment',
        external_id: String(tx.id),
        title: `Sale: $${(amountCents / 100).toFixed(2)} — ${tx.offer_title || tx.product_name || 'Unknown'}`,
        content: '',
        metadata: {
          amount: amountCents,
          currency: tx.currency?.toLowerCase() || 'usd',
          status: tx.status === 'completed' || tx.status === 'paid' ? 'succeeded' : tx.status,
          customer: tx.member_email || tx.email || null,
          receipt_email: tx.member_email || tx.email || null,
          created: tx.created_at ? Math.floor(new Date(tx.created_at).getTime() / 1000) : null,
          offer_title: tx.offer_title || tx.product_name || null,
        },
        synced_at: new Date().toISOString(),
      }, { onConflict: 'integration_id,external_id', ignoreDuplicates: false });
      if (!error) synced++;
    }
  } catch (err) {
    console.log(`[kajabi] Transactions sync error: ${err.message}`);
  }

  // ── Fetch subscriptions ──
  try {
    const subData = await kajabiRequest('/subscriptions', apiKey, { per_page: 100 });
    const subscriptions = subData.subscriptions || subData.data || subData || [];
    const subList = Array.isArray(subscriptions) ? subscriptions : [];

    for (const sub of subList) {
      const amount = Math.round(parseFloat(sub.amount || sub.price || 0) * 100);
      const { error } = await supabase.from('integration_data').upsert({
        user_id: integration.user_id,
        integration_id: integration.id,
        provider: 'kajabi',
        data_type: 'subscription',
        external_id: String(sub.id),
        title: `Subscription: ${sub.offer_title || sub.name || 'Unknown'} — ${sub.status}`,
        content: '',
        metadata: {
          status: sub.status,
          customer: sub.member_email || sub.email || null,
          plan: sub.offer_title || sub.name || 'Unknown',
          amount,
          currency: sub.currency?.toLowerCase() || 'usd',
          interval: sub.interval || 'month',
          created: sub.created_at ? Math.floor(new Date(sub.created_at).getTime() / 1000) : null,
        },
        synced_at: new Date().toISOString(),
      }, { onConflict: 'integration_id,external_id', ignoreDuplicates: false });
      if (!error) synced++;
    }
  } catch (err) {
    console.log(`[kajabi] Subscriptions sync error: ${err.message}`);
  }

  // ── Fetch members (customers) ──
  try {
    const memberData = await kajabiRequest('/members', apiKey, { per_page: 100 });
    const members = memberData.members || memberData.data || memberData || [];
    const memberList = Array.isArray(members) ? members : [];

    for (const member of memberList) {
      const { error } = await supabase.from('integration_data').upsert({
        user_id: integration.user_id,
        integration_id: integration.id,
        provider: 'kajabi',
        data_type: 'customer',
        external_id: String(member.id),
        title: member.name || member.email || 'Unknown Member',
        content: '',
        metadata: {
          email: member.email,
          name: member.name,
          created: member.created_at ? Math.floor(new Date(member.created_at).getTime() / 1000) : null,
        },
        synced_at: new Date().toISOString(),
      }, { onConflict: 'integration_id,external_id', ignoreDuplicates: false });
      if (!error) synced++;
    }
  } catch (err) {
    console.log(`[kajabi] Members sync error: ${err.message}`);
  }

  await supabase.from('integrations')
    .update({ last_synced_at: new Date().toISOString() })
    .eq('id', integration.id);

  return { synced, total: synced };
}

export async function handleWebhook(payload, integration) {
  if (!payload) return;

  const event = payload.event || payload.type;

  if (event === 'purchase.completed' || event === 'sale.created') {
    const data = payload.data || payload;
    const amountCents = Math.round(parseFloat(data.amount || data.total || 0) * 100);
    await supabase.from('integration_data').upsert({
      user_id: integration.user_id,
      integration_id: integration.id,
      provider: 'kajabi',
      data_type: 'payment',
      external_id: String(data.id || data.transaction_id),
      title: `Sale: $${(amountCents / 100).toFixed(2)} — ${data.offer_title || data.product_name || 'Unknown'}`,
      content: '',
      metadata: {
        amount: amountCents,
        currency: data.currency?.toLowerCase() || 'usd',
        status: 'succeeded',
        customer: data.member_email || data.email || null,
        receipt_email: data.member_email || data.email || null,
        created: Math.floor(Date.now() / 1000),
        offer_title: data.offer_title || data.product_name || null,
        event,
      },
      synced_at: new Date().toISOString(),
    }, { onConflict: 'integration_id,external_id', ignoreDuplicates: false });
  }

  if (event === 'subscription.activated' || event === 'subscription.renewed') {
    const data = payload.data || payload;
    const amount = Math.round(parseFloat(data.amount || data.price || 0) * 100);
    await supabase.from('integration_data').upsert({
      user_id: integration.user_id,
      integration_id: integration.id,
      provider: 'kajabi',
      data_type: 'subscription',
      external_id: String(data.id || data.subscription_id),
      title: `Subscription: ${data.offer_title || data.name || 'Unknown'} — active`,
      content: '',
      metadata: {
        status: 'active',
        customer: data.member_email || data.email || null,
        plan: data.offer_title || data.name || 'Unknown',
        amount,
        currency: data.currency?.toLowerCase() || 'usd',
        event,
      },
      synced_at: new Date().toISOString(),
    }, { onConflict: 'integration_id,external_id', ignoreDuplicates: false });
  }
}
