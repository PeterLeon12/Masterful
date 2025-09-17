-- Disable email verification for development
-- This prevents Supabase from sending verification emails

-- Update Supabase settings to disable email verification
-- Go to Authentication > Settings in your Supabase dashboard
-- Turn OFF "Enable email confirmations"

-- Or run this SQL to check current settings:
SELECT * FROM auth.config;
