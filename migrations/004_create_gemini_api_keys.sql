-- Create gemini_api_keys table
CREATE TABLE IF NOT EXISTS gemini_api_keys (
    id SERIAL PRIMARY KEY,
    key_hash VARCHAR(255) NOT NULL UNIQUE,
    key_encrypted TEXT NOT NULL,
    added_by VARCHAR(100) NOT NULL,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    exhausted_at TIMESTAMP WITH TIME ZONE,
    last_used_at TIMESTAMP WITH TIME ZONE,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for active keys
CREATE INDEX IF NOT EXISTS idx_gemini_api_keys_active ON gemini_api_keys(is_active);

-- Create index for added_by
CREATE INDEX IF NOT EXISTS idx_gemini_api_keys_added_by ON gemini_api_keys(added_by);

-- Create index for added_at
CREATE INDEX IF NOT EXISTS idx_gemini_api_keys_added_at ON gemini_api_keys(added_at);

-- Add comments
COMMENT ON TABLE gemini_api_keys IS 'Stores encrypted Gemini API keys for AI features';
COMMENT ON COLUMN gemini_api_keys.key_hash IS 'Hash of the API key for uniqueness checking';
COMMENT ON COLUMN gemini_api_keys.key_encrypted IS 'Encrypted API key for security';
COMMENT ON COLUMN gemini_api_keys.added_by IS 'Username of the gold member who added the key';
COMMENT ON COLUMN gemini_api_keys.is_active IS 'Whether the key is currently active and not exhausted';
COMMENT ON COLUMN gemini_api_keys.exhausted_at IS 'Timestamp when the key was marked as exhausted';
COMMENT ON COLUMN gemini_api_keys.last_used_at IS 'Last time the key was used';
COMMENT ON COLUMN gemini_api_keys.usage_count IS 'Number of times the key has been used';
