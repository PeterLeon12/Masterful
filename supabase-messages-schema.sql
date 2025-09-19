-- Messages table for real-time chat
CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  content TEXT NOT NULL,
  sender_id TEXT NOT NULL,
  recipient_id TEXT NOT NULL,
  job_id TEXT NOT NULL,
  message_type TEXT DEFAULT 'TEXT' CHECK (message_type IN ('TEXT', 'IMAGE', 'FILE', 'LOCATION')),
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_messages_job_id ON messages(job_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- Enable Row Level Security
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create policies for messages
CREATE POLICY "Users can view messages for their jobs" ON messages
  FOR SELECT USING (
    sender_id = auth.uid()::text OR 
    recipient_id = auth.uid()::text OR
    job_id IN (
      SELECT id FROM jobs 
      WHERE client_id = auth.uid()::text OR professional_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can insert messages for their jobs" ON messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid()::text AND
    job_id IN (
      SELECT id FROM jobs 
      WHERE client_id = auth.uid()::text OR professional_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can update their own messages" ON messages
  FOR UPDATE USING (sender_id = auth.uid()::text);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_messages_updated_at 
  BEFORE UPDATE ON messages 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT ALL ON messages TO authenticated;
GRANT ALL ON messages TO anon;
