-- Add GoHighLevel bi-directional sync columns to contacts table
-- Run this in Supabase SQL editor

ALTER TABLE contacts ADD COLUMN IF NOT EXISTS ghl_contact_id text;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS ghl_sync_status text DEFAULT 'none';
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS ghl_synced_at timestamptz;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS ghl_sync_error text;

-- Index for efficient lookups during inbound sync
CREATE INDEX IF NOT EXISTS idx_contacts_ghl_contact_id ON contacts (user_id, ghl_contact_id) WHERE ghl_contact_id IS NOT NULL;
