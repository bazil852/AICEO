import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Mic, Square, Loader2, CircleStop } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { supabase } from '../lib/supabase';
import { getContentItems, getIntegrationContext, getSalesStats, getSalesRevenue, getSalesCalls, getProducts, getContacts, getOutlierCreators, getOutlierVideos } from '../lib/api';
import './AiCeo.css';

const BASE_PROMPT = `You are the AI CEO of the user's business, powered by PuerlyPersonal. You have FULL access to their business data — brand identity, content library, sales numbers, products, contacts, call transcripts, and outlier content research. You help them with content creation, marketing strategy, sales optimization, and overall business growth. Be direct, actionable, and strategic. Speak like a sharp, experienced CEO who genuinely cares about the user's revenue and growth. Use markdown formatting with headers, tables, bullet points, and bold text to make your analysis clear and scannable.

IMPORTANT: You already have the user's data loaded below. Reference it directly — don't ask them to provide information you already have.`;

function buildFullSystemPrompt(brandDna, contentItems, integrationCtx, salesData, products, contacts, outlierData) {
  let prompt = BASE_PROMPT + '\n\n';

  // Brand DNA
  if (brandDna) {
    prompt += `=== BRAND DNA ===\n`;
    if (brandDna.description) prompt += `Description: ${brandDna.description}\n`;
    if (brandDna.main_font) prompt += `Main Font: ${brandDna.main_font}\n`;
    if (brandDna.secondary_font) prompt += `Secondary Font: ${brandDna.secondary_font}\n`;
    if (brandDna.colors && Object.keys(brandDna.colors).length) {
      const c = brandDna.colors;
      if (c.primary) prompt += `Primary Color: ${c.primary}\n`;
      if (c.text) prompt += `Text Color: ${c.text}\n`;
      if (c.secondary) prompt += `Secondary Color: ${c.secondary}\n`;
    }
    if (brandDna.photo_urls?.length) prompt += `Brand Photos: ${brandDna.photo_urls.length} photos uploaded\n`;
    if (brandDna.logo_url) prompt += `Logo: uploaded\n`;
    if (brandDna.documents && Object.keys(brandDna.documents).length) {
      for (const [key, doc] of Object.entries(brandDna.documents)) {
        if (doc.extracted_text) {
          const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
          prompt += `\n--- ${label} ---\n${doc.extracted_text.slice(0, 3000)}\n`;
        }
      }
    }
    prompt += '\n';
  }

  // Content items (documents, social links, transcripts)
  if (contentItems?.length) {
    const docs = contentItems.filter(i => i.type === 'document' && i.extracted_text);
    const social = contentItems.filter(i => i.type === 'social');
    const videos = contentItems.filter(i => i.transcript);

    if (docs.length) {
      prompt += `=== UPLOADED DOCUMENTS ===\n`;
      docs.forEach((doc, i) => {
        prompt += `--- ${doc.filename || `Document ${i + 1}`} ---\n${doc.extracted_text.slice(0, 3000)}\n\n`;
      });
    }
    if (social.length) {
      prompt += `=== SOCIAL MEDIA REFERENCES ===\n`;
      social.forEach(item => {
        const m = item.metadata || {};
        prompt += `--- ${m.title || item.url} ---\n`;
        prompt += `URL: ${item.url}\n`;
        if (m.platform) prompt += `Platform: ${m.platform}\n`;
        if (m.uploader) prompt += `Creator: ${m.uploader}\n`;
        if (m.description) prompt += `Description: ${m.description.slice(0, 1000)}\n`;
        if (item.transcript) prompt += `Transcript:\n${item.transcript.slice(0, 3000)}\n`;
        prompt += '\n';
      });
    }
    if (videos.length) {
      prompt += `=== VIDEO TRANSCRIPTS ===\n`;
      videos.forEach(v => {
        prompt += `--- ${v.filename || v.url || 'Video'} ---\n${v.transcript.slice(0, 3000)}\n\n`;
      });
    }
  }

  // Integration context (connected services data)
  if (integrationCtx) {
    prompt += `=== BUSINESS DATA FROM INTEGRATIONS ===\n${integrationCtx}\n\n`;
  }

  // Sales data
  if (salesData) {
    if (salesData.stats && Object.keys(salesData.stats).length) {
      prompt += `=== SALES STATS ===\n`;
      const s = salesData.stats;
      if (s.total_revenue != null) prompt += `Total Revenue: $${Number(s.total_revenue).toLocaleString()}\n`;
      if (s.total_sales != null) prompt += `Total Sales: ${s.total_sales}\n`;
      if (s.avg_deal_size != null) prompt += `Avg Deal Size: $${Number(s.avg_deal_size).toLocaleString()}\n`;
      if (s.conversion_rate != null) prompt += `Conversion Rate: ${s.conversion_rate}%\n`;
      prompt += '\n';
    }
    if (salesData.revenue?.length) {
      prompt += `=== MONTHLY REVENUE ===\n`;
      salesData.revenue.slice(0, 12).forEach(r => {
        prompt += `${r.period || r.month}: $${Number(r.revenue || r.amount || 0).toLocaleString()}\n`;
      });
      prompt += '\n';
    }
    if (salesData.calls?.length) {
      prompt += `=== RECENT SALES CALLS (${salesData.calls.length}) ===\n`;
      salesData.calls.slice(0, 20).forEach(call => {
        prompt += `--- ${call.contact_name || call.title || 'Call'} (${call.date || call.created_at?.slice(0, 10) || 'unknown'}) ---\n`;
        if (call.outcome) prompt += `Outcome: ${call.outcome}\n`;
        if (call.notes) prompt += `Notes: ${call.notes.slice(0, 500)}\n`;
        if (call.transcript) prompt += `Transcript: ${call.transcript.slice(0, 2000)}\n`;
        prompt += '\n';
      });
    }
  }

  // Products
  if (products?.length) {
    prompt += `=== PRODUCTS (${products.length}) ===\n`;
    products.forEach(p => {
      prompt += `- ${p.name}: $${p.price || 0}`;
      if (p.description) prompt += ` — ${p.description.slice(0, 200)}`;
      if (p.total_sales != null) prompt += ` (${p.total_sales} sales)`;
      prompt += '\n';
    });
    prompt += '\n';
  }

  // Contacts
  if (contacts?.length) {
    prompt += `=== CONTACTS / CRM (${contacts.length}) ===\n`;
    contacts.slice(0, 50).forEach(c => {
      prompt += `- ${c.name || c.email}`;
      if (c.company) prompt += ` @ ${c.company}`;
      if (c.stage || c.status) prompt += ` [${c.stage || c.status}]`;
      if (c.deal_value) prompt += ` ($${Number(c.deal_value).toLocaleString()})`;
      prompt += '\n';
    });
    prompt += '\n';
  }

  // Outlier research
  if (outlierData) {
    if (outlierData.creators?.length) {
      prompt += `=== OUTLIER RESEARCH — CREATORS FOLLOWED (${outlierData.creators.length}) ===\n`;
      outlierData.creators.forEach(c => {
        prompt += `- ${c.display_name || c.username} (${c.platform})`;
        if (c.avg_views) prompt += ` — avg ${Number(c.avg_views).toLocaleString()} views`;
        prompt += '\n';
      });
      prompt += '\n';
    }
    if (outlierData.videos?.length) {
      prompt += `=== TOP OUTLIER VIDEOS (${outlierData.videos.length}) ===\n`;
      outlierData.videos.slice(0, 15).forEach(v => {
        prompt += `- "${v.title}" by ${v.outlier_creators?.display_name || v.outlier_creators?.username || 'unknown'}`;
        if (v.views) prompt += ` — ${Number(v.views).toLocaleString()} views`;
        if (v.views_multiplier) prompt += ` (${v.views_multiplier.toFixed(1)}x avg)`;
        prompt += '\n';
      });
      prompt += '\n';
    }
  }

  return prompt;
}

