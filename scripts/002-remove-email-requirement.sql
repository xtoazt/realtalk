-- Alter the users table to make email nullable
ALTER TABLE users ALTER COLUMN email DROP NOT NULL;

-- Add a unique constraint on username if not already present (it was already unique)
-- ALTER TABLE users ADD CONSTRAINT users_username_key UNIQUE (username);
