-- Create messages table for real-time chat
CREATE TABLE IF NOT EXISTS public.messages (
  id TEXT PRIMARY KEY,
  content TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_id TEXT,
  room_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_messages_room_name ON public.messages(room_name);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at);

-- Enable Row Level Security
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for messages
CREATE POLICY "Allow read access to messages in same room" ON public.messages
  FOR SELECT USING (true);

CREATE POLICY "Allow insert for authenticated users" ON public.messages
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Allow update for own messages" ON public.messages
  FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Allow delete for own messages" ON public.messages
  FOR DELETE USING (auth.uid()::text = user_id);

-- Grant necessary permissions
GRANT ALL ON public.messages TO authenticated;
GRANT ALL ON public.messages TO anon;