async function streamResponse(messages, systemPrompt, onChunk, abortSignal) {
  const res = await fetch('/api/xai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${import.meta.env.VITE_XAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'grok-3-fast',
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
      stream: true,
    }),
    signal: abortSignal,
  });

  if (!res.ok) throw new Error(await res.text());

  const reader = res.body?.getReader();
  if (!reader) throw new Error('No response body');

  const decoder = new TextDecoder();
  let fullContent = '';
  let buffer = '';

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
        const delta = JSON.parse(data).choices?.[0]?.delta?.content;
        if (delta) { fullContent += delta; onChunk(fullContent); }
      } catch { /* skip */ }
    }
  }
  return fullContent;
}

export default function AiCeo() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [contextReady, setContextReady] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);
  const abortRef = useRef(null);
  const contextRef = useRef({
    brandDna: null,
    contentItems: [],
    integrationCtx: '',
    salesData: null,
    products: [],
    contacts: [],
    outlierData: null,
  });

  const hasMessages = messages.length > 0;

  const starters = [
    'Help me plan content for this week across all of my channels.',
    'Analyze my sales calls and tell me my top 5 objections based on my client calls.',
    'Tell me five things I should record more content about.',
    'Write a newsletter to sell my product to my audience.',
  ];

  // Fetch ALL business context on mount
  useEffect(() => {
    async function loadContext() {
      const results = await Promise.allSettled([
        // 0: Brand DNA
        supabase.auth.getSession().then(async ({ data: { session } }) => {
          if (!session?.user) return null;
          const { data } = await supabase.from('brand_dna').select('*').eq('user_id', session.user.id).single();
          return data;
        }),
        // 1: Content items
        getContentItems().then(r => r.items || []),
        // 2: Integration context
        getIntegrationContext().then(r => r.context || ''),
        // 3: Sales stats
        getSalesStats().then(r => r.stats || {}),
        // 4: Sales revenue
        getSalesRevenue('Month').then(r => r.data || []),
        // 5: Sales calls
        getSalesCalls().then(r => r.calls || []),
        // 6: Products
        getProducts().then(r => r.products || []),
        // 7: Contacts
        getContacts().then(r => r.contacts || []),
        // 8: Outlier creators
        getOutlierCreators().then(r => r.creators || []),
        // 9: Outlier videos (top outliers only)
        getOutlierVideos({ outliersOnly: true }).then(r => r.videos || []),
      ]);

      const val = (i) => results[i].status === 'fulfilled' ? results[i].value : null;

      contextRef.current = {
        brandDna: val(0),
        contentItems: val(1) || [],
        integrationCtx: val(2) || '',
        salesData: {
          stats: val(3) || {},
          revenue: val(4) || [],
          calls: val(5) || [],
        },
        products: val(6) || [],
        contacts: val(7) || [],
        outlierData: {
          creators: val(8) || [],
          videos: val(9) || [],
        },
      };

      console.log('[AI CEO] Context loaded:', {
        brandDna: !!contextRef.current.brandDna,
        contentItems: contextRef.current.contentItems.length,
        integrationCtx: contextRef.current.integrationCtx.length > 0,
        salesCalls: contextRef.current.salesData.calls.length,
        products: contextRef.current.products.length,
        contacts: contextRef.current.contacts.length,
        outlierCreators: contextRef.current.outlierData.creators.length,
        outlierVideos: contextRef.current.outlierData.videos.length,
      });

      setContextReady(true);
    }
    loadContext();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendToAI = useCallback(async (chatHistory) => {
    setIsGenerating(true);

    const assistantMsgId = `msg-${Date.now()}-ai`;

    setMessages((prev) => [
      ...prev,
      { id: assistantMsgId, role: 'assistant', content: '' },
    ]);

    try {
      const abort = new AbortController();
      abortRef.current = abort;

      const apiMessages = chatHistory.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const ctx = contextRef.current;
      const systemPrompt = buildFullSystemPrompt(
        ctx.brandDna,
        ctx.contentItems,
        ctx.integrationCtx,
        ctx.salesData,
        ctx.products,
        ctx.contacts,
        ctx.outlierData,
      );

      await streamResponse(
        apiMessages,
        systemPrompt,
        (text) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsgId ? { ...m, content: text } : m
            )
          );
        },
        abort.signal
      );
    } catch (err) {
      if (err.name !== 'AbortError') {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId
              ? { ...m, content: 'Something went wrong. Please try again.' }
              : m
          )
        );
      }
    } finally {
      abortRef.current = null;
      setIsGenerating(false);
    }
  }, []);

  const stopGenerating = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
      setIsGenerating(false);
    }
  }, []);

  const sendMessage = useCallback(() => {
    const text = input.trim();
    if (!text || isGenerating) return;

    const userMsg = { id: `msg-${Date.now()}-user`, role: 'user', content: text };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput('');
    sendToAI(updated);
  }, [input, isGenerating, messages, sendToAI]);

  const handleStarter = useCallback((text) => {
    if (isGenerating) return;
    const userMsg = { id: `msg-${Date.now()}-user`, role: 'user', content: text };
    const updated = [userMsg];
    setMessages(updated);
    sendToAI(updated);
  }, [isGenerating, sendToAI]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const autoResize = (e) => {
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
  };

  const toggleVoice = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput((prev) => (prev ? prev + ' ' + transcript : transcript));
      setIsListening(false);
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  return (
    <div className="aiceo-page">
      {!hasMessages && (
        <div className="aiceo-hero">
          <img src="/favicon.png" alt="AI CEO" className="aiceo-hero-logo" />
          <div className="aiceo-starters">
            {starters.map((s, i) => (
              <button key={i} className="aiceo-starter" onClick={() => handleStarter(s)}>
                <img src="/favicon.png" alt="" className="aiceo-starter-logo" />
                <span>{s}</span>
              </button>
            ))}
          </div>
          <div className="aiceo-input-area">
            <div className="aiceo-input-glow" />
            <div className="aiceo-input-wrapper">
              <textarea
                ref={inputRef}
                className="aiceo-input"
                placeholder="How can your AI CEO help you?"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={3}
              />
              <div className="aiceo-input-actions">
                <button
                  className={`aiceo-voice-btn ${isListening ? 'aiceo-voice-btn--active' : ''}`}
                  onClick={toggleVoice}
                  title={isListening ? 'Stop listening' : 'Voice input'}
                >
                  {isListening ? <Square size={18} /> : <Mic size={18} />}
                </button>
                <button
                  className="aiceo-send-btn"
                  onClick={sendMessage}
                  disabled={!input.trim() || isGenerating}
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {hasMessages && (
        <div className="aiceo-messages">
          {messages.map((msg) => {
            if (msg.role === 'user') {
              return (
                <div key={msg.id} className="aiceo-bubble aiceo-bubble--user">
                  <p className="aiceo-user-text">{msg.content}</p>
                </div>
              );
            }
            // Hide empty assistant placeholder until content starts streaming
            if (!msg.content) {
              return (
                <div key={msg.id} className="aiceo-thinking">
                  <span className="aiceo-thinking-text">
                    thinking<span className="aiceo-dots"><span>.</span><span>.</span><span>.</span></span>
                  </span>
                </div>
              );
            }
            return (
              <div key={msg.id} className="aiceo-bubble aiceo-bubble--assistant">
                <div className="aiceo-markdown">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      table: ({ children, ...props }) => (
                        <div className="aiceo-table-scroll">
                          <table {...props}>{children}</table>
                        </div>
                      ),
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      )}

      {hasMessages && (
        <div className="aiceo-input-area aiceo-input-area--bottom">
          <div className="aiceo-input-glow" />
          <div className="aiceo-input-wrapper">
            <textarea
              className="aiceo-input"
              placeholder="Ask your AI CEO..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onInput={autoResize}
              onKeyDown={handleKeyDown}
              rows={1}
            />
            <div className="aiceo-input-actions">
              <button
                className={`aiceo-voice-btn ${isListening ? 'aiceo-voice-btn--active' : ''}`}
                onClick={toggleVoice}
                title={isListening ? 'Stop listening' : 'Voice input'}
              >
                {isListening ? <Square size={18} /> : <Mic size={18} />}
              </button>
              {isGenerating ? (
                <button
                  className="aiceo-send-btn aiceo-stop-btn"
                  onClick={stopGenerating}
                >
                  <CircleStop size={18} />
                </button>
              ) : (
                <button
                  className="aiceo-send-btn"
                  onClick={sendMessage}
                  disabled={!input.trim()}
                >
                  <Send size={18} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
