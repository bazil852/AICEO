import { createClient } from '@supabase/supabase-js';

// Use service role key for backend — bypasses RLS
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function uploadFile(bucket, filePath, buffer, contentType) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, buffer, {
      contentType,
      upsert: false,
    });

  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path);

  return { path: data.path, url: urlData.publicUrl };
}

export async function saveAnalysis(table, record) {
  const { data, error } = await supabase.from(table).insert(record).select().single();
  if (error) throw error;
  return data;
}

export { supabase };
