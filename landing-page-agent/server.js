import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import { streamGenerate, streamEdit } from './agent.js';

const app = express();
const PORT = process.env.PORT || 3002;

// In-memory job store (auto-cleanup after 5 minutes)
const jobs = new Map();
function createJob(params) {
  const id = crypto.randomUUID();
  jobs.set(id, { params, status: 'pending', chunks: [], fullContent: '', error: null, done: false, listeners: [] });
  setTimeout(() => jobs.delete(id), 5 * 60 * 1000);
  return id;
}

// Allow CORS from AICEO frontend (production + localhost dev)
const ALLOWED_ORIGINS = [
  'https://purelypersonal.app',
  'http://localhost:5173',
  'http://localhost:5174',
];
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    cb(null, false);
  },
  credentials: true,
}));

app.use(express.json({ limit: '5mb' }));

// ─── Health check ───
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'landing-page-agent', model: 'claude-sonnet-4' });
});

// ─── Submit generation job ───
app.post('/generate', (req, res) => {
  const { messages, brandDna } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages array is required' });
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' });
  }

  const jobId = createJob({ type: 'generate', messages, brandDna });
  console.log(`[generate] Job ${jobId} created`);

  // Start processing in background
  processGenerateJob(jobId);

  res.json({ jobId });
});

// ─── Submit edit job ───
app.post('/edit', (req, res) => {
  const { currentHtml, instruction, conversationHistory, brandDna } = req.body;

  if (!currentHtml || !instruction) {
    return res.status(400).json({ error: 'currentHtml and instruction are required' });
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' });
  }

  const jobId = createJob({ type: 'edit', currentHtml, instruction, conversationHistory, brandDna });
  console.log(`[edit] Job ${jobId} created`);

  processEditJob(jobId);

  res.json({ jobId });
});

// ─── Stream job results via GET SSE ───
app.get('/stream/:jobId', (req, res) => {
  const job = jobs.get(req.params.jobId);
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }

  // Set up SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  if (res.socket) { res.socket.setNoDelay(true); res.socket.setTimeout(0); }
  res.flushHeaders();

  // Send any already-buffered events
  res.write(`data: ${JSON.stringify({ type: 'status', text: 'Generating...' })}\n\n`);

  // If there's already content, send the latest chunk
  if (job.fullContent) {
    res.write(`data: ${JSON.stringify({ type: 'chunk', content: job.fullContent })}\n\n`);
  }

  // If already done, send immediately
  if (job.done) {
    if (job.error) {
      res.write(`data: ${JSON.stringify({ type: 'error', error: job.error })}\n\n`);
    } else {
      res.write(`data: ${JSON.stringify({ type: 'done', content: job.fullContent })}\n\n`);
    }
    res.write('data: [DONE]\n\n');
    res.end();
    return;
  }

  // Register as listener for new events
  const listener = (event) => {
    try { res.write(`data: ${JSON.stringify(event)}\n\n`); } catch {}
  };
  const doneListener = () => {
    try {
      res.write('data: [DONE]\n\n');
      res.end();
    } catch {}
  };

  job.listeners.push({ listener, doneListener });

  // Keepalive heartbeat
  const heartbeat = setInterval(() => {
    try { res.write(': heartbeat\n\n'); } catch {}
  }, 2000);

  req.on('close', () => {
    clearInterval(heartbeat);
    const idx = job.listeners.findIndex(l => l.listener === listener);
    if (idx !== -1) job.listeners.splice(idx, 1);
  });
});

// ─── Background job processors ───
async function processGenerateJob(jobId) {
  const job = jobs.get(jobId);
  if (!job) return;

  try {
    console.log(`[generate] Job ${jobId} starting Claude API call...`);
    const fullContent = await streamGenerate({
      messages: job.params.messages,
      brandDna: job.params.brandDna,
      onChunk: (content) => {
        job.fullContent = content;
        for (const { listener } of job.listeners) {
          listener({ type: 'chunk', content });
        }
      },
    });

    console.log(`[generate] Job ${jobId} done. Length: ${fullContent.length}`);
    job.fullContent = fullContent;
    job.done = true;
    for (const { listener, doneListener } of job.listeners) {
      listener({ type: 'done', content: fullContent });
      doneListener();
    }
  } catch (err) {
    console.error(`[generate] Job ${jobId} error:`, err.message);
    job.error = err.message;
    job.done = true;
    for (const { listener, doneListener } of job.listeners) {
      listener({ type: 'error', error: err.message });
      doneListener();
    }
  }
}

async function processEditJob(jobId) {
  const job = jobs.get(jobId);
  if (!job) return;

  try {
    const fullContent = await streamEdit({
      currentHtml: job.params.currentHtml,
      instruction: job.params.instruction,
      conversationHistory: job.params.conversationHistory,
      brandDna: job.params.brandDna,
      onChunk: (content) => {
        job.fullContent = content;
        for (const { listener } of job.listeners) {
          listener({ type: 'chunk', content });
        }
      },
    });

    job.fullContent = fullContent;
    job.done = true;
    for (const { listener, doneListener } of job.listeners) {
      listener({ type: 'done', content: fullContent });
      doneListener();
    }
  } catch (err) {
    console.error(`[edit] Job ${jobId} error:`, err.message);
    job.error = err.message;
    job.done = true;
    for (const { listener, doneListener } of job.listeners) {
      listener({ type: 'error', error: err.message });
      doneListener();
    }
  }
}

app.listen(PORT, () => {
  console.log(`Landing Page Agent running on port ${PORT}`);
  console.log(`Anthropic API key: ${process.env.ANTHROPIC_API_KEY ? 'configured' : 'MISSING'}`);
});
