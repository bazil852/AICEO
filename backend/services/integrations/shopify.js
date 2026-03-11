import { supabase } from '../storage.js';

export async function validate(apiKey, metadata) {
  const storeUrl = metadata?.store_url;
  if (!storeUrl) throw new Error('store_url is required (e.g. mystore.myshopify.com)');

  const base = storeUrl.includes('://') ? storeUrl : `https://${storeUrl}`;
  const res = await fetch(`${base}/admin/api/2024-01/shop.json`, {
    headers: { 'X-Shopify-Access-Token': apiKey },
  });

  if (!res.ok) throw new Error('Invalid Shopify credentials');
  const { shop } = await res.json();
  return { name: shop.name, domain: shop.domain, store_url: base };
}

export async function sync(integration) {
  const apiKey = integration.api_key;
  const base = integration.metadata?.store_url;
  if (!base) throw new Error('Missing store_url in integration metadata');

  const headers = { 'X-Shopify-Access-Token': apiKey };
  let synced = 0;

  // ── Fetch orders (sales analytics) ──
  let orderUrl = `${base}/admin/api/2024-01/orders.json?status=any&limit=250`;
  let pageCount = 0;

  while (orderUrl && pageCount < 5) {
    const res = await fetch(orderUrl, { headers });
    if (!res.ok) break;
    const { orders } = await res.json();

    for (const order of (orders || [])) {
      const amountCents = Math.round(parseFloat(order.total_price || 0) * 100);
      const { error } = await supabase.from('integration_data').upsert({
        user_id: integration.user_id,
        integration_id: integration.id,
        provider: 'shopify',
        data_type: 'payment',
        external_id: String(order.id),
        title: `Order #${order.order_number}: $${order.total_price} ${order.currency}`,
        content: '',
        metadata: {
          amount: amountCents,
          currency: order.currency?.toLowerCase() || 'usd',
          status: order.financial_status === 'paid' ? 'succeeded' : order.financial_status,
          customer: order.customer?.email || null,
          receipt_email: order.email,
          created: Math.floor(new Date(order.created_at).getTime() / 1000),
          order_number: order.order_number,
          fulfillment_status: order.fulfillment_status,
        },
        synced_at: new Date().toISOString(),
      }, { onConflict: 'integration_id,external_id', ignoreDuplicates: false });
      if (!error) synced++;
    }

    // Pagination via Link header
    const linkHeader = res.headers.get('link');
    orderUrl = null;
    if (linkHeader) {
      const nextMatch = linkHeader.match(/<([^>]+)>;\s*rel="next"/);
      if (nextMatch) orderUrl = nextMatch[1];
    }
    pageCount++;
  }

  // ── Fetch products ──
  const productsRes = await fetch(`${base}/admin/api/2024-01/products.json?limit=250`, { headers });
  if (productsRes.ok) {
    const { products } = await productsRes.json();
    for (const product of (products || [])) {
      const variant = product.variants?.[0];
      const { error } = await supabase.from('integration_data').upsert({
        user_id: integration.user_id,
        integration_id: integration.id,
        provider: 'shopify',
        data_type: 'product',
        external_id: String(product.id),
        title: product.title,
        content: product.body_html || '',
        metadata: {
          id: product.id,
          status: product.status,
          product_type: product.product_type,
          vendor: product.vendor,
          price: variant?.price || null,
          variant_id: variant?.id || null,
          image_url: product.image?.src || null,
          created_at: product.created_at,
        },
        synced_at: new Date().toISOString(),
      }, { onConflict: 'integration_id,external_id', ignoreDuplicates: false });
      if (!error) synced++;
    }
  }

  // ── Fetch customers ──
  const customersRes = await fetch(`${base}/admin/api/2024-01/customers.json?limit=250`, { headers });
  if (customersRes.ok) {
    const { customers } = await customersRes.json();
    for (const cust of (customers || [])) {
      const { error } = await supabase.from('integration_data').upsert({
        user_id: integration.user_id,
        integration_id: integration.id,
        provider: 'shopify',
        data_type: 'customer',
        external_id: String(cust.id),
        title: `${cust.first_name || ''} ${cust.last_name || ''}`.trim() || cust.email,
        content: '',
        metadata: {
          email: cust.email,
          name: `${cust.first_name || ''} ${cust.last_name || ''}`.trim(),
          phone: cust.phone,
          orders_count: cust.orders_count,
          total_spent: cust.total_spent,
          created: Math.floor(new Date(cust.created_at).getTime() / 1000),
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
  if (!payload) return;

  const topic = payload.topic || payload.webhook_topic;

  if (topic === 'orders/paid' || topic === 'orders/create') {
    const order = payload;
    const amountCents = Math.round(parseFloat(order.total_price || 0) * 100);
    await supabase.from('integration_data').upsert({
      user_id: integration.user_id,
      integration_id: integration.id,
      provider: 'shopify',
      data_type: 'payment',
      external_id: String(order.id),
      title: `Order #${order.order_number}: $${order.total_price} ${order.currency}`,
      content: '',
      metadata: {
        amount: amountCents,
        currency: order.currency?.toLowerCase() || 'usd',
        status: order.financial_status === 'paid' ? 'succeeded' : order.financial_status,
        customer: order.customer?.email || null,
        receipt_email: order.email,
        created: Math.floor(new Date(order.created_at).getTime() / 1000),
        order_number: order.order_number,
      },
      synced_at: new Date().toISOString(),
    }, { onConflict: 'integration_id,external_id', ignoreDuplicates: false });
  }

  if (topic === 'products/create' || topic === 'products/update') {
    const product = payload;
    const variant = product.variants?.[0];
    await supabase.from('integration_data').upsert({
      user_id: integration.user_id,
      integration_id: integration.id,
      provider: 'shopify',
      data_type: 'product',
      external_id: String(product.id),
      title: product.title,
      content: product.body_html || '',
      metadata: {
        id: product.id,
        status: product.status,
        product_type: product.product_type,
        price: variant?.price || null,
        variant_id: variant?.id || null,
        image_url: product.image?.src || null,
      },
      synced_at: new Date().toISOString(),
    }, { onConflict: 'integration_id,external_id', ignoreDuplicates: false });
  }
}
