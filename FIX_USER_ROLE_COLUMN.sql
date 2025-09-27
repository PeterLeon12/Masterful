-- Fix user role column for TaskRabbit model
-- Run this in your Supabase SQL Editor

-- 1. Add role column to users table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'role') THEN
        ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'CLIENT' CHECK (role IN ('CLIENT', 'PROFESSIONAL', 'ADMIN'));
    END IF;
END
$$;

-- 2. Update existing users to have CLIENT role if they don't have one
UPDATE users SET role = 'CLIENT' WHERE role IS NULL;

-- 3. Verify the column exists
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'role';
