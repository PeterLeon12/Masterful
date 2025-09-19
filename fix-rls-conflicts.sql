-- FIX RLS POLICY CONFLICTS
-- This removes the conflicting permissive policies and keeps only the secure ones

-- Drop all the conflicting "Allow all operations" policies
DROP POLICY IF EXISTS "Allow all operations on users" ON users;
DROP POLICY IF EXISTS "Allow all operations on profiles" ON profiles;
DROP POLICY IF EXISTS "Allow all operations on professionals" ON professionals;
DROP POLICY IF EXISTS "Allow all operations on clients" ON clients;
DROP POLICY IF EXISTS "Allow all operations on jobs" ON jobs;
DROP POLICY IF EXISTS "Allow all operations on job_applications" ON job_applications;
DROP POLICY IF EXISTS "Allow all operations on reviews" ON reviews;
DROP POLICY IF EXISTS "Allow all operations on messages" ON messages;
DROP POLICY IF EXISTS "Allow all operations on payments" ON payments;
DROP POLICY IF EXISTS "Allow all operations on subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Allow all operations on notifications" ON notifications;

-- Drop the overly permissive registration policies
DROP POLICY IF EXISTS "Allow profile creation during registration" ON profiles;
DROP POLICY IF EXISTS "Allow professional profile creation" ON professionals;
DROP POLICY IF EXISTS "Allow client profile creation" ON clients;
DROP POLICY IF EXISTS "Allow system to create notifications" ON notifications;

-- Keep only the secure, specific policies that are already working
-- These policies will remain:
-- - Users can view their own profile
-- - Users can update their own profile  
-- - Users can insert their own profile
-- - Professionals can view their own profile
-- - Professionals can update their own profile
-- - Professionals can insert their own profile
-- - Anyone can view open jobs
-- - Job owners can view their jobs
-- - Job owners can update their jobs
-- - Job owners can insert jobs
-- - Users can view applications for their jobs
-- - Professionals can view their applications
-- - Professionals can insert applications
-- - Users can view messages they sent or received
-- - Users can insert messages
-- - Users can view payments they made or received
-- - Anyone can view reviews
-- - Users can insert reviews for their jobs
-- - Users can view their own notifications
-- - Users can update their own notifications

-- Add missing policies for clients table
CREATE POLICY "Users can view their own client profile" ON clients
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own client profile" ON clients
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own client profile" ON clients
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Add missing policies for subscriptions
CREATE POLICY "Users can view their own subscriptions" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions" ON subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscriptions" ON subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Add missing policies for payments
CREATE POLICY "Users can insert payments" ON payments
  FOR INSERT WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Users can update payments" ON payments
  FOR UPDATE USING (auth.uid() = client_id OR auth.uid() = professional_id);

-- Success message
SELECT 'RLS policy conflicts fixed! Removed permissive policies, kept secure ones.' as message;
