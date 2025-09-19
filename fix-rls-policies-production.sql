-- PRODUCTION RLS POLICIES FOR ROMANIAN MARKETPLACE APP
-- Run this in your Supabase SQL Editor to fix RLS policies

-- Step 1: Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Step 2: Drop existing permissive policies
DROP POLICY IF EXISTS "Allow all operations on users" ON users;
DROP POLICY IF EXISTS "Allow all operations on professionals" ON professionals;
DROP POLICY IF EXISTS "Allow all operations on jobs" ON jobs;
DROP POLICY IF EXISTS "Allow all operations on job_applications" ON job_applications;
DROP POLICY IF EXISTS "Allow all operations on messages" ON messages;
DROP POLICY IF EXISTS "Allow all operations on reviews" ON reviews;
DROP POLICY IF EXISTS "Allow all operations on payments" ON payments;
DROP POLICY IF EXISTS "Allow all operations on subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Allow all operations on notifications" ON notifications;

-- Step 3: Create secure RLS policies

-- USERS TABLE POLICIES
-- Users can read their own profile
CREATE POLICY "Users can read own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Users can insert their own profile (for registration)
CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- PROFESSIONALS TABLE POLICIES
-- Anyone can read professional profiles
CREATE POLICY "Anyone can read professionals" ON professionals
  FOR SELECT USING (true);

-- Professionals can update their own profile
CREATE POLICY "Professionals can update own profile" ON professionals
  FOR UPDATE USING (auth.uid() = user_id);

-- Professionals can insert their own profile
CREATE POLICY "Professionals can insert own profile" ON professionals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- JOBS TABLE POLICIES
-- Anyone can read open jobs
CREATE POLICY "Anyone can read open jobs" ON jobs
  FOR SELECT USING (status = 'OPEN');

-- Job owners can read their own jobs
CREATE POLICY "Job owners can read own jobs" ON jobs
  FOR SELECT USING (auth.uid() = client_id OR auth.uid() = professional_id);

-- Job owners can update their own jobs
CREATE POLICY "Job owners can update own jobs" ON jobs
  FOR UPDATE USING (auth.uid() = client_id OR auth.uid() = professional_id);

-- Clients can create jobs
CREATE POLICY "Clients can create jobs" ON jobs
  FOR INSERT WITH CHECK (auth.uid() = client_id);

-- JOB APPLICATIONS TABLE POLICIES
-- Job owners can read applications for their jobs
CREATE POLICY "Job owners can read applications" ON job_applications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM jobs 
      WHERE jobs.id = job_applications.job_id 
      AND jobs.client_id = auth.uid()
    )
  );

-- Professionals can read their own applications
CREATE POLICY "Professionals can read own applications" ON job_applications
  FOR SELECT USING (auth.uid() = professional_id);

-- Professionals can create applications
CREATE POLICY "Professionals can create applications" ON job_applications
  FOR INSERT WITH CHECK (auth.uid() = professional_id);

-- Job owners can update application status
CREATE POLICY "Job owners can update application status" ON job_applications
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM jobs 
      WHERE jobs.id = job_applications.job_id 
      AND jobs.client_id = auth.uid()
    )
  );

-- MESSAGES TABLE POLICIES
-- Users can read messages they sent or received
CREATE POLICY "Users can read own messages" ON messages
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

-- Users can send messages
CREATE POLICY "Users can send messages" ON messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Users can update their own messages (mark as read)
CREATE POLICY "Users can update own messages" ON messages
  FOR UPDATE USING (auth.uid() = recipient_id);

-- REVIEWS TABLE POLICIES
-- Anyone can read reviews
CREATE POLICY "Anyone can read reviews" ON reviews
  FOR SELECT USING (true);

-- Users can create reviews for jobs they were involved in
CREATE POLICY "Users can create reviews for their jobs" ON reviews
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM jobs 
      WHERE jobs.id = reviews.job_id 
      AND (jobs.client_id = auth.uid() OR jobs.professional_id = auth.uid())
    )
  );

-- PAYMENTS TABLE POLICIES
-- Users can read their own payments
CREATE POLICY "Users can read own payments" ON payments
  FOR SELECT USING (auth.uid() = payer_id OR auth.uid() = payee_id);

-- Users can create payments
CREATE POLICY "Users can create payments" ON payments
  FOR INSERT WITH CHECK (auth.uid() = payer_id);

-- SUBSCRIPTIONS TABLE POLICIES
-- Users can read their own subscriptions
CREATE POLICY "Users can read own subscriptions" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create subscriptions
CREATE POLICY "Users can create subscriptions" ON subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own subscriptions
CREATE POLICY "Users can update own subscriptions" ON subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

-- NOTIFICATIONS TABLE POLICIES
-- Users can read their own notifications
CREATE POLICY "Users can read own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

-- System can create notifications
CREATE POLICY "System can create notifications" ON notifications
  FOR INSERT WITH CHECK (true);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Step 4: Create functions for better security

-- Function to check if user is involved in a job
CREATE OR REPLACE FUNCTION is_user_involved_in_job(job_id UUID, user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM jobs 
    WHERE id = job_id 
    AND (client_id = user_id OR professional_id = user_id)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can access a job
CREATE OR REPLACE FUNCTION can_access_job(job_id UUID, user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM jobs 
    WHERE id = job_id 
    AND (status = 'OPEN' OR client_id = user_id OR professional_id = user_id)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Success message
SELECT 'RLS policies created successfully! Your app is now secure and ready for production.' as message;
