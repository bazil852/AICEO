import { supabase } from '../storage.js';

const FIREFLIES_API = 'https://api.fireflies.ai/graphql';

export async function validate(apiKey) {
  const res = await fetch(FIREFLIES_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ query: '{ user { email name } }' }),
  });

  if (!res.ok) throw new Error('Invalid Fireflies API key');
  const { data, errors } = await res.json();
  if (errors?.length) throw new Error(errors[0].message);
  return { email: data.user.email, name: data.user.name };
}

export async function sync(integration) {
  const query = `{
    transcripts(limit: 20) {
      id
      title
      date
      duration
      sentences {
        text
        speaker_name
      }
      summary {
        overview
        action_items
      }
    }
  }`;

  const res = await fetch(FIREFLIES_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${integration.api_key}`,
    },
    body: JSON.stringify({ query }),
  });

  if (!res.ok) throw new Error('Failed to fetch Fireflies transcripts');
  const { data, errors } = await res.json();
  if (errors?.length) throw new Error(errors[0].message);

  const transcripts = data.transcripts || [];
  let synced = 0;

  for (const t of transcripts) {
    const transcript = t.sentences?.map(s => `${s.speaker_name}: ${s.text}`).join('\n') || '';
    const summary = [t.summary?.overview, t.summary?.action_items].filter(Boolean).join('\n\n');

    const { error } = await supabase.from('integration_data').upsert({
      user_id: integration.user_id,
      integration_id: integration.id,
      provider: 'fireflies',
      data_type: 'transcript',
      external_id: t.id,
      title: t.title || 'Untitled Meeting',
      content: transcript || summary || '',
      metadata: {
        date: t.date,
        duration: t.duration,
        summary: t.summary?.overview || '',
        action_items: t.summary?.action_items || '',
      },
      synced_at: new Date().toISOString(),
    }, { onConflict: 'integration_id,external_id', ignoreDuplicates: false });

    if (!error) synced++;
  }

  await supabase.from('integrations')
    .update({ last_synced_at: new Date().toISOString() })
    .eq('id', integration.id);

  return { synced, total: transcripts.length };
}

export async function handleWebhook(payload, integration) {
  if (!payload?.data?.transcriptId) return;

  const query = `{
    transcript(id: "${payload.data.transcriptId}") {
      id title date duration
      sentences { text speaker_name }
      summary { overview action_items }
    }
  }`;

  const res = await fetch(FIREFLIES_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${integration.api_key}`,
    },
    body: JSON.stringify({ query }),
  });

  if (!res.ok) return;
  const { data } = await res.json();
  const t = data?.transcript;
  if (!t) return;

  const transcript = t.sentences?.map(s => `${s.speaker_name}: ${s.text}`).join('\n') || '';

  await supabase.from('integration_data').upsert({
    user_id: integration.user_id,
    integration_id: integration.id,
    provider: 'fireflies',
    data_type: 'transcript',
    external_id: t.id,
    title: t.title || 'Untitled Meeting',
    content: transcript,
    metadata: {
      date: t.date,
      duration: t.duration,
      summary: t.summary?.overview || '',
      action_items: t.summary?.action_items || '',
    },
    synced_at: new Date().toISOString(),
  }, { onConflict: 'integration_id,external_id', ignoreDuplicates: false });
}
