-- Channels feature
CREATE TABLE IF NOT EXISTS channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) UNIQUE NOT NULL,
  creator_id UUID REFERENCES users(id) ON DELETE SET NULL,
  is_system BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Seed default channels if not exists
INSERT INTO channels (name, is_system)
VALUES ('School', TRUE)
ON CONFLICT (name) DO NOTHING;

INSERT INTO channels (name, is_system)
VALUES ('Unblocked', TRUE)
ON CONFLICT (name) DO NOTHING;

INSERT INTO channels (name, is_system)
VALUES ('Random', TRUE)
ON CONFLICT (name) DO NOTHING;

-- Index for ordering
CREATE INDEX IF NOT EXISTS idx_channels_created_at ON channels(created_at DESC);

