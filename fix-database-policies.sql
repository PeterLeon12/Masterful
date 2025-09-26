-- Fix database structure for job applications and chat system
-- This script will create the necessary tables and connections

-- 1. Create job_applications table if it doesn't exist
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

-- 2. Create messages table if it doesn't exist
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

-- 3. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_job_applications_job_id ON job_applications(job_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_professional_id ON job_applications(professional_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_status ON job_applications(status);

CREATE INDEX IF NOT EXISTS idx_messages_job_id ON messages(job_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- 4. Disable RLS temporarily for development (as requested)
ALTER TABLE jobs DISABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;

-- 5. Create function to automatically create chat when application is accepted
CREATE OR REPLACE FUNCTION create_chat_on_application_accept()
RETURNS TRIGGER AS $$
BEGIN
  -- When an application is accepted, we don't need to do anything special
  -- The chat will be created when the first message is sent
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Create trigger for application status changes
CREATE TRIGGER trigger_application_accepted
  AFTER UPDATE ON job_applications
  FOR EACH ROW
  WHEN (OLD.status = 'PENDING' AND NEW.status = 'ACCEPTED')
  EXECUTE FUNCTION create_chat_on_application_accept();

-- 7. Add updated_at trigger for job_applications
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_job_applications_updated_at
  BEFORE UPDATE ON job_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at
  BEFORE UPDATE ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
