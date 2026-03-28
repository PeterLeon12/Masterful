-- TEMPORARY: Disable RLS for development
-- WARNING: This makes your database less secure - only use for development!

-- Disable RLS on jobs table temporarily
ALTER TABLE jobs DISABLE ROW LEVEL SECURITY;

-- If you want to re-enable RLS later with proper policies, run:
-- ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
-- Then apply the policies from fix-rls-policies.sql
