-- COMPREHENSIVE DATABASE FIX FOR CHAT SYSTEM
-- This script will fix all database issues causing chat problems

-- 1. First, let's check what tables exist and fix relationships
-- Drop existing problematic tables if they exist
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS job_applications CASCADE;

-- 2. Create job_applications table with correct structure
CREATE TABLE job_applications (
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

-- 3. Create messages table with correct structure
CREATE TABLE messages (
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

-- 4. Create indexes for better performance
CREATE INDEX idx_job_applications_job_id ON job_applications(job_id);
CREATE INDEX idx_job_applications_professional_id ON job_applications(professional_id);
CREATE INDEX idx_job_applications_status ON job_applications(status);

CREATE INDEX idx_messages_job_id ON messages(job_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_recipient_id ON messages(recipient_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);

-- 5. Disable RLS for development (as requested)
ALTER TABLE jobs DISABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;

-- 6. Create function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Create triggers for updated_at
CREATE TRIGGER update_job_applications_updated_at
  BEFORE UPDATE ON job_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at
  BEFORE UPDATE ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 8. Insert some test data to verify relationships work
-- (This will be done by the application, not here)

-- 9. Verify the structure
SELECT 
  table_name, 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name IN ('job_applications', 'messages', 'jobs', 'users')
ORDER BY table_name, ordinal_position;
