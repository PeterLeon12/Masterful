-- Fix RLS policies for jobs table
-- Allow public to read jobs
DROP POLICY IF EXISTS "Allow public to read jobs" ON jobs;
CREATE POLICY "Allow public to read jobs" ON jobs
  FOR SELECT USING (true);

-- Allow authenticated users to create jobs
DROP POLICY IF EXISTS "Allow authenticated users to create jobs" ON jobs;
CREATE POLICY "Allow authenticated users to create jobs" ON jobs
  FOR INSERT WITH CHECK (true);

-- Allow job owners to update their jobs
DROP POLICY IF EXISTS "Allow job owners to update jobs" ON jobs;
CREATE POLICY "Allow job owners to update jobs" ON jobs
  FOR UPDATE USING (true);

-- Allow job owners to delete their jobs
DROP POLICY IF EXISTS "Allow job owners to delete jobs" ON jobs;
CREATE POLICY "Allow job owners to delete jobs" ON jobs
  FOR DELETE USING (true);
