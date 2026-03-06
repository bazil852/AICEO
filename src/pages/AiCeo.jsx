import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Mic, Square, Loader2, CircleStop } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './AiCeo.css';

const SYSTEM_PROMPT = `You are the AI CEO of the user's business, powered by PuerlyPersonal. You help them with content creation, marketing strategy, sales optimization, and overall business growth. Be direct, actionable, and strategic. Speak like a sharp, experienced CEO who genuinely cares about the user's revenue and growth. Use markdown formatting with headers, tables, bullet points, and bold text to make your analysis clear and scannable.`;

async function streamResponse(messages, onChunk, abortSignal) {
  const res = await fetch('/api/xai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${import.meta.env.VITE_XAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'grok-3-fast',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages,
      ],
      stream: true,
    }),
    signal: abortSignal,
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(error);
  }

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
        const parsed = JSON.parse(data);
        const delta = parsed.choices?.[0]?.delta?.content;
        if (delta) {
          fullContent += delta;
          onChunk(fullContent);
        }
      } catch {
        // skip malformed chunks
      }
    }
  }

  return fullContent;
}

export default function AiCeo() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);
  const abortRef = useRef(null);

  const hasMessages = messages.length > 0;

  const starters = [
    'Help me plan content for this week across all of my channels.',
    'Analyze my sales calls and tell me my top 5 objections based on my client calls.',
    'Tell me five things I should record more content about.',
    'Write a newsletter to sell my product to my audience.',
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendToAI = useCallback(async (chatHistory) => {
    setIsGenerating(true);

    const assistantMsgId = `msg-${Date.now()}-ai`;

    // Add empty assistant message placeholder
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

      await streamResponse(
        apiMessages,
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
