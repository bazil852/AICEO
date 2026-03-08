import { supabase } from '../storage.js';

const GHL_API = 'https://services.leadconnectorhq.com';

export async function validate(apiKey) {
  const res = await fetch(`${GHL_API}/contacts/?limit=1`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Version: '2021-07-28',
    },
  });

  if (!res.ok) throw new Error('Invalid GoHighLevel API key');
  return { ok: true };
}

export async function sync(integration) {
  const headers = {
    Authorization: `Bearer ${integration.api_key}`,
    Version: '2021-07-28',
  };
  let synced = 0;

  // Fetch contacts
  const contactsRes = await fetch(`${GHL_API}/contacts/?limit=100`, { headers });
  if (contactsRes.ok) {
    const { contacts } = await contactsRes.json();
    for (const contact of (contacts || [])) {
      const name = [contact.firstName, contact.lastName].filter(Boolean).join(' ') || contact.email || 'Unknown';

      const { error } = await supabase.from('integration_data').upsert({
        user_id: integration.user_id,
        integration_id: integration.id,
        provider: 'gohighlevel',
        data_type: 'contact',
        external_id: contact.id,
        title: name,
        content: '',
        metadata: {
          email: contact.email,
          phone: contact.phone,
          first_name: contact.firstName,
          last_name: contact.lastName,
          company: contact.companyName,
          tags: contact.tags,
          source: contact.source,
          date_added: contact.dateAdded,
        },
        synced_at: new Date().toISOString(),
      }, { onConflict: 'integration_id,external_id', ignoreDuplicates: false });
      if (!error) synced++;
    }
  }

  // Fetch pipelines
  const pipelinesRes = await fetch(`${GHL_API}/opportunities/pipelines`, { headers });
  if (pipelinesRes.ok) {
    const { pipelines } = await pipelinesRes.json();
    for (const pipeline of (pipelines || [])) {
      const { error } = await supabase.from('integration_data').upsert({
        user_id: integration.user_id,
        integration_id: integration.id,
        provider: 'gohighlevel',
        data_type: 'pipeline',
        external_id: pipeline.id,
        title: pipeline.name || 'Untitled Pipeline',
        content: '',
        metadata: {
          stages: pipeline.stages?.map(s => ({ id: s.id, name: s.name })) || [],
        },
        synced_at: new Date().toISOString(),
      }, { onConflict: 'integration_id,external_id', ignoreDuplicates: false });
      if (!error) synced++;

      // Fetch opportunities for each pipeline
      const oppsRes = await fetch(`${GHL_API}/opportunities/search?pipeline_id=${pipeline.id}&limit=50`, { headers });
      if (oppsRes.ok) {
        const { opportunities } = await oppsRes.json();
        for (const opp of (opportunities || [])) {
          const { error: oppErr } = await supabase.from('integration_data').upsert({
            user_id: integration.user_id,
            integration_id: integration.id,
            provider: 'gohighlevel',
            data_type: 'opportunity',
            external_id: opp.id,
            title: opp.name || opp.contact?.name || 'Untitled Opportunity',
            content: '',
            metadata: {
              status: opp.status,
              pipeline_id: pipeline.id,
              pipeline_name: pipeline.name,
              stage_name: opp.pipelineStageId,
              monetary_value: opp.monetaryValue,
              contact_name: opp.contact?.name,
              contact_email: opp.contact?.email,
              created_at: opp.createdAt,
            },
            synced_at: new Date().toISOString(),
          }, { onConflict: 'integration_id,external_id', ignoreDuplicates: false });
          if (!oppErr) synced++;
        }
      }
    }
  }

  await supabase.from('integrations')
    .update({ last_synced_at: new Date().toISOString() })
    .eq('id', integration.id);

  return { synced, total: synced };
}
