-- Fix RLS policies for user registration
-- This allows the system to insert new users during registration

-- Allow system to insert new users (for registration)
CREATE POLICY "Allow user registration" ON public.users
    FOR INSERT WITH CHECK (true);

-- Allow system to insert profiles during registration
CREATE POLICY "Allow profile creation during registration" ON public.profiles
    FOR INSERT WITH CHECK (true);

-- Allow system to insert professional profiles
CREATE POLICY "Allow professional profile creation" ON public.professionals
    FOR INSERT WITH CHECK (true);

-- Allow system to insert client profiles
CREATE POLICY "Allow client profile creation" ON public.clients
    FOR INSERT WITH CHECK (true);

-- Allow system to insert notifications
CREATE POLICY "Allow system to create notifications" ON public.notifications
    FOR INSERT WITH CHECK (true);
