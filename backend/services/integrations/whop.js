import { supabase } from '../storage.js';

const WHOP_API = 'https://api.whop.com/api/v5';

export async function validate(apiKey) {
  const res = await fetch(`${WHOP_API}/company`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });

  if (!res.ok) throw new Error('Invalid Whop API key');
  const company = await res.json();
  return { name: company.title || company.name, id: company.id };
}

export async function sync(integration) {
  const headers = { Authorization: `Bearer ${integration.api_key}` };
  let synced = 0;

  // Fetch company info
  const companyRes = await fetch(`${WHOP_API}/company`, { headers });
  if (companyRes.ok) {
    const company = await companyRes.json();
    const { error } = await supabase.from('integration_data').upsert({
      user_id: integration.user_id,
      integration_id: integration.id,
      provider: 'whop',
      data_type: 'company',
      external_id: company.id,
      title: company.title || company.name || 'My Company',
      content: company.description || '',
      metadata: {
        id: company.id,
        title: company.title,
        image_url: company.image_url,
        route: company.route,
      },
      synced_at: new Date().toISOString(),
    }, { onConflict: 'integration_id,external_id', ignoreDuplicates: false });
    if (!error) synced++;
  }

  // Fetch products
  const productsRes = await fetch(`${WHOP_API}/company/products?per=50`, { headers });
  if (productsRes.ok) {
    const { data: products } = await productsRes.json();
    for (const product of (products || [])) {
      const { error } = await supabase.from('integration_data').upsert({
        user_id: integration.user_id,
        integration_id: integration.id,
        provider: 'whop',
        data_type: 'product',
        external_id: product.id,
        title: product.name || product.title || 'Untitled Product',
        content: product.description || '',
        metadata: {
          id: product.id,
          visibility: product.visibility,
          created_at: product.created_at,
        },
        synced_at: new Date().toISOString(),
      }, { onConflict: 'integration_id,external_id', ignoreDuplicates: false });
      if (!error) synced++;
    }
  }

  // Fetch memberships
  const membershipsRes = await fetch(`${WHOP_API}/company/memberships?per=50`, { headers });
  if (membershipsRes.ok) {
    const { data: memberships } = await membershipsRes.json();
    for (const m of (memberships || [])) {
      const { error } = await supabase.from('integration_data').upsert({
        user_id: integration.user_id,
        integration_id: integration.id,
        provider: 'whop',
        data_type: 'membership',
        external_id: m.id,
        title: `Membership: ${m.product?.name || m.product_id || 'Unknown'} — ${m.status}`,
        content: '',
        metadata: {
          id: m.id,
          status: m.status,
          product_id: m.product_id,
          user_email: m.user?.email,
          created_at: m.created_at,
          renewal_period_start: m.renewal_period_start,
          renewal_period_end: m.renewal_period_end,
        },
        synced_at: new Date().toISOString(),
      }, { onConflict: 'integration_id,external_id', ignoreDuplicates: false });
      if (!error) synced++;
    }
  }

  await supabase.from('integrations')
    .update({ last_synced_at: new Date().toISOString() })
    .eq('id', integration.id);

  return { synced, total: synced };
}

export async function handleWebhook(payload, integration) {
  if (!payload?.data) return;

  const event = payload.event || payload.action;
  const data = payload.data;

  if (event?.includes('membership')) {
    await supabase.from('integration_data').upsert({
      user_id: integration.user_id,
      integration_id: integration.id,
      provider: 'whop',
      data_type: 'membership',
      external_id: data.id,
      title: `Membership: ${data.product?.name || data.product_id || 'Unknown'} — ${data.status}`,
      content: '',
      metadata: {
        id: data.id,
        status: data.status,
        product_id: data.product_id,
        user_email: data.user?.email,
        event,
      },
      synced_at: new Date().toISOString(),
    }, { onConflict: 'integration_id,external_id', ignoreDuplicates: false });
  }
}
