-- Add parent_message_id to messages table for replies
ALTER TABLE messages
ADD COLUMN parent_message_id UUID REFERENCES messages(id) ON DELETE SET NULL;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_messages_parent_message_id ON messages(parent_message_id);
