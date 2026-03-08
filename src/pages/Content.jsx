import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Image, FileText, Link2, ChevronRight, ChevronLeft, X, Plus, History, Loader, CircleStop } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { uploadContextFiles, extractSocialUrls, getContentItems, deleteContentItem, getIntegrationContext } from '../lib/api';
import { supabase } from '../lib/supabase';
import './Content.css';

const platforms = [
  {
    id: 'instagram',
    name: 'Instagram',
    color: '#E4405F',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="content-pill-icon">
        <rect x="2" y="2" width="20" height="20" rx="5" />
        <circle cx="12" cy="12" r="5" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    id: 'facebook',
    name: 'Facebook',
    color: '#1877F2',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="content-pill-icon">
        <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3V2z" />
      </svg>
    ),
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    color: '#0A66C2',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="content-pill-icon">
        <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-4 0v7h-4v-7a6 6 0 016-6z" />
        <rect x="2" y="9" width="4" height="12" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    ),
  },
  {
    id: 'youtube',
    name: 'YouTube',
    color: '#FF0000',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="content-pill-icon">
        <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.546 12 3.546 12 3.546s-7.505 0-9.377.504A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.504 9.376.504 9.376.504s7.505 0 9.377-.504a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
  {
    id: 'x',
    name: 'X',
    color: '#000000',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="content-pill-icon">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    color: '#010101',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="content-pill-icon">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.72a8.2 8.2 0 004.76 1.52V6.79a4.84 4.84 0 01-1-.1z" />
      </svg>
    ),
  },
];

const SOCIAL_URL_PATTERN = /^https?:\/\/(www\.)?(instagram\.com|facebook\.com|fb\.watch|linkedin\.com|youtube\.com|youtu\.be|x\.com|twitter\.com|tiktok\.com)\//i;

const PLATFORM_GUIDANCE = {
  instagram: 'Create content optimized for Instagram — compelling captions (up to 2,200 chars), strategic hashtags, Reels scripts, carousel slides, and Stories ideas. Focus on visual storytelling and engagement hooks.',
  facebook: 'Create content optimized for Facebook — engaging posts, group-friendly discussions, video descriptions, event copy, and ad copy. Focus on community building and shareability.',
  linkedin: 'Create content optimized for LinkedIn — professional thought leadership posts, article drafts, carousel content, and networking-friendly copy. Focus on authority, value, and professional engagement.',
  youtube: 'Create content optimized for YouTube — video scripts, titles, descriptions with SEO keywords, thumbnail concepts, Shorts scripts, and chapter timestamps. Focus on retention and discoverability.',
  x: 'Create content optimized for X (Twitter) — punchy tweets (up to 280 chars), threads, quote-tweet strategies, and engagement hooks. Focus on conciseness and virality.',
  tiktok: 'Create content optimized for TikTok — short-form video scripts with hooks in the first 1-3 seconds, trending audio suggestions, caption copy, and hashtag strategies. Focus on trends and watch time.',
};

function buildSystemPrompt(platform, photos, documents, socialUrls, brandDna, integrationContext) {
  let prompt = `You are a content creation AI assistant powered by PuerlyPersonal. Your job is to help the user write, plan, and generate content specifically for ${platform.name}. Be creative, on-brand, and strategic. Format your responses with markdown — use headers, bullet points, bold text, and code blocks when appropriate.\n\n`;

  prompt += `=== TARGET PLATFORM: ${platform.name} ===\n`;
  prompt += (PLATFORM_GUIDANCE[platform.id] || `Tailor all content for ${platform.name}.`) + '\n\n';

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
    if (brandDna.photo_urls?.length) prompt += `Brand Photos: ${brandDna.photo_urls.length} photos available\n`;
    if (brandDna.documents && Object.keys(brandDna.documents).length) {
      for (const [key, doc] of Object.entries(brandDna.documents)) {
        if (doc.extracted_text) {
          const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
          prompt += `\n--- ${label} ---\n${doc.extracted_text.slice(0, 2000)}\n`;
        }
      }
    }
    prompt += `\nUse this Brand DNA to maintain consistent voice and messaging across all content.\n\n`;
  }

  let hasContext = false;

  const donePhotos = photos.filter((p) => p.status === 'done');
  if (donePhotos.length > 0) {
    prompt += `=== REFERENCE PHOTOS ===\n`;
    prompt += `The user has uploaded ${donePhotos.length} reference photo(s):\n`;
    donePhotos.forEach((p, i) => { prompt += `- ${p.file?.name || p.result?.filename || `Photo ${i + 1}`}\n`; });
    prompt += `These photos are visual references for the content. Acknowledge and reference the visual content when generating captions, descriptions, or scripts.\n\n`;
    hasContext = true;
  }

  const doneDocs = documents.filter((d) => d.status === 'done' && d.result?.extractedText);
  if (doneDocs.length > 0) {
    prompt += `=== UPLOADED DOCUMENTS ===\n`;
    doneDocs.forEach((doc, i) => {
      const text = doc.result.extractedText.slice(0, 3000);
      prompt += `--- Document ${i + 1}: ${doc.result?.filename || 'Untitled'} ---\n${text}\n\n`;
    });
    hasContext = true;
  }

  const doneVideoTranscripts = documents.filter((d) => d.status === 'done' && d.result?.transcript);
  if (doneVideoTranscripts.length > 0) {
    prompt += `=== VIDEO TRANSCRIPTS ===\n`;
    doneVideoTranscripts.forEach((doc, i) => {
      const text = doc.result.transcript.slice(0, 3000);
      prompt += `--- ${doc.result?.filename || 'Video'} ---\n${text}\n\n`;
    });
    hasContext = true;
  }

  const doneSocial = socialUrls.filter((s) => s.status === 'done' && s.result);
  if (doneSocial.length > 0) {
    prompt += `=== SOCIAL MEDIA LINKS ===\n`;
    doneSocial.forEach((item) => {
      const r = item.result;
      prompt += `--- ${r.title || item.url} ---\n`;
      prompt += `URL: ${r.url || item.url}\n`;
      if (r.platform) prompt += `Platform: ${r.platform}\n`;
      if (r.uploader) prompt += `Creator: ${r.uploader}\n`;
      if (r.description) prompt += `Description: ${r.description.slice(0, 1000)}\n`;
      if (r.duration) prompt += `Duration: ${r.duration}s\n`;
      if (r.transcript) prompt += `Transcript:\n${r.transcript.slice(0, 3000)}\n`;
      prompt += '\n';
    });
    hasContext = true;
  }

  if (hasContext) {
    prompt += `Use ALL of the above context — photos, documents, transcripts, and social media links — as source material when the user asks you to create or repurpose content. Reference specific quotes, topics, ideas, and visual elements from the provided context.\n\n`;
  }

  if (integrationContext) {
    prompt += `=== BUSINESS DATA FROM INTEGRATIONS ===\n${integrationContext}\n\nUse this business data (call transcripts, payment data, CRM contacts, etc.) to inform your content suggestions with real business context.\n\n`;
  }

  prompt += `Always be actionable and ready to generate actual content (captions, scripts, hooks, threads, etc.) — not just advice.`;
  return prompt;
}

