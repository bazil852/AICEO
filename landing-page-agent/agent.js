import { buildSystemPrompt } from './prompts.js';

const ANTHROPIC_API = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-20250514';

function getHeaders() {
  return {
    'Content-Type': 'application/json',
    'x-api-key': process.env.ANTHROPIC_API_KEY,
    'anthropic-version': '2023-06-01',
  };
}

export async function streamGenerate({ messages, brandDna, onChunk }) {
  const systemPrompt = buildSystemPrompt(brandDna);

  // Convert messages to Anthropic format (separate system from user/assistant)
  const anthropicMessages = messages.map(m => ({
    role: m.role === 'system' ? 'user' : m.role,
    content: m.content,
  })).filter(m => m.role === 'user' || m.role === 'assistant');

  console.log('[agent] Sending request to Anthropic API...');
  console.log('[agent] Messages count:', anthropicMessages.length);
  console.log('[agent] API key present:', !!process.env.ANTHROPIC_API_KEY);

  let res;
  try {
    res = await fetch(ANTHROPIC_API, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 16000,
        system: systemPrompt,
        messages: anthropicMessages,
        stream: true,
      }),
    });
  } catch (fetchErr) {
    console.error('[agent] Fetch failed:', fetchErr.message, fetchErr.stack);
    throw fetchErr;
  }

  console.log('[agent] Anthropic API response status:', res.status);

  if (!res.ok) {
    const errText = await res.text().catch(() => 'Unknown error');
    console.error('[agent] API error body:', errText);
    throw new Error(`Claude API error (${res.status}): ${errText}`);
  }

  const reader = res.body?.getReader();
  if (!reader) throw new Error('No response body from Claude');

  const decoder = new TextDecoder();
  let fullContent = '';
  let buffer = '';
  let chunkCount = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith('data: ')) continue;
      const data = trimmed.slice(6);
      if (data === '[DONE]') continue;

      try {
        const parsed = JSON.parse(data);
        if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
          fullContent += parsed.delta.text;
          chunkCount++;
          if (onChunk) onChunk(fullContent);
        }
        if (parsed.type === 'error') {
          console.error('[agent] Anthropic stream error:', JSON.stringify(parsed));
        }
      } catch {
        // skip malformed chunks
      }
    }
  }

  console.log(`[agent] Stream complete. Chunks: ${chunkCount}, Length: ${fullContent.length}`);
  return fullContent;
}

export async function streamEdit({ currentHtml, instruction, conversationHistory, brandDna, onChunk }) {
  const messages = [
    ...(conversationHistory || []),
    {
      role: 'user',
      content: `Here is my current landing page HTML:\n\n\`\`\`html\n${currentHtml}\n\`\`\`\n\nPlease make this change: ${instruction}`,
    },
  ];

  return streamGenerate({ messages, brandDna, onChunk });
}
