-- TASKRABBIT MODEL DATABASE SCHEMA
-- This script implements the TaskRabbit model with role-based filtering and messaging restrictions
-- Run this in your Supabase SQL Editor

-- 1. ENSURE USERS TABLE HAS ROLE COLUMN
-- Add role column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'role') THEN
        ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'CLIENT' CHECK (role IN ('CLIENT', 'PROFESSIONAL', 'ADMIN'));
    END IF;
END
$$;

-- 2. CREATE PROFESSIONALS TABLE (if not exists)
-- This table stores professional-specific information
CREATE TABLE IF NOT EXISTS professionals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  hourly_rate DECIMAL(10, 2),
  rating DECIMAL(2, 1) DEFAULT 0.0,
  review_count INTEGER DEFAULT 0,
  bio TEXT,
  categories TEXT[], -- e.g., ['plumbing', 'electrical']
  service_areas TEXT[], -- e.g., ['Bucuresti', 'Cluj']
  is_available BOOLEAN DEFAULT TRUE,
  experience_years INTEGER DEFAULT 0,
  portfolio_urls TEXT[],
  certifications TEXT[],
  insurance_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. CREATE CLIENTS TABLE (if not exists)
-- This table stores client-specific information
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  preferred_payment_method TEXT,
  billing_address JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. UPDATE JOBS TABLE FOR TASKRABBIT MODEL
-- Add assigned_professional_id column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'assigned_professional_id') THEN
        ALTER TABLE jobs ADD COLUMN assigned_professional_id UUID REFERENCES users(id) ON DELETE SET NULL;
    END IF;
END
$$;

-- 5. ENSURE JOB_APPLICATIONS TABLE EXISTS
CREATE TABLE IF NOT EXISTS job_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  cover_letter TEXT,
  proposed_rate DECIMAL(10,2),
  estimated_duration TEXT,
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(job_id, professional_id)
);

-- 6. ENSURE MESSAGES TABLE EXISTS
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'TEXT' CHECK (message_type IN ('TEXT', 'IMAGE', 'FILE', 'LOCATION')),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. CREATE INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_professionals_user_id ON professionals(user_id);
CREATE INDEX IF NOT EXISTS idx_professionals_categories ON professionals USING GIN (categories);
CREATE INDEX IF NOT EXISTS idx_professionals_service_areas ON professionals USING GIN (service_areas);
CREATE INDEX IF NOT EXISTS idx_professionals_availability ON professionals(is_available);

CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);

CREATE INDEX IF NOT EXISTS idx_jobs_assigned_professional_id ON jobs(assigned_professional_id);
CREATE INDEX IF NOT EXISTS idx_jobs_client_id ON jobs(client_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);

CREATE INDEX IF NOT EXISTS idx_job_applications_job_id ON job_applications(job_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_professional_id ON job_applications(professional_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_status ON job_applications(status);

CREATE INDEX IF NOT EXISTS idx_messages_job_id ON messages(job_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- 8. CREATE UPDATED_AT TRIGGERS
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DO $$
BEGIN
    -- Professionals table
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_professionals_updated_at') THEN
        CREATE TRIGGER update_professionals_updated_at
          BEFORE UPDATE ON professionals
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
    END IF;

    -- Clients table
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_clients_updated_at') THEN
        CREATE TRIGGER update_clients_updated_at
          BEFORE UPDATE ON clients
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
    END IF;

    -- Job applications table
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_job_applications_updated_at') THEN
        CREATE TRIGGER update_job_applications_updated_at
          BEFORE UPDATE ON job_applications
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
    END IF;

    -- Messages table
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_messages_updated_at') THEN
        CREATE TRIGGER update_messages_updated_at
          BEFORE UPDATE ON messages
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
    END IF;
END
$$;

-- 9. DISABLE RLS FOR DEVELOPMENT (as requested)
ALTER TABLE jobs DISABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE professionals DISABLE ROW LEVEL SECURITY;
ALTER TABLE clients DISABLE ROW LEVEL SECURITY;

-- 10. VERIFY SCHEMA
SELECT 
  table_name, 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name IN ('users', 'jobs', 'job_applications', 'messages', 'professionals', 'clients')
ORDER BY table_name, ordinal_position;

-- 11. TEST RELATIONSHIPS
SELECT 
  tc.table_name, 
  kcu.column_name, 
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name 
FROM 
  information_schema.table_constraints AS tc 
  JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
  JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name IN ('job_applications', 'messages', 'professionals', 'clients')
ORDER BY tc.table_name, kcu.column_name;
