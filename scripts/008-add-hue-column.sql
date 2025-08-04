-- Add hue column to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS hue VARCHAR(20) DEFAULT 'blue';

-- Update existing users to have default hue
UPDATE users SET hue = 'blue' WHERE hue IS NULL;
