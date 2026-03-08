import { execFile } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import crypto from 'crypto';
import { transcribe } from './video.js';
import { getSubtitles as getCaptions } from 'youtube-caption-extractor';

const execFileAsync = promisify(execFile);
const YTDLP_BIN = process.env.YTDLP_PATH || 'yt-dlp';

function isYouTube(url) {
  return /youtube\.com|youtu\.be/i.test(url);
}

function extractVideoId(url) {
  const m = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}

/**
 * Extract content from a social media URL.
 * YouTube uses oEmbed + youtube-caption-extractor (no bot detection issues).
 * All other platforms use yt-dlp.
 */
export async function extractFromUrl(url) {
  if (isYouTube(url)) {
    return extractYouTube(url);
  }
  return extractWithYtdlp(url);
}

// ─── YouTube: oEmbed for metadata, youtube-caption-extractor for transcript ───

async function extractYouTube(url) {
  const videoId = extractVideoId(url);
  if (!videoId) {
    return { url, platform: 'YouTube', title: '', description: '', uploader: '', duration: 0, thumbnail: null, transcript: null, source: 'error' };
  }

  // 1. Get metadata via oEmbed (never blocked)
  let title = '', uploader = '', thumbnail = null;
  try {
    const res = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
    if (res.ok) {
      const data = await res.json();
      title = data.title || '';
      uploader = data.author_name || '';
      // Use maxresdefault for better quality thumbnail
      thumbnail = `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
    }
  } catch (err) {
    console.log('[youtube] oEmbed failed:', err.message);
  }

  // 2. Get transcript via youtube-caption-extractor
  let transcript = null;
  let source = 'metadata_only';
  try {
    const captions = await getCaptions({ videoID: videoId, lang: 'en' });
    if (captions && captions.length > 0) {
      transcript = captions.map(c => c.text).join(' ');
      source = 'captions';
      console.log(`[youtube] Got ${captions.length} caption segments for ${videoId}`);
    }
  } catch (err) {
    console.log('[youtube] Caption extraction failed:', err.message?.slice(0, 150));
  }

  // 3. If no captions, try yt-dlp audio + Whisper as fallback
  if (!transcript) {
    const tmpDir = path.join(os.tmpdir(), `aiceo-${crypto.randomUUID()}`);
    await fs.mkdir(tmpDir, { recursive: true });
    try {
      const audioPath = await downloadAudio(url, tmpDir);
      if (audioPath) {
        const audioBuffer = await fs.readFile(audioPath);
        const filename = path.basename(audioPath);
        const result = await transcribe(audioBuffer, filename);
        transcript = result.text;
        source = 'whisper';
      }
    } catch (err) {
      console.log('[youtube] Whisper fallback failed:', err.message?.slice(0, 100));
    } finally {
      await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => {});
    }
  }

  return {
    url, platform: 'YouTube', title, description: '',
    uploader, duration: 0, thumbnail, transcript, source,
  };
}

// ─── Other platforms: yt-dlp pipeline ───

async function extractWithYtdlp(url) {
  const tmpDir = path.join(os.tmpdir(), `aiceo-${crypto.randomUUID()}`);
  await fs.mkdir(tmpDir, { recursive: true });

  try {
    const metadata = await getMetadata(url);
    const existingCaptions = await getSubtitles(url, tmpDir);
    if (existingCaptions) {
      return {
        url, platform: metadata.platform, title: metadata.title,
        description: metadata.description, uploader: metadata.uploader,
        duration: metadata.duration, thumbnail: metadata.thumbnail,
        transcript: existingCaptions, source: 'captions',
      };
    }

    const audioPath = await downloadAudio(url, tmpDir);
    if (!audioPath) {
      return {
        url, platform: metadata.platform, title: metadata.title,
        description: metadata.description, uploader: metadata.uploader,
        duration: metadata.duration, thumbnail: metadata.thumbnail,
        transcript: null, source: 'metadata_only',
      };
    }

    const audioBuffer = await fs.readFile(audioPath);
    const filename = path.basename(audioPath);
    const result = await transcribe(audioBuffer, filename);

    return {
      url, platform: metadata.platform, title: metadata.title,
      description: metadata.description, uploader: metadata.uploader,
      duration: metadata.duration, thumbnail: metadata.thumbnail,
      transcript: result.text, segments: result.segments,
      language: result.language, source: 'whisper',
    };
  } finally {
    await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  }
}

async function getMetadata(url) {
  try {
    const { stdout } = await execFileAsync(YTDLP_BIN, [
      '--dump-json', '--no-download', '--no-warnings', url,
    ], { timeout: 30000 });

    const info = JSON.parse(stdout);
    return {
      platform: info.extractor_key || info.ie_key || 'unknown',
      title: info.title || '',
      description: info.description || '',
      uploader: info.uploader || info.channel || '',
      duration: info.duration || 0,
      thumbnail: info.thumbnail || info.thumbnails?.slice(-1)[0]?.url || null,
    };
  } catch (err) {
    console.log('[metadata] Failed for', url, ':', err.message?.slice(0, 200));
    return {
      platform: guessPlatform(url),
      title: '', description: '', uploader: '', duration: 0, thumbnail: null,
    };
  }
}

async function getSubtitles(url, tmpDir) {
  try {
    const subFile = path.join(tmpDir, 'subs');
    await execFileAsync(YTDLP_BIN, [
      '--write-auto-sub', '--write-sub', '--sub-lang', 'en',
      '--sub-format', 'vtt', '--skip-download', '--no-warnings',
      '-o', subFile, url,
    ], { timeout: 30000 });

    const files = await fs.readdir(tmpDir);
    const subFiles = files.filter(f => f.endsWith('.vtt') || f.endsWith('.srt'));
    if (subFiles.length === 0) return null;

    const content = await fs.readFile(path.join(tmpDir, subFiles[0]), 'utf-8');
    return cleanSubtitles(content);
  } catch {
    return null;
  }
}

async function downloadAudio(url, tmpDir) {
  try {
    const outputTemplate = path.join(tmpDir, 'audio.%(ext)s');
    await execFileAsync(YTDLP_BIN, [
      '-x', '--audio-format', 'mp3', '--audio-quality', '5',
      '--max-filesize', '25m', '--no-playlist', '--no-warnings',
      '-o', outputTemplate, url,
    ], { timeout: 120000 });

    const files = await fs.readdir(tmpDir);
    const audioFile = files.find(f => f.startsWith('audio.'));
    return audioFile ? path.join(tmpDir, audioFile) : null;
  } catch {
    return null;
  }
}

function cleanSubtitles(vttContent) {
  const lines = vttContent.split('\n');
  const textLines = [];
  const seen = new Set();

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (trimmed === 'WEBVTT') continue;
    if (trimmed.startsWith('Kind:') || trimmed.startsWith('Language:')) continue;
    if (/^\d{2}:\d{2}/.test(trimmed)) continue;
    if (/^\d+$/.test(trimmed)) continue;
    const clean = trimmed.replace(/<[^>]+>/g, '').trim();
    if (clean && !seen.has(clean)) {
      seen.add(clean);
      textLines.push(clean);
    }
  }

  return textLines.join(' ');
}

function guessPlatform(url) {
  if (/youtube|youtu\.be/i.test(url)) return 'YouTube';
  if (/instagram/i.test(url)) return 'Instagram';
  if (/tiktok/i.test(url)) return 'TikTok';
  if (/facebook|fb\.watch/i.test(url)) return 'Facebook';
  if (/x\.com|twitter/i.test(url)) return 'X';
  if (/linkedin/i.test(url)) return 'LinkedIn';
  return 'unknown';
}
