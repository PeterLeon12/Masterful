-- SAFE RLS Policy Fix - Handles existing policies
-- This version won't fail if policies already exist

-- Step 1: Drop all existing conflicting policies (safe)
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

-- Drop overly permissive registration policies
DROP POLICY IF EXISTS "Allow profile creation during registration" ON profiles;
DROP POLICY IF EXISTS "Allow professional profile creation" ON professionals;
DROP POLICY IF EXISTS "Allow client profile creation" ON clients;
DROP POLICY IF EXISTS "Allow system to create notifications" ON notifications;
DROP POLICY IF EXISTS "Allow user registration" ON users;

-- Step 2: Create policies only if they don't exist (safe approach)

-- Users table policies
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Users can view their own profile') THEN
        CREATE POLICY "Users can view their own profile" ON users
            FOR SELECT USING (auth.uid() = id);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Users can update their own profile') THEN
        CREATE POLICY "Users can update their own profile" ON users
            FOR UPDATE USING (auth.uid() = id);
    END IF;
END $$;

-- CRITICAL: Allow user registration (this was missing!)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Allow user registration') THEN
        CREATE POLICY "Allow user registration" ON users
            FOR INSERT WITH CHECK (auth.uid() = id);
    END IF;
END $$;

-- Profiles table policies
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can view their own profile') THEN
        CREATE POLICY "Users can view their own profile" ON profiles
            FOR SELECT USING (auth.uid() = user_id);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can update their own profile') THEN
        CREATE POLICY "Users can update their own profile" ON profiles
            FOR UPDATE USING (auth.uid() = user_id);
    END IF;
END $$;

-- CRITICAL: Allow profile creation during registration
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Allow profile creation during registration') THEN
        CREATE POLICY "Allow profile creation during registration" ON profiles
            FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- Professionals table policies
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'professionals' AND policyname = 'Professionals can view their own profile') THEN
        CREATE POLICY "Professionals can view their own profile" ON professionals
            FOR SELECT USING (auth.uid() = user_id);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'professionals' AND policyname = 'Professionals can update their own profile') THEN
        CREATE POLICY "Professionals can update their own profile" ON professionals
            FOR UPDATE USING (auth.uid() = user_id);
    END IF;
END $$;

-- CRITICAL: Allow professional profile creation
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'professionals' AND policyname = 'Allow professional profile creation') THEN
        CREATE POLICY "Allow professional profile creation" ON professionals
            FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- Clients table policies
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'clients' AND policyname = 'Users can view their own client profile') THEN
        CREATE POLICY "Users can view their own client profile" ON clients
            FOR SELECT USING (auth.uid() = user_id);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'clients' AND policyname = 'Users can update their own client profile') THEN
        CREATE POLICY "Users can update their own client profile" ON clients
            FOR UPDATE USING (auth.uid() = user_id);
    END IF;
END $$;

-- CRITICAL: Allow client profile creation
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'clients' AND policyname = 'Allow client profile creation') THEN
        CREATE POLICY "Allow client profile creation" ON clients
            FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- Jobs table policies
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'jobs' AND policyname = 'Anyone can view open jobs') THEN
        CREATE POLICY "Anyone can view open jobs" ON jobs
            FOR SELECT USING (status = 'OPEN');
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'jobs' AND policyname = 'Job owners can view their jobs') THEN
        CREATE POLICY "Job owners can view their jobs" ON jobs
            FOR SELECT USING (auth.uid() = client_id);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'jobs' AND policyname = 'Job owners can update their jobs') THEN
        CREATE POLICY "Job owners can update their jobs" ON jobs
            FOR UPDATE USING (auth.uid() = client_id);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'jobs' AND policyname = 'Job owners can insert jobs') THEN
        CREATE POLICY "Job owners can insert jobs" ON jobs
            FOR INSERT WITH CHECK (auth.uid() = client_id);
    END IF;
END $$;

-- Job applications table policies
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'job_applications' AND policyname = 'Users can view applications for their jobs') THEN
        CREATE POLICY "Users can view applications for their jobs" ON job_applications
            FOR SELECT USING (
                auth.uid() IN (
                    SELECT client_id FROM jobs WHERE id = job_id
                )
            );
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'job_applications' AND policyname = 'Professionals can view their applications') THEN
        CREATE POLICY "Professionals can view their applications" ON job_applications
            FOR SELECT USING (auth.uid() = professional_id);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'job_applications' AND policyname = 'Professionals can insert applications') THEN
        CREATE POLICY "Professionals can insert applications" ON job_applications
            FOR INSERT WITH CHECK (auth.uid() = professional_id);
    END IF;
