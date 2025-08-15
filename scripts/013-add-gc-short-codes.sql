-- Add short_code column to group_chats table
ALTER TABLE group_chats 
ADD COLUMN IF NOT EXISTS short_code VARCHAR(8) UNIQUE;

-- Create index for faster short code lookups
CREATE INDEX IF NOT EXISTS idx_group_chats_short_code ON group_chats(short_code);

-- Add join_requests table for pending join requests
CREATE TABLE IF NOT EXISTS group_join_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_chat_id UUID REFERENCES group_chats(id) ON DELETE CASCADE,
  requester_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(group_chat_id, requester_id)
);

-- Create index for join requests
CREATE INDEX IF NOT EXISTS idx_group_join_requests_group_chat_id ON group_join_requests(group_chat_id);
CREATE INDEX IF NOT EXISTS idx_group_join_requests_status ON group_join_requests(status);
