import { supabase } from '../storage.js';

const FATHOM_API = 'https://api.fathom.video/v1';

export async function validate(apiKey) {
  const res = await fetch(`${FATHOM_API}/calls?limit=1`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });

  if (!res.ok) throw new Error('Invalid Fathom API key');
  return { ok: true };
}

export async function sync(integration) {
  const res = await fetch(`${FATHOM_API}/calls?limit=20`, {
    headers: { Authorization: `Bearer ${integration.api_key}` },
  });

  if (!res.ok) throw new Error('Failed to fetch Fathom calls');
  const { calls } = await res.json();
  if (!calls?.length) return { synced: 0, total: 0 };

  let synced = 0;

  for (const call of calls) {
    // Fetch transcript for each call
    let transcript = '';
    try {
      const tRes = await fetch(`${FATHOM_API}/calls/${call.id}/transcript`, {
        headers: { Authorization: `Bearer ${integration.api_key}` },
      });
      if (tRes.ok) {
        const tData = await tRes.json();
        transcript = tData.segments?.map(s => `${s.speaker || 'Speaker'}: ${s.text}`).join('\n') || tData.text || '';
      }
    } catch {
      // Transcript may not be available for all calls
    }

    const { error } = await supabase.from('integration_data').upsert({
      user_id: integration.user_id,
      integration_id: integration.id,
      provider: 'fathom',
      data_type: 'transcript',
      external_id: call.id,
      title: call.title || call.subject || 'Untitled Call',
      content: transcript || call.summary || '',
      metadata: {
        date: call.created_at || call.date,
        duration: call.duration,
        summary: call.summary || '',
        participants: call.participants || [],
      },
      synced_at: new Date().toISOString(),
    }, { onConflict: 'integration_id,external_id', ignoreDuplicates: false });

    if (!error) synced++;
  }

  await supabase.from('integrations')
    .update({ last_synced_at: new Date().toISOString() })
    .eq('id', integration.id);

  return { synced, total: calls.length };
}
