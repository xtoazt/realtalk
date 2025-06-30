-- Add last_active column to users table for online status
ALTER TABLE users 
ADD COLUMN last_active TIMESTAMP DEFAULT NOW();

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_users_last_active ON users(last_active);

-- Update existing users to have recent activity
UPDATE users SET last_active = NOW();
