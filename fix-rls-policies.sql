-- Fix RLS policies for jobs table
-- This script will help resolve the "new row violates row-level security policy" error

-- First, let's check the current RLS policies
-- You can run this in your Supabase SQL editor to see what policies exist:
-- SELECT * FROM pg_policies WHERE tablename = 'jobs';

-- Drop existing policies if they exist (be careful with this in production)
DROP POLICY IF EXISTS "Users can view all jobs" ON jobs;
DROP POLICY IF EXISTS "Users can insert their own jobs" ON jobs;
DROP POLICY IF EXISTS "Users can update their own jobs" ON jobs;
DROP POLICY IF EXISTS "Users can delete their own jobs" ON jobs;

-- Create new, more permissive policies for the jobs table
-- These policies assume you have a 'client_id' column that references the user

-- Policy 1: Allow authenticated users to view all jobs
CREATE POLICY "Allow authenticated users to view jobs" ON jobs
    FOR SELECT
    TO authenticated
    USING (true);

-- Policy 2: Allow authenticated users to insert jobs (for creating new jobs)
CREATE POLICY "Allow authenticated users to insert jobs" ON jobs
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Policy 3: Allow users to update their own jobs
CREATE POLICY "Allow users to update their own jobs" ON jobs
    FOR UPDATE
    TO authenticated
    USING (auth.uid()::text = client_id)
    WITH CHECK (auth.uid()::text = client_id);

-- Policy 4: Allow users to delete their own jobs
CREATE POLICY "Allow users to delete their own jobs" ON jobs
    FOR DELETE
    TO authenticated
    USING (auth.uid()::text = client_id);

-- Alternative: If you want to allow all authenticated users to perform all operations
-- (less secure but simpler for development)
-- CREATE POLICY "Allow all operations for authenticated users" ON jobs
--     FOR ALL
--     TO authenticated
--     USING (true)
--     WITH CHECK (true);

-- Make sure RLS is enabled on the jobs table
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- Optional: If you want to allow anonymous users to view jobs (for public job listings)
-- CREATE POLICY "Allow anonymous users to view jobs" ON jobs
--     FOR SELECT
--     TO anon
--     USING (true);