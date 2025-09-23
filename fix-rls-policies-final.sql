-- URGENT: Fix RLS Policies for Romanian Marketplace App
-- This will solve the user registration and profile creation issues

-- Step 1: Drop all existing conflicting policies
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

-- Step 2: Create proper RLS policies for user registration and management

-- Users table policies
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- CRITICAL: Allow user registration (this was missing!)
CREATE POLICY "Allow user registration" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Profiles table policies
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- CRITICAL: Allow profile creation during registration
CREATE POLICY "Allow profile creation during registration" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Professionals table policies
CREATE POLICY "Professionals can view their own profile" ON professionals
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Professionals can update their own profile" ON professionals
    FOR UPDATE USING (auth.uid() = user_id);

-- CRITICAL: Allow professional profile creation
CREATE POLICY "Allow professional profile creation" ON professionals
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Clients table policies
CREATE POLICY "Users can view their own client profile" ON clients
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own client profile" ON clients
    FOR UPDATE USING (auth.uid() = user_id);

-- CRITICAL: Allow client profile creation
CREATE POLICY "Allow client profile creation" ON clients
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Jobs table policies
CREATE POLICY "Anyone can view open jobs" ON jobs
    FOR SELECT USING (status = 'OPEN');

CREATE POLICY "Job owners can view their jobs" ON jobs
    FOR SELECT USING (auth.uid() = client_id);

CREATE POLICY "Job owners can update their jobs" ON jobs
    FOR UPDATE USING (auth.uid() = client_id);

CREATE POLICY "Job owners can insert jobs" ON jobs
    FOR INSERT WITH CHECK (auth.uid() = client_id);

-- Job applications table policies
CREATE POLICY "Users can view applications for their jobs" ON job_applications
    FOR SELECT USING (
        auth.uid() IN (
            SELECT client_id FROM jobs WHERE id = job_id
        )
    );

CREATE POLICY "Professionals can view their applications" ON job_applications
    FOR SELECT USING (auth.uid() = professional_id);

CREATE POLICY "Professionals can insert applications" ON job_applications
    FOR INSERT WITH CHECK (auth.uid() = professional_id);

-- Messages table policies
CREATE POLICY "Users can view messages they sent or received" ON messages
    FOR SELECT USING (
        auth.uid() = sender_id OR auth.uid() = recipient_id
    );

CREATE POLICY "Users can insert messages" ON messages
    FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Payments table policies
CREATE POLICY "Users can view payments they made or received" ON payments
    FOR SELECT USING (
        auth.uid() = client_id OR auth.uid() = professional_id
    );

CREATE POLICY "Users can insert payments" ON payments
    FOR INSERT WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Users can update payments" ON payments
    FOR UPDATE USING (auth.uid() = client_id OR auth.uid() = professional_id);

-- Reviews table policies
CREATE POLICY "Anyone can view reviews" ON reviews
    FOR SELECT USING (true);

CREATE POLICY "Users can insert reviews for their jobs" ON reviews
    FOR INSERT WITH CHECK (
        auth.uid() = author_id AND
        auth.uid() IN (
            SELECT client_id FROM jobs WHERE id = job_id
        )
    );

-- Notifications table policies
CREATE POLICY "Users can view their own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- CRITICAL: Allow system to create notifications
CREATE POLICY "Allow system to create notifications" ON notifications
    FOR INSERT WITH CHECK (true);

-- Subscriptions table policies
CREATE POLICY "Users can view their own subscriptions" ON subscriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions" ON subscriptions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscriptions" ON subscriptions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

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
