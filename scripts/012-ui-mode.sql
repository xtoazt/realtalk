-- Add UI mode to users (lite or pro)
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS ui_mode TEXT NOT NULL DEFAULT 'full';


