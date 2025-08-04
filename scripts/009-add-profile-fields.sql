-- Add profile picture and bio columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS profile_picture TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT;

-- Ensure theme and hue columns exist with defaults
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS theme VARCHAR(10) DEFAULT 'light',
ADD COLUMN IF NOT EXISTS hue VARCHAR(20) DEFAULT 'blue';

-- Update existing users to have default theme and hue if null
UPDATE users 
SET theme = 'light' 
WHERE theme IS NULL;

UPDATE users 
SET hue = 'blue' 
WHERE hue IS NULL;