END $$;

-- Messages table policies
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'messages' AND policyname = 'Users can view messages they sent or received') THEN
        CREATE POLICY "Users can view messages they sent or received" ON messages
            FOR SELECT USING (
                auth.uid() = sender_id OR auth.uid() = recipient_id
            );
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'messages' AND policyname = 'Users can insert messages') THEN
        CREATE POLICY "Users can insert messages" ON messages
            FOR INSERT WITH CHECK (auth.uid() = sender_id);
    END IF;
END $$;

-- Payments table policies
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'payments' AND policyname = 'Users can view payments they made or received') THEN
        CREATE POLICY "Users can view payments they made or received" ON payments
            FOR SELECT USING (
                auth.uid() = client_id OR auth.uid() = professional_id
            );
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'payments' AND policyname = 'Users can insert payments') THEN
        CREATE POLICY "Users can insert payments" ON payments
            FOR INSERT WITH CHECK (auth.uid() = client_id);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'payments' AND policyname = 'Users can update payments') THEN
        CREATE POLICY "Users can update payments" ON payments
            FOR UPDATE USING (auth.uid() = client_id OR auth.uid() = professional_id);
    END IF;
END $$;

-- Reviews table policies
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'reviews' AND policyname = 'Anyone can view reviews') THEN
        CREATE POLICY "Anyone can view reviews" ON reviews
            FOR SELECT USING (true);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'reviews' AND policyname = 'Users can insert reviews for their jobs') THEN
        CREATE POLICY "Users can insert reviews for their jobs" ON reviews
            FOR INSERT WITH CHECK (
                auth.uid() = author_id AND
                auth.uid() IN (
                    SELECT client_id FROM jobs WHERE id = job_id
                )
            );
    END IF;
END $$;

-- Notifications table policies
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'Users can view their own notifications') THEN
        CREATE POLICY "Users can view their own notifications" ON notifications
            FOR SELECT USING (auth.uid() = user_id);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'Users can update their own notifications') THEN
        CREATE POLICY "Users can update their own notifications" ON notifications
            FOR UPDATE USING (auth.uid() = user_id);
    END IF;
END $$;

-- CRITICAL: Allow system to create notifications
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'Allow system to create notifications') THEN
        CREATE POLICY "Allow system to create notifications" ON notifications
            FOR INSERT WITH CHECK (true);
    END IF;
END $$;

-- Subscriptions table policies
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'subscriptions' AND policyname = 'Users can view their own subscriptions') THEN
        CREATE POLICY "Users can view their own subscriptions" ON subscriptions
            FOR SELECT USING (auth.uid() = user_id);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'subscriptions' AND policyname = 'Users can update their own subscriptions') THEN
        CREATE POLICY "Users can update their own subscriptions" ON subscriptions
            FOR UPDATE USING (auth.uid() = user_id);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'subscriptions' AND policyname = 'Users can insert their own subscriptions') THEN
        CREATE POLICY "Users can insert their own subscriptions" ON subscriptions
            FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- Step 3: Create a function to handle user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert into public.users table
    INSERT INTO public.users (id, email, name, role, created_at, updated_at)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
        COALESCE(NEW.raw_user_meta_data->>'role', 'CLIENT'),
        NOW(),
        NOW()
    );
    
    -- Create profile
    INSERT INTO public.profiles (user_id, created_at, updated_at)
    VALUES (NEW.id, NOW(), NOW());
    
    -- Create role-specific profile based on role
    IF COALESCE(NEW.raw_user_meta_data->>'role', 'CLIENT') = 'PROFESSIONAL' THEN
        INSERT INTO public.professionals (user_id, created_at, updated_at)
        VALUES (NEW.id, NOW(), NOW());
    ELSE
        INSERT INTO public.clients (user_id, created_at, updated_at)
        VALUES (NEW.id, NOW(), NOW());
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 4: Create trigger for automatic user setup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 5: Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Success message
SELECT 'RLS policies fixed successfully! User registration should now work.' as message;
