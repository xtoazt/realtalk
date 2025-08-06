-- Add profile fields to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS profile_picture TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_users_profile_picture ON users(profile_picture) WHERE profile_picture IS NOT NULL;
