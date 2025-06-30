-- Create the AI user if it doesn't exist
INSERT INTO users (id, username, email, password_hash, signup_code, name_color, custom_title, has_gold_animation, notifications_enabled, theme, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-00000000000a',
  'real.AI',
  NULL,
  'no-password-needed',
  NULL,
  '#3b82f6',
  'AI Assistant',
  FALSE,
  FALSE,
  'monochrome',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;