async function streamContentResponse(messages, systemPrompt, onChunk, abortSignal) {
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
      } catch { /* skip malformed */ }
    }
  }
  return fullContent;
}

export default function Content() {
  const navigate = useNavigate();
  const [selectedPlatform, setSelectedPlatform] = useState('instagram');
  const [input, setInput] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [photos, setPhotos] = useState([]); // { id, file, status: 'pending'|'uploading'|'done'|'error', result?, dbId?, url? }
  const [documents, setDocuments] = useState([]); // { id, file, status, result?, dbId?, filename? }
  const [socialUrls, setSocialUrls] = useState([]); // { url, status: 'pending'|'extracting'|'done'|'error', result?, dbId? }
  const [socialError, setSocialError] = useState('');
  const [socialHover, setSocialHover] = useState(false);
  const [photoHover, setPhotoHover] = useState(false);
  const [docHover, setDocHover] = useState(false);
  const [photoDragOver, setPhotoDragOver] = useState(false);
  const [docDragOver, setDocDragOver] = useState(false);
  const [tooltip, setTooltip] = useState({ text: '', x: 0, y: 0, visible: false });
  const [contextSheetOpen, setContextSheetOpen] = useState(false);
  const [showPasteBtn, setShowPasteBtn] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [brandDna, setBrandDna] = useState(null);
  const [integrationCtx, setIntegrationCtx] = useState('');
  const longPressTimer = useRef(null);
  const messagesEndRef = useRef(null);
  const abortRef = useRef(null);

  const photoInputRef = useRef(null);
  const docInputRef = useRef(null);
  const socialZoneRef = useRef(null);

  const activeIndex = platforms.findIndex((p) => p.id === selectedPlatform);
  const activePlatform = platforms[activeIndex];
  const hasMessages = messages.length > 0;

  let idCounter = useRef(0);
  const nextId = () => ++idCounter.current;

  // Fetch Brand DNA and integration context on mount
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user) return;
      const { data } = await supabase
        .from('brand_dna')
        .select('*')
        .eq('user_id', session.user.id)
        .single();
      if (data) setBrandDna(data);
    });
    getIntegrationContext().then(({ context }) => {
      if (context) setIntegrationCtx(context);
    }).catch(() => {});
  }, []);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── Chat logic ──
  const sendToAI = useCallback(async (chatHistory) => {
    setIsGenerating(true);
    const assistantMsgId = `msg-${Date.now()}-ai`;
    setMessages((prev) => [...prev, { id: assistantMsgId, role: 'assistant', content: '' }]);
    try {
      const abort = new AbortController();
      abortRef.current = abort;
      const apiMessages = chatHistory.map((m) => ({ role: m.role, content: m.content }));
      const systemPrompt = buildSystemPrompt(activePlatform, photos, documents, socialUrls, brandDna, integrationCtx);
      await streamContentResponse(apiMessages, systemPrompt, (text) => {
        setMessages((prev) => prev.map((m) => (m.id === assistantMsgId ? { ...m, content: text } : m)));
      }, abort.signal);
    } catch (err) {
      if (err.name !== 'AbortError') {
        setMessages((prev) => prev.map((m) =>
          m.id === assistantMsgId ? { ...m, content: 'Something went wrong. Please try again.' } : m
        ));
      }
    } finally {
      abortRef.current = null;
      setIsGenerating(false);
    }
  }, [activePlatform, photos, documents, socialUrls, brandDna]);

  const stopGenerating = useCallback(() => {
    if (abortRef.current) { abortRef.current.abort(); abortRef.current = null; setIsGenerating(false); }
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

  const openSidebar = useCallback(() => { setSidebarOpen(true); setTooltip(t => ({ ...t, visible: false })); }, []);

  // ── File upload & processing ──
  const processFiles = useCallback(async (ids, files, setter) => {
    setter((prev) => prev.map((item) =>
      ids.includes(item.id) ? { ...item, status: 'uploading' } : item
    ));
    try {
      const { files: results } = await uploadContextFiles(files);
      setter((prev) => prev.map((item) => {
        const idx = ids.indexOf(item.id);
        if (idx === -1) return item;
        const result = results[idx];
        return result?.error
          ? { ...item, status: 'error', result }
          : { ...item, status: 'done', result, dbId: result?.dbId };
      }));
    } catch {
      setter((prev) => prev.map((item) =>
        ids.includes(item.id) ? { ...item, status: 'error' } : item
      ));
    }
  }, []);

  const addPhotos = useCallback((newFiles) => {
    setPhotos((prev) => {
      const remaining = 4 - prev.length;
      if (remaining <= 0) return prev;
      const newItems = Array.from(newFiles).slice(0, remaining).map((file) => ({
        id: nextId(), file, status: 'pending',
      }));
      const ids = newItems.map((item) => item.id);
      const fileList = newItems.map((item) => item.file);
      setTimeout(() => processFiles(ids, fileList, setPhotos), 0);
      return [...prev, ...newItems];
    });
  }, [processFiles]);

  const addDocuments = useCallback((newFiles) => {
    const newItems = Array.from(newFiles).map((file) => ({
      id: nextId(), file, status: 'pending',
    }));
    const ids = newItems.map((item) => item.id);
    const fileList = newItems.map((item) => item.file);
    setDocuments((prev) => [...prev, ...newItems]);
    setTimeout(() => processFiles(ids, fileList, setDocuments), 0);
  }, [processFiles]);

  const removeFile = useCallback((index, setter) => {
    setter((prev) => {
      const item = prev[index];
      if (item?.dbId) deleteContentItem(item.dbId).catch(() => {});
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  const handleDrop = useCallback((e, accept) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter((f) => {
      if (accept === 'image/*') return f.type.startsWith('image/');
      return /\.(pdf|doc|docx|txt)$/i.test(f.name);
    });
    if (files.length) addDocuments(files);
  }, [addDocuments]);

  // Paste handlers
  const handleImagePaste = useCallback((e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    const imageFiles = [];
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) imageFiles.push(file);
      }
    }
    if (imageFiles.length > 0) { e.preventDefault(); addPhotos(imageFiles); }
  }, [addPhotos]);

  const handleDocPaste = useCallback((e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    const docFiles = [];
    for (const item of items) {
      if (item.kind === 'file' && !item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) docFiles.push(file);
      }
    }
    if (docFiles.length > 0) { e.preventDefault(); addDocuments(docFiles); }
  }, [addDocuments]);

  // ── Social URL extraction ──
  const processSocialUrl = useCallback(async (url) => {
    setSocialUrls((prev) => prev.map((item) =>
      item.url === url ? { ...item, status: 'extracting' } : item
    ));
    try {
      const { results } = await extractSocialUrls([url]);
      const result = results[0];
      setSocialUrls((prev) => prev.map((item) =>
        item.url === url
          ? { ...item, status: result?.error ? 'error' : 'done', result, dbId: result?.dbId }
          : item
      ));
    } catch {
      setSocialUrls((prev) => prev.map((item) =>
        item.url === url ? { ...item, status: 'error' } : item
      ));
    }
  }, []);

  const addSocialUrl = useCallback((text) => {
    if (!SOCIAL_URL_PATTERN.test(text)) {
      setSocialError('Not a valid social media URL');
      return;
    }
    if (socialUrls.some((item) => item.url === text)) {
      setSocialError('Already added');
      return;
    }
    setSocialError('');
    setSocialUrls((prev) => [...prev, { url: text, status: 'pending' }]);
    setTimeout(() => processSocialUrl(text), 0);
  }, [socialUrls, processSocialUrl]);

  const handleSocialPaste = useCallback((e) => {
    const text = (e.clipboardData || window.clipboardData).getData('text').trim();
    if (!text) return;
    addSocialUrl(text);
  }, [addSocialUrl]);

  const handleClipboardPaste = useCallback(async () => {
    setShowPasteBtn(false);
    try {
      const text = (await navigator.clipboard.readText()).trim();
      if (!text) return;
      addSocialUrl(text);
    } catch {
      setSocialError('Clipboard access denied');
    }
  }, [addSocialUrl]);

  const handleLongPressStart = useCallback(() => {
    longPressTimer.current = setTimeout(() => setShowPasteBtn(true), 500);
  }, []);

  const handleLongPressEnd = useCallback(() => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  }, []);

  // Clear error after a delay
  useEffect(() => {
    if (!socialError) return;
    const t = setTimeout(() => setSocialError(''), 3000);
    return () => clearTimeout(t);
  }, [socialError]);

  // Listen for paste when hovering over zones
  useEffect(() => {
    if (!socialHover) return;
    const handler = (e) => handleSocialPaste(e);
    document.addEventListener('paste', handler);
    return () => document.removeEventListener('paste', handler);
  }, [socialHover, handleSocialPaste]);

  useEffect(() => {
    if (!photoHover) return;
    const handler = (e) => handleImagePaste(e);
    document.addEventListener('paste', handler);
    return () => document.removeEventListener('paste', handler);
  }, [photoHover, handleImagePaste]);

  useEffect(() => {
    if (!docHover) return;
    const handler = (e) => handleDocPaste(e);
    document.addEventListener('paste', handler);
    return () => document.removeEventListener('paste', handler);
  }, [docHover, handleDocPaste]);

  // Load saved content items from DB on mount
  useEffect(() => {
    getContentItems().then(({ items }) => {
      if (!items?.length) return;
      const savedPhotos = [];
      const savedDocs = [];
      const savedSocial = [];
      for (const item of items) {
        if (item.type === 'photo') {
          savedPhotos.push({
            id: nextId(), dbId: item.id, status: 'done',
            file: null, url: item.url || item.storage_url,
            result: { type: 'image', filename: item.filename, url: item.url },
          });
        } else if (item.type === 'document') {
          savedDocs.push({
            id: nextId(), dbId: item.id, status: 'done',
            file: null, filename: item.filename,
            result: { type: 'document', filename: item.filename, url: item.url, extractedText: item.extracted_text, transcript: item.transcript },
          });
        } else if (item.type === 'social') {
          const m = item.metadata || {};
          savedSocial.push({
            url: item.url, dbId: item.id, status: 'done',
            result: {
              url: item.url, title: m.title, uploader: m.uploader,
              thumbnail: m.thumbnail, platform: m.platform,
              duration: m.duration, transcript: item.transcript,
              description: m.description,
            },
          });
        }
      }
      if (savedPhotos.length) setPhotos(savedPhotos);
      if (savedDocs.length) setDocuments(savedDocs);
      if (savedSocial.length) setSocialUrls(savedSocial);
    }).catch(() => {});
  }, []);

  // ── Shared sidebar/sheet content ──
  const contextContent = (isSheet) => (
    <>
      {/* Photo thumbnails */}
      {photos.length > 0 && (
        <div className="cs-photo-grid">
          {photos.map((item, i) => (
            <div key={i} className={`cs-photo-thumb ${item.status === 'uploading' ? 'cs-photo-thumb--processing' : ''}`}>
              <img src={item.file ? URL.createObjectURL(item.file) : item.url} alt={item.file?.name || item.result?.filename || ''} className="cs-photo-img" />
              {(item.status === 'pending' || item.status === 'uploading') && (
                <div className="cs-thumb-overlay">
                  <Loader size={14} className="cs-spinner" />
                </div>
              )}
              {item.status === 'error' && (
                <div className="cs-thumb-overlay cs-thumb-overlay--error">!</div>
              )}
              <button className="cs-photo-remove" onClick={() => removeFile(i, setPhotos)}>
                <X size={10} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Photos upload */}
      <input
        ref={isSheet ? undefined : photoInputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: 'none' }}
        onChange={(e) => {
          const files = Array.from(e.target.files);
          if (files.length) addPhotos(files);
          e.target.value = '';
        }}
      />
      {photos.length < 4 && (
        <div
          className={`cs-upload-zone cs-upload-zone--expanded ${photoDragOver ? 'cs-upload-zone--dragover' : ''} ${photoHover ? 'cs-upload-zone--hover' : ''}`}
          onClick={() => photoInputRef.current?.click()}
          onMouseEnter={() => setPhotoHover(true)}
          onMouseLeave={() => setPhotoHover(false)}
          onDragOver={(e) => { e.preventDefault(); setPhotoDragOver(true); }}
          onDragLeave={() => setPhotoDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setPhotoDragOver(false);
            const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/'));
            if (files.length) addPhotos(files);
          }}
        >
          <Image size={20} className="cs-upload-icon" />
          <span className="cs-upload-label cs-upload-label--show">Add reference photos</span>
          <span className="cs-upload-hint cs-upload-hint--show">{photos.length}/4 photos</span>
        </div>
      )}

      {/* Document thumbnails */}
      {documents.length > 0 && (
        <div className="cs-doc-grid">
          {documents.map((item, i) => {
            const fname = item.file?.name || item.filename || '';
            const ext = fname.split('.').pop().toLowerCase();
            return (
              <div
                key={i}
                className={`cs-doc-thumb ${item.status === 'uploading' ? 'cs-doc-thumb--processing' : ''}`}
                onMouseEnter={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const fn = item.file?.name || item.filename || 'file';
                  const statusText = item.status === 'done' ? `${fn} ✓` : item.status === 'error' ? `${fn} — failed` : fn;
                  setTooltip({ text: statusText, x: rect.left + rect.width / 2, y: rect.top - 6, visible: true });
                }}
                onMouseLeave={() => setTooltip((t) => ({ ...t, visible: false }))}
              >
                {(item.status === 'pending' || item.status === 'uploading') ? (
                  <Loader size={14} className="cs-spinner" />
                ) : (
                  <span className="cs-doc-ext">{ext}</span>
                )}
                {item.status === 'error' && (
                  <div className="cs-thumb-overlay cs-thumb-overlay--error">!</div>
                )}
                <button className="cs-doc-remove" onClick={() => { removeFile(i, setDocuments); setTooltip(t => ({ ...t, visible: false })); }}>
                  <X size={10} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Documents upload */}
      <input
        ref={isSheet ? undefined : docInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.txt,.json,.csv"
        multiple
        style={{ display: 'none' }}
        onChange={(e) => {
          const files = Array.from(e.target.files);
          if (files.length) addDocuments(files);
          e.target.value = '';
        }}
      />
      <div
        className={`cs-upload-zone cs-upload-zone--expanded ${docDragOver ? 'cs-upload-zone--dragover' : ''} ${docHover ? 'cs-upload-zone--hover' : ''}`}
        onClick={() => docInputRef.current?.click()}
        onMouseEnter={() => setDocHover(true)}
        onMouseLeave={() => setDocHover(false)}
        onDragOver={(e) => { e.preventDefault(); setDocDragOver(true); }}
        onDragLeave={() => setDocDragOver(false)}
        onDrop={(e) => { handleDrop(e, 'docs'); setDocDragOver(false); }}
      >
        <FileText size={20} className="cs-upload-icon" />
        <span className="cs-upload-label cs-upload-label--show">Add documents</span>
        <span className="cs-upload-hint cs-upload-hint--show">PDF, DOC, DOCX, TXT</span>
      </div>

      {/* Social URL paste zone */}
      <div
        ref={isSheet ? undefined : socialZoneRef}
        className={`cs-upload-zone cs-upload-zone--expanded cs-social-zone ${socialHover ? 'cs-social-zone--active' : ''} ${socialError ? 'cs-social-zone--error' : ''}`}
        onMouseEnter={() => setSocialHover(true)}
        onMouseLeave={() => { setSocialHover(false); setSocialError(''); }}
        {...(isSheet ? {
          onTouchStart: handleLongPressStart,
          onTouchEnd: handleLongPressEnd,
          onTouchMove: handleLongPressEnd,
        } : {})}
      >
        <div className="cs-social-icons" style={{ height: 32, gap: 0 }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="cs-social-float cs-social-float--sheet" style={{ animationDelay: '0s' }}>
            <rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="5" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
          </svg>
          <svg viewBox="0 0 24 24" fill="currentColor" className="cs-social-float cs-social-float--sheet" style={{ animationDelay: '0.8s' }}>
            <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.546 12 3.546 12 3.546s-7.505 0-9.377.504A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.504 9.376.504 9.376.504s7.505 0 9.377-.504a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
          </svg>
          <svg viewBox="0 0 24 24" fill="currentColor" className="cs-social-float cs-social-float--sheet" style={{ animationDelay: '1.6s' }}>
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          <svg viewBox="0 0 24 24" fill="currentColor" className="cs-social-float cs-social-float--sheet" style={{ animationDelay: '2.4s' }}>
            <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-4 0v7h-4v-7a6 6 0 016-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" />
          </svg>
          <svg viewBox="0 0 24 24" fill="currentColor" className="cs-social-float cs-social-float--sheet" style={{ animationDelay: '3.2s' }}>
            <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.72a8.2 8.2 0 004.76 1.52V6.79a4.84 4.84 0 01-1-.1z" />
          </svg>
        </div>
        {isSheet && showPasteBtn && (
          <button className="cs-paste-btn" onClick={handleClipboardPaste}>
            Paste
          </button>
        )}
        <span className="cs-upload-label cs-upload-label--show">
          {socialError || 'Paste a social media link'}
        </span>
        <span className="cs-upload-hint cs-upload-hint--show">
          {isSheet ? 'Press & hold to paste' : 'Hover + Ctrl V'}
        </span>
      </div>
      {socialUrls.length > 0 && (
        <div className="cs-social-cards">
          {socialUrls.map((item, i) => (
            <div key={i} className={`cs-social-card ${item.status === 'extracting' ? 'cs-social-card--extracting' : ''} ${item.status === 'error' ? 'cs-social-card--error' : ''}`}>
              <div className="cs-social-card-thumb">
                {item.result?.thumbnail ? (
                  <img src={item.result.thumbnail} alt="" className="cs-social-card-img" />
                ) : (
                  <div className="cs-social-card-placeholder">
                    <Link2 size={16} />
                  </div>
                )}
                {(item.status === 'pending' || item.status === 'extracting') && (
                  <div className="cs-thumb-overlay">
                    <Loader size={16} className="cs-spinner" />
                  </div>
                )}
              </div>
              <div className="cs-social-card-info">
                <span className="cs-social-card-title">
                  {item.result?.title || item.url.replace(/^https?:\/\/(www\.)?/, '')}
                </span>
                {item.result?.uploader && (
                  <span className="cs-social-card-uploader">{item.result.uploader}</span>
                )}
                {item.status === 'error' && (
                  <span className="cs-url-badge cs-url-badge--error">failed</span>
                )}
              </div>
              <button className="cs-social-card-remove" onClick={() => { if (item.dbId) deleteContentItem(item.dbId).catch(() => {}); setSocialUrls((prev) => prev.filter((_, j) => j !== i)); }}>
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Brand DNA */}
      <div className="cs-branddna cs-branddna--expanded">
        <img src="/favicon.png" alt="Brand DNA" className="cs-branddna-logo" />
        <span className="cs-branddna-title cs-branddna-title--show">Brand DNA</span>
        <p className="cs-branddna-desc cs-branddna-desc--show">
          Your brand voice, identity, and visual style used to personalize content.
        </p>
        <button className="cs-branddna-btn cs-branddna-btn--show" onClick={(e) => { e.stopPropagation(); navigate('/settings', { state: { scrollTo: 'brand-dna' } }); }}>
          Edit Brand DNA
        </button>
      </div>
    </>
  );

  return (
    <div className="content-page">
      {/* Content Sidebar (desktop only) */}
      <aside
        className={`content-sidebar ${sidebarOpen ? 'content-sidebar--open' : ''}`}
        onClick={!sidebarOpen ? openSidebar : undefined}
      >
        {/* Header */}
        <div className="cs-header">
          {sidebarOpen ? (
            <>
              <span className="cs-title">Context</span>
              <button className="cs-collapse-btn" onClick={(e) => { e.stopPropagation(); setSidebarOpen(false); setTooltip(t => ({ ...t, visible: false })); }} title="Collapse">
                <ChevronLeft size={18} />
              </button>
            </>
          ) : (
            <button className="cs-expand-btn" onClick={openSidebar} title="Expand">
              <ChevronRight size={18} />
            </button>
          )}
        </div>

        <div className="cs-items">
          {/* Photo thumbnails */}
          {photos.length > 0 && (
            <div className="cs-photo-grid">
              {photos.map((item, i) => (
                <div key={i} className={`cs-photo-thumb ${item.status === 'uploading' ? 'cs-photo-thumb--processing' : ''}`}>
                  <img src={item.file ? URL.createObjectURL(item.file) : item.url} alt={item.file?.name || item.result?.filename || ''} className="cs-photo-img" />
                  {(item.status === 'pending' || item.status === 'uploading') && (
                    <div className="cs-thumb-overlay">
                      <Loader size={14} className="cs-spinner" />
                    </div>
                  )}
                  <button className="cs-photo-remove" onClick={() => removeFile(i, setPhotos)}>
                    <X size={10} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Photos upload */}
          <input
            ref={photoInputRef}
            type="file"
            accept="image/*"
            multiple
            style={{ display: 'none' }}
            onChange={(e) => {
              const files = Array.from(e.target.files);
              if (files.length) addPhotos(files);
              e.target.value = '';
            }}
          />
          {photos.length < 4 && (
            <div
              className={`cs-upload-zone ${photoDragOver ? 'cs-upload-zone--dragover' : ''} ${photoHover ? 'cs-upload-zone--hover' : ''}`}
              onClick={() => { if (sidebarOpen) photoInputRef.current?.click(); }}
              onMouseEnter={() => setPhotoHover(true)}
              onMouseLeave={() => setPhotoHover(false)}
              onDragOver={(e) => { e.preventDefault(); setPhotoDragOver(true); }}
              onDragLeave={() => setPhotoDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setPhotoDragOver(false);
                const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/'));
                if (files.length) addPhotos(files);
              }}
            >
              <Image size={20} className="cs-upload-icon" />
              <span className="cs-upload-label">Add reference photos</span>
              <span className="cs-upload-hint">{photos.length}/4 photos</span>
            </div>
          )}

          {/* Document thumbnails */}
          {documents.length > 0 && (
            <div className="cs-doc-grid">
              {documents.map((item, i) => {
                const fname = item.file?.name || item.filename || '';
                const ext = fname.split('.').pop().toLowerCase();
                return (
                  <div
                    key={i}
                    className={`cs-doc-thumb ${item.status === 'uploading' ? 'cs-doc-thumb--processing' : ''}`}
                    onMouseEnter={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setTooltip({ text: item.file?.name || item.filename || 'file', x: rect.left + rect.width / 2, y: rect.top - 6, visible: true });
                    }}
                    onMouseLeave={() => setTooltip((t) => ({ ...t, visible: false }))}
                  >
                    {(item.status === 'pending' || item.status === 'uploading') ? (
                      <Loader size={14} className="cs-spinner" />
                    ) : (
                      <span className="cs-doc-ext">{ext}</span>
                    )}
                    <button className="cs-doc-remove" onClick={() => { removeFile(i, setDocuments); setTooltip(t => ({ ...t, visible: false })); }}>
                      <X size={10} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Documents upload */}
          <input
            ref={docInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.txt,.json,.csv"
            multiple
            style={{ display: 'none' }}
            onChange={(e) => {
              const files = Array.from(e.target.files);
              if (files.length) addDocuments(files);
              e.target.value = '';
            }}
          />
          <div
            className={`cs-upload-zone ${docDragOver ? 'cs-upload-zone--dragover' : ''} ${docHover ? 'cs-upload-zone--hover' : ''}`}
            onClick={() => { if (sidebarOpen) docInputRef.current?.click(); }}
            onMouseEnter={() => setDocHover(true)}
            onMouseLeave={() => setDocHover(false)}
            onDragOver={(e) => { e.preventDefault(); setDocDragOver(true); }}
            onDragLeave={() => setDocDragOver(false)}
            onDrop={(e) => { handleDrop(e, 'docs'); setDocDragOver(false); }}
          >
            <FileText size={20} className="cs-upload-icon" />
            <span className="cs-upload-label">Add documents</span>
            <span className="cs-upload-hint">PDF, DOC, DOCX, TXT</span>
          </div>

          {/* Social URL paste zone */}
          <div
            ref={socialZoneRef}
            className={`cs-upload-zone cs-social-zone ${socialHover ? 'cs-social-zone--active' : ''} ${socialError ? 'cs-social-zone--error' : ''}`}
            onMouseEnter={() => setSocialHover(true)}
            onMouseLeave={() => { setSocialHover(false); setSocialError(''); }}
          >
            <div className="cs-social-icons">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="cs-social-float" style={{ animationDelay: '0s' }}>
                <rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="5" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
              </svg>
              <svg viewBox="0 0 24 24" fill="currentColor" className="cs-social-float" style={{ animationDelay: '0.8s' }}>
                <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.546 12 3.546 12 3.546s-7.505 0-9.377.504A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.504 9.376.504 9.376.504s7.505 0 9.377-.504a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
              <svg viewBox="0 0 24 24" fill="currentColor" className="cs-social-float" style={{ animationDelay: '1.6s' }}>
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              <svg viewBox="0 0 24 24" fill="currentColor" className="cs-social-float" style={{ animationDelay: '2.4s' }}>
                <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-4 0v7h-4v-7a6 6 0 016-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" />
              </svg>
              <svg viewBox="0 0 24 24" fill="currentColor" className="cs-social-float" style={{ animationDelay: '3.2s' }}>
                <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.72a8.2 8.2 0 004.76 1.52V6.79a4.84 4.84 0 01-1-.1z" />
              </svg>
            </div>
            <span className="cs-upload-label">
              {socialError || 'Paste a social media link'}
            </span>
            <span className="cs-upload-hint">Hover + Ctrl V</span>
          </div>
          {socialUrls.length > 0 && (
            <div className="cs-social-cards">
              {socialUrls.map((item, i) => (
                <div key={i} className={`cs-social-card ${item.status === 'extracting' ? 'cs-social-card--extracting' : ''} ${item.status === 'error' ? 'cs-social-card--error' : ''}`}>
                  <div className="cs-social-card-thumb">
                    {item.result?.thumbnail ? (
                      <img src={item.result.thumbnail} alt="" className="cs-social-card-img" />
                    ) : (
                      <div className="cs-social-card-placeholder">
                        <Link2 size={16} />
                      </div>
                    )}
                    {(item.status === 'pending' || item.status === 'extracting') && (
                      <div className="cs-thumb-overlay">
                        <Loader size={16} className="cs-spinner" />
                      </div>
                    )}
                  </div>
                  <div className="cs-social-card-info">
                    <span className="cs-social-card-title">
                      {item.result?.title || item.url.replace(/^https?:\/\/(www\.)?/, '')}
                    </span>
                    {item.result?.uploader && (
                      <span className="cs-social-card-uploader">{item.result.uploader}</span>
                    )}
                    {item.status === 'error' && (
                      <span className="cs-url-badge cs-url-badge--error">failed</span>
                    )}
                  </div>
                  <button className="cs-social-card-remove" onClick={() => { if (item.dbId) deleteContentItem(item.dbId).catch(() => {}); setSocialUrls((prev) => prev.filter((_, j) => j !== i)); }}>
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Brand DNA */}
          <div className="cs-branddna">
            <img src="/favicon.png" alt="Brand DNA" className="cs-branddna-logo" />
            <span className="cs-branddna-title">Brand DNA</span>
            <p className="cs-branddna-desc">
              Your brand voice, identity, and visual style used to personalize content.
            </p>
            <button className="cs-branddna-btn" onClick={(e) => { e.stopPropagation(); navigate('/settings', { state: { scrollTo: 'brand-dna' } }); }}>
              Edit Brand DNA
            </button>
          </div>
        </div>
      </aside>

      {/* Doc tooltip — rendered outside sidebar to avoid overflow clipping */}
      {tooltip.visible && (
        <div
          className="cs-doc-tooltip"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          {tooltip.text}
        </div>
      )}

      {/* Mobile Context Bottom Sheet */}
      <div
        className={`context-sheet-overlay ${contextSheetOpen ? 'context-sheet-overlay--open' : ''}`}
        onClick={() => { setContextSheetOpen(false); setShowPasteBtn(false); }}
      />
      <div className={`context-sheet ${contextSheetOpen ? 'context-sheet--open' : ''}`}>
        <div className="context-sheet-handle" onClick={() => { setContextSheetOpen(false); setShowPasteBtn(false); }}>
          <div className="context-sheet-bar" />
        </div>
        <div className="context-sheet-body">
          {contextContent(true)}
        </div>
      </div>

      {/* Main content area */}
      <div className="content-main">
        {/* Platform Pill Selector */}
        <div className="content-top-bar">
          <button className="content-prev-convos" title="Previous conversations">
            <History size={18} className="content-prev-convos-icon" />
            <span className="content-prev-convos-label">Previous conversations</span>
          </button>
          <div className="content-pill-bar">
            <div className="content-pill">
              <div
                className="content-pill-slider"
                style={{ transform: `translateX(calc(${activeIndex} * var(--pill-size)))` }}
              />
              {platforms.map((p) => (
                <button
                  key={p.id}
                  className={`content-pill-btn ${selectedPlatform === p.id ? 'content-pill-btn--active' : ''}`}
                  onClick={() => setSelectedPlatform(p.id)}
                  title={p.name}
                >
                  {p.icon}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chat area */}
        <div className="content-chat-area">
          {!hasMessages ? (
            <div className="content-hero">
              <div className="content-hero-cards">
                {/* Instagram Post */}
                <div className="content-mock content-mock--ig">
                  <div className="content-mock-header">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="content-mock-logo">
                      <rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="5" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                    </svg>
                    <span className="content-mock-handle">yourpage</span>
                  </div>
                  <div className="content-mock-img">
                    <svg viewBox="0 0 48 48" fill="none" className="content-mock-placeholder-icon"><rect width="48" height="48" rx="6" fill="currentColor" opacity="0.08"/><path d="M14 34l8-10 6 7 4-5 6 8H14z" fill="currentColor" opacity="0.15"/><circle cx="18" cy="18" r="3" fill="currentColor" opacity="0.15"/></svg>
                  </div>
                  <div className="content-mock-caption">
                    <div className="content-mock-line" style={{ width: '80%' }} />
                    <div className="content-mock-line" style={{ width: '55%' }} />
                  </div>
                </div>

                {/* YouTube Video */}
                <div className="content-mock content-mock--yt">
                  <div className="content-mock-img content-mock-img--wide">
                    <svg viewBox="0 0 48 28" fill="none" className="content-mock-placeholder-icon"><rect width="48" height="28" rx="4" fill="currentColor" opacity="0.08"/><path d="M19 9v10l9-5-9-5z" fill="currentColor" opacity="0.18"/></svg>
                  </div>
                  <div className="content-mock-meta">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="content-mock-logo">
                      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.546 12 3.546 12 3.546s-7.505 0-9.377.504A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.504 9.376.504 9.376.504s7.505 0 9.377-.504a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                    <div className="content-mock-caption">
                      <div className="content-mock-line" style={{ width: '90%' }} />
                      <div className="content-mock-line" style={{ width: '40%' }} />
                    </div>
                  </div>
                </div>

                {/* X Tweet */}
                <div className="content-mock content-mock--x">
                  <div className="content-mock-header">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="content-mock-logo">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                    <span className="content-mock-handle">@yourbrand</span>
                  </div>
                  <div className="content-mock-caption content-mock-caption--tweet">
                    <div className="content-mock-line" style={{ width: '95%' }} />
                    <div className="content-mock-line" style={{ width: '80%' }} />
                    <div className="content-mock-line" style={{ width: '50%' }} />
                  </div>
                  <div className="content-mock-actions">
                    <div className="content-mock-line" style={{ width: '20%', height: 6 }} />
                    <div className="content-mock-line" style={{ width: '20%', height: 6 }} />
                    <div className="content-mock-line" style={{ width: '20%', height: 6 }} />
                  </div>
                </div>

                {/* TikTok Video */}
                <div className="content-mock content-mock--tt">
                  <div className="content-mock-img content-mock-img--tall">
                    <svg viewBox="0 0 36 48" fill="none" className="content-mock-placeholder-icon"><rect width="36" height="48" rx="6" fill="currentColor" opacity="0.08"/><path d="M15 18v12l9-6-9-6z" fill="currentColor" opacity="0.18"/></svg>
                  </div>
                  <div className="content-mock-meta">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="content-mock-logo">
                      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.72a8.2 8.2 0 004.76 1.52V6.79a4.84 4.84 0 01-1-.1z" />
                    </svg>
                    <div className="content-mock-caption">
                      <div className="content-mock-line" style={{ width: '75%' }} />
                    </div>
                  </div>
                </div>
              </div>

              <p className="content-hero-text">Ask your AI CEO to Plan, Ideate or Generate content.</p>
            </div>
          ) : (
            <div className="content-messages">
              {messages.map((msg) => {
                if (msg.role === 'user') {
                  return (
                    <div key={msg.id} className="content-bubble content-bubble--user">
                      <p className="content-user-text">{msg.content}</p>
                    </div>
                  );
                }
                if (!msg.content) {
                  return (
                    <div key={msg.id} className="content-thinking">
                      <span className="content-thinking-text">
                        thinking<span className="content-dots"><span>.</span><span>.</span><span>.</span></span>
                      </span>
                    </div>
                  );
                }
                return (
                  <div key={msg.id} className="content-bubble content-bubble--assistant">
                    <div className="content-markdown">
                      <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
                        table: ({ children, ...props }) => (
                          <div className="content-table-scroll"><table {...props}>{children}</table></div>
                        ),
                      }}>{msg.content}</ReactMarkdown>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Chat Input */}
        <div className="content-input-area">
          <div className="content-input-wrapper">
            <textarea
              className="content-input"
              placeholder={`Create content for ${activePlatform.name}...`}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onInput={autoResize}
              onKeyDown={handleKeyDown}
              rows={1}
            />
            <div className="content-input-footer">
              <button
                className="content-context-btn"
                style={{ background: 'var(--brand-red)' }}
                onClick={() => setContextSheetOpen(true)}
              >
                <Plus size={16} />
                <span>Add context</span>
              </button>
              {isGenerating ? (
                <button className="content-send-btn content-stop-btn" onClick={stopGenerating}>
                  <CircleStop size={18} />
                </button>
              ) : (
                <button className="content-send-btn" disabled={!input.trim()} onClick={sendMessage}>
                  <Send size={18} />
                </button>
              )}
            </div>
            {isGenerating ? (
              <button className="content-send-btn content-send-btn--desktop content-stop-btn" onClick={stopGenerating}>
                <CircleStop size={18} />
              </button>
            ) : (
              <button className="content-send-btn content-send-btn--desktop" disabled={!input.trim()} onClick={sendMessage}>
                <Send size={18} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
