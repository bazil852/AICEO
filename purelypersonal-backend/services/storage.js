import { supabase } from '../middleware/auth.js';

const BUCKET = 'meeting-recordings';

export async function uploadRecording(meetingId, buffer, filename, contentType) {
  const path = `${meetingId}/${filename}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, buffer, {
      contentType,
      upsert: true,
    });

  if (error) {
    console.error('[storage] Upload error:', error.message);
    throw error;
  }

  const { data: { publicUrl } } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(path);

  return { path, url: publicUrl };
}

export async function deleteRecording(meetingId) {
  const { data: files } = await supabase.storage
    .from(BUCKET)
    .list(meetingId);

  if (files?.length) {
    const paths = files.map(f => `${meetingId}/${f.name}`);
    await supabase.storage.from(BUCKET).remove(paths);
  }
}

export async function downloadFromUrl(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed: ${res.status}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  const contentType = res.headers.get('content-type') || 'video/mp4';
  return { buffer, contentType };
}
