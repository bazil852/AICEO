-- PurelyPersonal Meeting Intelligence Tables
-- Run this migration in Supabase SQL Editor

-- 1. meetings — Core meeting records
CREATE TABLE IF NOT EXISTS meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recall_bot_id UUID,
  recall_bot_status TEXT DEFAULT 'pending',
  title TEXT,
  meeting_url TEXT,
  platform TEXT, -- zoom, google_meet, microsoft_teams
  scheduled_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  bot_name TEXT DEFAULT 'PurelyPersonal Notetaker',
  participants JSONB DEFAULT '[]'::jsonb,
  video_url TEXT,
  audio_url TEXT,
  storage_path TEXT,
  transcript_text TEXT, -- full concatenated transcript for FTS
  summary JSONB,
  action_items JSONB DEFAULT '[]'::jsonb,
  chapters JSONB DEFAULT '[]'::jsonb,
  summary_template TEXT DEFAULT 'general',
  share_token TEXT,
  is_shared BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_meetings_user_created ON meetings (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_meetings_recall_bot ON meetings (recall_bot_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_meetings_share_token ON meetings (share_token) WHERE share_token IS NOT NULL;

-- Full-text search index on transcript
CREATE INDEX IF NOT EXISTS idx_meetings_transcript_fts ON meetings USING GIN (to_tsvector('english', COALESCE(transcript_text, '') || ' ' || COALESCE(title, '')));

-- 2. transcript_segments — Word-level segments for synced playback
CREATE TABLE IF NOT EXISTS transcript_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  speaker_name TEXT,
  speaker_id TEXT,
  text TEXT NOT NULL,
  start_time FLOAT,
  end_time FLOAT,
  words JSONB,
  is_partial BOOLEAN DEFAULT false,
  sequence_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_segments_meeting_seq ON transcript_segments (meeting_id, sequence_index);

-- 3. calendar_connections — OAuth calendar connections
CREATE TABLE IF NOT EXISTS calendar_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('google', 'outlook')),
  recall_calendar_id TEXT,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  calendar_email TEXT,
  is_active BOOLEAN DEFAULT true,
  auto_join BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cal_user ON calendar_connections (user_id);

-- 4. meeting_templates — AI summary templates
CREATE TABLE IF NOT EXISTS meeting_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- NULL = system template
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  prompt_instructions TEXT NOT NULL,
  output_fields JSONB DEFAULT '[]'::jsonb,
  is_system BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_templates_slug ON meeting_templates (slug) WHERE is_system = true;

-- Seed 5 system templates
INSERT INTO meeting_templates (name, slug, prompt_instructions, output_fields, is_system) VALUES
(
  'General Meeting',
  'general',
  'Analyze this meeting transcript and provide a comprehensive summary. Include: an overview paragraph, key topics discussed, important decisions made, and next steps agreed upon.',
  '["overview", "key_topics", "decisions", "next_steps"]'::jsonb,
  true
),
(
  'Sales Call (BANT)',
  'bant-sales',
  'Analyze this sales call transcript using the BANT framework. Extract: Budget (what budget was discussed or implied), Authority (who are the decision makers), Need (what pain points or needs were identified), and Timeline (any deadlines or timeline mentioned). Also note objections raised and how they were handled.',
  '["budget", "authority", "need", "timeline", "objections", "next_steps"]'::jsonb,
  true
),
(
  'Team Standup',
  'team-standup',
  'Analyze this team standup meeting. For each participant, extract: what they completed since last standup, what they plan to work on next, and any blockers or issues raised. Also note any team-wide announcements or decisions.',
  '["per_person_updates", "blockers", "announcements", "action_items"]'::jsonb,
  true
),
(
  'Interview',
  'interview',
  'Analyze this interview transcript. Assess the candidate based on: technical skills demonstrated, communication ability, cultural fit indicators, strengths observed, areas of concern, and provide an overall recommendation.',
  '["technical_assessment", "communication", "strengths", "concerns", "recommendation"]'::jsonb,
  true
),
(
  'Client Call',
  'client-call',
  'Analyze this client call transcript. Extract: requirements discussed, commitments made by either party, open questions or concerns, timeline agreements, and follow-up items with assigned owners.',
  '["requirements", "commitments", "open_questions", "timeline", "follow_ups"]'::jsonb,
  true
)
ON CONFLICT DO NOTHING;

-- 5. meeting_contacts — Junction table: meetings <-> CRM contacts
CREATE TABLE IF NOT EXISTS meeting_contacts (
  meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL,
  role TEXT DEFAULT 'participant' CHECK (role IN ('host', 'participant')),
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (meeting_id, contact_id)
);

-- ═══════════════════════════════════════
-- Row Level Security Policies
-- ═══════════════════════════════════════

ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE transcript_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_contacts ENABLE ROW LEVEL SECURITY;

-- meetings: users see own data + shared meetings publicly readable
CREATE POLICY meetings_select ON meetings FOR SELECT USING (
  auth.uid() = user_id OR is_shared = true
);
CREATE POLICY meetings_insert ON meetings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY meetings_update ON meetings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY meetings_delete ON meetings FOR DELETE USING (auth.uid() = user_id);

-- transcript_segments: users see segments for own meetings or shared meetings
CREATE POLICY segments_select ON transcript_segments FOR SELECT USING (
  EXISTS (SELECT 1 FROM meetings WHERE meetings.id = meeting_id AND (meetings.user_id = auth.uid() OR meetings.is_shared = true))
);
CREATE POLICY segments_insert ON transcript_segments FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM meetings WHERE meetings.id = meeting_id AND meetings.user_id = auth.uid())
);

-- calendar_connections: users see own connections
CREATE POLICY cal_select ON calendar_connections FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY cal_insert ON calendar_connections FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY cal_update ON calendar_connections FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY cal_delete ON calendar_connections FOR DELETE USING (auth.uid() = user_id);

-- meeting_templates: users see system templates + own custom templates
CREATE POLICY templates_select ON meeting_templates FOR SELECT USING (
  is_system = true OR user_id = auth.uid()
);
CREATE POLICY templates_insert ON meeting_templates FOR INSERT WITH CHECK (auth.uid() = user_id AND is_system = false);
CREATE POLICY templates_update ON meeting_templates FOR UPDATE USING (auth.uid() = user_id AND is_system = false);
CREATE POLICY templates_delete ON meeting_templates FOR DELETE USING (auth.uid() = user_id AND is_system = false);

-- meeting_contacts: users see contacts for own meetings
CREATE POLICY mc_select ON meeting_contacts FOR SELECT USING (
  EXISTS (SELECT 1 FROM meetings WHERE meetings.id = meeting_id AND meetings.user_id = auth.uid())
);
CREATE POLICY mc_insert ON meeting_contacts FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM meetings WHERE meetings.id = meeting_id AND meetings.user_id = auth.uid())
);

-- Allow service role full access (backend uses service role key)
-- Service role bypasses RLS by default in Supabase
