-- Add freeze-related columns to users
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS is_frozen BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS frozen_by UUID REFERENCES users(id),
  ADD COLUMN IF NOT EXISTS freeze_message TEXT,
  ADD COLUMN IF NOT EXISTS freeze_popup_message TEXT,
  ADD COLUMN IF NOT EXISTS freeze_updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();


